import { MenuItem, Order, OrderStatus } from '../types';

const MENU_KEY = 'chefcontrol_menu_v2';
const ORDERS_KEY = 'chefcontrol_orders_v2';

// Seed data based on Chef Thyago Lima 2025 Menu
const SEED_MENU: MenuItem[] = [
  // Entradas
  { id: 'e1', name: 'Camarão Crocante', category: 'Entrada', price: 0, description: 'Camarão empanado na panko - mayo de gochujang. (Levemente apimentado)' },
  { id: 'e2', name: 'Camarão in Fonduta', category: 'Entrada', price: 0, description: 'Camarão grelhado na manteiga de sálvia e salsa - mergulhado em uma fonduta cremosa de queijo parmesão.' },
  { id: 'e3', name: 'Crocchetta di Baccalhau', category: 'Entrada', price: 0, description: 'Clássico bolinho de bacalhau, temperado com ervas frescas e empanado. Servido com aioli cítrico.' },
  { id: 'e4', name: 'Crocchetta di Siri', category: 'Entrada', price: 0, description: 'Croquete de siri com massa leve de batata, crocância perfeita do panko e um toque refrescante de mayo de coentro.' },
  { id: 'e5', name: 'Ceviche', category: 'Entrada', price: 0, description: 'Peixe fresco - leite de tigre de coco fresco - cebola roxa - limão e laranja Bahia.' },
  { id: 'e6', name: 'Polpo alla Vinagretta', category: 'Entrada', price: 0, description: 'Polvo macio cortado delicadamente, servido com um vinagrete de mix de tomates frescos, azeite cítrico de limão siciliano.' },
  { id: 'e7', name: 'Cruda di Atum', category: 'Entrada', price: 0, description: 'Pedaços de atum fresco cortado, harmonizado com um mix de tomates selecionados, azeite cítrico e flor de sal.' },
  { id: 'e8', name: 'Ostra Fresca', category: 'Entrada', price: 0, description: 'Pesto de rúcula ou vinagrete de melancia - limão.' },
  { id: 'e9', name: 'Ostriche Gratinate', category: 'Entrada', price: 0, description: 'Ostras frescas temperadas com manteiga e alho, gratinadas com um creme aveludado de queijo parmesão.' },
  { id: 'e10', name: 'Bacalhau no Aioli', category: 'Entrada', price: 0, description: 'Lascas do lombo do bacalhau cozido no sous-vide - aioli - azeitona roxa.' },
  { id: 'e11', name: 'Milho doce Grigliata', category: 'Entrada', price: 0, description: 'Milho doce grelhado na manteiga, servido com creme de queijo e toque de azeite trufado.' },
  { id: 'e12', name: 'Creme de Brie Trufado', category: 'Entrada', price: 0, description: 'Creme de queijo Brie com toque de geleia de frutas amarelas trufada, acompanhado de torradas artesanais.' },
  { id: 'e13', name: 'Carpaccio di Manzo', category: 'Entrada', price: 0, description: 'Lâminas finas de filé mignon, rúcula fresca, lascas de parmesão, alcaparras e azeite de oliva.' },
  { id: 'e14', name: 'Crocchetta di Cupim', category: 'Entrada', price: 0, description: 'Delicado croquete de cupim com massa cremosa de batata, empanado em panko dourado, mayo de gorgonzola dolce.' },
  { id: 'e15', name: 'Filetto in Fonduta Tartufata', category: 'Entrada', price: 0, description: 'Suave filé mignon ao ponto perfeito, mergulhado em uma fonduta cremosa de queijo parmesão e azeite trufado.' },
  { id: 'e16', name: 'Piccolo Burger', category: 'Entrada', price: 0, description: 'Mini burger artesanal no pão brioche, queijo brie derretido, presunto de parma crocante.' },
  { id: 'e17', name: 'Maminha Argentina al Sous Vide', category: 'Entrada', price: 0, description: 'Cozido lentamente em sous vide, molho de mostarda e pó trufado.' },
  { id: 'e18', name: 'Carne Cruda con Crema di Capra', category: 'Entrada', price: 0, description: 'Filé mignon picado na ponta da faca, alcaparras, mostarda, azeite. Creme de queijo de cabra e massa crocante.' },

  // Pratos Principais
  { id: 'p1', name: 'Aragosta con Fettuccine', category: 'Principal', price: 0, description: 'Lagosta grelhada, pasta fresca artesanal e molho de tomate-cereja e pimentões assados.' },
  { id: 'p2', name: 'Cappelletti al Tonno Tartufato', category: 'Principal', price: 0, description: 'Massa recheada com mozzarella fresca, coberta por tartare de atum fresco e toque de azeite trufado.' },
  { id: 'p3', name: 'Carretto d’Agnello con Gnocchi', category: 'Principal', price: 0, description: 'Carré de cordeiro grelhado, servido com gnocchi dourado de baroa e toque de ervas frescas.' },
  { id: 'p4', name: 'Carré d’Agnello con Purè', category: 'Principal', price: 0, description: 'Carré de cordeiro grelhado, acompanhado de purê de batatas cremoso com Parmigiano Reggiano.' },
  { id: 'p5', name: 'Fettuccine al Baccalà', category: 'Principal', price: 0, description: 'Lascas de bacalhau refogadas no azeite de alho, servidas com fettuccine artesanal e azeitonas azapa.' },
  { id: 'p6', name: 'Filetto ai Funghi', category: 'Principal', price: 0, description: 'Filé mignon grelhado ao molho de cogumelos, servido com gnocchis dourados de baroa e molho de carne ao vinho.' },
  { id: 'p7', name: 'Filetto di Manzo con Pappardelle', category: 'Principal', price: 0, description: 'Filé mignon grelhado, acompanhado de pappardelle artesanal puxado na manteiga, vinho e caldo de carne.' },
  { id: 'p8', name: 'Gnocchi ai Gamberi', category: 'Principal', price: 0, description: 'Gnocchi macio de batatas assadas e pó de trufa, molho cremoso de Grana Padano, cogumelos frescos e azeite trufado.' },
  { id: 'p9', name: 'A Lasagna', category: 'Principal', price: 0, description: 'Pedaço de lasagna grelhado na manteiga, molho de queijo e vinho, massa fresca e muzzarela.' },
  { id: 'p10', name: 'Pesce del Giorno', category: 'Principal', price: 0, description: 'Filet de peixe grelhado com alcaparras, sobre abobrinha, tomatinhos-cereja, cebola e alho confitados.' },
  { id: 'p11', name: 'Ravioli d’Anatra all’Arancia', category: 'Principal', price: 0, description: 'Massa artesanal recheada com pato confitado, coberta por molho de laranja e vinho.' },
  { id: 'p12', name: 'Ravioli di Ricotta e Pere', category: 'Principal', price: 0, description: 'Massa fresca recheada com ricota italiana, molho adocicado de peras assadas e emulsão de manteiga de ervas.' },
  { id: 'p13', name: 'Risotto ai Frutti di Mare', category: 'Principal', price: 0, description: 'Risoto cremoso em caldo de frutos do mar, servido com camarão, polvo e lula.' },
  { id: 'p14', name: 'Saltimbocca alla Romana', category: 'Principal', price: 0, description: 'Escalope de Filé ao molho de vinho, sálvia e Parma. Acompanhado de fettuccine artesanal.' },
  { id: 'p15', name: 'Saltimbocca con Gnocchi', category: 'Principal', price: 0, description: 'Escalope grelhado ao molho de vinho, sálvia e Parma, acompanhado de gnocchi de batata.' },
  { id: 'p16', name: 'Spaghetti al Beurre Blanc', category: 'Principal', price: 0, description: 'Massa fresca com camarões grelhados, envolta no tradicional molho francês beurre blanc.' },
  { id: 'p17', name: 'Spaghetti al Salmone', category: 'Principal', price: 0, description: 'Spaghetti envolto em fonduta de queijos, coberto por pedaços de salmão fresco.' },
  { id: 'p18', name: 'Spaghetti ai Frutti di Mare', category: 'Principal', price: 0, description: 'Espaguete artesanal servido com molho rústico de tomate, camarão, polvo e lula.' },
  { id: 'p19', name: 'Tortellini Cacio e Pepe', category: 'Principal', price: 0, description: 'Massa artesanal com molho romano cacio e pepe, camarões no vapor e limão siciliano.' },
  { id: 'p20', name: 'Tortelloni al Pesce', category: 'Principal', price: 0, description: 'Filet de peixe grelhado, crosta dourada, servido com massa artesanal recheada de ricota.' },

  // Sobremesas
  { id: 's1', name: 'Torta de Chocolate Caramelo', category: 'Sobremesa', price: 0, description: 'Massa de biscoito crocante, caramelo salgado, chocolate e toque de flor de sal.' },
  { id: 's2', name: 'Banoffee', category: 'Sobremesa', price: 0, description: 'Massa de biscoito, doce de leite, banana e creme chantili.' },
  { id: 's3', name: 'Pudim', category: 'Sobremesa', price: 0, description: 'Opções: Tradicional ou Pistache.' },
];

const SEED_ORDERS: Order[] = [
  {
    id: '101',
    clientName: 'Mariana Costa',
    clientPhone: '84999999999',
    date: '2025-01-20',
    time: '20:00',
    location: 'Tirol, Natal',
    guests: 10,
    items: [SEED_MENU[0], SEED_MENU[4], SEED_MENU[5], SEED_MENU[12], SEED_MENU[20], SEED_MENU[22], SEED_MENU[28]], // Sample items
    pricePerHead: 180,
    totalValue: 1800.00,
    status: OrderStatus.CONFIRMED
  },
  {
    id: '102',
    clientName: 'Dr. Ricardo',
    clientPhone: '84988888888',
    date: '2025-02-15',
    time: '21:00',
    location: 'Ponta Negra',
    guests: 6,
    items: [SEED_MENU[1], SEED_MENU[2], SEED_MENU[3], SEED_MENU[4], SEED_MENU[18], SEED_MENU[19], SEED_MENU[29]],
    pricePerHead: 190,
    totalValue: 1140.00,
    status: OrderStatus.PENDING
  },
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
    
    // Fallback if no history yet
    if (favorites.length === 0) {
        return getMenu().slice(0, limit);
    }
    
    return favorites;
};