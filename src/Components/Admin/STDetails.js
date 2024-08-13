import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

const SupportTicketDetailsInNewTab = () => {
  const [supportTicketData, setSupportTicketData] = useState(null);
  const [loading, setLoading] = useState(false); // Loader state
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve data from local storage
    const storedData = localStorage.getItem("supportticket");

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setSupportTicketData(parsedData);
    }
  }, []);

  const handlePreview = async (fileId, filename) => {
    try {
      const authToken = localStorage.getItem("token");
      console.log(fileId);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/previewSupportTicket/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "arraybuffer",
        }
      );

      const fileType = filename.slice(-3).toLowerCase();
      let mimeType = "application/pdf"; // Default MIME type

      if (fileType === "png" || fileType === "jpg" || fileType === "jpeg") {
        mimeType = `image/${fileType === "jpg" ? "jpeg" : fileType}`;
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error previewing support ticket:", error);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const authToken = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/user/downloadSupportTicket/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          responseType: "blob", // Set response type to blob
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

  const handleResolve = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      setLoading(true);
      // Update ticket status to resolved
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/resolveSupportTicket/${ticketId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false);

      if (response) {
        if (userRole === "admin") {
          // navigate("/admin/admindashboard/support-ticketa");
          window.close(); // Close current tab
          window.opener.location.href = "/admin/admindashboard/support-ticketa"; // Navigate previous tab to new route
        } else if (userRole === "employee") {
          // navigate("/employee/employeedashboard/support-tickete");
          window.close(); // Close current tab
          window.opener.location.href =
            "/employee/employeedashboard/support-tickete"; // Navigate previous tab to new route
        } else {
          message.error("Unknown user role");
        }
        message.success("Solved successfully");
      } else {
        message.error("Failed to solve");
      }

      // Refresh ticket details after resolving
      //  fetchSupportTicketData();
    } catch (error) {
      console.error("Error resolving support ticket:", error);
    }
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-8">Support Ticket Details</h1>
        {supportTicketData ? (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            <p>
              <strong className="text-gray-600">Ticket Type:</strong>{" "}
              {supportTicketData[0].ticketId}
            </p>
            <p>
              <strong className="text-gray-600">Description:</strong>{" "}
              {supportTicketData[0].issueMessage}
            </p>
            <p>
              <strong className="text-gray-600">Question Type:</strong>{" "}
              {supportTicketData[0].questionType}
            </p>
            <p>
              <strong className="text-gray-600">Filename:</strong>{" "}
              {supportTicketData[0].files[0].filename}
            </p>
            <p>
              <strong className="text-gray-600">Uploader Name:</strong>{" "}
              {supportTicketData[0].clientName}
            </p>
            <p>
              <strong className="text-gray-600">Uploader email:</strong>{" "}
              {supportTicketData[0].clientEmail}
            </p>
            <p>
              <strong className="text-gray-600">Status:</strong>{" "}
              {supportTicketData[0].status}
              <p className="mt-5">
              {supportTicketData[0].status !== "resolved" && (
                <button
                  onClick={() =>
                    handleResolve(supportTicketData[0].ticketId)
                  }
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  {loading ? "Please wait.." : "Resolve"}
                </button>
              )}
              </p>
            </p>
           
            <div className="flex items-center mt-4">
              <div className="flex flex-col mt-4">
                {supportTicketData[0].files.map((file, index) => {
                  const fileExtension = file.filename.slice(-3).toLowerCase();
                  const isImage = ["jpg", "jpeg", "png"].includes(
                    fileExtension
                  );
                  const isPdf = fileExtension === "pdf";

                  return (
                    <div key={index} className="flex items-center mb-4">
                        {/* Display image or PDF name below the buttons */}
                        <div className="flex flex-col items-center mt-2">
                        <strong className="mt-1 mr-2">File {file.filename}</strong>
                      </div>
                      {/* Display preview, download, and resolve buttons */}
                      <div className="flex items-center space-x-2">
                        {(isImage || isPdf) && (
                          <button
                            onClick={() =>
                              handlePreview(file.fileId, file.filename)
                            }
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                          >
                            Preview {isPdf ? "PDF" : "Image"}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDownload(file.fileId, file.filename)
                          }
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        >
                          Download
                        </button>
                       
                      </div>

                  
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-lg">No Support Ticket data found.</p>
        )}
      </div>
    </div>
  );
};

export default SupportTicketDetailsInNewTab;
