import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Send, X } from "lucide-react";

interface VoiceRecorderProps {
  onSend: (base64Audio: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isRecording]);

  const handleSend = useCallback(async () => {
    if (!audioBlob) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      onSend(base64);
    };
    reader.readAsDataURL(audioBlob);
  }, [audioBlob, onSend]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#1e293b] border-t border-[#334155]">
      {!audioBlob ? (
        <>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 rounded-full transition-all duration-200 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30"
                : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
            }`}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm text-white font-mono">
                  {formatDuration(duration)}
                </span>
                <div className="flex-1 flex gap-0.5 items-center h-6">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-red-400 rounded-full animate-pulse"
                      style={{
                        height: `${4 + Math.random() * 16}px`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-sm text-slate-400">
                Tap to start recording
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setAudioBlob(null);
              setAudioUrl(null);
              setDuration(0);
            }}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>

          {audioUrl && (
            <audio src={audioUrl} controls className="h-8 flex-1" />
          )}

          <button
            onClick={handleSend}
            className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};
