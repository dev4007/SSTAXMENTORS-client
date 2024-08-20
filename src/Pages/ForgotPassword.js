import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

function ForgotPassword() {
  let navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    userType: Yup.string().required("User type is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/login/forgot-password`,
        values
      );

      if (response.data.status === "success") {
        navigate("/login");
        message.info("Verify yourself via email");
      }
    } catch (err) {
      if (err.response) {
        const statusCode = err.response.status;

        if (statusCode === 400) {
          message.error(
            "Invalid email address or user type. Please check your input and try again."
          );
        } else if (statusCode === 401) {
          message.error(
            "Email address does not exist. Please enter a valid email."
          );
        } else if (statusCode === 500) {
          message.error("Internal server error. Please try again later.");
        }
      } else {
        message.error(
          "Network error. Please check your internet connection and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-w-md mx-auto mt-44 p-9 bg-white rounded shadow-md">
        <label className="text-4xl font-bold ">Forgot Password</label>
        <Formik
          initialValues={{ email: "", userType: "user" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form>
              <div className="mb-4 mt-5">
                <label className="block mb-2">User Type:</label>
                <label className="inline-block mr-4">
                  <Field
                    type="radio"
                    name="userType"
                    value="user"
                    className="mr-2"
                  />
                  User
                </label>
                <label className="inline-block mr-4">
                  <Field
                    type="radio"
                    name="userType"
                    value="employee"
                    className="mr-2"
                  />
                  Employee
                </label>
                <label className="inline-block">
                  <Field
                    type="radio"
                    name="userType"
                    value="admin"
                    className="mr-2"
                  />
                  Admin
                </label>
                <ErrorMessage
                  name="userType"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
              <div className="mt-8">
                <label className="block mb-4">
                  Email:
                  <Field
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="border focus:border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 mt-1 w-full"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </label>
              </div>
              <div className="text-blue-500 mt-3">
                <Link to="/">Don't have an account?</Link>
              </div>
              <div className="flex justify-between mt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold w-full py-2 px-4 rounded"
                >
                  {isSubmitting ? "Sending..." : "Send" }
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default ForgotPassword;
