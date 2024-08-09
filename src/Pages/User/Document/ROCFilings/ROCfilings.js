import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from "../../NavigationBar/NavigationBar";
const UserROCFilings = () => {
  let navigate = useNavigate();

  const [rocFilings, setROCFilings] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState({});
  const [selectedROCFilings, setSelectedROCFilings] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyNames, setCompanyNames] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredROCFilings, setFilteredROCFilings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15); // Change this value as per your requirement
  let isMounted = true;
  const [showAlert, setShowAlert] = useState(false);
  const [alertShown, setAlertShown] = useState(false);
  const [currentPageC, setCurrentPageC] = useState(1);
  const [itemsPerPageC, setItemsPerPageC] = useState(50);

  useEffect(() => {
    fetchROCFilings();
    fetchCompanyNames();
    return () => {
      isMounted = false;
    };
  }, []);

    // Filter companies with at least one company type set to true
    // const filteredCompanies = companyNames.filter(company => 
    //   Object.values(company.companyType).some(type => type === true)
    // );
     // Filter companies where soleProprietorship is true

  
  const filteredCompanies = companyNames.filter(company => 
    company.companyType.limitedLiabilityPartnerships === true ||
    company.companyType.privateLimitedCompany === true ||
    company.companyType.publicLimitedCompany === true ||
    company.companyType.onePersonCompany === true
  );


  const fetchROCFilings = async () => {
    isMounted = true;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/document/rocfilings/getAllROCFilings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to fetch profile data");
      }
      // console.log("Thsi is data:",response.data)
      setROCFilings(response.data);
      setFilteredROCFilings(response.data);
    } catch (error) {
      if (
        isMounted &&
        error.response &&
        error.response.status === 500 &&
        !alertShown
      ) {
        setShowAlert(true);
        setAlertShown(true); // Set flag to true once alert is shown
        alert("Session expired. Please login again.");
        navigate("/");
      }
      // console.error('Error fetching GST Returns:', error);
    }
  };

  const fetchCompanyNames = async () => {
    isMounted = true;
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/company/getCompanyNameOnlyDetails`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (!response) {
        throw new Error("Failed to fetch profile data");
      }
      setCompanyNames(response.data);
    } catch (error) {
      if (
        isMounted &&
        error.response &&
        error.response.status === 500 &&
        !alertShown
      ) {
        setShowAlert(true);
        setAlertShown(true); // Set flag to true once alert is shown
        alert("Session expired. Please login again.");
        navigate("/");
      }
      // console.error('Error fetching company names:', error);
    }
  };

  const handleDownload = async (filename) => {
    try {
      setLoadingDownload({ ...loadingDownload, [filename]: true });
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
       `${process.env.REACT_APP_API_URL}/user/document/rocfilings/downloadROCFiling/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
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
    } finally {
      setLoadingDownload({ ...loadingDownload, [filename]: false });
    }
  };

  const handlePreview = async (filename) => {
    try {
      setLoadingPreview({ ...loadingPreview, [filename]: true });

      const authToken = localStorage.getItem("token");
      const response = await axios.get(
       `${process.env.REACT_APP_API_URL}/user/document/rocfilings/previewROCFiling/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error previewing file:", error);
    } finally {
      setLoadingPreview({ ...loadingPreview, [filename]: false });
    }
  };

  const handleViewDetails = (index) => {
    const ROCData = index;

    // Store data in local storage
    localStorage.setItem("ROCData", JSON.stringify(ROCData));

    // Open new tab
    const ROCWindow = window.open("/roc", "_blank");

    if (!ROCWindow) {
      alert("Please allow pop-ups for this website to view ROC details.");
    }
  };
  const handleCloseDetails = () => {
    setSelectedROCFilings(null);
  };

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
    filterROCFilings(event.target.value);
  };

  const filterROCFilings = (company) => {
    if (company === "") {
      setFilteredROCFilings(rocFilings);
    } else {
      const filtered = rocFilings.filter(
        (rocFilings) => rocFilings.company === company
      );
      setFilteredROCFilings(filtered);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    const filtered = rocFilings.filter((rocFiling) => {
      return (
        rocFiling.files[0].filename
          .toLowerCase()
          .includes(event.target.value.toLowerCase()) ||
        rocFiling.description
          .toLowerCase()
          .includes(event.target.value.toLowerCase()) ||
        rocFiling.remarks
          .toLowerCase()
          .includes(event.target.value.toLowerCase()) ||
        rocFiling.name.toLowerCase().includes(event.target.value.toLowerCase())
      );
    });
    setFilteredROCFilings(filtered);
  };

  const extractFilenameAfterUnderscore = (filename) => {
    const parts = filename.split("_");
    return parts.length > 1 ? parts.slice(1).join("_") : filename;
  };

  const truncateText = (text, limit) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredROCFilings
    ? filteredROCFilings.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPagesC = Math.ceil(filteredROCFilings.length / itemsPerPageC);

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

  const startIndexC = (currentPageC - 1) * itemsPerPageC;
  const endIndexC = Math.min(
    startIndexC + itemsPerPageC,
    filteredROCFilings.length
  );
  const slicedHistoryC = filteredROCFilings.slice(startIndexC, endIndexC);

  return (
    <div>
      <NavigationBar />
      <hr></hr>
      <div className="container mx-auto p-4">
        <p className="font-bold text-3xl text-blue-500 mb-10 mx-5">
          ROC FILLINGS LIST{" "}
        </p>

        {/* Dropdown for selecting companies */}
        {selectedROCFilings ? (
          <div className="my-10 w-full">
            <button
              onClick={handleCloseDetails}
              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded mb-5 mx-10"
            >
              Back
            </button>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full md:w-11/12 lg:w-11/12  xl:w-11/12  mx-auto">
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-400 mb-3">
                  ROC Filings Details
                </h3>
                <p>
                  <strong className="text-gray-600">Filename:</strong>
                  {selectedROCFilings.files[0].filename}
                </p>
                <p>
                  <strong className="text-gray-600">Description:</strong>
                  {selectedROCFilings.description}
                </p>
                <p>
                  <strong className="text-gray-600">Remarks:</strong>
                  {selectedROCFilings.remarks}
                </p>
                <p>
                  <strong className="text-gray-600">
                    Name of the Uploader:
                  </strong>
                  {selectedROCFilings.name}
                </p>
                <p>
                  <strong className="text-gray-600">ROC Filings Type:</strong>{" "}
                  {selectedROCFilings.rocFieldName}
                </p>
                <p>
                  <strong className="text-gray-600">
                    Email of the uploader:
                  </strong>{" "}
                  {selectedROCFilings.email}
                </p>
                <p>
                  <strong className="text-gray-600">Role:</strong>{" "}
                  {selectedROCFilings.role}
                </p>
                <div className="flex items-center mt-4 flex-wrap">
                  {selectedROCFilings.files[0].filename
                    .slice(-3)
                    .toLowerCase() === "pdf" && (
                    <button
                      onClick={() =>
                        handlePreview(selectedROCFilings.files[0].filename)
                      }
                      disabled={
                        loadingPreview[selectedROCFilings.files[0].filename] ||
                        !selectedROCFilings.files[0].filename.endsWith(".pdf")
                      }
                      className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                    >
                      {loadingPreview[selectedROCFilings.files[0].filename]
                        ? "Loading Preview..."
                        : "Preview"}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleDownload(selectedROCFilings.files[0].filename)
                    }
                    disabled={
                      loadingDownload[selectedROCFilings.files[0].filename]
                    }
                    className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
                  >
                    {loadingDownload[selectedROCFilings.files[0].filename]
                      ? "Downloading..."
                      : "Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 mx-5">
            <label className="block mb-2 ">
              <p className="text-xl text-gray-600">Select Company:</p>
              <select
                value={selectedCompany}
                onChange={handleCompanyChange}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Companies</option>
                {filteredCompanies.map((company) => (
                  <option key={company.companyName} value={company.companyName}>
                    {company.companyName}
                  </option>
                ))}
              </select>
            </label>

            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 mt-4 mb-2 focus:outline-none focus:border-blue-500"
              placeholder="Search..."
            />
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border bg-gray-200 px-4 py-2 text-center">
                      Sno
                    </th>
                    <th className="border bg-gray-200 px-4 py-2 text-center">
                      File Name
                    </th>

                    <th className="border bg-gray-200 px-4 py-2 text-center">
                      Uploaded By
                    </th>
                    <th className="border bg-gray-200 px-4 py-2">Preview</th>
                    <th className="border bg-gray-200 px-4 py-2">Download</th>
                    <th className="border bg-gray-200 px-4 py-2">View</th>
                  </tr>
                </thead>
                <tbody>
                  {slicedHistoryC.length > 0 ? (
                    slicedHistoryC.map((ROCFilings, index) => (
                      <tr key={ROCFilings._id}>
                        <td className="border px-4 py-2 text-center">
                          {filteredROCFilings.length - startIndexC - index}
                        </td>
                        {/* <td className="border px-4 py-2"></td> */}
                        <td className="border px-4 py-2 text-center">
                          {truncateText(
                            extractFilenameAfterUnderscore(
                              ROCFilings.files[0].filename
                            ),
                            20
                          )}
                        </td>

                        <td className="border px-4 py-2 text-center">
                          {truncateText(ROCFilings.name, 20)}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {ROCFilings.files[0].filename
                            .slice(-3)
                            .toLowerCase() === "pdf" && (
                            <button
                              onClick={() =>
                                handlePreview(ROCFilings.files[0].filename)
                              }
                              disabled={
                                loadingPreview[ROCFilings.files[0].filename]
                              }
                              className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                            >
                              {loadingPreview[ROCFilings.files[0].filename]
                                ? "Loading Preview..."
                                : "Preview"}
                            </button>
                          )}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() =>
                              handleDownload(ROCFilings.files[0].filename)
                            }
                            disabled={
                              loadingDownload[ROCFilings.files[0].filename]
                            }
                            className="bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
                          >
                            {loadingDownload[ROCFilings.files[0].filename]
                              ? "Downloading..."
                              : "Download"}
                          </button>
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <button
                            onClick={() => handleViewDetails(ROCFilings)}
                            className="bg-transparent hover:bg-gray-500 text-gray-700 font-semibold hover:text-white py-2 px-4 border border-gray-500 hover:border-transparent rounded"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="border px-4 py-2 text-center">
                        No ROC Filings available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
        )}
      </div>
    </div>
  );
};

export default UserROCFilings;
