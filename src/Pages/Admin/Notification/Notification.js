import React, { useRef, useState } from "react";
import axios from "axios";
import { message } from "antd";
import NavigationBar from "../NavigationBar/NavigationBar";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Notification = () => {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Define validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Title is required")
      .max(100, "Title cannot exceed 100 characters"),
    description: Yup.string()
      .required("Description is required")
      .max(500, "Description cannot exceed 500 characters"),
    files: Yup.mixed()
      .required("At least one file is required")
      .test("fileSize", "File size is too large", (value) => {
        return value && Array.from(value).every((file) => file.size <= 1048576); // 1MB limit
      }),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);

    // Append selected files
    for (let i = 0; i < values.files.length; i++) {
      formData.append("files", values.files[i]);
    }

    const token = localStorage.getItem("token");
    setLoading(true); // Activate loader

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/notification/sendnotification`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success("Notification sent successfully");
      resetForm(); // Reset the form
    } catch (error) {
      message.error("Error sending notification");
      // Handle error
    } finally {
      setLoading(false); // Deactivate loader
      setSubmitting(false);
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="max-w-2xl  w-full bg-white p-8 rounded-md shadow-md">
          <p className="font-bold text-3xl flex justify-center text-blue-500 mb-10">
            SEND NOTIFICATION{" "}
          </p>
          <Formik
            initialValues={{ title: "", description: "", files: [] }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form ref={formRef}>
                <div className="mb-6">
                  <label
                    className="block text-gray-500 text-lg mb-2"
                    htmlFor="title"
                  >
                    Title:
                  </label>
                  <Field
                    className="border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter title"
                  />
                  <ErrorMessage name="title" component="div" className="text-red-500" />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-500 text-lg mb-2"
                    htmlFor="description"
                  >
                    Description:
                  </label>
                  <Field
                    as="textarea"
                    className="border border-gray-200 rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36"
                    id="description"
                    name="description"
                    placeholder="Enter description"
                  />
                  <ErrorMessage name="description" component="div" className="text-red-500" />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-500 text-lg mb-2"
                    htmlFor="files"
                  >
                    Attach Files:
                  </label>
                  <input
                    className="appearance-none block w-full bg-white border border-gray-200 rounded py-2 px-4 leading-tight focus:outline-none focus:border-blue-500 focus:shadow-outline"
                    id="files"
                    type="file"
                    multiple
                    onChange={(event) => {
                      setFieldValue("files", event.currentTarget.files);
                    }}
                  />
                  <ErrorMessage name="files" component="div" className="text-red-500" />
                </div>
                <div className="flex justify-center items-center mt-12">
                  <button
                    className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {loading ? "Loading..." : "Send Notification"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Notification;
