import React, { useState } from 'react';
import { ChefHat, Lock, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2025') {
      onLoginSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-cream rounded-none shadow-2xl p-12 max-w-sm w-full relative border border-secondary/50">
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex flex-col items-center mb-8 mt-4">
            <div className="border-2 border-secondary p-4 mb-4">
                <span className="text-4xl font-serif font-bold text-primary block">TL</span>
            </div>
          <h2 className="text-2xl font-serif font-bold text-primary tracking-wide">ÁREA DO CHEF</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2 uppercase tracking-widest text-xs">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-secondary" size={20} />
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {setError(false); setPin(e.target.value)}}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-none text-lg outline-none transition focus:ring-1 
                  ${error ? 'border-red-500 ring-red-200' : 'border-secondary/30 focus:border-secondary focus:ring-secondary/20'}`}
                placeholder="PIN"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-2 text-center">Acesso negado.</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-secondary font-bold py-4 shadow-lg hover:bg-black transition uppercase tracking-widest text-sm"
          >
            Acessar Painel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;