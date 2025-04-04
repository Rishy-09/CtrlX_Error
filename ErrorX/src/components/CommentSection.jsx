import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import useCommentStore from '../store/commentStore';
import useNotificationStore from '../store/notificationStore';

export default function CommentSection({ issueId, currentUser, currentRole }) {
  const [newComment, setNewComment] = useState('');
  const { comments, addComment, toggleLike } = useCommentStore();
  const { addNotification } = useNotificationStore();
  
  const issueComments = comments.filter(comment => comment.issueId === issueId);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    addComment(issueId, newComment, currentUser, currentRole);
    addNotification({
      title: 'New Comment',
      message: `${currentUser} (${currentRole}) commented on issue #${issueId}`,
    });
    setNewComment('');
  };

  const handleLike = (commentId) => {
    toggleLike(commentId, currentUser);
    const comment = comments.find(c => c.id === commentId);
    if (!comment.likes.includes(currentUser)) {
      addNotification({
        title: 'New Like',
        message: `${currentUser} liked your comment`,
      });
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            className="h-10 w-10 rounded-full"
            src={`https://ui-avatars.com/api/?name=${currentUser}&background=random`}
            alt=""
          />
        </div>
        <div className="min-w-0 flex-1">
          <form onSubmit={handleAddComment}>
            <div className="border-b border-gray-200 focus-within:border-purple-600">
              <textarea
                rows={3}
                name="comment"
                id="comment"
                className="block w-full resize-none border-0 border-b border-transparent p-0 pb-2 focus:border-purple-600 focus:ring-0 sm:text-sm"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <div className="pt-2 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Comment
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        {issueComments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-4"
          >
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src={`https://ui-avatars.com/api/?name=${comment.user}&background=random`}
                alt=""
              />
            </div>
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{comment.user}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {comment.role}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(new Date(comment.timestamp), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700">{comment.text}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600"
                  >
                    {comment.likes.includes(currentUser) ? (
                      <HeartIconSolid className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span>{comment.likes.length}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}