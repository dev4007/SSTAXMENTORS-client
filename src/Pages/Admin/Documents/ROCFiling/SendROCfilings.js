import React, { useState, useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from "../../NavigationBar/NavigationBar";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from "react-router-dom";
const SendROCfilings = () => {
  const [clients, setClients] = useState([]);
  const [filteredClientData, setFilteredClientData] = useState([]);

  const [selectedClient, setSelectedClient] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [rocFields, setROCFields] = useState([]);
  const [selectedROCField, setSelectedROCField] = useState("");
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(50);
  const navigate = useNavigate()

  // Pagination state
  const [currentPageClient, setCurrentPageClient] = useState(1);
  const [itemsPerPageClient] = useState(15);

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

        // Fetch ROC Filings Fields
        const rocFieldsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/settings/rocfilings/ROCfilingsfields`
        );
        setROCFields(rocFieldsResponse.data);
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

  // const startIndexC = (currentPageC - 1) * itemsPerPageC;
  // const endIndexC = Math.min(startIndexC + itemsPerPageC, clients.length);
  // const slicedHistoryC = clients.slice(startIndexC, endIndexC);

  // // Pagination logic
  // const indexOfLastClient = currentPageClient * itemsPerPageClient;
  // const indexOfFirstClient = indexOfLastClient - itemsPerPageClient;
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
  // const currentClientData = filteredClientData.slice(
  //   indexOfFirstClient,
  //   indexOfLastClient
  // );


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
  const endIndexC = Math.min(startIndexC + itemsPerPageC, filteredClientData.length);
  const slicedHistoryC = filteredClientData.slice(startIndexC, endIndexC);
  // Pagination click handler
  const paginateClients = (pageNumber) => {
    setCurrentPageClient(pageNumber);
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

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  const handleROCFieldChange = (event) => {
    setSelectedROCField(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleRemarksChange = (event) => {
    setRemarks(event.target.value);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (values) => {
      setIsLoading(true);
      const dataForBackend = new FormData();
      dataForBackend.append("clientEmail", selectedClient); // Ensure selectedClient is defined in your scope
      dataForBackend.append("company", values.company);
      dataForBackend.append("rocFieldName", values.rocField);
      dataForBackend.append("description", values.description);
      dataForBackend.append("remarks", values.remarks);
      dataForBackend.append("file", values.file);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/admin/document/rocfilings/sendNewROCfilings`,
          dataForBackend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        message.success("Submission successful");
        console.log("Backend Response:", response.data);

        // Reset the form after successful submission
        formik.resetForm();
        setShowForm(false); // Hide the form after submission
        navigate('/admin/admindashboard/viewrocfilingsa')
      } catch (error) {
        console.error("Error sending data to the backend:", error);
        message.error("Submission failed");
      } finally {
        setIsLoading(false);
      }
    }


  const formik = useFormik({
    initialValues: {
      company: '',
      rocField: '',
      description: '',
      remarks: '',
      file: null,
    },
    validationSchema: Yup.object({
      company: Yup.string().required('Company is required'),
      rocField: Yup.string().required('ROC Field is required'),
      description: Yup.string().required('Description is required').max(500, 'Description cannot exceed 500 characters'),
      remarks: Yup.string().required('Remarks is required').max(300, 'Remarks cannot exceed 300 characters'),
      file: Yup.mixed().required('A file is required'),
    }),
    onSubmit: handleSubmit, // Use the updated handleSubmit here
  });


  const handleBackButtonClick = () => {
    setShowForm(false); // Set showForm state to false to hide the form
  };

  return (
    <div className="">
      <div className="">
        {showForm ? (
          <div>
            <NavigationBar />
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
        <p className="font-bold text-3xl flex justify-center text-blue-500 mb-10">
          ROC FILINGS FORM{" "}
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-500 text-lg mb-2" htmlFor="company">
              Select Company:
            </label>
            <select
              id="company"
              value={formik.values.company}
              onChange={formik.handleChange}
              className={`border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full ${formik.errors.company ? 'border-red-500' : ''}`}
            >
              <option value="">Select Company</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            {formik.errors.company ? <p className="text-red-500">{formik.errors.company}</p> : null}
          </div>

          <div className="mb-6">
            <label className="block text-gray-500 text-lg mb-2">
              Select ROC Filings Field:
            </label>
            {rocFields && rocFields.length > 0 ? (
              rocFields
                .filter((returnType) => returnType.status === "active")
                .map((rocField) => (
                  <div key={rocField.fieldName}>
                    <input
                      type="radio"
                      id={rocField.fieldName}
                      name="rocField"
                      value={rocField.fieldName}
                      checked={formik.values.rocField === rocField.fieldName}
                      onChange={formik.handleChange}
                      className="mr-2"
                    />
                    <label htmlFor={rocField.fieldName} className="ml-2 mr-4">
                      {rocField.fieldName}
                    </label>
                  </div>
                ))
            ) : (
              <p>No ROC filings fields available</p>
            )}
            {formik.errors.rocField ? <p className="text-red-500">{formik.errors.rocField}</p> : null}
          </div>

          <div className="mb-6">
            <label className="block text-gray-500 text-lg mb-2" htmlFor="description">
              Description:
            </label>
            <textarea
              id="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              placeholder="Enter description"
              className={`border border-gray-200 rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36 ${formik.errors.description ? 'border-red-500' : ''}`}
            />
            {formik.errors.description ? <p className="text-red-500">{formik.errors.description}</p> : null}
          </div>

          <div className="mb-6">
            <label className="block text-gray-500 text-lg mb-2" htmlFor="remarks">
              Remarks:
            </label>
            <textarea
              id="remarks"
              value={formik.values.remarks}
              onChange={formik.handleChange}
              placeholder="Enter remarks"
              className={`border border-gray-200 rounded px-4 py-2 resize-y focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-36 ${formik.errors.remarks ? 'border-red-500' : ''}`}
            />
            {formik.errors.remarks ? <p className="text-red-500">{formik.errors.remarks}</p> : null}
          </div>

          <div className="mb-6">
            <label className="block text-gray-500 text-lg mb-2" htmlFor="file">
              Upload File:
            </label>
            <input
              type="file"
              id="file"
              onChange={(event) => {
                formik.setFieldValue('file', event.currentTarget.files[0]);
              }}
              className={`border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full ${formik.errors.file ? 'border-red-500' : ''}`}
            />
            {formik.errors.file ? <p className="text-red-500">{formik.errors.file}</p> : null}
          </div>

          <div className="flex justify-center items-center mt-12 space-x-4">
            {/* Back button */}
            <button
              className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800"
              type="button"
              onClick={handleBackButtonClick} // Call handleBackButtonClick function on click
            >
              Back
            </button>
            {/* Submit button */}
            <button
              className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800"
              type="submit"
            >
              {isLoading ? "Loading..." : "Submit"}
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
                SEND NEW ROC FILING{" "}
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

export default SendROCfilings;
