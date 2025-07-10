import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter) params.append('role', roleFilter);

      const response = await apiClient.get('/admin/users?' + params);
      setUsers((response.data as { users: User[]; pagination: { pages: number } }).users);
      setTotalPages((response.data as { users: User[]; pagination: { pages: number } }).pagination.pages);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Users Management</h1>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Filters</h2>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input"
            >
              <option value="">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Users</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontFamily: 'monospace' }}>#{user.id.slice(0, 8)}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'ADMIN' ? 'badge-info' : 'badge-secondary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          // TODO: Implement user details view
                          alert(`User details for ${user.name} would be shown here`);
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span className="flex items-center px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users; 