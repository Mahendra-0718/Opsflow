import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [assignedRequests, setAssignedRequests] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchRequests();
    fetchAssignedRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const fetchAssignedRequests = async () => {
    try {
      const res = await API.get('/requests/assigned');
      setAssignedRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch assigned requests:', err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();

    try {
      await API.post('/requests', {
        title,
        description,
        priority
      });

      setTitle('');
      setDescription('');
      setPriority('MEDIUM');

      fetchRequests();
    } catch (err) {
      console.error('Failed to submit request:', err);
      alert('Failed to submit request');
    }
  };

  const updateAssignedStatus = async (requestId, status) => {
    try {
      await API.put(
        `/requests/${requestId}/status?status=${status}`
      );

      alert('Status updated successfully');

      fetchAssignedRequests();
      fetchRequests();

    } catch (err) {
      console.error('Failed to update status:', err);

      alert(
        err.response?.data?.message ||
        'Failed to update status'
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
        maxWidth: '1100px',
        margin: '30px auto',
        fontFamily: 'sans-serif'
      }}
    >

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h2>Welcome, {user.fullName || 'User'}!</h2>

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

      <h3>Create New Request</h3>

      <form
        onSubmit={handleCreateRequest}
        style={{ marginBottom: '30px' }}
      >

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            boxSizing: 'border-box'
          }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            boxSizing: 'border-box'
          }}
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            padding: '8px',
            marginBottom: '10px'
          }}
        >
          <option value="LOW">Low Priority</option>
          <option value="MEDIUM">Medium Priority</option>
          <option value="HIGH">High Priority</option>
          <option value="URGENT">Urgent</option>
        </select>

        <br />

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          Submit Request
        </button>

      </form>

      <h3>My Requests</h3>

      <table
        border="1"
        cellPadding="10"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '40px'
        }}
      >

        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Created At</th>
          </tr>
        </thead>

        <tbody>

          {requests.length === 0 ? (

            <tr>
              <td
                colSpan="6"
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
                  {req.assignedTo
                    ? req.assignedTo.fullName
                    : 'Not Assigned'}
                </td>

                <td>
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleString()
                    : ''}
                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

      <h3>Assigned To Me</h3>

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
            <th>Created By</th>
            <th>Created At</th>
            <th>Update Status</th>
          </tr>

        </thead>

        <tbody>

          {assignedRequests.length === 0 ? (

            <tr>

              <td
                colSpan="7"
                style={{ textAlign: 'center' }}
              >
                No assigned requests
              </td>

            </tr>

          ) : (

            assignedRequests.map((req) => (

              <tr key={req.id}>

                <td>{req.id}</td>

                <td>{req.title}</td>

                <td>{req.priority}</td>

                <td>{req.status}</td>

                <td>
                  {req.user
                    ? req.user.fullName
                    : 'Unknown'}
                </td>

                <td>
                  {req.createdAt
                    ? new Date(req.createdAt).toLocaleString()
                    : ''}
                </td>

                <td>

                  <select
                    value={req.status}
                    onChange={(e) =>
                      updateAssignedStatus(
                        req.id,
                        e.target.value
                      )
                    }
                    style={{
                      padding: '6px'
                    }}
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

    </div>
  );
}