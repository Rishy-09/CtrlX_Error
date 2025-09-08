import React, {useEffect, useState} from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { PRIORITY_DATA } from '../../utils/data'
import axiosInstance from '../../utils/axiosInstance.js'
import { API_PATHS } from '../../utils/apiPaths.js'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import moment from 'moment'
import {LuTrash2} from 'react-icons/lu'
import SelectDropdown from '../../components/Inputs/SelectDropdown'
import SelectUsers from '../../components/Inputs/SelectUsers'
import TodoListInput from '../../components/Inputs/ToDoListInput'
import AddAttachmentsInput from '../../components/Inputs/AddAttachmentsInput'
import Modal from '../../components/Modal.jsx'
import DeleteAlert from '../../components/DeleteAlert.jsx'

const CreateBug = () => {
  const location = useLocation();
  const {bugId} = location.state || {};
  const navigate = useNavigate();

  const [bugData, setBugData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  });

  const [currentBug, setCurrentBug] = useState(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setBugData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  }

  const clearData = () => {
    // reset form
    setBugData({
      title: "",
      description: "",
      priority: "Low",
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    });
    setCurrentBug(null);
  };

  // Create Bug
  const createBug = async () => {
    setLoading(true);
    try {
      const todolist = bugData.todoChecklist?.map((item) => ({
        text: item,
        completed: false,
      }));

      const response = await axiosInstance.post(API_PATHS.BUGS.CREATE_BUG, {
        ...bugData,
        dueDate: new Date(bugData.dueDate).toISOString(),
        todoChecklist: todolist,
      });

      toast.success("Bug Created Successfully");
      clearData();
    } 
    catch (error) {
      console.error("Error creating bug:", error);
      setLoading(false);
    } 
    finally {
      setLoading(false);
    }
  };

  // Update Bug
  const updateBug = async () => {
    setLoading(true);

    try {
      const todolist = bugData.todoChecklist?.map((item) => {
        const prevTodoChecklist = currentBug?.todoChecklist || [];
      
        const matchedBug = prevTodoChecklist.find((bug) => bug?.text === item);
      
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
          todoChecklist: todolist,
        }
    );
    toast.success("Bug Updated Successfully");
    }catch (error) {
      console.error("Error updating bug:", error);
      setLoading(false);
    } 
    finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    // Input Validation
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
      setError("Bug not assigned to any member");
      return;
    }

    if (bugData.todoChecklist?.length === 0) {
      setError("Add at least one todo item");
      return;
    }

    if (bugId){
      updateBug();
      return;
    }

    createBug();
  };

  // get Bug info by ID
  const getBugDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BUGS.GET_BUG_BY_ID(bugId)
      );
      if (response.data){
        const bugInfo = response.data;
        setCurrentBug(bugInfo);

        setBugData((prevState) => ({
          title: bugInfo.title,
          description: bugInfo.description,
          priority: bugInfo.priority,
          dueDate: bugInfo.dueDate
          ? moment(bugInfo.dueDate).format("YYYY-MM-DD") 
          : null,
          assignedTo: bugInfo?.assignedTo?.map((item) => item._id) || [],
          todoChecklist: bugInfo?.todoChecklist?.map((item) => item?.text) || [],
          attachments: bugInfo?.attachments || [],
        }));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Delete Bug
  const deleteBug = async () => {
    try {
      await axiosInstance.delete(API_PATHS.BUGS.DELETE_BUG(bugId));
      setOpenDeleteAlert(false);
      toast.success("Bug details deleted successfully");
      navigate("/admin/bugs");
    } catch (error) {
      console.error("Error deleting bug:", 
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    if (bugId) {
      getBugDetailsById(bugId);
    }
  
    return () => {};
  }, [bugId])
  

  return (
    <DashboardLayout activeMenu="Create Bug">
      <div className='mt-5'>
        <div className='grid grid-cols-1 md:grid-cols-4 mt-4'>
          <div className='form-card col-span-3'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl md:text-xl font-medium'>
                {bugId ? "Update Bug" : "Create Bug"}
              </h2>
              
              {bugId && (
                <button 
                  className='flex items-center gap-1.5 text-[13px] font-medium text-rose-500 bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer'
                  onClick={() => setOpenDeleteAlert(true)}
                >
                  <LuTrash2 className='text-base'/>
                  Delete
                </button>
              )}              
            </div>

            <div className='mt-4'>
              <label className="text-xs font-medium text-slate-600">
                Bug Title
              </label>

              <input 
                placeholder="Describe the bug"
                className="form-input"
                value={bugData.title}
                onChange={({target}) => 
                  handleValueChange("title", target.value)
                }
              />
            </div>

            <div className='mt-3'>
              <label className="text-xs font-medium text-slate-600">
                Description
              </label>

              <textarea 
                placeholder="Describe bug in detail"
                className="form-input"
                rows={4}
                value={bugData.description}
                onChange={({target}) => 
                  handleValueChange("description", target.value)
                }
              />
            </div>

            <div className='mt-3'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                <div>
                  <label className='text-xs font-medium text-slate-600'>
                    Priority Level
                  </label>

                  <SelectDropdown 
                    value={bugData.priority} 
                    options={PRIORITY_DATA}
                    onChange={(value) => 
                      handleValueChange("priority", value)
                    }
                    placeholder="Select Priority"
                  />
                </div>

                <div>
                  <label className='text-xs font-medium text-slate-600'>
                    Due Date
                  </label>

                  <input 
                    type='date' 
                    className='form-input' 
                    value={bugData.dueDate || ''}
                    onChange={({target}) => 
                      handleValueChange("dueDate", target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className='mt-3'>
              <label className='text-xs font-medium text-slate-600'>
                Assign To
              </label>

              <SelectUsers 
                values={bugData.assignedTo}
                onChange={(value) => 
                  handleValueChange("assignedTo", value)
                }
              />
            </div>

            <div className='mt-3'>
              <label className='text-xs font-medium text-slate-600'>
                Add Todo Checklist
              </label>

              <TodoListInput 
                values={bugData.todoChecklist}
                onChange={(value) => 
                  handleValueChange("todoChecklist", value)
                }
              />
            </div>

            <div className='mt-3'>
              <label className='text-xs font-medium text-slate-600'>
                Add Attachments
              </label>

              <AddAttachmentsInput 
                values={bugData.attachments}
                onChange={(value) => 
                  handleValueChange("attachments", value)
                }
              />
            </div>

            {error && (
              <p className='text-xs text-rose-600 mt-2'>{error}</p>
            )}

            <div className='flex justify-end gap-3 mt-8'>
              <button 
                className='btn-outline px-3 py-1.5'
                onClick={clearData}
              >
                Cancel
              </button>
              <button 
                className='btn-primary px-3 py-1.5'
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading 
                ? 'Processing...' 
                : bugId 
                ? 'Update'
                : 'Create'
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={openDeleteAlert}
        onClose={() => setOpenDeleteAlert(false)}
      >
        <DeleteAlert 
          title={`Delete Bug: ${currentBug?.title}`}
          onCancel={() => setOpenDeleteAlert(false)}
          onDelete={deleteBug}
        />
      </Modal>
    </DashboardLayout>
  )
}

export default CreateBug