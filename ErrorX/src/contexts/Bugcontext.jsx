import { createContext, useContext, useReducer } from 'react';

const BugContext = createContext(null);

export const useBugs = () => {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error('useBugs must be used within a BugProvider');
  }
  return context;
};

const bugReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BUGS':
      return { ...state, bugs: action.payload };
    case 'ADD_BUG':
      return { ...state, bugs: [...state.bugs, action.payload] };
    case 'UPDATE_BUG':
      return {
        ...state,
        bugs: state.bugs.map(bug =>
          bug.id === action.payload.id ? action.payload : bug
        ),
      };
    case 'DELETE_BUG':
      return {
        ...state,
        bugs: state.bugs.filter(bug => bug.id !== action.payload),
      };
    default:
      return state;
  }
};

export const BugProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bugReducer, { bugs: [] });

  const value = {
    bugs: state.bugs,
    setBugs: (bugs) => dispatch({ type: 'SET_BUGS', payload: bugs }),
    addBug: (bug) => dispatch({ type: 'ADD_BUG', payload: bug }),
    updateBug: (bug) => dispatch({ type: 'UPDATE_BUG', payload: bug }),
    deleteBug: (bugId) => dispatch({ type: 'DELETE_BUG', payload: bugId }),
  };

  return <BugContext.Provider value={value}>{children}</BugContext.Provider>;
};

export { BugContext }