class Page {

  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    // Abstract — implemented by subclasses
  }

  mount() {
    this.render();
  }

  unmount() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

class Router {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
    this.currentRoute = '';
  }

  addRoute(path, page) {
    this.routes.set(path, page);
  }

  navigate(path) {
    window.location.hash = path;
  }

  handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.split('?')[0]; // Strip query params

    // Unmount previous page
    if (this.currentPage) {
      this.currentPage.unmount();
    }

    // Find and mount the matching page
    const page = this.routes.get(path);
    if (page) {
      this.currentPage = page;
      this.currentRoute = path;
      page.mount();
    } else {
      // Fallback to home
      const defaultPage = this.routes.get('#/');
      if (defaultPage) {
        this.currentPage = defaultPage;
        this.currentRoute = '#/';
        defaultPage.mount();
      }
    }

    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  init() {
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
}
