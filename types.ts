export enum OrderStatus {
  PENDING = 'Pendente',
  CONFIRMED = 'Confirmado',
  COMPLETED = 'Concluído',
  CANCELLED = 'Cancelado'
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  items: MenuItem[]; // Simple list of items ordered
  pricePerHead: number; // Added for the fixed price per person model
  totalValue: number;
  status: OrderStatus;
  notes?: string;
}

export interface BusinessStats {
  totalRevenue: number;
  totalOrders: number;
  topItems: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  topClients: { name: string; revenue: number }[];
}