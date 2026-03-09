import React, { useState, useEffect } from 'react';
import { formatDisplayDate } from '../utils';
import { MenuItem, Order, OrderStatus } from '../types';
import { getMenu, addOrder, getTopFavorites } from '../services/storageService';
import { Calendar, Users, MapPin, Clock, Check, ChevronRight, ChevronLeft, User, Phone, ShoppingBag, Utensils, Coffee, LockKeyhole, Star, MessageSquare, Instagram } from 'lucide-react';
import { generateWhatsappMessage } from '../services/geminiService';

interface ClientOrderFormProps {
    onAdminRequest: () => void;
}

const ClientOrderForm: React.FC<ClientOrderFormProps> = ({ onAdminRequest }) => {
    const [step, setStep] = useState(1);
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [favorites, setFavorites] = useState<MenuItem[]>([]);
    
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
        setFavorites(getTopFavorites(3));
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [step]);

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

    const handleNext = () => {
        if (step === 1) {
            if (!clientName || !clientPhone || !date || !time || !location || !guests) {
                alert("Por favor, preencha as informações básicas para prosseguirmos com seu menu.");
                return;
            }
            setStep(2);
        } else if (step === 2) {
             const counts = {
                entradas: selectedItems.filter(i => i.category === 'Entrada').length,
                principais: selectedItems.filter(i => i.category === 'Principal').length,
                sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
            };
            
            if(counts.entradas === 0 || counts.principais === 0 || counts.sobremesas === 0) {
                const confirm = window.confirm("Para uma experiência completa Thyago Lima, recomendamos selecionar Entradas, Principal e Sobremesa. Deseja avançar assim mesmo?");
                if(!confirm) return;
            }
            setStep(3);
        }
    };

    const handleFinalize = async () => {
        const finalGuests = typeof guests === 'string' ? parseInt(guests) || 0 : guests;

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

    const renderStep1 = () => (
        <div className="space-y-8 animate-fadeIn pb-24">
            <div className="text-center px-4">
                <h2 className="text-3xl font-serif text-primary font-bold mb-3">Bem-vindo à Temporada 2026</h2>
                <p className="text-gray-600 text-lg leading-relaxed font-serif italic">
                    Reserve sua data e personalize um menu exclusivo com alta gastronomia.
                </p>
            </div>

            <div className="bg-white p-8 rounded-none shadow-xl border border-secondary/20 space-y-8 relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary"></div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Seu Nome</label>
                    <input 
                        type="text" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-lg text-gray-800 transition-colors"
                        placeholder="Ex: Maria Clara"
                    />
                </div>
                
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">WhatsApp de Contato</label>
                    <input 
                        type="tel" 
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-lg text-gray-800 transition-colors"
                        placeholder="(84) 99999-9999"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Data do Evento (2026)</label>
                        <input 
                            type="date" 
                            min="2026-01-01"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-lg text-gray-800 transition-colors"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Horário de Início</label>
                        <input 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-lg text-gray-800 transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Local do Evento</label>
                    <input 
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-lg text-gray-800 transition-colors"
                        placeholder="Endereço ou Bairro em Natal-RN"
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Qtd. de Convidados</label>
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
        </div>
    );

    const renderStep2 = () => {
        const counts = {
            entradas: selectedItems.filter(i => i.category === 'Entrada').length,
            principais: selectedItems.filter(i => i.category === 'Principal').length,
            sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
        };

        return (
            <div className="space-y-8 animate-fadeIn pb-32">
                <div className="text-center px-2">
                    <h2 className="text-3xl font-serif text-primary font-bold mb-2">Seu Menu Personalizado</h2>
                    <p className="text-gray-600 font-serif italic">Escolha 4 Entradas, 2 Principais e 1 Sobremesa.</p>
                </div>

                <div className="sticky top-[110px] bg-cream/95 backdrop-blur-sm z-10 py-4 px-2 border-b border-secondary/20 shadow-sm mx-[-1rem] md:mx-0">
                    <div className="flex justify-around text-center text-xs md:text-sm font-bold uppercase tracking-widest font-sans">
                        <div className={`flex flex-col ${counts.entradas === 4 ? 'text-green-600' : 'text-primary'}`}>
                            <span>Entradas</span>
                            <span className="text-lg font-serif">{counts.entradas}/4</span>
                        </div>
                        <div className={`flex flex-col ${counts.principais === 2 ? 'text-green-600' : 'text-primary'}`}>
                            <span>Principais</span>
                            <span className="text-lg font-serif">{counts.principais}/2</span>
                        </div>
                        <div className={`flex flex-col ${counts.sobremesas === 1 ? 'text-green-600' : 'text-primary'}`}>
                            <span>Sobremesa</span>
                            <span className="text-lg font-serif">{counts.sobremesas}/1</span>
                        </div>
                    </div>
                </div>

                {favorites.length > 0 && (
                     <div className="mb-10">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Star className="text-secondary fill-secondary" size={20} />
                            <h3 className="text-xl font-serif text-primary font-bold tracking-wider">OS FAVORITOS 2026</h3>
                            <Star className="text-secondary fill-secondary" size={20} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {favorites.map(item => {
                                const isSelected = !!selectedItems.find(i => i.id === item.id);
                                return (
                                    <div 
                                        key={item.id}
                                        onClick={() => toggleItem(item)}
                                        className={`p-6 border transition-all duration-300 cursor-pointer relative
                                            ${isSelected 
                                                ? 'border-primary bg-primary text-white shadow-xl transform scale-[1.02]' 
                                                : 'border-secondary/30 bg-white text-gray-800 hover:border-secondary shadow-sm'}`}
                                    >
                                        <div className="text-center">
                                            <div className="uppercase tracking-widest text-[9px] mb-2 opacity-70 font-bold">{item.category}</div>
                                            <h4 className="font-serif font-bold text-lg mb-2 leading-tight">{item.name}</h4>
                                            <p className={`text-xs leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                         {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <Check size={16} />
                                            </div>
                                        )}
                                    </div>
                                )
                             })}
                        </div>
                     </div>
                )}

                {['Entrada', 'Principal', 'Sobremesa'].map((category) => (
                    <div key={category} className="mb-12">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-secondary/30"></div>
                            <h3 className="text-2xl font-serif text-primary font-bold uppercase tracking-widest">
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
                                                : 'bg-white text-gray-800 hover:bg-white/80 shadow-sm border-secondary/10 hover:border-secondary/30'}`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className={`font-serif font-bold text-lg mb-1 leading-tight`}>
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

                {/* Serviço de Garçom Section */}
                <div className="mt-12 bg-white p-8 border border-secondary/20 shadow-lg relative">
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

                {/* Informações Importantes Section */}
                <div className="mt-12 bg-white p-8 border border-secondary/20 shadow-lg relative">
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

                {/* Observações Section */}
                <div className="mt-16 bg-white p-8 border border-secondary/20 shadow-lg relative">
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
            </div>
        );
    };

    const renderStep3 = () => (
        <div className="space-y-8 animate-fadeIn pb-32">
            <div className="text-center px-4">
                <h2 className="text-3xl font-serif text-primary font-bold mb-3">Sua Escolha Chef Thyago Lima</h2>
                <p className="text-gray-600 font-serif italic">Revise sua seleção para 2026 antes de finalizar.</p>
            </div>

            <div className="bg-white mx-2 shadow-2xl overflow-hidden relative border border-secondary/10">
                <div className="h-2 bg-primary w-full"></div>
                <div className="p-8 space-y-10">
                    <div className="border-b border-secondary/20 pb-8 text-center">
                        <div className="inline-block border-2 border-secondary p-4 mb-4">
                            <span className="block text-3xl font-serif font-bold text-primary">TL</span>
                        </div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-6">Confirmar Menu</h3>
                        
                        <div className="grid grid-cols-1 gap-3 font-serif text-dark">
                            <div className="text-xl font-bold">{clientName}</div>
                            <div className="text-lg text-gray-500">{formatDisplayDate(date)} às {time}</div>
                            <div className="text-lg text-gray-500">{location}</div>
                            <div className="text-lg text-gray-500">{guests} Convidados</div>
                            {waiterService && <div className="text-lg text-primary font-bold italic">Com Serviço de Garçom (R$ 120,00)</div>}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-8 text-center">Itens Selecionados Temporada 2026</h3>
                        <div className="space-y-10">
                            {['Entrada', 'Principal', 'Sobremesa'].map(cat => {
                                const items = selectedItems.filter(i => i.category === cat);
                                if(items.length === 0) return null;
                                return (
                                    <div key={cat} className="text-center">
                                        <p className="font-serif text-primary font-bold text-xl mb-4 italic border-b border-cream inline-block px-4">
                                            {cat === 'Entrada' ? 'Entradas' : cat === 'Principal' ? 'Pratos Principais' : 'Sobremesa'}
                                        </p>
                                        <ul className="space-y-3">
                                            {items.map(i => (
                                                <li key={i.id} className="text-gray-800 font-sans font-medium">
                                                    {i.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {notes && (
                        <div className="border-t border-secondary/10 pt-8">
                            <h3 className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em] mb-4 text-center">Observações Especiais</h3>
                            <div className="bg-cream/20 p-4 border border-secondary/10 text-center italic text-gray-700 font-serif">
                                "{notes}"
                            </div>
                        </div>
                    )}

                    <div className="border-t border-secondary/10 pt-8 text-center">
                        <div className="space-y-2 text-[10px] text-secondary font-sans uppercase tracking-widest">
                            <p>• Bebidas: não fornecemos bebidas</p>
                            <p>• Cutelaria: disponibilizamos utensílios para as entradas</p>
                        </div>
                    </div>
                </div>
                <div className="h-2 bg-secondary w-full"></div>
            </div>
            
            <p className="text-center text-sm text-gray-500 italic px-6 font-serif leading-relaxed">
                Ao finalizar, o Chef Thyago Lima receberá sua seleção e entrará em contato via WhatsApp para confirmar detalhes e valores.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-cream text-dark font-sans flex flex-col">
            <header className="bg-primary pt-12 pb-24 px-6 shadow-2xl relative overflow-hidden z-20">
                <div className="max-w-4xl mx-auto text-center relative z-10">
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
                        className="inline-flex items-center gap-2 text-secondary/60 hover:text-secondary transition-colors mt-6 text-xs tracking-widest uppercase group"
                    >
                        <Instagram size={16} className="group-hover:scale-110 transition-transform" />
                        @thyagolimachef
                    </a>
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-secondary/10 rounded-full z-0"></div>
            </header>

            <main className="flex-1 -mt-12 relative z-30 px-4 md:px-0">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-center mb-10">
                         <div className="bg-white shadow-lg px-8 py-4 flex items-center gap-8 border border-secondary/10">
                            <div className={`w-2.5 h-2.5 transform rotate-45 transition-all duration-300 ${step === 1 ? 'bg-secondary scale-150 shadow-md shadow-secondary/20' : 'bg-gray-200'}`}></div>
                            <div className={`w-2.5 h-2.5 transform rotate-45 transition-all duration-300 ${step === 2 ? 'bg-secondary scale-150 shadow-md shadow-secondary/20' : 'bg-gray-200'}`}></div>
                            <div className={`w-2.5 h-2.5 transform rotate-45 transition-all duration-300 ${step === 3 ? 'bg-secondary scale-150 shadow-md shadow-secondary/20' : 'bg-gray-200'}`}></div>
                         </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>
            </main>

            <footer className="pb-32 pt-10 px-6 text-center">
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

            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-secondary/20 p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-50">
                <div className="max-w-3xl mx-auto flex gap-4">
                    {step > 1 ? (
                        <button 
                            onClick={() => setStep(step - 1)}
                            className="flex-1 py-4 border border-gray-300 text-gray-600 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ChevronLeft size={16} /> Voltar
                        </button>
                    ) : (
                         <button 
                            onClick={onAdminRequest}
                            className="w-14 flex items-center justify-center opacity-10 hover:opacity-100 transition-opacity"
                            title="Área do Chef"
                        >
                            <LockKeyhole size={20} />
                        </button>
                    )}

                    {step < 3 ? (
                        <button 
                            onClick={handleNext}
                            className="flex-[2] py-4 bg-primary text-secondary font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-black transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            Próximo Passo <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleFinalize}
                            className="flex-[2] py-4 bg-secondary text-white font-bold uppercase tracking-widest text-xs shadow-xl hover:bg-yellow-600 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={18} /> Solicitar Orçamento
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientOrderForm;