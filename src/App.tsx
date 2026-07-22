import { useState } from 'react';
import { WahidAiSidebar } from './components/WahidAiSidebar';
import { WahidAiDashboardHeader } from './components/WahidAiDashboardHeader';
import { TprmModuleDashboard } from './components/TprmModuleDashboard';
import './styles/app.css';

export function App() {
  const [activeModule, setActiveModule] = useState<string>('tprm');

  return (
    <div className="app-shell">
      {/* Wahid AI Dark Left Sidebar */}
      <WahidAiSidebar
        activeModule={activeModule}
        onSelectModule={setActiveModule}
      />

      {/* Main Canvas Area */}
      <div className="main-canvas">
        {/* Wahid AI Top Header Bar */}
        <WahidAiDashboardHeader />

        {/* Page Content - Third Party Risk Module Dashboard */}
        <main className="page-content">
          <TprmModuleDashboard />
        </main>
      </div>
    </div>
  );
}

export default App;
