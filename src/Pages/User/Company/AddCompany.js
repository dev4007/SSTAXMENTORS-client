import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../NavigationBar/NavigationBar";
import { statesInIndia } from "./States";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object().shape({
  companyName: Yup.string()
    .required("Company Name is required")
    .min(2, "Company Name must be at least 2 characters"),
  address: Yup.string().required("Address is required"),
  state: Yup.string().required("State is required"),
  country: Yup.string().required("Country is required"),
  landmark: Yup.string(),
  officeNumber: Yup.string().required("Office Number is required"),
});

function AddCompany() {
  const navigate = useNavigate();
  const [companyDetails, setCompanyDetails] = useState([]);
  const [companyType, setCompanyType] = useState({
    soleProprietorship: false,
    partnershipFirm: false,
    limitedLiabilityPartnerships: false,
    privateLimitedCompany: false,
    publicLimitedCompany: false,
    onePersonCompany: false,
  });
  const [companyTypeFiles, setCompanyTypeFiles] = useState(null);
  const [subInputValues, setSubInputValues] = useState({});
  const [files, setFiles] = useState({});
  const formRef = useRef(null); // Create a ref for the form
  const [loading, setLoading] = useState(false);

  const companyTypeNames = {
    soleProprietorship: "Sole Proprietorship",
    partnershipFirm: "Partnership Firm",
    limitedLiabilityPartnerships: "Limited Liability Partnerships",
    privateLimitedCompany: "Private Limited Company",
    publicLimitedCompany: "Public Limited Company",
    onePersonCompany: "One Person Company",
  };

  const handleCheckboxChange = (key) => {
    setCompanyType((prev) => {
      const newCompanyType = Object.keys(prev).reduce((acc, curr) => {
        acc[curr] = curr === key; // Set selected checkbox to true, others to false
        return acc;
      }, {});
      return newCompanyType;
    });
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const fetchCompanyDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/client/CompanyDetails`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to fetch profile data");
      }
      setCompanyDetails(response.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please login again.");
        navigate("/");
      }
    }
  };

  const handleFileUpload = (mainName, file) => {
    if (!file) return;

    const fileDetails = {
      fileName: file.name,
      name: file.name,
      fileType: file.type,
      fileSize: file.size,
    };

    setSubInputValues((prevValues) => ({
      ...prevValues,
      [mainName]: {
        ...prevValues[mainName],
        file_data: fileDetails,
      },
    }));

    setFiles((prevFiles) => ({
      ...prevFiles,
      [mainName]: file,
    }));
  };

  const handleCompanyTypeFileUpload = (event) => {
    setCompanyTypeFiles(event.target.files);
  };

  const handleInputChange = (mainName, subInput, value) => {
    setSubInputValues((prevValues) => ({
      ...prevValues,
      [mainName]: {
        ...(prevValues[mainName] || {}),
        [subInput]: { value },
      },
    }));
  };



  const handleSubmit = async (values, { resetForm }) => {
    const formData = new FormData();
    formData.append("companyName", values.companyName);
    formData.append("companyType", JSON.stringify(companyType));
    formData.append("address", values.address);
    formData.append("officeNumber", values.officeNumber);
    formData.append("landmark", values.landmark);
    formData.append("country", values.country);
    formData.append("state", values.state);
    formData.append("subInputValues", JSON.stringify(subInputValues));

    // Append files to FormData
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    if (companyTypeFiles) {
      Array.from(companyTypeFiles).forEach((file) => {
        formData.append("companyTypeFiles", file);
      });
    }

    try {
      setLoading(true);

      const authToken = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/company/addcompany`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        message.success("Successfully registered new company");
        resetForm(); // Reset Formik form

        navigate("/user/userdashboard/view-company");
      }
    } catch (error) {
      message.error("Error! Try again later");
      console.error("Error uploading files:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavigationBar />
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
          <h2 className="text-3xl font-bold text-blue-500 mb-10 text-center">
            COMPANY REGISTRATION FORM
          </h2>
          <Formik
            initialValues={{
              companyName: "",
              address: "",
              state: "",
              country: "India",
              landmark: "",
              officeNumber: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            innerRef={formRef}
          >
            {({ setFieldValue, values }) => (
              <Form className="mt-4">
                <div className="mb-4">
                  <label
                    htmlFor="companyName"
                    className="block font-regular text-lg mb-3 text-gray-500"
                  >
                    Company Name:
                  </label>
                  <Field
                    type="text"
                    id="companyName"
                    name="companyName"
                    placeholder="Enter company name"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                  />
                  <ErrorMessage
                    name="companyName"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label className="block font-regular text-lg mb-3 text-gray-500">
                    Company Type:
                  </label>
                  {Object.entries(companyTypeNames).map(
                    ([key, displayName]) => (
                      <div key={key} className="flex items-center mb-2">
                        <Field
                          type="checkbox"
                          id={key}
                          name="companyType"
                          checked={companyType[key]}
                          onChange={() => handleCheckboxChange(key)}
                          className="mr-2"
                        />
                        <label htmlFor={key} className="text-gray-700">
                          {displayName}
                        </label>
                      </div>
                    )
                  )}
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="companyTypeFiles"
                    className="block mb-3 font-regular text-lg text-gray-500"
                  >
                    Upload Company Type Documents:
                  </label>
                  <input
                    type="file"
                    id="companyTypeFiles"
                    onChange={handleCompanyTypeFileUpload}
                    multiple
                    className="border border-gray-300 px-3 py-2 rounded w-full"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="address"
                    className="block mb-3 font-regular text-lg text-gray-500"
                  >
                   City/Town/Village/District:
                  </label>
                  <Field
                    type="text"
                    id="address"
                    name="address"
                    placeholder="Enter street name"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                  />
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-4">
                    State:
                    <Field as="select" name="state" className="border border-gray-400 px-3 py-2 rounded w-full">
                      <option value="">Select State</option>
                      {statesInIndia.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Field>
                  </label>
                  <ErrorMessage
                    name="state"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="country"
                    className="block mb-3 font-regular text-lg text-gray-500"
                  >
                    Country:
                  </label>
                  <Field
                    type="text"
                    id="country"
                    name="country"
                    placeholder="Enter country"
                    readOnly // Makes the field read-only
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                  />
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="landmark"
                    className="block mb-3 font-regular text-lg text-gray-500"
                  >
                    Landmark:
                  </label>
                  <Field
                    type="text"
                    id="landmark"
                    name="landmark"
                    placeholder="Enter landmark"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="officeNumber"
                    className="block mb-3 font-regular text-lg text-gray-500"
                  >
                    Office Number:
                  </label>
                  <Field
                    type="text"
                    id="officeNumber"
                    name="officeNumber"
                    placeholder="Enter office number"
                    className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                  />
                  <ErrorMessage
                    name="officeNumber"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="mb-4">
                  {companyDetails.map((mainName) => (
                    <div key={mainName._id} className="mb-2">
                      <p className="font-normal text-lg mb-5 text-gray-500">
                        {mainName.mainName}:
                      </p>
                      {mainName.subInputs.map((subInput, index) => (
                        <div key={index} className="flex mb-2">
                          <div className="max-w-24 ml-6">{subInput}: </div>
                          {subInput.toLowerCase() === "image" ? (
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(
                                  mainName.mainName,
                                  e.target.files[0]
                                )
                              }
                              className="border w-9/12 border-gray-300 px-3 py-2 ml-auto flex-shrink-0 rounded focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200"
                            />
                          ) : (
                            <input
                              type="text"
                              value={
                                subInputValues[mainName.mainName]?.[subInput]
                                  ?.value || ""
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  mainName.mainName,
                                  subInput,
                                  e.target.value
                                )
                              }
                              className="border w-9/12 border-gray-300 px-3 py-2 ml-auto flex-shrink-0 rounded focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200"
                              placeholder={`Enter ${subInput}`}
                            />
                          )}
                        </div>
                      ))}

                      <div className="flex mb-2">
                        <div className="max-w-24 ml-6">Upload File:</div>
                        <input
                          type="file"
                          onChange={(e) =>
                            handleFileUpload(
                              mainName.mainName,
                              e.target.files[0]
                            )
                          }
                          className="border w-9/12 border-gray-300 px-3 py-2 ml-auto flex-shrink-0 rounded focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center items-center mt-10 mb-5">
                  <button
                    type="submit"
                    className="flex justify-center items-center w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  >
                    {loading ? "Loading..." : "Submit"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default AddCompany;
