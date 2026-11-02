
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ShieldCheck,
  Trash2,
  Users,
  RefreshCw,
  UserCheck,
  UserX,
  Send,
} from 'lucide-react';

import api from '../api';
import { formatDate, getError } from '../utils';
import {
  Alert,
  EmptyState,
  PageTitle,
  StatCard,
} from '../components/UI';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Members Management' },
  { id: 'support', label: 'Feedback & Replies' },
];

function getLastLogin(user) {
  const lastLogin =
    user.lastLoginAt ||
    user.lastLogin ||
    user.lastLoginDate;

  return lastLogin ? formatDate(lastLogin) : 'Not tracked';
}

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/support'),
      ]);

      setStats(results[0].data);
      setUsers(results[1].data);
      setMessages(results[2].data);
    } catch (e) {
      setError(getError(e, 'Could not load admin data.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) =>
      `${user.name || ''} ${user.email || ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [users, search]);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) =>
      `${message.subject || ''} ${message.message || ''} ${
        message.user?.name || ''
      } ${message.user?.email || ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [messages, search]);

  const recentUsers = useMemo(() => {
    if (stats?.recentUsers?.length) {
      return stats.recentUsers;
    }

    return [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 5);
  }, [stats, users]);

  const openFeedback =
    stats?.openMessages ??
    messages.filter((message) => message.status !== 'Resolved').length;

  async function toggleUser(user) {
    if (user.role === 'admin') {
      setError('Admin accounts cannot be disabled here.');
      return;
    }

    try {
      const { data } = await api.patch(
        `/admin/users/${user._id}`,
        { isActive: !user.isActive }
      );

      setUsers((oldUsers) =>
        oldUsers.map((item) =>
          item._id === data._id ? data : item
        )
      );

      setSuccess(
        `${user.name} account ${
          data.isActive ? 'enabled' : 'disabled'
        }.`
      );

      setError('');
    } catch (e) {
      setError(getError(e));
    }
  }

  async function deleteUser(user) {
    if (user.role === 'admin') {
      setError('Admin accounts cannot be deleted here.');
      return;
    }

    const confirmed = window.confirm(
      `Delete ${user.name} and all associated records? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${user._id}`);

      setUsers((oldUsers) =>
        oldUsers.filter((item) => item._id !== user._id)
      );

      setSuccess('Member and associated records deleted.');
      setError('');

      await load();
    } catch (e) {
      setError(getError(e));
    }
  }

  async function updateMessage(message, patch) {
    try {
      const { data } = await api.patch(
        `/admin/support/${message._id}`,
        patch
      );

      setMessages((oldMessages) =>
        oldMessages.map((item) =>
          item._id === data._id ? data : item
        )
      );

      setSuccess('Feedback response saved successfully.');
      setError('');
    } catch (e) {
      setError(getError(e));
    }
  }

  const currentCount =
    tab === 'users' ? users.length : messages.length;

  return (
    <div className="page-content">
      <PageTitle
        eyebrow="COREX CONTROL ROOM"
        title="Admin Panel"
        description="Manage gym members and respond to member feedback."
        action={
          <button className="btn btn-ghost" onClick={load}>
            <RefreshCw size={15} />
            Refresh data
          </button>
        }
      />

      {error && <Alert>{error}</Alert>}

      {success && (
        <Alert
          type="success"
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      <div className="admin-tabs">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? 'active' : ''}
            onClick={() => {
              setTab(item.id);
              setSearch('');
              setError('');
              setSuccess('');
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="inline-loading">
          Loading admin data...
        </div>
      )}

      {!loading && tab === 'overview' && stats && (
        <>
          <div className="stats-grid">
            <StatCard
              label="Registered Members"
              value={stats.users ?? users.length}
              sub="Total registered accounts"
              icon="target"
              accent
            />

            <StatCard
              label="Active Members"
              value={
                stats.activeUsers ??
                users.filter((user) => user.isActive).length
              }
              sub="Enabled accounts"
              icon="target"
            />

            <StatCard
              label="Open Feedback"
              value={openFeedback}
              sub="Messages needing attention"
              icon="trend"
            />
          </div>

          <div className="panel admin-overview-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">LATEST MEMBERS</span>
                <h2>Recently registered</h2>
              </div>

              <button
                className="text-action"
                onClick={() => setTab('users')}
              >
                Manage members <Users size={15} />
              </button>
            </div>

            {recentUsers.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            <span className="avatar-small">
                              {user.name?.[0]?.toUpperCase() || '?'}
                            </span>
                            {user.name}
                          </div>
                        </td>

                        <td>{user.email}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{getLastLogin(user)}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              user.isActive ? 'active' : 'inactive'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No members yet" />
            )}
          </div>

          <div className="admin-tip">
            <ShieldCheck size={19} />
            <div>
              <strong>Administrator access</strong>
              <p>
                Manage member accounts and review feedback
                responsibly.
              </p>
            </div>
          </div>
        </>
      )}

      {tab !== 'overview' && (
        <section className="panel admin-list-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MANAGEMENT</span>
              <h2>
                {tabs.find((item) => item.id === tab)?.label}
              </h2>
            </div>

            <span className="count-pill">
              {currentCount} total
            </span>
          </div>

          <div className="filters-row">
            <div className="search-box">
              <Search size={16} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={
                  tab === 'users'
                    ? 'Search members by name or email...'
                    : 'Search feedback by subject, message or member...'
                }
              />
            </div>
          </div>

          {tab === 'users' &&
            (filteredUsers.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            <span className="avatar-small">
                              {user.name?.[0]?.toUpperCase() || '?'}
                            </span>
                            {user.name}
                          </div>
                        </td>

                        <td>{user.email}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{getLastLogin(user)}</td>

                        <td>
                          <span
                            className={`status-badge ${
                              user.isActive ? 'active' : 'inactive'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>

                        <td>
                          {user.role === 'admin' ? (
                            <span className="status-badge active">
                              Admin account
                            </span>
                          ) : (
                            <div className="row-actions">
                              <button
                                className="icon-btn"
                                title={
                                  user.isActive
                                    ? 'Disable member'
                                    : 'Enable member'
                                }
                                onClick={() => toggleUser(user)}
                              >
                                {user.isActive ? (
                                  <UserX size={15} />
                                ) : (
                                  <UserCheck size={15} />
                                )}
                              </button>

                              <button
                                className="icon-btn danger"
                                title="Delete member and associated records"
                                onClick={() => deleteUser(user)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No members found" />
            ))}

          {tab === 'support' &&
            (filteredMessages.length ? (
              <div className="admin-ticket-list">
                {filteredMessages.map((message) => (
                  <AdminTicket
                    key={message._id}
                    item={message}
                    onSave={updateMessage}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No feedback found"
                description="Member feedback and support requests will appear here."
              />
            ))}
        </section>
      )}
    </div>
  );
}

function AdminTicket({ item, onSave }) {
  const [status, setStatus] = useState(item.status);
  const [reply, setReply] = useState(item.adminReply || '');

  useEffect(() => {
    setStatus(item.status);
    setReply(item.adminReply || '');
  }, [item.status, item.adminReply]);

  return (
    <article className="admin-ticket">
      <div className="ticket-header">
        <div>
          <h3>{item.subject}</h3>
          <p>
            {item.user?.name || 'Unknown member'} ·{' '}
            {item.user?.email || 'No email'} ·{' '}
            {formatDate(item.createdAt)}
          </p>
        </div>

        <span
          className={`status-badge ${
            (item.status || 'Open').toLowerCase().replace(' ', '-')
          }`}
        >
          {item.status || 'Open'}
        </span>
      </div>

      <div className="ticket-body">
        {item.message}
      </div>

      {item.adminReply && (
        <div className="ticket-body">
          <strong>Previous admin reply:</strong>
          <p>{item.adminReply}</p>
        </div>
      )}

      <div className="ticket-controls">
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>Open</option>
            <option>In progress</option>
            <option>Resolved</option>
          </select>
        </label>

        <label>
          Reply
          <textarea
            rows="3"
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Write a reply to the member..."
            maxLength={3000}
          />
        </label>

        <button
          className="btn btn-primary"
          onClick={() =>
            onSave(item, {
              status,
              adminReply: reply,
            })
          }
        >
          <Send size={15} />
          Save response
        </button>
      </div>
    </article>
  );
}
