import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet, LuTrash2 } from 'react-icons/lu';
import BugStatusTabs from '../../components/BugStatusTabs';
import BugCard from '../../components/Cards/BugCard';
import Modal from '../../components/Modal.jsx';
import DeleteAlert from '../../components/DeleteAlert.jsx';
import toast from 'react-hot-toast';

const ManageBugs = () => {
  const [allBugs, setAllBugs] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedBug, setSelectedBug] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch all bugs based on the status
  const getAllBugs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_ALL_BUGS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
        },
      });
      
      if (response.data?.bugs) {
        setAllBugs(response.data.bugs.length > 0 ? response.data.bugs : []);
        
        // Map bug status summary data
        const statusSummary = response.data?.statusSummary || {};
        const statusArray = [
          { label: "All", count: statusSummary.all || 0 },
          { label: "Pending", count: statusSummary.openBugs || statusSummary.pendingBugs || 0 },
          { label: "In Progress", count: statusSummary.inProgressBugs || 0 },
          { label: "Resolved", count: statusSummary.closedBugs || statusSummary.resolvedBugs || 0 },
        ];
        
        setTabs(statusArray);
      } else {
        setAllBugs([]);
        setTabs([
          { label: "All", count: 0 },
          { label: "Pending", count: 0 },
          { label: "In Progress", count: 0 },
          { label: "Resolved", count: 0 },
        ]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bugs:", error);
      toast.error("Failed to load bugs");
      setLoading(false);
    }
  };

  // Handle click on a bug card to view/edit details
  const handleViewBug = (bugData) => {
    navigate(`/admin/bugs/${bugData._id}`, { state: { bugId: bugData._id } });
  };

  // Delete bug
  const deleteBug = async () => {
    if (!selectedBug) return;
    
    setDeleteLoading(true);
    try {
      await axiosInstance.delete(API_PATHS.BUGS.DELETE_BUG(selectedBug._id));
      toast.success("Bug deleted successfully");
      // Refresh the bug list
      getAllBugs();
    } catch (error) {
      console.error("Error deleting bug:", error);
      toast.error("Failed to delete bug");
    } finally {
      setDeleteLoading(false);
      setOpenDeleteAlert(false);
      setSelectedBug(null);
    }
  };

  // Handle bug deletion button click
  const handleDeleteBug = (bugData, e) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedBug(bugData);
    setOpenDeleteAlert(true);
  };

  // Download bug report
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_BUGS, {
        responseType: 'blob',
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute("download", "bug_details.xlsx");
      document.body.appendChild(link);
      link.click(); // Trigger the download
      link.parentNode.removeChild(link); // Clean up the DOM
      window.URL.revokeObjectURL(url); // Release the blob URL
    } catch (error) {
      console.error("Error downloading bug details:", error);
      toast.error("Failed to download report");
    }
  };

  useEffect(() => {
    getAllBugs();
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="Manage Bugs">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font-medium">Manage Bugs</h2>

            <button
              className="flex lg:hidden download-btn"
              onClick={handleDownloadReport}
            >
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3">
              <BugStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button className="hidden lg:flex download-btn" onClick={handleDownloadReport}>
                <LuFileSpreadsheet className="text-lg" />
                Download Report
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-10 text-center">
            <p className="text-gray-500">Loading bugs...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {allBugs?.map((item) => (
                <div key={item._id} className="relative">
                  <BugCard
                    title={item.title}
                    description={item.description}
                    priority={item.priority}
                    severity={item.severity}
                    status={item.status}
                    module={item.module}
                    createdAt={item.createdAt}
                    dueDate={item.dueDate}
                    assignedTo={item.assignedTo?.map((user) => user.profileImageURL || user.profileImageUrl)}
                    attachmentCount={item.attachments?.length || 0}
                    completedChecklistCount={
                      item.checklist?.filter(item => item.completed)?.length || 0
                    }
                    totalChecklistCount={item.checklist?.length || 0}
                    onClick={() => handleViewBug(item)}
                  />
                  <button
                    className="absolute top-2 right-2 p-2 bg-rose-100 rounded-full text-rose-500 hover:bg-rose-200 hover:text-rose-600 shadow-sm transition-colors"
                    onClick={(e) => handleDeleteBug(item, e)}
                    aria-label="Delete bug"
                    title="Delete this bug"
                  >
                    <LuTrash2 className="text-base" />
                  </button>
                </div>
              ))}
            </div>

            {/* No bugs message */}
            {allBugs.length === 0 && (
              <div className="mt-10 text-center">
                <p className="text-gray-500">No bugs found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={openDeleteAlert} closeModal={() => setOpenDeleteAlert(false)}>
        <DeleteAlert
          entityName="Bug"
          onCancel={() => setOpenDeleteAlert(false)}
          onConfirm={deleteBug}
          loading={deleteLoading}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default ManageBugs;
