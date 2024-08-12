import React from "react";
import logo from "../assets/images/logo.svg"; // Update the path to your logo image

const ThankYouCard = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full flex flex-col items-center">
        <img src={logo} alt="Logo" className="mb-4 w-full h-auto mx-auto" />

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-28 w-28 text-green-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Thank You for Creating Your Account!
        </h1>

        <p className=" text-gray-600 mb-2">
          Your account has been successfully set up in the{" "}
          <strong>SS Tax Mentors CRM & Document Management System.</strong>
        </p>
        <p className="text-start text-gray-600 mb-2">
          A verification email has been sent to your registered email address.
          Please check your inbox and follow the instructions to verify your
          email. Once verified, you'll be directed to the login screen to enter
          your login details.
        </p>
        <p className="text-start text-gray-600 mb-4 font-bold">Thank you for joining us!</p>

        <a
          href="/login" // Link to your home page
          className="inline-flex items-center rounded border border-indigo-600 bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          <span className="text-sm font-medium">Login</span>
        </a>
      </div>
    </div>
  );
};

export default ThankYouCard;
