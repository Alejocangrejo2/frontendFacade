class ServiceCard {

  constructor(service, onToggle, added = false) {
    this.service = service;
    this.onToggle = onToggle;
    this.added = added;
  }

  render() {
    const card = document.createElement('div');
    card.className = `service-card ${this.added ? 'service-card--added' : ''}`;

    card.innerHTML = `
      <div class="service-card__icon">${this.service.getCategoryIcon()}</div>
      <div class="service-card__content">
        <h4 class="service-card__title">${this.service.name}</h4>
        <span class="service-card__category">${this.service.getCategoryLabel()}</span>
        <p class="service-card__description">${this.service.description}</p>
      </div>
      <div class="service-card__action">
        <span class="service-card__price">${this.service.getFormattedPrice()}</span>
        <button class="btn ${this.added ? 'btn--outline btn--danger' : 'btn--secondary'} service-card__btn"
                data-service-id="${this.service.id}">
          ${this.added ? '✕ Quitar' : '+ Agregar'}
        </button>
      </div>
    `;

    card.querySelector('.service-card__btn').addEventListener('click', () => {
      if (this.onToggle) this.onToggle(this.service, !this.added);
    });

    return card;
  }
}
