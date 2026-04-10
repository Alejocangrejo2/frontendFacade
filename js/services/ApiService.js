class ApiService {

  static MOCK_MODE = true;
  static instance = null;

  constructor() {
    this.baseUrl = 'http://localhost:8080/api';
  }

  static getInstance() {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }


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
        body: JSON.stringify(data)
      });
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }

  async delete(endpoint) {
    if (ApiService.MOCK_MODE) return this._mockResponse('DELETE', endpoint);
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE'
      });
      return this._handleResponse(response);
    } catch (error) {
      this._handleError(error);
    }
  }


  async _handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Error del servidor'
      }));
      throw new Error(error.message || `Error ${response.status}`);
    }
    return response.json();
  }

  _handleError(error) {
    console.error('API Error:', error);
    Toast.show(error.message || 'Error de conexión con el servidor', 'error');
    throw error;
  }


  _getMockRooms() {
    return [
      new Room({
        id: 1, type: 'SUITE', number: '501',
        pricePerNight: 350000, capacity: 4,
        amenities: ['Wi-Fi', 'Mini Bar', 'Jacuzzi', 'Vista al Mar', 'Sala de Estar'],
        available: true,
        description: 'Nuestra suite más exclusiva con vista panorámica al mar, jacuzzi privado y sala de estar independiente.'
      }),
      new Room({
        id: 2, type: 'DOBLE_DELUXE', number: '302',
        pricePerNight: 180000, capacity: 3,
        amenities: ['Wi-Fi', 'Mini Bar', 'Balcón', 'TV 55"'],
        available: true,
        description: 'Habitación doble con acabados de lujo, balcón privado y vista a los jardines.'
      }),
      new Room({
        id: 3, type: 'SENCILLA', number: '105',
        pricePerNight: 95000, capacity: 1,
        amenities: ['Wi-Fi', 'TV 42"', 'Escritorio'],
        available: true,
        description: 'Habitación cómoda y funcional, ideal para viajeros de negocios.'
      }),
      new Room({
        id: 4, type: 'SUITE_JUNIOR', number: '401',
        pricePerNight: 250000, capacity: 3,
        amenities: ['Wi-Fi', 'Mini Bar', 'Sala de Estar', 'TV 50"', 'Balcón'],
        available: true,
        description: 'Suite elegante con sala de estar integrada y todas las comodidades premium.'
      }),
      new Room({
        id: 5, type: 'DOBLE', number: '203',
        pricePerNight: 120000, capacity: 2,
        amenities: ['Wi-Fi', 'TV 42"', 'Balcón'],
        available: true,
        description: 'Habitación doble estándar con decoración moderna y balcón privado.'
      }),
      new Room({
        id: 6, type: 'SENCILLA_SUPERIOR', number: '108',
        pricePerNight: 110000, capacity: 2,
        amenities: ['Wi-Fi', 'Mini Bar', 'TV 42"', 'Escritorio'],
        available: false,
        description: 'Habitación sencilla con amenidades superiores y espacio adicional.'
      })
    ];
  }

  _getMockServices() {
    return [
      new HotelService({ id: 1, name: 'Masaje Relajante', category: 'SPA', description: 'Masaje corporal completo de 60 minutos con aceites esenciales.', price: 80000 }),
      new HotelService({ id: 2, name: 'Cena Gourmet', category: 'RESTAURANTE', description: 'Cena de 3 tiempos con maridaje de vinos seleccionados.', price: 55000 }),
      new HotelService({ id: 3, name: 'Transfer Aeropuerto', category: 'TRANSPORTE', description: 'Servicio de transporte privado ida y vuelta al aeropuerto.', price: 40000 }),
      new HotelService({ id: 4, name: 'Desayuno en Habitación', category: 'HABITACION', description: 'Desayuno buffet completo servido en la comodidad de su habitación.', price: 25000 }),
      new HotelService({ id: 5, name: 'Tour por la Ciudad', category: 'TOUR', description: 'Recorrido guiado de 4 horas por los principales puntos turísticos.', price: 65000 }),
      new HotelService({ id: 6, name: 'Lavandería Express', category: 'LAVANDERIA', description: 'Servicio de lavado y planchado entregado en 4 horas.', price: 30000 })
    ];
  }

  _mockResponse(method, endpoint, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (method === 'GET' && endpoint.startsWith('/rooms') && endpoint.includes('checkIn') && !endpoint.includes('/price')) {
          const rooms = this._getMockRooms().filter(r => r.available);
          resolve(rooms.map(r => ({ ...r })));
          return;
        }
        if (method === 'GET' && endpoint.includes('/price')) {
          const id = parseInt(endpoint.split('/')[2]);
          const room = this._getMockRooms().find(r => r.id === id);
          const params = new URLSearchParams(endpoint.split('?')[1]);
          const checkIn = new Date(params.get('checkIn'));
          const checkOut = new Date(params.get('checkOut'));
          const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

          // Dynamic pricing: high season = Dec, Jan, Jun, Jul
          const month = checkIn.getMonth();
          const isHighSeason = [0, 5, 6, 11].includes(month);
          const multiplier = isHighSeason ? 1.3 : 1.0;
          const pricePerNight = Math.round((room ? room.pricePerNight : 100000) * multiplier);

          resolve({
            roomId: id,
            pricePerNight,
            nights,
            totalPrice: pricePerNight * nights,
            isHighSeason,
            seasonLabel: isHighSeason ? 'Temporada Alta' : 'Temporada Baja'
          });
          return;
        }
        if (method === 'GET' && /^\/rooms\/\d+$/.test(endpoint)) {
          const id = parseInt(endpoint.split('/')[2]);
          const room = this._getMockRooms().find(r => r.id === id);
          resolve(room ? { ...room } : null);
          return;
        }
        if (method === 'POST' && endpoint === '/reservations') {
          const reservation = {
            id: Math.floor(Math.random() * 10000) + 1,
            ...data,
            status: 'PENDIENTE',
            services: [],
            digitalKey: null
          };
          if (!window._mockReservations) window._mockReservations = [];
          window._mockReservations.push(reservation);
          resolve(reservation);
          return;
        }
        if (method === 'GET' && /^\/reservations\/\d+$/.test(endpoint)) {
          const id = parseInt(endpoint.split('/')[2]);
          const reservation = (window._mockReservations || []).find(r => r.id === id);
          resolve(reservation || null);
          return;
        }
        if (method === 'PUT' && endpoint.includes('/checkin')) {
          const id = parseInt(endpoint.split('/')[2]);
          const reservation = (window._mockReservations || []).find(r => r.id === id);
          if (reservation) {
            reservation.status = 'CHECK_IN';
            reservation.digitalKey = `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          }
          resolve(reservation ? { ...reservation } : null);
          return;
        }
        if (method === 'PUT' && endpoint.includes('/checkout')) {
          const id = parseInt(endpoint.split('/')[2]);
          const reservation = (window._mockReservations || []).find(r => r.id === id);
          if (reservation) {
            reservation.status = 'CHECK_OUT';
            reservation.digitalKey = null;
          }
          resolve(reservation ? { ...reservation } : null);
          return;
        }
        if (method === 'GET' && endpoint === '/services') {
          resolve(this._getMockServices().map(s => ({ ...s })));
          return;
        }
        if (method === 'POST' && endpoint.includes('/services')) {
          const id = parseInt(endpoint.split('/')[2]);
          const reservation = (window._mockReservations || []).find(r => r.id === id);
          if (reservation) {
            const service = this._getMockServices().find(s => s.id === data.serviceId);
            if (service && !reservation.services.find(s => s.id === service.id)) {
              reservation.services.push({ ...service });
            }
          }
          resolve(reservation ? { ...reservation } : null);
          return;
        }
        if (method === 'DELETE' && endpoint.includes('/services/')) {
          const parts = endpoint.split('/');
          const reservationId = parseInt(parts[2]);
          const serviceId = parseInt(parts[4]);
          const reservation = (window._mockReservations || []).find(r => r.id === reservationId);
          if (reservation) {
            reservation.services = reservation.services.filter(s => s.id !== serviceId);
          }
          resolve(reservation ? { ...reservation } : null);
          return;
        }
        if (method === 'GET' && endpoint.includes('/invoice')) {
          const id = parseInt(endpoint.split('/')[2]);
          const reservation = (window._mockReservations || []).find(r => r.id === id);
          if (reservation) {
            const room = new Room(reservation.room);
            const nights = (() => {
              const ci = new Date(reservation.checkInDate);
              const co = new Date(reservation.checkOutDate);
              return Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
            })();
            const roomTotal = room.pricePerNight * nights;
            const servicesTotal = (reservation.services || []).reduce((sum, s) => sum + s.price, 0);
            const subtotal = roomTotal + servicesTotal;
            const taxes = Math.round(subtotal * 0.19);
            const total = subtotal + taxes;

            const items = [
              { description: `Habitación ${room.getTypeLabel()} — ${nights} noche(s)`, amount: roomTotal },
              ...(reservation.services || []).map(s => ({ description: s.name, amount: s.price }))
            ];

            resolve({
              id: Math.floor(Math.random() * 100000),
              reservation,
              subtotal,
              taxes,
              total,
              generatedAt: new Date().toISOString(),
              items
            });
          } else {
            resolve(null);
          }
          return;
        }
        resolve(null);
      }, 500); // Simulated network delay
    });
  }
}
