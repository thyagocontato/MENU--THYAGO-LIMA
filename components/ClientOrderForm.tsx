import React, { useState, useEffect } from 'react';
import { formatDisplayDate } from '../utils';
import { MenuItem, Order, OrderStatus } from '../types';
import { getMenu, addOrder } from '../services/storageService';
import { Calendar, Users, MapPin, Clock, Check, User, Phone, ShoppingBag, LockKeyhole, MessageSquare, Instagram, Send, Sparkles, MessageCircle, Copy, CheckCircle2, RefreshCw, X } from 'lucide-react';
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

    // 2-Message WhatsApp Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [msg1Text, setMsg1Text] = useState('');
    const [msg2Text, setMsg2Text] = useState('');
    const [copied1, setCopied1] = useState(false);
    const [copied2, setCopied2] = useState(false);
    const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

    const showNotice = (msg: string) => {
        setNoticeMessage(msg);
        setTimeout(() => {
            setNoticeMessage(prev => prev === msg ? null : prev);
        }, 5000);
    };

    const chefPhone = "5584996271047";

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
                showNotice("O cardápio 2026 prevê até 4 opções de entrada. Remova uma para adicionar esta.");
                return;
            }
            if (item.category === 'Principal' && counts.principais >= 2) {
                showNotice("Selecione até 2 pratos principais para compor seu menu.");
                return;
            }
            if (item.category === 'Sobremesa' && counts.sobremesas >= 1) {
                showNotice("O menu inclui 1 opção de sobremesa.");
                return;
            }
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        }
    };

    const handleCopy = async (text: string, isFirst: boolean) => {
        try {
            await navigator.clipboard.writeText(text);
            if (isFirst) {
                setCopied1(true);
                setTimeout(() => setCopied1(false), 2200);
            } else {
                setCopied2(true);
                setTimeout(() => setCopied2(false), 2200);
            }
        } catch {
            // fallback if clipboard API not available
        }
    };

    const openWhatsAppMessage = (text: string) => {
        const url = `https://api.whatsapp.com/send?phone=${chefPhone}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const triggerBothMessages = (m1: string, m2: string) => {
        const url1 = `https://api.whatsapp.com/send?phone=${chefPhone}&text=${encodeURIComponent(m1)}`;
        const url2 = `https://api.whatsapp.com/send?phone=${chefPhone}&text=${encodeURIComponent(m2)}`;
        try {
            window.open(url1, '_blank');
            setTimeout(() => {
                try {
                    window.open(url2, '_blank');
                } catch {
                    // handled by modal
                }
            }, 400);
        } catch {
            // handled by modal
        }
    };

    const handleFinalize = async () => {
        const finalGuests = typeof guests === 'string' ? parseInt(guests) || 0 : guests;

        if (!clientName || !clientPhone || !date || !time || !location || !finalGuests) {
            showNotice("Por favor, preencha todas as informações do evento (Nome, WhatsApp, Data, Horário, Local e Convidados).");
            return;
        }

        if (selectedItems.length === 0) {
            showNotice("Por favor, selecione ao menos um item do menu para o seu evento.");
            return;
        }

        const counts = {
            entradas: selectedItems.filter(i => i.category === 'Entrada').length,
            principais: selectedItems.filter(i => i.category === 'Principal').length,
            sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
        };

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

        // Mensagem 1: Nome e Contato do Cliente
        const message1 = `Olá Chef Thyago! Escolhi meu menu para 2026.

*Nome:* ${clientName}
*Contato:* ${clientPhone}`;

        // Mensagem 2: A partir da Data, Detalhes do Evento, Cardápio e Observações
        const waiterLine = waiterService ? '*Serviço de Garçom:* Sim (Taxa de R$ 140,00 - referente a 1 garçom)\n' : '';
        const notesLine = notes.trim() ? `*Observações:* ${notes.trim()}\n` : '';

        const message2 = `*Data:* ${formatDisplayDate(date)} às ${time}
*Local:* ${location}
*Convidados:* ${finalGuests} pessoas
${waiterLine}
*Minha Seleção 2026:*
${itemsList}

${notesLine}Aguardo o orçamento detalhado. Obrigado!`;

        setMsg1Text(message1);
        setMsg2Text(message2);

        // Dispara as duas mensagens simultâneas
        triggerBothMessages(message1, message2);

        // Abre modal para acompanhamento e reenvio caso o navegador bloqueie popups
        setShowSuccessModal(true);
    };

    const counts = {
        entradas: selectedItems.filter(i => i.category === 'Entrada').length,
        principais: selectedItems.filter(i => i.category === 'Principal').length,
        sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
    };

    return (
        <div className="min-h-screen bg-cream text-dark font-sans flex flex-col relative">
            {/* Elegant Floating Notification */}
            {noticeMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-[#0B2B26] text-white px-5 py-4 shadow-2xl border-2 border-secondary flex items-start gap-3 animate-fade-in">
                    <Sparkles className="text-secondary shrink-0 mt-0.5" size={18} />
                    <p className="text-xs md:text-sm font-sans flex-1 leading-relaxed text-secondary/95">
                        {noticeMessage}
                    </p>
                    <button 
                        onClick={() => setNoticeMessage(null)} 
                        className="text-secondary/70 hover:text-secondary shrink-0 p-1"
                        aria-label="Fechar"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
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
                                <span className="text-sm text-secondary font-sans uppercase tracking-widest mt-1">Taxa de R$ 140,00 (referente a 1 garçom)</span>
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
                                {waiterService && <p className="text-secondary">• Com serviço de garçom (R$ 140,00)</p>}
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

            {/* Modal de Confirmação & Envio em 2 Mensagens Simultâneas */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-[#FAF8F5] border border-secondary/40 shadow-2xl max-w-2xl w-full p-6 md:p-8 relative my-8 text-gray-900 animate-in fade-in zoom-in-95 duration-200">
                        {/* Corner ornaments */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary"></div>
                        
                        <button 
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 transition"
                            title="Fechar"
                        >
                            <X size={22} />
                        </button>

                        <div className="text-center pb-5 border-b border-secondary/20">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-700 rounded-full mb-3 shadow-inner">
                                <CheckCircle2 size={26} />
                            </div>
                            <h3 className="font-serif font-bold text-2xl md:text-3xl text-primary">
                                Solicitação Pronta para Envio!
                            </h3>
                            <p className="text-gray-600 text-xs md:text-sm font-serif italic mt-1 max-w-md mx-auto">
                                Conforme solicitado, separamos seu pedido em <strong className="text-primary not-italic font-sans font-semibold">2 mensagens simultâneas</strong> para o WhatsApp do Chef Thyago Lima.
                            </p>
                            <div className="mt-3 inline-flex items-center gap-2 bg-secondary/15 text-primary text-xs px-3 py-1 font-sans font-medium border border-secondary/30">
                                <Sparkles size={14} className="text-secondary fill-secondary shrink-0" />
                                <span>Disparo automático realizado no WhatsApp</span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-5">
                            {/* Message 1 Card */}
                            <div className="bg-white border border-secondary/20 p-4 shadow-sm hover:border-secondary/40 transition">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-primary text-secondary text-[11px] font-bold rounded-full flex items-center justify-center">1</span>
                                        <h4 className="font-serif font-bold text-sm text-primary uppercase tracking-wider">
                                            1ª Mensagem: Identificação
                                        </h4>
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-sans italic">Nome & Contato</span>
                                </div>

                                <pre className="bg-[#FAF8F5] p-3 text-xs font-mono text-gray-800 whitespace-pre-wrap border border-gray-200 rounded leading-relaxed select-all">
                                    {msg1Text}
                                </pre>

                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={() => openWhatsAppMessage(msg1Text)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-3 uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99]"
                                    >
                                        <MessageCircle size={15} />
                                        <span>Abrir 1ª Mensagem no WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopy(msg1Text, true)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2.5 px-3 border border-gray-300 flex items-center gap-1.5 transition"
                                        title="Copiar texto da mensagem 1"
                                    >
                                        <Copy size={14} />
                                        <span>{copied1 ? 'Copiado!' : 'Copiar'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Message 2 Card */}
                            <div className="bg-white border border-secondary/20 p-4 shadow-sm hover:border-secondary/40 transition">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 bg-primary text-secondary text-[11px] font-bold rounded-full flex items-center justify-center">2</span>
                                        <h4 className="font-serif font-bold text-sm text-primary uppercase tracking-wider">
                                            2ª Mensagem: Data & Cardápio Selecionado
                                        </h4>
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-sans italic">A partir da data</span>
                                </div>

                                <pre className="bg-[#FAF8F5] p-3 text-xs font-mono text-gray-800 whitespace-pre-wrap border border-gray-200 rounded max-h-48 overflow-y-auto leading-relaxed select-all">
                                    {msg2Text}
                                </pre>

                                <div className="flex items-center gap-2 mt-3">
                                    <button
                                        onClick={() => openWhatsAppMessage(msg2Text)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 px-3 uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99]"
                                    >
                                        <MessageCircle size={15} />
                                        <span>Abrir 2ª Mensagem no WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => handleCopy(msg2Text, false)}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium py-2.5 px-3 border border-gray-300 flex items-center gap-1.5 transition"
                                        title="Copiar texto da mensagem 2"
                                    >
                                        <Copy size={14} />
                                        <span>{copied2 ? 'Copiado!' : 'Copiar'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-6 pt-5 border-t border-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <button
                                onClick={() => triggerBothMessages(msg1Text, msg2Text)}
                                className="w-full sm:w-auto px-4 py-2.5 bg-primary text-secondary hover:bg-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-secondary/40 transition"
                            >
                                <RefreshCw size={14} />
                                <span>Reenviar Ambas Simultâneas</span>
                            </button>

                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-5 py-2.5 bg-secondary text-primary hover:bg-yellow-500 text-xs font-bold uppercase tracking-widest shadow-md transition"
                            >
                                Concluir e Voltar ao Menu
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
