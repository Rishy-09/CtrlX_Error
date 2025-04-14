import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCommentStore = create(
  persist(
    (set) => ({
      comments: [],
      addComment: (issueId, comment, user, role) => 
        set((state) => ({
          comments: [...state.comments, {
            id: Date.now(),
            issueId,
            text: comment,
            user,
            role,
            likes: [],
            timestamp: new Date().toISOString(),
          }]
        })),
      toggleLike: (commentId, userId) =>
        set((state) => ({
          comments: state.comments.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  likes: comment.likes.includes(userId)
                    ? comment.likes.filter(id => id !== userId)
                    : [...comment.likes, userId]
                }
              : comment
          )
        })),
      getComments: (issueId) => {
        const state = get();
        return state.comments.filter(comment => comment.issueId === issueId);
      },
    }),
    {
      name: 'comments-storage',
    }
  )
);

export default useCommentStore;