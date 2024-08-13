import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from "../../NavigationBar/NavigationBar";
import { useFormik } from "formik";
import * as Yup from "yup";

const SendGSTreturns = () => {
  const [clients, setClients] = useState([]);
  const [filteredClientData, setFilteredClientData] = useState([]);

  const [selectedClient, setSelectedClient] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [gstReturnsFields, setGSTReturnsFields] = useState([]);
  const [selectedReturnType, setSelectedReturnType] = useState("");
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [currentPageClient, setCurrentPageClient] = useState(1);
  const [itemsPerPageClient] = useState(15);
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(50);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch clients
        const clientsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/client/getClients`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClients(clientsResponse.data);

        // Fetch GST Returns Fields
        const gstReturnsFieldsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/settings/gstreturns/getGSTReturnsFields`
        );
        setGSTReturnsFields(gstReturnsFieldsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleClientChange = async (event) => {
    setSelectedClient(event.target.value);
    try {
      const token = localStorage.getItem("token");

      // Fetch companies
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/client/getCompanyNamesOfClient`,
        {
          headers: {
            Authorization: ` Bearer ${token}`,
          },
          params: {
            clientEmail: event.target.value,
          },
        }
      );
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching company names:", error);
    }
  };

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  const handleReturnTypeChange = (event) => {
    setSelectedReturnType(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleSubmit = async (values, { resetForm }) => {
    setIsLoading(true);
    const dataForBackend = new FormData();
    dataForBackend.append("selectedClient", selectedClient); // Adjusted key name
    dataForBackend.append("selectedCompany", values.company); // Adjusted key name
    dataForBackend.append("selectedReturnType", values.returnType);
    dataForBackend.append("description", values.description);
    dataForBackend.append("remarks", values.remarks);
    dataForBackend.append("file", values.file);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/document/gstreturns/sendGSTreturns`,
        dataForBackend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Backend Response:", response.data);

      resetForm(); // Reset the form fields
      setIsLoading(false);
      setShowForm(false); // Hide the form after submission
      message.success("GST Returns submitted successfully!");
    } catch (error) {
      console.error("Error sending data to the backend:", error);
      setIsLoading(false);
      message.error("Failed to submit GST Returns. Please try again later.");
    }
  };

  const formik = useFormik({
    initialValues: {
      company: "",
      returnType: "",
      description: "",
      remarks: "",
      file: null,
    },
    validationSchema: Yup.object({
      company: Yup.string().required("Company is required"),
      returnType: Yup.string().required("Type of GST Returns is required"),
      description: Yup.string().required("Description is required"),
      remarks: Yup.string().required("Remarks are required"),
      file: Yup.mixed().required("File upload is required"),
    }),
    onSubmit: handleSubmit, // Pass handleSubmit here
  });

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

    setFilteredClientData(filteredClients);
  };

  const startIndexC = (currentPageC - 1) * itemsPerPageC;
  const endIndexC = Math.min(
    startIndexC + itemsPerPageC,
    filteredClientData.length
  );
  const slicedHistoryC = filteredClientData.slice(startIndexC, endIndexC);

  const handleBackButtonClick = () => {
    setShowForm(false); // Set showForm state to false to hide the form
  };

  const handleViewClient = async (client) => {
    setSelectedClient(client.email);
    try {
      const token = localStorage.getItem("token");

      // Fetch companies
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/client/getCompanyNamesOfClient`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            clientEmail: client.email,
          },
        }
      );
      setCompanies(response.data);

      // Show the form
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching company names:", error);
    }
  };

  // const filteredClientData = clients
  //   .filter((client) => {
  //     if (filterOption === "all") {
  //       return true;
  //     }
  //     return client.status === filterOption;
  //   })
  //   .filter((client) => {
  //     const fullName = `${client.firstname} ${client.lastname}`.toLowerCase();
  //     return (
  //       fullName.includes(searchQuery.toLowerCase()) ||
  //       client.email.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   });

  // const indexOfLastClient = currentPageClient * itemsPerPageClient;
  // const indexOfFirstClient = indexOfLastClient - itemsPerPageClient;
  // const currentClientData = filteredClientData.slice(
  //   indexOfFirstClient,
  //   indexOfLastClient
  // );

  const paginateClients = (pageNumber) => setCurrentPageClient(pageNumber);

  return (
    <div className="">
      <div className="">
        {showForm ? (
          <div>
            <NavigationBar />
            {/* <hr></hr> */}
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
              <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
                <p className="font-bold text-3xl flex justify-center text-blue-500 mb-10">
                  GST RETURNS FORM
                </p>

                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-6">
                    <label
                      className="block text-gray-500 text-lg mb-2"
                      htmlFor="company"
                    >
                      Select Company:
                    </label>
                    <select
                      id="company"
                      {...formik.getFieldProps("company")}
                      className="border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                    >
                      <option value="">Select Company</option>
                      {companies.map((company) => (
                        <option key={company} value={company}>
                          {company}
                        </option>
                      ))}
                    </select>
                    {formik.touched.company && formik.errors.company ? (
                      <div className="text-red-500 text-sm">
                        {formik.errors.company}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-500 text-lg mb-2">
                      Type of GST Returns:
                    </label>
                    {gstReturnsFields
                      .filter((returnType) => returnType.status === "active")
                      .map((field) => (
                        <div key={field._id}>
                          <input
                            type="radio"
                            id={`returnType_${field.name}`}
                            name="returnType"
                            value={field.name}
                            checked={formik.values.returnType === field.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                          />
                          <label
                            htmlFor={`returnType_${field.name}`}
                            className="ml-2 mr-4"
                          >
                            {field.name}
                          </label>
                        </div>
                      ))}
                    {formik.touched.returnType && formik.errors.returnType ? (
                      <div className="text-red-500 text-sm">
                        {formik.errors.returnType}
                      </div>
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
                      id="description"
                      {...formik.getFieldProps("description")}
                      placeholder="Enter description"
                      className="border border-gray-200 rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36"
                      style={{ width: "100%" }}
                    />
                    {formik.touched.description && formik.errors.description ? (
                      <div className="text-red-500 text-sm">
                        {formik.errors.description}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-6">
                    <label
                      className="block text-gray-500 text-lg mb-2"
                      htmlFor="remarks"
                    >
                      Remarks:
                    </label>
                    <textarea
                      id="remarks"
                      {...formik.getFieldProps("remarks")}
                      placeholder="Enter remarks"
                      className="border border-gray-200 rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36"
                      style={{ width: "100%" }}
                    />
                    {formik.touched.remarks && formik.errors.remarks ? (
                      <div className="text-red-500 text-sm">
                        {formik.errors.remarks}
                      </div>
                    ) : null}
                  </div>

                  <div className="mb-6">
                    <label
                      className="block text-gray-500 text-lg mb-2"
                      htmlFor="file"
                    >
                      Upload File:
                    </label>
                    <input
                      type="file"
                      id="file"
                      name="file"
                      onChange={(event) => {
                        formik.setFieldValue(
                          "file",
                          event.currentTarget.files[0]
                        );
                      }}
                      className="border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                    />
                    {formik.touched.file && formik.errors.file ? (
                      <div className="text-red-500 text-sm">
                        {formik.errors.file}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex justify-center items-center mt-12 space-x-4">
                    <button
                      type="button"
                      className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                      onClick={handleBackButtonClick}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={formik.isSubmitting}
                      className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                    >
                      {formik.isSubmitting ? (
                        <span>Loading...</span> // You can also use a spinner icon here
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <NavigationBar />
            <hr></hr>
            <div className="container mx-auto p-5 md:p-10">
              <p className="font-bold text-3xl  text-blue-500 mb-10">
                SEND GST RETURNS
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
                                  : "InActive"}
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
export default SendGSTreturns;
