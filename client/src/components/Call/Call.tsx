import React, { useEffect, useRef } from "react";
import { usePeerChat } from "../../hooks/usePeerChat";

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
      <h2 className="text-xl font-bold">Strange Meet</h2>
      <p>{myId}</p>
      <p>{status}</p>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        onClick={findPartner}
      >
        Start Chat
      </button>

      <div className="flex gap-4 mt-6">
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
      </div>
    </div>
  );
};

// import { useEffect, useRef, useState } from "react";
// import { useMutation } from "@tanstack/react-query";
// import Peer from "peerjs";

// const Call = () => {
//   const [peerId, setPeerId] = useState<string>("");
//   const [remotePeerIdValue, setRemotePeerIdValue] = useState<string>("");
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const currentUserVideoRef = useRef<HTMLVideoElement>(null);
//   const peerInstance = useRef<Peer | null>(null);

//   const mutation = useMutation({
//     mutationFn: postTodo,
//     onSuccess: () => {
//       console.log("FUCKING WORKED");
//     },
//   });
//   mutation.mutate();

//   useEffect(() => {
//     const peer = new Peer();

//     peer.on("open", (id) => {
//       setPeerId(id);
//     });

//     // Answer incoming calls
//     peer.on("call", (call) => {
//       navigator.mediaDevices
//         .getUserMedia({ video: true, audio: true })
//         .then((mediaStream) => {
//           if (currentUserVideoRef.current) {
//             currentUserVideoRef.current.srcObject = mediaStream;
//             currentUserVideoRef.current.play();
//           }
//           call.answer(mediaStream);
//           call.on("stream", (remoteStream: MediaStream) => {
//             if (remoteVideoRef.current) {
//               remoteVideoRef.current.srcObject = remoteStream;
//               remoteVideoRef.current.play();
//             }
//           });
//         })
//         .catch((error) => {
//           console.error("Error accessing media devices:", error);
//         });
//     });

//     peerInstance.current = peer;
//   }, []);

//   // Function to initiate a call
//   const call = (remotePeerId: string) => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((mediaStream) => {
//         if (currentUserVideoRef.current) {
//           currentUserVideoRef.current.srcObject = mediaStream;
//           currentUserVideoRef.current.play();
//         }

//         if (peerInstance.current) {
//           const call = peerInstance.current.call(remotePeerId, mediaStream);
//           call.on("stream", (remoteStream: MediaStream) => {
//             if (remoteVideoRef.current) {
//               remoteVideoRef.current.srcObject = remoteStream;
//               remoteVideoRef.current.play();
//             }
//           });
//         }
//       })
//       .catch((error) => {
//         console.error("Error accessing media devices:", error);
//       });
//   };

//   return (
//     <>
//       <div className="App">
//         <h1>Current user id is {peerId}</h1>
//         <input
//           type="text"
//           value={remotePeerIdValue}
//           onChange={(e) => setRemotePeerIdValue(e.target.value)}
//         />
//         <button onClick={() => call(remotePeerIdValue)}>Call</button>
//         <div>
//           <video ref={currentUserVideoRef} />
//         </div>
//         <div>
//           <video ref={remoteVideoRef} />
//         </div>
//       </div>
//     </>
//   );
// };

// export default Call;
