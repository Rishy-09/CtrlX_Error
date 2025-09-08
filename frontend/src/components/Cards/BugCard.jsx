import React from 'react'
import Progress from '../Progress';
import AvatarGroup from '../AvatarGroup';
import {LuPaperclip} from 'react-icons/lu';
import moment from 'moment';

const BugCard = ({
    title,
    description,
    priority,
    severity,
    status,
    module,
    createdAt,
    dueDate,
    assignedTo,
    attachmentCount,
    completedChecklistCount,
    totalChecklistCount,
    onClick,
}) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
            
            case "Closed":
                return "text-lime-500 bg-lime-50 border border-lime-500/10";

            default:
                return "text-violet-500 bg-violet-50 border border-violet-500/10";
        }
    };

    const getPriorityTagColor = () => {
        switch (priority) {
            case "Low":
                return "text-emerald-500 bg-emerald-50 border border-emerald-500/10";
            
            case "Medium":
                return "text-amber-500 bg-amber-50 border border-amber-500/10";

            default:
                return "text-rose-500 bg-rose-50 border border-rose-500/10";
        }
    }

    const getSeverityTagColor = () => {
        switch (severity) {
            case "Minor":
                return "text-blue-500 bg-blue-50 border border-blue-500/10";
            
            case "Major":
                return "text-orange-500 bg-orange-50 border border-orange-500/10";

            default:
                return "text-red-500 bg-red-50 border border-red-500/10";
        }
    }
    
    return (
        <div 
            className='bg-white rounded-xl py-4 shadow-md shadow-gray-100 border border-gray-200/50 cursor-pointer'
            onClick={onClick}
        >
            <div className='flex items-end gap-2 px-4 flex-wrap'>
                <div 
                    className={`text-[11px] font-medium ${getStatusTagColor()} px-3 py-0.5 rounded `}
                >
                    {status}
                </div>
                <div
                    className={`text-[11px] font-medium ${getPriorityTagColor()} px-3 py-0.5 rounded `}
                >
                    {priority}
                </div>
                {severity && (
                    <div
                        className={`text-[11px] font-medium ${getSeverityTagColor()} px-3 py-0.5 rounded `}
                    >
                        {severity}
                    </div>
                )}
            </div>
            <div
                className={`px-4 border-l-[3px] ${
                    status === "In Progress" 
                    ? "border-cyan-500" 
                    : status === "Closed" 
                    ? "border-lime-500" 
                    : "border-violet-500"
                } rounded-lg mt-2 py-3`}    
            >
                <p className='text-sm font-medium text-gray-800 mt-4 line-clamp-2'>
                    {title}
                </p>

                <p className='text-xs text-gray-500 mt-1.5 line-clamp-2 leading-[18px]'>
                    {description}
                </p>

                {module && (
                    <p className='text-xs text-gray-600 mt-1.5 line-clamp-1 leading-[18px]'>
                        <span className="font-medium">Module:</span> {module}
                    </p>
                )}

                <p className='text-[13px] text-gray-700/80 font-medium mt-2 mb-2 leading-[18px]'>
                    Steps Completed: {" "}
                    <span className='font-semibold text-gray-700'>
                        {completedChecklistCount || 0} / {totalChecklistCount || 0}
                    </span>
                </p>

                <Progress 
                    progress={
                        totalChecklistCount > 0 
                            ? Math.round((completedChecklistCount / totalChecklistCount) * 100) 
                            : 0
                    } 
                    status={status}
                />
            </div>

            <div className='px-4'>
                <div className='flex items-center justify-between my-1'>
                    <div>
                        <label className="text-xs text-gray-500">Reported</label>
                        <p className='text-[13px] font-medium text-gray-900'>
                            {createdAt ? moment(createdAt).format("DD MMM YYYY") : "N/A"}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500">Due Date</label>
                        <p className='text-[13px] font-medium text-gray-900'>
                            {dueDate ? moment(dueDate).format("DD MMM YYYY") : "N/A"}
                        </p>
                    </div>
                </div>

                <div className='flex items-center justify-between mt-3'>
                    <AvatarGroup avatars={assignedTo || []}/>
                    {attachmentCount > 0 && (
                        <div className='flex items-center gap-2 bg-blue-50 px-2.5 py-1.5 rounded-lg'>
                            <LuPaperclip className='text-primary'/> {" "}
                            <span className='text-xs text-gray-900'>{attachmentCount} Attachments</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};

export default BugCard;