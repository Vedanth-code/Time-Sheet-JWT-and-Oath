import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes WITHOUT sidebar/layout */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes WITH sidebar/layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/*" element={<MainLayout />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
