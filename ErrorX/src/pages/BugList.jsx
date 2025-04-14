// frontend/src/pages/BugList.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBugs } from '../api';

function BugList() {
  const { data, error, isLoading } = useQuery(['bugs'], fetchBugs);

  if (isLoading) return <p>Loading bugs...</p>;
  if (error) return <p>Error fetching bugs: {error.message}</p>;

  return (
    <div>
      <h1>Bug List</h1>
      {data.map((bug) => (
        <div key={bug._id}>{bug.title}</div>
      ))}
    </div>
  );
}

export default BugList;
