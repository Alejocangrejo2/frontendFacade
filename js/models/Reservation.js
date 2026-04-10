class Reservation {

  constructor(data = {}) {
    this.id = data.id || 0;
    this.guest = data.guest instanceof Guest ? data.guest : new Guest(data.guest || {});
    this.room = data.room instanceof Room ? data.room : new Room(data.room || {});
    this.checkInDate = data.checkInDate || '';
    this.checkOutDate = data.checkOutDate || '';
    this.status = data.status || 'PENDIENTE';
    this.services = (data.services || []).map(
      s => s instanceof HotelService ? s : new HotelService(s)
    );
    this.totalPrice = data.totalPrice || 0;
    this.digitalKey = data.digitalKey || null;
  }

  getNights() {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    const checkIn = new Date(this.checkInDate);
    const checkOut = new Date(this.checkOutDate);
    const diffMs = checkOut - checkIn;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  getStatusLabel() {
    const labels = {
      'PENDIENTE': 'Pendiente',
      'CHECK_IN': 'Check-In Realizado',
      'CHECK_OUT': 'Check-Out Realizado'
    };
    return labels[this.status] || this.status;
  }

  getStatusColor() {
    const colors = {
      'PENDIENTE': 'var(--color-warning)',
      'CHECK_IN': 'var(--color-emerald)',
      'CHECK_OUT': 'var(--color-primary)'
    };
    return colors[this.status] || 'var(--color-pearl)';
  }

  getServicesTotal() {
    return this.services.reduce((sum, s) => sum + s.price, 0);
  }
}
