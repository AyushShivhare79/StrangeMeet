import { useCallback, useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Peer from "peerjs";
import type { DataConnection } from "peerjs";

const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL);

export interface Message {
  type: "sender" | "receiver";
  message: string;
}

export const usePeerChat = () => {
  const [peer, setPeer] = useState<Peer>();
  const [myId, setMyId] = useState<string>();
  const [partnerPeerId, setPartnerPeerId] = useState<string>();
  const [shouldInitiateCall, setShouldInitiateCall] = useState<boolean>(false);
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [status, setStatus] = useState<string>("Idle");

  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const dataConnectionRef = useRef<DataConnection | null>(null);

  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id: string) => {
      setMyId(id);
      console.log("PeerJS connected with ID:", id);
    });

    // Listen for incoming data connections
    newPeer.on("connection", (conn) => {
      console.log("📨 Incoming data connection");
      dataConnectionRef.current = conn;
      
      conn.on("open", () => {
        console.log("✅ Data connection opened (incoming)");
      });

      conn.on("data", (data) => {
        console.log("📩 Received message:", data);
        handleNewMessage({ type: "receiver", message: data as string });
      });

      conn.on("close", () => {
        console.log("❌ Data connection closed");
        dataConnectionRef.current = null;
      });
    });

    socket.on("waiting", () => {
      setStatus("waiting for partner...");
    });

    socket.on(
      "partner-found",
      async ({ partnerPeerId, shouldInitiateCall }) => {
        console.log("Partner found with peer ID:", partnerPeerId);
        console.log("Should I initiate call?", shouldInitiateCall);
        setPartnerPeerId(partnerPeerId);
        setShouldInitiateCall(shouldInitiateCall);
        setStatus("connected");
      }
    );

    return () => {
      if (dataConnectionRef.current) {
        dataConnectionRef.current.close();
      }
    };
  }, [handleNewMessage]);

  const handleSend = () => {
    if (dataConnectionRef.current && text.trim()) {
      console.log("📤 Sending message:", text);
      dataConnectionRef.current.send(text);
      handleNewMessage({ type: "sender", message: text });
      setText("");
    } else if (!dataConnectionRef.current) {
      console.error("No data connection established");
    }
  };

  const findPartner = () => {
    if (!myId) {
      console.error("Peer ID not ready yet");
      return;
    }

    console.log("Finding partner with my peer ID:", myId);
    socket.emit("find-partner", { peerId: myId });
  };

  useEffect(() => {
    if (!peer || !partnerPeerId) return;

    console.log("Setting up video connection and data channel");
    console.log("Partner peer ID:", partnerPeerId);
    console.log("Should initiate call:", shouldInitiateCall);

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setMyStream(stream);

      // Set up video call
      peer.on("call", (incomingCall) => {
        console.log("📞 Incoming call, answering...");
        incomingCall.answer(stream);
        incomingCall.on("stream", (remote) => {
          console.log("📹 Received remote stream from incoming call");
          setRemoteStream(remote);
        });
      });

      if (shouldInitiateCall) {
        console.log("📞 I'm initiating the call to:", partnerPeerId);
        
        // Initiate data connection
        setTimeout(() => {
          const dataConn = peer.connect(partnerPeerId);
          dataConnectionRef.current = dataConn;

          dataConn.on("open", () => {
            console.log("✅ Data connection opened (outgoing)");
          });

          dataConn.on("data", (data) => {
            console.log("📩 Received message:", data);
            handleNewMessage({ type: "receiver", message: data as string });
          });

          dataConn.on("close", () => {
            console.log("❌ Data connection closed");
            dataConnectionRef.current = null;
          });

          // Initiate video call
          const call = peer.call(partnerPeerId, stream);
          call.on("stream", (remote) => {
            console.log("📹 Received remote stream from outgoing call");
            setRemoteStream(remote);
          });
        }, 1000);
      } else {
        console.log("👂 Waiting for incoming call and data connection...");
      }
    })();
  }, [partnerPeerId, peer, shouldInitiateCall, handleNewMessage]);

  return {
    setText,
    text,
    messages,
    handleSend,
    myId,
    status,
    myStream,
    remoteStream,
    findPartner,
  };
};
