import TokenManager from './tokenManager';

interface ApiResponse<T = any> {
  message?: string;
  [key: string]: any;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:5000') {
    this.baseURL = baseURL;
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...TokenManager.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 unauthorized
      if (response.status === 401) {
        TokenManager.removeToken();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async verifyToken() {
    return this.request('/auth/verify-token');
  }

  // Cart methods
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(item: any) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  // Order methods
  async getOrders() {
    return this.request('/orders');
  }

  async placeOrder(orderData: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Product methods
  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id: string | number) {
    return this.request(`/products/${id}`);
  }

  // Category methods
  async getCategories() {
    return this.request('/categories');
  }
}

export default new ApiClient();