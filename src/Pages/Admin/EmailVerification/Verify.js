import React, { useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { saveLoginToken } from "../../../services/index.js";

function Verify() {
  const location = useLocation();
  const navigate = useNavigate(); // Initialize navigate function
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token"); // Extract token from query parameter

  const [verificationStatus, setVerificationStatus] = useState(null);

  useEffect(() => {
    const sendVerificationRequest = async () => {
      if (token) {
        try {
          // Send POST request to backend endpoint with the token
          const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/user/verification/verify` ,
            { token }
          );
         
          if (response.status === 200) {
            setVerificationStatus("success");
            const { token, userType } = response.data;
            saveLoginToken(token, userType);
            // message.success("Your email has been verified successfully!");
          } else {
            console.error("Failed to send verification request.");
            setVerificationStatus("failed");
          }
        } catch (error) {
          console.error("Error sending verification request:", error);
          setVerificationStatus("failed");
        }
      }
    };

    sendVerificationRequest();
  }, [token]); // Re-run the effect if token changes

  const handleLoginClick = () => {
    navigate("/user/userdashboard"); // Use navigate for routing
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-purple-500">
      <div className="max-w-md mx-auto p-8 rounded-lg shadow-lg bg-white">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Email Verified!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          {verificationStatus === "success"
            ? "Thank you for verifying your email."
            : "Verifying your email..."}
        </p>
        {verificationStatus === "success" && (
          <a
            onClick={handleLoginClick}
            className="block text-center text-blue-500 hover:underline font-semibold cursor-pointer"
          >
            Please Click Here to Login to Your Account
          </a>
        )}
        {verificationStatus === "failed" && (
          <p className="text-red-500 text-center">
            Failed to verify email. Please try again later.
          </p>
        )}
      </div>
    </div>
  );
}

export default Verify;
