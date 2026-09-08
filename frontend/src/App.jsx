import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DetectionPage from './pages/DetectionPage';
import NetworkPage from './pages/NetworkPage';
import PredictionsPage from './pages/PredictionsPage';
import RiskPage from './pages/RiskPage';
import AlertsPage from './pages/AlertsPage';
import InvestigationsPage from './pages/InvestigationsPage';
import TransactionsPage from './pages/TransactionsPage';
import AccountsPage from './pages/AccountsPage';
import LocationsPage from './pages/LocationsPage';
import MuleDetectionPage from './pages/MuleDetectionPage';
import MoneyFlowPage from './pages/MoneyFlowPage';
import ScamCheckerPage from './pages/ScamCheckerPage';
import RecoveryPage from './pages/RecoveryPage';
import FileComplaintPage from './pages/FileComplaintPage';

// Protected Route Guard Component
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('frauddna_token');
  const userStr = localStorage.getItem('frauddna_user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      if (user.role === 'Citizen') {
        return <Navigate to="/scam-checker" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Citizen Accessible Routes */}
        <Route path="/scam-checker" element={<ProtectedRoute allowedRoles={['Citizen', 'Investigator', 'Admin']}><MainLayout><ScamCheckerPage /></MainLayout></ProtectedRoute>} />
        <Route path="/file-complaint" element={<ProtectedRoute allowedRoles={['Citizen', 'Investigator', 'Admin']}><MainLayout><FileComplaintPage /></MainLayout></ProtectedRoute>} />
        <Route path="/recovery" element={<ProtectedRoute allowedRoles={['Citizen', 'Investigator', 'Admin']}><MainLayout><RecoveryPage /></MainLayout></ProtectedRoute>} />

        {/* Investigator / Admin Core Intelligence Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><DashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/detection" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><DetectionPage /></MainLayout></ProtectedRoute>} />
        <Route path="/mule-detection" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><MuleDetectionPage /></MainLayout></ProtectedRoute>} />
        <Route path="/money-flow" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><MoneyFlowPage /></MainLayout></ProtectedRoute>} />
        <Route path="/network" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><NetworkPage /></MainLayout></ProtectedRoute>} />
        <Route path="/predictions" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><PredictionsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/risk" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><RiskPage /></MainLayout></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><AlertsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/investigations" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><InvestigationsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><TransactionsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><AccountsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/locations" element={<ProtectedRoute allowedRoles={['Investigator', 'Admin']}><MainLayout><LocationsPage /></MainLayout></ProtectedRoute>} />

        {/* Default Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
