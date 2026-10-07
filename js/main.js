document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('mobile-open');
    });
  }

  const page = document.body.dataset.page;
  if (page) {
    const links = document.querySelectorAll('.main-nav a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href === page + '.html' || (page === 'home' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  const yearNode = document.getElementById('year');
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const userBadge = document.getElementById('userBadge');
  if (userBadge) {
    const currentUser = JSON.parse(localStorage.getItem('libraryUser') || 'null');
    if (currentUser) {
      userBadge.textContent = `Hi, ${currentUser.name.split(' ')[0]}`;
    }
  }
});
