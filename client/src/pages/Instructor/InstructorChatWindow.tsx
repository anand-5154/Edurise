import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { socket } from "../../services/socket.service";
import { FiPaperclip } from "react-icons/fi";
import { MdVideoCall } from "react-icons/md";
import {
  getMessages,
  markMessagesReadS,
  sentImageinMessage,
} from "../../services/instructor.services";
import { X } from "lucide-react";
import { errorToast } from "../../components/Toast";

interface Message {
  _id?: string;
  chatId: string;
  senderId: string;
  content?: string;
  image?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
}

const InstructorChatWindow = () => {
  const { chatId } = useParams();
  const { state } = useLocation();
  const { partnerName, targetUserId } = state || {};
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { authUser } = useAuth();
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);
    console.log("Instructor Socket", socket.id);

    const handleMessage = (msg: Message) => {
      if (msg.chatId == chatId) {
        const normalized: Message = {
          _id: msg._id,
          chatId: msg.chatId,
          senderId: msg.senderId,
          content: msg.content,
          image: msg.image,
          isDeleted: msg.isDeleted,
          createdAt: msg.createdAt,
        };
        setMessages((prev) => [...prev, normalized]);
      }
    };

    const handleDelete = (messageId: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isDeleted: true } : msg
        )
      );
    };

    socket.on("receiveMessage",handleMessage)
    socket.on("messageDeleted", handleDelete);

    return () => {
      socket.off("receiveMessage");
    };
  }, [chatId]);

  const handleDeleteMessage = async (messageId: string) => {
    if (!chatId) {
      return;
    }
    socket.emit("deleteMessage", { messageId, chatId, userId: authUser?._id });
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isDeleted: true } : msg
      )
    );
  };

  useEffect(() => {
    const markMessagesRead = async () => {
      if (!chatId || !authUser) return;

      try {
        await markMessagesReadS(
          chatId,
          authUser._id!,
          authUser.role == "user" ? "User" : "Instructor"
        );
      } catch (err) {
        console.error("Failed to mark messages as read", err);
      }
    };

    if (chatId && authUser) {
      markMessagesRead();
    }
  }, [chatId, authUser]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await getMessages(chatId!);
        const normalized = res.data.map((msg) => ({
          _id: msg._id,
          chatId: msg.chat,
          senderId: msg.senderId,
          content: msg.content,
          isDeleted: msg.isDeleted,
          image: msg.image,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        }));
        setMessages(normalized);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };
    if (chatId) fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    if ((!text.trim() && !file) || !authUser || !authUser._id || !chatId)
      return;

    if((text.length>50 && !file)){
      errorToast("the text has exceeded 50 characters")
      return
    }

    let imageUrl = "";

    if (file) {
      const formData = new FormData();
      formData.append("chatImage", file);

      try {
        const res = await sentImageinMessage(formData);
        imageUrl = res.data.url;
      } catch (err) {
        console.error("Error uploading image:", err);
        return;
      }
    }

    socket.emit("sendMessage", {
      chat: chatId,
      senderId: authUser._id,
      senderRole: "instructor",
      content: text.trim(),
      ...(imageUrl && { image: imageUrl }),
    });

    setText("");
    setFile(null);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full md:w-2/3 p-4 bg-white text-gray-800 border border-gray-200">
      <div className="flex justify-between items-center mb-4 border-b border-gray-300 pb-2">
        <h2 className="text-2xl font-bold text-blue-600 tracking-wide">
          {partnerName}
        </h2>
        <MdVideoCall
          className="text-3xl text-blue-500 cursor-pointer hover:text-blue-600"
          title="Start Video Call"
          onClick={() => {
            navigate(`/instructors/video/${chatId}?target=${targetUserId}`);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-2 pr-2 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`group relative p-3 rounded-xl text-sm max-w-sm break-words transition-all
        ${
          msg.senderId === authUser?._id
            ? "ml-auto bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-md"
            : "bg-gray-100 text-gray-800 shadow-inner border border-gray-200"
        }`}
          >
            {msg.isDeleted ? (
              <p className="italic text-gray-500">Message deleted</p>
            ) : (
              <>
                {msg.content && <p>{msg.content}</p>}
                {msg.image && msg.image.trim() !== "" && (
                  <img
                    src={msg.image}
                    alt="sent"
                    className="rounded mt-2 border border-gray-300 max-w-xs cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setFullscreenImage(msg.image || "")}
                  />
                )}
              </>
            )}

            <span className={`text-xs absolute bottom-1 right-2 ${
              msg.senderId === authUser?._id ? "text-white/90" : "text-gray-500"
            }`}>
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {msg.senderId === authUser?._id && (
              <button
                onClick={() => handleDeleteMessage(msg._id!)}
                className="absolute top-1 right-1 text-xs bg-red-600 hover:bg-red-500 px-1 py-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <X size={13} />
              </button>
            )}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="flex items-center gap-2">
        <label className="cursor-pointer relative">
          <FiPaperclip className="w-6 h-6 text-blue-600 hover:text-blue-700 transition duration-200" />
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </label>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 rounded-l-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          placeholder="Type your message..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-r-lg font-semibold shadow hover:shadow-lg transition duration-150"
        >
          Send
        </button>
      </div>

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Full View"
            className="max-w-full max-h-full rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default InstructorChatWindow;
