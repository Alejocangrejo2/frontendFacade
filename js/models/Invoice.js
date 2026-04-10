class Invoice {

  constructor(data = {}) {
    this.invoiceNumber = data.invoiceNumber || '';
    this.reservationId = data.reservationId || '';
    this.guestName = data.guestName || '';
    this.guestEmail = data.guestEmail || '';
    this.roomNumber = data.roomNumber || 0;
    this.roomType = data.roomType || '';
    this.nights = data.nights || 0;
    this.baseRoomCost = data.baseRoomCost || 0;
    this.seasonMultiplier = data.seasonMultiplier || 1.0;
    this.seasonLabel = data.seasonLabel || 'LOW';
    this.roomTotal = data.roomTotal || 0;
    this.services = (data.services || []).map(s => new HotelService(s));
    this.servicesTotal = data.servicesTotal || 0;
    this.grandTotal = data.grandTotal || 0;
    this.issuedAt = data.issuedAt || new Date().toISOString();
  }

  getFormattedTotal() {
    return `$${this.grandTotal.toLocaleString('es-CO')}`;
  }

  getFormattedRoomTotal() {
    return `$${this.roomTotal.toLocaleString('es-CO')}`;
  }

  getFormattedServicesTotal() {
    return `$${this.servicesTotal.toLocaleString('es-CO')}`;
  }

  getFormattedDate() {
    return new Date(this.issuedAt).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getSeasonLabelES() {
    return this.seasonLabel === 'HIGH' ? 'Temporada Alta' : 'Temporada Baja';
  }

  getRoomTypeLabel() {
    const labels = { 'SINGLE': 'Sencilla', 'DOUBLE': 'Doble', 'SUITE': 'Suite' };
    return labels[this.roomType] || this.roomType;
  }
}
