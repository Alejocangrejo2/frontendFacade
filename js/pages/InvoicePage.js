class InvoicePage extends Page {
  constructor(containerId) {
    super(containerId);
    this.invoice = null;
  }

  mount() {
    if (!window._invoiceData) {
      Toast.show('No hay factura disponible', 'warning');
      window.location.hash = '#/panel';
      return;
    }
    this.invoice = new Invoice(window._invoiceData);
    this.render();
  }

  render() {
    const inv = this.invoice;

    this.container.innerHTML = `
      <div class="page-header">
        <div class="container">
          <button class="btn btn--ghost btn--back" id="back-to-panel">Volver al Panel</button>
          <h1 class="page-header__title">Factura</h1>
        </div>
      </div>
      <div class="container">
        <div class="invoice">
          <div class="invoice__header">
            <div class="invoice__brand">
              <span class="invoice__logo">HD</span>
              <h2>Hotel Dorado</h2>
              <p>Calle 100 #15-20, Bogota, Colombia</p>
              <p>Tel: +57 (1) 555-0100 | info@hoteldorado.com</p>
            </div>
            <div class="invoice__meta">
              <h3>FACTURA</h3>
              <p>${inv.invoiceNumber}</p>
              <p>${inv.getFormattedDate()}</p>
            </div>
          </div>

          <div class="invoice__divider"></div>

          <div class="invoice__guest">
            <h4>Datos del Huesped</h4>
            <p><strong>${inv.guestName}</strong></p>
            <p>${inv.guestEmail}</p>
          </div>

          <div class="invoice__stay">
            <h4>Datos de la Estancia</h4>
            <div class="invoice__stay-grid">
              <div>
                <span class="invoice__stay-label">Habitacion</span>
                <span>${inv.getRoomTypeLabel()} - Hab. ${inv.roomNumber}</span>
              </div>
              <div>
                <span class="invoice__stay-label">Noches</span>
                <span>${inv.nights}</span>
              </div>
              <div>
                <span class="invoice__stay-label">Temporada</span>
                <span>${inv.getSeasonLabelES()} (x${inv.seasonMultiplier})</span>
              </div>
              <div>
                <span class="invoice__stay-label">Precio Base</span>
                <span>$${inv.baseRoomCost.toLocaleString('es-CO')}/noche</span>
              </div>
            </div>
          </div>

          <div class="invoice__items">
            <h4>Detalle de Cargos</h4>
            <table class="invoice__table">
              <thead>
                <tr>
                  <th>Descripcion</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Habitacion ${inv.getRoomTypeLabel()} - ${inv.nights} noche(s) ${inv.seasonMultiplier > 1 ? `(Temp. Alta x${inv.seasonMultiplier})` : ''}</td>
                  <td>${inv.getFormattedRoomTotal()}</td>
                </tr>
                ${inv.services.map(s => `
                  <tr>
                    <td>${s.name || s.description || s.type}</td>
                    <td>$${(s.cost || s.price || 0).toLocaleString('es-CO')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="invoice__totals">
            <div class="invoice__total-row">
              <span>Habitacion</span>
              <span>${inv.getFormattedRoomTotal()}</span>
            </div>
            ${inv.servicesTotal > 0 ? `
            <div class="invoice__total-row">
              <span>Servicios</span>
              <span>${inv.getFormattedServicesTotal()}</span>
            </div>
            ` : ''}
            <div class="invoice__total-row invoice__total-row--grand">
              <span>TOTAL</span>
              <span>${inv.getFormattedTotal()}</span>
            </div>
          </div>

          <div class="invoice__footer">
            <p>Gracias por hospedarse en Hotel Dorado</p>
            <p class="invoice__footer-note">Esta factura fue generada automaticamente por el sistema.</p>
          </div>

          <button class="btn btn--primary btn--lg" id="print-invoice" style="margin-top: var(--space-xl);">
            Imprimir Factura
          </button>
          <button class="btn btn--ghost btn--lg" id="new-reservation" style="margin-top: var(--space-md); display: block;">
            Nueva Reserva
          </button>
        </div>
      </div>
    `;

    document.getElementById('back-to-panel').addEventListener('click', () => {
      window.location.hash = '#/panel';
    });

    document.getElementById('print-invoice').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('new-reservation').addEventListener('click', () => {
      window._currentReservation = null;
      window._selectedRoom = null;
      window._searchDates = null;
      window._priceInfo = null;
      window._invoiceData = null;
      window.location.hash = '#/';
    });
  }
}
