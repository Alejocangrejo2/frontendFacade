class Guest {

  constructor(data = {}) {
    this.name = data.name || data.guestName || '';
    this.email = data.email || data.guestEmail || '';
    this.phone = data.phone || data.guestPhone || '';
  }

  getFullName() {
    return this.name.trim();
  }

  validate() {
    const errors = [];

    if (!this.name.trim()) {
      errors.push('El nombre es requerido');
    }
    if (!this.email.trim()) {
      errors.push('El correo electronico es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('El correo electronico no es valido');
    }
    if (!this.phone.trim()) {
      errors.push('El telefono es requerido');
    }

    return { valid: errors.length === 0, errors };
  }
}
