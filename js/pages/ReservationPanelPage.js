class ReservationPanelPage extends Page {
  constructor(containerId) {
    super(containerId);
    this.api = ApiService.getInstance();
    this.reservation = null;
    this.availableServices = [];
  }

  async mount() {
    if (!window._currentReservation) {
      Toast.show('No hay una reserva activa. Realice una reserva primero.', 'warning');
      window.location.hash = '#/';
      return;
    }
    this.render();
    await this._loadData();
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <div class="container">
          <h1 class="page-header__title">Panel de Gestion</h1>
          <p class="page-header__subtitle">Gestione su reserva, agregue servicios y realice check-in / check-out</p>
        </div>
      </div>
      <div class="container">
        <div id="panel-content">
          <div class="loading-container">
            <div class="spinner spinner--lg"></div>
            <p>Cargando reserva...</p>
          </div>
        </div>
      </div>
    `;
  }

  async _loadData() {
    try {
      const resData = window._currentReservation;
      this.reservation = new Reservation(resData);
      this.availableServices = this.api.getAvailableServices();
      this._renderPanel();
    } catch (error) {
      Toast.show('Error al cargar los datos de la reserva', 'error');
    }
  }

  _renderPanel() {
    const res = this.reservation;
    const panel = document.getElementById('panel-content');

    // Determine which services are already added
    const addedTypes = (res.services || []).map(s => s.type);

    panel.innerHTML = `
      <div class="status-bar">
        <div class="status-bar__info">
          <span class="status-bar__id">Reserva #${res.id}</span>
          <span class="status-bar__badge" style="background: ${res.getStatusColor()}">${res.getStatusLabel()}</span>
        </div>
        <div class="status-bar__actions">
          ${res.status === 'CONFIRMED' ? `
            <button class="btn btn--primary" id="checkin-btn">Realizar Check-In</button>
          ` : ''}
          ${res.status === 'CHECKED_IN' ? `
            <button class="btn btn--secondary" id="checkout-btn">Realizar Check-Out</button>
          ` : ''}
          ${res.status === 'CHECKED_OUT' ? `
            <button class="btn btn--primary" id="invoice-btn">Ver Factura</button>
          ` : ''}
        </div>
      </div>

      ${res.digitalKey ? `
      <div class="digital-key-card">
        <div class="digital-key-card__icon">KEY</div>
        <div class="digital-key-card__info">
          <h3>Llave Digital</h3>
          <span class="digital-key-card__code">${res.digitalKey}</span>
          <p>Use este codigo para acceder a su habitacion</p>
        </div>
      </div>
      ` : ''}

      <div class="panel-grid">
        <div class="panel-card">
          <h3 class="panel-card__title">Resumen de la Reserva</h3>
          <div class="panel-card__content">
            <div class="info-row">
              <span class="info-row__label">Huesped</span>
              <span class="info-row__value">${res.guestName}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Email</span>
              <span class="info-row__value">${res.guestEmail}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Habitacion</span>
              <span class="info-row__value">${res.room.getTypeLabel()} - Hab. ${res.room.number}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Llegada</span>
              <span class="info-row__value">${new Date(res.checkInDate).toLocaleDateString('es-CO')}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Salida</span>
              <span class="info-row__value">${new Date(res.checkOutDate).toLocaleDateString('es-CO')}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Noches</span>
              <span class="info-row__value">${res.getNights()}</span>
            </div>
            <div class="info-row info-row--total">
              <span class="info-row__label">Total Estimado</span>
              <span class="info-row__value">$${res.estimatedTotal.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <h3 class="panel-card__title">Servicios Agregados</h3>
          <div class="panel-card__content" id="added-services">
            ${res.services && res.services.length > 0 ? `
              <div class="added-services-list">
                ${res.services.map(s => `
                  <div class="added-service-item">
                    <span>${s.description || s.type}</span>
                    <span>$${(s.cost || 0).toLocaleString('es-CO')}</span>
                  </div>
                `).join('')}
              </div>
              <div class="info-row info-row--total" style="margin-top: var(--space-md);">
                <span class="info-row__label">Total Servicios</span>
                <span class="info-row__value">$${res.getServicesTotal().toLocaleString('es-CO')}</span>
              </div>
            ` : '<p class="empty-state">No se han agregado servicios aun</p>'}
          </div>
        </div>
      </div>

      ${res.status === 'CHECKED_IN' ? `
      <div class="services-section">
        <h3 class="section-title">Servicios Disponibles</h3>
        <p class="section-subtitle">Agregue servicios adicionales a su estancia</p>
        <div class="services-grid" id="services-grid"></div>
      </div>
      ` : ''}
    `;

    this._setupEventListeners();
    this._renderAvailableServices();
  }

  _renderAvailableServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const addedTypes = (this.reservation.services || []).map(s => s.type);

    this.availableServices.forEach(service => {
      const isAdded = addedTypes.includes(service.type);
      const card = new ServiceCard(
        service,
        (svc, add) => { if (add) this._addService(svc); },
        isAdded
      );
      grid.appendChild(card.render());
    });
  }

  async _addService(service) {
    try {
      await this.api.addService(this.reservation.id, service.type);
      Toast.show(`${service.name} agregado`, 'success');

      // Refresh reservation data
      const updated = await this.api.getReservation(this.reservation.id);
      window._currentReservation = updated;
      this.reservation = new Reservation(updated);
      this._renderPanel();
    } catch (error) {
      Toast.show('Error al agregar servicio: ' + (error.message || ''), 'error');
    }
  }

  _setupEventListeners() {
    const checkinBtn = document.getElementById('checkin-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const invoiceBtn = document.getElementById('invoice-btn');

    if (checkinBtn) {
      checkinBtn.addEventListener('click', () => this._doCheckIn());
    }
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this._doCheckOut());
    }
    if (invoiceBtn) {
      invoiceBtn.addEventListener('click', () => {
        window.location.hash = '#/invoice';
      });
    }
  }

  async _doCheckIn() {
    try {
      const result = await this.api.doCheckIn(this.reservation.id);
      window._currentReservation = result;
      this.reservation = new Reservation(result);
      Toast.show('Check-In realizado! Se ha generado su llave digital.', 'success');
      this._renderPanel();
    } catch (error) {
      Toast.show('Error al realizar el check-in: ' + (error.message || ''), 'error');
    }
  }

  async _doCheckOut() {
    const modal = new Modal(
      'Confirmar Check-Out',
      `
        <p>Esta seguro de que desea realizar el check-out?</p>
        <p>Se generara la factura final de su estancia.</p>
        <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
          <button class="btn btn--secondary btn--block" id="confirm-checkout">Confirmar</button>
          <button class="btn btn--ghost btn--block" id="cancel-checkout">Cancelar</button>
        </div>
      `
    );
    modal.open();

    document.getElementById('confirm-checkout').addEventListener('click', async () => {
      modal.close();
      try {
        // Checkout returns the invoice directly from backend
        const invoice = await this.api.doCheckOut(this.reservation.id);
        window._invoiceData = invoice;

        // Update reservation status locally
        window._currentReservation.status = 'CHECKED_OUT';
        window._currentReservation.digitalKey = null;
        this.reservation = new Reservation(window._currentReservation);

        Toast.show('Check-Out realizado. Puede ver su factura.', 'success');
        this._renderPanel();
      } catch (error) {
        Toast.show('Error al realizar el check-out: ' + (error.message || ''), 'error');
      }
    });

    document.getElementById('cancel-checkout').addEventListener('click', () => {
      modal.close();
    });
  }
}
