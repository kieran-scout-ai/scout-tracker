const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  email_frequency: string | null;
  email_instructions: string | null;
  file_path: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string | null;
  quantity: number | null;
  price: number | null;
  market_value: number | null;
  weight: number | null;
  sector: string | null;
  validated: boolean | null;
  validation_status: string | null;
  portfolio_id: string;
  created_at: string;
  updated_at: string;
}

interface EmailRecap {
  id: string;
  subject: string;
  content: string;
  portfolio_id: string;
  sent_at: string;
  created_at: string;
}

class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    // Load tokens from localStorage
    this.loadTokens();
  }

  private loadTokens() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const tokens: AuthTokens = await response.json();
        this.saveTokens(tokens);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    this.clearTokens();
    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if we have a token
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry with new token
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        return { data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.detail || `HTTP ${response.status}` };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Authentication methods
  async register(email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      this.saveTokens(response.data);
    }

    return response;
  }

  async logout() {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Portfolio methods
  async getPortfolios(): Promise<ApiResponse<Portfolio[]>> {
    return this.request<Portfolio[]>('/api/portfolios/');
  }

  async getPortfolio(portfolioId: string): Promise<ApiResponse<Portfolio>> {
    return this.request<Portfolio>(`/api/portfolios/${portfolioId}`);
  }

  async createPortfolio(portfolioData: {
    name: string;
    description?: string;
    email_frequency?: string;
    email_instructions?: string;
  }): Promise<ApiResponse<Portfolio>> {
    return this.request<Portfolio>('/api/portfolios/', {
      method: 'POST',
      body: JSON.stringify(portfolioData),
    });
  }

  async updatePortfolio(
    portfolioId: string,
    portfolioData: Partial<Portfolio>
  ): Promise<ApiResponse<Portfolio>> {
    return this.request<Portfolio>(`/api/portfolios/${portfolioId}`, {
      method: 'PUT',
      body: JSON.stringify(portfolioData),
    });
  }

  async deletePortfolio(portfolioId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/api/portfolios/${portfolioId}`, {
      method: 'DELETE',
    });
  }

  // Holdings methods
  async getPortfolioHoldings(portfolioId: string): Promise<ApiResponse<PortfolioHolding[]>> {
    return this.request<PortfolioHolding[]>(`/api/portfolios/${portfolioId}/holdings`);
  }

  async createHolding(
    portfolioId: string,
    holdingData: {
      symbol: string;
      name?: string;
      quantity?: number;
      price?: number;
      market_value?: number;
      weight?: number;
      sector?: string;
    }
  ): Promise<ApiResponse<PortfolioHolding>> {
    return this.request<PortfolioHolding>(`/api/portfolios/${portfolioId}/holdings`, {
      method: 'POST',
      body: JSON.stringify(holdingData),
    });
  }

  // Email recap methods
  async getPortfolioRecaps(portfolioId: string): Promise<ApiResponse<EmailRecap[]>> {
    return this.request<EmailRecap[]>(`/api/portfolios/${portfolioId}/recaps`);
  }

  async getLatestRecap(portfolioId: string): Promise<ApiResponse<EmailRecap>> {
    return this.request<EmailRecap>(`/api/portfolios/${portfolioId}/recaps/latest`);
  }

  async generateRecap(portfolioId: string): Promise<ApiResponse<EmailRecap>> {
    return this.request<EmailRecap>(`/api/portfolios/${portfolioId}/recaps/generate`, {
      method: 'POST',
    });
  }

  // File upload methods
  async uploadPortfolioFile(
    portfolioId: string,
    file: File
  ): Promise<ApiResponse<{
    headers: string[];
    rows: any[][];
    total_rows: number;
    file_name: string;
    file_path: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/portfolios/${portfolioId}/upload-holdings`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return { data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { error: errorData.detail || `HTTP ${response.status}` };
      }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async processPortfolioHoldings(
    portfolioId: string,
    columnMapping: { tickerColumn: number; nameColumn?: number }
  ): Promise<ApiResponse<{ message: string; holdings_created: number }>> {
    return this.request<{ message: string; holdings_created: number }>(
      `/api/portfolios/${portfolioId}/process-holdings`,
      {
        method: 'POST',
        body: JSON.stringify(columnMapping),
      }
    );
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  User,
  Portfolio,
  PortfolioHolding,
  EmailRecap,
  AuthTokens,
  ApiResponse,
};