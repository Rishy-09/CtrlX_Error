import { useContext } from 'react';
import { BugContext } from '../contexts/Bugcontext';

export const useBugs = () => {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error('useBugs must be used within a BugProvider');
  }
  return context;
};