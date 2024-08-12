import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import icons from react-icons

const AccountInfo = ({ formData, setFormData, prevStep, submitForm }) => {
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email format").required("Email Required"),
    phone: Yup.string().required("Phone Number Required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password Required"),
  });

  const formik = useFormik({
    initialValues: {
      email: formData.email || "",
      phone: formData.phone || "",
      password: formData.password || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await saveDataAndSubmit(values);
    },
  });

  const saveDataAndSubmit = async (values) => {
    setLoading(true);
    localStorage.setItem("formData", JSON.stringify(values));
    try {
      await submitForm(); // Make sure this function is working as expected
      // Optionally, add success handling here (e.g., redirect or show a message)
    } catch (error) {
      console.error("Failed to submit the form", error);
      // Optionally, show an error message to the user
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
        <h2 className="text-3xl font-semibold mb-10 text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">REGISTRATION FORM</h2>
        <h2 className="text-2xl font-bold mb-6">Account Information</h2>

        <form onSubmit={formik.handleSubmit}>
          <label className="block mb-4">
            Email:
            <input
              type="email"
              id="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.email && formik.errors.email ? (
              <p className="text-red-500">{formik.errors.email}</p>
            ) : null}
          </label>

          <label className="block mb-4">
            Phone Number (Whatsapp number recommended):
            <input
              type="tel"
              id="phone"
              name="phone"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
              className={`border ${formik.touched.phone && formik.errors.phone ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.phone && formik.errors.phone ? (
              <p className="text-red-500">{formik.errors.phone}</p>
            ) : null}
          </label>

          <label className="block mb-4">
            Password:
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                name="password"
                className={`border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200`}
                placeholder="Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <span
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              >
                {passwordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
            {formik.touched.password && formik.errors.password ? (
              <p className="text-red-500">{formik.errors.password}</p>
            ) : null}
          </label>

          <label className="block mb-4">
            Confirm Password:
            <div className="relative">
              <input
                type={confirmPasswordVisible ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`border ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full focus:outline-none focus:ring focus:ring-blue-200`}
                placeholder="Confirm Password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
              />
              <span
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              >
                {confirmPasswordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <p className="text-red-500">{formik.errors.confirmPassword}</p>
            ) : null}
          </label>

          <div className="flex justify-between mt-10">
            <button
              type="button"
              onClick={prevStep}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Previous
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Loading...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default AccountInfo;
