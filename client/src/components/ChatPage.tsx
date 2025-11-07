import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useParams } from "react-router-dom";

const UserChatPage = () => {
  const { chatId } = useParams();

  return (
    <div className="flex h-screen bg-white">
      <ChatList />
      {chatId ? (
        <ChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default UserChatPage;
