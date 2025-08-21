import React, { useEffect, useState } from 'react';
import { jobsAPI } from '../services/api';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: number;
  description: string;
  employer: { name: string; email: string };
  createdAt: string;
}

const JobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsAPI.getAll()
      .then(response => setJobs(response.data))
      .catch(error => console.error('Error:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
      <div className="grid gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <h3 className="text-lg text-blue-600">{job.company}</h3>
            <p className="text-gray-600">Location: {job.location}</p>
            <p className="text-gray-600">Salary: ${job.salary}</p>
            <p className="text-gray-700">{job.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobsList;