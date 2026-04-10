class Invoice {

  constructor(data = {}) {
    this.id = data.id || 0;
    this.reservation = data.reservation instanceof Reservation
      ? data.reservation
      : new Reservation(data.reservation || {});
    this.subtotal = data.subtotal || 0;
    this.taxes = data.taxes || 0;
    this.total = data.total || 0;
    this.generatedAt = data.generatedAt || new Date().toISOString();
    this.items = data.items || [];
  }

  getFormattedTotal() {
    return `$${this.total.toLocaleString('es-CO')}`;
  }

  getFormattedSubtotal() {
    return `$${this.subtotal.toLocaleString('es-CO')}`;
  }

  getFormattedTaxes() {
    return `$${this.taxes.toLocaleString('es-CO')}`;
  }

  getFormattedDate() {
    return new Date(this.generatedAt).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
