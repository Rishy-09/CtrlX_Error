import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const issueStatuses = ['To Do', 'In Progress', 'In Review', 'Done'];

const initialIssues = {
  'To Do': [
    { id: '1', title: 'Login page not responsive', priority: 'High', type: 'Bug' },
    { id: '2', title: 'Add user authentication', priority: 'Medium', type: 'Feature' },
  ],
  'In Progress': [
    { id: '3', title: 'Fix payment gateway', priority: 'Critical', type: 'Bug' },
  ],
  'In Review': [
    { id: '4', title: 'Implement dark mode', priority: 'Low', type: 'Enhancement' },
  ],
  'Done': [
    { id: '5', title: 'Update documentation', priority: 'Medium', type: 'Task' },
  ],
};

export default function Issues() {
  const [issues, setIssues] = useState(initialIssues);

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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                                  className="bg-white p-4 rounded-md shadow-sm"
                                >
                                  <h3 className="text-sm font-medium text-gray-900">{issue.title}</h3>
                                  <div className="mt-2 flex space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      issue.priority === 'High' ? 'bg-red-100 text-red-800' :
                                      issue.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {issue.priority}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
    </motion.div>
  );
}