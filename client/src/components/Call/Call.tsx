import { useEffect, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";

const socket = io("http://localhost:5000");

export const usePeerChat = () => {
  const [peer, setPeer] = useState<Peer>();
  const [partnerId, setPartnerId] = useState<string>();
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [status, setStatus] = useState<string>("idle");

  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      console.log("Peer ID:", id);
      socket.emit("find-partner");
    });

    socket.on("waiting", () => setStatus("waiting for partner..."));

    socket.on("partner-found", async ({ partnerId }) => {
      setPartnerId(partnerId);
      setStatus("connected");
    });

    return () => {
      socket.disconnect();
      newPeer.destroy();
    };
  }, []);

  useEffect(() => {
    if (!peer || !partnerId) return;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setMyStream(stream);

        const call = peer.call(partnerId, stream);

        call.on("stream", (remote) => {
          setRemoteStream(remote);
        });

        peer.on("call", (incomingCall) => {
          incomingCall.answer(stream);
          incomingCall.on("stream", (remote) => setRemoteStream(remote));
        });
      });
  }, [partnerId, peer]);

  return { status, myStream, remoteStream };
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
