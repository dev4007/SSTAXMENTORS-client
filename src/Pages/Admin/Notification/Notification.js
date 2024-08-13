import React, { useState, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import NavigationBar from "../NavigationBar/NavigationBar";
import { useFormik } from "formik";
import * as Yup from "yup";

const Notification = () => {
  const [loading, setLoading] = useState(false);

  // Use a ref to directly control the file input element
  const fileInputRef = useRef(null);

  const validationSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    files: Yup.array()
      .min(1, "At least one file is required")
      .test(
        "fileType",
        "Unsupported file format. Only jpg, png, pdf, jpeg allowed",
        (value) => {
          if (value && value.length > 0) {
            return value.every(
              (file) =>
                file.type === "image/jpeg" ||
                file.type === "image/png" ||
                file.type === "application/pdf" ||
                file.type === "image/jpg"
            );
          }
          return false;
        }
      ),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      files: [],
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);

      // Append each file individually
      values.files.forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("token");
      setLoading(true);

      try {
        await axios.post(
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
        resetForm();
        // Clear the file input manually
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        message.error("Error sending notification");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.currentTarget.files);
    const updatedFiles = [...formik.values.files, ...selectedFiles];
    formik.setFieldValue("files", updatedFiles);
  };

  return (
    <div>
      <NavigationBar />
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md">
          <p className="font-bold text-3xl flex justify-center text-blue-500 mb-10">
            SEND NOTIFICATION
          </p>
          <form onSubmit={formik.handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-500 text-lg mb-2" htmlFor="title">
                Title:
              </label>
              <input
                className="border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                id="title"
                name="title"
                type="text"
                placeholder="Enter title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title ? (
                <div className="text-red-500 text-sm">{formik.errors.title}</div>
              ) : null}
            </div>
            <div className="mb-6">
              <label
                className="block text-gray-500 text-lg mb-2"
                htmlFor="description"
              >
                Description:
              </label>
              <textarea
                className="border border-gray-200 rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36"
                id="description"
                name="description"
                placeholder="Enter description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.description && formik.errors.description ? (
                <div className="text-red-500 text-sm">{formik.errors.description}</div>
              ) : null}
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
                onChange={handleFileChange}
                onBlur={formik.handleBlur}
                ref={fileInputRef} // Attach the ref to the file input
              />
              {formik.touched.files && formik.errors.files ? (
                <div className="text-red-500 text-sm">{formik.errors.files}</div>
              ) : null}
              {/* Display selected files */}
              {formik.values.files.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-700">Selected Files:</p>
                  <ul className="list-disc pl-5">
                    {formik.values.files.map((file, index) => (
                      <li key={index} className="text-gray-600">
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-center items-center mt-12">
              <button
                className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800"
                type="submit"
                disabled={formik.isSubmitting || loading}
              >
                {loading ? "Loading..." : "Send Notification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Notification;
