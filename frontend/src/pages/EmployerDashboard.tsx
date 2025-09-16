import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: number;
  description: string;
  createdAt: string;
  applications: Array<{
    id: number;
    status: string;
    appliedAt: string;
    applicant: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

const EmployerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/employer/jobs', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError('Failed to load jobs');
        console.error('Error fetching employer jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.type === 'EMPLOYER') {
      fetchEmployerJobs();
    }
  }, [user]);

  const updateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
  const updatedApplication = await response.json();
  // Update local state using the response data
  setJobs(prev => prev.map(job => ({
    ...job,
    applications: job.applications.map(app => 
      app.id === applicationId ? updatedApplication : app
    )
  })));
  alert('Status updated successfully');
} else {
        throw new Error('Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (user?.type !== 'EMPLOYER') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">Access denied. Employer account required.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <Link
            to="/post-job"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Post New Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">You haven't posted any jobs yet.</p>
            <Link
              to="/post-job"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                    <h3 className="text-lg text-blue-600">{job.company}</h3>
                  </div>
                  <span className="text-sm text-gray-500">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Location:</span> {job.location}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Salary:</span> ${job.salary.toLocaleString()}
                  </p>
                </div>

                <p className="text-gray-700 mb-4">{job.description}</p>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">
                    Applications ({job.applications.length})
                  </h4>
                  
                  {job.applications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No applications yet</p>
                  ) : (
                    <div className="space-y-3">
                      {job.applications.map((application) => (
                        <div key={application.id} className="border rounded p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">{application.applicant.name}</h5>
                              <p className="text-sm text-gray-600">{application.applicant.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              application.status === 'PENDING' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : application.status === 'APPROVED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {application.status}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-500 mb-2">
                            Applied on {new Date(application.appliedAt).toLocaleDateString()}
                          </p>
                          
                          <div className="flex gap-2">
                            <select
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approved</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;