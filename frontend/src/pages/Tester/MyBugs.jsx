import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BugCard from '../../components/Cards/BugCard';
import BugStatusTabs from '../../components/BugStatusTabs';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useUserContext } from '../../context/userContext';
import toast from 'react-hot-toast';

const MyBugs = () => {
  const [bugs, setBugs] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [error, setError] = useState(null);

  const fetchMyBugs = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(API_PATHS.BUGS.GET_USER_BUGS(user._id));
      setBugs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      // Fallback to GET_ALL_BUGS and filter client-side
      try {
        const response = await axiosInstance.get(API_PATHS.BUGS.GET_ALL);
        const userBugs = Array.isArray(response.data) ? 
          response.data.filter(bug => bug.createdBy === user._id) : [];
        setBugs(userBugs);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch bugs');
        setBugs([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchMyBugs();
    }
  }, [user]);

  useEffect(() => {
    if (!Array.isArray(bugs) || bugs.length === 0) {
      setFilteredBugs([]);
      return;
    }
    
    if (activeTab === 'All') {
      setFilteredBugs(bugs);
    } else {
      setFilteredBugs(bugs.filter(bug => bug.status === activeTab));
    }
  }, [activeTab, bugs]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleBugClick = (bugId) => {
    navigate(`/tester/bug/${bugId}`);
  };

  const handleRefresh = () => {
    fetchMyBugs();
    toast.success('Refreshed bug list');
  };

  return (
    <DashboardLayout activeMenu="My Reported Bugs">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Reported Bugs</h1>
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

        <BugStatusTabs
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          tabs={[
            { label: 'All', count: Array.isArray(bugs) ? bugs.length : 0 },
            { label: 'Open', count: Array.isArray(bugs) ? bugs.filter(bug => bug.status === 'Open').length : 0 },
            { label: 'In Progress', count: Array.isArray(bugs) ? bugs.filter(bug => bug.status === 'In Progress').length : 0 },
            { label: 'Closed', count: Array.isArray(bugs) ? bugs.filter(bug => bug.status === 'Closed').length : 0 }
          ]}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            {bugs.length === 0 ? (
              <>
                <p className="text-gray-600 mb-4">You haven't reported any bugs yet.</p>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => navigate('/tester/report-bug')}
                >
                  Report Your First Bug
                </button>
              </>
            ) : (
              <p className="text-gray-600">No bugs found for this status.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {filteredBugs.map((bug) => (
              <BugCard
                key={bug._id}
                title={bug.title}
                description={bug.description}
                priority={bug.priority}
                severity={bug.severity}
                status={bug.status}
                module={bug.module}
                createdAt={bug.createdAt}
                dueDate={bug.dueDate}
                assignedTo={bug.assignedTo}
                attachmentCount={bug.attachments?.length || 0}
                completedChecklistCount={bug.checklist?.filter(item => item.completed).length || 0}
                totalChecklistCount={bug.checklist?.length || 0}
                onClick={() => handleBugClick(bug._id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBugs;
