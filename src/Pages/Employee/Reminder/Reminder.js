import React, { useState, useEffect,useRef } from "react";
import axios from "axios";
import { message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../NavigationBar/NavigationBar";
import { useFormik } from "formik";
import * as Yup from "yup";
const Reminder = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredClientData, setFilteredClientData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedClients, setSelectedClients] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterOption, setFilterOption] = useState("all");
  const [currentPageClient, setCurrentPageClient] = useState(1);
  const [itemsPerPageClient] = useState(15);
  const [dobFilter, setDobFilter] = useState(false);
  const [filteredClientsData, setFilteredClientsData] = useState([]);
  const defaultTitle = "Happy Birthday";
  const defaultDescription = "Your wish";
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(50);

  const [filteredData, setFilteredData] = useState([]);

  const [BdyData, setBdyData] = useState([]);
  const [birthData, setBirthData] = useState([]);

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


  let isMounted = true;
  let navigate = useNavigate();

  const handleFilterByDob = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const filteredByDob = clients.filter((client) => {
      console.log(client.DOB);
      const clientDob = new Date(client.DOB);
      const clientMonth = clientDob.getMonth() + 1;
      const clientDay = clientDob.getDate();
      return clientMonth === currentMonth && clientDay === currentDay;
    });
    setBdyData(filteredByDob)
    setFilteredClientsData(filteredByDob);
    setDobFilter(!dobFilter);

    if (!dobFilter) {
      console.log("alert")
      setTitle(defaultTitle);
      setDescription(defaultDescription);
    }
    setSelectedClients([]);
    console.log(filteredClientsData);
  };

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
  // const endIndexC = Math.min(startIndexC + itemsPerPageC, filteredClientsData.length);
  // const slicedHistoryC = filteredClientsData.slice(startIndexC, endIndexC);
  // console.log("🚀 ~ Reminder ~ slicedHistoryC:", slicedHistoryC)
 
  // useEffect(() => {
  //   filterClientData();
    
  // }, [clients,searchQuery, filterOption]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/getClients`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClients(response.data);
      } catch (error) {
        console.error("Error fetching clients:", error);
        if (!isMounted && error.response && error.response.status === 500) {
          // If the response status is 401, display an alert and redirect to login page
          alert("Session expired. Please login again.");
          // window.location.href = '/'; // Change the URL accordingly
          navigate("/");
        }
      }
    };

    fetchClients();
    return () => {
      isMounted = false;
    };
  }, []);

  // all record=======================================================

  useEffect(() => {
    filterClientDataAll();
  }, [clients, searchQuery, filterOption]);

  const filterClientDataAll = () => {
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

    setFilteredData(filteredClients);
  };

  const startIndex = (currentPageC - 1) * itemsPerPageC;
  const endIndex = Math.min(startIndex + itemsPerPageC, filteredData.length);
  const slicedHistory = filteredData.slice(startIndex, endIndex);
//============================================================================

const startIndexC = (currentPageC - 1) * itemsPerPageC;
const endIndexC = Math.min(startIndexC + itemsPerPageC, birthData.length);
const slicedHistoryC = birthData.slice(startIndexC, endIndexC);


useEffect(() => {
  filterClientData();
}, [BdyData, searchQuery, filterOption]);

