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
          <h1 class="page-header__title">Panel de Gestión</h1>
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

      const servicesData = await this.api.get('/services');
      this.availableServices = servicesData.map(s => new HotelService(s));

      this._renderPanel();
    } catch (error) {
      Toast.show('Error al cargar los datos de la reserva', 'error');
    }
  }

  _renderPanel() {
    const res = this.reservation;
    const panel = document.getElementById('panel-content');

    panel.innerHTML = `
      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-bar__info">
          <span class="status-bar__id">Reserva #${res.id}</span>
          <span class="status-bar__badge" style="background: ${res.getStatusColor()}">${res.getStatusLabel()}</span>
        </div>
        <div class="status-bar__actions">
          ${res.status === 'PENDIENTE' ? `
            <button class="btn btn--primary" id="checkin-btn">Realizar Check-In</button>
          ` : ''}
          ${res.status === 'CHECK_IN' ? `
            <button class="btn btn--secondary" id="checkout-btn">Realizar Check-Out</button>
          ` : ''}
          ${res.status === 'CHECK_OUT' ? `
            <button class="btn btn--primary" id="invoice-btn">Ver Factura</button>
          ` : ''}
        </div>
      </div>

      <!-- Digital Key (visible after check-in) -->
      ${res.digitalKey ? `
      <div class="digital-key-card">
        <div class="digital-key-card__icon">KEY</div>
        <div class="digital-key-card__info">
          <h3>Llave Digital</h3>
          <span class="digital-key-card__code">${res.digitalKey}</span>
          <p>Use este código para acceder a su habitación</p>
        </div>
      </div>
      ` : ''}

      <!-- Info Grid -->
      <div class="panel-grid">
        <!-- Reservation Summary Card -->
        <div class="panel-card">
          <h3 class="panel-card__title">Resumen de la Reserva</h3>
          <div class="panel-card__content">
            <div class="info-row">
              <span class="info-row__label">Huésped</span>
              <span class="info-row__value">${res.guest.getFullName()}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Documento</span>
              <span class="info-row__value">${res.guest.documentType} ${res.guest.documentNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-row__label">Habitación</span>
              <span class="info-row__value">${res.room.getTypeLabel()} — Hab. ${res.room.number}</span>
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
              <span class="info-row__label">Precio Habitación</span>
              <span class="info-row__value">$${(res.room.pricePerNight * res.getNights()).toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        <!-- Added Services Card -->
        <div class="panel-card">
          <h3 class="panel-card__title">Servicios Agregados</h3>
          <div class="panel-card__content" id="added-services">
            ${res.services.length > 0 ? `
              <div class="added-services-list">
                ${res.services.map(s => {
                  const svc = new HotelService(s);
                  return `
                  <div class="added-service-item">
                    <span>${svc.getCategoryIcon()} ${s.name}</span>
                    <span>$${s.price.toLocaleString('es-CO')}</span>
                  </div>`;
                }).join('')}
              </div>
              <div class="info-row info-row--total" style="margin-top: var(--space-md);">
                <span class="info-row__label">Total Servicios</span>
                <span class="info-row__value">$${res.getServicesTotal().toLocaleString('es-CO')}</span>
              </div>
            ` : '<p class="empty-state">No se han agregado servicios aún</p>'}
          </div>
        </div>
      </div>

      <!-- Available Services (hidden after check-out) -->
      ${res.status !== 'CHECK_OUT' ? `
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
    const addedIds = (this.reservation.services || []).map(s => s.id);

    this.availableServices.forEach(service => {
      const isAdded = addedIds.includes(service.id);
      const card = new ServiceCard(
        service,
        (svc, add) => this._toggleService(svc, add),
        isAdded
      );
      grid.appendChild(card.render());
    });
  }

  async _toggleService(service, add) {
    try {
      let result;
      if (add) {
        result = await this.api.post(
          `/reservations/${this.reservation.id}/services`,
          { serviceId: service.id }
        );
        Toast.show(`${service.name} agregado`, 'success');
      } else {
        result = await this.api.delete(
          `/reservations/${this.reservation.id}/services/${service.id}`
        );
        Toast.show(`${service.name} removido`, 'info');
      }
      window._currentReservation = result;
      this.reservation = new Reservation(result);
      this._renderPanel();
    } catch (error) {
      Toast.show('Error al actualizar servicios', 'error');
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
      const result = await this.api.put(`/reservations/${this.reservation.id}/checkin`);
      window._currentReservation = result;
      this.reservation = new Reservation(result);
      Toast.show('¡Check-In realizado! Se ha generado su llave digital.', 'success');
      this._renderPanel();
    } catch (error) {
      Toast.show('Error al realizar el check-in', 'error');
    }
  }

  async _doCheckOut() {
    const modal = new Modal(
      'Confirmar Check-Out',
      `
        <p>¿Está seguro de que desea realizar el check-out?</p>
        <p>Se generará la factura final de su estancia.</p>
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
        const result = await this.api.put(`/reservations/${this.reservation.id}/checkout`);
        window._currentReservation = result;
        this.reservation = new Reservation(result);
        Toast.show('Check-Out realizado. Puede ver su factura.', 'success');
        this._renderPanel();
      } catch (error) {
        Toast.show('Error al realizar el check-out', 'error');
      }
    });

    document.getElementById('cancel-checkout').addEventListener('click', () => {
      modal.close();
    });
  }
}
