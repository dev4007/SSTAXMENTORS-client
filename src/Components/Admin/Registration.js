import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";

const Registration = () => {
  let navigate = useNavigate();

  const initialState = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  };

  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const [EmployeeId, setEmployeeId] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  useEffect(() => {
    fetchNewEmployeeId();
  }, []);

  const fetchNewEmployeeId = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/employee/getEmployeeId`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmployeeId(response.data.EmployeeId);
    } catch (error) {
      console.error("Error fetching Employee ID:", error);
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please login again.");
      
      }
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleReset = () => {
    setFormData(initialState);
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setFormErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setFormErrors(validationErrors);
      return false;
    }
  };

  const saveDataAndSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      const dataToSend = { ...formData, EmployeeId };
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/employee/addEmployee`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleReset();
      message.success("Successfully registered employee!");
      fetchNewEmployeeId();
      navigate("/admin/admindashboard/view-employee");
    } catch (error) {
      // Check if the error response indicates that the email already exists
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Email already exists"
      ) {
        message.error("This email is already registered.");
      } else {
        message.error("Error registering employee");
      }
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
          <label className="block mb-4">
            First Name:
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                formErrors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.firstName && (
              <p className="text-red-500">{formErrors.firstName}</p>
            )}
          </label>

          <label className="block mb-4">
            Last Name:
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                formErrors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.lastName && (
              <p className="text-red-500">{formErrors.lastName}</p>
            )}
          </label>

          <label className="block mb-4">
            Email:
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.email && (
              <p className="text-red-500">{formErrors.email}</p>
            )}
          </label>

          <label className="block mb-4">
            Phone Number (Whatsapp number recommended):
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                formErrors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.phone && (
              <p className="text-red-500">{formErrors.phone}</p>
            )}
          </label>

          <label className="block mb-4">
            Password:
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Password"
              />
              <span
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute right-3 top-2 cursor-pointer"
              >
                {passwordVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </span>
            </div>
            {formErrors.password && (
              <p className="text-red-500">{formErrors.password}</p>
            )}
          </label>

          <label className="block mb-4">
            Confirm Password:
            <div className="relative">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-200 ${
                  formErrors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Confirm Password"
              />
              <span
                onClick={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
                className="absolute right-3 top-2 cursor-pointer"
              >
                {confirmPasswordVisible ? (
                  <EyeOutlined />
                ) : (
                  <EyeInvisibleOutlined />
                )}
              </span>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-red-500">{formErrors.confirmPassword}</p>
            )}
          </label>

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
        </div>
      </div>
    </div>
  );
};

export default Registration;
