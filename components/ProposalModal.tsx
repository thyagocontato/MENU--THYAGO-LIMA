import React, { useState } from 'react';
import { Order } from '../types';
import { formatDisplayDate } from '../utils';
import { Printer, Send, Save, X, ChefHat, Instagram, Calendar, MapPin, Users, Clock, CheckCircle2, ShieldCheck, DollarSign, FileText } from 'lucide-react';
import { saveOrders, getOrders } from '../services/storageService';

interface ProposalModalProps {
    order: Order;
    onClose: () => void;
    onUpdateOrder?: (updatedOrder: Order) => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ order, onClose, onUpdateOrder }) => {
    const [pricePerHead, setPricePerHead] = useState<number>(order.pricePerHead || 150);
    const [paymentTerms, setPaymentTerms] = useState<string>('50% na reserva da data e 50% até 2 dias antes do evento.');
    const [validityDays, setValidityDays] = useState<number>(7);
    const [customNote, setCustomNote] = useState<string>(order.notes || '');
    const [isSaved, setIsSaved] = useState<boolean>(false);

    const waiterFee = order.waiterService ? 140 : 0;
    const menuTotal = (pricePerHead || 0) * (order.guests || 1);
    const grandTotal = menuTotal + waiterFee;

    const proposalNumber = `TL-${new Date().getFullYear()}-${order.id.slice(-4)}`;
    const todayFormatted = formatDisplayDate(new Date().toISOString().split('T')[0]);

    const handleSaveValues = () => {
        const allOrders = getOrders();
        const updatedOrders = allOrders.map(o => {
            if (o.id === order.id) {
                return {
                    ...o,
                    pricePerHead: pricePerHead,
                    totalValue: grandTotal,
                    notes: customNote
                };
            }
            return o;
        });
        saveOrders(updatedOrders);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2500);

        if (onUpdateOrder) {
            onUpdateOrder({
                ...order,
                pricePerHead: pricePerHead,
                totalValue: grandTotal,
                notes: customNote
            });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendWhatsappProposal = () => {
        let cleanNumber = order.clientPhone.replace(/\D/g, '');
        if (cleanNumber.length >= 10 && !cleanNumber.startsWith('55')) {
            cleanNumber = `55${cleanNumber}`;
        }

        const itemsSummary = order.items
            .map(i => `  • ${i.name} (${i.category})`)
            .join('\n');

        const message = `*PROPOSTA COMERCIAL - CHEF THYAGO LIMA* 🍽️
Proposta Nº: ${proposalNumber}
Cliente: ${order.clientName}

*DETALHES DO EVENTO:*
📅 *Data:* ${formatDisplayDate(order.date)} às ${order.time || 'A definir'}
📍 *Local:* ${order.location}
👥 *Convidados:* ${order.guests} pessoas

*MENU SELECIONADO:*
${itemsSummary}

${order.waiterService ? '🍷 *Serviço de Garçom:* Sim (R$ 140,00 - 1 profissional)\n' : ''}
*INVESTIMENTO:*
${pricePerHead > 0 ? `• Gastronomia: R$ ${pricePerHead.toFixed(2)} / pessoa (R$ ${menuTotal.toFixed(2)})\n` : ''}${waiterFee > 0 ? `• Taxa de Garçom: R$ ${waiterFee.toFixed(2)}\n` : ''}*TOTAL ESTIMADO:* R$ ${grandTotal.toFixed(2)}

💳 *Condições:* ${paymentTerms}
⏳ *Validade da Proposta:* ${validityDays} dias.

Fico à disposição para confirmar a sua reserva!
Chef Thyago Lima • @thyagolimachef`;

        const encodedMsg = encodeURIComponent(message);
        if (cleanNumber) {
            window.open(`https://wa.me/${cleanNumber}?text=${encodedMsg}`, '_blank');
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-start overflow-y-auto p-2 sm:p-4 lg:p-6">
            
            {/* Top Toolbar (Hidden on Print) */}
            <div className="print:hidden w-full max-w-4xl bg-primary text-white p-4 rounded-t-xl border-b border-secondary/30 flex flex-wrap items-center justify-between gap-4 shadow-2xl shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-secondary p-2 rounded-lg text-primary font-bold">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-lg text-secondary leading-tight">Proposta Comercial PDF</h3>
                        <p className="text-xs text-white/70">Ajuste os valores e gere o documento para {order.clientName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleSaveValues}
                        className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all
                            ${isSaved ? 'bg-green-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
                    >
                        <Save size={14} />
                        {isSaved ? 'Salvo!' : 'Salvar Valores'}
                    </button>

                    <button
                        onClick={handleSendWhatsappProposal}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                    >
                        <Send size={14} />
                        Enviar no Zap
                    </button>

                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-secondary hover:bg-yellow-500 text-primary rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Printer size={16} />
                        Imprimir / Baixar PDF
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors"
                        title="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Config Controls Drawer (Hidden on Print) */}
            <div className="print:hidden w-full max-w-4xl bg-white p-4 border-x border-secondary/20 shadow-md grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                    <label className="block text-gray-600 font-bold mb-1 flex items-center gap-1">
                        <DollarSign size={14} className="text-secondary" /> Valor por Pessoa (R$)
                    </label>
                    <input
                        type="number"
                        value={pricePerHead}
                        onChange={(e) => setPricePerHead(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 border border-gray-300 rounded text-sm font-bold text-primary focus:border-primary outline-none"
                        placeholder="150,00"
                    />
                </div>

                <div>
                    <label className="block text-gray-600 font-bold mb-1">Validade da Proposta (Dias)</label>
                    <input
                        type="number"
                        value={validityDays}
                        onChange={(e) => setValidityDays(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 rounded text-sm text-gray-800 focus:border-primary outline-none"
                    />
                </div>

                <div>
                    <label className="block text-gray-600 font-bold mb-1">Condições de Pagamento</label>
                    <input
                        type="text"
                        value={paymentTerms}
                        onChange={(e) => setPaymentTerms(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded text-sm text-gray-800 focus:border-primary outline-none"
                        placeholder="50% na reserva, 50% no evento"
                    />
                </div>
            </div>

            {/* PRINTABLE PROPOSAL CANVAS */}
            <div className="w-full max-w-4xl bg-white shadow-2xl p-6 sm:p-12 my-0 print:my-0 print:p-8 print:shadow-none print:w-full print:max-w-none font-sans text-gray-800 relative border-t-8 border-secondary rounded-b-xl print:rounded-none">
                
                {/* Proposal Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-secondary/20 pb-6 mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ChefHat className="w-8 h-8 text-secondary" />
                            <h1 className="text-3xl font-serif font-bold text-primary tracking-wide">THYAGO LIMA</h1>
                        </div>
                        <p className="text-xs font-light tracking-[0.3em] uppercase text-secondary font-sans">
                            GASTRONOMIA EXCLUSIVA • EVENTOS PRIVADOS
                        </p>
                    </div>

                    <div className="text-left sm:text-right bg-cream/50 p-3 sm:p-4 border border-secondary/20 rounded">
                        <span className="text-xs font-bold text-secondary uppercase tracking-widest block mb-1">PROPOSTA COMERCIAL</span>
                        <div className="font-serif font-bold text-lg text-primary">{proposalNumber}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Emissão: {todayFormatted}</div>
                        <div className="text-xs text-gray-500">Validade: {validityDays} dias</div>
                    </div>
                </div>

                {/* Client & Event Info Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF8F5] p-6 border border-secondary/20 rounded-lg mb-8">
                    <div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] block mb-2">DADOS DO CLIENTE</span>
                        <h2 className="text-xl font-serif font-bold text-primary mb-1">{order.clientName}</h2>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-1">
                            WhatsApp: <span className="font-semibold text-gray-800">{order.clientPhone || 'Não informado'}</span>
                        </p>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] block mb-2">DETALHES DO EVENTO</span>
                        <div className="space-y-1.5 text-xs text-gray-700">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-secondary shrink-0" />
                                <span><strong className="text-primary">Data:</strong> {formatDisplayDate(order.date)}</span>
                            </div>
                            {order.time && (
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-secondary shrink-0" />
                                    <span><strong className="text-primary">Horário:</strong> {order.time}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <MapPin size={14} className="text-secondary shrink-0" />
                                <span><strong className="text-primary">Local:</strong> {order.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-secondary shrink-0" />
                                <span><strong className="text-primary">Convidados:</strong> {order.guests} pessoas</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Menu Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-secondary/30 flex-1"></div>
                        <h3 className="text-lg font-serif font-bold text-primary uppercase tracking-widest text-center">
                            MENU EXCLUSIVO SELECIONADO
                        </h3>
                        <div className="h-px bg-secondary/30 flex-1"></div>
                    </div>

                    <div className="space-y-6">
                        {['Entrada', 'Principal', 'Sobremesa'].map((category) => {
                            const categoryItems = order.items.filter(i => i.category === category);
                            if (categoryItems.length === 0) return null;

                            return (
                                <div key={category} className="border-b border-gray-100 pb-4 last:border-0">
                                    <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                        {category === 'Entrada' ? 'Entradas' : category === 'Principal' ? 'Pratos Principais' : 'Sobremesas'}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {categoryItems.map(item => (
                                            <div key={item.id} className="bg-cream/20 p-3 border-l-2 border-secondary rounded-r">
                                                <div className="font-serif font-bold text-sm text-primary">{item.name}</div>
                                                {item.description && (
                                                    <p className="text-xs text-gray-600 mt-1 italic">{item.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Included Services Section */}
                <div className="bg-[#FAF8F5] p-6 border border-secondary/20 rounded-lg mb-8">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-secondary" />
                        SERVIÇOS & UTENSÍLIOS INCLUSOS
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-700 shrink-0 mt-0.5" />
                            <span>Elaboração gastronomica presencial pelo Chef Thyago Lima e equipe</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-700 shrink-0 mt-0.5" />
                            <span>Insumos frescos de altíssima qualidade selecionados pelo Chef</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-700 shrink-0 mt-0.5" />
                            <span>Cutelaria e louças necessárias para os pratos de entrada</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="text-green-700 shrink-0 mt-0.5" />
                            <span>
                                {order.waiterService 
                                    ? 'Serviço de Garçom incluso (1 profissional)' 
                                    : 'Não inclui serviço de garçom adicional'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Investment Table */}
                <div className="mb-8">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-3">INVESTIMENTO</h3>

                    <div className="border border-secondary/30 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-primary text-secondary font-serif uppercase tracking-wider">
                                <tr>
                                    <th className="p-3 font-bold">Descrição</th>
                                    <th className="p-3 text-center font-bold">Qtd / Base</th>
                                    <th className="p-3 text-right font-bold">Valor Unit.</th>
                                    <th className="p-3 text-right font-bold">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <tr>
                                    <td className="p-3 font-semibold text-primary">
                                        Gastronomia Exclusiva - Menu Selecionado
                                        <p className="text-[10px] text-gray-500 font-normal">Entradas, Pratos Principais e Sobremesa</p>
                                    </td>
                                    <td className="p-3 text-center">{order.guests} pessoas</td>
                                    <td className="p-3 text-right">R$ {pricePerHead.toFixed(2)}</td>
                                    <td className="p-3 text-right font-bold text-gray-800">R$ {menuTotal.toFixed(2)}</td>
                                </tr>

                                {order.waiterService && (
                                    <tr className="bg-cream/20">
                                        <td className="p-3 font-semibold text-primary">
                                            Taxa de Serviço de Garçom
                                            <p className="text-[10px] text-gray-500 font-normal">Atendimento dedicado para suporte ao evento</p>
                                        </td>
                                        <td className="p-3 text-center">1 profissional</td>
                                        <td className="p-3 text-right">R$ 140,00</td>
                                        <td className="p-3 text-right font-bold text-gray-800">R$ 140,00</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-primary text-white border-t-2 border-secondary font-serif">
                                <tr>
                                    <td colSpan={3} className="p-4 text-right font-bold text-sm text-secondary uppercase tracking-wider">
                                        VALOR TOTAL DO EVENTO:
                                    </td>
                                    <td className="p-4 text-right font-bold text-lg text-secondary">
                                        R$ {grandTotal.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Payment Terms & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-gray-700 border-t border-gray-200 pt-6 mb-8">
                    <div>
                        <span className="font-bold text-primary block mb-1 uppercase tracking-wider text-[11px]">Condições de Pagamento:</span>
                        <p className="bg-cream/30 p-3 border border-secondary/10 rounded italic">{paymentTerms}</p>
                    </div>

                    <div>
                        <span className="font-bold text-primary block mb-1 uppercase tracking-wider text-[11px]">Observações Importantes:</span>
                        <ul className="list-disc list-inside space-y-1 text-gray-600 italic">
                            <li>Bebidas não fornecidas nesta proposta.</li>
                            <li>A reserva da data é confirmada mediante assinatura e sinal.</li>
                            {customNote && <li>{customNote}</li>}
                        </ul>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="border-t-2 border-secondary/20 pt-6 text-center space-y-3">
                    <p className="font-serif italic text-sm text-primary">
                        "Transformando seu evento em uma experiência gastronômica inesquecível."
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-sans text-secondary">
                        <span className="font-bold text-primary uppercase tracking-widest">Chef Thyago Lima</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1"><Instagram size={14} /> @thyagolimachef</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Natal - RN</span>
                    </div>
                </div>

            </div>

            {/* Print Stylesheet injection to guarantee perfect page formatting when printing */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    body {
                        background: white !important;
                    }
                    .fixed {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                    .print\\:my-0 {
                        margin-top: 0 !important;
                        margin-bottom: 0 !important;
                    }
                    .print\\:p-8 {
                        padding: 2rem !important;
                    }
                    .print\\:shadow-none {
                        box-shadow: none !important;
                    }
                    .print\\:w-full {
                        width: 100% !important;
                        max-width: none !important;
                    }
                    #printable-proposal, .shadow-2xl {
                        visibility: visible !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProposalModal;
