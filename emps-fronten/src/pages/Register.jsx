import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
  const allowedDepartments = ['CSE', 'MECH', 'ECE', 'AI'];

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'setter',
    department: '',
    module: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
  await API.post('/admin/create', form);
  alert('✅ Registered successfully! Awaiting admin approval.');
  navigate('/login');
} catch (err) {
  const msg = err.response?.data?.message;

  if (msg?.includes('already exists')) {
    setError('❌ A Setter already exists in this department.');
  } else if (msg?.includes('required')) {
    setError('❌ Please fill all required fields.');
  } else {
    setError('❌ Registration failed. Try again.');
  }
}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="input"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="input"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="input"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="input"
          >
            <option value="setter">Setter</option>
            <option value="checker">Checker</option>
            <option value="examiner">Examiner</option>
            
          </select>

            <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-lg shadow-sm"
            required
          >
            <option value="">-- Select Department --</option>
            {allowedDepartments.map((dept) => (
              <option key={dept} value={dept.toLowerCase()}>{dept}</option>
            ))}
          </select>
          <input
          type="text"
          name="module"
          value={form.module}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          required={form.role === 'setter'}
          disabled={form.role !== 'setter'}
          placeholder={form.role === 'setter' ? 'Enter Module Code' : 'Not Required'}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 hover:underline"
            >
              Login here
            </a>
          </p>
        </div>
        <p className="text-sm text-gray-500 text-center mt-2">
          By registering, you agree to our{' '}
          <a
            href="/terms"
            className="text-blue-600 hover:underline"
          >
            Terms of Service
          </a>{' '}and{' '}
          <a
            href="/privacy"
            className="text-blue-600 hover:underline"
          >
            Privacy Policy
          </a>.
        </p>
        <p className="text-xs text-gray-500 text-center mt-4">
          © 2025 EPMS – Await approval by admin after registering.
        </p>
      </div>
    </div>
  );
}

export default Register;
