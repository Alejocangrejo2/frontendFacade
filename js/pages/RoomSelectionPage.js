class RoomSelectionPage extends Page {
  constructor(containerId) {
    super(containerId);
    this.room = null;
    this.priceInfo = null;
  }

  mount() {
    if (!window._selectedRoom || !window._searchDates) {
      Toast.show('Seleccione una habitacion primero', 'error');
      window.location.hash = '#/';
      return;
    }
    this.room = window._selectedRoom;
    this._calculatePrice();
    this.render();
  }

  _calculatePrice() {
    const dates = window._searchDates;
    const ci = new Date(dates.checkIn);
    const co = new Date(dates.checkOut);
    const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));

    // Match backend TarifaService: high season = Dec, Jan, Jul, Aug
    const month = ci.getMonth();
    const isHighSeason = [0, 6, 7, 11].includes(month);
    const multiplier = isHighSeason ? 1.5 : 1.0;
    const pricePerNight = this.room.basePrice * multiplier;

    this.priceInfo = {
      pricePerNight,
      nights,
      totalPrice: pricePerNight * nights,
      isHighSeason,
      seasonLabel: isHighSeason ? 'Temporada Alta' : 'Temporada Baja',
      multiplier
    };
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <div class="container">
          <button class="btn btn--ghost btn--back" id="back-to-search">Volver a la busqueda</button>
          <h1 class="page-header__title">Detalle de Habitacion</h1>
        </div>
      </div>
      <div class="container">
        <div class="room-detail">
          <div class="room-detail__grid">
            <div class="room-detail__visual" style="background: ${this.room.getGradient()}">
              <span class="room-detail__icon">${this.room.getTypeLabel()}</span>
              <span class="room-detail__number">Habitacion ${this.room.number}</span>
            </div>
            <div class="room-detail__info">
              <h2 class="room-detail__title">${this.room.getTypeLabel()}</h2>
              <p class="room-detail__description">${this.room.description}</p>

              <div class="room-detail__meta">
                <div class="room-detail__meta-item">
                  <span>Capacidad: ${this.room.getCapacityLabel()}</span>
                </div>
                <div class="room-detail__meta-item">
                  <span>${this.priceInfo.nights} noche(s)</span>
                </div>
                <div class="room-detail__meta-item">
                  <span>${this.priceInfo.seasonLabel}</span>
                </div>
              </div>

              <div class="room-detail__amenities">
                <h4>Amenidades</h4>
                <div class="room-detail__amenities-list">
                  ${this.room.amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
                </div>
              </div>

              <div class="pricing-card">
                <div class="pricing-card__row">
                  <span>Precio base por noche</span>
                  <span>$${this.room.basePrice.toLocaleString('es-CO')}</span>
                </div>
                ${this.priceInfo.isHighSeason ? `
                <div class="pricing-card__row pricing-card__row--highlight">
                  <span>Temporada Alta (x${this.priceInfo.multiplier})</span>
                  <span>$${this.priceInfo.pricePerNight.toLocaleString('es-CO')}/noche</span>
                </div>
                ` : ''}
                <div class="pricing-card__row">
                  <span>Noches</span>
                  <span>x ${this.priceInfo.nights}</span>
                </div>
                <div class="pricing-card__divider"></div>
                <div class="pricing-card__row pricing-card__row--total">
                  <span>Total Estimado</span>
                  <span>$${this.priceInfo.totalPrice.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <button class="btn btn--primary btn--lg btn--block" id="reserve-btn">
                Reservar Esta Habitacion
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-to-search').addEventListener('click', () => {
      window.location.hash = '#/';
    });

    document.getElementById('reserve-btn').addEventListener('click', () => {
      window._priceInfo = this.priceInfo;
      window.location.hash = '#/reserve';
    });
  }
}
