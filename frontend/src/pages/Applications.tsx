import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Application {
  id: number;
  status: string;
  appliedAt: string;
  job: {
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
  };
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/applications/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }

        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError('Failed to load applications');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user]);

  const handleWithdraw = async (applicationId: number) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        alert('Application withdrawn successfully');
      } else {
        throw new Error('Failed to withdraw application');
      }
    } catch (err) {
      alert('Failed to withdraw application');
      console.error('Error withdrawing application:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading applications...</div>
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>
        
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">You haven't applied to any jobs yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{application.job.title}</h2>
                    <h3 className="text-lg text-blue-600">{application.job.company}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.status === 'PENDING' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : application.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {application.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Location:</span> {application.job.location}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Salary:</span> ${application.job.salary.toLocaleString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Employer:</span> {application.job.employer.name}
                  </p>
                </div>

                <p className="text-gray-700 mb-4">{application.job.description}</p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleWithdraw(application.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                  >
                    Withdraw Application
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;