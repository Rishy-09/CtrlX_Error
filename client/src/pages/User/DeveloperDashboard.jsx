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
import { LuArrowRight, LuClock } from 'react-icons/lu';

const DeveloperDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedBugs, setAssignedBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.BUGS.GET_USER_DASHBOARD_DATA
      );
      if (response.data) {
        setDashboardData(response.data);
      }
    }
    catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getAssignedBugs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_ASSIGNED_BUGS);
      if (response.data && response.data.bugs) {
        setAssignedBugs(response.data.bugs);
      }
    } catch (error) {
      console.error('Error fetching assigned bugs:', error);
      toast.error('Failed to load assigned bugs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardData();
    getAssignedBugs();
  }, []);

  const handleMarkResolved = async (bugId) => {
    try {
      await axiosInstance.put(`${API_PATHS.BUGS.UPDATE_BUG_STATUS}/${bugId}`, {
        status: 'Testing'
      });
      
      toast.success('Bug marked as resolved');
      
      // Refresh the bug list
      getAssignedBugs();
      getDashboardData();
    } catch (error) {
      console.error('Error updating bug status:', error);
      toast.error('Failed to update bug status');
    }
  };

  const viewBugDetails = (bugId) => {
    navigate(`/developer/bugs/${bugId}`);
  };

  const viewAllBugs = () => {
    navigate('/developer/bugs');
  };

  // Calculate if a bug is overdue
  const isOverdue = (dueDate) => {
    return dueDate && moment(dueDate).isBefore(moment());
  };

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className='card my-5'>
        <div>
          <div className='col-span-3'>
            <h2 className='text-xl md:text-2xl'>Good Morning, {user?.name}!</h2>
            <p className='text-xs md:text-[13px] text-gray-400 mt-1.5'>
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5'>
          <InfoCard 
            label="Assigned Bugs"
            value={addThousandsSeparator(
              dashboardData?.assignedBugs?.total || 0
            )}
            color="bg-primary"
          />  
          <InfoCard 
            label="In Progress"
            value={addThousandsSeparator(
              dashboardData?.assignedBugs?.inProgress || 0
            )}
            color="bg-violet-500"
          />  
          <InfoCard 
            label="Resolved"
            value={addThousandsSeparator(
              dashboardData?.assignedBugs?.resolved || 0
            )}
            color="bg-cyan-500"
          /> 
          <InfoCard 
            label="Overdue"
            value={addThousandsSeparator(
              dashboardData?.assignedBugs?.overdue || 0
            )}
            color="bg-red-500"
          /> 
        </div>
      </div>

      <div className='card'>
        <div className='flex items-center justify-between mb-4'>
          <h5 className='text-lg font-semibold'>Assigned Bugs</h5>
          <button className='card-btn' onClick={viewAllBugs}>
            View All <LuArrowRight className='text-base' />
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : assignedBugs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedBugs.map(bug => (
                  <tr key={bug._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-2">
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
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bug.status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 
                        bug.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {bug.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {bug.dueDate ? (
                        <div className="text-sm text-gray-900 flex items-center">
                          {isOverdue(bug.dueDate) && (
                            <span className="bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2 py-0.5 rounded-full flex items-center">
                              <LuClock className="mr-1" size={12} />
                              Overdue
                            </span>
                          )}
                          {moment(bug.dueDate).format('MMM DD, YYYY')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${bug.progress || 0}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{bug.progress || 0}%</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => viewBugDetails(bug._id)}
                        className="text-primary hover:text-primary-dark mr-3">
                        View
                      </button>
                      {(bug.status === 'Open' || bug.status === 'In Progress') && (
                        <button 
                          onClick={() => handleMarkResolved(bug._id)}
                          className="text-green-600 hover:text-green-800">
                          Mark Resolved
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
            No bugs assigned to you currently.
          </div>
        )}
      </div>
      
      {dashboardData?.upcomingDeadlines && dashboardData.upcomingDeadlines.length > 0 && (
        <div className="card mt-6">
          <h5 className="text-lg font-semibold mb-4">Upcoming Deadlines</h5>
          <div className="space-y-3">
            {dashboardData.upcomingDeadlines.map(bug => (
              <div key={bug._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{bug.title}</div>
                    <div className="text-xs text-gray-500">Due {moment(bug.dueDate).fromNow()}</div>
                  </div>
                </div>
                <button 
                  onClick={() => viewBugDetails(bug._id)}
                  className="text-primary hover:text-primary-dark text-sm font-medium">
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DeveloperDashboard; 