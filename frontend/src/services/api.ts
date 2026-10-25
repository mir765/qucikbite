import axios from 'axios';
import {
  Restaurant,
  MenuItem,
  Order,
  User,
  CustomerAddress,
  LastCallBite,
  BitePointsData,
  SupportTicket,
  Review
} from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('quickbite_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const QuickBiteApi = {
  // Auth & Roles
  async login(username: string, password: string) {
    const res = await api.post('/auth/login/', { username, password });
    if (res.data.token) {
      localStorage.setItem('quickbite_token', res.data.token);
    }
    return res.data;
  },

  async register(data: Record<string, any>) {
    const res = await api.post('/auth/register/', data);
    if (res.data.token) {
      localStorage.setItem('quickbite_token', res.data.token);
    }
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me/');
    return res.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await api.patch('/auth/me/', data);
    return res.data;
  },

  async switchDemoRole(role: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/switch-demo-role/', { role });
    if (res.data.token) {
      localStorage.setItem('quickbite_token', res.data.token);
    }
    return res.data;
  },

  // Addresses
  async getAddresses(): Promise<CustomerAddress[]> {
    const res = await api.get('/addresses/');
    return res.data;
  },

  async addAddress(data: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const res = await api.post('/addresses/', data);
    return res.data;
  },

  async deleteAddress(id: number) {
    const res = await api.delete(`/addresses/${id}/`);
    return res.data;
  },

  // Restaurants
  async getRestaurants(params?: Record<string, any>): Promise<Restaurant[]> {
    const res = await api.get('/restaurants/', { params });
    return res.data;
  },

  async getRestaurantDetail(slugOrId: string | number): Promise<Restaurant> {
    const res = await api.get(`/restaurants/${slugOrId}/`);
    return res.data;
  },

  // SmartBite AI
  async querySmartBite(query: string) {
    const res = await api.post('/smartbite/query/', { query });
    return res.data;
  },

  // Budget Mode
  async getBudgetMeals(budget: number, isVeg = false, people = 1) {
    const res = await api.get('/budget-mode/', {
      params: { budget, is_veg: isVeg, people }
    });
    return res.data;
  },

  // Cart & Orders
  async calculateCart(payload: {
    restaurant_id: number;
    items: Array<{ id: number; quantity: number }>;
    coupon_code?: string;
  }) {
    const res = await api.post('/cart/calculate/', payload);
    return res.data;
  },

  async placeOrder(payload: Record<string, any>): Promise<Order> {
    const res = await api.post('/orders/', payload);
    return res.data;
  },

  async getOrders(role?: string): Promise<Order[]> {
    const res = await api.get('/orders/', { params: { role } });
    return res.data;
  },

  async getOrderTracking(orderNumber: string) {
    const res = await api.get(`/orders/${orderNumber}/`);
    return res.data;
  },

  async updateOrderStatus(orderNumber: string, status: string, reason?: string) {
    const res = await api.patch(`/orders/${orderNumber}/status/`, {
      status,
      delay_reason: reason,
      cancellation_reason: reason
    });
    return res.data;
  },

  async requestRefund(orderNumber: string, reason: string) {
    const res = await api.post(`/orders/${orderNumber}/refund/`, { reason });
    return res.data;
  },

  // Payments
  async verifyPayment(payload: {
    order_number: string;
    razorpay_payment_id?: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) {
    const res = await api.post('/payments/verify/', payload);
    return res.data;
  },

  // GroupBite
  async createGroupOrder(restaurantId: number, budget = 250) {
    const res = await api.post('/group-orders/', {
      restaurant_id: restaurantId,
      per_person_budget: budget
    });
    return res.data;
  },

  async getGroupOrder(roomCode: string) {
    const res = await api.get(`/group-orders/${roomCode}/`);
    return res.data;
  },

  async addGroupOrderItem(roomCode: string, payload: {
    member_name: string;
    item_id: number;
    item_name: string;
    price: number;
  }) {
    const res = await api.post(`/group-orders/${roomCode}/add-item/`, payload);
    return res.data;
  },

  // BitePoints
  async getBitePoints(): Promise<BitePointsData> {
    const res = await api.get('/bitepoints/');
    return res.data;
  },

  async redeemBitePoints(points: number) {
    const res = await api.post('/bitepoints/redeem/', { points });
    return res.data;
  },

  // LastCall Bites
  async getLastCallBites(): Promise<LastCallBite[]> {
    const res = await api.get('/lastcall-bites/');
    return res.data;
  },

  // MealPass
  async getMealPass() {
    const res = await api.get('/mealpass/');
    return res.data;
  },

  async subscribeMealPass(payload: Record<string, any>) {
    const res = await api.post('/mealpass/', payload);
    return res.data;
  },

  // Reviews & Support
  async getReviews(restaurantId?: number): Promise<Review[]> {
    const res = await api.get('/reviews/', { params: { restaurant_id: restaurantId } });
    return res.data;
  },

  async submitReview(payload: Record<string, any>) {
    const res = await api.post('/reviews/', payload);
    return res.data;
  },

  async getSupportTickets(): Promise<SupportTicket[]> {
    const res = await api.get('/support-tickets/');
    return res.data;
  },

  async createSupportTicket(payload: Record<string, any>): Promise<SupportTicket> {
    const res = await api.post('/support-tickets/', payload);
    return res.data;
  },

  // Restaurant Dashboard
  async getRestaurantDashboard() {
    const res = await api.get('/restaurant/dashboard/');
    return res.data;
  },

  async updateMenuItem(id: number, data: Partial<MenuItem>) {
    const res = await api.patch(`/menu-items/${id}/`, data);
    return res.data;
  },

  async createMenuItem(data: Partial<MenuItem>) {
    const res = await api.post('/menu-items/', data);
    return res.data;
  },

  // Rider Dashboard
  async getRiderDashboard() {
    const res = await api.get('/rider/dashboard/');
    return res.data;
  },

  async toggleRiderStatus(isOnline: boolean, lat?: number, lng?: number) {
    const res = await api.post('/rider/toggle-status/', {
      is_online: isOnline,
      latitude: lat,
      longitude: lng
    });
    return res.data;
  },

  // Admin Dashboard
  async getAdminOverview() {
    const res = await api.get('/admin/overview/');
    return res.data;
  },

  async getAdminRestaurants() {
    const res = await api.get('/admin/restaurants/');
    return res.data;
  },

  async updateRestaurantApproval(id: number, approval_status: string) {
    const res = await api.patch(`/admin/restaurants/${id}/approval/`, { approval_status });
    return res.data;
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await api.get('/admin/users/');
    return res.data;
  }
};
