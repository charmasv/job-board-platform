import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Job Board
        </h2>
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