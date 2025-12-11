import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MenuBuilder from './components/MenuBuilder';
import OrderManager from './components/OrderManager';
import ClientOrderForm from './components/ClientOrderForm';
import AdminLogin from './components/AdminLogin';
import Reports from './components/Reports';

type AppView = 'client' | 'login' | 'admin';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('client'); // Default is ALWAYS client for security
  const [activeAdminTab, setActiveAdminTab] = useState('orders'); // Start admin on orders

  const renderAdminContent = () => {
    switch (activeAdminTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'reports':
        return <Reports />;
      case 'menu':
        return <MenuBuilder />;
      case 'orders':
        return <OrderManager />;
      default:
        return <OrderManager />;
    }
  };

  // 1. Client View (Default Public View)
  if (view === 'client') {
    return (
      <ClientOrderForm 
        onAdminRequest={() => setView('login')} 
      />
    );
  }

  // 2. Login View (Gatekeeper)
  if (view === 'login') {
    return (
      <AdminLogin 
        onLoginSuccess={() => setView('admin')} 
        onBack={() => setView('client')}
      />
    );
  }

  // 3. Admin View (Private)
  return (
    <div className="flex min-h-screen bg-cream font-sans text-gray-900">
      <Sidebar 
        activeTab={activeAdminTab} 
        setActiveTab={setActiveAdminTab} 
        onClientMode={() => setView('client')}
      />
      
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 transition-all duration-300">
        {renderAdminContent()}
      </main>
    </div>
  );
};

export default App;