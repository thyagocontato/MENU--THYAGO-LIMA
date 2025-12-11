import React, { useState, useEffect } from 'react';
import { MenuItem } from '../types';
import { getMenu, saveMenu } from '../services/storageService';
import { generateMenuDescription } from '../services/geminiService';
import { Plus, Trash2, Sparkles, Loader2, DollarSign } from 'lucide-react';

const MenuBuilder: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    setMenuItems(getMenu());
  }, []);

  const handleGenerateDescription = async () => {
    if (!newName || !newIngredients) {
      alert("Preencha o nome do prato e ingredientes para gerar a descrição.");
      return;
    }
    setIsGenerating(true);
    const desc = await generateMenuDescription(newName, newIngredients);
    setNewDescription(desc);
    setIsGenerating(false);
  };

  const handleAddItem = () => {
    if (!newName || !newCategory) {
        alert("Nome e categoria são obrigatórios.");
        return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: newName,
      category: newCategory,
      price: newPrice ? parseFloat(newPrice) : 0,
      description: newDescription || newIngredients,
    };

    const updatedMenu = [...menuItems, newItem];
    setMenuItems(updatedMenu);
    saveMenu(updatedMenu);
    
    // Reset form
    setNewName('');
    setNewCategory('');
    setNewPrice('');
    setNewIngredients('');
    setNewDescription('');
  };

  const handleDeleteItem = (id: string) => {
    const updated = menuItems.filter(i => i.id !== id);
    setMenuItems(updated);
    saveMenu(updated);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Gerenciar Cardápio</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 lg:col-span-1 h-fit">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Novo Item</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Prato</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Ex: Risoto de Funghi"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Selecione...</option>
                <option value="Entrada">Entrada</option>
                <option value="Principal">Prato Principal</option>
                <option value="Sobremesa">Sobremesa</option>
                <option value="Bebida">Bebida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço Individual (Opcional)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">R$</span>
                <input 
                    type="number" 
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none"
                    placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes Principais (para IA)</label>
              <input 
                type="text" 
                value={newIngredients}
                onChange={(e) => setNewIngredients(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none"
                placeholder="Ex: Arroz arbóreo, cogumelos frescos..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                <button 
                  onClick={handleGenerateDescription}
                  disabled={isGenerating}
                  className="text-xs flex items-center gap-1 text-primary hover:text-yellow-600 font-semibold"
                >
                  {isGenerating ? <Loader2 className="animate-spin w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                  Gerar com IA
                </button>
              </div>
              <textarea 
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none h-24 text-sm"
                placeholder="A descrição aparecerá aqui..."
              />
            </div>

            <button 
              onClick={handleAddItem}
              className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" /> Adicionar ao Menu
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prato</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {menuItems.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500">
                                Nenhum item no cardápio. Adicione um item ao lado.
                            </td>
                        </tr>
                    ) : (
                        menuItems.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{item.name}</div>
                                </td>
                                <td className="p-4">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-gray-600 max-w-xs">{item.description}</td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuBuilder;