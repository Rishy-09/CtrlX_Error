import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { STATUS_DATA } from '../../utils/data';
import toast from 'react-hot-toast';
import moment from 'moment';
import { LuCheck, LuClock, LuCircleX } from 'react-icons/lu';

const UpdateBugStatus = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [bugs, setBugs] = useState([]);
  const [expandedBug, setExpandedBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Fetch all bugs assigned to the developer
  const fetchAssignedBugs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_ASSIGNED_BUGS);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Convert legacy status values if needed
      const bugsData = response.data.map(bug => ({
        ...bug,
        status: bug.status === "Open" ? "Pending" : bug.status === "Closed" ? "Resolved" : bug.status
      }));

      setBugs(bugsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assigned bugs:', error);
      toast.error(error.response?.data?.message || 'Failed to load assigned bugs');
      setLoading(false);
      setBugs([]);
    }
  };

  // Update bug status
  const updateBugStatus = async (bugId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await axiosInstance.put(API_PATHS.BUGS.UPDATE_BUG_STATUS(bugId), {
        status: newStatus,
      });
      
      // Update local state
      setBugs(prevBugs => 
        prevBugs.map(bug => 
          bug._id === bugId ? { ...bug, status: newStatus } : bug
        )
      );
      
      toast.success('Bug status updated successfully');
      setUpdatingStatus(false);
    } catch (error) {
      console.error('Error updating bug status:', error);
      toast.error(error.response?.data?.message || 'Failed to update bug status');
      setUpdatingStatus(false);
    }
  };

  // Update checklist item
  const updateChecklistItem = async (bugId, index, completed) => {
    try {
      const bugToUpdate = bugs.find(bug => bug._id === bugId);
      if (!bugToUpdate || !bugToUpdate.checklist) return;
      
      const updatedChecklist = [...bugToUpdate.checklist];
      updatedChecklist[index] = {
        ...updatedChecklist[index],
        completed,
        completedBy: user._id,
        completedAt: new Date().toISOString()
      };

      await axiosInstance.put(API_PATHS.BUGS.UPDATE_CHECKLIST(bugId), {
        checklist: updatedChecklist,
      });

      // Update local state
      setBugs(prevBugs => 
        prevBugs.map(bug => 
          bug._id === bugId 
            ? { ...bug, checklist: updatedChecklist } 
            : bug
        )
      );
      
      toast.success('Checklist updated');
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error(error.response?.data?.message || 'Failed to update checklist');
    }
  };

  // Get color for status badge
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Pending': return 'bg-red-100 text-red-800 border border-red-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Handle view full bug details
  const handleViewBug = (bugId) => {
    navigate(`/developer/assigned-bugs/${bugId}`);
  };

  useEffect(() => {
    if (user?._id) {
      fetchAssignedBugs();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout activeMenu="Update Bug Status">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading assigned bugs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Update Bug Status">
      <div className="my-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-medium">Update Bug Status</h2>
        </div>

        {bugs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No bugs are currently assigned to you</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bugs.map((bug) => (
              <div 
                key={bug._id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedBug(expandedBug === bug._id ? null : bug._id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{bug.title}</h3>
                      <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadgeColor(bug.status)}`}>
                          {bug.status}
                        </span>
                        <span>Module: {bug.module || 'Not specified'}</span>
                        <span className="flex items-center gap-1">
                          <LuClock className="text-gray-400" />
                          Due {moment(bug.dueDate).format('MMM D, YYYY')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBug(bug._id);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>

                {expandedBug === bug._id && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 text-gray-700">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateBugStatus(bug._id, 'Pending')}
                            disabled={bug.status === 'Pending' || updatingStatus}
                            className={`px-3 py-1.5 rounded text-sm ${
                              bug.status === 'Pending' ? 'bg-red-100 text-red-800 cursor-not-allowed' : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                            }`}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => updateBugStatus(bug._id, 'In Progress')}
                            disabled={bug.status === 'In Progress' || updatingStatus}
                            className={`px-3 py-1.5 rounded text-sm ${
                              bug.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' : 'bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                            }`}
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => updateBugStatus(bug._id, 'Resolved')}
                            disabled={bug.status === 'Resolved' || updatingStatus}
                            className={`px-3 py-1.5 rounded text-sm ${
                              bug.status === 'Resolved' ? 'bg-green-100 text-green-800 cursor-not-allowed' : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            Resolved
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 text-gray-700">Checklist</h4>
                        {bug.checklist && bug.checklist.length > 0 ? (
                          <div className="space-y-2">
                            {bug.checklist.map((item, index) => (
                              <div 
                                key={index} 
                                className="flex items-start gap-3 bg-white p-3 rounded-md border border-gray-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={(e) => updateChecklistItem(bug._id, index, e.target.checked)}
                                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                  <span
                                    className={`${
                                      item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                                    }`}
                                  >
                                    {item.text}
                                  </span>
                                  {item.completed && item.completedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Completed on {moment(item.completedAt).format('MMM D, YYYY')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No checklist items</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <div className="text-sm text-gray-500">
                        {bug.checklist && bug.checklist.length > 0 && (
                          <span>
                            {bug.checklist.filter(item => item.completed).length} of {bug.checklist.length} items completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UpdateBugStatus;