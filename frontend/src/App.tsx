import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Purchase } from './pages/Purchase';
import { Sales } from './pages/Sales'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="purchase" element={<Purchase />} />
            <Route path="sales" element={<Sales />} />
            <Route path="warehouse" element={<div>仓储管理页面开发中...</div>} />
            <Route path="products" element={<div>商品管理页面开发中...</div>} />
            <Route path="customers" element={<div>客户管理页面开发中...</div>} />
            <Route path="suppliers" element={<div>供应商管理页面开发中...</div>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;