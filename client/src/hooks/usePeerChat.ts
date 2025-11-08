import { useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";

const socket = io(import.meta.env.VITE_SOCKET_SERVER_URL);

export const usePeerChat = () => {
  const [peer, setPeer] = useState<Peer>();
  const [myId, setMyId] = useState<string>();
  const [partnerId, setPartnerId] = useState<string>();
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id: string) => {
      setMyId(id);
      console.log("PeerJS connected");
    });

    socket.on("waiting", () => {
      setStatus("waiting for partner...");
    });

    socket.on("partner-found", async ({ partnerId }) => {
      setPartnerId(partnerId);
      setStatus("connected");
    });
  }, []);

  // Start finding partner
  const findPartner = () => {
    console.log("Finding partner...");

    socket.emit("find-partner");
  };

  // Handle video connection
  useEffect(() => {
    if (!peer || !partnerId) return;

    console.log("Starting video connection with", partnerId);
    console.log("My peer ID is", peer.id);

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);

      const call = peer.call(partnerId, stream);

      call.on("stream", (remote) => {
        console.log("Received remote stream");
        setRemoteStream(remote);
      });

      peer.on("call", (incomingCall) => {
        incomingCall.answer(stream);
        incomingCall.on("stream", (remote) => setRemoteStream(remote));
      });
    })();
  }, [partnerId, peer]);

  return {myId, status, myStream, remoteStream, findPartner };
};
