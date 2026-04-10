class RoomCard {

  constructor(room, onSelect) {
    this.room = room;
    this.onSelect = onSelect;
  }

  render() {
    const card = document.createElement('div');
    card.className = `room-card ${!this.room.available ? 'room-card--unavailable' : ''}`;

    card.innerHTML = `
      <div class="room-card__image" style="background: ${this.room.getGradient()}">
        <span class="room-card__type-icon">${this.room.getTypeIcon()}</span>
        <span class="room-card__room-number">Hab. ${this.room.number}</span>
        ${!this.room.available
          ? '<span class="room-card__badge room-card__badge--unavailable">No Disponible</span>'
          : '<span class="room-card__badge room-card__badge--available">Disponible</span>'}
      </div>
      <div class="room-card__content">
        <h3 class="room-card__title">${this.room.getTypeLabel()}</h3>
        <p class="room-card__description">${this.room.description}</p>
        <div class="room-card__amenities">
          ${this.room.amenities.slice(0, 3).map(a =>
            `<span class="room-card__amenity">${a}</span>`
          ).join('')}
          ${this.room.amenities.length > 3
            ? `<span class="room-card__amenity room-card__amenity--more">+${this.room.amenities.length - 3}</span>`
            : ''}
        </div>
        <div class="room-card__footer">
          <div class="room-card__price">
            <span class="room-card__price-value">${this.room.getFormattedPrice()}</span>
            <span class="room-card__price-label">/ noche</span>
          </div>
          <div class="room-card__capacity">
            ${this.room.getCapacityLabel()}
          </div>
        </div>
        ${this.room.available
          ? `<button class="btn btn--primary room-card__btn" data-room-id="${this.room.id}">Seleccionar</button>`
          : ''}
      </div>
    `;

    if (this.room.available) {
      card.querySelector('.room-card__btn').addEventListener('click', () => {
        if (this.onSelect) this.onSelect(this.room);
      });
    }

    return card;
  }
}
