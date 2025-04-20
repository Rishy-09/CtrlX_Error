import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_COMMENTS(taskId));
      if (response.data?.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        API_PATHS.TASKS.ADD_COMMENT(taskId),
        { text: newComment }
      );
      
      if (response.data?.task?.comments) {
        setComments(response.data.task.comments);
        setNewComment('');
        toast.success("Comment added successfully");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  return (
    <div className="mt-6">
      <h3 className="text-xs font-medium text-slate-500 mb-2">Comments</h3>
      
      {/* Comment form */}
      <form onSubmit={handleAddComment} className="mb-4">
        <div className="flex">
          <textarea
            className="flex-grow text-sm border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className={`ml-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md ${
              loading || !newComment.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            Post
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3">
        {loading && comments.length === 0 ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="bg-gray-50 rounded-md p-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center mr-2">
                    {comment.user?.profileImageURL ? (
                      <img
                        src={comment.user.profileImageURL}
                        alt={comment.user?.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-800">
                        {comment.user?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{comment.user?.name || "Unknown User"}</p>
                    <p className="text-xs text-gray-500">
                      {moment(comment.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm mt-2">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection; 