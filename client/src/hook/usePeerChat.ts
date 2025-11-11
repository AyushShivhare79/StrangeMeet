import { useCallback, useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";

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
  const [status, setStatus] = useState<string>("idle");

  const [text, setText] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "receiver",
      message: "Hello! How are you?",
    },
    { type: "sender", message: "I'm good, thank you! How about you?" },
  ]);

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id: string) => {
      setMyId(id);
      console.log("PeerJS connected with ID:", id);
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
  }, []);

  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  }, []);

  const handleSend = () => {
    if (socket && text.trim()) {
      socket.send(text);
      handleNewMessage({ type: "sender", message: text });
      setText("");
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

    console.log("Setting up video connection");
    console.log("Partner peer ID:", partnerPeerId);
    console.log("Should initiate call:", shouldInitiateCall);

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setMyStream(stream);

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
        setTimeout(() => {
          const call = peer.call(partnerPeerId, stream);
          call.on("stream", (remote) => {
            console.log("📹 Received remote stream from outgoing call");
            setRemoteStream(remote);
          });
        }, 1000);
      } else {
        console.log("👂 Waiting for incoming call...");
      }
    })();
  }, [partnerPeerId, peer, shouldInitiateCall]);

  return {
    setText,
    messages,
    handleSend,
    myId,
    status,
    myStream,
    remoteStream,
    findPartner,
  };
};
