import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";

const ClientDetailsInNewTab = () => {
  const [clientData, setClientData] = useState(null);
  const [clientCData, setClientCData] = useState(null);
  const [showMoreMap, setShowMoreMap] = useState({});

  useEffect(() => {
    const storedClients = localStorage.getItem("viewclient");

    if (storedClients) {
      const parsedClients = JSON.parse(storedClients);
      setClientData(parsedClients[0]); // Set client data from the first index

      if (parsedClients.length > 1) {
        setClientCData(parsedClients.slice(1)); // Set company data from the remaining indices
      } else {
        setClientCData([]); // Set an empty array for company data
      }
    }
  }, []);

  const handlePreview = async (filePath) => {
    // Accept the full path as an argument
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/company/previewCompany/${filePath}`, // Use filePath directly
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      const fileType = filePath.slice(-3).toLowerCase();
      let mimeType = "application/pdf"; // Default MIME type

      if (fileType === "png" || fileType === "jpg" || fileType === "jpeg") {
        mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
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

  const getAddress = (address) => {
    if (!address) return "Not specified";
    const { streetName, city, state, country, postalCode, landmark } = address;
    return `${streetName}, ${city}, ${state}, ${country} - ${postalCode}, Landmark: ${
      landmark || "Not specified"
    }`;
  };

  // Helper function to format company type
  const getCompanyType = (companyType) => {
    if (!companyType) return "Not specified";
    const selectedTypes = Object.entries(companyType)
      .filter(([key, value]) => value === true)
      .map(([key]) => key);
    return selectedTypes.length > 0
      ? selectedTypes.join(", ")
      : "Not specified";
  };

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
    <div>
      <div>
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-semibold mb-5" style={{ color: "#0b5afc" }}>
          Client Details:
        </h1>
        {clientData && (
          <div className="mb-8">
            <div className="bg-gray-50 rounded-lg shadow-md p-6 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p class="mb-2 text-lg">
                    <strong>First Name:</strong> {clientData.firstname}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Last Name:</strong> {clientData.lastname}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Date of Birth:</strong> {clientData.DOB}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>House Address:</strong>{" "}
                    {clientData.houseAddress}
                  </p>{" "}
                  <p class="mb-2 text-lg">
                    <strong>Street Address:</strong>{" "}
                    {clientData.streetAddress}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>City/Town/Village/District:</strong>{" "}
                    {clientData.address}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Is Verified:</strong>{" "}
                    {clientData.isverified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p class="mb-2 text-lg">
                    <strong>Landmark:</strong>{" "}
                    {clientData.landmark
                      ? clientData.landmark
                      : "Not Available"}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>State:</strong> {clientData.state}
                  </p>
                 
                  <p class="mb-2 text-lg">
                    <strong>Country:</strong> {clientData.country}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Email:</strong> {clientData.email}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Phone Number:</strong> {clientData.Phone_number}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Status:</strong> {clientData.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {clientCData && clientCData.length > 0 && (
          <div>
            <h1
              className="text-3xl font-semibold mb-5"
              style={{ color: "#0b5afc" }}
            >
              Company Details:
            </h1>
            {clientCData.map((company, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-lg shadow-md p-6 md:p-8 mb-4"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {company.companyName || "Company Name Not specified"}
                </h3>
                <p class="mb-2 text-lg">{`Company Type: ${getCompanyType(
                  company.companyType
                )}`}</p>
                <p class="mb-2 text-lg">Company House Address: {company.companyHouseAddress}</p>
                <p class="mb-2 text-lg">Company Street Address: {company.companyStreetAddress}</p>
                <p class="mb-2 text-lg">City/Town/Village/District: {company.address}</p>

                <p class="mb-2 text-lg">{`Office Number: ${
                  company.officeNumber || "Not specified"
                }`}</p>

                {/* Display subInputs */}
                {showMoreMap[idx] ? (
                  <>
                    <div className="mt-4">
                      {/* GST Files Section */}
                      <h4 className="text-lg font-semibold text-gray-800 mt-4">
                        GST Files:
                      </h4>
                      {company.gstFile.map((file, index) => (
                        <div key={index} className="mt-2">
                          <div className="mb-2">
                            <span className="text-gray-500 font-semibold text-md mr-2">
                              Filename:
                            </span>
                            <span>{file.name}</span>
                          </div>
                          <div className="mb-4 space-x-2">
                            <button
                              onClick={() => handleDownload(file.filename)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handlePreview(file.filename)}
                              className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* PAN Files Section */}
                      <h4 className="text-lg font-semibold text-gray-800 mt-4">
                        PAN Files:
                      </h4>
                      {company.panFile.map((file, index) => (
                        <div key={index} className="mt-2">
                          <div className="mb-2">
                            <span className="text-gray-500 font-semibold text-md mr-2">
                              Filename:
                            </span>
                            <span>{file.name}</span>
                          </div>
                          <div className="mb-4 space-x-2">
                            <button
                              onClick={() => handleDownload(file.filename)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handlePreview(file.filename)}
                              className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* TAN Files Section */}
                      <h4 className="text-lg font-semibold text-gray-800 mt-4">
                        TAN Files:
                      </h4>
                      {company.tanFile.map((file, index) => (
                        <div key={index} className="mt-2">
                          <div className="mb-2">
                            <span className="text-gray-500 font-semibold text-md mr-2">
                              Filename:
                            </span>
                            <span>{file.name}</span>
                          </div>
                          <div className="mb-4 space-x-2">
                            <button
                              onClick={() => handleDownload(file.filename)}
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handlePreview(file.filename)}
                              className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <div className="border-t border-gray-300 py-4">
                        <h4 className="text-xl font-semibold text-gray-800">
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
                                onClick={() => handleDownload(file.filename)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                              >
                                Download
                              </button>
                              <button
                                onClick={() => handlePreview(file.filename)}
                                className="bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 mt-3"
                              >
                                Preview
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setShowMoreMap((prevState) => ({
                          ...prevState,
                          [idx]: false,
                        }))
                      }
                      className="text-blue-500 mt-4 cursor-pointer"
                    >
                      Show Less
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      setShowMoreMap((prevState) => ({
                        ...prevState,
                        [idx]: true,
                      }))
                    }
                    className="text-blue-500 mt-4 cursor-pointer"
                  >
                    Show More
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailsInNewTab;
