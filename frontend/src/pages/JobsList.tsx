import React, { useEffect, useState } from 'react';
import { jobsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: number;
  description: string;
  employer: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const JobsList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<number | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<{ [key: number]: string }>({});
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobsAPI.getAll();
        setJobs(response.data);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch jobs. Please check if backend is running on port 3000.');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId: number) => {
    if (!user) {
      alert('Please login to apply for jobs');
      return;
    }

    setApplying(jobId);
    try {
      const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setApplicationStatus(prev => ({ ...prev, [jobId]: 'applied' }));
        alert('Application submitted successfully!');
      } else {
        setApplicationStatus(prev => ({ ...prev, [jobId]: 'error' }));
        alert(data.error || 'Failed to apply to job');
      }
    } catch (error) {
      setApplicationStatus(prev => ({ ...prev, [jobId]: 'error' }));
      alert('Failed to apply to job');
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-4 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Connection Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Make sure your backend server is running: 
            <code className="block bg-gray-100 p-2 rounded mt-2">cd backend && npm run dev</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
          {user && (
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h2>
              <h3 className="text-lg text-blue-600 mb-2">{job.company}</h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Location:</span> {job.location}
                </p>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Salary:</span> ${job.salary.toLocaleString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Posted by:</span> {job.employer.name}
                </p>
              </div>

              <p className="text-gray-700 mb-4">{job.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => handleApply(job.id)}
                  disabled={applying === job.id || applicationStatus[job.id] === 'applied'}
                  className={`px-4 py-2 rounded transition-colors ${
                    applicationStatus[job.id] === 'applied'
                      ? 'bg-green-500 text-white'
                      : applying === job.id
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {applying === job.id
                    ? 'Applying...'
                    : applicationStatus[job.id] === 'applied'
                    ? 'Applied ✓'
                    : 'Apply Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsList;