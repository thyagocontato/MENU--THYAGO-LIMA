import { GoogleGenAI } from "@google/genai";
import { BusinessStats, MenuItem } from "../types";

// Ensure we handle the case where process.env might be checked before substitution (though Vite defines it)
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateMenuDescription = async (itemName: string, ingredients: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escreva uma descrição apetitosa, curta e sofisticada para um menu de restaurante.
      Prato: ${itemName}
      Ingredientes principais: ${ingredients}
      Mantenha a descrição com menos de 30 palavras.`,
    });
    // Check if text exists before accessing
    return response.text ? response.text.trim() : "Descrição indisponível.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Descrição indisponível no momento.";
  }
};

export const analyzeBusinessData = async (stats: BusinessStats): Promise<string> => {
  try {
    const prompt = `
    Atue como um consultor de negócios gastronômicos experiente para o Chef Thyago Lima.
    Analise os seguintes dados do meu negócio de catering/buffet em Natal-RN e me dê 3 insights estratégicos curtos.

    Dados:
    - Receita Total: R$ ${stats.totalRevenue.toFixed(2)}
    - Total Pedidos: ${stats.totalOrders}
    - Pratos Mais Vendidos: ${stats.topItems.map(i => i.name).join(', ')}
    - Bairros/Locais Fortes: ${stats.topLocations.map(l => l.name).join(', ')}
    - Melhores Clientes: ${stats.topClients.map(c => c.name).join(', ')}

    Formate a resposta em HTML simples (sem tags html/body, apenas p, strong, ul, li).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Check if text exists before returning
    return response.text || "<p>Não foi possível gerar análise no momento.</p>";
  } catch (error) {
    console.error("Error analyzing business:", error);
    return "<p>Não foi possível gerar análise no momento. Verifique sua conexão ou chave API.</p>";
  }
};

export const generateWhatsappMessage = async (orderItems: MenuItem[]): Promise<string> => {
    try {
        const formatItem = (i: MenuItem) => i.isPremium ? `• ${i.name} ⭐ (Seleção Premium)` : `• ${i.name}`;

        const entradas = orderItems.filter(i => i.category === 'Entrada').map(formatItem).join('\n');
        const principais = orderItems.filter(i => i.category === 'Principal').map(formatItem).join('\n');
        const sobremesas = orderItems.filter(i => i.category === 'Sobremesa').map(formatItem).join('\n');

        const baseText = `*Entradas:*
${entradas || '(Nenhuma selecionada)'}

*Pratos Principais:*
${principais || '(Nenhum selecionado)'}

*Sobremesa:*
${sobremesas || '(Nenhuma selecionada)'}`;
        return baseText.trim();

    } catch (error) {
        return "Erro ao gerar lista.";
    }
}