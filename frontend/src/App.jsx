import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import NotFound from './pages/NotFound';

import Dashboard from './pages/Dashboard';
import PhishingScanner from './pages/PhishingScanner';
import MessageAnalyzer from './pages/MessageAnalyzer';
import UrlScanner from './pages/UrlScanner';
import ScreenshotAnalyzer from './pages/ScreenshotAnalyzer';
import PasswordChecker from './pages/PasswordChecker';
import History from './pages/History';
import Report from './pages/Report';
import Tips from './pages/Tips';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalyses from './pages/admin/AdminAnalyses';
import AdminArticles from './pages/admin/AdminArticles';
import AdminQuiz from './pages/admin/AdminQuiz';
import AdminLogs from './pages/admin/AdminLogs';

import { ProtectedRoute, AdminRoute, GuestRoute } from './components/RouteGuards';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/admin/login" element={<GuestRoute><AdminLogin /></GuestRoute>} />

      {/* User (protected) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/scan/phishing" element={<ProtectedRoute><PhishingScanner /></ProtectedRoute>} />
      <Route path="/scan/message" element={<ProtectedRoute><MessageAnalyzer /></ProtectedRoute>} />
      <Route path="/scan/url" element={<ProtectedRoute><UrlScanner /></ProtectedRoute>} />
      <Route path="/scan/screenshot" element={<ProtectedRoute><ScreenshotAnalyzer /></ProtectedRoute>} />
      <Route path="/scan/password" element={<ProtectedRoute><PasswordChecker /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/report/:id" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/tips" element={<ProtectedRoute><Tips /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Admin (protected + role-gated) */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/analyses" element={<AdminRoute><AdminAnalyses /></AdminRoute>} />
      <Route path="/admin/articles" element={<AdminRoute><AdminArticles /></AdminRoute>} />
      <Route path="/admin/quiz" element={<AdminRoute><AdminQuiz /></AdminRoute>} />
      <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
