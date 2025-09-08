import React, { useState, useContext, useEffect } from "react";
import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/userContext";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths.js";
import moment from "moment";
import { addThousandsSeparator } from "../../utils/helper";
import InfoCard from "../../components/Cards/InfoCard";
import BugListTable from "../../components/BugListTable";
import { LuArrowRight } from "react-icons/lu";
import CustomPieChart from "../../components/Charts/CustomPieChart";
import toast from "react-hot-toast";

const COLORS = ["#8D51FF", "#00B8DB", "#7BCE00"];

const TesterDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [recentBugs, setRecentBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Prepare Chart Data
  const prepareChartData = (data) => {
    const bugDistribution = data?.bugDistribution || {};

    const bugDistributionData = [
      { status: "Open", count: bugDistribution?.Open || 0 },
      { status: "In Progress", count: bugDistribution?.InProgress || 0 },
      { status: "Closed", count: bugDistribution?.Closed || 0 },
    ];
    setPieChartData(bugDistributionData);
  };

  // Get dashboard statistics
  const getDashboardStats = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.TESTER);

      if (response.data) {
        setDashboardData(response.data);
        prepareChartData(response.data?.charts || {});
      }
      return true;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard statistics");
      return false;
    }
  };

  // Get user's bugs directly (not from dashboard)
  const getUserBugs = async () => {
    try {
      if (!user?._id) {
        console.error("User ID not available");
        return false;
      }

      const response = await axiosInstance.get(
        API_PATHS.BUGS.GET_USER_BUGS(user._id)
      );
      setRecentBugs(response.data);
      return true;
    } catch (error) {
      console.error("Error fetching user bugs:", error);
      toast.error("Failed to load recent bugs");
      return false;
    }
  };

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get dashboard stats
      await getDashboardStats();

      // Get user's bugs directly
      await getUserBugs();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
      setRecentBugs([]);
    } finally {
      setLoading(false);
    }
  };

  const onReportBug = () => {
    navigate("/tester/report-bug");
  };

  const onSeeAllBugs = () => {
    navigate("/tester/my-bugs");
  };

  const handleBugClick = (bugId) => {
    navigate(`/tester/bug/${bugId}`);
  };

  const handleRefresh = () => {
    loadDashboardData();
    toast.success("Dashboard refreshed");
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="card my-5">
        <div className="col-span-3 flex justify-between items-center">
          <div>
            <h2 className="text-xl md:text-2xl">Welcome, {user?.name}</h2>
            <p className="text-xs md:text-[13px] text-gray-400 mt-1.5">
              {moment().format("dddd Do MMM YYYY")}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors text-sm"
          >
            Refresh Dashboard
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
          <InfoCard
            label="Total Bugs Reported"
            value={addThousandsSeparator(dashboardData?.stats?.totalBugs || 0)}
            color="bg-primary"
          />
          <InfoCard
            label="Open Bugs"
            value={addThousandsSeparator(
              dashboardData?.charts?.bugDistribution?.Open || 0
            )}
            color="bg-violet-500"
          />
          <InfoCard
            label="In Progress Bugs"
            value={addThousandsSeparator(
              dashboardData?.charts?.bugDistribution?.InProgress || 0
            )}
            color="bg-cyan-500"
          />
          <InfoCard
            label="Closed Bugs"
            value={addThousandsSeparator(
              dashboardData?.charts?.bugDistribution?.Closed || 0
            )}
            color="bg-lime-500"
          />
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={onReportBug}
            className="bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition"
          >
            Report a New Bug
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <h5 className="font-medium">Your Reported Bugs Status</h5>
          </div>
          <CustomPieChart data={pieChartData} colors={COLORS} />
        </div>

        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between">
              <h5 className="text-lg">Your Recent Bug Reports</h5>
              <button className="card-btn" onClick={onSeeAllBugs}>
                See All <LuArrowRight className="text-base" />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : recentBugs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  You haven't reported any bugs yet.
                </p>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={onReportBug}
                >
                  Report Your First Bug
                </button>
              </div>
            ) : (
              <BugListTable bugs={recentBugs} onRowClick={handleBugClick} />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TesterDashboard;
