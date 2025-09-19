import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
          <div className="flex gap-4">
  {user ? (
    <>
      <Link
        to="/jobs"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Browse Jobs
      </Link>
      {user.type === 'JOB_SEEKER' ? (
        <Link
          to="/applications"
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
        >
          My Applications
        </Link>
      ) : (
        <Link
          to="/employer-dashboard"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          Employer Dashboard
        </Link>
      )}
    </>
  ) : (
    <>
      <Link
        to="/login"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Login
      </Link>
      <Link
        to="/register"
        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        Register
      </Link>
    </>
  )}
</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Job Board
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Find your dream job or post opportunities
        </p>
        <Link
          to="/jobs"
          className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600"
        >
          Browse Jobs
        </Link>
      </main>
    </div>
  );
};

export default Home;