class HotelService {

  constructor(data = {}) {
    this.id = data.id || data.type || '';
    this.type = data.type || '';
    this.name = data.name || data.description || this._defaultName();
    this.description = data.description || this._defaultDesc();
    this.price = data.price || data.cost || this._defaultPrice();
    this.cost = data.cost || data.price || this._defaultPrice();
  }

  _defaultName() {
    const names = { 'SPA': 'Sesion de Spa', 'BREAKFAST': 'Desayuno', 'TRANSPORT': 'Transfer Aeropuerto' };
    return names[this.type] || this.type;
  }

  _defaultDesc() {
    const descs = {
      'SPA': 'Sesion completa de spa y relajacion.',
      'BREAKFAST': 'Desayuno buffet completo (por dia).',
      'TRANSPORT': 'Servicio de transporte privado al aeropuerto.'
    };
    return descs[this.type] || '';
  }

  _defaultPrice() {
    const prices = { 'SPA': 50.0, 'BREAKFAST': 15.0, 'TRANSPORT': 30.0 };
    return prices[this.type] || 0;
  }

  getFormattedPrice() {
    return `$${this.price.toLocaleString('es-CO')}`;
  }

  getCategoryIcon() {
    return '';
  }

  getCategoryLabel() {
    const labels = { 'SPA': 'Spa & Bienestar', 'BREAKFAST': 'Restaurante', 'TRANSPORT': 'Transporte' };
    return labels[this.type] || this.type;
  }
}
