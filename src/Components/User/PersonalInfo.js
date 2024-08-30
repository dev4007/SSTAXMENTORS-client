import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

const PersonalInfo = ({ formData, setFormData, nextStep }) => {
  const formik = useFormik({
    initialValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      dob: formData.dob || "",
      state: formData.state || "Telangana",
      houseAddress: formData.houseAddress || "",
      streetAddress: formData.streetAddress || "",
      address: formData.address || "",
      landmark: formData.landmark || "",
      country: "India",
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      dob: Yup.date().required("Date of Birth is required").nullable(),
      state: Yup.string().required("State is required"),
      houseAddress: Yup.string().required("House Address is required"),
      streetAddress: Yup.string().required("Street Address is required"),
      address: Yup.string().required("City/Town/Village/District is required"),
      landmark: Yup.string(),
      country: Yup.string().required("Country is required"),
    }),
    onSubmit: (values) => {
      setFormData(values);
      localStorage.setItem("formData", JSON.stringify(values));
      nextStep();
    },
  });

  useEffect(() => {
    if (!formik.values.country) {
      formik.setFieldValue("country", "India");
    }
  }, []);

  const statesInIndia = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ].sort();

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
        <h2 className="text-3xl mb-10 font-semibold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
          REGISTRATION FORM
        </h2>
        <h2 className="text-2xl font-bold mb-6">Personal Information</h2>

        <form onSubmit={formik.handleSubmit}>
          {/* First Name */}
          <label className="block mb-4">
            First Name:
            <input
              type="text"
              id="firstName"
              name="firstName"
              onChange={formik.handleChange}
              value={formik.values.firstName}
              className={`border ${formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-red-500">{formik.errors.firstName}</p>
            )}
          </label>

          {/* Last Name */}
          <label className="block mb-4">
            Last Name:
            <input
              type="text"
              id="lastName"
              name="lastName"
              onChange={formik.handleChange}
              value={formik.values.lastName}
              className={`border ${formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-red-500">{formik.errors.lastName}</p>
            )}
          </label>

          {/* Date of Birth */}
          <label className="block mb-4">
            Date of Birth:
            <input
              type="date"
              id="dob"
              name="dob"
              onChange={formik.handleChange}
              value={formik.values.dob}
              className={`border ${formik.touched.dob && formik.errors.dob ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.dob && formik.errors.dob && (
              <p className="text-red-500">{formik.errors.dob}</p>
            )}
          </label>

          {/* State */}
          <label className="block mb-4">
            State:
            <select
              id="state"
              name="state"
              value={formik.values.state}
              className={`border ${formik.touched.state && formik.errors.state ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
              onChange={formik.handleChange}
            >
              <option value="">Select State</option>
              {statesInIndia.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {formik.touched.state && formik.errors.state && (
              <p className="text-red-500">{formik.errors.state}</p>
            )}
          </label>

          {/* House Address */}
          <label className="block mb-4">
            House Address:
            <input
              type="text"
              id="houseAddress"
              name="houseAddress"
              onChange={formik.handleChange}
              value={formik.values.houseAddress}
              className={`border ${formik.touched.houseAddress && formik.errors.houseAddress ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.houseAddress && formik.errors.houseAddress && (
              <p className="text-red-500">{formik.errors.houseAddress}</p>
            )}
          </label>

          {/* Street Address */}
          <label className="block mb-4">
            Street Address:
            <input
              type="text"
              id="streetAddress"
              name="streetAddress"
              onChange={formik.handleChange}
              value={formik.values.streetAddress}
              className={`border ${formik.touched.streetAddress && formik.errors.streetAddress ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.streetAddress && formik.errors.streetAddress && (
              <p className="text-red-500">{formik.errors.streetAddress}</p>
            )}
          </label>

          {/* City/Town/Village/District */}
          <label className="block mb-4">
            City/Town/Village/District:
            <input
              type="text"
              id="address"
              name="address"
              onChange={formik.handleChange}
              value={formik.values.address}
              className={`border ${formik.touched.address && formik.errors.address ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-500">{formik.errors.address}</p>
            )}
          </label>

          {/* Landmark (optional) */}
          <label className="block mb-4">
            Landmark (optional):
            <input
              type="text"
              id="landmark"
              name="landmark"
              onChange={formik.handleChange}
              value={formik.values.landmark}
              className={`border ${formik.touched.landmark && formik.errors.landmark ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.landmark && formik.errors.landmark && (
              <p className="text-red-500">{formik.errors.landmark}</p>
            )}
          </label>

          {/* Country */}
          <label className="block mb-4">
            Country:
            <input
              type="text"
              id="country"
              name="country"
              value={formik.values.country} // Use Formik's value
              readOnly // Prevent changing the input
              className={`border ${formik.touched.country && formik.errors.country ? 'border-red-500' : 'border-gray-400'} px-3 py-2 rounded w-full`}
            />
            {formik.touched.country && formik.errors.country && (
              <p className="text-red-500">{formik.errors.country}</p>
            )}
          </label>

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
