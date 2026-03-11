import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff,
  FiPhone, FiMessageSquare, FiX, FiSend, FiImage
} from "react-icons/fi";
import { RiHeartPulseLine } from "react-icons/ri";

const API    = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SOCKET = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ]
};

export default function VideoCall() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const doctorToken  = localStorage.getItem("doctor-token");
  const patientToken = localStorage.getItem("access-token");
  const doctorInfo   = (() => { try { return JSON.parse(localStorage.getItem("doctor-info") || "{}"); } catch { return {}; } })();
  const role  = doctorToken ? "doctor" : "patient";
  const token = doctorToken || patientToken;

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef          = useRef(null);
  const socketRef      = useRef(null);
  const localStreamRef = useRef(null);
  const chatEndRef     = useRef(null);
  const imgRef         = useRef(null);
  const roomIdRef      = useRef(null);

  const [appointment, setAppointment]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [connected, setConnected]       = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [micOn, setMicOn]               = useState(true);
  const [camOn, setCamOn]               = useState(true);
  const [showChat, setShowChat]         = useState(false);
  const [messages, setMessages]         = useState([]);
  const [msgInput, setMsgInput]         = useState("");
  const [imageFile, setImageFile]       = useState(null);
  const [unread, setUnread]             = useState(0);
  const [callEnded, setCallEnded]       = useState(false);
  const [userName, setUserName]         = useState("");
  const [error, setError]               = useState("");
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/appointments/${appointmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const apt = res.data.appointment;
        setAppointment(apt);
        const name = role === "doctor"
          ? (doctorInfo.name || "Doctor")
          : (apt.patientName || "Patient");
        setUserName(name);
        roomIdRef.current = apt.callRoomId;
        initCall(apt.callRoomId, name);
      } catch {
        setError("Appointment not found or access denied.");
        setLoading(false);
      }
    };
    load();
    return () => cleanup();
  }, []);

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
  };

  const createPeerConnection = (socket, roomId) => {
    // Close existing PC if any
    if (pcRef.current) pcRef.current.close();

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Add local tracks
    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    // Remote stream
    pc.ontrack = (e) => {
      console.log("Remote track received:", e.streams[0]);
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setRemoteJoined(true);
      }
    };

    // ICE candidates
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", { roomId, candidate: e.candidate });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("ICE state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setConnected(true);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") setConnected(true);
      if (["disconnected", "failed"].includes(pc.connectionState)) setCallEnded(true);
    };

    return pc;
  };

  const initCall = async (roomId, name) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const socket = io(SOCKET, { transports: ["websocket"] });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected, role:", role);
        socket.emit("join-room", { roomId, role, userName: name });
        setLoading(false);
      });

      // When another user joins the room
      socket.on("user-joined", async ({ role: joinedRole, userName: joinedName }) => {
        console.log("User joined:", joinedRole, joinedName);
        setRemoteJoined(true);

        // Doctor always creates offer when patient joins
        if (role === "doctor") {
          const pc = createPeerConnection(socket, roomId);
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer });
          console.log("Offer sent");
        }
      });

      // Patient receives offer from doctor
      socket.on("offer", async ({ offer }) => {
        if (!offer) return;
        console.log("Offer received, role:", role);
        setRemoteJoined(true);

        const pc = createPeerConnection(socket, roomId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
        console.log("Answer sent");
      });

      // Doctor receives answer from patient
      socket.on("answer", async ({ answer }) => {
        if (!answer || !pcRef.current) return;
        console.log("Answer received");
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (!candidate || !pcRef.current) return;
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("ICE error:", e);
        }
      });

      // Incoming call notification
      socket.on("incoming-call", ({ doctorName }) => {
        setIncomingCall({ doctorName });
        if (Notification.permission === "granted") {
          new Notification("Incoming Call", {
            body: `Dr. ${doctorName} is calling you`,
            icon: "/favicon.ico",
          });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(perm => {
            if (perm === "granted") {
              new Notification("Incoming Call", {
                body: `Dr. ${doctorName} is calling you`,
                icon: "/favicon.ico",
              });
            }
          });
        }
      });

      socket.on("chat-message", ({ message, sender, time, image }) => {
        setMessages(prev => [...prev, { message, sender, time, image }]);
        setUnread(u => u + 1);
      });

      socket.on("call-ended", () => setCallEnded(true));

    } catch (err) {
      console.error("initCall error:", err);
      setError("Camera/Mic access denied. Please allow permissions.");
      setLoading(false);
    }
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOn(track.enabled); }
  };

  const endCall = () => {
    socketRef.current?.emit("end-call", { roomId: roomIdRef.current });
    cleanup();
    setCallEnded(true);
  };

  const sendMessage = () => {
    if (!msgInput.trim() && !imageFile) return;

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const msg = {
          message: msgInput.trim() || "",
          image: e.target.result,
          sender: userName,
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        };
        socketRef.current?.emit("chat-message", { roomId: roomIdRef.current, ...msg });
        setMessages(prev => [...prev, msg]);
        setMsgInput(""); setImageFile(null);
      };
      reader.readAsDataURL(imageFile);
    } else {
      const msg = {
        message: msgInput.trim(),
        sender: userName,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      };
      socketRef.current?.emit("chat-message", { roomId: roomIdRef.current, ...msg });
      setMessages(prev => [...prev, msg]);
      setMsgInput("");
    }
  };

  const openChat = () => {
    setShowChat(true);
    setUnread(0);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!callEnded) return;
    const timer = setTimeout(() => {
      if (role === "doctor") navigate("/doctor/dashboard/appointments");
      else navigate("/appointments");
    }, 3000);
    return () => clearTimeout(timer);
  }, [callEnded]);

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#f87171", fontFamily: "Cabinet Grotesk, sans-serif" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{error}</div>
        <button onClick={() => navigate(-1)} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 12, border: "none", background: "#00d4ff", color: "white", cursor: "pointer", fontWeight: 700 }}>Go Back</button>
      </div>
    </div>
  );

  if (callEnded) return (
    <div style={{ minHeight: "100vh", background: "#050d1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", fontFamily: "Cabinet Grotesk, sans-serif" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📞</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Call Ended</div>
        <div style={{ fontSize: 13, color: "#475569" }}>Redirecting...</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .vc-root { min-height: 100vh; background: #030810; font-family: 'Cabinet Grotesk', sans-serif; display: flex; flex-direction: column; }
        .vc-header { padding: 12px 20px; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; }
        .vc-logo { display: flex; align-items: center; gap: 8px; color: #00d4ff; font-size: 18px; }
        .vc-logo-text { font-size: 14px; font-weight: 700; color: #f1f5f9; }
        .vc-status { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .vc-status.connecting { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #f59e0b; }
        .vc-status.live { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); color: #22c55e; }
        .vc-status-dot { width: 7px; height: 7px; border-radius: 50%; animation: blink 1.2s ease-in-out infinite; }
        .vc-status-dot.y { background: #f59e0b; }
        .vc-status-dot.g { background: #22c55e; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .vc-videos { flex: 1; position: relative; background: #030810; display: flex; align-items: center; justify-content: center; }
        .vc-remote { width: 100%; height: calc(100vh - 140px); object-fit: cover; background: #0a1628; }
        .vc-remote-placeholder { width: 100%; height: calc(100vh - 140px); background: #0a1628; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #1e3a4a; gap: 12px; }
        .vc-remote-placeholder-icon { font-size: 80px; opacity: 0.3; }
        .vc-remote-placeholder-text { font-size: 16px; font-weight: 600; color: #334155; }
        .vc-local { position: absolute; bottom: 20px; right: 20px; width: 180px; height: 120px; border-radius: 16px; overflow: hidden; border: 2px solid rgba(0,212,255,0.3); box-shadow: 0 8px 30px rgba(0,0,0,0.5); background: #0a1628; z-index: 10; }
        .vc-local video { width: 100%; height: 100%; object-fit: cover; }
        .vc-local-label { position: absolute; bottom: 6px; left: 8px; font-size: 10px; font-weight: 700; color: white; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 4px; }
        .vc-controls { padding: 16px; background: rgba(5,13,26,0.95); border-top: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; gap: 12px; }
        .vc-btn { width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s; }
        .vc-btn.on { background: rgba(255,255,255,0.08); color: #e2e8f0; }
        .vc-btn.on:hover { background: rgba(255,255,255,0.15); }
        .vc-btn.off { background: rgba(248,113,113,0.15); color: #f87171; }
        .vc-btn.end { background: #ef4444; color: white; width: 60px; height: 60px; font-size: 22px; box-shadow: 0 4px 20px rgba(239,68,68,0.4); }
        .vc-btn.end:hover { background: #dc2626; transform: scale(1.05); }
        .vc-btn.chat { background: rgba(0,212,255,0.1); color: #00d4ff; position: relative; }
        .vc-btn.chat:hover { background: rgba(0,212,255,0.2); }
        .vc-unread { position: absolute; top: -2px; right: -2px; background: #f87171; color: white; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .vc-chat { position: fixed; right: 0; top: 0; bottom: 0; width: 320px; background: #0a1628; border-left: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; z-index: 50; transform: translateX(100%); transition: transform 0.3s ease; }
        .vc-chat.open { transform: translateX(0); }
        .vc-chat-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; font-size: 14px; font-weight: 700; color: #f1f5f9; }
        .vc-chat-close { background: none; border: none; color: #475569; cursor: pointer; font-size: 18px; }
        .vc-chat-msgs { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .vc-msg { max-width: 85%; padding: 9px 13px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
        .vc-msg.mine { background: rgba(0,212,255,0.12); color: #e2e8f0; align-self: flex-end; border-bottom-right-radius: 4px; }
        .vc-msg.theirs { background: rgba(255,255,255,0.05); color: #94a3b8; align-self: flex-start; border-bottom-left-radius: 4px; }
        .vc-msg-sender { font-size: 10px; font-weight: 700; margin-bottom: 3px; color: #00d4ff; }
        .vc-msg-time { font-size: 10px; color: #334155; margin-top: 3px; text-align: right; }
        .vc-chat-input { padding: 12px 14px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px; }
        .vc-chat-inp { flex: 1; padding: 10px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #e2e8f0; font-size: 13px; font-family: inherit; outline: none; }
        .vc-chat-inp::placeholder { color: #334155; }
        .vc-chat-inp:focus { border-color: rgba(0,212,255,0.3); }
        .vc-send-btn { width: 40px; height: 40px; border-radius: 12px; border: none; background: linear-gradient(135deg, #00d4ff, #0284c7); color: white; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; flex-shrink: 0; }
        .vc-send-btn:hover { transform: scale(1.05); }
        .vc-img-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #475569; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
        .vc-img-btn:hover { color: #00d4ff; border-color: rgba(0,212,255,0.3); }
        .vc-loading { position: fixed; inset: 0; z-index: 100; background: #050d1a; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
        .vc-spin { width: 48px; height: 48px; border: 3px solid rgba(0,212,255,0.2); border-top-color: #00d4ff; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .vc-loading-text { font-size: 16px; font-weight: 700; color: #f1f5f9; }
        .vc-loading-sub { font-size: 12px; color: #475569; }
        .vc-incoming { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 200; background: #0f2540; border: 1px solid rgba(0,212,255,0.3); border-radius: 20px; padding: 20px 28px; display: flex; flex-direction: column; align-items: center; gap: 12px; box-shadow: 0 8px 40px rgba(0,0,0,0.6); min-width: 280px; animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity:0; transform: translateX(-50%) translateY(-20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        .vc-incoming-title { font-size: 13px; color: #64748b; font-weight: 600; }
        .vc-incoming-name { font-size: 18px; color: #f1f5f9; font-weight: 800; }
        .vc-incoming-btns { display: flex; gap: 12px; margin-top: 4px; }
        .vc-incoming-accept { padding: 10px 24px; background: #22c55e; border: none; border-radius: 12px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; }
        .vc-incoming-decline { padding: 10px 24px; background: #ef4444; border: none; border-radius: 12px; color: white; font-weight: 700; font-size: 14px; cursor: pointer; }
        @media(max-width:768px) { .vc-local { width: 120px; height: 80px; } .vc-chat { width: 100%; } }
      `}</style>

      {loading && (
        <div className="vc-loading">
          <RiHeartPulseLine style={{ fontSize: 48, color: "#00d4ff", marginBottom: 8 }} />
          <div className="vc-spin" />
          <div className="vc-loading-text">Setting up call...</div>
          <div className="vc-loading-sub">Please allow camera and microphone access</div>
        </div>
      )}

      {incomingCall && (
        <div className="vc-incoming">
          <div className="vc-incoming-title">📞 Incoming Call</div>
          <div className="vc-incoming-name">Dr. {incomingCall.doctorName}</div>
          <div className="vc-incoming-btns">
            <button className="vc-incoming-accept" onClick={() => setIncomingCall(null)}>Accept</button>
            <button className="vc-incoming-decline" onClick={() => { setIncomingCall(null); navigate("/appointments"); }}>Decline</button>
          </div>
        </div>
      )}

      <div className="vc-root">
        <div className="vc-header">
          <div className="vc-logo">
            <RiHeartPulseLine />
            <span className="vc-logo-text">
              {role === "doctor"
                ? `Patient: ${appointment?.patientName || "..."}`
                : `Dr. ${appointment?.doctorName || "..."}`}
            </span>
          </div>
          <div className={`vc-status ${connected ? "live" : "connecting"}`}>
            <div className={`vc-status-dot ${connected ? "g" : "y"}`} />
            {connected ? "Live" : remoteJoined ? "Connecting..." : "Waiting..."}
          </div>
        </div>

        <div className="vc-videos">
          <video
            ref={remoteVideoRef}
            className="vc-remote"
            autoPlay
            playsInline
            style={{ display: remoteJoined ? "block" : "none" }}
          />
          {!remoteJoined && (
            <div className="vc-remote-placeholder">
              <div className="vc-remote-placeholder-icon">👨‍⚕️</div>
              <div className="vc-remote-placeholder-text">
                {role === "doctor" ? "Waiting for patient..." : "Waiting for doctor..."}
              </div>
            </div>
          )}
          <div className="vc-local">
            <video ref={localVideoRef} autoPlay playsInline muted />
            <div className="vc-local-label">You</div>
          </div>
        </div>

        <div className="vc-controls">
          <button className={`vc-btn ${micOn ? "on" : "off"}`} onClick={toggleMic}>
            {micOn ? <FiMic /> : <FiMicOff />}
          </button>
          <button className={`vc-btn ${camOn ? "on" : "off"}`} onClick={toggleCam}>
            {camOn ? <FiVideo /> : <FiVideoOff />}
          </button>
          <button className="vc-btn end" onClick={endCall}>
            <FiPhone style={{ transform: "rotate(135deg)" }} />
          </button>
          <button className="vc-btn chat" onClick={openChat}>
            <FiMessageSquare />
            {unread > 0 && <div className="vc-unread">{unread}</div>}
          </button>
        </div>
      </div>

      <div className={`vc-chat ${showChat ? "open" : ""}`}>
        <div className="vc-chat-header">
          <span>Chat</span>
          <button className="vc-chat-close" onClick={() => setShowChat(false)}><FiX /></button>
        </div>
        <div className="vc-chat-msgs">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", color: "#334155", fontSize: 12, marginTop: 40 }}>
              No messages yet. Say hi! 👋
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`vc-msg ${m.sender === userName ? "mine" : "theirs"}`}>
              {m.sender !== userName && <div className="vc-msg-sender">{m.sender}</div>}
              {m.image && (
                <img
                  src={m.image}
                  alt="shared"
                  style={{ maxWidth: "100%", borderRadius: 10, marginBottom: m.message ? 6 : 0, cursor: "pointer", display: "block" }}
                  onClick={() => window.open(m.image, "_blank")}
                />
              )}
              {m.message}
              <div className="vc-msg-time">{m.time}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="vc-chat-input">
          {imageFile && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                style={{ height: 72, borderRadius: 10, objectFit: "cover", border: "1px solid rgba(0,212,255,0.3)", display: "block" }}
              />
              <button
                onClick={() => setImageFile(null)}
                style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "#f87171", border: "none", color: "white", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="vc-img-btn" onClick={() => imgRef.current.click()} title="Send image">
              <FiImage />
            </button>
            <input ref={imgRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => setImageFile(e.target.files[0])} />
            <input
              className="vc-chat-inp"
              placeholder="Type a message..."
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button className="vc-send-btn" onClick={sendMessage}><FiSend /></button>
          </div>
        </div>
      </div>
    </>
  );
}