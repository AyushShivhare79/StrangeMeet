import React, { useEffect, useRef } from "react";
import { usePeerChat } from "../../hook/usePeerChat";
import { Button } from "../ui/button";

export const VideoChat: React.FC = () => {
  const { myId, status, myStream, remoteStream, findPartner } = usePeerChat();
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      console.log("Setting my stream");
      console.log("MY STREAM: ", myStream);
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("Setting remote stream");
      console.log("REMOTE STREAM: ", remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="flex flex-col items-center p-6 gap-4">
      <div className="flex border border-black rounded-xl w-full justify-between items-center px-4 py-2 mb-4">
        <h2 className="text-xl font-bold">Strange Meet</h2>

        <Button className="p-5">SignIn</Button>
      </div>

      <p>{myId}</p>
      <p>{status}</p>

      <Button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        onClick={findPartner}
      >
        Start Chat
      </Button>

      {/* <div className="flex gap-4 mt-6">
        <div>
          <h1>ME</h1>

          <video
            ref={myVideoRef}
            autoPlay
            playsInline
            muted
            className="w-60 h-44 rounded-md bg-black"
          />
        </div>
        <div>
          <h1>PARTNER</h1>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-60 h-44 rounded-md bg-black"
          />
        </div>
      </div> */}
    </div>
  );
};

export default VideoChat;
