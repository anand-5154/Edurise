import NotificationList from "../../components/NotificationList";
import Navbar from "../../components/Navbar";

const UserNotification = () => {
  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />
      <div className="container pt-24">
        <div className="max-w-2xl mx-auto card p-6">
          <h2 className="h3 mb-4">Notifications</h2>
          <NotificationList />
        </div>
      </div>
    </div>
  );
};

export default UserNotification;
