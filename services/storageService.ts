import { MenuItem, Order, OrderStatus } from '../types';

const MENU_KEY = 'chefcontrol_menu_2026_v1';
const ORDERS_KEY = 'chefcontrol_orders_2026_v1';

const SEED_MENU: MenuItem[] = [
  // ENTRADAS - O Início (Frios e Leves)
  { id: 'e1', name: 'Ceviche de Peixe Branco', category: 'Entrada', price: 0, description: 'Marinado no leite de tigre de coco natural, cebola roxa, toque de limão e perfume de laranja Bahia.' },
  { id: 'e2', name: 'Crudo de Atum', category: 'Entrada', price: 0, description: 'Cubos de atum vermelho fresco, mix de tomates selecionados, azeite de limão siciliano e flor de sal.' },
  { id: 'e3', name: 'Tartare de Salmão & Filo', category: 'Entrada', price: 0, description: 'Salmão picado na ponta da faca, azeite e flor de sal. Servido com a crocância da massa filo.' },
  { id: 'e4', name: 'Carpaccio com Sorvete de Mostarda', category: 'Entrada', price: 0, description: 'Lâminas de carne, sorvete artesanal de mostarda, lascas de parmesão, alcaparras e azeite.' },
  { id: 'e5', name: 'Steak Tartare do Chef', category: 'Entrada', price: 0, description: 'Filé mignon, alcaparras, tabasco e mostarda. Acompanha creme azedo e massa filo crocante.' },
  { id: 'e6', name: 'Mini Focaccia & Brie', category: 'Entrada', price: 0, description: 'Focaccia artesanal com creme de queijo brie aveludado e manteiga especial da casa.' },
  
  // ENTRADAS - Do Fogo e Grelha
  { id: 'e7', name: 'Robata de Lagosta', category: 'Entrada', price: 0, description: 'Espetinhos de lagosta grelhados na manteiga de missô (umami) com toque cítrico.' },
  { id: 'e8', name: 'Robata de Filé Glaceada', category: 'Entrada', price: 0, description: 'Cubos de filé mignon grelhados com blend exclusivo de molho de ostra e mostarda.' },
  { id: 'e9', name: 'Polvo & Páprica', category: 'Entrada', price: 0, description: 'Tentáculo de polvo macio, batatas douradas e maionese defumada de páprica.' },
  { id: 'e10', name: 'Milho Tostado Trufado', category: 'Entrada', price: 0, description: 'Milho doce grelhado na manteiga sobre creme de queijo suave e azeite de trufas.' },
  { id: 'e11', name: 'Bacalhau Gratinado', category: 'Entrada', price: 0, description: 'Creme rico e aveludado de bacalhau gratinado ao forno. Servido com pão artesanal.' },
  { id: 'e12', name: 'Bacalhau Confitado (Sous-vide)', category: 'Entrada', price: 0, description: 'Lombos de bacalhau em azeite aromático e azeitona roxa, cozidos em baixa temperatura.' },
  { id: 'e13', name: 'Maminha de Lenta Cocção', category: 'Entrada', price: 0, description: 'Corte nobre em baixa temperatura, extremamente suculento, com delicado molho roti.' },
  { id: 'e14', name: 'Camarão na Fonduta de Sálvia', category: 'Entrada', price: 0, description: 'Camarões grelhados na sálvia em creme de parmesão. Acompanha focaccia.' },
  { id: 'e15', name: 'Filé na Fonduta Trufada', category: 'Entrada', price: 0, description: 'Cubos de mignon ao ponto em creme de parmesão finalizados com azeite trufado.' },

  // ENTRADAS - A Crocância
  { id: 'e16', name: 'Croqueta de Siri Panko', category: 'Entrada', price: 0, description: 'Carne de siri pura e suculenta empanada na panko com maionese de coentro.' },
  { id: 'e17', name: 'Croqueta de Cupim Defumado', category: 'Entrada', price: 0, description: 'Cupim desfiado em croquete delicado com redução de balsâmico.' },
  { id: 'e18', name: 'Bolinho de Bacalhau Clássico', category: 'Entrada', price: 0, description: 'Receita tradicional com ervas frescas e casquinha dourada. Aioli cítrico.' },
  { id: 'e19', name: 'Camarão Crocante Spicy', category: 'Entrada', price: 0, description: 'Empanados na panko com maionese de Gochujang levemente apimentada.' },
  { id: 'e20', name: 'Piccolo Burger de Brie', category: 'Entrada', price: 0, description: 'Mini burger no brioche, queijo brie derretido e blend especial de carnes.' },

  // PRATOS PRINCIPAIS - Saladas e Grelhados
  { id: 'p1', name: 'Salada de Salmão Maçaricado', category: 'Principal', price: 0, description: 'Folhas nobres, salmão maçaricado, tomate confit, crocante de sementes e molho cítrico.' },
  { id: 'p2', name: 'Salada Tropical de Camarão', category: 'Principal', price: 0, description: 'Camarões grelhados, manga, castanhas tostadas e vinagrete de limão siciliano com mel.' },
  { id: 'p3', name: 'Camarão & Arroz de Pistache', category: 'Principal', price: 0, description: 'Grelhados na manteiga de ervas com arroz cremoso de pistache e amêndoas.' },
  
  // PRATOS PRINCIPAIS - Risotos
  { id: 'p4', name: 'Risoto de Polvo & Limão Siciliano', category: 'Principal', price: 0, description: 'Toque cítrico com polvo na manteiga de páprica e azeite de manjericão.' },
  { id: 'p5', name: 'Risoto de Parmesão & Camarão Panko', category: 'Principal', price: 0, description: 'Cremosidade do Grana Padano com camarões crocantes e farofa de bacon.' },
  { id: 'p6', name: 'Risoto de Filé Mignon ao Roti', category: 'Principal', price: 0, description: 'Arbóreo com parmesão, iscas de filé, palha de alho-poró e redução de balsâmico.' },

  // PRATOS PRINCIPAIS - Massas
  { id: 'p7', name: 'Cauda de Lagosta & Fettuccine', category: 'Principal', price: 0, description: 'Lagosta grelhada na casca sobre fettuccine ao molho rústico de tomates assados.' },
  { id: 'p8', name: 'Sorrentino de Búfala & Camarão', category: 'Principal', price: 0, description: 'Massa recheada com búfala, molho rústico, manjericão e camarões grelhados.' },
  { id: 'p9', name: 'Ravioli de Pera, Ricota & Camarão', category: 'Principal', price: 0, description: 'Massa de pera e ricota com camarões e manteiga noisette de amêndoas.' },
  { id: 'p10', name: 'Ravioli de Pato com Laranja', category: 'Principal', price: 0, description: 'Massa fresca de pato confitado com molho aveludado de laranja e vinho.' },
  { id: 'p11', name: 'Tortellini Cacio e Pepe com Camarão', category: 'Principal', price: 0, description: 'Molho romano de queijo e pimenta com camarões e raspas de limão.' },

  // PRATOS PRINCIPAIS - Carnes
  { id: 'p12', name: 'Stinco de Cordeiro & Gnocchi', category: 'Principal', price: 0, description: 'Cozido lentamente com o próprio molho reduzido e gnocchi dourado na manteiga.' },
  { id: 'p13', name: 'Carré de Cordeiro & Baroa', category: 'Principal', price: 0, description: 'Ponto rosado com gnocchi artesanal de batata baroa e ervas frescas.' },
  { id: 'p14', name: 'Filé ao Funghi & Gnocchi', category: 'Principal', price: 0, description: 'Medalhão grelhado ao molho de cogumelos e vinho tinto com gnocchi artesanal.' },
  { id: 'p15', name: 'Saltimbocca com Fettuccine', category: 'Principal', price: 0, description: 'Escalopes com sálvia e presunto cru sobre fettuccine artesanal na manteiga.' },

  // SOBREMESAS
  { id: 's1', name: 'Torta de Chocolate & Caramelo Salgado', category: 'Sobremesa', price: 0, description: 'Base de biscoito crocante, ganache meio amargo, caramelo toffee e flor de sal.' },
  { id: 's2', name: 'Banoffee Especial da Casa', category: 'Sobremesa', price: 0, description: 'Base crocante, doce de leite argentino, bananas frescas e chantilly de verdade.' },
  { id: 's3', name: 'Pudim Perfeito (Leite ou Pistache)', category: 'Sobremesa', price: 0, description: 'Textura super lisa e cremosa, sem furinhos. Versão tradicional ou pistache.' },
];

