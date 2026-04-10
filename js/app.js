class App {
  constructor() {
    this.router = new Router();
    this.navbar = new Navbar('navbar');
  }

  init() {
    // Render the navigation bar
    this.navbar.render();

    // Create page instances
    const searchPage = new SearchPage('app');
    const roomSelectionPage = new RoomSelectionPage('app');
    const reservationFormPage = new ReservationFormPage('app');
    const reservationPanelPage = new ReservationPanelPage('app');
    const invoicePage = new InvoicePage('app');

    // Register routes
    this.router.addRoute('#/', searchPage);
    this.router.addRoute('#/rooms', roomSelectionPage);
    this.router.addRoute('#/reserve', reservationFormPage);
    this.router.addRoute('#/panel', reservationPanelPage);
    this.router.addRoute('#/invoice', invoicePage);

    // Update navbar highlight on route change
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.split('?')[0] || '#/';
      this.navbar.setActiveRoute(hash);
    });

    // Start router
    this.router.init();

    console.log('Hotel Dorado - Sistema de Reservas initialised');
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
