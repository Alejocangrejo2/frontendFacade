class HotelService {

  constructor(data = {}) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.category = data.category || '';
    this.description = data.description || '';
    this.price = data.price || 0;
  }

  getFormattedPrice() {
    return `$${this.price.toLocaleString('es-CO')}`;
  }

  getCategoryIcon() {
    const icons = {
      'SPA': '',
      'RESTAURANTE': '',
      'TRANSPORTE': '',
      'HABITACION': '',
      'TOUR': '',
      'LAVANDERIA': ''
    };
    return icons[this.category] || '';
  }

  getCategoryLabel() {
    const labels = {
      'SPA': 'Spa & Bienestar',
      'RESTAURANTE': 'Restaurante',
      'TRANSPORTE': 'Transporte',
      'HABITACION': 'Servicio a la Habitación',
      'TOUR': 'Tours',
      'LAVANDERIA': 'Lavandería'
    };
    return labels[this.category] || this.category;
  }
}
