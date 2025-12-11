import React, { useState, useEffect } from 'react';
import { MenuItem, Order, OrderStatus } from '../types';
import { getMenu, getOrders, saveOrders } from '../services/storageService';
import { Calendar, Clock, MapPin, User, Users, Smartphone, Plus, Check, MessageCircle, X, AlertCircle } from 'lucide-react';
import { generateWhatsappMessage } from '../services/geminiService';

const OrderManager: React.FC = () => {
    const [view, setView] = useState<'list' | 'new'>('list');
    const [orders, setOrders] = useState<Order[]>([]);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [filter, setFilter] = useState('All');

    // New Order State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [guests, setGuests] = useState(1);
    // Removed pricePerHead state as requested
    const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
    
    // WhatsApp Helper State
    const [whatsappMessage, setWhatsappMessage] = useState('');
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);

    useEffect(() => {
        setOrders(getOrders().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setMenu(getMenu());
    }, [view]);

    const toggleItemSelection = (item: MenuItem) => {
        if (selectedItems.find(i => i.id === item.id)) {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };

    const getSelectionCounts = () => {
        const entradas = selectedItems.filter(i => i.category === 'Entrada').length;
        const principais = selectedItems.filter(i => i.category === 'Principal').length;
        const sobremesas = selectedItems.filter(i => i.category === 'Sobremesa').length;
        return { entradas, principais, sobremesas };
    }

    const handleCreateOrder = () => {
        if (!clientName || !date || selectedItems.length === 0) {
            alert("Preencha o nome, data e escolha pelo menos um prato.");
            return;
        }

        const newOrder: Order = {
            id: Date.now().toString(),
            clientName,
            clientPhone,
            date,
            time,
            location,
            guests,
            items: selectedItems,
            pricePerHead: 0, // Set to 0 as pricing is disabled for now
            totalValue: 0,   // Set to 0 as pricing is disabled for now
            status: OrderStatus.PENDING
        };

        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        saveOrders(updatedOrders);
        setView('list');
        resetForm();
    };

    const resetForm = () => {
        setClientName('');
        setClientPhone('');
        setDate('');
        setTime('');
        setLocation('');
        setGuests(1);
        setSelectedItems([]);
    }

    const handleGenerateWhatsapp = async () => {
        const msg = await generateWhatsappMessage(selectedItems);
        setWhatsappMessage(msg);
        setShowWhatsappModal(true);
    };

    const sendToWhatsapp = () => {
        // Clean the number: remove all non-digits
        let cleanNumber = clientPhone.replace(/\D/g, '');
        
        // Validation: Simple check for length (Brazil numbers usually 10 or 11 digits without country code)
        if (cleanNumber.length < 10) {
            alert("Número de telefone inválido. Verifique se incluiu o DDD.");
            return;
        }

        // Add Brazil Country Code (55) if missing
        if (!cleanNumber.startsWith('55')) {
            cleanNumber = `55${cleanNumber}`;
        }

        const text = encodeURIComponent(whatsappMessage);
        window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
        setShowWhatsappModal(false);
    }

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);
    const counts = getSelectionCounts();

    if (view === 'new') {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Novo Atendimento (Chef Thyago Lima)</h2>
                    <button onClick={() => {setView('list'); resetForm();}} className="text-gray-500 hover:text-gray-800">Cancelar</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Client Data & Summary */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><User className="w-4 h-4"/> Dados do Cliente</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Nome</label>
                                    <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full border p-2 rounded focus:ring-primary focus:ring-1 outline-none" placeholder="Nome do Cliente" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">WhatsApp</label>
                                    <input type="text" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full border p-2 rounded focus:ring-primary focus:ring-1 outline-none" placeholder="(84) 9XXXX-XXXX" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Data</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded focus:ring-primary focus:ring-1 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Horário</label>
                                    <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full border p-2 rounded focus:ring-primary focus:ring-1 outline-none" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Local</label>
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border p-2 rounded focus:ring-primary focus:ring-1 outline-none" placeholder="Endereço / Bairro" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500">Qtd. Convidados</label>
                                    <input type="number" value={guests} onChange={e => setGuests(parseInt(e.target.value) || 0)} className="w-full border p-2 rounded focus:ring-primary focus:ring-1 outline-none" />
                                </div>
                            </div>
                        </div>

                        {selectedItems.length > 0 && (
                             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <h4 className="font-semibold text-indigo-900 mb-2">Itens Selecionados</h4>
                                <div className="space-y-1 mb-4">
                                    <div className={`text-xs flex justify-between ${counts.entradas === 4 ? 'text-green-600 font-bold' : counts.entradas > 4 ? 'text-red-500 font-bold' : 'text-indigo-700'}`}>
                                        <span>Entradas: {counts.entradas}/4</span>
                                        {counts.entradas > 4 && <AlertCircle className="w-3 h-3" />}
                                    </div>
                                    <div className={`text-xs flex justify-between ${counts.principais === 2 ? 'text-green-600 font-bold' : counts.principais > 2 ? 'text-red-500 font-bold' : 'text-indigo-700'}`}>
                                        <span>Pratos Principais: {counts.principais}/2</span>
                                         {counts.principais > 2 && <AlertCircle className="w-3 h-3" />}
                                    </div>
                                    <div className={`text-xs flex justify-between ${counts.sobremesas === 1 ? 'text-green-600 font-bold' : counts.sobremesas > 1 ? 'text-red-500 font-bold' : 'text-indigo-700'}`}>
                                        <span>Sobremesas: {counts.sobremesas}/1</span>
                                         {counts.sobremesas > 1 && <AlertCircle className="w-3 h-3" />}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={handleGenerateWhatsapp}
                                        className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <MessageCircle className="w-4 h-4" /> Enviar Zap
                                    </button>
                                    <button 
                                        onClick={handleCreateOrder}
                                        className="bg-primary text-white py-2 rounded-lg hover:bg-yellow-600 transition flex items-center justify-center gap-2 text-sm font-medium"
                                    >
                                        <Check className="w-4 h-4" /> Salvar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Menu Selection */}
                    <div className="lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[80vh]">
                        <h3 className="font-semibold text-gray-700 mb-4 sticky top-0 bg-white z-10">Montar Cardápio</h3>
                        <div className="space-y-6 overflow-y-auto pr-2 flex-1">
                            {/* Group by Category */}
                            {['Entrada', 'Principal', 'Sobremesa'].map(category => {
                                const items = menu.filter(i => i.category === category);
                                if (items.length === 0) return null;
                                return (
                                    <div key={category}>
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2 sticky top-0 bg-white">{category}s</h4>
                                        <div className="grid grid-cols-1 gap-2">
                                            {items.map(item => {
                                                const isSelected = !!selectedItems.find(i => i.id === item.id);
                                                return (
                                                    <div 
                                                        key={item.id} 
                                                        onClick={() => toggleItemSelection(item)}
                                                        className={`p-3 rounded-lg border cursor-pointer transition relative group
                                                            ${isSelected ? 'border-primary bg-yellow-50 ring-1 ring-primary' : 'border-gray-200 hover:bg-gray-50'}`}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <div className="font-medium text-gray-800 text-sm">{item.name}</div>
                                                                <div className="text-xs text-gray-500 line-clamp-2">{item.description}</div>
                                                            </div>
                                                            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Whatsapp Modal */}
                {showWhatsappModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-lg">Prévia da Mensagem</h3>
                                <button onClick={() => setShowWhatsappModal(false)}><X className="w-5 h-5 text-gray-500"/></button>
                            </div>
                            <textarea 
                                className="w-full flex-1 border p-3 rounded mb-4 text-sm font-mono bg-gray-50 min-h-[300px]"
                                value={whatsappMessage}
                                onChange={(e) => setWhatsappMessage(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 shrink-0">
                                <button onClick={() => setShowWhatsappModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button onClick={sendToWhatsapp} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 font-medium">
                                    <MessageCircle className="w-4 h-4"/> Enviar no WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Meus Atendimentos</h2>
                <button 
                    onClick={() => setView('new')}
                    className="bg-secondary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition shadow-lg shadow-gray-200"
                >
                    <Plus className="w-4 h-4" /> Novo Pedido
                </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['All', OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.COMPLETED].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
                            ${filter === status ? 'bg-primary text-white shadow-md shadow-orange-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {status === 'All' ? 'Todos' : status}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Nenhum pedido encontrado nesta categoria.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition duration-300 p-5 group">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-primary transition">{order.clientName}</h3>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                        <Smartphone className="w-3 h-3" /> {order.clientPhone}
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold
                                    ${order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                                      order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-800' : 
                                      'bg-green-100 text-green-800'}`}>
                                    {order.status}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-primary" /> {new Date(order.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4 text-primary" /> {order.time}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 text-primary" /> {order.location}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4 text-primary" /> {order.guests} pessoas
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-3 flex justify-between items-center bg-gray-50 -mx-5 -mb-5 p-4 rounded-b-xl mt-4">
                                <span className="text-gray-500 text-xs font-medium">{order.items.length} itens no menu</span>
                                <div className="text-right">
                                    <span className="font-bold text-xs text-gray-400">Orçamento sob consulta</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OrderManager;