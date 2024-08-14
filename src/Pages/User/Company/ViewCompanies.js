import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { message, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from "../NavigationBar/NavigationBar";

const Modal = ({
  showModal,
  closeModal,
  handleConfirmDelete,
  modalContent,
}) => {
  return (
    showModal && (
      <div className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen  bg-gray-100">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="relative max-w-lg mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-300">
              <h3 className="text-xl font-semibold">Delete Confirmation</h3>
              <button
                className="text-gray-700 hover:text-black transition ease-in-out duration-150"
                onClick={closeModal}
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M17.414 6.586a2 2 0 0 0-2.828 0L12 9.172 9.414 6.586a2 2 0 0 0-2.828 2.828L9.172 12l-2.586 2.586a2 2 0 1 0 2.828 2.828L12 14.828l2.586 2.586a2 2 0 1 0 2.828-2.828L14.828 12l2.586-2.586a2 2 0 0 0 0-2.828z"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="p-5">
              <p className="text-gray-700">
                Are you sure you want to delete
                <span className="font-semibold">
                  &nbsp;{modalContent?.companyName}
                </span>
                <span>?</span>
              </p>
            </div>
            <div className="flex justify-end p-5 border-t border-gray-300">
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded mr-2"
                type="button"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                type="button"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

const ViewCompanies = () => {
  let isMounted = true;
  let navigate = useNavigate();
  const [companyDetails, setCompanyDetails] = useState([]);
  const [showMoreMap, setShowMoreMap] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(10);

  useEffect(() => {
    fetchCompanyDetails();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchCompanyDetails = async () => {
    isMounted = true;
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/company/getCompanyDetails`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to fetch profile data");
      }
      const initialShowMoreMap = {};
      response.data.forEach((company) => {
        initialShowMoreMap[company._id] = false;
      });
      setShowMoreMap(initialShowMoreMap);
      setCompanyDetails(response.data);
    } catch (error) {
      console.error("Error fetching company details:", error);

      if (isMounted && error.response && error.response.status === 500) {
        alert("Session expired. Please login again.");
        navigate("/");
      }
    }
  };

  const toggleShowMore = (companyId) => {
    setShowMoreMap((prevState) => ({
      ...prevState,
      [companyId]: !prevState[companyId],
    }));
  };

  const handlePreview = async (filePath) => {
    // Accept the full path as an argument
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/company/previewCompanyFile/${filePath}`, // Use filePath directly
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );
      console.log("🚀 ~ handlePreview ~ response:", response);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url); // Open in a new tab for preview
    } catch (error) {
      console.error("Error previewing file:", error);
    }
  };

  // const handlePreview = (fileName) => {
  //   const filePath = `${fileName}`; // Adjust the path accordingly

  //   // Open the file in a new tab or window
  //   window.open(filePath, '_blank');
  // };

  const handleDownload = async (filename) => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/company/downloadCompanyFile/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    setModalContent({ companyId, companyName });
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/user/company/deletecompany/${modalContent.companyId}`,

        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      fetchCompanyDetails();
      message.success("Company deleted successfully");
    } catch (error) {
      console.error("Error deleting company:", error);
      setAlertMessage("Error deleting company");
      message.error("Error deleting company");
    } finally {
      setShowModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const totalPagesC = Math.ceil(companyDetails.length / itemsPerPageC);

  const paginateC = (pageNumber) => {
    setCurrentPageC(pageNumber);
  };

  const renderPaginationButtonsC = () => {
    const buttons = [];
    const maxButtons = 3;
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

  const startIndexC = (currentPageC - 1) * itemsPerPageC;
  const endIndexC = Math.min(
    startIndexC + itemsPerPageC,
    companyDetails.length
  );
  const slicedHistoryC = companyDetails.slice(startIndexC, endIndexC);
  console.log("🚀 ~ ViewCompanies ~ slicedHistoryC:", slicedHistoryC);

  const downloadFile = async (file) => {
    console.log("🚀 ~ downloadFile ~ file:", file);
    const fileUrl = `${process.env.REACT_APP_API_URL}/${file.filePath}`;
    try {
      // Fetch the file from the URL
      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream", // Generic content type for binary data
        },
      });

      // Check if the response is ok
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      // Convert the response to a Blob
      const blob = await response.blob();
      // Create a Blob URL
      const url = window.URL.createObjectURL(blob);
      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.fileName); // Set the file name for download
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Remove the link from the document
      // Clean up the Blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderFilePreview = (file) => {
    const isImage = file.fileType.startsWith("image/");
    const isPDF = file.fileType === "application/pdf";

    const filePath = `${process.env.REACT_APP_API_URL}/${file.filePath}`;
    //   // Open the file in a new tab or window

    if (isImage) {
      window.open(filePath, "_blank");
    } else if (isPDF) {
      window.open(filePath, "_blank");
    }

    return <p>Preview not available for this file type.</p>;
  };

  const companyDownloadFile = async (file) => {
    const fileUrl = `${process.env.REACT_APP_API_URL}/${file.name}`;
    try {
      // Fetch the file from the URL
      const response = await fetch(fileUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream", // Generic content type for binary data
        },
      });

      // Check if the response is ok
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      // Convert the response to a Blob
      const blob = await response.blob();
      // Create a Blob URL
      const url = window.URL.createObjectURL(blob);
      // Create a download link
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.filename); // Set the file name for download
      document.body.appendChild(link);
      link.click(); // Trigger the download
      document.body.removeChild(link); // Remove the link from the document
      // Clean up the Blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const companyRenderFilePreview = (file) => {
    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf";

    const filePath = `${process.env.REACT_APP_API_URL}/${file.name}`;
    //   // Open the file in a new tab or window

    if (isImage) {
      window.open(filePath, "_blank");
    } else if (isPDF) {
      window.open(filePath, "_blank");
    }

    return <p>Preview not available for this file type.</p>;
  };

  return (
    <div className="bg-gray-100">
      <NavigationBar />
      <div className="max-w-5xl mx-auto mt-8 p-4 ">
        <h2 className="text-3xl font-bold text-blue-500 mb-10 ml-8">
          MY COMPANIES
        </h2>
        {slicedHistoryC.map((company) => (
          <div
            key={company._id}
            className="bg-white p-6 mb-8 rounded-md shadow-lg relative"
          >
            <h3 className="text-2xl font-bold mb-4 text-gray-600">
              {company.companyName || "Company Name Not Specified"}
              <FontAwesomeIcon
                icon={faTrash}
                className="absolute top-8 right-8 text-red-500 cursor-pointer"
                onClick={() =>
                  handleDeleteCompany(company._id, company.companyName)
                }
              />
            </h3>
            <hr className="my-4 border-gray-100 border-b-2" />
            <div className="flex mb-2">
              <span className="text-gray-500 font-semibold text-md mr-2">
                Company Type:
              </span>
              <span>{getCompanyType(company.companyType)}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-gray-500 font-semibold text-md mr-2">
                Address:
              </span>
              <span>{company.address}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-gray-500 font-semibold text-md mr-2">
                State:
              </span>
              <span>{company.state}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-gray-500 font-semibold text-md mr-2">
                Country:
              </span>
              <span>{company.country}</span>
            </div>
            <div className="flex mb-2">
              <span className="text-gray-500 font-semibold text-md mr-2">
                Landmark:
              </span>

              <span>
                {company.landmark ? company.landmark : "Not Available"}
              </span>
            </div>
            <div className="flex mb-2">
              <span className="text-gray-500 font-semibold text-md mr-2">
                Office Number:
              </span>
              <span>{company.officeNumber || "Not Specified"}</span>
            </div>
            <div>
            {Object.keys(company.subInputValues).map((key) => {
              const fileData = company.subInputValues[key].file_data;
              return (
                <div key={key} className="flex items-center space-x-2">
                  <span className="text-gray-500 font-semibold text-md">
                    {key} Number: {company.subInputValues[key][`${key} Number`]?.value}
                  </span>
                  {fileData ? (
                    <>
                      <button
                        onClick={() => downloadFile(fileData)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                      >
                        Download
                      </button>
                      <button
                        className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                        onClick={() => renderFilePreview(fileData)}
                      >
                        Preview
                      </button>
                    </>
                  ) : null}
                </div>
              );
            })}
            
            </div>

            {showMoreMap[company._id] && (
              <div className="mt-4 ">
                <h4 className="text-lg font-semibold text-gray-800 mt-4">
                  Company Type Files:
                </h4>
                {company.companyTypeFiles.map((file, index) => (
                  <div key={index} className="mt-2">
                    <div className="mb-2">
                      <span className="text-gray-500 font-semibold text-md mr-2">
                        Filename:
                      </span>
                      <span>{file.filename}</span>
                    </div>
                    <div className="mb-4 space-x-2">
                      <button
                        onClick={() => companyDownloadFile(file)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                      >
                        Download
                      </button>
                      <button
                        className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                        onClick={() => companyRenderFilePreview(file)}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => toggleShowMore(company._id)}
              className="text-blue-500 mt-4"
            >
              {showMoreMap[company._id] ? "Show Less" : "Show More"}
            </button>
          </div>
        ))}
        <ul className="pagination flex justify-center items-center my-4">
          <li
            className={`page-item p-2 ${currentPageC === 1 ? "disabled" : ""}`}
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
            className={`page-item p-2 ${
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

        <Modal
          showModal={showModal}
          closeModal={closeModal}
          handleConfirmDelete={handleConfirmDelete}
          modalContent={modalContent}
        />

        {alertMessage && (
          <div className="fixed bottom-0 right-0 m-4">
            <Alert
              message={alertMessage}
              type={alertMessage.startsWith("Error") ? "error" : "success"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const getCompanyType = (companyType) => {
  if (!companyType) return "Not Specified";
  const selectedTypes = Object.keys(companyType).filter(
    (key) => companyType[key] && key !== "_id" // Exclude the _id key
  );
  return selectedTypes.length > 0 ? selectedTypes.join(", ") : "Not Specified";
};

export default ViewCompanies;
