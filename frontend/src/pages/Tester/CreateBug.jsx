import React, { useEffect, useState, useContext } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance.js'
import { API_PATHS } from '../../utils/apiPaths.js'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { LuTrash2 } from 'react-icons/lu'
import SelectDropdown from '../../components/Inputs/SelectDropdown'
import SelectUsers from '../../components/Inputs/SelectUsers'
import TodoListInput from '../../components/Inputs/ToDoListInput'
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput'
import Modal from '../../components/Modal.jsx'
import DeleteAlert from '../../components/DeleteAlert.jsx'
import { UserContext } from '../../context/userContext'

const SEVERITY_DATA = [
  { id: 1, name: "Minor", value: "Minor" },
  { id: 2, name: "Major", value: "Major" },
  { id: 3, name: "Critical", value: "Critical" },
];

const STATUS_DATA = [
  { id: 1, name: "Open", value: "Open" },
  { id: 2, name: "In Progress", value: "In Progress" },
  { id: 3, name: "Closed", value: "Closed" },
];

const PRIORITY_OPTIONS = [
  { id: 1, name: "Low", value: "Low" },
  { id: 2, name: "Medium", value: "Medium" },
  { id: 3, name: "High", value: "High" },
];

const CreateBug = () => {
  const location = useLocation();
  const { bugId } = location.state || {};
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [bugData, setBugData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: null,
    assignedTo: [],
    checklist: [],
    attachments: [],
    severity: "Minor",
    module: "",
    status: "Open"
  });

  const [currentBug, setCurrentBug] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!bugData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (bugData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
    } else if (bugData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    if (!bugData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (bugData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    if (!bugData.assignedTo.length) {
      newErrors.assignedTo = "At least one developer must be assigned";
    }

    if (bugData.dueDate && new Date(bugData.dueDate) <= new Date()) {
      newErrors.dueDate = "Due date must be in the future";
    }

    if (bugData.module && bugData.module.length > 50) {
      newErrors.module = "Module name cannot exceed 50 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValueChange = (key, value) => {
    setBugData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
    // Clear error when field is modified
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const clearData = () => {
    setBugData({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: null,
      assignedTo: [],
      checklist: [],
      attachments: [],
      severity: "Minor",
      module: "",
      status: "Open"
    });
    setCurrentBug(null);
  };

  // Create Bug
  const createBug = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      // Format checklist items according to schema
      const formattedChecklist = bugData.checklist?.map((item) => {
        const text = typeof item === 'string' ? item : item.text;
        return {
          text: text.trim(),
          completed: false,
          completedBy: null,
          completedAt: null
        };
      }) || [];

      // Ensure assignedTo is an array of valid ObjectIds
      const formattedAssignedTo = Array.isArray(bugData.assignedTo) ? 
        bugData.assignedTo.filter(id => id && typeof id === 'string') : [];

      // Ensure attachments is an array of strings
      const formattedAttachments = Array.isArray(bugData.attachments) ? 
        bugData.attachments.filter(attachment => attachment && typeof attachment === 'string').map(a => a.trim()) : [];

      const bugPayload = {
        title: bugData.title.trim(),
        description: bugData.description.trim(),
        priority: bugData.priority,
        severity: bugData.severity,
        status: "Open", // Always set to Open for new bugs
        module: bugData.module?.trim() || "",
        dueDate: bugData.dueDate ? new Date(bugData.dueDate).toISOString() : null,
        createdBy: user._id,
        assignedTo: formattedAssignedTo,
        checklist: formattedChecklist,
        attachments: formattedAttachments
      };

      const response = await axiosInstance.post(API_PATHS.BUGS.CREATE_BUG, bugPayload);

      if (response.status === 201) {
        toast.success("Bug Reported Successfully");
        navigate('/tester/my-bugs');
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      console.error("Error creating bug:", error);
      
      // Handle validation errors
      if (error.response?.data?.details) {
        const errorMessages = error.response.data.details.map(err => 
          `${err.field}: ${err.message}`
        ).join('\n');
        toast.error(errorMessages);
      } else {
        const errorMessage = error.response?.data?.message || 
          error.response?.data?.error || 
          "Failed to create bug. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update Bug
  const updateBug = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const checklist = bugData.checklist?.map((item) => {
        const prevChecklist = currentBug?.checklist || [];
        const matchedBug = prevChecklist.find((prevItem) => prevItem?.text === item);
        return {
          text: item,
          completed: matchedBug?.completed || false,
        };
      });

      const response = await axiosInstance.put(
        API_PATHS.BUGS.UPDATE_BUG(bugId),
        {
          ...bugData,
          dueDate: new Date(bugData.dueDate).toISOString(),
          checklist: checklist,
        }
      );
      toast.success("Bug Updated Successfully");
      navigate("/tester/dashboard");
    } catch (error) {
      console.error("Error updating bug:", error);
      const errorMessage = error.response?.data?.message || "Failed to update bug";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (bugId) {
      await updateBug();
    } else {
      await createBug();
    }
  };

  // get Bug info by ID
  const getBugDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BUGS.GET_BUG_BY_ID(bugId)
      );
      if (response.data) {
        const bugInfo = response.data;
        setCurrentBug(bugInfo);

        setBugData((prevState) => ({
          title: bugInfo.title,
          description: bugInfo.description,
          priority: bugInfo.priority,
          dueDate: bugInfo.dueDate ? moment(bugInfo.dueDate).format("YYYY-MM-DD") : null,
          assignedTo: bugInfo?.assignedTo?.map((item) => item._id) || [],
          checklist: bugInfo?.checklist?.map((item) => item?.text) || [],
          attachments: bugInfo?.attachments || [],
          severity: bugInfo?.severity || "Minor",
          module: bugInfo?.module || "",
          status: bugInfo?.status || "Open"
        }));
      }
    } catch (error) {
      console.error("Error fetching bug details:", error);
    }
  };

  // Delete Bug
  const deleteBug = async () => {
    try {
      await axiosInstance.delete(API_PATHS.BUGS.DELETE_BUG(bugId));
      setOpenDeleteAlert(false);
      toast.success("Bug deleted successfully");
      navigate("/tester/dashboard");
    } catch (error) {
      console.error("Error deleting bug:", error);
    }
  };

  useEffect(() => {
    if (bugId) {
      getBugDetailsById(bugId);
    }
  }, [bugId]);

  return (
    <DashboardLayout activeMenu="Report Bug">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {bugId ? "Update Bug" : "Report New Bug"}
          </h1>
          {bugId && (
            <button
              onClick={() => setOpenDeleteAlert(true)}
              className="flex items-center gap-2 text-red-500 hover:text-red-700"
            >
              <LuTrash2 className="text-lg" />
              Delete Bug
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Title
              </label>
              <input
                type="text"
                value={bugData.title}
                onChange={(e) => handleValueChange("title", e.target.value)}
                className={`w-full text-sm text-black outline-none bg-white border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } px-3 py-2 rounded-md`}
                placeholder="Enter bug title"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Description
              </label>
              <textarea
                value={bugData.description}
                onChange={(e) => handleValueChange("description", e.target.value)}
                className={`w-full text-sm text-black outline-none bg-white border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } px-3 py-2 rounded-md h-32`}
                placeholder="Enter bug description Or Steps to Reproduce"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Priority
              </label>
              <SelectDropdown
                options={PRIORITY_OPTIONS}
                selectedValue={bugData.priority}
                onChange={(value) => handleValueChange("priority", value)}
                placeholder="Select priority"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Severity
              </label>
              <SelectDropdown
                options={SEVERITY_DATA}
                selectedValue={bugData.severity}
                onChange={(value) => handleValueChange("severity", value)}
                placeholder="Select severity"
              />
            </div>

            {/* Module */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Module
              </label>
              <input
                type="text"
                value={bugData.module}
                onChange={(e) => handleValueChange("module", e.target.value)}
                className={`w-full text-sm text-black outline-none bg-white border ${
                  errors.module ? "border-red-500" : "border-gray-300"
                } px-3 py-2 rounded-md`}
                placeholder="Enter module name"
              />
              {errors.module && (
                <p className="text-red-500 text-xs mt-1">{errors.module}</p>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={bugData.dueDate || ""}
                onChange={(e) => handleValueChange("dueDate", e.target.value)}
                className={`w-full text-sm text-black outline-none bg-white border ${
                  errors.dueDate ? "border-red-500" : "border-gray-300"
                } px-3 py-2 rounded-md`}
                min={moment().format("YYYY-MM-DD")}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>
              )}
            </div>

            {/* Assign Developers */}
            <div className="col-span-2">
              <SelectUsers
                label="Assign Developers"
                selectedUsers={bugData.assignedTo}
                onChange={(value) => handleValueChange("assignedTo", value)}
              />
              {errors.assignedTo && (
                <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>
              )}
            </div>

            {/* Checklist */}
            <div className="col-span-2">
              <TodoListInput
                label="Checklist"
                placeholder="Enter checklist item"
                values={bugData.checklist}
                onChange={(value) => handleValueChange("checklist", value)}
              />
            </div>

            {/* Attachments */}
            <div className="col-span-2">
              <AddAttachmentsInput
                label="Attachments"
                attachments={bugData.attachments}
                onChange={(value) => handleValueChange("attachments", value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={clearData}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : bugId ? "Update Bug" : "Report Bug"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Alert Modal */}
      <Modal
        isOpen={openDeleteAlert}
        closeModal={() => setOpenDeleteAlert(false)}
        title="Delete Bug"
      >
        <DeleteAlert
          onCancel={() => setOpenDeleteAlert(false)}
          onConfirm={deleteBug}
          message="Are you sure you want to delete this bug? This action cannot be undone."
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreateBug;
