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
import BugListTable from '../../components/BugListTable';
import { LuArrowRight } from 'react-icons/lu';
import CustomPieChart from '../../components/Charts/CustomPieChart';
import CustomBarChart from '../../components/Charts/CustomBarChart';
import toast from 'react-hot-toast';

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const DeveloperDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [severityData, setSeverityData] = useState([]);

  // Prepare Chart Data
  const prepareChartData = (data) => {
    if (!data) return;

    const bugDistribution = data.bugDistribution || {};
    const bugPriorityLevels = data.bugPriorityLevels || {};

    const bugDistributionData = [
      { status: 'Pending', count: bugDistribution.Open || 0 },
      { status: 'In Progress', count: bugDistribution['In Progress'] || 0 },
      { status: 'Resolved', count: bugDistribution.Closed || 0 },
    ];
    setPieChartData(bugDistributionData);

    const severityData = [
      { severity: 'Critical', count: bugPriorityLevels.High || 0 },
      { severity: 'Major', count: bugPriorityLevels.Medium || 0 },
      { severity: 'Minor', count: bugPriorityLevels.Low || 0 },
    ];
    setSeverityData(severityData);
  };

  const getDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.DEVELOPER);
      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data.charts);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  const onSeeAllBugs = () => {
    navigate('/developer/assigned-bugs');
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div className="col-span-3">
          <h2 className="text-xl md:text-2xl">Welcome, {user?.name}</h2>
          <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
            {moment().format("dddd Do MMM YYYY")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Assigned Bugs"
            value={addThousandsSeparator(dashboardData?.statistics?.totalBugs || 0)}
            color="bg-primary"
          />
          <InfoCard
            label="Pending Bugs"
            value={addThousandsSeparator(dashboardData?.statistics?.openBugs || 0)}
            color="bg-red-500"
          />
          <InfoCard
            label="In Progress Bugs"
            value={addThousandsSeparator(dashboardData?.statistics?.inProgressBugs || 0)}
            color="bg-yellow-500"
          />
          <InfoCard
            label="Resolved Bugs"
            value={addThousandsSeparator(dashboardData?.statistics?.closedBugs || 0)}
            color="bg-green-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Assigned Bugs Status</h5>
          </div>
          <CustomPieChart data={pieChartData} colors={COLORS} />
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Bugs by Priority</h5>
          </div>
          <CustomBarChart data={severityData} />
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="text-lg">Your Assigned Bugs</h5>
              <button className="card-btn" onClick={onSeeAllBugs}>
                See All <LuArrowRight className="text-base" />
              </button>
            </div>
            <BugListTable 
              bugs={dashboardData?.recentBugs || []} 
              onRowClick={(bugId) => navigate(`/developer/assigned-bugs/${bugId}`)}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperDashboard;
