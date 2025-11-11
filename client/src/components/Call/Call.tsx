import React, { useEffect, useRef } from "react";
import { usePeerChat, type Message } from "../../hook/usePeerChat";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const VideoChat: React.FC = () => {
  const { setText, messages, status, myStream, remoteStream, findPartner } =
    usePeerChat();
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

  const renderMessage = ({ item }: { item: Message }) => (
    <div
      className={`p-3 rounded-3xl m-2 ${
        item.type === "receiver"
          ? "self-start bg-[#1f1e25] text-white"
          : "self-end	 bg-[#5720ff] text-white"
      }`}
    >
      {item.message}
    </div>
  );

  return (
    <div className="flex flex-col border border-red-500 h-dvh p-6 gap-4">
      <div className="flex border border-black rounded-xl w-full justify-between items-center px-4 py-2 mb-4">
        <h2 className="text-xl font-bold">Strange Meet</h2>
        <div className="flex items-center gap-4">
          <h1 className="font-medium font-serif">Online 5</h1>
          <Button className="p-5">SignIn</Button>
        </div>
      </div>

      <div className="border h-full space-y-2 border-black">
        <div className="grid grid-cols-5 gap-4 h-full p-4">
          <div className="col-span-2 flex flex-col items-center gap-4 border border-black">
            <div>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-80 h-80 rounded-md bg-black"
              />
            </div>

            <div>
              <video
                ref={myVideoRef}
                autoPlay
                playsInline
                muted
                className="w-80 h-80 rounded-md bg-black"
              />
            </div>

            <p>{status}</p>

            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              onClick={findPartner}
            >
              Start Chat
            </Button>
          </div>

          <div className="col-span-3 border border-black flex relative flex-col">
            <div>
              {messages.map((msg, index) => (
                <div key={index}>{renderMessage({ item: msg })}</div>
              ))}
            </div>
            <div className="flex items-center gap-2 absolute bottom-4 w-full px-4">
              <Input
                onChange={(e) => setText(e.target.value)}
                className="p-4"
                type="text"
                placeholder="Type here..."
              />
              <Button type="submit" variant="default">
                SEND
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
