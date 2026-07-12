import { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { getSocket } from "@/services/socket";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const CallModal = () => {
  const callInfo = useChatStore((s) => s.callInfo);
  const setCallInfo = useChatStore((s) => s.setCallInfo);
  const currentUser = useChatStore((s) => s.currentUser);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef("");
  const callTypeRef = useRef<"voice" | "video">("voice");

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = () => {
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const finish = () => {
    const peer = peerRef.current;
    cleanup();
    if (peer && currentUser) {
      getSocket().emit("call_end", { to: peer });
    }
    setCallInfo({ state: "idle", peer: "", callType: "voice" });
  };

  const getMedia = async (video: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video,
      });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (e) {
      console.error("Media error:", e);
      return null;
    }
  };

  const makePC = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        getSocket().emit("call_signal", {
          to: peerRef.current,
          signal: { type: "ice-candidate", candidate: e.candidate.toJSON() },
        });
      }
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected" && !timerRef.current) {
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      }
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        finish();
      }
    };
    pcRef.current = pc;
    return pc;
  };

  // Always-mounted socket listener
  useEffect(() => {
    const socket = getSocket();

    socket.on("call_invite", (data) => {
      peerRef.current = data.from;
      callTypeRef.current = data.callType;
      setCallInfo({ state: "ringing", peer: data.from, callType: data.callType });
    });

    socket.on("call_accept", async (data) => {
      const video = callTypeRef.current === "video";
      const stream = await getMedia(video);
      if (!stream) return;

      const pc = makePC();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("call_signal", { to: data.from, signal: { type: "offer", sdp: offer } });
      setCallInfo({ state: "connected", peer: data.from, callType: callTypeRef.current });
    });

    socket.on("call_reject", () => {
      cleanup();
      setCallInfo({ state: "idle", peer: "", callType: "voice" });
    });

    socket.on("call_end", () => {
      cleanup();
      setCallInfo({ state: "idle", peer: "", callType: "voice" });
    });

    socket.on("call_signal", async (data) => {
      const pc = pcRef.current || makePC();

      if (data.signal.type === "offer" && data.signal.sdp) {
        const video = callTypeRef.current === "video";
        const stream = await getMedia(video);
        if (!stream) return;
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp as RTCSessionDescriptionInit));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call_signal", { to: data.from, signal: { type: "answer", sdp: answer } });
        setCallInfo({ state: "connected", peer: data.from, callType: callTypeRef.current });
      } else if (data.signal.type === "answer" && data.signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp as RTCSessionDescriptionInit));
      } else if (data.signal.type === "ice-candidate" && data.signal.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate as RTCIceCandidateInit));
      }
    });

    return () => {
      socket.off("call_invite");
      socket.off("call_accept");
      socket.off("call_reject");
      socket.off("call_end");
      socket.off("call_signal");
    };
  }, [currentUser, setCallInfo]);

  // Cleanup on unmount
  useEffect(() => cleanup, []);

  const acceptCall = async () => {
    const video = callTypeRef.current === "video";
    const stream = await getMedia(video);
    if (!stream) return;
    makePC();
    stream.getTracks().forEach((t) => pcRef.current!.addTrack(t, stream));
    getSocket().emit("call_accept", { to: peerRef.current });
    setCallInfo({ state: "connected", peer: peerRef.current, callType: callTypeRef.current });
  };

  const rejectCall = () => {
    getSocket().emit("call_reject", { to: peerRef.current });
    cleanup();
    setCallInfo({ state: "idle", peer: "", callType: "voice" });
  };

  const endCall = () => finish();

  const toggleMute = () => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = isMuted));
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = isVideoOff));
    setIsVideoOff(!isVideoOff);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (callInfo.state === "idle") return <div className="hidden" />;

  const isVideo = callInfo.callType === "video";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {isVideo ? (
          <div className="relative w-full aspect-video bg-[#0f172a] rounded-xl overflow-hidden mb-4">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-2 right-2 w-24 h-18 object-cover rounded-lg border border-[#334155]" />
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
              <button onClick={rejectCall} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105">
                <PhoneOff className="w-6 h-6" />
              </button>
              <button onClick={acceptCall} className="p-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:scale-105 animate-pulse">
                <Phone className="w-6 h-6" />
              </button>
            </>
          )}

          {callInfo.state === "calling" && (
            <button onClick={endCall} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105">
              <PhoneOff className="w-6 h-6" />
            </button>
          )}

          {callInfo.state === "connected" && (
            <>
              <button onClick={toggleMute} className={`p-3 rounded-full transition-all duration-200 ${isMuted ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"}`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              {isVideo && (
                <button onClick={toggleVideo} className={`p-3 rounded-full transition-all duration-200 ${isVideoOff ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"}`}>
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}
              <button onClick={endCall} className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/30 transition-all duration-200 hover:scale-105">
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
