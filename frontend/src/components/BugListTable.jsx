import React from 'react';
import moment from 'moment';

const BugListTable = ({ bugs = [], onRowClick }) => { // Added onRowClick prop
  const getStatusBadgeColor = (status) => {
    // Default to "Open" if status is missing
    if (!status) return 'bg-red-100 text-red-500 border border-red-200';
    
    // Fix naming inconsistencies
    const normalizedStatus = status === 'Open' ? 'Open' : 
                            status === 'In Progress' ? 'In Progress' :
                            status === 'Closed' ? 'Closed' :
                            status;
    
    switch (normalizedStatus) {
      case 'Closed': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Open': return 'bg-red-100 text-red-600 border border-red-200';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-700 border border-gray-200';
    
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-600 border border-red-200';
      case 'Medium': return 'bg-orange-100 text-orange-600 border border-orange-200';
      case 'Low': return 'bg-green-100 text-green-600 border border-green-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    if (!severity) return 'bg-blue-100 text-blue-600 border border-blue-200'; // Default to Minor
    
    switch (severity) {
      case 'Critical': return 'bg-red-200 text-red-700 border border-red-300';
      case 'Major': return 'bg-orange-200 text-orange-700 border border-orange-300';
      case 'Minor': return 'bg-blue-100 text-blue-600 border border-blue-200';
      // Alternative naming
      case 'High': return 'bg-red-200 text-red-700 border border-red-300';
      case 'Medium': return 'bg-orange-200 text-orange-700 border border-orange-300';
      case 'Low': return 'bg-blue-100 text-blue-600 border border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const handleRowClick = (bug) => {
    if (onRowClick && bug._id) {
      onRowClick(bug._id);
    }
  };

  return (
    <div className="overflow-x-auto p-0 rounded-lg mt-3">
      <table className="min-w-full">
        <thead>
          <tr className="text-left">
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Title</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Status</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Priority</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px]">Severity</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">Module</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">Assigned To</th>
            <th className="py-3 px-4 text-gray-800 font-medium text-[13px] hidden md:table-cell">Created On</th>
          </tr>
        </thead>

        <tbody>
          {bugs.length > 0 ? (
            bugs.map((bug) => (
              <tr 
                key={bug._id} 
                className={`border-t border-gray-200 ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => handleRowClick(bug)}
              >
                <td className="py-3 px-4 text-gray-700 text-[13px] line-clamp-1 overflow-hidden">
                  {bug.title || 'Untitled Bug'}
                </td>

                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded inline-block ${getStatusBadgeColor(bug.status)}`}>
                    {bug.status || 'Open'}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded inline-block ${getPriorityBadgeColor(bug.priority)}`}>
                    {bug.priority || 'Medium'}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded inline-block ${getSeverityBadgeColor(bug.severity)}`}>
                    {bug.severity || 'Minor'}
                  </span>
                </td>

                <td className="py-3 px-4 text-gray-700 text-[13px] hidden md:table-cell">
                  {bug.module || 'N/A'}
                </td>

                <td className="py-3 px-4 text-gray-700 text-[13px] hidden md:table-cell">
                  {(bug.assignedTo || []).length > 0
                    ? bug.assignedTo.map(user => user.name || 'User').join(', ')
                    : 'Unassigned'}
                </td>

                <td className="py-3 px-4 text-gray-700 text-[13px] hidden md:table-cell">
                  {bug.createdAt ? moment(bug.createdAt).format('Do MMM YYYY') : 'N/A'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-6 text-gray-400 text-sm">
                No bugs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BugListTable;
