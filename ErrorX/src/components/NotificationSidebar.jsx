import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import useNotificationStore from '../store/notificationStore';
import { format } from 'date-fns';

export default function NotificationSidebar({ isOpen, onClose }) {
  const { notifications, markAsRead, clearAll } = useNotificationStore();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Notifications
                        </Dialog.Title>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            className="text-sm text-purple-600 hover:text-purple-800"
                            onClick={clearAll}
                          >
                            Clear all
                          </button>
                          <button
                            type="button"
                            className="rounded-md text-gray-400 hover:text-gray-500"
                            onClick={onClose}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="divide-y divide-gray-200">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <motion.div
                              key={notification.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 ${notification.read ? 'bg-white' : 'bg-purple-50'}`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="mt-1 text-sm text-gray-500">
                                    {notification.message}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-400">
                                    {format(new Date(notification.timestamp), 'MMM d, yyyy HH:mm')}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}