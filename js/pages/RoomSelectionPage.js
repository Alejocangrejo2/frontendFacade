class RoomSelectionPage extends Page {
  constructor(containerId) {
    super(containerId);
    this.api = ApiService.getInstance();
    this.room = null;
    this.priceInfo = null;
  }

  async mount() {
    this.render();
    await this._loadRoomDetails();
  }

  render() {
    this.container.innerHTML = `
      <div class="page-header">
        <div class="container">
          <button class="btn btn--ghost btn--back" id="back-to-search">← Volver a la búsqueda</button>
          <h1 class="page-header__title">Detalle de Habitación</h1>
        </div>
      </div>
      <div class="container">
        <div class="room-detail" id="room-detail">
          <div class="loading-container">
            <div class="spinner spinner--lg"></div>
            <p>Cargando detalles...</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('back-to-search').addEventListener('click', () => {
      window.location.hash = '#/';
    });
  }

  async _loadRoomDetails() {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const roomId = params.get('id');
    const dates = window._searchDates;

    if (!roomId || !dates) {
      Toast.show('No se encontró la habitación seleccionada', 'error');
      window.location.hash = '#/';
      return;
    }

    try {
      const [roomData, priceData] = await Promise.all([
        this.api.get(`/rooms/${roomId}`),
        this.api.get(`/rooms/${roomId}/price?checkIn=${dates.checkIn}&checkOut=${dates.checkOut}`)
      ]);

      this.room = new Room(roomData);
      this.priceInfo = priceData;
      this._renderDetail();
    } catch (error) {
      Toast.show('Error al cargar los detalles de la habitación', 'error');
    }
  }

  _renderDetail() {
    const detail = document.getElementById('room-detail');

    detail.innerHTML = `
      <div class="room-detail__grid">
        <div class="room-detail__visual" style="background: ${this.room.getGradient()}">
          <span class="room-detail__icon">${this.room.getTypeIcon()}</span>
          <span class="room-detail__number">Habitación ${this.room.number}</span>
        </div>
        <div class="room-detail__info">
          <h2 class="room-detail__title">${this.room.getTypeLabel()}</h2>
          <p class="room-detail__description">${this.room.description}</p>

          <div class="room-detail__meta">
            <div class="room-detail__meta-item">
              <span class="room-detail__meta-icon">Cap.</span>
              <span>Capacidad: ${this.room.getCapacityLabel()}</span>
            </div>
            <div class="room-detail__meta-item">
              <span class="room-detail__meta-icon">Noches</span>
              <span>${this.priceInfo.nights} noche(s)</span>
            </div>
            <div class="room-detail__meta-item">
              <span class="room-detail__meta-icon">Temp.</span>
              <span>${this.priceInfo.seasonLabel}</span>
            </div>
          </div>

          <div class="room-detail__amenities">
            <h4>Amenidades</h4>
            <div class="room-detail__amenities-list">
              ${this.room.amenities.map(a => `<span class="amenity-tag">✓ ${a}</span>`).join('')}
            </div>
          </div>

          <div class="room-detail__pricing">
            <div class="pricing-card">
              <div class="pricing-card__row">
                <span>Precio por noche</span>
                <span>$${this.priceInfo.pricePerNight.toLocaleString('es-CO')}</span>
              </div>
              <div class="pricing-card__row">
                <span>Noches</span>
                <span>× ${this.priceInfo.nights}</span>
              </div>
              ${this.priceInfo.isHighSeason ? `
              <div class="pricing-card__row pricing-card__row--highlight">
                <span>Temporada Alta</span>
                <span>+30%</span>
              </div>
              ` : ''}
              <div class="pricing-card__divider"></div>
              <div class="pricing-card__row pricing-card__row--total">
                <span>Total Estimado</span>
                <span>$${this.priceInfo.totalPrice.toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          <button class="btn btn--primary btn--lg btn--block" id="reserve-btn">
            Reservar Esta Habitación →
          </button>
        </div>
      </div>
    `;

    document.getElementById('reserve-btn').addEventListener('click', () => {
      window._selectedRoom = this.room;
      window._priceInfo = this.priceInfo;
      window.location.hash = '#/reserve';
    });
  }
}
