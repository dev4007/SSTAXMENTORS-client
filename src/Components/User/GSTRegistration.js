import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";
import "../../Custommodal.css";
import NavigationBar from "../../Pages/User/NavigationBar/NavigationBar";
const GSTRegistration = () => {
  let navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState("");
  console.log("🚀 ~ GSTRegistration ~ selectedCompany:", selectedCompany)
  const [file, setFile] = useState(null);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [companyNames, setCompanyNames] = useState([]);
  const [previousFile, setPreviousFile] = useState(null);
  const [fileExists, setFileExists] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [selectedCompanyImage, setSelectedCompanyImage] = useState("");
  console.log("🚀 ~ GSTRegistration ~ selectedCompanyImage:", selectedCompanyImage)
  const [selectedFileData, setSelectedFileData] = useState("");
  const [CompanyId, setCompanyId] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  const [loader, setLoader] = useState(false);

  const fetchCompany = async () => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/company/getCompany`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setCompanyNames(response.data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };
  useEffect(() => {
    fetchCompany();
  }, []);

  useEffect(() => {
    if (isFormSubmitted && file) {
      setPreviousFile(file);
    }
  }, [isFormSubmitted, file]);

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `${process.env.REACT_APP_API_URL}/user/deleteGSTR/${file.name}/${selectedCompany}`;
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFile(null);
      message.success("File deleted successfully");
      setFileExists(false);
      setIsFormSubmitted(false);
      setIsModalVisible(false); // Close the modal after successful deletion
    } catch (error) {
      console.error("Error handling delete:", error);
      message.error("File not deleted. Please try again");
    }
  };

  const handleCompanyChange = (event) => {
    const companyName = event.target.value;

    setSelectedCompany(companyName);

    // Find the selected company in the companyNames array
    const company = companyNames.find((company) => {
      return company.companyName === companyName;
    });

    if (company) {
      const companyImage = company.companyType?.[0]?.name;
      const fileName = company.companyType?.[0]?.filename;
   

      const companyImageData = company.companyType?.[0];
      const companyIDs = company.companyID;
      setCompanyId(companyIDs);
      setSelectedFileData(companyImageData);
      setSelectedFileName(fileName);

      // Set the selected company image URL if available
      if (companyImage) {
        setSelectedCompanyImage(companyImage);
        setFileExists(true);
      } else {
        setFileExists(false);
        setSelectedCompanyImage(""); // Clear the image if no file_data is available
      }
    }
  };

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

  const companyRenderFilePreview = (file) => {
    const isImage = file.fileType.startsWith("image/");
    const isPDF = file.fileType === "application/pdf";

    const filePath = `${process.env.REACT_APP_API_URL}/${file.filePath}`;

    if (isImage) {
      window.open(filePath, "_blank");
    } else if (isPDF) {
      window.open(filePath, "_blank");
    }

    return <p>Preview not available for this file type.</p>;
  };

  const downloadFile = async (file) => {
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

  const handleDeleteData = async (companyId) => {
    try {
      const authToken = localStorage.getItem("token");

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/user/company/deleteFile/${companyId}`,

        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("File deleted successfully");

        setFileExists(false);
        setSelectedCompanyImage("");
        fetchCompany();
        // Optionally trigger any additional actions on success
      } else {
        console.error("Error deleting file:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    for (const files of file) {
      formData.append("gstFile", files);
    }

    const authToken = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/company/updateGST/${CompanyId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,

            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("🚀 ~ handleSubmit ~ response:", response.data.gstFiles?.[0]?.name)
      if (response) {
        setSelectedCompanyImage(response.data.gstFiles?.[0]?.name);
        setSelectedFileData(response.data.gstFiles?.[0]);
        setSelectedFileName(response.data.gstFiles?.[0]?.filename)
        setFileExists(true);
        setIsFormSubmitted(true);
        fetchCompany();
      }

      // Handle successful response
    } catch (err) {
      console.error("Error updating GST files:", err);
    }
  };

  return (
    <div>
      <NavigationBar />
      <hr></hr>
      <div className="p-4  mx-5">
        <p className="font-bold text-3xl text-blue-500 mb-10">
          GST REGISTRATION
        </p>
        <div className="mb-6">
          <label
            htmlFor="company"
            className="block text-lg font-medium text-gray-600 mb-2"
          >
            Select Company
          </label>
          <select
            id="company"
            name="company"
            value={selectedCompany}
            onChange={handleCompanyChange}
            className="mt-1 p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="" disabled hidden>
              Select a company
            </option>
            {companyNames.map((company, index) => (
              <option key={index} value={company.name}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        {selectedCompany && selectedCompanyImage ? (
          <div>
            {fileExists && (
              <>
                <button
                  // onClick={() => companyRenderFilePreview(selectedFileData)}
                  onClick={() => handlePreview(selectedFileName)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Preview
                </button>

                <button
                  // onClick={() => downloadFile(selectedFileData)}
                  onClick={() => handleDownload(selectedFileName)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Download
                </button>

                <button
                  onClick={() => handleDeleteData(CompanyId)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-600"
            >
              Upload File
            </label>
            <input
              type="file"
              name="gstFile"
              multiple
              onChange={handleFileChange}
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white p-2 rounded-md mt-2"
            >
              {loader ? "Loading..." : "Submit"}
            </button>
          </div>
        )}

        {/* Modal for confirming document deletion */}
        <Modal
          title="Confirm Deletion"
          visible={isModalVisible}
          onOk={handleDelete}
          onCancel={() => setIsModalVisible(false)}
          okText="Confirm"
          cancelText="Cancel"
          className="custom-modal"
        >
          <p>Are you sure you want to delete the document?</p>
        </Modal>
      </div>
    </div>
  );
};

export default GSTRegistration;
