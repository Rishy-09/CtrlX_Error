import React, { useState, useContext, useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import { UserContext } from '../../context/userContext';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths.js';
import moment from 'moment';
import { addThousandsSeparator } from '../../utils/helper';
import InfoCard from '../../components/Cards/InfoCard';
import { toast } from 'react-hot-toast';
import { ArrowRight, Bell, CheckSquare, X } from 'lucide-react';

const AdminBugDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [recentBugs, setRecentBugs] = useState([]);
  const [resolvedBugs, setResolvedBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState({ isOpen: false, bugId: null });
  const [assignFormData, setAssignFormData] = useState({
    developerId: '',
    dueDate: moment().add(7, 'days').format('YYYY-MM-DD')
  });
  const [developers, setDevelopers] = useState([]);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_DASHBOARD_DATA);
      if (response.data) {
        setDashboardData(response.data);
        
        // Extract notifications
        if (response.data.notifications) {
          setNotifications(response.data.notifications);
        }
        
        // Extract recent bugs
        if (response.data.recentBugs) {
          setRecentBugs(response.data.recentBugs);
        }
        
        // Extract resolved bugs awaiting review
        if (response.data.resolvedBugs) {
          setResolvedBugs(response.data.resolvedBugs);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getDevelopers = async () => {
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
    getDashboardData();
    getDevelopers();
  }, []);

  const viewBugDetails = (bugId) => {
    navigate(`/admin/bugs/${bugId}`);
  };

  const viewAllBugs = () => {
    navigate('/admin/bugs');
  };

  const handleAssignBug = (bugId) => {
    setAssignModal({ isOpen: true, bugId });
  };

  const closeAssignModal = () => {
    setAssignModal({ isOpen: false, bugId: null });
    setAssignFormData({
      developerId: '',
      dueDate: moment().add(7, 'days').format('YYYY-MM-DD')
    });
  };

  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitAssignBug = async (e) => {
    e.preventDefault();
    
    try {
      if (!assignFormData.developerId) {
        toast.error('Please select a developer');
        return;
      }
      
      const response = await axiosInstance.put(
        `${API_PATHS.BUGS.ASSIGN_BUG}/${assignModal.bugId}`, 
        {
          assignedTo: assignFormData.developerId,
          dueDate: assignFormData.dueDate
        }
      );
      
      toast.success('Bug assigned successfully');
      closeAssignModal();
      getDashboardData();
    } catch (error) {
      console.error('Error assigning bug:', error);
      toast.error('Failed to assign bug');
    }
  };

  const handleMarkCompleted = async (bugId) => {
    try {
      await axiosInstance.put(`${API_PATHS.BUGS.UPDATE_BUG_STATUS}/${bugId}`, {
        status: 'Closed'
      });
      
      toast.success('Bug marked as completed');
      getDashboardData();
    } catch (error) {
      console.error('Error updating bug status:', error);
      toast.error('Failed to update bug status');
    }
  };

  const dismissNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
    // Here you would also make an API call to update the notification status in the backend
  };

  return (
    <DashboardLayout activeMenu="Bug Dashboard">
      <div className='card my-5'>
        <div>
          <div className='col-span-3'>
            <h2 className='text-xl md:text-2xl'>Bug Tracking Dashboard</h2>
            <p className='text-xs md:text-[13px] text-gray-400 mt-1.5'>
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
          <InfoCard 
            label="Total Bugs"
            value={addThousandsSeparator(
              dashboardData?.bugStats?.total || 0
            )}
            color="bg-primary"
          />  
          <InfoCard 
            label="Open Bugs"
            value={addThousandsSeparator(
              dashboardData?.bugStats?.open || 0
            )}
            color="bg-violet-500"
          />  
          <InfoCard 
            label="In Progress"
            value={addThousandsSeparator(
              dashboardData?.bugStats?.inProgress || 0
            )}
            color="bg-yellow-500"
          /> 
          <InfoCard 
            label="Resolved"
            value={addThousandsSeparator(
              dashboardData?.bugStats?.resolved || 0
            )}
            color="bg-green-500"
          /> 
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 my-6'>
        {/* Notifications Panel */}
        <div className='card md:col-span-1'>
          <div className='flex items-center justify-between mb-4'>
            <h5 className='text-lg font-semibold flex items-center'>
              <Bell className="mr-2" /> Notifications
            </h5>
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div key={notification._id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <span className="text-xs text-gray-500">{moment(notification.createdAt).fromNow()}</span>
                  </div>
                  <div className="flex space-x-2">
                    {notification.type === 'bug_reported' && (
                      <button 
                        onClick={() => viewBugDetails(notification.bugId)}
                        className="text-primary hover:text-primary-dark text-sm"
                      >
                        View
                      </button>
                    )}
                    <button 
                      onClick={() => dismissNotification(notification._id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No new notifications
            </div>
          )}
        </div>

        {/* Recent Bugs Panel */}
        <div className='card md:col-span-2'>
          <div className='flex items-center justify-between mb-4'>
            <h5 className='text-lg font-semibold'>Recent Bugs</h5>
            <button className='card-btn' onClick={viewAllBugs}>
              View All <ArrowRight className='text-base' />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : recentBugs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBugs.map(bug => (
                    <tr key={bug._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary" 
                                onClick={() => viewBugDetails(bug._id)}>
                              {bug.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {moment(bug.createdAt).format('MMM DD, YYYY')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{bug.reporter?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bug.status === 'Open' ? 'bg-red-100 text-red-800' : 
                          bug.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                          bug.status === 'Testing' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {bug.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => viewBugDetails(bug._id)}
                          className="text-primary hover:text-primary-dark mr-3">
                          View
                        </button>
                        {bug.status === 'Open' && (
                          <button 
                            onClick={() => handleAssignBug(bug._id)}
                            className="text-blue-600 hover:text-blue-800">
                            Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent bugs found
            </div>
          )}
        </div>
      </div>

      {/* Resolved Bugs Awaiting Review */}
      {resolvedBugs && resolvedBugs.length > 0 && (
        <div className="card mt-2">
          <h5 className="text-lg font-semibold mb-4 flex items-center">
            <CheckSquare className="mr-2 text-green-500" /> Resolved Bugs Awaiting Review
          </h5>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved On</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resolvedBugs.map(bug => (
                  <tr key={bug._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary" 
                              onClick={() => viewBugDetails(bug._id)}>
                            {bug.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reported by {bug.reporter?.name || 'Unknown'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {bug.assignedTo && bug.assignedTo.length > 0 
                          ? bug.assignedTo[0].name || 'Unknown' 
                          : 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {moment(bug.updatedAt).format('MMM DD, YYYY')}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => viewBugDetails(bug._id)}
                        className="text-primary hover:text-primary-dark mr-3">
                        View
                      </button>
                      <button 
                        onClick={() => handleMarkCompleted(bug._id)}
                        className="text-green-600 hover:text-green-800">
                        Mark Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bug assignment modal */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Assign Bug to Developer</h3>
            
            <form onSubmit={submitAssignBug}>
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
                  onClick={closeAssignModal}
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

export default AdminBugDashboard; 