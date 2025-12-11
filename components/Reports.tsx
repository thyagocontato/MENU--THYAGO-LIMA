import React, { useMemo, useState } from 'react';
import { getOrders } from '../services/storageService';
import { Order, MenuItem } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, TrendingUp, Award } from 'lucide-react';

const Reports: React.FC = () => {
    const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
    const orders = getOrders();

    const reportData = useMemo(() => {
        const grouped: Record<string, { name: string; revenue: number; count: number }> = {};
        const items: Record<string, number> = {};

        orders.forEach(order => {
            const date = new Date(order.date);
            let key = '';
            let name = '';

            if (reportType === 'monthly') {
                key = `${date.getFullYear()}-${date.getMonth()}`;
                name = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            } else {
                key = `${date.getFullYear()}`;
                name = `${date.getFullYear()}`;
            }

            if (!grouped[key]) {
                grouped[key] = { name, revenue: 0, count: 0 };
            }
            grouped[key].revenue += order.totalValue;
            grouped[key].count += 1;

            // Item stats
            order.items.forEach(item => {
                items[item.name] = (items[item.name] || 0) + 1;
            });
        });

        const chartData = Object.values(grouped).sort((a,b) => a.name.localeCompare(b.name));
        
        const topItems = Object.entries(items)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return { chartData, topItems };
    }, [orders, reportType]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif font-bold text-primary">Relatórios Gerenciais</h2>
                <div className="bg-white rounded-lg p-1 border border-gray-200 flex">
                    <button 
                        onClick={() => setReportType('monthly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${reportType === 'monthly' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Mensal
                    </button>
                    <button 
                        onClick={() => setReportType('yearly')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${reportType === 'yearly' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Anual
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary/20 h-96">
                    <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-secondary" /> 
                        Faturamento {reportType === 'monthly' ? 'Mensal' : 'Anual'}
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={reportData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis tickFormatter={(val) => `R$${val}`} />
                            <Tooltip formatter={(val: number) => `R$ ${val.toFixed(2)}`} />
                            <Bar dataKey="revenue" fill="#0B2B26" radius={[4, 4, 0, 0]} name="Faturamento" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Orders Count Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary/20 h-96">
                    <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-secondary" /> 
                        Volume de Pedidos
                    </h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={reportData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#D4A056" radius={[4, 4, 0, 0]} name="Pedidos" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Favorites Section for Reports */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-secondary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Award size={100} className="text-secondary" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
                    <Award className="w-6 h-6 text-secondary" /> 
                    Os Favoritos (Ranking de Pratos)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {reportData.topItems.map((item, index) => (
                        <div key={index} className="bg-cream/50 p-4 rounded-lg border border-secondary/10 flex flex-col items-center text-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-3 ${index === 0 ? 'bg-secondary text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {index + 1}º
                            </div>
                            <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                            <p className="text-sm text-gray-500">{item.count} pedidos</p>
                        </div>
                    ))}
                    {reportData.topItems.length === 0 && (
                        <p className="text-gray-500 col-span-5 text-center">Nenhum dado suficiente para gerar ranking.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;