import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import API from '../services/api';
import { Eye, EyeOff } from 'lucide-react';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      const { token, ...user } = res.data;
      console.log('Login successful:', user);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'setter') navigate('/setter');
      else if (user.role === 'checker') navigate('/checker');
      else if (user.role === 'examiner') navigate('/examiner');
      
      else navigate('/'); // Default route for other roles
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'Account not yet approved by Admin') {
        setError('Your account is not approved yet. Please wait for admin approval.');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          EPMS Login
        </h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm bg-gray-50">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="email"
                className="bg-transparent outline-none w-full text-sm"
                placeholder="you@emps.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm bg-gray-50">
              <Lock className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                className="bg-transparent outline-none w-full text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-2 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition duration-200 shadow-sm"
          >
            Sign In
          </button>
        </form>
         <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <p className="text-sm text-gray-500">
  <a href="/register" className="text-blue-600 ">
    Don’t have an account? Register
  </a>
</p>

            <p className="text-sm text-middle text-blue-600">
  <a href="/forget-password" className="hover:underline">Forgot password?</a>
</p>

</p>
            

        <p className="text-sm text-center text-gray-500 mt-6">
          © 2025 Examination Paper Management System
        </p>

        
      </div>
    </div>
  </div>
  );
}   

export default Login;
