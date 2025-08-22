import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JobsList from './pages/JobsList';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<JobsList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;