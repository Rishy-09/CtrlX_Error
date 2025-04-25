import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import UserAvatar from './UserAvatar';

const BugListTable = ({ tableData = [], showAssignee = true }) => {
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Closed': return 'bg-green-100 text-green-500 border border-green-200';
      case 'Testing': return 'bg-lime-100 text-lime-500 border border-lime-200';
      case 'Open': return 'bg-purple-100 text-purple-500 border border-purple-200';
      case 'In Progress': return 'bg-cyan-100 text-cyan-500 border border-cyan-200';
      case 'Reopened': return 'bg-orange-100 text-orange-500 border border-orange-200';
      default: return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };
  
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-500 border border-red-200';
      case 'High': return 'bg-orange-100 text-orange-500 border border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-500 border border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-500 border border-green-200';
      default: return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-500 border border-red-200';
      case 'Blocker': return 'bg-red-100 text-red-500 border border-red-200';
      case 'Major': return 'bg-orange-100 text-orange-500 border border-orange-200';
      case 'Minor': return 'bg-green-100 text-green-500 border border-green-200';
      default: return 'bg-gray-100 text-gray-500 border border-gray-200';
    }
  };
  
  const getBugDetailsLink = (bugId) => {
    return `/bugs/${bugId}`;
  };
  
  if (!tableData || tableData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No bugs found.
      </div>
    );
  }
  
  return (
    <div className='overflow-x-auto rounded-lg mt-3'> 
      <table className='min-w-full'>
        <thead>
          <tr className='text-left bg-gray-50 dark:bg-gray-700'>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Title</th>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Status</th>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Priority</th>
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Severity</th>
            {showAssignee && <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px]'>Assignee</th>}
            <th className='py-3 px-4 text-gray-800 dark:text-gray-200 font-medium text-[13px] hidden md:table-cell'>Reported</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((bug) => (
            <tr key={bug._id} className='border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'>
              <td className='py-3 px-4'>
                <Link to={getBugDetailsLink(bug._id)} className="text-blue-600 dark:text-blue-400 hover:underline">
                  <span className='text-gray-700 dark:text-gray-300 text-[13px] line-clamp-1'>{bug.title}</span>
                </Link>
              </td>
              <td className='py-3 px-4'>
                <span className={`px-2 py-1 text-xs rounded inline-block ${getStatusBadgeColor(bug.status)}`}>
                  {bug.status}
                </span>
              </td>
              <td className='py-3 px-4'>
                <span className={`px-2 py-1 text-xs rounded inline-block ${getPriorityBadgeColor(bug.priority)}`}>
                  {bug.priority}
                </span>
              </td>
              <td className='py-3 px-4'>
                <span className={`px-2 py-1 text-xs rounded inline-block ${getSeverityBadgeColor(bug.severity)}`}>
                  {bug.severity}
                </span>
              </td>
              {showAssignee && (
                <td className='py-3 px-4'>
                  {bug.assignedTo ? (
                    <div className="flex items-center">
                      <UserAvatar user={bug.assignedTo} size="xs" showName={true} />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Unassigned</span>
                  )}
                </td>
              )}
              <td className='py-3 px-4 text-gray-700 dark:text-gray-300 text-[13px] text-nowrap hidden md:table-cell'>
                {bug.createdAt ? moment(bug.createdAt).format('MMM D, YYYY') : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BugListTable; 