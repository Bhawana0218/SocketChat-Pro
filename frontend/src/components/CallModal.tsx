import { useEffect, useRef, useState, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { getSocket } from "@/services/socket";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const TAG = "[CallModal]";

export const CallModal = () => {
  const callInfo = useChatStore((s) => s.callInfo);
  const setCallInfo = useChatStore((s) => s.setCallInfo);
  const currentUser = useChatStore((s) => s.currentUser);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef("");
  const callTypeRef = useRef<"voice" | "video">("voice");
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);
  const hasSentOffer = useRef(false);
  const hasSentAnswer = useRef(false);
  const isAccepting = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const log = useCallback((...args: unknown[]) => {
    console.log(TAG, new Date().toISOString(), ...args);
  }, []);

  const attachRemoteStream = useCallback(
    (stream: MediaStream) => {
      log("[Media] Attaching remote stream to elements");

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
        remoteVideoRef.current.play().catch((e) =>
          console.error(TAG, "[Media] remoteVideo play() failed:", e)
        );
        log("[Media] Remote stream attached to video element");
      }

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        remoteAudioRef.current.play().catch((e) =>
          console.error(TAG, "[Media] remoteAudio play() failed:", e)
        );
        log("[Media] Remote stream attached to audio element");
      }
    },
    [log]
  );

  const cleanup = useCallback(() => {
    log("Cleaning up call resources");
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    iceCandidateQueue.current = [];
    hasSentOffer.current = false;
    hasSentAnswer.current = false;
    isAccepting.current = false;
    setDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  }, [log]);

  const finish = useCallback(() => {
    const peer = peerRef.current;
    cleanup();
    if (peer) {
      log(`[User] Ending call with ${peer}`);
      getSocket().emit("call_end", { to: peer });
    }
    setCallInfo({ state: "idle", peer: "", callType: "voice" });
  }, [cleanup, log, setCallInfo]);

  const getMedia = useCallback(
    async (video: boolean): Promise<MediaStream | null> => {
      try {
        log(`[Media] Requesting ${video ? "video+audio" : "audio-only"} stream`);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video,
        });
        log(
          "[Media] Got tracks:",
          stream.getTracks().map((t) => `${t.kind}:${t.enabled}:${t.label}`).join(", ")
        );
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch((e) =>
            console.error(TAG, "[Media] localVideo play() failed:", e)
          );
        }
        return stream;
      } catch (e) {
        console.error(TAG, "[Media] Failed to get user media:", e);
        return null;
      }
    },
    [log]
  );

  const createPeerConnection = useCallback((): RTCPeerConnection => {
    if (pcRef.current) {
      log("[PeerConnection] Closing previous connection before creating new one");
      pcRef.current.close();
      pcRef.current = null;
    }

    log("[PeerConnection] Creating new RTCPeerConnection");
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        log("[PeerConnection] ICE candidate generated → sending to", peerRef.current);
        getSocket().emit("call_signal", {
          to: peerRef.current,
          signal: { type: "ice-candidate", candidate: e.candidate.toJSON() },
        });
      }
    };

    pc.ontrack = (e) => {
      log("[PeerConnection] ontrack:", e.track.kind, e.track.label, "streams:", e.streams.length);
      if (e.streams && e.streams[0]) {
        attachRemoteStream(e.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      log(
        `[PeerConnection] state=${pc.connectionState} signaling=${pc.signalingState} ice=${pc.iceConnectionState} gathering=${pc.iceGatheringState}`
      );
      if (pc.connectionState === "connected" && !timerRef.current) {
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      }
      if (pc.connectionState === "failed") {
        log("[PeerConnection] FAILED → ending call");
        finish();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [log, finish, attachRemoteStream]);

  const flushIceQueue = useCallback(
    (pc: RTCPeerConnection) => {
      if (iceCandidateQueue.current.length > 0) {
        log(`[ICE] Flushing ${iceCandidateQueue.current.length} queued candidates`);
        for (const c of iceCandidateQueue.current) {
          pc.addIceCandidate(new RTCIceCandidate(c)).catch((e) =>
            console.error(TAG, "[ICE] Failed to add queued candidate:", e)
          );
        }
        iceCandidateQueue.current = [];
      }
    },
    [log]
  );

  useEffect(() => {
    const socket = getSocket();
    log("[Socket] Registering call listeners");

    socket.on("call_invite", (data) => {
      log(`[Receiver] ← call_invite from ${data.from} (${data.callType})`);
      peerRef.current = data.from;
      callTypeRef.current = data.callType;
      setCallInfo({ state: "ringing", peer: data.from, callType: data.callType });
    });

    socket.on("call_accept", async (data) => {
      log(`[Caller] ← call_accept from ${data.from}`);

      if (hasSentOffer.current) {
        log("[Caller] Already sent offer, ignoring duplicate call_accept");
        return;
      }

      const video = callTypeRef.current === "video";
      const stream = await getMedia(video);
      if (!stream) {
        log("[Caller] Media failed, aborting");
        cleanup();
        setCallInfo({ state: "idle", peer: "", callType: "voice" });
        return;
      }

      const pc = createPeerConnection();

      stream.getTracks().forEach((track) => {
        log(`[Caller] Adding local track: ${track.kind}`);
        pc.addTrack(track, stream);
      });

      try {
        log("[Caller] Creating offer");
        const offer = await pc.createOffer();
        log("[Caller] Offer created, signalingState:", pc.signalingState);

        await pc.setLocalDescription(offer);
        log("[Caller] setLocalDescription done, signalingState:", pc.signalingState);

        socket.emit("call_signal", {
          to: data.from,
          signal: { type: "offer", sdp: offer },
        });
        log("[Caller] → offer emitted to", data.from);

        hasSentOffer.current = true;
        flushIceQueue(pc);
        setCallInfo({ state: "connected", peer: data.from, callType: callTypeRef.current });
      } catch (e) {
        console.error(TAG, "[Caller] Failed to create/send offer:", e);
        cleanup();
        setCallInfo({ state: "idle", peer: "", callType: "voice" });
      }
    });

    socket.on("call_reject", (data) => {
      log(`[Caller] ← call_reject from ${data.from}`);
      cleanup();
      setCallInfo({ state: "idle", peer: "", callType: "voice" });
    });

    socket.on("call_end", (data) => {
      log(`[Peer] ← call_end from ${data.from}`);
      cleanup();
      setCallInfo({ state: "idle", peer: "", callType: "voice" });
    });

    socket.on("call_signal", async (data) => {
      log(`[Signal] ← ${data.signal.type} from ${data.from}`);

      if (data.signal.type === "offer" && data.signal.sdp) {
        let pc = pcRef.current;
        if (!pc) {
          log("[Receiver] No PC exists, creating one");
          pc = createPeerConnection();
        }

        if (pc.getSenders().length === 0) {
          const video = callTypeRef.current === "video";
          const stream = await getMedia(video);
          if (stream) {
            stream.getTracks().forEach((track) => {
              log(`[Receiver] Adding local track: ${track.kind}`);
              pc!.addTrack(track, stream);
            });
          }
        }

        if (pc.signalingState !== "stable") {
          log("[Receiver] Skipping offer — signalingState:", pc.signalingState, "(expected stable)");
          return;
        }

        try {
          log("[Receiver] Setting remote description (offer), signalingState:", pc.signalingState);
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.signal.sdp as RTCSessionDescriptionInit)
          );
          log("[Receiver] setRemoteDescription done, signalingState:", pc.signalingState);

          log("[Receiver] Creating answer");
          const answer = await pc.createAnswer();
          log("[Receiver] Answer created");

          await pc.setLocalDescription(answer);
          log("[Receiver] setLocalDescription done, signalingState:", pc.signalingState);

          socket.emit("call_signal", {
            to: data.from,
            signal: { type: "answer", sdp: answer },
          });
          log("[Receiver] → answer emitted to", data.from);

          hasSentAnswer.current = true;
          flushIceQueue(pc);
          setCallInfo({ state: "connected", peer: data.from, callType: callTypeRef.current });
        } catch (e) {
          console.error(TAG, "[Receiver] Failed to process offer:", e);
        }
      } else if (data.signal.type === "answer" && data.signal.sdp) {
        const pc = pcRef.current;
        if (!pc) {
          log("[Caller] No PC — discarding answer (likely stale)");
          return;
        }

        log("[Caller] Processing answer, signalingState:", pc.signalingState);

        if (pc.signalingState !== "have-local-offer") {
          log(
            "[Caller] IGNORING answer — signalingState:",
            pc.signalingState,
            "(expected have-local-offer)"
          );
          return;
        }

        try {
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.signal.sdp as RTCSessionDescriptionInit)
          );
          log("[Caller] setRemoteDescription done, signalingState:", pc.signalingState);
        } catch (e) {
          console.error(TAG, "[Caller] Failed to set remote description:", e);
        }
      } else if (data.signal.type === "ice-candidate" && data.signal.candidate) {
        const pc = pcRef.current;
        if (pc && pc.signalingState !== "closed") {
          try {
            log("[ICE] Adding remote candidate");
            await pc.addIceCandidate(
              new RTCIceCandidate(data.signal.candidate as RTCIceCandidateInit)
            );
          } catch (e) {
            console.error(TAG, "[ICE] Failed to add candidate:", e);
          }
        } else {
          log("[ICE] Queuing candidate (PC not ready)");
          iceCandidateQueue.current.push(data.signal.candidate as RTCIceCandidateInit);
        }
      }
    });

    return () => {
      log("[Socket] Removing call listeners");
      socket.off("call_invite");
      socket.off("call_accept");
      socket.off("call_reject");
      socket.off("call_end");
      socket.off("call_signal");
    };
  }, [currentUser, setCallInfo, log, getMedia, createPeerConnection, cleanup, flushIceQueue]);

  useEffect(() => cleanup, [cleanup]);

  const acceptCall = async () => {
    if (isAccepting.current) {
      log("[Receiver] Already accepting, ignoring duplicate click");
      return;
    }
    isAccepting.current = true;

    log("[Receiver] Accepting call from", peerRef.current);
    const video = callTypeRef.current === "video";
    const stream = await getMedia(video);
    if (!stream) {
      log("[Receiver] Media failed, rejecting call");
      getSocket().emit("call_reject", { to: peerRef.current });
      cleanup();
      setCallInfo({ state: "idle", peer: "", callType: "voice" });
      return;
    }

    const pc = createPeerConnection();
    stream.getTracks().forEach((track) => {
      log(`[Receiver] Adding local track: ${track.kind}`);
      pc.addTrack(track, stream);
    });

    getSocket().emit("call_accept", { to: peerRef.current });
    log("[Receiver] → call_accept emitted to", peerRef.current);
    setCallInfo({ state: "connected", peer: peerRef.current, callType: callTypeRef.current });
  };

  const rejectCall = () => {
    log("[Receiver] Rejecting call from", peerRef.current);
    getSocket().emit("call_reject", { to: peerRef.current });
    cleanup();
    setCallInfo({ state: "idle", peer: "", callType: "voice" });
  };

  const endCall = () => finish();

  const toggleMute = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getAudioTracks();
      tracks.forEach((t) => (t.enabled = isMuted));
      log(`[Audio] Mute=${!isMuted}, tracks=${tracks.length}`);
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getVideoTracks();
      tracks.forEach((t) => (t.enabled = isVideoOff));
      log(`[Video] Off=${!isVideoOff}, tracks=${tracks.length}`);
    }
    setIsVideoOff(!isVideoOff);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (callInfo.state === "idle") return <div className="hidden" />;

  const isVideo = callInfo.callType === "video";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <audio ref={remoteAudioRef} autoPlay playsInline />
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {isVideo ? (
          <div className="relative w-full aspect-video bg-[#0f172a] rounded-xl overflow-hidden mb-4">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-2 right-2 w-24 h-18 object-cover rounded-lg border border-[#334155]"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
              {callInfo.peer[0].toUpperCase()}
            </div>
            <p className="text-white text-lg font-semibold">{callInfo.peer}</p>
            <p className="text-slate-400 text-sm mt-1">
              {callInfo.state === "calling"
                ? "Calling..."
                : callInfo.state === "ringing"
                ? `Incoming ${callInfo.callType} call...`
                : fmt(duration)}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {callInfo.state === "ringing" && (
            <>
              <button
                onClick={rejectCall}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={acceptCall}
                className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 animate-pulse"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          )}

          {callInfo.state === "calling" && (
            <button
              onClick={endCall}
              className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          )}

          {callInfo.state === "connected" && (
            <>
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isMuted
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              {isVideo && (
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-all duration-200 ${
                    isVideoOff
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                </button>
              )}
              <button
                onClick={endCall}
                className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
