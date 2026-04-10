class Room {

  constructor(data = {}) {
    this.id = data.id || data.number || 0;
    this.number = data.number || data.id || 0;
    this.type = data.type || 'SINGLE';
    this.basePrice = data.basePrice || data.pricePerNight || 0;
    this.pricePerNight = data.basePrice || data.pricePerNight || 0;
    this.status = data.status || 'AVAILABLE';
    this.capacity = data.capacity || this._defaultCapacity();
    this.amenities = data.amenities || this._defaultAmenities();
    this.available = data.available !== undefined ? data.available : (this.status === 'AVAILABLE');
    this.description = data.description || this._defaultDescription();
  }

  _defaultCapacity() {
    const caps = { 'SINGLE': 1, 'DOUBLE': 2, 'SUITE': 4 };
    return caps[this.type] || 2;
  }

  _defaultAmenities() {
    const amenities = {
      'SINGLE': ['Wi-Fi', 'TV 42"', 'Escritorio'],
      'DOUBLE': ['Wi-Fi', 'TV 50"', 'Mini Bar', 'Balcon'],
      'SUITE': ['Wi-Fi', 'TV 55"', 'Mini Bar', 'Jacuzzi', 'Sala de Estar', 'Vista Panoramica']
    };
    return amenities[this.type] || ['Wi-Fi'];
  }

  _defaultDescription() {
    const descriptions = {
      'SINGLE': 'Habitacion comoda y funcional, ideal para viajeros de negocios.',
      'DOUBLE': 'Habitacion doble con decoracion moderna y todas las comodidades.',
      'SUITE': 'Nuestra suite mas exclusiva con vista panoramica y jacuzzi privado.'
    };
    return descriptions[this.type] || '';
  }

  getFormattedPrice() {
    return `$${this.basePrice.toLocaleString('es-CO')}`;
  }

  getTypeLabel() {
    const labels = { 'SINGLE': 'Sencilla', 'DOUBLE': 'Doble', 'SUITE': 'Suite' };
    return labels[this.type] || this.type;
  }

  getTypeIcon() {
    return '';
  }

  getGradient() {
    const gradients = {
      'SUITE': 'linear-gradient(135deg, #C8A96E 0%, #A68B4B 100%)',
      'DOUBLE': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      'SINGLE': 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)'
    };
    return gradients[this.type] || gradients['SINGLE'];
  }

  getCapacityLabel() {
    return this.capacity === 1 ? '1 huesped' : `${this.capacity} huespedes`;
  }

  getStatusLabel() {
    const labels = { 'AVAILABLE': 'Disponible', 'RESERVED': 'Reservada', 'OCCUPIED': 'Ocupada' };
    return labels[this.status] || this.status;
  }
}
