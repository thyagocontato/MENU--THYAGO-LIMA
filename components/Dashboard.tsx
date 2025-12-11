import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getOrders } from '../services/storageService';
import { BusinessStats, Order, OrderStatus } from '../types';
import { analyzeBusinessData } from '../services/geminiService';
import { TrendingUp, Users, MapPin, DollarSign, BrainCircuit, RotateCcw } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const stats: BusinessStats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalValue, 0);
    const totalOrders = orders.length;

    // Top Items logic
    const itemCounts: Record<string, number> = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
        });
    });
    const topItems = Object.entries(itemCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Top Locations logic
    const locCounts: Record<string, number> = {};
    orders.forEach(order => {
        locCounts[order.location] = (locCounts[order.location] || 0) + 1;
    });
    const topLocations = Object.entries(locCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    // Top Clients logic
    const clientRev: Record<string, number> = {};
    orders.forEach(order => {
        clientRev[order.clientName] = (clientRev[order.clientName] || 0) + order.totalValue;
    });
    const topClients = Object.entries(clientRev)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

    return { totalRevenue, totalOrders, topItems, topLocations, topClients };
  }, [orders]);

  const runAnalysis = async () => {
    setIsLoadingAnalysis(true);
    const result = await analyzeBusinessData(stats);
    setAnalysis(result);
    setIsLoadingAnalysis(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
         <h2 className="text-3xl font-bold text-gray-800">Painel de Controle</h2>
         <button 
            onClick={runAnalysis}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
            disabled={isLoadingAnalysis}
         >
            {isLoadingAnalysis ? <RotateCcw className="animate-spin w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
            {analysis ? 'Atualizar Análise IA' : 'Gerar Análise IA'}
         </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Receita Total</p>
                <p className="text-2xl font-bold text-gray-800">R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Atendimentos</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full text-blue-600"><TrendingUp className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Melhor Cliente</p>
                <p className="text-lg font-bold text-gray-800 truncate max-w-[150px]">{stats.topClients[0]?.name || '-'}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Users className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Bairro Principal</p>
                <p className="text-lg font-bold text-gray-800 truncate max-w-[150px]">{stats.topLocations[0]?.name || '-'}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full text-amber-600"><MapPin className="w-6 h-6"/></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Pratos Mais Vendidos</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topItems} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Distribuição por Local</h3>
            <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={stats.topLocations}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="count"
                    >
                        {stats.topLocations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
            </div>
             <div className="flex justify-center gap-4 text-xs text-gray-500 flex-wrap">
                {stats.topLocations.slice(0,4).map((entry, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span>{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      {analysis && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-4 text-indigo-800">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-bold text-lg">Insights Inteligentes Gemini</h3>
            </div>
            <div 
                className="prose prose-sm text-gray-700 max-w-none"
                dangerouslySetInnerHTML={{ __html: analysis }} 
            />
        </div>
      )}
    </div>
  );
};

export default Dashboard;