// API Client for Corporate Travel Admin Portal

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class APIClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Trips
  async getTrips(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/trips?${params}`);
  }

  async getTrip(id) {
    return this.request(`/trips/${id}`);
  }

  async createTrip(data) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTrip(id, data) {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approveTrip(id, approverName, comment) {
    return this.request(`/trips/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approverName, comment }),
    });
  }

  async rejectTrip(id, approverName, reason) {
    return this.request(`/trips/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ approverName, reason }),
    });
  }

  async addTripComment(id, userName, comment) {
    return this.request(`/trips/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ userName, comment }),
    });
  }

  async deleteTrip(id) {
    return this.request(`/trips/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalyticsSummary() {
    return this.request('/analytics/summary');
  }

  // Policies
  async getPolicies() {
    return this.request('/policies');
  }

  async getPolicy(id) {
    return this.request(`/policies/${id}`);
  }

  async createPolicy(data) {
    return this.request('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Expenses
  async getExpenses() {
    return this.request('/expenses');
  }

  async createExpense(data) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Advisories
  async getAdvisories() {
    return this.request('/advisories');
  }

  async createAdvisory(data) {
    return this.request('/advisories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Destinations
  async getDestinations() {
    return this.request('/destinations');
  }

  async createDestination(data) {
    return this.request('/destinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Travelers
  async getTravelers() {
    return this.request('/travelers');
  }

  async createTraveler(data) {
    return this.request('/travelers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async checkInTraveler(id) {
    return this.request(`/travelers/${id}/checkin`, {
      method: 'PUT',
    });
  }

  // Notifications
  async getNotifications(email) {
    const params = email ? `?email=${email}` : '';
    return this.request(`/notifications${params}`);
  }

  async createNotification(data) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Export singleton instance
export default new APIClient();
