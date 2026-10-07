import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/admin/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/admin/requests/${id}/status?status=${status}`);
      fetchRequests();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '30px auto',
        fontFamily: 'sans-serif'
      }}
    >
      <h2>Opsflow Admin Dashboard</h2>

      <hr />

      <h3>All Requests</h3>

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
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((req) => (
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
                <select
                  value={req.status}
                  onChange={(e) =>
                    updateStatus(req.id, e.target.value)
                  }
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}