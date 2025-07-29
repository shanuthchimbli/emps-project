import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function ProtectedRoute({ children, role }) {
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      setValid(false);
    } else if (role && user.role !== role) {
      setValid(false);
    } else if (user.role === 'setter' && (!user.module || user.module.trim() === '')) {
      setValid("setter_error");
    } else {
      setValid(true);
    }

    setChecking(false); // done checking
  }, [role]);

  if (checking) {
    return <div className="text-center mt-10 text-blue-600 font-semibold">Loading...</div>;
  }

  if (valid === "setter_error") {
    return (
      <h1 className="text-red-500 text-center mt-20">
        ❌ Setters must have a module assigned. Ask admin to fix your account.
      </h1>
    );
  }

  if (!valid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
