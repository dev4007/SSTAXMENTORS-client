import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

function Registration() {
  let navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [EmployeeId, setEmployeeId] = useState("");

  useEffect(() => {
    let isMounted = true;
    // Fetch ticket ID from the backend on component mount
    const fetchNewEmployeeId = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "https://www.sstaxmentors.com/admin/employee/getEmployeeId",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
        console.log(!response);
        if (!response) {
          throw new Error("Failed to fetch profile data");
        }
        setEmployeeId(response.data.EmployeeId);
      } catch (error) {
        console.error("Error fetching Employee ID:", error);
        console.log("error", error.response);
        console.log("ismounted", isMounted);
        if (isMounted && error.response && error.response.status === 401) {
          // If the response status is 401, display an alert and redirect to login page
          alert("Session expired. Please login again.");
          // window.location.href = '/'; // Change the URL accordingly
          navigate("/");
        }
      }
    };

    fetchNewEmployeeId();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    // Clear all form data
    setFormData({
      EmployeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
  };

  const saveDataAndSubmit = async () => {
    try {
      const dataToSend = { ...formData };
      // formData.append('EmployeeId', EmployeeId); // Add this line to send ticketId

      dataToSend.EmployeeId = EmployeeId;

      console.log(dataToSend);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://www.sstaxmentors.com/admin/employee/addEmployee",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Handle the response from the backend as needed
      message.success("Successfully registered employee!");
      setTimeout(() => {
        window.location.reload();
      }, 3000);

      // console.log(response.data);

      // Reset the form data
      setFormData({});
    } catch (error) {
      message.error("Error registering employee");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      setError("Error registering user");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
        <h2 className="text-3xl font-semibold text-gray-700 mb-4 text-center">
          Add New Employee
        </h2>
        <div className="mx-auto w-full lg:w-11/12 mb-8">
          <label className="block font-regular text-lg text-gray-500">
            Employee ID:
          </label>
          <input
            type="text"
            value={EmployeeId}
            readOnly
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
          />
        </div>
        <div className="mx-auto w-full lg:w-11/12 mb-8">
          {" "}
          {/* Set the width of the form and add margin */}
          <label className="block mb-4">
            First Name:
            <input
              type="text"
              id="firstName"
              name="firstName"
              onChange={handleChange}
              className="border focus:border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 mt-1 w-full"
            />
          </label>
          {/* Other form fields */}
          {/* Example: */}
          <label className="block mb-4">
            Last Name:
            <input
              type="text"
              id="lastName"
              name="lastName"
              onChange={handleChange}
              className="border focus:border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 mt-1 w-full"
            />
          </label>
          <label className="block mb-4">
            Email:
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 mt-1 w-full"
            />
          </label>
          {/* Other form fields */}
          {/* Example: */}
          <label className="block mb-4">
            Phone Number (Whatsapp number recommended):
            <input
              type="tel"
              id="phone"
              name="phone"
              onChange={handleChange}
              className="border border-gray-300 rounded px-3 py-2 mt-1 w-full"
            />
          </label>
          <label className="block mb-4">
            Password:
            <input
              type="password"
              id="password"
              name="password"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 w-full"
              placeholder="Password"
              onChange={handleChange}
            />
          </label>
          <label className="block mb-4">
            Confirm Password:
            <br />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                formData.confirmPassword !== formData.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Confirm Password"
              onChange={handleChange}
            />
          </label>
          {formData.confirmPassword !== formData.password && (
            <p className="text-red-500">Passwords do not match</p>
          )}
          <button
            onClick={saveDataAndSubmit}
            className="bg-blue-500 hover:bg-blue-600 w-full text-white font-bold py-2 px-4 rounded mb-4"
          >
            Register
          </button>
          <button
            onClick={handleReset}
            className="bg-gray-300 hover:bg-gray-400 w-full text-gray-800 font-bold py-2 px-4 rounded"
          >
            Reset
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Registration;
