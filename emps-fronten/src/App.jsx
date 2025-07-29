import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SetterDashboard from './pages/SetterDashboard';
import CheckerDashboard from './pages/CheckerDashboard';
import ExaminerDashboard from './pages/ExaminerDashboard';
import Register from './pages/Register'; 
import ForgetPassword from './pages/ForgetPassword';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/setter" element={<ProtectedRoute role="setter"><SetterDashboard /></ProtectedRoute>} />
      <Route path="/checker" element={<ProtectedRoute role="checker"><CheckerDashboard /></ProtectedRoute>} />
      <Route path="/examiner" element={<ProtectedRoute role="examiner"><ExaminerDashboard /></ProtectedRoute>} />
      <Route path="/register" element={<Register />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App;
