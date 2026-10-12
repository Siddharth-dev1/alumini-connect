import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

import StudentDashboard from './pages/StudentDashboard';
import AlumniDashboard from './pages/AlumniDashboard';
import AdminDashboard from './pages/AdminDashboard';

import AlumniDirectory from './pages/AlumniDirectory';
import StudentDirectory from './pages/StudentDirectory';
import Connections from './pages/Connections';
import Mentorship from './pages/Mentorship';
import JobsAndInternships from './pages/JobsAndInternships';
import Events from './pages/Events';
import CareerResources from './pages/CareerResources';
import Messaging from './pages/Messaging';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

import DashboardLayout from './layouts/DashboardLayout';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<><Navbar /><Landing /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />

        {/* Student Routes */}
        <Route path="/student" element={<DashboardLayout allowedRoles={['student']} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="alumni-directory" element={<AlumniDirectory />} />
          <Route path="connections" element={<Connections />} />
          <Route path="mentorship" element={<Mentorship />} />
          <Route path="jobs" element={<JobsAndInternships />} />
          <Route path="events" element={<Events />} />
          <Route path="messages" element={<Messaging />} />
          <Route path="resources" element={<CareerResources />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Alumni Routes */}
        <Route path="/alumni" element={<DashboardLayout allowedRoles={['alumni']} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AlumniDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="student-directory" element={<StudentDirectory />} />
          <Route path="connections" element={<Connections />} />
          <Route path="mentorship" element={<Mentorship />} />
          <Route path="jobs" element={<JobsAndInternships />} />
          <Route path="events" element={<Events />} />
          <Route path="messages" element={<Messaging />} />
          <Route path="resources" element={<CareerResources />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminDashboard />} />
          <Route path="alumni-verification" element={<AdminDashboard />} />
          <Route path="connections" element={<Connections />} />
          <Route path="mentorship" element={<Mentorship />} />
          <Route path="jobs" element={<JobsAndInternships />} />
          <Route path="events" element={<Events />} />
          <Route path="resources" element={<CareerResources />} />
          <Route path="reports" element={<AdminDashboard />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
