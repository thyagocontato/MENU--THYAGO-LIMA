import React, { useState, useEffect } from 'react';
import { formatDisplayDate } from '../utils';
import { MenuItem, Order, OrderStatus } from '../types';
import { getMenu, addOrder } from '../services/storageService';
import { Calendar, Users, MapPin, Clock, Check, User, Phone, ShoppingBag, LockKeyhole, MessageSquare, Instagram, Send, Sparkles } from 'lucide-react';
import { generateWhatsappMessage } from '../services/geminiService';

interface ClientOrderFormProps {
    onAdminRequest: () => void;
}

const ClientOrderForm: React.FC<ClientOrderFormProps> = ({ onAdminRequest }) => {
    const [menu, setMenu] = useState<MenuItem[]>([]);
    
    // Form Data - Default Date 2026
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [date, setDate] = useState('2026-01-01');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [guests, setGuests] = useState<number | string>(2); 
    const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
    const [notes, setNotes] = useState('');
    const [waiterService, setWaiterService] = useState(true);

    useEffect(() => {
        setMenu(getMenu());
        window.scrollTo(0, 0);
    }, []);

    const toggleItem = (item: MenuItem) => {
        const isSelected = selectedItems.find(i => i.id === item.id);
        
        const counts = {
            entradas: selectedItems.filter(i => i.category === 'Entrada').length,
            principais: selectedItems.filter(i => i.category === 'Principal').length,
            sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
        };

        if (!isSelected) {
            if (item.category === 'Entrada' && counts.entradas >= 4) {
                alert("O cardápio 2026 prevê 4 opções de entrada. Por favor, remova uma para selecionar esta.");
                return;
            }
            if (item.category === 'Principal' && counts.principais >= 2) {
                alert("Selecione até 2 pratos principais para compor seu menu.");
                return;
            }
            if (item.category === 'Sobremesa' && counts.sobremesas >= 1) {
                alert("O menu inclui 1 opção de sobremesa.");
                return;
            }
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        }
    };

    const handleFinalize = async () => {
        const finalGuests = typeof guests === 'string' ? parseInt(guests) || 0 : guests;

        if (!clientName || !clientPhone || !date || !time || !location || !finalGuests) {
            alert("Por favor, preencha todas as informações do evento (Nome, WhatsApp, Data, Horário, Local e Qtd. de Convidados).");
            return;
        }

        if (selectedItems.length === 0) {
            alert("Por favor, selecione ao menos um item do menu para o seu evento.");
            return;
        }

        const counts = {
            entradas: selectedItems.filter(i => i.category === 'Entrada').length,
            principais: selectedItems.filter(i => i.category === 'Principal').length,
            sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
        };

        if (counts.entradas === 0 || counts.principais === 0 || counts.sobremesas === 0) {
            const confirm = window.confirm("Para uma experiência completa Thyago Lima, recomendamos selecionar Entradas, Principal e Sobremesa. Deseja enviar sua solicitação assim mesmo?");
            if (!confirm) return;
        }

        const newOrder: Order = {
            id: Date.now().toString(),
            clientName,
            clientPhone,
            date,
            time,
            location,
            guests: finalGuests,
            items: selectedItems,
            pricePerHead: 0,
            totalValue: 0,
            status: OrderStatus.PENDING,
            notes: notes,
            waiterService: waiterService
        };

        addOrder(newOrder);

        const itemsList = await generateWhatsappMessage(selectedItems);
        const chefPhone = "5584996271047"; 
        
        const message = `Olá Chef Thyago! Escolhi meu menu para 2026.
        
*Nome:* ${clientName}
*Contato:* ${clientPhone}
*Data:* ${formatDisplayDate(date)} às ${time}
*Local:* ${location}
*Convidados:* ${finalGuests} pessoas
${waiterService ? '*Serviço de Garçom:* Sim (Taxa R$ 120,00 - referente a 1 garçom)\n' : ''}

*Minha Seleção 2026:*
${itemsList}

${notes ? `*Observações:* ${notes}\n` : ''}
Aguardo o orçamento detalhado. Obrigado!`;

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://api.whatsapp.com/send?phone=${chefPhone}&text=${encodedMsg}`, '_blank');
        window.location.reload(); 
    };

    const counts = {
        entradas: selectedItems.filter(i => i.category === 'Entrada').length,
        principais: selectedItems.filter(i => i.category === 'Principal').length,
        sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
    };

    return (
        <div className="min-h-screen bg-cream text-dark font-sans flex flex-col">
            {/* Header */}
            <header className="bg-primary pt-12 pb-20 px-6 shadow-2xl relative overflow-hidden z-20">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <button 
                        onClick={onAdminRequest}
                        className="absolute top-0 right-0 p-2 text-secondary/30 hover:text-secondary transition-colors"
                        title="Área do Chef"
                    >
                        <LockKeyhole size={18} />
                    </button>
                    
                    <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-wide leading-tight text-secondary">
                        THYAGO LIMA
                    </h1>
                    <p className="text-secondary/80 text-xs md:text-sm font-light tracking-[0.4em] uppercase mt-2">
                        Gastronomia Exclusiva • 2026
                    </p>
                    <a 
                        href="https://www.instagram.com/thyagolimachef/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-secondary/60 hover:text-secondary transition-colors mt-5 text-xs tracking-widest uppercase group"
                    >
                        <Instagram size={16} className="group-hover:scale-110 transition-transform" />
                        @thyagolimachef
                    </a>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-secondary/10 rounded-full z-0"></div>
            </header>

            {/* Main Content */}
            <main className="flex-1 -mt-10 relative z-30 px-4 md:px-0 pb-32">
                <div className="max-w-3xl mx-auto space-y-10">

                    {/* Section 1: Dados do Cliente e Evento */}
                    <div className="bg-white p-8 rounded-none shadow-xl border border-secondary/20 space-y-8 relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary"></div>

                        <div className="text-center pb-4 border-b border-secondary/10">
                            <h2 className="text-2xl md:text-3xl font-serif text-primary font-bold">1. Dados do Seu Evento</h2>
                            <p className="text-gray-500 text-sm font-serif italic mt-1">
                                Preencha as informações para a reserva da sua data em 2026.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-primary font-bold text-base font-serif">
                                    <User size={18} className="text-secondary" />
                                    Seu Nome
                                </label>
                                <input 
                                    type="text" 
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-base text-gray-800 transition-colors"
                                    placeholder="Ex: Maria Clara"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-primary font-bold text-base font-serif">
                                    <Phone size={18} className="text-secondary" />
                                    WhatsApp de Contato
                                </label>
                                <input 
                                    type="tel" 
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-base text-gray-800 transition-colors"
                                    placeholder="(84) 99999-9999"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-primary font-bold text-base font-serif">
                                    <Calendar size={18} className="text-secondary" />
                                    Data do Evento (2026)
                                </label>
                                <input 
                                    type="date" 
                                    min="2026-01-01"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-base text-gray-800 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-primary font-bold text-base font-serif">
                                    <Clock size={18} className="text-secondary" />
                                    Horário de Início
                                </label>
                                <input 
                                    type="time" 
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-base text-gray-800 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-primary font-bold text-base font-serif">
                                <MapPin size={18} className="text-secondary" />
                                Local do Evento
                            </label>
                            <input 
                                type="text" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-base text-gray-800 transition-colors"
                                placeholder="Endereço ou Bairro em Natal-RN"
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="flex items-center gap-2 text-primary font-bold text-base font-serif">
                                <Users size={18} className="text-secondary" />
                                Qtd. de Convidados
                            </label>
                            <div className="bg-cream/50 p-6 border border-secondary/20 flex flex-col items-center justify-center">
                                <div className="relative w-32">
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={guests} 
                                        onChange={(e) => setGuests(e.target.value)}
                                        className="w-full text-center bg-transparent border-b-2 border-secondary text-4xl font-serif font-bold text-primary focus:outline-none focus:border-primary/50 transition-colors p-2"
                                        placeholder="0"
                                    />
                                </div>
                                <span className="text-xs text-secondary font-sans tracking-widest uppercase mt-2">Pessoas</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Escolha do Menu */}
                    <div className="bg-white p-8 rounded-none shadow-xl border border-secondary/20 space-y-8 relative">
                        <div className="text-center pb-4 border-b border-secondary/10">
                            <h2 className="text-2xl md:text-3xl font-serif text-primary font-bold">2. Escolha Seu Menu</h2>
                            <p className="text-gray-500 text-sm font-serif italic mt-1">
                                Selecione 4 Entradas, 2 Pratos Principais e 1 Sobremesa.
                            </p>

                            <div className="mt-4 bg-amber-50/90 border border-amber-200 p-3 text-center text-xs text-amber-900 font-serif rounded-none flex items-center justify-center gap-2 max-w-xl mx-auto shadow-sm">
                                <Sparkles size={14} className="text-amber-600 fill-amber-500 shrink-0" />
                                <span>
                                    <strong className="text-amber-800 uppercase tracking-wider font-sans text-[11px] mr-1">Seleção Premium:</strong>
                                    Pratos com o selo dourado utilizam insumos nobres de altíssimo padrão (lagosta, polvo, bacalhau confitado, pato e cordeiro).
                                </span>
                            </div>
                        </div>

                        {/* Sticky Category Counters */}
                        <div className="sticky top-[10px] bg-cream/95 backdrop-blur-sm z-10 py-3 px-4 border border-secondary/30 shadow-md my-4">
                            <div className="flex justify-around text-center text-xs md:text-sm font-bold uppercase tracking-widest font-sans">
                                <div className={`flex flex-col ${counts.entradas === 4 ? 'text-green-700' : 'text-primary'}`}>
                                    <span>Entradas</span>
                                    <span className="text-base font-serif">{counts.entradas}/4</span>
                                </div>
                                <div className={`flex flex-col ${counts.principais === 2 ? 'text-green-700' : 'text-primary'}`}>
                                    <span>Principais</span>
                                    <span className="text-base font-serif">{counts.principais}/2</span>
                                </div>
                                <div className={`flex flex-col ${counts.sobremesas === 1 ? 'text-green-700' : 'text-primary'}`}>
                                    <span>Sobremesa</span>
                                    <span className="text-base font-serif">{counts.sobremesas}/1</span>
                                </div>
                            </div>
                        </div>

                        {['Entrada', 'Principal', 'Sobremesa'].map((category) => (
                            <div key={category} className="mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1 h-px bg-secondary/30"></div>
                                    <h3 className="text-xl font-serif text-primary font-bold uppercase tracking-widest">
                                        {category === 'Entrada' ? 'Entradas' : category === 'Principal' ? 'Pratos Principais' : 'Sobremesas'}
                                    </h3>
                                    <div className="flex-1 h-px bg-secondary/30"></div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {menu.filter(i => i.category === category).map(item => {
                                        const isSelected = !!selectedItems.find(i => i.id === item.id);
                                        return (
                                            <div 
                                                key={item.id}
                                                onClick={() => toggleItem(item)}
                                                className={`p-5 transition-all duration-300 cursor-pointer relative border
                                                    ${isSelected 
                                                        ? 'bg-primary text-white border-primary shadow-lg' 
                                                        : 'bg-white text-gray-800 hover:bg-cream/40 shadow-sm border-secondary/20 hover:border-secondary/50'}`}
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        {item.isPremium && (
                                                            <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 mb-2 border transition-colors ${
                                                                isSelected 
                                                                    ? 'bg-amber-400/20 text-amber-300 border-amber-300/40' 
                                                                    : 'bg-amber-100/90 text-amber-900 border-amber-300/80 shadow-2xs'
                                                            }`}>
                                                                <Sparkles size={11} className={isSelected ? 'fill-amber-300 text-amber-300' : 'fill-amber-600 text-amber-600'} />
                                                                <span>Seleção Premium</span>
                                                            </div>
                                                        )}
                                                        <h4 className="font-serif font-bold text-base mb-1 leading-tight">
                                                            {item.name}
                                                        </h4>
                                                        <p className={`text-xs leading-relaxed font-sans ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                    <div className={`w-5 h-5 border flex items-center justify-center shrink-0 transition-colors mt-1
                                                        ${isSelected ? 'border-white bg-white text-primary' : 'border-secondary/40 text-transparent'}`}>
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Section 3: Serviço de Garçom */}
                    <div className="bg-white p-8 border border-secondary/20 shadow-xl relative">
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    checked={waiterService}
                                    onChange={(e) => setWaiterService(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${waiterService ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${waiterService ? 'translate-x-7' : ''} shadow-sm`}></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-primary font-bold font-serif text-xl">Deseja Serviço de Garçom?</span>
                                <span className="text-sm text-secondary font-sans uppercase tracking-widest mt-1">Taxa de R$ 120,00 (referente a 1 garçom)</span>
                            </div>
                        </label>
                        <p className="mt-4 text-gray-500 text-sm font-serif italic">
                            Caso seu evento necessite de mais profissionais, favor informar nas observações abaixo.
                        </p>
                    </div>

                    {/* Section 4: Informações Importantes */}
                    <div className="bg-white p-8 border border-secondary/20 shadow-xl relative">
                        <div className="flex items-center gap-3 mb-6">
                            <LockKeyhole className="text-secondary" size={20} />
                            <h3 className="text-xl font-serif text-primary font-bold uppercase tracking-widest">Informações Importantes</h3>
                        </div>
                        <div className="space-y-4 font-serif italic text-gray-700">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 shrink-0"></div>
                                <p><span className="font-bold text-primary not-italic">Bebidas:</span> não fornecemos bebidas.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 shrink-0"></div>
                                <p><span className="font-bold text-primary not-italic">Cutelaria:</span> disponibilizamos utensílios necessários para as entradas.</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Observações */}
                    <div className="bg-white p-8 border border-secondary/20 shadow-xl relative">
                        <div className="flex items-center gap-3 mb-6">
                            <MessageSquare className="text-secondary" size={24} />
                            <h3 className="text-2xl font-serif text-primary font-bold">Observações do Menu</h3>
                        </div>
                        <p className="text-gray-500 text-sm font-serif italic mb-4">
                            Deseja informar restrições alimentares, alergias ou algum pedido especial para o Chef?
                        </p>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-4 bg-cream/30 border border-secondary/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-800 font-sans min-h-[120px] transition-all"
                            placeholder="Ex: 2 convidados vegetarianos, alergia a frutos do mar, etc..."
                        />
                    </div>

                    {/* Section 6: Finalize Button */}
                    <div className="bg-primary text-white p-8 shadow-2xl border border-secondary/30 text-center space-y-6">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-serif font-bold text-secondary">Tudo Pronto?</h3>
                            <p className="text-sm font-serif italic text-white/80">
                                Clique abaixo para enviar sua seleção diretamente para o WhatsApp do Chef Thyago Lima.
                            </p>
                        </div>

                        {selectedItems.length > 0 && (
                            <div className="bg-white/10 p-4 border border-secondary/20 text-xs font-sans space-y-1 text-white/90">
                                <p className="font-bold text-secondary uppercase tracking-wider mb-2">Resumo da Seleção:</p>
                                <p>{selectedItems.length} item(ns) selecionado(s) ({counts.entradas} Entradas, {counts.principais} Principais, {counts.sobremesas} Sobremesa)</p>
                                {waiterService && <p className="text-secondary">• Com serviço de garçom (R$ 120,00)</p>}
                            </div>
                        )}

                        <button 
                            onClick={handleFinalize}
                            className="w-full py-5 bg-secondary text-primary font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-yellow-500 transition-all duration-300 active:scale-[0.99] flex items-center justify-center gap-3"
                        >
                            <Send size={20} />
                            Solicitar Orçamento no WhatsApp
                        </button>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="pb-16 pt-10 px-6 text-center">
                <div className="max-w-4xl mx-auto border-t border-secondary/10 pt-10">
                    <p className="text-primary font-serif italic text-sm mb-4">Acompanhe meu trabalho diário</p>
                    <a 
                        href="https://www.instagram.com/thyagolimachef/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-white px-6 py-3 border border-secondary/20 shadow-sm hover:shadow-md transition-all group"
                    >
                        <Instagram size={20} className="text-secondary group-hover:scale-110 transition-transform" />
                        <span className="text-primary font-bold tracking-widest uppercase text-xs">Instagram @thyagolimachef</span>
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default ClientOrderForm;
