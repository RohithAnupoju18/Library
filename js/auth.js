document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  function showMessage(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    element.style.background = isError ? '#ffe5e5' : '#edfdf5';
    element.style.borderColor = isError ? '#ffc7c7' : '#b7ebc5';
    element.style.color = isError ? '#8b1d1d' : '#0d6b46';
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('loginName')?.value.trim();
      const password = document.getElementById('loginPassword')?.value;
      const alertBox = document.getElementById('loginAlert');

      const savedUser = JSON.parse(localStorage.getItem('libraryUser') || 'null');

      if (!savedUser || savedUser.name !== name || savedUser.password !== password) {
        showMessage(alertBox, 'Invalid credentials. Please sign up or check your saved details.', true);
        return;
      }

      showMessage(alertBox, 'Login successful. Redirecting to your dashboard...');
      localStorage.setItem('libraryCurrentUser', JSON.stringify(savedUser));
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('signupName')?.value.trim();
      const email = document.getElementById('signupEmail')?.value.trim();
      const password = document.getElementById('signupPassword')?.value;
      const alertBox = document.getElementById('signupAlert');

      if (!name || !email || !password) {
        showMessage(alertBox, 'Please fill in all required fields.', true);
        return;
      }

      const user = { name, email, password, role: 'Student' };
      localStorage.setItem('libraryUser', JSON.stringify(user));
      localStorage.setItem('libraryCurrentUser', JSON.stringify(user));
      showMessage(alertBox, 'Registration successful. Redirecting to the login page...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 800);
    });
  }

  const dashboardUser = document.getElementById('dashboardUserName');
  if (dashboardUser) {
    const currentUser = JSON.parse(localStorage.getItem('libraryCurrentUser') || localStorage.getItem('libraryUser') || 'null');
    if (currentUser) {
      dashboardUser.textContent = currentUser.name;
    }
  }
});
