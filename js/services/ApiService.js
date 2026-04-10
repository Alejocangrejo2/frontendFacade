class ApiService {

  static MOCK_MODE = false;
  static instance = null;

  constructor() {
    this.baseUrl = 'http://localhost:8080/api/hotel';
  }

  static getInstance() {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // HTTP methods with ApiResponse unwrapping

  async get(endpoint) {
    if (ApiService.MOCK_MODE) return this._mockResponse('GET', endpoint);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async post(endpoint, data) {
    if (ApiService.MOCK_MODE) return this._mockResponse('POST', endpoint, data);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async put(endpoint, data) {
    if (ApiService.MOCK_MODE) return this._mockResponse('PUT', endpoint, data);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      });
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async _handleResponse(response) {
    const json = await response.json();

    // Backend wraps all responses in {success, message, data}
    if (json.success !== undefined) {
      if (!json.success) {
        throw new Error(json.message || 'Error del servidor');
      }
      return json.data;
    }

    if (!response.ok) {
      throw new Error(json.message || `Error ${response.status}`);
    }
    return json;
  }

  _handleError(error) {
    console.error('API Error:', error);
    Toast.show(error.message || 'Error de conexion con el servidor', 'error');
    throw error;
  }

  // ---- High-level API methods matching backend endpoints ----

  async searchRooms(checkIn, checkOut, type) {
    let endpoint = `/disponibilidad?checkIn=${checkIn}&checkOut=${checkOut}`;
    if (type) endpoint += `&type=${type}`;
    return this.get(endpoint);
  }

  async createReservation(data) {
    return this.post('/reservar', data);
  }

  async getReservation(reservaId) {
    return this.get(`/reserva/${reservaId}`);
  }

  async doCheckIn(reservaId) {
    return this.put(`/checkin/${reservaId}`);
  }

  async doCheckOut(reservaId) {
    return this.put(`/checkout/${reservaId}`);
  }

  async addService(reservaId, serviceType) {
    return this.post(`/servicios/${reservaId}`, { serviceType });
  }

  // Available service types (hardcoded since backend uses enum)
  getAvailableServices() {
    return [
      new HotelService({ type: 'SPA', description: 'Sesion de Spa', cost: 50.0 }),
      new HotelService({ type: 'BREAKFAST', description: 'Desayuno (por dia)', cost: 15.0 }),
      new HotelService({ type: 'TRANSPORT', description: 'Transfer Aeropuerto', cost: 30.0 })
    ];
  }

  // ---- Mock data for offline development ----

  _getMockRooms() {
    return [
      new Room({ number: 101, type: 'SINGLE', basePrice: 80.0, status: 'AVAILABLE' }),
      new Room({ number: 102, type: 'SINGLE', basePrice: 80.0, status: 'AVAILABLE' }),
      new Room({ number: 103, type: 'SINGLE', basePrice: 80.0, status: 'AVAILABLE' }),
      new Room({ number: 201, type: 'DOUBLE', basePrice: 150.0, status: 'AVAILABLE' }),
      new Room({ number: 202, type: 'DOUBLE', basePrice: 150.0, status: 'AVAILABLE' }),
      new Room({ number: 203, type: 'DOUBLE', basePrice: 150.0, status: 'AVAILABLE' }),
      new Room({ number: 301, type: 'SUITE', basePrice: 350.0, status: 'AVAILABLE' }),
      new Room({ number: 302, type: 'SUITE', basePrice: 350.0, status: 'AVAILABLE' })
    ];
  }

  _mockResponse(method, endpoint, data) {
    return new Promise((resolve) => {
      setTimeout(() => {

        if (method === 'GET' && endpoint.includes('/disponibilidad')) {
          const rooms = this._getMockRooms().filter(r => r.available);
          resolve(rooms.map(r => ({ number: r.number, type: r.type, basePrice: r.basePrice, status: r.status })));
          return;
        }

        if (method === 'POST' && endpoint === '/reservar') {
          const room = this._getMockRooms().find(r => r.number === data.roomNumber);
          const id = Math.random().toString(36).substring(2, 10).toUpperCase();
          const nights = Math.ceil((new Date(data.checkOutDate) - new Date(data.checkInDate)) / (1000*60*60*24));
          const isHigh = [0, 6, 7, 11].includes(new Date(data.checkInDate).getMonth());
          const mult = isHigh ? 1.5 : 1.0;
          const estimated = (room ? room.basePrice : 80) * mult * nights;

          const reservation = {
            id, guestName: data.guestName, guestEmail: data.guestEmail, guestPhone: data.guestPhone,
            room: room ? { number: room.number, type: room.type, basePrice: room.basePrice, status: 'RESERVED' } : null,
            checkInDate: data.checkInDate, checkOutDate: data.checkOutDate,
            nights, status: 'CONFIRMED', digitalKey: null, estimatedTotal: estimated
          };
          if (!window._mockReservations) window._mockReservations = {};
          window._mockReservations[id] = reservation;
          resolve(reservation);
          return;
        }

        if (method === 'GET' && endpoint.includes('/reserva/')) {
          const id = endpoint.split('/reserva/')[1];
          resolve(window._mockReservations ? window._mockReservations[id] : null);
          return;
        }

        if (method === 'PUT' && endpoint.includes('/checkin/')) {
          const id = endpoint.split('/checkin/')[1];
          const res = window._mockReservations ? window._mockReservations[id] : null;
          if (res) {
            res.status = 'CHECKED_IN';
            res.digitalKey = 'KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
          }
          resolve(res);
          return;
        }

        if (method === 'PUT' && endpoint.includes('/checkout/')) {
          const id = endpoint.split('/checkout/')[1];
          const res = window._mockReservations ? window._mockReservations[id] : null;
          if (res) {
            res.status = 'CHECKED_OUT';
            res.digitalKey = null;
            const nights = res.nights;
            const basePrice = res.room.basePrice;
            const isHigh = [0, 6, 7, 11].includes(new Date(res.checkInDate).getMonth());
            const mult = isHigh ? 1.5 : 1.0;
            const roomTotal = basePrice * mult * nights;
            const svcs = res.services || [];
            const svcTotal = svcs.reduce((s, sv) => s + (sv.cost || 0), 0);

            resolve({
              invoiceNumber: 'INV-' + id,
              reservationId: id, guestName: res.guestName, guestEmail: res.guestEmail,
              roomNumber: res.room.number, roomType: res.room.type,
              nights, baseRoomCost: basePrice, seasonMultiplier: mult,
              seasonLabel: isHigh ? 'HIGH' : 'LOW',
              roomTotal, services: svcs, servicesTotal: svcTotal,
              grandTotal: roomTotal + svcTotal, issuedAt: new Date().toISOString()
            });
          }
          return;
        }

        if (method === 'POST' && endpoint.includes('/servicios/')) {
          const id = endpoint.split('/servicios/')[1];
          const res = window._mockReservations ? window._mockReservations[id] : null;
          if (res) {
            if (!res.services) res.services = [];
            const svc = new HotelService({ type: data.serviceType });
            res.services.push({ type: svc.type, description: svc.description, cost: svc.price });
            resolve({ type: svc.type, description: svc.description, cost: svc.price });
          }
          return;
        }

        resolve(null);
      }, 500);
    });
  }
}
