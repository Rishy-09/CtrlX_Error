import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';
import moment from 'moment';
import { LuCalendar, LuClock, LuUser, LuFileText, LuCircleCheck , LuCircleAlert } from 'react-icons/lu';

const ViewAssignedBug = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBugDetails = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_PATHS.BUGS.GET_BUG_BY_ID(id));
        setBug(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bug details:', error);
        toast.error(error.response?.data?.message || 'Failed to load bug details');
        setLoading(false);
      }
    };

    if (id) {
      fetchBugDetails();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Major':
        return 'bg-yellow-100 text-yellow-800';
      case 'Minor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="Assigned Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading bug details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!bug) {
    return (
      <DashboardLayout activeMenu="Assigned Bugs">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Bug not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Assigned Bugs">
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Assigned Bugs
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-medium mb-4 md:mb-0">{bug.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bug.status)}`}>
                {bug.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(bug.priority)}`}>
                {bug.priority} Priority
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(bug.severity)}`}>
                {bug.severity} Severity
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <LuUser className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Reported By</p>
                  <p className="font-medium">{bug.createdBy?.name || 'Unknown'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LuCalendar className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Reported On</p>
                  <p className="font-medium">{moment(bug.createdAt).format('MMMM D, YYYY')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LuClock className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{bug.dueDate ? moment(bug.dueDate).format('MMMM D, YYYY') : 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <LuUser className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <div className="flex flex-wrap gap-2">
                    {bug.assignedTo?.map((dev) => (
                      <span key={dev._id} className="font-medium">{dev.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LuFileText className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Module</p>
                  <p className="font-medium">{bug.module || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{bug.description}</p>
          </div>

          {bug.checklist && bug.checklist.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-3">Checklist</h2>
              <div className="space-y-2">
                {bug.checklist.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {item.completed ? (
                      <LuCircleCheck  className="text-green-500 mt-1" />
                    ) : (
                      <LuCircleAlert className="text-gray-400 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className={`${item.completed ? 'line-through text-gray-500' : ''}`}>
                        {item.text}
                      </p>
                      {item.completed && item.completedBy && (
                        <p className="text-sm text-gray-500 mt-1">
                          Completed by {item.completedBy.name} on {moment(item.completedAt).format('MMMM D, YYYY')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {bug.attachments && bug.attachments.length > 0 && (
            <div>
              <h2 className="text-lg font-medium mb-3">Attachments</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bug.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <LuFileText className="text-gray-400" />
                    <span className="text-blue-600 hover:text-blue-800 truncate">
                      {attachment.split('/').pop()}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewAssignedBug;
