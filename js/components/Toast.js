class Toast {

  static show(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || icons.info}</span>
      <span class="toast__message">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    // Auto-dismiss after 3.5s
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}
