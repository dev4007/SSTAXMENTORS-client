import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from "../NavigationBar/NavigationBar";
import { useNavigate } from "react-router-dom";
import { statesInIndia } from "../../User/Company/States";
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

const AddCompany = () => {
  const [clients, setClients] = useState([]);

  const [filteredClientData, setFilteredClientData] = useState([]);

  const [selectedClient, setSelectedClient] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(50);
//   let isMounted = true;
  let navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [companyDetails, setCompanyDetails] = useState([]);
  const [companyType, setCompanyType] = useState({
    soleProprietorship: true,
    partnershipFirm: false,
    limitedLiabilityPartnerships: false,
    privateLimitedCompany: false,
    publicLimitedCompany: false,
    onePersonCompany: false,
  });
 

  const companyTypeNames = {
    soleProprietorship: " Sole Proprietorship",
    partnershipFirm: " Partnership Firm",
    limitedLiabilityPartnerships: " Limited Liability Partnerships",
    privateLimitedCompany: " Private Limited Company",
    publicLimitedCompany: " Public Limited Company",
    onePersonCompany: " One Person Company",
  };
  const [companyTypeFiles, setCompanyTypeFiles] = useState(null);
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [landmark, setLandmark] = useState("");
  const [officeNumber, setOfficeNumber] = useState("");
  const [subInputValues, setSubInputValues] = useState({});
  const [files, setFiles] = useState({});
  const formRef = useRef(null); // Create a ref for the form
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = (key) => {
    setCompanyType((prev) => {
      // Reset all to false and set the selected one to true
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

      if (err.response && err.response.status === 500) {
        // If the response status is 401, display an alert and redirect to login page
        alert("Session expired. Please login again.");
        // window.location.href = '/'; // Change the URL accordingly
        navigate("/");
      }
    }
  };

  const handleFileUpload = (mainName, file) => {
    if (!file) return;

    // Create an object to store file details
    const fileDetails = {
      fileName: file.name, // Store the original file name
      name: file.name, // Store it as a custom key as well
      fileType: file.type, // Store the file type
      fileSize: file.size, // Store the file size
    };

    // Update your state with the file details
    setSubInputValues((prevValues) => ({
      ...prevValues,
      [mainName]: {
        ...prevValues[mainName],
        file_data: fileDetails, // Use file.name or a custom key for unique identification
      },
    }));

    setFiles((prevFiles) => ({
      ...prevFiles,
      [mainName]: file,
    }));
  };

  const handleCheckboxReset = () => {
    const resetCompanyType = Object.keys(companyType).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {});
    setCompanyType(resetCompanyType);
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

  const handleOfficeNumberChange = (event) => {
    setOfficeNumber(event.target.value);
  };

  const handleStateChange = (event) => {
    setState(event.target.value);
  };
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };
  const handleLandmarkChange = (event) => {
    setLandmark(event.target.value);
  };
  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handleReset = () => {
    setCompanyName("");

    setAddress({});
    setOfficeNumber("");
    setSubInputValues([]);
    setCompanyTypeFiles(null);

    setFiles({});
  };

  const handleSubmit = async (values, { resetForm }) => {
    const formData = new FormData();
    formData.append("companyName", values.companyName);
    formData.append("email", selectedClient);
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
      setLoading(true); // Start loading state

      const authToken = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/client/addcompany`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Pass auth token for authorization
            "Content-Type": "multipart/form-data", // Set the content type for file uploads
          },
        }
      );

      if (response.status === 200) {
        // Check for successful response
        message.success("Successfully registered new company");
        handleCheckboxReset(); // Reset the checkbox state
        navigate("/employee/employeedashboard/view-client"); // Navigate to another page
      }
    } catch (error) {
      message.error("Error! Try again later");
      console.error("Error uploading files:", error); // Log error details for debugging
    } finally {
      setLoading(false); // End loading state
    }
  };

  const [currentPageClient, setCurrentPageClient] = useState(1);
  const [itemsPerPageClient] = useState(15); // You can change this value as needed

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const clientsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/client/getClients`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClients(clientsResponse.data);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalPagesC = Math.ceil(clients.length / itemsPerPageC);

  const paginateC = (pageNumber) => {
    setCurrentPageC(pageNumber);
  };

  const renderPaginationButtonsC = () => {
    const buttons = [];
    const maxButtons = 3; // Number of buttons to display
    const maxPages = Math.min(totalPagesC, maxButtons);
    const middleButton = Math.ceil(maxPages / 2);
    let startPage = Math.max(1, currentPageC - middleButton + 1);
    let endPage = Math.min(totalPagesC, startPage + maxPages - 1);

    if (currentPageC > middleButton && totalPagesC > maxButtons) {
      startPage = Math.min(currentPageC - 1, totalPagesC - maxButtons + 1);
      endPage = Math.min(startPage + maxButtons - 1, totalPagesC);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <li
          key={i}
          className={`page-item ${currentPageC === i ? "active" : ""}`}
        >
          <button
            onClick={() => paginateC(i)}
            className={`page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded ${
              currentPageC === i ? "current-page" : ""
            }`}
          >
            {i}
          </button>
        </li>
      );
    }

    if (totalPagesC > maxButtons && endPage < totalPagesC) {
      buttons.push(
        <li key="ellipsis" className="page-item disabled">
          <span className="page-link bg-blue-500 text-white font-semibold py-2 px-4 rounded">
            ...
          </span>
        </li>
      );
      buttons.push(
        <li key={totalPagesC} className="page-item">
          <button
            onClick={() => paginateC(totalPagesC)}
            className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            {totalPagesC}
          </button>
        </li>
      );
    }

    return buttons;
  };

  useEffect(() => {
    filterClientData();
  }, [clients, searchQuery, filterOption]); // Updated dependencies

  const filterClientData = () => {
    let filteredClients = clients.filter((client) => {
      const fullName = `${client.firstname} ${client.lastname}.toLowerCase()`;
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    if (filterOption !== "all") {
      filteredClients = filteredClients.filter(
        (client) => client.status === filterOption
      );
    }

    // if (selectedOption) {
    //   filteredClients = filteredClients.filter(client => client.typeOfC.toLowerCase() === selectedOption);
    // }

    setFilteredClientData(filteredClients);
  };


  const startIndexC = (currentPageC - 1) * itemsPerPageC;
  const endIndexC = Math.min(startIndexC + itemsPerPageC, filteredClientData.length);
  const slicedHistoryC = filteredClientData.slice(startIndexC, endIndexC);

  const paginateClients = (pageNumber) => setCurrentPageClient(pageNumber);

  const indexOfLastClient = currentPageClient * itemsPerPageClient;
  const indexOfFirstClient = indexOfLastClient - itemsPerPageClient;
  const currentClients = clients.slice(indexOfFirstClient, indexOfLastClient);

  const handleViewClient = async (client) => {
    setSelectedClient(client.email);
    setShowForm(true);
   
  };

  return (
    <div className="">
      <div className="">
        {showForm ? (
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
            country: "",
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
                    Address:
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
        ) : (
          <div>
            <NavigationBar />
            <hr></hr>
            <div className="container mx-auto p-5 md:p-10">
              <p className="font-bold text-3xl  text-blue-500 mb-10">
                Add Company{" "}
              </p>
              <div className="flex flex-wrap mt-2 md:mt-4">
                <div className="mb-2 md:mb-4 w-full">
                  <div className="flex flex-col md:flex-row justify-between border border-t-3 border-b-3 border-gray-200 p-3 md:p-5">
                    <div className="flex flex-wrap justify-center md:justify-start">
                      <div
                        className={`cursor-pointer ${
                          filterOption === "all"
                            ? "text-blue-500 font-bold"
                            : "text-gray-500 hover:text-blue-500"
                        } flex items-center mb-2 mx-3 md:mb-0 md:mr-10`}
                        onClick={() => setFilterOption("all")}
                      >
                        <span
                          className={`mr-2 ${
                            filterOption === "all"
                              ? "border-b-2 border-blue-500"
                              : ""
                          }`}
                        >
                          All
                        </span>
                      </div>
                      <div
                        className={`cursor-pointer ${
                          filterOption === "inactive"
                            ? "text-red-500 font-bold"
                            : "text-gray-500 hover:text-red-500"
                        } flex items-center mb-2 mx-3  md:mb-0 md:mx-10`}
                        onClick={() => setFilterOption("inactive")}
                      >
                        <span
                          className={`mr-2 ${
                            filterOption === "inactive"
                              ? "border-b-2 border-red-500"
                              : ""
                          }`}
                        >
                          Inactive
                        </span>
                      </div>
                      <div
                        className={`cursor-pointer ${
                          filterOption === "active"
                            ? "text-green-500 font-bold"
                            : "text-gray-500 hover:text-green-500"
                        } flex items-center mb-2 mx-3  md:mb-0 md:mx-10`}
                        onClick={() => setFilterOption("active")}
                      >
                        <span
                          className={`mr-2 ${
                            filterOption === "active"
                              ? "border-b-2 border-green-500"
                              : ""
                          }`}
                        >
                          Active
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 mt-2 md:mt-0 w-full md:w-auto"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 border-b">S No</th>
                          <th className="py-2 px-4 border-b">First Name</th>
                          <th className="py-2 px-4 border-b">Last Name</th>
                          <th className="py-2 px-4 border-b">Email</th>
                          <th className="py-2 px-4 border-b">Phone Number</th>
                          <th className="py-2 px-4 border-b">Status</th>
                          <th className="py-2 px-4 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {slicedHistoryC.map((client, index) => (
                          <tr
                            key={index}
                            className={
                              (index + 1) % 2 === 0 ? "bg-gray-100" : ""
                            }
                          >
                            <td className="py-2 px-4 border-b">
                              {filteredClientData.length - startIndexC - index}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {client.firstname}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {client.lastname}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {client.email}
                            </td>
                            <td className="py-2 px-4 border-b">
                              {client.Phone_number}
                            </td>
                            <td className="py-2 px-4 border-b">
                              <span
                                className={
                                  client.status === "active"
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {client.status === "active"
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>
                            <td className="py-2 px-4 border-b">
                              {client.status === "active" && (
                                <button
                                  onClick={() => handleViewClient(client)}
                                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                >
                                  Select
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-center items-center my-4">
                    <ul className="pagination flex justify-center items-center my-4">
                      <li
                        className={`page-item ${
                          currentPageC === 1 ? "disabled" : ""
                        }`}
                      >
                        <button
                          onClick={() => paginateC(currentPageC - 1)}
                          className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                        >
                          <FontAwesomeIcon icon={faAngleLeft} />
                        </button>
                      </li>
                      {renderPaginationButtonsC()}
                      <li
                        className={`page-item ${
                          currentPageC === totalPagesC ? "disabled" : ""
                        }`}
                      >
                        <button
                          onClick={() => paginateC(currentPageC + 1)}
                          className="page-link bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                        >
                          <FontAwesomeIcon icon={faAngleRight} />
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AddCompany;
