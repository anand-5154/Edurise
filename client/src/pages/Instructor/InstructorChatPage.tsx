import InstructorChatList from "./InstructorChatList";
import InstructorChatWindow from "./InstructorChatWindow";
import { useParams } from "react-router-dom";

const InstructorChatPage = () => {
  const { chatId } = useParams();

  return (
    <div className="flex h-screen bg-white">
      <InstructorChatList />
      {chatId ? (
        <InstructorChatWindow />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-600">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default InstructorChatPage;
