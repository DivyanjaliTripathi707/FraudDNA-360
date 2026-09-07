import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/detection" element={<MainLayout><DetectionPage /></MainLayout>} />
        <Route path="/network" element={<MainLayout><NetworkPage /></MainLayout>} />
        <Route path="/predictions" element={<MainLayout><PredictionsPage /></MainLayout>} />
        <Route path="/risk" element={<MainLayout><RiskPage /></MainLayout>} />
        <Route path="/alerts" element={<MainLayout><AlertsPage /></MainLayout>} />
        <Route path="/investigations" element={<MainLayout><InvestigationsPage /></MainLayout>} />
        <Route path="/transactions" element={<MainLayout><TransactionsPage /></MainLayout>} />
        <Route path="/accounts" element={<MainLayout><AccountsPage /></MainLayout>} />
        <Route path="/locations" element={<MainLayout><LocationsPage /></MainLayout>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
