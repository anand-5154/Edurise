import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import type { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { useNavigate, useParams } from "react-router-dom";
import { getLiveToken } from "../../services/user.services";

const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

const StudentLivePage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const role = "user";
  const [isWaiting, setIsWaiting] = useState(true);
  const remoteContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let joined = false;
    const joinLive = async () => {
      try {
        const res = await getLiveToken(sessionId!, role);
        const { token, appId, roomId, courseId, userId } = res.data;
        if (client.connectionState === "CONNECTED" || client.connectionState === "CONNECTING") return;
        await client.setClientRole("audience");
        await client.join(appId, roomId, token, userId);
        joined = true;
        client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "audio") user.audioTrack?.play();
          if (mediaType === "video") {
            const container = remoteContainer.current;
            if (container) {
              container.innerHTML = "";
              user.videoTrack?.play(container);
              setIsWaiting(false);
            }
          }
        });
        const handleInstructorLeft = async () => {
          setIsWaiting(true);
          await client.leave();
          navigate(`/users/course-view/${courseId}`);
        };
        client.on("user-unpublished", handleInstructorLeft);
      } catch {}
    };
    joinLive();
    return () => {
      if (joined) client.leave();
      client.removeAllListeners();
    };
  }, [sessionId, navigate]);

  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] text-[var(--text-800)] grid place-items-center py-10">
      <div className="card p-6 w-[680px] max-w-full">
        <h2 className="h3 text-center mb-4">Live Class</h2>
        <div ref={remoteContainer} className="relative w-full h-[360px] bg-gray-900 radius-lg overflow-hidden shadow-2 border border-gray-300" />
        {isWaiting && (
          <div className="mt-3 alert alert-info text-center">Waiting for instructor to go live...</div>
        )}
      </div>
    </div>
  );
};

export default StudentLivePage;
