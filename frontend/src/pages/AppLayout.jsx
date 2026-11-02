
import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Dumbbell,
  Utensils,
  X,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/UI';
import api from '../api';

import Dashboard from './Dashboard';
import Workouts from './Workouts';
import Nutrition from './Nutrition';
import Progress from './Progress';
import Reminders from './Reminders';
import Profile from './Profile';
import Support from './Support';
import Admin from './Admin';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'progress', label: 'Progress', icon: Activity },
  { id: 'reminders', label: 'Reminders', icon: Bell },
];

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const [page, setPage] = useState(
    isAdmin ? 'admin' : 'dashboard'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  // Keep the initial page correct when the logged-in user loads or changes.
  useEffect(() => {
    setPage(user?.role === 'admin' ? 'admin' : 'dashboard');
  }, [user?.role]);

  // Use the admin panel as the only page for administrator accounts.
  const currentPage = isAdmin ? 'admin' : page;

  // Administrators only see the Admin Panel navigation item.
  const visibleNavItems = isAdmin
    ? [
        {
          id: 'admin',
          label: 'Admin Panel',
          icon: ShieldCheck,
        },
      ]
    : navItems;

  useEffect(() => {
    document.documentElement.dataset.theme = user?.theme || 'dark';
  }, [user?.theme]);

  // Notifications are only needed in the regular member workspace.
  useEffect(() => {
    if (!user || user.role === 'admin') {
      setUnread(0);
      return;
    }

    api
      .get('/notifications')
      .then(({ data }) => {
        setUnread(
          data.filter((item) => !item.isRead && !item.completed).length
        );
      })
      .catch(() => {});
  }, [user, currentPage]);

  const logout = () => {
    signOut();
    navigate('/', { replace: true });
  };

  const selectedItem = visibleNavItems.find(
    (item) => item.id === currentPage
  );

  const PageIcon =
    selectedItem?.icon ||
    (currentPage === 'profile'
      ? Settings
      : CircleHelp);

  let PageComponent;

  // Never render member pages for an administrator.
  if (isAdmin) {
    PageComponent = <Admin />;
  } else if (currentPage === 'dashboard') {
    PageComponent = <Dashboard user={user} setPage={setPage} />;
  } else if (currentPage === 'workouts') {
    PageComponent = <Workouts />;
  } else if (currentPage === 'nutrition') {
    PageComponent = <Nutrition />;
  } else if (currentPage === 'progress') {
    PageComponent = <Progress />;
  } else if (currentPage === 'reminders') {
    PageComponent = <Reminders />;
  } else if (currentPage === 'profile') {
    PageComponent = <Profile />;
  } else if (currentPage === 'support') {
    PageComponent = <Support />;
  } else {
    PageComponent = <Dashboard user={user} setPage={setPage} />;
  }

  if (!user) {
    return <Loading text="Opening your workspace..." />;
  }

  return (
    <div className="workspace-shell">
      {sidebarOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <Logo compact dashboard />

          <button
            className="mobile-close icon-btn"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">
          {isAdmin ? 'ADMINISTRATION' : 'WORKSPACE'}
        </div>

        <nav className="side-nav">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  currentPage === item.id ? 'active' : ''
                }`}
                onClick={() => {
                  setPage(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>

                {!isAdmin &&
                  item.id === 'reminders' &&
                  unread > 0 && (
                    <span className="nav-count">{unread}</span>
                  )}
              </button>
            );
          })}
        </nav>

        {!isAdmin && (
          <>
            <div className="sidebar-section-label space-top">
              YOUR ACCOUNT
            </div>

            <nav className="side-nav">
              <button
                className={`nav-item ${
                  currentPage === 'profile' ? 'active' : ''
                }`}
                onClick={() => {
                  setPage('profile');
                  setSidebarOpen(false);
                }}
              >
                <Settings size={18} />
                <span>Profile &amp; settings</span>
              </button>

              <button
                className={`nav-item ${
                  currentPage === 'support' ? 'active' : ''
                }`}
                onClick={() => {
                  setPage('support');
                  setSidebarOpen(false);
                }}
              >
                <CircleHelp size={18} />
                <span>Support &amp; feedback</span>
              </button>
            </nav>

            <div className="sidebar-bottom">
              <div className="sidebar-promo">
                <div className="promo-symbol">
                  <Activity size={17} />
                </div>
                <strong>Stay consistent.</strong>
                <p>Your effort compounds over time.</p>
              </div>

              <button className="nav-item logout-button" onClick={logout}>
                <LogOut size={18} />
                <span>Log out</span>
              </button>

              <div className="sidebar-foot">
                COREX FITNESS <span>v1.0</span>
              </div>
            </div>
          </>
        )}

        {isAdmin && (
          <div className="sidebar-bottom">
            <button className="nav-item logout-button" onClick={logout}>
              <LogOut size={18} />
              <span>Log out</span>
            </button>

            <div className="sidebar-foot">
              COREX FITNESS <span>ADMIN</span>
            </div>
          </div>
        )}
      </aside>

      <main className="workspace-main">
        <header className="workspace-header">
          <div className="header-left">
            <button
              className="mobile-menu icon-btn"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="breadcrumb">
              <span>{isAdmin ? 'Administration' : 'Workspace'}</span>
              <span className="crumb-slash">/</span>

              <span className="breadcrumb-current">
                <PageIcon size={14} />
                {isAdmin
                  ? 'Admin Panel'
                  : selectedItem?.label ||
                    (currentPage === 'profile'
                      ? 'Profile & settings'
                      : 'Support & feedback')}
              </span>
            </div>
          </div>

          <div className="header-user">
            <div className="header-user-copy">
              <span>{user.name}</span>
              <small>
                {isAdmin ? 'Administrator' : 'Fitness member'}
              </small>
            </div>

            <div
              className={`avatar-small ${
                user.profilePicture ? 'has-image' : ''
              }`}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                user.name?.[0]?.toUpperCase() || 'C'
              )}
            </div>

            <ChevronDown size={14} className="header-caret" />
          </div>
        </header>

        <div className="workspace-body">{PageComponent}</div>

        <footer className="workspace-footer">
          <span>© {new Date().getFullYear()} CoreX Fitness</span>
          <span>
            Stronger <b>/</b> Healthier <b>/</b> Better
          </span>
        </footer>
      </main>
    </div>
  );
}
