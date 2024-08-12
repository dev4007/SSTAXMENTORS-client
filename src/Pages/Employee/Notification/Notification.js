import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../NavigationBar/NavigationBar";
import { useFormik } from "formik";
import * as Yup from "yup";

const Notification = () => {
  let navigate = useNavigate();
  const [tokenExpired, setTokenExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      files: null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
      files: Yup.mixed()
        .required("At least one file is required")
        .test("fileSize", "Must attach at least one file", (value) => {
          return value && value.length > 0;
        }),
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);

      for (let i = 0; i < values.files.length; i++) {
        formData.append("files", values.files[i]);
      }

      const token = localStorage.getItem("token");
      setLoading(true); // Activate loader

      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/admin/sendnotification`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("Notification sent successfully");
        formRef.current.reset();
        formik.resetForm();
      } catch (error) {
        message.error("Error sending notification");
      } finally {
        setLoading(false); // Deactivate loader
      }
    },
  });

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setTokenExpired(true); // Token expired, set state to true
      } else {
        try {
          // Check token expiration by sending a request to the backend
          await axios.get(`${process.env.REACT_APP_API_URL}/token/checktoken`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (error) {
          if (error.response && error.response.status === 500) {
            setTokenExpired(true); // Token expired, set state to true
          }
        }
      }
    };

    checkTokenExpiration();
  }, []); //

  const handleTokenExpiration = () => {
    alert("Session has timed out. Please login again.");
    navigate("/");
  };

  const handleFileChange = (e) => {
    formik.setFieldValue("files", e.target.files);
  };

  useEffect(() => {
    if (tokenExpired) {
      handleTokenExpiration();
    }
  }, [tokenExpired]);

  return (
    <div>
      <NavigationBar />
      <>
        {!tokenExpired && (
          <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md">
              <h2 className="text-3xl font-semibold text-blue-500 mb-4 text-center ">
                SEND NOTIFICATION
              </h2>
              <form ref={formRef} onSubmit={formik.handleSubmit}>
                <div className="mb-6">
                  <label
                    className="block text-gray-500 text-lg mb-2"
                    htmlFor="title"
                  >
                    Title:
                  </label>
                  <input
                    className={`border ${formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-200'} rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full`}
                    id="title"
                    type="text"
                    placeholder="Enter title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <div className="text-red-500 text-sm">{formik.errors.title}</div>
                  )}
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-500 text-lg mb-2"
                    htmlFor="description"
                  >
                    Description:
                  </label>
                  <textarea
                    className={`border ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-200'} rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36`}
                    id="description"
                    placeholder="Enter description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-red-500 text-sm">{formik.errors.description}</div>
                  )}
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-500 text-lg mb-2"
                    htmlFor="files"
                  >
                    Attach Files:
                  </label>
                  <input
                    className={`appearance-none block w-full bg-white border ${formik.touched.files && formik.errors.files ? 'border-red-500' : 'border-gray-200'} rounded py-2 px-4 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline`}
                    id="files"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.files && formik.errors.files && (
                    <div className="text-red-500 text-sm">{formik.errors.files}</div>
                  )}
                </div>
                <div className="flex justify-center items-center mt-12">
                  <button
                    className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Send Notification"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default Notification;
