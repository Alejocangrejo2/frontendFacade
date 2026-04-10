class SearchPage extends Page {
  constructor(containerId) {
    super(containerId);
    this.api = ApiService.getInstance();
    this.rooms = [];
  }

  render() {
    this.container.innerHTML = `
      <!-- Hero Banner -->
      <section class="hero" id="hero-section">
        <div class="hero__overlay"></div>
        <div class="hero__content">
          <h1 class="hero__title">Bienvenido a <span class="text-gold">Hotel Dorado</span></h1>
          <p class="hero__subtitle">Descubra el lujo y la comodidad que merece. Reserve su habitación ideal para una experiencia inolvidable.</p>
        </div>
      </section>

      <!-- Search Box -->
      <section class="search-section" id="search-section">
        <div class="container">
          <div class="search-box">
            <h2 class="search-box__title">Buscar Habitaciones Disponibles</h2>
            <form class="search-form" id="search-form">
              <div class="search-form__group">
                <label class="form-label" for="check-in-date">Fecha de Llegada</label>
                <input type="date" class="form-input" id="check-in-date" required>
              </div>
              <div class="search-form__group">
                <label class="form-label" for="check-out-date">Fecha de Salida</label>
                <input type="date" class="form-input" id="check-out-date" required>
              </div>
              <button type="submit" class="btn btn--primary btn--lg search-form__btn" id="search-btn">
                Buscar Disponibilidad
              </button>
            </form>
          </div>
        </div>
      </section>

      <!-- Results Grid -->
      <section class="rooms-section" id="rooms-section" style="display: none;">
        <div class="container">
          <h2 class="section-title">Habitaciones Disponibles</h2>
          <p class="section-subtitle" id="rooms-info"></p>
          <div class="rooms-grid" id="rooms-grid"></div>
        </div>
      </section>
    `;

    this._setupEventListeners();
    this._setMinDates();
  }

  _setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('check-in-date').min = today;
    document.getElementById('check-out-date').min = today;
  }

  _setupEventListeners() {
    const form = document.getElementById('search-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._searchRooms();
    });

    // Auto-update check-out min when check-in changes
    document.getElementById('check-in-date').addEventListener('change', (e) => {
      const checkOutInput = document.getElementById('check-out-date');
      checkOutInput.min = e.target.value;
      if (checkOutInput.value && checkOutInput.value <= e.target.value) {
        checkOutInput.value = '';
      }
    });
  }

  async _searchRooms() {
    const checkIn = document.getElementById('check-in-date').value;
    const checkOut = document.getElementById('check-out-date').value;

    if (!checkIn || !checkOut) {
      Toast.show('Por favor seleccione ambas fechas', 'warning');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      Toast.show('La fecha de salida debe ser posterior a la de llegada', 'warning');
      return;
    }

    const btn = document.getElementById('search-btn');
    btn.innerHTML = '<span class="spinner"></span> Buscando...';
    btn.disabled = true;

    try {
      const data = await this.api.get(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
      this.rooms = data.map(r => new Room(r));

      // Store dates globally for later pages
      window._searchDates = { checkIn, checkOut };

      this._renderRooms();
      Toast.show(`Se encontraron ${this.rooms.length} habitaciones disponibles`, 'success');
    } catch (error) {
      Toast.show('Error al buscar habitaciones', 'error');
    } finally {
      btn.innerHTML = 'Buscar Disponibilidad';
      btn.disabled = false;
    }
  }

  _renderRooms() {
    const section = document.getElementById('rooms-section');
    const grid = document.getElementById('rooms-grid');
    const info = document.getElementById('rooms-info');

    section.style.display = 'block';

    const checkIn = document.getElementById('check-in-date').value;
    const checkOut = document.getElementById('check-out-date').value;
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

    info.textContent = `${this.rooms.length} habitaciones para ${nights} noche(s) — ` +
      `${new Date(checkIn).toLocaleDateString('es-CO')} al ${new Date(checkOut).toLocaleDateString('es-CO')}`;

    grid.innerHTML = '';
    this.rooms.forEach(room => {
      const card = new RoomCard(room, (selectedRoom) => {
        window._selectedRoom = selectedRoom;
        window.location.hash = `#/rooms?id=${selectedRoom.id}`;
      });
      grid.appendChild(card.render());
    });

    // Scroll to results
    section.scrollIntoView({ behavior: 'smooth' });
  }
}
