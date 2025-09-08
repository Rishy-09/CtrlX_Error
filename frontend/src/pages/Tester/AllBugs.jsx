import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BugListTable from '../../components/BugListTable';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useUserContext } from '../../context/userContext';
import toast from 'react-hot-toast';

const AllBugs = () => {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUserContext();

  const fetchAllBugs = async () => {
    setLoading(true);
    try {
      // First try to use the dedicated endpoint
      let response;
      try {
        response = await axiosInstance.get(API_PATHS.BUGS.GET_ALL_VIEWABLE_BUGS);
      } catch (err) {
        // Fallback to regular all bugs endpoint if the dedicated one isn't implemented
        response = await axiosInstance.get(API_PATHS.BUGS.GET_ALL_BUGS);
      }
      
      // Handle the new response format that includes bugs and statusSummary
      const bugsData = response.data.bugs || [];
      setBugs(bugsData);
    } catch (error) {
      console.error('Error fetching all bugs:', error);
      toast.error('Failed to load bugs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBugs();
  }, []);

  const handleBugClick = (bugId) => {
    navigate(`/tester/bug/${bugId}`);
  };

  const handleRefresh = () => {
    fetchAllBugs();
    toast.success('Refreshed bug list');
  };

  return (
    <DashboardLayout activeMenu="All Bugs">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">All Bugs</h1>
          <div className="flex gap-2">
            <button
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              onClick={handleRefresh}
            >
              Refresh
            </button>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              onClick={() => navigate('/tester/report-bug')}
            >
              Report New Bug
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : bugs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">No bugs found in the system.</p>
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => navigate('/tester/report-bug')}
              >
                Report a Bug
              </button>
            </div>
          ) : (
            <BugListTable
              bugs={bugs}
              onRowClick={handleBugClick}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AllBugs; 