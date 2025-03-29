import { motion } from 'framer-motion';
import { useState } from 'react';
import { PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Projects() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(null);
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'E-commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      progress: 75,
      status: 'In Progress',
      members: [
        'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
      ],
      stats: {
        totalBugs: 24,
        openBugs: 8,
        criticalBugs: 2
      }
    },
    {
      id: 2,
      name: 'Mobile App Redesign',
      description: 'Redesigning the mobile app UI/UX for better user engagement',
      progress: 45,
      status: 'In Progress',
      members: [
        'https://images.unsplash.com/photo-1550525811-e5869dd03032?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
      ],
      stats: {
        totalBugs: 15,
        openBugs: 5,
        criticalBugs: 1
      }
    },
  ]);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    const project = {
      id: Date.now(),
      ...newProject,
      progress: 0,
      status: 'Not Started',
      members: [],
      stats: {
        totalBugs: 0,
        openBugs: 0,
        criticalBugs: 0
      }
    };
    setProjects([...projects, project]);
    setShowNewProjectModal(false);
    setNewProject({ name: '', description: '', startDate: '', endDate: '' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNewProjectModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Project
          </motion.button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer"
              onClick={() => setShowProjectDetails(project)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'In Progress' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500">{project.description}</p>
                
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Bugs</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{project.stats.totalBugs}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Open</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{project.stats.openBugs}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Critical</p>
                    <p className="mt-1 text-lg font-semibold text-red-600">{project.stats.criticalBugs}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">{project.progress}% complete</span>
                  </div>
                  <div className="mt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {project.members.map((member, i) => (
                      <img
                        key={i}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                        src={member}
                        alt=""
                      />
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    View Details
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowNewProjectModal(false)}></div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
              <form onSubmit={handleCreateProject}>
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Project</h3>
                  <div className="mt-2 space-y-6">
                    <div>
                      <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">Project Name</label>
                      <input
                        type="text"
                        id="project-name"
                        required
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        id="description"
                        rows={3}
                        required
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        id="start-date"
                        required
                        value={newProject.startDate}
                        onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        id="end-date"
                        required
                        value={newProject.endDate}
                        onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewProjectModal(false)}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectDetails && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowProjectDetails(null)}></div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block bg-white rounded-lg px-4 pt-5 pb-4 text-left shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
            >
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {showProjectDetails.name}
                  </h3>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      {showProjectDetails.description}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900">Team Members</h4>
                    <div className="mt-2 flex -space-x-2">
                      {showProjectDetails.members.map((member, i) => (
                        <img
                          key={i}
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
                          src={member}
                          alt=""
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900">Progress</h4>
                    <div className="mt-2">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${showProjectDetails.progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{showProjectDetails.progress}% Complete</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900">Statistics</h4>
                    <dl className="mt-2 grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Total Bugs</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">{showProjectDetails.stats.totalBugs}</dd>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Open Bugs</dt>
                        <dd className="mt-1 text-lg font-semibold text-gray-900">{showProjectDetails.stats.openBugs}</dd>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <dt className="text-sm font-medium text-gray-500">Critical Bugs</dt>
                        <dd className="mt-1 text-lg font-semibold text-red-600">{showProjectDetails.stats.criticalBugs}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowProjectDetails(null)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}