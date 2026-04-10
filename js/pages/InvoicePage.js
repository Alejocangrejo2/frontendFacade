class InvoicePage extends Page {
  constructor(containerId) {
    super(containerId);
    this.api = ApiService.getInstance();
    this.invoice = null;
  }

  async mount() {
    if (!window._currentReservation) {
      Toast.show('No hay una reserva activa', 'warning');
      window.location.hash = '#/';
      return;
    }
    this.render();
    await this._loadInvoice();
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <div class="container">
          <button class="btn btn--ghost btn--back" id="back-to-panel">← Volver al Panel</button>
          <h1 class="page-header__title">Factura</h1>
        </div>
      </div>
      <div class="container">
        <div id="invoice-content">
          <div class="loading-container">
            <div class="spinner spinner--lg"></div>
            <p>Generando factura...</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-to-panel').addEventListener('click', () => {
      window.location.hash = '#/panel';
    });
  }

  async _loadInvoice() {
    try {
      const data = await this.api.get(`/reservations/${window._currentReservation.id}/invoice`);
      this.invoice = data instanceof Invoice ? data : new Invoice(data);
      this._renderInvoice();
    } catch (error) {
      Toast.show('Error al generar la factura', 'error');
    }
  }

  _renderInvoice() {
    const inv = this.invoice;
    const res = new Reservation(inv.reservation);
    const content = document.getElementById('invoice-content');

    content.innerHTML = `
      <div class="invoice">
        <!-- Header -->
        <div class="invoice__header">
          <div class="invoice__brand">
            <span class="invoice__logo">HD</span>
            <h2>Hotel Dorado</h2>
            <p>Calle 100 #15-20, Bogotá, Colombia</p>
            <p>Tel: +57 (1) 555-0100 | info@hoteldorado.com</p>
          </div>
          <div class="invoice__meta">
            <h3>FACTURA</h3>
            <p>N° ${String(inv.id).padStart(6, '0')}</p>
            <p>${inv.getFormattedDate()}</p>
          </div>
        </div>

        <div class="invoice__divider"></div>

        <!-- Guest Info -->
        <div class="invoice__guest">
          <h4>Datos del Huésped</h4>
          <p><strong>${res.guest.getFullName()}</strong></p>
          <p>${res.guest.documentType}: ${res.guest.documentNumber}</p>
          <p>${res.guest.email}</p>
          <p>${res.guest.phone}</p>
        </div>

        <!-- Stay Info -->
        <div class="invoice__stay">
          <h4>Datos de la Estancia</h4>
          <div class="invoice__stay-grid">
            <div>
              <span class="invoice__stay-label">Habitación</span>
              <span>${res.room.getTypeLabel()} — Hab. ${res.room.number}</span>
            </div>
            <div>
              <span class="invoice__stay-label">Llegada</span>
              <span>${new Date(res.checkInDate).toLocaleDateString('es-CO')}</span>
            </div>
            <div>
              <span class="invoice__stay-label">Salida</span>
              <span>${new Date(res.checkOutDate).toLocaleDateString('es-CO')}</span>
            </div>
            <div>
              <span class="invoice__stay-label">Noches</span>
              <span>${res.getNights()}</span>
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <div class="invoice__items">
          <h4>Detalle de Cargos</h4>
          <table class="invoice__table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${inv.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>$${item.amount.toLocaleString('es-CO')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="invoice__totals">
          <div class="invoice__total-row">
            <span>Subtotal</span>
            <span>${inv.getFormattedSubtotal()}</span>
          </div>
          <div class="invoice__total-row">
            <span>IVA (19%)</span>
            <span>${inv.getFormattedTaxes()}</span>
          </div>
          <div class="invoice__total-row invoice__total-row--grand">
            <span>TOTAL</span>
            <span>${inv.getFormattedTotal()}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="invoice__footer">
          <p>Gracias por hospedarse en Hotel Dorado</p>
          <p class="invoice__footer-note">Esta factura fue generada automáticamente por el sistema.</p>
        </div>

        <button class="btn btn--primary btn--lg" id="print-invoice" style="margin-top: var(--space-xl);">
          Imprimir Factura
        </button>

        <button class="btn btn--ghost btn--lg" id="new-reservation" style="margin-top: var(--space-md); display: block;">
          Nueva Reserva
        </button>
      </div>
    `;

    document.getElementById('print-invoice').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('new-reservation').addEventListener('click', () => {
      window._currentReservation = null;
      window._selectedRoom = null;
      window._searchDates = null;
      window._priceInfo = null;
      window.location.hash = '#/';
    });
  }
}
