import React from 'react';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, ChefHat, LogOut, FileBarChart } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onClientMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onClientMode }) => {
  const menuItems = [
    { id: 'orders', label: 'Atendimentos', icon: ClipboardList },
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart },
    { id: 'menu', label: 'Cardápio', icon: UtensilsCrossed },
  ];

  return (
    <div className="w-20 lg:w-64 bg-primary text-white flex flex-col h-screen fixed left-0 top-0 z-20 transition-all duration-300 shadow-xl border-r border-secondary/20">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-secondary/30">
        <div className="bg-white/10 p-2 rounded-lg">
            <ChefHat className="w-6 h-6 text-secondary" />
        </div>
        <div className="hidden lg:block">
            <h1 className="font-serif font-bold text-lg tracking-wide leading-tight text-secondary">THYAGO LIMA</h1>
            <span className="text-[10px] text-white/60 font-medium tracking-[0.2em] uppercase">Gastronomia</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-2 lg:px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all duration-200
                ${isActive 
                    ? 'bg-secondary text-primary shadow-lg font-bold' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden lg:block">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-secondary/30">
        <button 
            onClick={onClientMode}
            className="w-full bg-white/5 hover:bg-red-900/50 text-white/80 font-semibold p-3 rounded-xl flex items-center justify-center lg:justify-start gap-3 transition-colors border border-secondary/30"
        >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block">Sair (Cliente)</span>
        </button>
        <div className="mt-4 text-center lg:text-left text-[10px] text-white/40 uppercase tracking-widest hidden lg:block">
          v1.2.0 TL Gastronomia
        </div>
      </div>
    </div>
  );
};

export default Sidebar;