import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { XMarkIcon } from '@heroicons/react/24/outline';
import Modal from '../components/common/Modal';
import CommentSection from '../components/CommentSection';

const issueStatuses = ['Unsolved', 'In Progress', 'Solved'];

const initialIssues = {
  'Unsolved': [
    { id: '1', title: 'Login page not responsive', priority: 'High', type: 'Bug', description: 'The login page breaks on mobile devices smaller than 320px width.' },
    { id: '2', title: 'Add user authentication', priority: 'Medium', type: 'Feature', description: 'Implement OAuth2 authentication flow for social login.' },
  ],
  'In Progress': [
    { id: '3', title: 'Fix payment gateway', priority: 'Critical', type: 'Bug', description: 'Payment confirmation emails are not being sent after successful transactions.' },
  ],
  'Solved': [
    { id: '4', title: 'Implement dark mode', priority: 'Low', type: 'Enhancement', description: 'Add system-wide dark mode support with theme persistence.' },
    { id: '5', title: 'Update documentation', priority: 'Medium', type: 'Task', description: 'Update API documentation with new endpoints and response formats.' },
  ],
};

export default function Issues() {
  const [issues, setIssues] = useState(initialIssues);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [currentUser] = useState('John Doe'); // In a real app, this would come from auth context
  const [currentRole] = useState('Developer'); // In a real app, this would come from auth context

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const sourceIssues = [...issues[sourceStatus]];
    const destIssues = sourceStatus === destStatus ? sourceIssues : [...issues[destStatus]];
    const [removed] = sourceIssues.splice(source.index, 1);
    destIssues.splice(destination.index, 0, removed);

    setIssues({
      ...issues,
      [sourceStatus]: sourceIssues,
      [destStatus]: destIssues,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Issues</h1>
        <div className="mt-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {issueStatuses.map((status) => (
                <div key={status} className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">{status}</h2>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-3"
                      >
                        <AnimatePresence>
                          {issues[status].map((issue, index) => (
                            <Draggable key={issue.id} draggableId={issue.id} index={index}>
                              {(provided) => (
                                <motion.div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="bg-white p-4 rounded-md shadow-sm cursor-pointer"
                                  onClick={() => setSelectedIssue(issue)}
                                >
                                  <h3 className="text-sm font-medium text-gray-900">{issue.title}</h3>
                                  <div className="mt-2 flex space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      issue.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                                      issue.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                                      issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {issue.priority}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {issue.type}
                                    </span>
                                  </div>
                                </motion.div>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>

      {/* Issue Details Modal */}
      <Modal
        isOpen={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
        title={selectedIssue?.title}
      >
        {selectedIssue && (
          <div className="space-y-6">
            <div>
              <div className="flex space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedIssue.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                  selectedIssue.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                  selectedIssue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedIssue.priority}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {selectedIssue.type}
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-500">{selectedIssue.description}</p>
            </div>

            {/* Comments Section */}
            <CommentSection
              issueId={selectedIssue.id}
              currentUser={currentUser}
              currentRole={currentRole}
            />
          </div>
        )}
      </Modal>
    </motion.div>
  );
}