class ReservationFormPage extends Page {
  constructor(containerId) {
    super(containerId);
    this.api = ApiService.getInstance();
  }

  mount() {
    if (!window._selectedRoom || !window._searchDates) {
      Toast.show('Primero seleccione una habitación', 'warning');
      window.location.hash = '#/';
      return;
    }
    this.render();
  }

  render() {
    const room = window._selectedRoom;
    const dates = window._searchDates;
    const priceInfo = window._priceInfo;

    this.container.innerHTML = `
      <div class="page-header">
        <div class="container">
          <button class="btn btn--ghost btn--back" id="back-to-room">← Volver al detalle</button>
          <h1 class="page-header__title">Formulario de Reserva</h1>
        </div>
      </div>
      <div class="container">
        <div class="reservation-form-layout">
          <!-- Guest Form -->
          <div class="reservation-form-card">
            <h2 class="form-section-title">Datos del Huésped</h2>
            <form id="guest-form" class="guest-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="guest-firstname">Nombre *</label>
                  <input type="text" class="form-input" id="guest-firstname" placeholder="Ingrese su nombre" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="guest-lastname">Apellido *</label>
                  <input type="text" class="form-input" id="guest-lastname" placeholder="Ingrese su apellido" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="guest-doc-type">Tipo de Documento</label>
                  <select class="form-input form-select" id="guest-doc-type">
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PP">Pasaporte</option>
                    <option value="TI">Tarjeta de Identidad</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="guest-doc-number">Número de Documento *</label>
                  <input type="text" class="form-input" id="guest-doc-number" placeholder="Ingrese su documento" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="guest-email">Correo Electrónico *</label>
                  <input type="email" class="form-input" id="guest-email" placeholder="correo@ejemplo.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="guest-phone">Teléfono *</label>
                  <input type="tel" class="form-input" id="guest-phone" placeholder="+57 300 123 4567" required>
                </div>
              </div>
              <button type="submit" class="btn btn--primary btn--lg btn--block" id="submit-reservation">
                Confirmar Reserva
              </button>
            </form>
          </div>

          <!-- Sidebar Summary -->
          <div class="reservation-summary-card">
            <h3 class="summary-title">Resumen de Reserva</h3>
            <div class="summary-room">
              <span class="summary-room__icon">${room.getTypeIcon()}</span>
              <div>
                <strong>${room.getTypeLabel()}</strong>
                <span>Habitación ${room.number}</span>
              </div>
            </div>
            <div class="summary-dates">
              <div class="summary-date">
                <span class="summary-date__label">Llegada</span>
                <span class="summary-date__value">${new Date(dates.checkIn).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div class="summary-date">
                <span class="summary-date__label">Salida</span>
                <span class="summary-date__value">${new Date(dates.checkOut).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <div class="summary-total">
              <span>Total Estimado</span>
              <span class="summary-total__value">$${priceInfo.totalPrice.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this._setupEventListeners();
  }

  _setupEventListeners() {
    document.getElementById('back-to-room').addEventListener('click', () => {
      window.history.back();
    });

    document.getElementById('guest-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this._submitReservation();
    });
  }

  async _submitReservation() {
    const guest = new Guest({
      firstName: document.getElementById('guest-firstname').value,
      lastName: document.getElementById('guest-lastname').value,
      documentType: document.getElementById('guest-doc-type').value,
      documentNumber: document.getElementById('guest-doc-number').value,
      email: document.getElementById('guest-email').value,
      phone: document.getElementById('guest-phone').value
    });

    const validation = guest.validate();
    if (!validation.valid) {
      validation.errors.forEach(err => Toast.show(err, 'error'));
      return;
    }

    const btn = document.getElementById('submit-reservation');
    btn.innerHTML = '<span class="spinner"></span> Procesando...';
    btn.disabled = true;

    try {
      const room = window._selectedRoom;
      const dates = window._searchDates;

      const reservationData = {
        guest: {
          firstName: guest.firstName,
          lastName: guest.lastName,
          documentType: guest.documentType,
          documentNumber: guest.documentNumber,
          email: guest.email,
          phone: guest.phone
        },
        room: {
          id: room.id,
          type: room.type,
          number: room.number,
          pricePerNight: window._priceInfo.pricePerNight,
          capacity: room.capacity,
          amenities: room.amenities,
          description: room.description
        },
        checkInDate: dates.checkIn,
        checkOutDate: dates.checkOut
      };

      const result = await this.api.post('/reservations', reservationData);
      window._currentReservation = result;

      Toast.show('¡Reserva creada exitosamente!', 'success');
      window.location.hash = '#/panel';
    } catch (error) {
      Toast.show('Error al crear la reserva', 'error');
      btn.innerHTML = 'Confirmar Reserva';
      btn.disabled = false;
    }
  }
}
