import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import moment from 'moment';
import { LuTrash2, LuArrowLeft } from 'react-icons/lu';
import SelectDropdown from '../../components/Inputs/SelectDropdown';
import SelectUsers from '../../components/Inputs/SelectUsers';
import Modal from '../../components/Modal.jsx';
import DeleteAlert from '../../components/DeleteAlert.jsx';

const PRIORITY_DATA = [
  { id: 1, name: "Low", value: "Low" },
  { id: 2, name: "Medium", value: "Medium" },
  { id: 3, name: "High", value: "High" },
];

const SEVERITY_DATA = [
  { id: 1, name: "Minor", value: "Minor" },
  { id: 2, name: "Major", value: "Major" },
  { id: 3, name: "Critical", value: "Critical" },
];

const STATUS_DATA = [
  { id: 1, name: "Pending", value: "Pending" },
  { id: 2, name: "In Progress", value: "In Progress" },
  { id: 3, name: "Resolved", value: "Resolved" },
];

const ViewBugAdmin = () => {
  const { id } = useParams();
  const location = useLocation();
  const bugId = id || location.state?.bugId;
  const navigate = useNavigate();
  
  const [bugData, setBugData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    severity: "Minor",
    status: "Pending",
    dueDate: null,
    assignedTo: [],
    checklist: [],
    attachments: [],
    module: "",
  });

  const [originalBug, setOriginalBug] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get bug details
  const getBugDetailsById = async () => {
    if (!bugId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_BUG_BY_ID(bugId));
      if (response.data) {
        const bugInfo = response.data;
        setOriginalBug(bugInfo);

        // Convert legacy status values if needed
        let bugStatus = bugInfo.status;
        if (bugStatus === "Open") bugStatus = "Pending";
        if (bugStatus === "Closed") bugStatus = "Resolved";

        setBugData({
          title: bugInfo.title,
          description: bugInfo.description,
          priority: bugInfo.priority,
          severity: bugInfo.severity || "Minor",
          status: bugStatus,
          dueDate: bugInfo.dueDate ? moment(bugInfo.dueDate).format("YYYY-MM-DD") : null,
          assignedTo: bugInfo?.assignedTo?.map((item) => item._id) || [],
          checklist: bugInfo?.checklist || [],
          attachments: bugInfo?.attachments || [],
          module: bugInfo?.module || "",
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bug details:", error);
      toast.error("Failed to load bug details");
      setLoading(false);
      navigate("/admin/bugs");
    }
  };

  // Update bug
  const updateBug = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        API_PATHS.BUGS.UPDATE_BUG(bugId),
        {
          ...bugData,
          dueDate: bugData.dueDate ? new Date(bugData.dueDate).toISOString() : null,
        }
      );
      toast.success("Bug Updated Successfully");
      navigate("/admin/bugs");
    } catch (error) {
      console.error("Error updating bug:", error);
      toast.error("Failed to update bug");
    } finally {
      setLoading(false);
    }
  };

  // Delete bug
  const deleteBug = async () => {
    try {
      setDeleteLoading(true);
      await axiosInstance.delete(API_PATHS.BUGS.DELETE_BUG(bugId));
      toast.success("Bug deleted successfully");
      navigate("/admin/bugs");
    } catch (error) {
      console.error("Error deleting bug:", error);
      toast.error("Failed to delete bug");
    } finally {
      setDeleteLoading(false);
      setOpenDeleteAlert(false);
    }
  };

  const handleValueChange = (key, value) => {
    setBugData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    
    // Input validation
    if (!bugData.title.trim()) {
      setError("Title is required");
      return;
    }
    if (!bugData.description.trim()) {
      setError("Description is required");
      return;
    }
    if (!bugData.dueDate) {
      setError("Due date is required");
      return;
    }
    if (bugData.assignedTo?.length === 0) {
      setError("Bug must be assigned to at least one developer");
      return;
    }
    
    updateBug();
  };

  useEffect(() => {
    if (bugId) {
      getBugDetailsById();
    }
  }, [bugId]);

  // Show loading state
  if (loading && !originalBug) {
    return (
      <DashboardLayout activeMenu="Manage Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading bug details...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Manage Bugs">
      <div className="mt-5">
        <button 
          className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          onClick={() => navigate('/admin/bugs')}
        >
          <LuArrowLeft className="mr-1" /> Back to All Bugs
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
          <div className="form-card col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-xl font-medium">
                View/Update Bug
              </h2>

              <button
                className="flex items-center gap-1.5 text-[13px] font-medium text-white bg-rose-500 rounded px-3 py-1.5 border border-rose-600 hover:bg-rose-600 cursor-pointer transition-colors"
                onClick={() => setOpenDeleteAlert(true)}
              >
                <LuTrash2 className="text-base" />
                Delete Bug
              </button>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Bug Title
              </label>

              <input
                placeholder="Short description of the bug"
                className="form-input"
                value={bugData.title}
                onChange={({ target }) => handleValueChange("title", target.value)}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea
                placeholder="Detailed description of the bug"
                className="form-input"
                rows={4}
                value={bugData.description}
                onChange={({ target }) => handleValueChange("description", target.value)}
              />
            </div>

            <div className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Module
                </label>

                <input
                  placeholder="Software module affected"
                  className="form-input"
                  value={bugData.module}
                  onChange={({ target }) => handleValueChange("module", target.value)}
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <SelectDropdown
                  label="Priority"
                  placeholder="Select Priority"
                  options={PRIORITY_DATA}
                  selectedValue={bugData.priority}
                  onChange={(value) => handleValueChange("priority", value)}
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <SelectDropdown
                  label="Severity"
                  placeholder="Select Severity"
                  options={SEVERITY_DATA}
                  selectedValue={bugData.severity}
                  onChange={(value) => handleValueChange("severity", value)}
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <SelectDropdown
                  label="Status"
                  placeholder="Select Status"
                  options={STATUS_DATA}
                  selectedValue={bugData.status}
                  onChange={(value) => handleValueChange("status", value)}
                />
              </div>

              <div className="col-span-6 md:col-span-4">
                <label className="text-xs font-medium text-slate-600">
                  Due Date
                </label>

                <input
                  type="date"
                  className="form-input"
                  value={bugData.dueDate || ""}
                  onChange={({ target }) => handleValueChange("dueDate", target.value)}
                />
              </div>

              <div className="col-span-12 md:col-span-4">
                <SelectUsers
                  label="Assign Developers"
                  placeholder="Select developers"
                  selectedUsers={bugData.assignedTo}
                  onChange={(value) => handleValueChange("assignedTo", value)}
                  role="developer"
                />
              </div>
            </div>

            {error && (
              <p className="text-rose-500 text-sm mt-2">{error}</p>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Bug"}
              </button>

              <button
                className="btn-outline"
                onClick={() => navigate("/admin/bugs")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

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

export default ViewBugAdmin; 