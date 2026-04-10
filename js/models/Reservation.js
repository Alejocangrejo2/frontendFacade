class Reservation {

  constructor(data = {}) {
    this.id = data.id || '';
    this.guestName = data.guestName || '';
    this.guestEmail = data.guestEmail || '';
    this.guestPhone = data.guestPhone || '';
    this.room = data.room ? new Room(data.room) : new Room();
    this.checkInDate = data.checkInDate || '';
    this.checkOutDate = data.checkOutDate || '';
    this.nights = data.nights || this._calcNights();
    this.status = data.status || 'CONFIRMED';
    this.digitalKey = data.digitalKey || null;
    this.estimatedTotal = data.estimatedTotal || 0;
    this.services = data.services || [];
  }

  _calcNights() {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const ci = new Date(this.checkInDate);
    const co = new Date(this.checkOutDate);
    return Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
  }

  getNights() {
    return this.nights || this._calcNights();
  }

  getStatusLabel() {
    const labels = {
      'CONFIRMED': 'Confirmada',
      'CHECKED_IN': 'Check-In Realizado',
      'CHECKED_OUT': 'Check-Out Realizado',
      'CANCELLED': 'Cancelada'
    };
    return labels[this.status] || this.status;
  }

  getStatusColor() {
    const colors = {
      'CONFIRMED': 'var(--color-warning)',
      'CHECKED_IN': 'var(--color-emerald)',
      'CHECKED_OUT': 'var(--color-primary)',
      'CANCELLED': '#ef4444'
    };
    return colors[this.status] || 'var(--color-pearl)';
  }

  getServicesTotal() {
    return this.services.reduce((sum, s) => sum + (s.cost || s.price || 0), 0);
  }
}
