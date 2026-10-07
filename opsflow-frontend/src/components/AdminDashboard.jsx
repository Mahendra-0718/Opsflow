import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {

  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);

  const [selectedUsers, setSelectedUsers] = useState({});
  const [userChanges, setUserChanges] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
    fetchUsers();
    fetchStats();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/admin/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const refreshDashboard = () => {
    fetchRequests();
    fetchUsers();
    fetchStats();
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/requests/${id}/status?status=${status}`);
      refreshDashboard();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const handleUserChange = (requestId, email) => {
    setSelectedUsers({
      ...selectedUsers,
      [requestId]: email
    });
  };

  const assignRequest = async (requestId) => {

    const email = selectedUsers[requestId];

    if (!email) {
      alert('Please select a user');
      return;
    }

    try {
      await API.put(
        `/admin/requests/${requestId}/assign?email=${encodeURIComponent(email)}`
      );

      alert('Request assigned successfully');

      refreshDashboard();

    } catch (err) {
      console.error('Failed to assign request:', err);
      alert('Failed to assign request');
    }
  };

  const handleRoleChange = (userId, role) => {
    setUserChanges({
      ...userChanges,
      [userId]: {
        ...userChanges[userId],
        role
      }
    });
  };

  const handleActiveChange = (userId, active) => {
    setUserChanges({
      ...userChanges,
      [userId]: {
        ...userChanges[userId],
        active
      }
    });
  };

  const updateUser = async (user) => {

    const changes = userChanges[user.id] || {};

    const role = changes.role ?? user.role;
    const active = changes.active ?? user.active;

    try {

      await API.put(`/admin/users/${user.id}`, {
        role,
        active
      });

      alert('User updated successfully');

      refreshDashboard();

      setUserChanges({
        ...userChanges,
        [user.id]: {}
      });

    } catch (err) {

      console.error('Failed to update user:', err);

      alert(
        err.response?.data?.message ||
        'Failed to update user'
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (

    <div
      style={{
        maxWidth: '1200px',
        margin: '30px auto',
        fontFamily: 'sans-serif'
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >

        <h2>OpsFlow Admin Dashboard</h2>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>

      </div>

      <hr />

      {/* STATISTICS */}

      <h3>Dashboard Statistics</h3>

      {stats && (

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '15px',
            marginBottom: '35px'
          }}
        >

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>Total Requests</h4>
            <h2>{stats.totalRequests}</h2>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>Open Requests</h4>
            <h2>{stats.openRequests}</h2>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>In Progress</h4>
            <h2>{stats.inProgressRequests}</h2>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>Resolved</h4>
            <h2>{stats.resolvedRequests}</h2>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>Total Users</h4>
            <h2>{stats.totalUsers}</h2>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>Active Users</h4>
            <h2>{stats.activeUsers}</h2>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>Inactive Users</h4>
            <h2>{stats.inactiveUsers}</h2>
          </div>

          <div
            style={{
              border: '1px solid #ccc',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <h4>Employees</h4>
            <h2>{stats.employees}</h2>
          </div>

        </div>

      )}

      {/* REQUESTS */}

      <h3>All Requests</h3>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '50px'
        }}
      >

        <thead>

          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Assigned To</th>
            <th>Assign</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {requests.length === 0 ? (

            <tr>
              <td
                colSpan="8"
                style={{ textAlign: 'center' }}
              >
                No requests found
              </td>
            </tr>

          ) : (

            requests.map((req) => (

              <tr key={req.id}>

                <td>{req.id}</td>

                <td>{req.title}</td>

                <td>{req.priority}</td>

                <td>{req.status}</td>

                <td>
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleString()
                    : ''}
                </td>

                <td>
                  {req.assignedTo
                    ? req.assignedTo.email
                    : 'Not Assigned'}
                </td>

                <td>

                  <select
                    value={selectedUsers[req.id] || ''}
                    onChange={(e) =>
                      handleUserChange(
                        req.id,
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Select User
                    </option>

                    {users
                      .filter(
                        (user) =>
                          user.role === 'EMPLOYEE' &&
                          user.active
                      )
                      .map((user) => (

                        <option
                          key={user.id}
                          value={user.email}
                        >
                          {user.fullName} ({user.email})
                        </option>

                      ))}

                  </select>

                  <br />

                  <button
                    onClick={() =>
                      assignRequest(req.id)
                    }
                    style={{
                      marginTop: '5px',
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    Assign
                  </button>

                </td>

                <td>

                  <select
                    value={req.status}
                    onChange={(e) =>
                      updateStatus(
                        req.id,
                        e.target.value
                      )
                    }
                  >

                    <option value="OPEN">
                      OPEN
                    </option>

                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>

                    <option value="RESOLVED">
                      RESOLVED
                    </option>

                  </select>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      {/* USER MANAGEMENT */}

      <h3>User Management</h3>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}
      >

        <thead>

          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {users.length === 0 ? (

            <tr>
              <td
                colSpan="7"
                style={{ textAlign: 'center' }}
              >
                No users found
              </td>
            </tr>

          ) : (

            users.map((user) => {

              const changes =
                userChanges[user.id] || {};

              const selectedRole =
                changes.role ?? user.role;

              const selectedActive =
                changes.active ?? user.active;

              return (

                <tr key={user.id}>

                  <td>{user.id}</td>

                  <td>{user.fullName}</td>

                  <td>{user.email}</td>

                  <td>{user.role}</td>

                  <td>

                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value
                        )
                      }
                    >

                      <option value="EMPLOYEE">
                        EMPLOYEE
                      </option>

                      <option value="MANAGER">
                        MANAGER
                      </option>

                      <option value="ADMIN">
                        ADMIN
                      </option>

                      <option value="AUDITOR">
                        AUDITOR
                      </option>

                      <option value="SUPER_ADMIN">
                        SUPER_ADMIN
                      </option>

                    </select>

                  </td>

                  <td>

                    <select
                      value={
                        selectedActive
                          ? 'ACTIVE'
                          : 'INACTIVE'
                      }
                      onChange={(e) =>
                        handleActiveChange(
                          user.id,
                          e.target.value === 'ACTIVE'
                        )
                      }
                    >

                      <option value="ACTIVE">
                        ACTIVE
                      </option>

                      <option value="INACTIVE">
                        INACTIVE
                      </option>

                    </select>

                  </td>

                  <td>

                    <button
                      onClick={() =>
                        updateUser(user)
                      }
                      style={{
                        padding: '6px 12px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>

                  </td>

                </tr>

              );

            })

          )}

        </tbody>

      </table>

    </div>
  );
}