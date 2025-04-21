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
import { LuArrowRight, LuUpload } from 'react-icons/lu';

const TesterDashboard = () => {
  useUserAuth();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [bugSubmission, setBugSubmission] = useState({
    title: '',
    description: '',
    todoChecklist: [{ text: '', completed: false }],
    files: []
  });
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    getDashboardData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBugSubmission(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChecklistItemChange = (index, e) => {
    const { value } = e.target;
    setBugSubmission(prev => {
      const updatedChecklist = [...prev.todoChecklist];
      updatedChecklist[index] = { ...updatedChecklist[index], text: value };
      return { ...prev, todoChecklist: updatedChecklist };
    });
  };

  const addChecklistItem = () => {
    setBugSubmission(prev => ({
      ...prev,
      todoChecklist: [...prev.todoChecklist, { text: '', completed: false }]
    }));
  };

  const removeChecklistItem = (index) => {
    setBugSubmission(prev => {
      const updatedChecklist = prev.todoChecklist.filter((_, i) => i !== index);
      return { ...prev, todoChecklist: updatedChecklist.length ? updatedChecklist : [{ text: '', completed: false }] };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setBugSubmission(prev => ({
      ...prev,
      files: [...files]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      if (!bugSubmission.title.trim()) {
        toast.error('Bug title is required');
        setSubmitting(false);
        return;
      }

      // Only include checklist items that have text
      const filteredChecklist = bugSubmission.todoChecklist.filter(item => item.text.trim());

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('title', bugSubmission.title);
      formData.append('description', bugSubmission.description);
      formData.append('todoChecklist', JSON.stringify(filteredChecklist));
      
      // Append each file
      bugSubmission.files.forEach(file => {
        formData.append('attachments', file);
      });

      // Submit the bug
      const response = await axiosInstance.post(API_PATHS.BUGS.CREATE_BUG, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Bug reported successfully');
      
      // Clear the form
      setBugSubmission({
        title: '',
        description: '',
        todoChecklist: [{ text: '', completed: false }],
        files: []
      });
      
      // Refresh dashboard data
      getDashboardData();
    } catch (error) {
      console.error('Error submitting bug:', error);
      toast.error(error.response?.data?.message || 'Failed to submit bug');
    } finally {
      setSubmitting(false);
    }
  };

  const viewAllBugs = () => {
    navigate('/tester/bugs');
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
            label="Total Bugs Reported"
            value={addThousandsSeparator(
              dashboardData?.bugsReported?.total || 0
            )}
            color="bg-primary"
          />  
          <InfoCard 
            label="Open Bugs"
            value={addThousandsSeparator(
              dashboardData?.bugsReported?.open || 0
            )}
            color="bg-violet-500"
          />  
          <InfoCard 
            label="In Progress"
            value={addThousandsSeparator(
              dashboardData?.bugsReported?.inProgress || 0
            )}
            color="bg-cyan-500"
          /> 
          <InfoCard 
            label="Resolved Bugs"
            value={addThousandsSeparator(
              dashboardData?.bugsReported?.resolved || 0
            )}
            color="bg-lime-500"
          /> 
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 my-6'>
        <div className='md:col-span-2'>
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h5 className='text-lg font-semibold'>Create Bug Report</h5>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bug Title *</label>
                <input
                  type="text"
                  name="title"
                  value={bugSubmission.title}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter a descriptive title for the bug"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bug Description</label>
                <textarea
                  name="description"
                  value={bugSubmission.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe the bug in detail"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bug Checklist</label>
                {bugSubmission.todoChecklist.map((item, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleChecklistItemChange(index, e)}
                      className="flex-grow rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary mr-2"
                      placeholder="Add checklist item"
                    />
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="text-primary text-sm mt-1 hover:text-primary-dark"
                >
                  + Add checklist item
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                  <div className="flex items-center justify-center">
                    <LuUpload className="text-gray-400 mr-2" />
                    <span className="text-sm text-gray-500">
                      {bugSubmission.files.length
                        ? `${bugSubmission.files.length} file(s) selected`
                        : 'Click to upload or drag and drop'}
                    </span>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                </div>
                {bugSubmission.files.length > 0 && (
                  <div className="mt-2">
                    <ul className="text-sm text-gray-600">
                      {bugSubmission.files.map((file, index) => (
                        <li key={index} className="truncate">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className={`btn-primary w-full ${submitting ? 'opacity-75' : ''}`}
              >
                {submitting ? 'Submitting...' : 'Submit Bug Report'}
              </button>
            </form>
          </div>
        </div>
        
        <div className='md:col-span-1'>
          <div className='card'>
            <div className='flex items-center justify-between mb-4'>
              <h5 className='text-lg font-semibold'>Recent Bugs</h5>
              <button className='card-btn' onClick={viewAllBugs}>
                View All <LuArrowRight className='text-base' />
              </button>
            </div>
            
            {dashboardData?.recentBugs && dashboardData.recentBugs.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentBugs.map(bug => (
                  <div key={bug._id} className="border-b border-gray-100 pb-3">
                    <h6 className="font-medium text-sm">{bug.title}</h6>
                    <div className="flex justify-between mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        bug.status === 'Open' ? 'bg-red-100 text-red-700' :
                        bug.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {bug.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {moment(bug.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                No recent bugs reported
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TesterDashboard; 