const SEED_ORDERS: Order[] = [
  {
    id: '2026-001',
    clientName: 'Exemplo de Atendimento',
    clientPhone: '84999999999',
    date: '2026-03-15',
    time: '20:30',
    location: 'Tirol, Natal',
    guests: 12,
    items: [SEED_MENU[0], SEED_MENU[1], SEED_MENU[15], SEED_MENU[19], SEED_MENU[22], SEED_MENU[32], SEED_MENU[35]],
    pricePerHead: 0,
    totalValue: 0,
    status: OrderStatus.CONFIRMED
  }
];

export const getMenu = (): MenuItem[] => {
  const data = localStorage.getItem(MENU_KEY);
  if (!data) {
    localStorage.setItem(MENU_KEY, JSON.stringify(SEED_MENU));
    return SEED_MENU;
  }
  return JSON.parse(data);
};

export const saveMenu = (menu: MenuItem[]) => {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu));
};

export const getOrders = (): Order[] => {
  const data = localStorage.getItem(ORDERS_KEY);
  if (!data) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS));
    return SEED_ORDERS;
  }
  return JSON.parse(data);
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

export const addOrder = (order: Order) => {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
};

export const getTopFavorites = (limit: number = 3): MenuItem[] => {
    const orders = getOrders();
    const itemCounts: Record<string, number> = {};
    const itemMap: Record<string, MenuItem> = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.id] = (itemCounts[item.id] || 0) + 1;
            itemMap[item.id] = item;
        });
    });

    const sortedIds = Object.entries(itemCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, limit)
        .map(([id]) => id);

    const favorites = sortedIds.map(id => itemMap[id]).filter(Boolean);
    
    if (favorites.length === 0) {
        return getMenu().slice(0, limit);
    }
    
    return favorites;
};