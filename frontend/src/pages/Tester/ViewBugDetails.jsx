import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';
import moment from 'moment';
import { LuArrowLeft, LuPaperclip } from 'react-icons/lu';
import { MdEdit } from "react-icons/md";
const PRIORITY_COLORS = {
  'Low': 'bg-green-100 text-green-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'High': 'bg-red-100 text-red-800'
};

const SEVERITY_COLORS = {
  'Minor': 'bg-blue-100 text-blue-800',
  'Major': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};

const STATUS_COLORS = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Closed': 'bg-green-100 text-green-800'
};

const ViewBugDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const bugId = id || location.state?.bugId;
  const navigate = useNavigate();
  
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get bug details
  const getBugDetailsById = async () => {
    if (!bugId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_BUG_BY_ID(bugId));
      if (response.data) {
        setBug(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bug details:", error);
      toast.error("Failed to load bug details");
      setLoading(false);
      navigate("/tester/dashboard");
    }
  };

  useEffect(() => {
    if (bugId) {
      getBugDetailsById();
    }
  }, [bugId]);

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout activeMenu="My Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading bug details...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Show error if bug not found
  if (!bug) {
    return (
      <DashboardLayout activeMenu="My Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Bug not found or you don't have permission to view it</p>
        </div>
      </DashboardLayout>
    );
  }

  // Check if the bug was reported by this tester
  const isReportedByUser = bug.createdBy?._id === user?._id || bug.createdBy === user?._id;
  
  // If not reported by user and not an admin, show unauthorized message
  if (!isReportedByUser && user?.role !== 'admin') {
    return (
      <DashboardLayout activeMenu="My Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">You don't have permission to view this bug</p>
        </div>
      </DashboardLayout>
    );
  }

  const handleEditBug = () => {
    navigate(`/tester/edit-bug/${bugId}`);
  };

  return (
    <DashboardLayout activeMenu="My Bugs">
      <div className="mt-5">
        <div className="flex justify-between items-center mb-4">
          <button 
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            onClick={() => navigate('/tester/dashboard')}
          >
            <LuArrowLeft className="mr-1" /> Back to Dashboard
          </button>
          
          {isReportedByUser && (
            <button
              className="flex items-center text-sm text-primary hover:text-primary-dark"
              onClick={handleEditBug}
            >
              <MdEdit className="mr-1" /> Edit Bug
            </button>
          )}
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <div className="mb-4">
            <h1 className="text-2xl font-medium">{bug.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[bug.status]}`}>
                {bug.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${PRIORITY_COLORS[bug.priority]}`}>
                {bug.priority}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${SEVERITY_COLORS[bug.severity]}`}>
                {bug.severity}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-medium mb-2 text-gray-700">Bug Details</h3>
              <p className="text-sm mb-2">
                <span className="text-gray-500">Module:</span> {bug.module || 'Not specified'}
              </p>
              <p className="text-sm mb-2">
                <span className="text-gray-500">Reported on:</span> {moment(bug.createdAt).format('MMM D, YYYY')}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Due by:</span> {moment(bug.dueDate).format('MMM D, YYYY')}
              </p>
            </div>

            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-medium mb-2 text-gray-700">Assigned Developers</h3>
              {bug.assignedTo && bug.assignedTo.length > 0 ? (
                <div className="space-y-2">
                  {bug.assignedTo.map((dev, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {dev.profileImageURL || dev.profileImageUrl ? (
                        <img 
                          src={dev.profileImageURL || dev.profileImageUrl} 
                          className="w-6 h-6 rounded-full"
                          alt="Developer"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-300" />
                      )}
                      <span className="text-sm">{dev.name || 'Unknown Developer'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No developers assigned</p>
              )}
            </div>

            <div className="bg-gray-50 rounded p-4">
              <h3 className="font-medium mb-2 text-gray-700">Checklist Progress</h3>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      bug.status === 'Closed' 
                        ? 'bg-green-500' 
                        : bug.status === 'In Progress' 
                        ? 'bg-blue-500' 
                        : 'bg-violet-500'
                    }`}
                    style={{ 
                      width: `${bug.checklist && bug.checklist.length > 0 
                        ? Math.round((bug.checklist.filter(item => item.completed).length / bug.checklist.length) * 100) 
                        : 0}%` 
                    }}
                  />
                </div>
                <span className="text-sm">
                  {bug.checklist && bug.checklist.length > 0 
                    ? Math.round((bug.checklist.filter(item => item.completed).length / bug.checklist.length) * 100) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-700">Description</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700 whitespace-pre-line">{bug.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-3 text-gray-700">Steps to Reproduce</h3>
            <div className="bg-gray-50 p-4 rounded">
              {bug.checklist && bug.checklist.length > 0 ? (
                <ul className="space-y-2">
                  {bug.checklist.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="mt-0.5 min-w-5 text-gray-500">
                        {index + 1}.
                      </div>
                      <div className="flex-1">
                        <span className={item.completed ? 'text-gray-400' : 'text-gray-700'}>
                          {item.text}
                        </span>
                        {item.completed && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No steps to reproduce provided</p>
              )}
            </div>
          </div>

          {bug.attachments && bug.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">
                <LuPaperclip className="inline mr-1" />
                Attachments
              </h3>
              <div className="bg-gray-50 p-4 rounded">
                <ul className="space-y-2">
                  {bug.attachments.map((attachment, index) => (
                    <li key={index}>
                      <a
                        href={attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Attachment {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={() => navigate('/tester/dashboard')}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            
            <button
              onClick={() => navigate('/tester/report-bug', { state: { bugId: bug._id } })}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Bug
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewBugDetails;
