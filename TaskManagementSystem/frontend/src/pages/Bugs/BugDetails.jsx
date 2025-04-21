import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths.js';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calendar, Check, Clock, Download, Edit, Paperclip, User } from 'lucide-react';

const BugDetails = () => {
  useUserAuth();
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [bug, setBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    developerId: '',
    dueDate: moment().add(7, 'days').format('YYYY-MM-DD')
  });

  const fetchBugDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_PATHS.BUGS.GET_BUG_BY_ID}/${id}`);
      if (response.data && response.data.bug) {
        setBug(response.data.bug);
      }
    } catch (error) {
      console.error('Error fetching bug details:', error);
      toast.error('Failed to load bug details');
    } finally {
      setLoading(false);
    }
  };

  const getDevelopers = async () => {
    if (user.role !== 'admin') return;
    
    try {
      const response = await axiosInstance.get(API_PATHS.USERS.GET_DEVELOPERS);
      if (response.data && response.data.developers) {
        setDevelopers(response.data.developers);
      }
    } catch (error) {
      console.error('Error fetching developers:', error);
    }
  };

  useEffect(() => {
    fetchBugDetails();
    getDevelopers();
  }, [id]);

  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssignBug = async (e) => {
    e.preventDefault();
    
    try {
      if (!assignFormData.developerId) {
        toast.error('Please select a developer');
        return;
      }
      
      await axiosInstance.put(
        `${API_PATHS.BUGS.ASSIGN_BUG}/${id}`, 
        {
          assignedTo: assignFormData.developerId,
          dueDate: assignFormData.dueDate
        }
      );
      
      toast.success('Bug assigned successfully');
      setShowAssignForm(false);
      fetchBugDetails();
    } catch (error) {
      console.error('Error assigning bug:', error);
      toast.error('Failed to assign bug');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axiosInstance.put(`${API_PATHS.BUGS.UPDATE_BUG_STATUS}/${id}`, {
        status: newStatus
      });
      
      toast.success(`Bug marked as ${newStatus}`);
      fetchBugDetails();
    } catch (error) {
      console.error('Error updating bug status:', error);
      toast.error('Failed to update bug status');
    }
  };

  const toggleChecklistItem = async (index) => {
    if (!bug || !bug.todoChecklist) return;
    
    try {
      const updatedChecklist = [...bug.todoChecklist];
      updatedChecklist[index].completed = !updatedChecklist[index].completed;
      
      await axiosInstance.put(`${API_PATHS.BUGS.UPDATE_BUG_CHECKLIST}/${id}`, {
        todoChecklist: updatedChecklist
      });
      
      // Update the local state
      setBug(prev => ({
        ...prev,
        todoChecklist: updatedChecklist,
        progress: Math.round(
          (updatedChecklist.filter(item => item.completed).length / updatedChecklist.length) * 100
        )
      }));
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Failed to update checklist');
    }
  };

  const downloadAttachment = async (attachmentId, filename) => {
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.ATTACHMENTS.DOWNLOAD}/${attachmentId}`,
        { responseType: 'blob' }
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast.error('Failed to download attachment');
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // Calculate if a bug is overdue
  const isOverdue = (dueDate) => {
    return dueDate && moment(dueDate).isBefore(moment());
  };

  // Functions to determine what actions are available based on role and bug status
  const canAssign = () => user.role === 'admin' && bug.status === 'Open';
  const canMarkInProgress = () => 
    (user.role === 'developer' && 
     bug.assignedTo?.some(dev => dev._id === user._id) && 
     bug.status === 'Open');
  const canMarkResolved = () => 
    (user.role === 'developer' && 
     bug.assignedTo?.some(dev => dev._id === user._id) && 
     bug.status === 'In Progress');
  const canMarkClosed = () => 
    user.role === 'admin' && bug.status === 'Testing';
  
  if (loading) {
    return (
      <DashboardLayout activeMenu="Bugs">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!bug) {
    return (
      <DashboardLayout activeMenu="Bugs">
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Bug not found or you don't have permission to view it.</p>
          <button 
            onClick={goBack} 
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Bugs">
      <div className="mb-4">
        <button 
          onClick={goBack}
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowLeft className="mr-1" /> Back
        </button>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{bug.title}</h1>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <span className="flex items-center mr-4">
                <Clock className="mr-1" /> Reported {moment(bug.createdAt).fromNow()}
              </span>
              {bug.dueDate && (
                <span className="flex items-center">
                  <Calendar className="mr-1" /> Due {moment(bug.dueDate).format('MMM DD, YYYY')}
                  {isOverdue(bug.dueDate) && 
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Overdue
                    </span>
                  }
                </span>
              )}
            </div>
          </div>
          <div className="flex">
            <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${
              bug.status === 'Open' ? 'bg-red-100 text-red-800' : 
              bug.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
              bug.status === 'Testing' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {bug.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {bug.description || 'No description provided.'}
              </div>
            </div>

            {bug.todoChecklist && bug.todoChecklist.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Checklist</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${bug.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{bug.progress || 0}% complete</span>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {bug.todoChecklist.map((item, index) => (
                      <li key={index} className="py-2">
                        <div className="flex items-center">
                          {(user.role === 'developer' || user.role === 'admin') && (
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleChecklistItem(index)}
                              className="w-4 h-4 text-primary rounded focus:ring-primary-light mr-2"
                            />
                          )}
                          <span className={item.completed ? 'line-through text-gray-500' : ''}>
                            {item.text}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {bug.attachments && bug.attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Attachments</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {bug.attachments.map((attachment) => (
                      <li key={attachment._id} className="py-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Paperclip className="text-gray-500 mr-2" />
                            <span>{attachment.originalFilename || 'Attachment'}</span>
                          </div>
                          <button
                            onClick={() => downloadAttachment(attachment._id, attachment.originalFilename)}
                            className="text-primary hover:text-primary-dark"
                          >
                            <Download />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Details</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Reporter</label>
                  <div className="flex items-center mt-1">
                    <User className="text-gray-500 mr-2" />
                    <span>{bug.reporter?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                  {bug.assignedTo && bug.assignedTo.length > 0 ? (
                    bug.assignedTo.map(dev => (
                      <div key={dev._id} className="flex items-center mt-1">
                        <User className="text-gray-500 mr-2" />
                        <span>{dev.name || 'Unknown'}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 mt-1">Not assigned</div>
                  )}
                </div>
                
                {bug.priority && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${
                        bug.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        bug.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bug.priority}
                      </span>
                    </div>
                  </div>
                )}
                
                {bug.severity && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs font-medium rounded-full ${
                        bug.severity === 'Critical' || bug.severity === 'Blocker' ? 'bg-red-100 text-red-800' : 
                        bug.severity === 'Major' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {bug.severity}
                      </span>
                    </div>
                  </div>
                )}
                
                {bug.environment && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700">Environment</label>
                    <div className="mt-1 text-sm">{bug.environment}</div>
                  </div>
                )}
                
                {bug.version && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Version</label>
                    <div className="mt-1 text-sm">{bug.version}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {canAssign() && (
                <button 
                  onClick={() => setShowAssignForm(true)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center justify-center"
                >
                  <User className="mr-2" /> Assign to Developer
                </button>
              )}
              
              {canMarkInProgress() && (
                <button
                  onClick={() => handleStatusChange('In Progress')}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center justify-center"
                >
                  Start Working on Bug
                </button>
              )}
              
              {canMarkResolved() && (
                <button
                  onClick={() => handleStatusChange('Testing')}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                >
                  <Check className="mr-2" /> Mark as Resolved
                </button>
              )}
              
              {canMarkClosed() && (
                <button
                  onClick={() => handleStatusChange('Closed')}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
                >
                  <Check className="mr-2" /> Mark as Completed
                </button>
              )}
              
              {(user.role === 'admin' || bug.reporter?._id === user._id) && (
                <button
                  onClick={() => navigate(`/bugs/edit/${id}`)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center"
                >
                  <Edit className="mr-2" /> Edit Bug
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Bug Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Bug to Developer</h3>
            
            <form onSubmit={handleAssignBug}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
                <select
                  name="developerId"
                  value={assignFormData.developerId}
                  onChange={handleAssignFormChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a developer</option>
                  {developers.map(developer => (
                    <option key={developer._id} value={developer._id}>
                      {developer.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={assignFormData.dueDate}
                  onChange={handleAssignFormChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  min={moment().format('YYYY-MM-DD')}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-dark"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default BugDetails; 