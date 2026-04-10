class Room {

  constructor(data = {}) {
    this.id = data.id || 0;
    this.type = data.type || 'SENCILLA';
    this.number = data.number || '';
    this.pricePerNight = data.pricePerNight || 0;
    this.capacity = data.capacity || 1;
    this.amenities = data.amenities || [];
    this.available = data.available !== undefined ? data.available : true;
    this.imageUrl = data.imageUrl || '';
    this.description = data.description || '';
  }

  getFormattedPrice() {
    return `$${this.pricePerNight.toLocaleString('es-CO')}`;
  }

  getTypeLabel() {
    const labels = {
      'SENCILLA': 'Sencilla',
      'DOBLE': 'Doble',
      'SUITE': 'Suite Presidencial',
      'SUITE_JUNIOR': 'Suite Junior',
      'DOBLE_DELUXE': 'Doble Deluxe',
      'SENCILLA_SUPERIOR': 'Sencilla Superior'
    };
    return labels[this.type] || this.type;
  }

  getTypeIcon() {
    const icons = {
      'SENCILLA': '',
      'DOBLE': '',
      'SUITE': '',
      'SUITE_JUNIOR': '',
      'DOBLE_DELUXE': '',
      'SENCILLA_SUPERIOR': ''
    };
    return icons[this.type] || '';
  }

  getGradient() {
    const gradients = {
      'SUITE': 'linear-gradient(135deg, #C8A96E 0%, #A68B4B 100%)',
      'SUITE_JUNIOR': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      'DOBLE_DELUXE': 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
      'DOBLE': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      'SENCILLA': 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
      'SENCILLA_SUPERIOR': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
    };
    return gradients[this.type] || gradients['SENCILLA'];
  }

  getCapacityLabel() {
    return this.capacity === 1 ? '1 huésped' : `${this.capacity} huéspedes`;
  }
}
