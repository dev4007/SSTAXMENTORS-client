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

  const handlePreview = async (filename) => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
       `${process.env.REACT_APP_API_URL}/user/previewCompanyFile/${filename}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      // Convert the response data from base64 to a Uint8Array
      const bytes = new Uint8Array(response.data);

      // Create a Blob object from the Uint8Array
      const blob = new Blob([bytes], { type: "application/pdf" });

      // Create a URL for the Blob object
      const url = window.URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error previewing file:", error);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
       `${process.env.REACT_APP_API_URL}/user/downloadCompanyFile/${filename}`,
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
                    <strong>Address:</strong> {clientData.address}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Is Verified:</strong>{" "}
                    {clientData.isverified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p class="mb-2 text-lg">
                    <strong>Landmark:</strong> {clientData.landmark ? clientData.landmark : "Not Available"} 
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>State:</strong> {clientData.state}
                  </p>
                  <p class="mb-2 text-lg">
                    <strong>Company Name:</strong> {clientData.companyname}
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
                <p class="mb-2 text-lg">Address: {
                  company.address}</p>
                <p class="mb-2 text-lg">{`Office Number: ${
                  company.officeNumber || "Not specified"
                }`}</p>

                {/* Display subInputs */}
                {showMoreMap[idx] ? (
                  <>
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
