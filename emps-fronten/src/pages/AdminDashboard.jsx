import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Mail, Lock, Trash2, Pencil, LayoutDashboard, ClipboardList, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'setter',
    department: '',
    module: ''
  });
  const allowedDepartments = ['CSE', 'MECH', 'ECE', 'AI'];
  const [editMode, setEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [userError, setUserError] = useState('');
  const [showAudit, setShowAudit] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logError, setLogError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [showProfile, setShowProfile] = useState(false); 
 const [profilePic, setProfilePic] = useState(
  localStorage.getItem('profilePic') || ''
);

const user = JSON.parse(localStorage.getItem('user'));

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setUserError('Failed to load users');
    }
  };
  const handleProfilePicChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setProfilePic(base64Image);
      localStorage.setItem('profilePic', base64Image);
    };
    reader.readAsDataURL(file);
  }
};


  const fetchLogs = async () => {
    try {
      const res = await API.get('/admin/audit', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      setLogError('Failed to fetch audit logs');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await API.put(`/admin/${editUserId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ User updated successfully!');
      } else {
        await API.post('/admin/create', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessage('✅ User created successfully!');
      }
      setFormData({ name: '', email: '', password: '', role: 'setter', department: '', module: '' });
      setEditMode(false);
      setEditUserId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to submit user. Might already exist.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('🗑️ User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to delete user.');
    }
  };

  const selectUserToEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      module: user.module || '',
    });
    setEditMode(true);
    setEditUserId(user._id);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const approveUser = async (id) => {
    try {
      await API.patch(`/admin/approve/${id}`, { approved: true }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('User approved successfully!');
      fetchUsers();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to approve user.');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchRole = filterRole ? user.role === filterRole : true;
    const matchDept = filterDept ? user.department === filterDept : true;

    return matchSearch && matchRole && matchDept;
  });
  

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div>
          <div>
            
          </div>
                    <div className="flex items-center gap-3 px-6 py-4 border-b">
            {profilePic ? (
              <img
                src={profilePic}
                alt="Admin"
                className="w-8 h-8 rounded-full border-2 border-blue-500 shadow"
              />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
            <span className="text-blue-800 font-semibold">Hey! {user?.name || 'Admin User'}</span>
          </div>


          <nav className="flex flex-col p-4 gap-2 text-gray-700 text-sm font-medium">
                  <button
          className={`flex items-center gap-2 p-2 rounded hover:bg-blue-100 transition ${
            showProfile && 'bg-blue-50 font-semibold'
          }`}
          onClick={() => {
            setShowProfile(true);
            setShowAudit(false);
          }}
        >
          <User className="w-5 h-5" /> Profile
        </button>
        <button
          className={`flex items-center gap-2 p-2 rounded hover:bg-blue-100 transition ${
            !showAudit && !showProfile && 'bg-blue-50 font-semibold'
          }`}
          onClick={() => {
            setShowAudit(false);
            setShowProfile(false);
          }}
        >
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </button>

          <button
            className={`flex items-center gap-2 p-2 rounded hover:bg-blue-100 transition ${
              showAudit && 'bg-blue-50 font-semibold'
            }`}
            onClick={() => {
              setShowAudit(true);
              setShowProfile(false);
            }}
          >
            <ClipboardList className="w-5 h-5" /> Audit Trail
          </button>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
  </div>
</nav>

        </div>

        
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6">
        {showProfile ? (
  <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 flex items-center gap-6">
    <div className="flex flex-col items-center gap-2">
      <img
        src={profilePic || "https://api.dicebear.com/7.x/thumbs/svg?seed=Admin"}
        alt="Profile"
        className="w-28 h-28 rounded-full border-4 border-blue-200 shadow-md object-cover"
      />
      <label className="text-blue-600 font-medium cursor-pointer text-sm hover:underline">
        Upload Photo
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePicChange}
          className="hidden"
        />
      </label>
    </div>

    <div>
      <h2 className="text-2xl font-bold text-blue-700 mb-2 flex items-center gap-2">
         Profile
      </h2>
      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">Name:</span> {user?.name || 'Admin User'}
      </p>
      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">Email:</span> {user?.email || 'admin@emps.com'}
      </p>
      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">Role:</span> {user?.role || 'admin'}
      </p>
      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">Joined:</span> {user?.data || '2025-30-07'}
      </p>
      <p className="text-gray-700 text-sm mb-1">
        <span className="font-semibold">Department:</span> {user?.department || 'CSE'}
      </p>
          </div>
        </div>
      ) : 
        showAudit ? (
          <>
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">📜 Audit Trail</h2>
            {logError && <p className="text-red-500">{logError}</p>}
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
              <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, role, or action..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

              <table className="min-w-full text-sm table-fixed">
                <thead className="bg-blue-100 text-blue-800 font-semibold">
                  <tr>
                    <th className="px-3 py-2 border-b w-12 text-left">#</th>
                    <th className="px-3 py-2 border-b w-2/5 text-left">Action</th>
                    <th className="px-3 py-2 border-b w-1/5 text-left">users</th>
                    <th className="px-3 py-2 border-b w-1/5 text-left">Email</th>
                    <th className="px-3 py-2 border-b w-1/5 text-left">Role</th>
                    <th className="px-3 py-2 border-b w-1/5 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs
                    .filter((log) => {
                      const keyword = searchText.toLowerCase();
                      return (
                        log?.action?.toLowerCase().includes(keyword) ||
                        log?.role?.toLowerCase().includes(keyword) ||
                        log?.actor?.name?.toLowerCase().includes(keyword) ||
                        log?.actor?.email?.toLowerCase().includes(keyword)
                      );
                    })
                    .map((log, index) => (
                      <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{log.action}</td>
                        <td className="px-4 py-2">{log.actor?.name}</td>
                        <td className="px-4 py-2">{log.actor?.email}</td>
                        <td className="px-4 py-2 capitalize">{log.role}</td>
                        <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>

              </table>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-3 mb-6">
              <User className="w-8 h-8" /> Admin Dashboard
            </h1>

            {message && (
              <p className="text-center mb-4 text-sm font-semibold text-green-600">{message}</p>
            )}

            {/* 🔍 Filter Section */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-4 py-2 rounded-md shadow-sm w-full sm:w-64"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border px-3 py-2 rounded-md shadow-sm"
              >
                <option value="">All Roles</option>
                <option value="setter">Setter</option>
                <option value="checker">Checker</option>
                <option value="examiner">Examiner</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="border px-3 py-2 rounded-md shadow-sm"
              >
                <option value="">All Departments</option>
                {allowedDepartments.map((dept) => (
                  <option key={dept} value={dept.toLowerCase()}>{dept}</option>
                ))}
              </select>
            </div>

            {/* 🧾 User Table */}
            <table className="w-full border shadow-sm rounded-xl overflow-hidden text-sm mb-8">
              <thead className="bg-blue-100 text-blue-800 text-left font-semibold">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Approval</th>
                  <th className="p-3">Actions</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3">{user.department}</td>
                    <td className="p-3">{user.module || 'Not required'}</td>
                    <td className="p-3">
                      {user.approved ? (
                        <span className="text-green-600 font-semibold">Approved</span>
                      ) : (
                        <span className="text-red-600 font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => selectUserToEdit(user)} className="text-blue-600 hover:text-blue-800">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="p-3">
                      {!user.approved && (
                        <button onClick={() => approveUser(user._id)} className="text-green-600 hover:text-green-800">
                          ✅ Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Form (unchanged) */}
            {editMode && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-2xl font-semibold text-blue-700 mb-4">Update Users</h2>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border px-4 py-2 rounded-lg shadow-sm" placeholder="Full Name" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border px-4 py-2 rounded-lg shadow-sm" placeholder="Email" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editMode} className="w-full border px-4 py-2 rounded-lg shadow-sm" placeholder="Password" />
                <select name="role" value={formData.role} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm">
                  <option value="setter">Setter</option>
                  <option value="checker">Checker</option>
                  <option value="examiner">Examiner</option>
                  <option value="admin">Admin</option>
                </select>
                <select name="department" value={formData.department} onChange={handleChange} required className="w-full border px-3 py-2 rounded-lg shadow-sm">
                  <option value="">-- Select Department --</option>
                  {allowedDepartments.map((dept) => (
                    <option key={dept} value={dept.toLowerCase()}>{dept}</option>
                  ))}
                </select>
                <input type="text" name="module" value={formData.module} onChange={handleChange} className="w-full border px-4 py-2 rounded-lg shadow-sm" placeholder="Module (Setter only)" required={formData.role === 'setter'} />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  {editMode ? 'SUBMIT' : 'Update User'}
                </button>
              </form>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
