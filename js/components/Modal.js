class Modal {

  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.element = null;
    this.onClose = null;
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'modal-overlay';
    this.element.innerHTML = `
      <div class="modal">
        <div class="modal__header">
          <h3 class="modal__title">${this.title}</h3>
          <button class="modal__close" id="modal-close-btn">&times;</button>
        </div>
        <div class="modal__body">
          ${this.content}
        </div>
      </div>
    `;
    return this.element;
  }

  open() {
    const container = document.getElementById('modal-container');
    container.appendChild(this.render());

    // Trigger fade-in
    requestAnimationFrame(() => this.element.classList.add('modal-overlay--visible'));

    // Close button
    this.element.querySelector('#modal-close-btn').addEventListener('click', () => this.close());

    // Click outside to close
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.close();
    });
  }

  close() {
    this.element.classList.remove('modal-overlay--visible');
    setTimeout(() => {
      this.element.remove();
      if (this.onClose) this.onClose();
    }, 300);
  }
}
