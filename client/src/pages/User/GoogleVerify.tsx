import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyGoogleS } from "../../services/user.services";
import { USER_ROUTES } from "../../constants/routes.constants";
import UserContext from "../../context/UserContext";

const GoogleVerify: React.FC = () => {
  const navigate = useNavigate();
  const { getUserProfile } = useContext(UserContext) ?? {};
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyGoogleToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      if (!token) {
        navigate(USER_ROUTES.LOGIN);
        return;
      }
      try {
        const response = await verifyGoogleS(token);
        if (response.status === 200) {
          localStorage.setItem("usersToken", token);
          localStorage.setItem("usersEmail", response.data.user.email);
          // populate user context so protected profile calls succeed
          try {
            if (getUserProfile) await getUserProfile();
          } catch (err) {
            console.error("Failed to fetch user profile after Google verify:", err);
          }
          navigate(USER_ROUTES.HOME);
        } else {
          navigate(USER_ROUTES.LOGIN);
        }
      } catch (error) {
        console.error("Google verification error:", error);
        navigate(USER_ROUTES.LOGIN);
      } finally {
        setVerifying(false);
      }
    };
    verifyGoogleToken();
  }, [navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--text-800)]">
        <h2 className="h4">Verifying your account...</h2>
      </div>
    );
  }

  return null;
};

export default GoogleVerify;