const filterClientData = () => {
  let filteredClients = BdyData.filter((client) => {
    const fullName = `${client.firstname.toLowerCase()} ${client.lastname}.toLowerCase()`;
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

  setBirthData(filteredClients);
};
//==============================================================================

  const paginateClients = (pageNumber) => {
    setCurrentPageClient(pageNumber);
  };
  const handleClientChange = (email) => {
    setSelectedClients((prevSelectedClients) => {
      if (prevSelectedClients.includes(email)) {
        return prevSelectedClients.filter((client) => client !== email);
      } else {
        return [...prevSelectedClients, email];
      }
    });
  };

  const handleSelectAll = () => {
    let selectedEmails = [];
    if (dobFilter) {
      // If filter by DOB is applied, select only clients with birthdays
      selectedEmails = filteredClientsData.map((client) => client.email);
    } else {
      // Otherwise, select all clients
      selectedEmails = clients.map((client) => client.email);
    }
    setSelectedClients(selectedEmails);
  };

  const handleDeselectAll = () => {
    setSelectedClients([]);
  };

  const handleNext = () => {
    if (selectedClients.length > 0) {
      setShowForm(true);
    } else {
      message.info("Please select at least one client.");
    }
  };

  const handleFilter = (filter) => {
    setFilterOption(filter);
  };
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.currentTarget.files);
    const updatedFiles = [...formik.values.files, ...selectedFiles];
    formik.setFieldValue("files", updatedFiles);
  };

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
     
  
      formData.append("selectedClients", JSON.stringify(selectedClients));
  
      // Append each file individually
      values.files.forEach((file) => {
        formData.append("files", file);
      });
  
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/employee/sendreminder`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from server:", response.data);
      message.success("Reminder sent successfully");
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
  const filteredClients = clients.filter(
    (client) =>
      (client.firstname &&
        client.firstname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.lastname &&
        client.lastname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.email &&
        client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const indexOfLastClient = currentPageClient * itemsPerPageClient;
  const indexOfFirstClient = indexOfLastClient - itemsPerPageClient;
  const currentClients = filteredClients.slice(
    indexOfFirstClient,
    indexOfLastClient
  );
  return (
    <div>
      <NavigationBar />
      <hr></hr>
      {!showForm ? (
        <div>
          <div className="container mx-auto p-10">
            <div>
              <p className="font-bold text-3xl text-blue-500 mb-10">
                REMINDERS{" "}
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  className="inline-block rounded px-6 py-3 leading-normal text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>

            <div className="flex flex-wrap mt-4">
              <div className="mb-4 w-full">
                <div className="flex justify-between border border-t-3 border-b-3 border-gray-200 p-5">
                  <div className="ml-5 flex justify-center items-center ">
                    <div className="tabs flex justify-between ">
                      <div
                        className={`tab mr-5 cursor-pointer ${
                          selectedClients.length > 0
                            ? "text-blue-500 font-bold"
                            : "text-gray-500 hover:text-blue-500"
                        }`}
                        onClick={handleSelectAll}
                      >
                        <span
                          className={`tab ${
                            selectedClients.length > 0
                              ? "border-b-2 border-blue-500"
                              : ""
                          }`}
                        >
                          Select All
                        </span>
                      </div>
                      <div
                        className={`tab cursor-pointer ${
                          selectedClients.length === 0
                            ? "text-red-500 font-bold"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                        onClick={handleDeselectAll}
                      >
                        <span
                          className={`tab ${
                            selectedClients.length === 0
                              ? "border-b-2 border-red-500"
                              : ""
                          }`}
                        >
                          Deselect All
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      onClick={handleFilterByDob}
                      className="inline-block rounded px-6 py-3 leading-normal text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {dobFilter ? "Show All" : "Filter by DOB (Today)"}
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Search by name or email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 mr-2"
                  />
                </div>
              </div>

              <table className="min-w-full border  border-gray-300">
                <thead className="">
                  <tr>
                    <th className="py-2 px-4 border-b">Checkbox</th>
                    <th className="py-2 px-4 border-b">First Name</th>
                    <th className="py-2 px-4 border-b">Last Name</th>
                    <th className="py-2 px-4 border-b">Email</th>
                    <th className="py-2 px-4 border-b">Phone Number</th>
                    <th className="py-2 px-4 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dobFilter
                    ? slicedHistoryC.map((client, index) => (
                        <tr
                          key={index}
                          className={(index + 1) % 2 === 0 ? "bg-gray-100" : ""}
                        >
                          <td className="py-2 px-4 flex justify-center items-center border-b">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-blue-600"
                              checked={selectedClients.includes(client.email)}
                              onChange={() => handleClientChange(client.email)}
                            />
                          </td>
                          <td className="py-2 px-4 border-b">
                            {client.firstname}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {client.lastname}
                          </td>
                          <td className="py-2 px-4 border-b">{client.email}</td>
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
                              {client.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    : slicedHistory.map((client, index) => (
                        <tr
                          key={index}
                          className={(index + 1) % 2 === 0 ? "bg-gray-100" : ""}
                        >
                          <td className="py-2 px-4 border-b">
                            <input
                              type="checkbox"
                              className="form-checkbox h-5 w-5 text-blue-600"
                              checked={selectedClients.includes(client.email)}
                              onChange={() => handleClientChange(client.email)}
                            />
                          </td>
                          <td className="py-2 px-4 border-b">
                            {client.firstname}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {client.lastname}
                          </td>
                          <td className="py-2 px-4 border-b">{client.email}</td>
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
                              {client.status}
                            </span>
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
      ) : (
        // </div>
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
          <div className="max-w-2xl w-full bg-white p-8 rounded-md shadow-md mt-8 mb-8">
            <div>
              <h2 className="text-3xl font-semibold text-gray-700 mb-4 text-center">
                Send Reminder
              </h2>
              <form onSubmit={formik.handleSubmit}>
              <div className="mb-6">
                <label
                  className="block text-gray-500 text-lg mb-2"
                  htmlFor="title"
                >
                  Title:
                </label>
                <input
                  className="border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full"
                  id="title"
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
                  className="border border-gray-200 rounded px-4 py-2 focus:outline-none focus:border-blue-300 focus:ring focus:ring-blue-200 w-full h-32"
                  id="description"
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
              <div className="flex justify-center">
                <button
                  className="mr-10 inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.2)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.2)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  onClick={() => setShowForm(false)}
                >
                  Back
                </button>
                <button
                  className="inline-block w-56 rounded px-6 pb-2 pt-2.5 leading-normal text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:from-blue-600 hover:to-blue-800 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:from-blue-600 focus:to-blue-800 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:from-blue-700 active:to-blue-900 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.2)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.2)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.2)]"
                  disabled={formik.isSubmitting || loading}
                  >
                    {loading ? "Loading..." : "Send Reminder"}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminder;
