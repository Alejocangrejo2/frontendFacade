class Guest {

  constructor(data = {}) {
    this.id = data.id || 0;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.documentType = data.documentType || 'CC';
    this.documentNumber = data.documentNumber || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }


  validate() {
    const errors = [];

    if (!this.firstName.trim()) {
      errors.push('El nombre es requerido');
    }
    if (!this.lastName.trim()) {
      errors.push('El apellido es requerido');
    }
    if (!this.documentNumber.trim()) {
      errors.push('El número de documento es requerido');
    }
    if (!this.email.trim()) {
      errors.push('El correo electrónico es requerido');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('El correo electrónico no es válido');
    }
    if (!this.phone.trim()) {
      errors.push('El teléfono es requerido');
    }

    return { valid: errors.length === 0, errors };
  }

  getDocumentTypeLabel() {
    const labels = {
      'CC': 'Cédula de Ciudadanía',
      'CE': 'Cédula de Extranjería',
      'PP': 'Pasaporte',
      'TI': 'Tarjeta de Identidad'
    };
    return labels[this.documentType] || this.documentType;
  }
}
