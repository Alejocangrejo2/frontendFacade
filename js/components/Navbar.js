class Navbar {

  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.activeRoute = '#/';
  }

  render() {
    this.container.innerHTML = `
      <div class="navbar">
        <a href="#/" class="navbar__brand">
          <span class="navbar__logo">Hotel</span>
          <span class="navbar__name">Dorado</span>
        </a>
        <div class="navbar__links" id="navbar-links">
          <a href="#/" class="navbar__link ${this.activeRoute === '#/' ? 'navbar__link--active' : ''}" data-route="#/">
            <span class="navbar__link-icon">Inicio</span>
          </a>
          <a href="#/panel" class="navbar__link ${this.activeRoute === '#/panel' ? 'navbar__link--active' : ''}" data-route="#/panel">
            <span class="navbar__link-icon">Mi Reserva</span>
          </a>
        </div>
        <button class="navbar__toggle" id="navbar-toggle" aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
      </div>
    `;

    this._attachMobileToggle();
  }

  setActiveRoute(route) {
    this.activeRoute = route;
    this.render();
  }

  _attachMobileToggle() {
    const toggle = this.container.querySelector('#navbar-toggle');
    const links = this.container.querySelector('#navbar-links');

    toggle.addEventListener('click', () => {
      links.classList.toggle('navbar__links--open');
      toggle.classList.toggle('navbar__toggle--active');
    });

    // Close mobile menu when a link is clicked
    links.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('navbar__links--open');
        toggle.classList.remove('navbar__toggle--active');
      });
    });
  }
}
