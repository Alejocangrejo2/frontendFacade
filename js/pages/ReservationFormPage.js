class ReservationFormPage extends Page {
  constructor(containerId) {
    super(containerId);
    this.api = ApiService.getInstance();
  }

  mount() {
    if (!window._selectedRoom || !window._searchDates) {
      Toast.show('Primero seleccione una habitacion', 'warning');
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
          <button class="btn btn--ghost btn--back" id="back-to-room">Volver al detalle</button>
          <h1 class="page-header__title">Formulario de Reserva</h1>
        </div>
      </div>
      <div class="container">
        <div class="reservation-form-layout">
          <div class="reservation-form-card">
            <h2 class="form-section-title">Datos del Huesped</h2>
            <form id="guest-form" class="guest-form">
              <div class="form-group">
                <label class="form-label" for="guest-name">Nombre Completo *</label>
                <input type="text" class="form-input" id="guest-name" placeholder="Ingrese su nombre completo" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" for="guest-email">Correo Electronico *</label>
                  <input type="email" class="form-input" id="guest-email" placeholder="correo@ejemplo.com" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="guest-phone">Telefono *</label>
                  <input type="tel" class="form-input" id="guest-phone" placeholder="+57 300 123 4567" required>
                </div>
              </div>
              <button type="submit" class="btn btn--primary btn--lg btn--block" id="submit-reservation">
                Confirmar Reserva
              </button>
            </form>
          </div>

          <div class="reservation-summary-card">
            <h3 class="summary-title">Resumen de Reserva</h3>
            <div class="summary-room">
              <div>
                <strong>${room.getTypeLabel()}</strong>
                <span>Habitacion ${room.number}</span>
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
      name: document.getElementById('guest-name').value,
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

      // Match backend ReservationRequest DTO
      const reservationData = {
        guestName: guest.name,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        roomNumber: room.number,
        checkInDate: dates.checkIn,
        checkOutDate: dates.checkOut
      };

      const result = await this.api.createReservation(reservationData);
      window._currentReservation = result;

      Toast.show('Reserva creada exitosamente!', 'success');
      window.location.hash = '#/panel';
    } catch (error) {
      Toast.show('Error al crear la reserva: ' + (error.message || ''), 'error');
      btn.innerHTML = 'Confirmar Reserva';
      btn.disabled = false;
    }
  }
}
