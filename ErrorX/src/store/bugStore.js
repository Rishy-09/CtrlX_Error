import { create } from 'zustand';
import { format } from 'date-fns';

const useBugStore = create((set) => ({
  bugs: [],
  comments: [],
  attachments: [],
  labels: ['UI/UX', 'Backend', 'Frontend', 'Database', 'Security', 'Performance'],
  
  addBug: (bug) => set((state) => ({
    bugs: [...state.bugs, {
      ...bug,
      id: Date.now(),
      status: 'Reported',
      labels: bug.labels || [],
      attachments: [],
      watchers: [],
      timeSpent: 0,
      priority: bug.priority || 'Medium',
      dueDate: bug.dueDate,
      timeline: [{
        status: 'Reported',
        date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        user: bug.reportedBy
      }]
    }]
  })),

  updateBugStatus: (bugId, newStatus, user) => set((state) => ({
    bugs: state.bugs.map(bug => 
      bug.id === bugId 
        ? {
            ...bug,
            status: newStatus,
            timeline: [...bug.timeline, {
              status: newStatus,
              date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
              user
            }]
          }
        : bug
    )
  })),

  assignBug: (bugId, developerId, developerName) => set((state) => ({
    bugs: state.bugs.map(bug =>
      bug.id === bugId
        ? {
            ...bug,
            assignedTo: developerId,
            assignedToName: developerName,
            status: 'Assigned',
            timeline: [...bug.timeline, {
              status: 'Assigned',
              date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
              user: 'Admin',
              assignedTo: developerName
            }]
          }
        : bug
    )
  })),

  addComment: (bugId, comment, user) => set((state) => ({
    comments: [...state.comments, {
      id: Date.now(),
      bugId,
      text: comment,
      user,
      date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      mentions: [],
      reactions: []
    }]
  })),

  addAttachment: (bugId, file) => set((state) => ({
    attachments: [...state.attachments, {
      id: Date.now(),
      bugId,
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
      uploadedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    }]
  })),

  updateTimeSpent: (bugId, timeInSeconds) => set((state) => ({
    bugs: state.bugs.map(bug =>
      bug.id === bugId
        ? { ...bug, timeSpent: (bug.timeSpent || 0) + timeInSeconds }
        : bug
    )
  })),

  toggleWatcher: (bugId, userId, userName) => set((state) => ({
    bugs: state.bugs.map(bug =>
      bug.id === bugId
        ? {
            ...bug,
            watchers: bug.watchers.some(w => w.id === userId)
              ? bug.watchers.filter(w => w.id !== userId)
              : [...bug.watchers, { id: userId, name: userName }]
          }
        : bug
    )
  })),

  addLabel: (label) => set((state) => ({
    labels: [...state.labels, label]
  })),

  addReaction: (commentId, reaction, userId) => set((state) => ({
    comments: state.comments.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            reactions: [...comment.reactions, { reaction, userId, date: new Date() }]
          }
        : comment
    )
  })),

  getBugStats: () => {
    const { bugs } = get();
    return {
      total: bugs.length,
      open: bugs.filter(b => b.status !== 'Resolved').length,
      resolved: bugs.filter(b => b.status === 'Resolved').length,
      critical: bugs.filter(b => b.severity === 'Critical').length
    };
  },

  getTimelineStats: () => {
    const { bugs } = get();
    return bugs.reduce((acc, bug) => {
      const date = format(new Date(bug.reportedDate), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  }
}));

export default useBugStore;