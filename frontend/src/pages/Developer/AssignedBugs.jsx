import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';
import moment from 'moment';
import { LuClock, LuCalendar, LuSearch } from 'react-icons/lu';
import { STATUS_DATA } from '../../utils/data';

const AssignedBugs = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  useEffect(() => {
    if (user?._id) {
      fetchAssignedBugs();
    }
  }, [user]);

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch = bug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-red-100 text-red-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
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

  return (
    <DashboardLayout activeMenu="Assigned Bugs">
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-medium mb-4 md:mb-0">Assigned Bugs</h1>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bugs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              />
              <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Loading assigned bugs...</p>
          </div>
        ) : filteredBugs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">No bugs assigned to you</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredBugs.map((bug) => (
              <div
                key={bug._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/developer/assigned-bugs/${bug._id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h2 className="text-lg font-medium mb-2 md:mb-0">{bug.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(bug.status)}`}>
                      {bug.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(bug.priority)}`}>
                      {bug.priority}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{bug.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <LuCalendar className="text-gray-400" />
                    Reported on {moment(bug.createdAt).format('MMM D, YYYY')}
                  </span>
                  <span className="flex items-center gap-1">
                    <LuClock className="text-gray-400" />
                    Due {moment(bug.dueDate).format('MMM D, YYYY')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssignedBugs; 