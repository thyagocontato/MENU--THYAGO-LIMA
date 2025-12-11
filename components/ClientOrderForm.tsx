import React, { useState, useEffect } from 'react';
import { MenuItem, Order, OrderStatus } from '../types';
import { getMenu, addOrder, getTopFavorites } from '../services/storageService';
import { Calendar, Users, MapPin, Clock, Check, ChevronRight, ChevronLeft, User, Phone, ShoppingBag, Utensils, Coffee, LockKeyhole, Star } from 'lucide-react';
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
    const [guests, setGuests] = useState(2);
    const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);

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
        
        // Limits logic
        const counts = {
            entradas: selectedItems.filter(i => i.category === 'Entrada').length,
            principais: selectedItems.filter(i => i.category === 'Principal').length,
            sobremesas: selectedItems.filter(i => i.category === 'Sobremesa').length
        };

        if (!isSelected) {
            if (item.category === 'Entrada' && counts.entradas >= 4) {
                alert("Para garantir a qualidade do serviço, escolha no máximo 4 opções de entrada.");
                return;
            }
            if (item.category === 'Principal' && counts.principais >= 2) {
                alert("Por favor, selecione até 2 pratos principais.");
                return;
            }
            if (item.category === 'Sobremesa' && counts.sobremesas >= 1) {
                alert("Selecione 1 opção de sobremesa.");
                return;
            }
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter(i => i.id !== item.id));
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!clientName || !clientPhone || !date || !time || !location) {
                alert("Por favor, preencha todas as informações para prosseguirmos.");
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
                const confirm = window.confirm("Notamos que seu menu ainda não está completo (Entradas, Principal ou Sobremesa). Deseja continuar mesmo assim?");
                if(!confirm) return;
            }
            setStep(3);
        }
    };

    const handleFinalize = async () => {
        const newOrder: Order = {
            id: Date.now().toString(),
            clientName,
            clientPhone,
            date,
            time,
            location,
            guests,
            items: selectedItems,
            pricePerHead: 0,
            totalValue: 0,
            status: OrderStatus.PENDING
        };

        addOrder(newOrder);

        const itemsList = await generateWhatsappMessage(selectedItems);
        const chefPhone = "5584996271047"; 
        
        const message = `Olá Chef Thyago! Gostaria de um orçamento para meu evento.
        
*Nome:* ${clientName}
*Contato:* ${clientPhone}
*Data:* ${new Date(date).toLocaleDateString()} às ${time}
*Local:* ${location}
*Convidados:* ${guests} pessoas

*Minha Seleção:*
${itemsList}

Aguardo o retorno. Obrigado!`;

        const encodedMsg = encodeURIComponent(message);
        window.open(`https://api.whatsapp.com/send?phone=${chefPhone}&text=${encodedMsg}`, '_blank');
        window.location.reload(); 
    };

    // --- RENDER HELPERS ---

    const renderStep1 = () => (
        <div className="space-y-8 animate-fadeIn pb-24">
            <div className="text-center px-4">
                <h2 className="text-3xl font-serif text-primary font-bold mb-3">Bem-vindo</h2>
                <p className="text-gray-600 text-lg leading-relaxed font-serif italic">
                    Vamos organizar seu evento exclusivo para 2026.
                </p>
            </div>

            <div className="bg-white p-8 rounded-none shadow-xl border border-secondary/20 space-y-8 relative">
                 {/* Decorative Corner */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-secondary"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary"></div>

                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Como podemos lhe chamar?</label>
                    <input 
                        type="text" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-lg text-gray-800 transition-colors"
                        placeholder="Nome completo"
                    />
                </div>
                
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">WhatsApp</label>
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
                        <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Data</label>
                        <input 
                            type="date" 
                            min="2026-01-01"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-3 bg-[#fdfdfd] border-b border-secondary/50 focus:border-primary outline-none text-lg text-gray-800 transition-colors"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Horário</label>
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
                        placeholder="Endereço ou Bairro"
                    />
                </div>

                <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-2 text-primary font-bold text-lg font-serif">Número de Convidados</label>
                    <div className="bg-cream p-6 border border-secondary/20 flex flex-col items-center">
                        <span className="text-4xl font-serif font-bold text-primary mb-4">{guests}</span>
                        <input 
                            type="range" 
                            min="2" 
                            max="60" 
                            value={guests} 
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                            className="w-full h-1 bg-secondary/30 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
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
                    <h2 className="text-3xl font-serif text-primary font-bold mb-2">Seleção do Menu</h2>
                    <p className="text-gray-600 font-serif italic">Personalize sua experiência.</p>
                </div>

                {/* Sticky Header */}
                <div className="sticky top-[110px] bg-cream z-10 py-4 px-2 border-b border-secondary/20 shadow-sm mx-[-1rem] md:mx-0">
                    <div className="flex justify-around text-center text-xs md:text-sm font-bold uppercase tracking-widest font-sans">
                        <div className={`flex flex-col ${counts.entradas >= 4 ? 'text-primary' : 'text-gray-400'}`}>
                            <span>Entradas</span>
                            <span className="text-lg font-serif">{counts.entradas}/4</span>
                        </div>
                        <div className={`flex flex-col ${counts.principais >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                            <span>Principal</span>
                            <span className="text-lg font-serif">{counts.principais}/2</span>
                        </div>
                        <div className={`flex flex-col ${counts.sobremesas >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                            <span>Doce</span>
                            <span className="text-lg font-serif">{counts.sobremesas}/1</span>
                        </div>
                    </div>
                </div>

                {/* FAVORITOS SECTION */}
                {favorites.length > 0 && (
                     <div className="mb-10">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Star className="text-secondary fill-secondary" size={24} />
                            <h3 className="text-2xl font-serif text-primary font-bold tracking-wider">OS FAVORITOS</h3>
                            <Star className="text-secondary fill-secondary" size={24} />
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
                                            <div className="uppercase tracking-widest text-[10px] mb-2 opacity-70">{item.category}</div>
                                            <h4 className="font-serif font-bold text-xl mb-3">{item.name}</h4>
                                            <p className={`text-sm leading-relaxed ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                         {isSelected && (
                                            <div className="absolute top-2 right-2">
                                                <Check size={18} />
                                            </div>
                                        )}
                                    </div>
                                )
                             })}
                        </div>
                     </div>
                )}

                {/* Categories */}
                {['Entrada', 'Principal', 'Sobremesa'].map((category) => (
                    <div key={category} className="mb-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-secondary/30"></div>
                            <h3 className="text-2xl font-serif text-primary font-bold uppercase tracking-widest">
                                {category}s
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
                                        className={`p-5 transition-all duration-300 cursor-pointer relative
                                            ${isSelected 
                                                ? 'bg-primary text-white shadow-lg' 
                                                : 'bg-white text-gray-800 hover:bg-white/80 shadow-sm border border-transparent hover:border-secondary/20'}`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <h4 className={`font-serif font-bold text-lg mb-2 leading-tight`}>
                                                    {item.name}
                                                </h4>
                                                <p className={`text-sm leading-relaxed font-sans ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                            <div className={`w-6 h-6 border flex items-center justify-center shrink-0 transition-colors mt-1
                                                ${isSelected ? 'border-white bg-white text-primary' : 'border-secondary/40 text-transparent'}`}>
                                                <Check size={14} strokeWidth={4} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderStep3 = () => (
        <div className="space-y-8 animate-fadeIn pb-32">
            <div className="text-center px-4">
                <h2 className="text-3xl font-serif text-primary font-bold mb-3">Sua Experiência</h2>
                <p className="text-gray-600 font-serif italic">Confira os detalhes para 2026.</p>
            </div>

            <div className="bg-white mx-2 shadow-2xl overflow-hidden relative border border-secondary/10">
                <div className="h-2 bg-primary w-full"></div>
                <div className="p-8 space-y-10">
                    {/* Header Resume */}
                    <div className="border-b border-secondary/20 pb-8 text-center">
                        <div className="inline-block border-2 border-secondary p-4 mb-4">
                            <span className="block text-3xl font-serif font-bold text-primary">TL</span>
                        </div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-6">Resumo do Evento</h3>
                        
                        <div className="grid grid-cols-1 gap-4 font-serif text-dark">
                            <div className="text-xl">{clientName}</div>
                            <div className="text-lg text-gray-500">{new Date(date).toLocaleDateString()} às {time}</div>
                            <div className="text-lg text-gray-500">{location}</div>
                            <div className="text-lg text-gray-500">{guests} Convidados</div>
                        </div>
                    </div>

                    {/* Menu Resume */}
                    <div>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-8 text-center">Menu Selecionado</h3>
                        <div className="space-y-8">
                            {['Entrada', 'Principal', 'Sobremesa'].map(cat => {
                                const items = selectedItems.filter(i => i.category === cat);
                                if(items.length === 0) return null;
                                return (
                                    <div key={cat} className="text-center">
                                        <p className="font-serif text-primary font-bold text-xl mb-4 italic">
                                            {cat}s
                                        </p>
                                        <ul className="space-y-2">
                                            {items.map(i => (
                                                <li key={i.id} className="text-gray-700 font-sans">
                                                    {i.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="h-2 bg-secondary w-full"></div>
            </div>
            
            <p className="text-center text-sm text-gray-500 italic px-6 font-serif">
                Ao finalizar, você será redirecionado para o WhatsApp do Chef Thyago Lima.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-cream text-dark font-sans flex flex-col">
            {/* BRAND HEADER */}
            <header className="bg-primary pt-10 pb-20 px-6 shadow-2xl relative overflow-hidden z-20">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-wide leading-tight text-secondary">
                        THYAGO LIMA
                    </h1>
                    <p className="text-secondary/80 text-xs md:text-sm font-light tracking-[0.4em] uppercase mt-2">
                        Gastronomia
                    </p>
                </div>
                {/* Decorative circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-secondary/10 rounded-full z-0"></div>
            </header>

            {/* Main Content Area - Overlapping Header */}
            <main className="flex-1 -mt-10 relative z-30 px-4 md:px-0">
                <div className="max-w-3xl mx-auto">
                    {/* Steps Indicator */}
                    <div className="flex justify-center mb-8">
                         <div className="bg-white shadow-lg px-8 py-3 flex items-center gap-6 border border-secondary/10">
                            <div className={`w-2 h-2 transform rotate-45 transition-all ${step === 1 ? 'bg-secondary scale-125' : 'bg-gray-300'}`}></div>
                            <div className={`w-2 h-2 transform rotate-45 transition-all ${step === 2 ? 'bg-secondary scale-125' : 'bg-gray-300'}`}></div>
                            <div className={`w-2 h-2 transform rotate-45 transition-all ${step === 3 ? 'bg-secondary scale-125' : 'bg-gray-300'}`}></div>
                         </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>
            </main>

            {/* Fixed Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-secondary/20 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-50">
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
                            className="w-16 flex items-center justify-center opacity-10 hover:opacity-100 transition-opacity"
                        >
                            <LockKeyhole size={20} />
                        </button>
                    )}

                    {step < 3 ? (
                        <button 
                            onClick={handleNext}
                            className="flex-[2] py-4 bg-primary text-secondary font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-green-900 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            Continuar <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button 
                            onClick={handleFinalize}
                            className="flex-[2] py-4 bg-secondary text-white font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-yellow-600 transition active:scale-95 flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={16} /> Enviar Pedido
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientOrderForm;