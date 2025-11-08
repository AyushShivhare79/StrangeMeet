import { useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";

const socket = io("ws://localhost:5000");

export const usePeerChat = () => {
  const [peer, setPeer] = useState<Peer>();
  const [partnerId, setPartnerId] = useState<string>();
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", () => {
      console.log("PeerJS connected");
    });

    socket.on("waiting", () => {
      setStatus("waiting for partner...");
    });

    socket.on("partner-found", async ({ partnerId }) => {
      setPartnerId(partnerId);
      setStatus("connected");
    });

    // return () => {
    //   socket.disconnect();
    //   newPeer.destroy();
    // };
  }, []);

  // Start finding partner
  const findPartner = () => {
    console.log("Finding partner...");

    socket.emit("find-partner");
  };

  // Handle video connection
  useEffect(() => {
    if (!peer || !partnerId) return;

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);

      const call = peer.call(partnerId, stream);

      call.on("stream", (remote) => {
        setRemoteStream(remote);
      });

      peer.on("call", (incomingCall) => {
        incomingCall.answer(stream);
        incomingCall.on("stream", (remote) => setRemoteStream(remote));
      });
    })();
  }, [partnerId, peer]);

  return { status, myStream, remoteStream, findPartner };
};
