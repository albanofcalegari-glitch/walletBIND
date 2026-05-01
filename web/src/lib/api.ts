const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Error ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getProfile() {
    return this.request<any>('/auth/me');
  }

  // Position
  async getPosition() {
    return this.request<any>('/position');
  }

  // Accounts
  async getAccounts() {
    return this.request<any[]>('/accounts');
  }

  async getAccountBalance(id: string) {
    return this.request<any>(`/accounts/${id}/balance`);
  }

  async getAccountMovements(id: string, params?: { page?: number; limit?: number; from?: string; to?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const qs = query.toString();
    return this.request<any>(`/accounts/${id}/movements${qs ? `?${qs}` : ''}`);
  }

  // Cards
  async getCards() {
    return this.request<any[]>('/cards');
  }

  async freezeCard(id: string) {
    return this.request<any>(`/cards/${id}/freeze`, { method: 'POST' });
  }

  async unfreezeCard(id: string) {
    return this.request<any>(`/cards/${id}/unfreeze`, { method: 'POST' });
  }

  async updateCardLimits(id: string, limits: { dailyLimit?: number; monthlyLimit?: number }) {
    return this.request<any>(`/cards/${id}/limits`, {
      method: 'PATCH',
      body: JSON.stringify(limits),
    });
  }

  // Transfers
  async internalTransfer(body: { fromWalletId: string; toWalletId: string; amount: number; description?: string }) {
    return this.request<any>('/transfers/internal', { method: 'POST', body: JSON.stringify(body) });
  }

  async externalTransfer(body: { fromWalletId: string; destCbu: string; amount: number; concepto?: string; description?: string }) {
    return this.request<any>('/transfers/external', { method: 'POST', body: JSON.stringify(body) });
  }

  async getTransfers(params?: { page?: number; limit?: number; direction?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.direction) query.set('direction', params.direction);
    const qs = query.toString();
    return this.request<any>(`/transfers${qs ? `?${qs}` : ''}`);
  }
}

export const api = new ApiClient();
