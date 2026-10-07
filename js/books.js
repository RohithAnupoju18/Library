async function fetchBooks() {
  const response = await fetch('/api/books');
  return response.json();
}

function renderBookCard(book) {
  const statusClass = book.availability === 'Available' ? 'available' : 'checked-out';
  return `
    <article class="book-card">
      <img class="cover" src="${book.cover}" alt="${book.title}">
      <div class="book-body">
        <div class="book-meta">
          <span class="tag">${book.category}</span>
          ${book.suggestedSemesterLabel ? `<span class="tag">${book.suggestedSemesterLabel}</span>` : ''}
          <span class="status-pill ${statusClass}">${book.availability}</span>
        </div>
        <h4>${book.title}</h4>
        <p class="mini-meta">
          <span>${book.author}</span>
          <span>•</span>
          <span>${book.publicationYear}</span>
        </p>
        <div class="card-actions">
          <a href="book-details.html?id=${book.id}" class="btn btn-primary">View Details</a>
        </div>
      </div>
    </article>
  `;
}

function getBooksByPageType(books, type) {
  if (type === 'featured') return books.filter(book => book.featured);
  if (type === 'new') return books.filter(book => book.newArrival);
  if (type === 'popular') return books.filter(book => book.availability === 'Available').slice(0, 4);
  return books;
}

function setHomeCards() {
  const featuredContainer = document.getElementById('featuredBooks');
  const newContainer = document.getElementById('newArrivals');
  const popularContainer = document.getElementById('popularResources');

  if (!featuredContainer && !newContainer && !popularContainer) return;

  fetchBooks().then(books => {
    if (featuredContainer) {
      featuredContainer.innerHTML = getBooksByPageType(books, 'featured').map(renderBookCard).join('');
    }
    if (newContainer) {
      newContainer.innerHTML = getBooksByPageType(books, 'new').map(renderBookCard).join('');
    }
    if (popularContainer) {
      popularContainer.innerHTML = getBooksByPageType(books, 'popular').map(renderBookCard).join('');
    }
  }).catch(() => {
    if (featuredContainer) featuredContainer.innerHTML = '<p>Unable to load featured books right now.</p>';
  });
}

function renderResults(books) {
  const resultsContainer = document.getElementById('bookResults');
  const resultsCount = document.getElementById('resultsCount');

  if (!resultsContainer) return;

  if (!books.length) {
    resultsContainer.innerHTML = '<div class="card-summary"><p>No books matched your search. Try different keywords or filters.</p></div>';
    if (resultsCount) resultsCount.textContent = '0 results';
    return;
  }

  resultsContainer.innerHTML = books.map(renderBookCard).join('');
  if (resultsCount) resultsCount.textContent = `${books.length} result${books.length > 1 ? 's' : ''}`;
}

const btechSemesterSuggestions = {
  1: [7, 8],
  2: [7, 8, 9, 12],
  3: [11, 13, 14, 15],
  4: [3, 4, 13],
  5: [5, 6, 16, 17, 18],
  6: [1, 2, 6, 10],
  7: [1, 2, 10],
  8: [2]
};

async function loadBtechPage() {
  const searchForm = document.getElementById('btechSearchForm');
  const searchInput = document.getElementById('btechSearchInput');
  const subjectFilter = document.getElementById('btechSubjectFilter');
  const semesterFilter = document.getElementById('btechSemesterFilter');
  const availabilityFilter = document.getElementById('btechAvailabilityFilter');
  const resultsContainer = document.getElementById('btechBookResults');
  const resultsCount = document.getElementById('btechResultsCount');

  try {
    const books = await fetchBooks();
    const semesterForBook = new Map();
    Object.entries(btechSemesterSuggestions).forEach(([semester, bookIds]) => {
      bookIds.forEach(id => {
        const semesters = semesterForBook.get(id) || [];
        semesters.push(semester);
        semesterForBook.set(id, semesters);
      });
    });
    const engineeringBooks = books
      .filter(book => semesterForBook.has(Number(book.id)))
      .map(book => ({
        ...book,
        suggestedSemesters: semesterForBook.get(Number(book.id)),
        suggestedSemesterLabel: `Suggested: Sem ${semesterForBook.get(Number(book.id)).join(', ')}`
      }));

    const subjects = [...new Set(engineeringBooks.map(book => book.subject))].sort();
    subjectFilter.innerHTML = '<option value="all">All Subjects</option>' + subjects
      .map(subject => `<option value="${subject}">${subject}</option>`)
      .join('');

    const updateResults = () => {
      const query = searchInput.value.trim().toLowerCase();
      const subject = subjectFilter.value;
      const semester = semesterFilter.value;
      const availability = availabilityFilter.value;
      const filtered = engineeringBooks.filter(book => {
        const searchable = [book.title, book.author, book.subject, book.category, ...(book.keywords || []), ...(book.topics || [])]
          .join(' ').toLowerCase();
        return (!query || searchable.includes(query))
          && (subject === 'all' || book.subject === subject)
          && (semester === 'all' || book.suggestedSemesters.includes(semester))
          && (availability === 'all' || book.availability === availability);
      });

      resultsContainer.innerHTML = filtered.length
        ? filtered.map(renderBookCard).join('')
        : '<div class="card-summary"><p>No B.Tech references match those filters. Try another subject or search term.</p></div>';
      resultsCount.textContent = `${filtered.length} book${filtered.length === 1 ? '' : 's'}`;
    };

    [searchInput, subjectFilter, semesterFilter, availabilityFilter].forEach(filter => {
      filter.addEventListener('input', updateResults);
      filter.addEventListener('change', updateResults);
    });
    searchForm.addEventListener('submit', event => {
      event.preventDefault();
      updateResults();
    });
    updateResults();
  } catch (error) {
    resultsContainer.innerHTML = '<div class="card-summary"><p>Unable to load B.Tech books right now. Please try again later.</p></div>';
    resultsCount.textContent = 'Books unavailable';
  }
}

function applyBookFilters(books) {
  const searchTerm = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const category = document.getElementById('categoryFilter')?.value || 'all';
  const author = document.getElementById('authorFilter')?.value || 'all';
  const year = document.getElementById('yearFilter')?.value || 'all';
  const availability = document.getElementById('availabilityFilter')?.value || 'all';

  return books.filter((book) => {
    const matchesSearch = !searchTerm || [
      book.title,
      book.author,
      book.isbn,
      book.subject,
      book.category,
      ...(book.keywords || [])
    ].join(' ').toLowerCase().includes(searchTerm);

    const matchesCategory = category === 'all' || book.category === category;
    const matchesAuthor = author === 'all' || book.author === author;
    const matchesYear = year === 'all' || String(book.publicationYear) === year;
    const matchesAvailability = availability === 'all' || book.availability === availability;

    return matchesSearch && matchesCategory && matchesAuthor && matchesYear && matchesAvailability;
  });
}

async function loadBooksPage() {
  const searchForm = document.getElementById('bookSearchForm');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const authorFilter = document.getElementById('authorFilter');
  const yearFilter = document.getElementById('yearFilter');
  const availabilityFilter = document.getElementById('availabilityFilter');

  const books = await fetchBooks();

  const updateFilters = () => {
    const filtered = applyBookFilters(books);
    renderResults(filtered);
  };

  if (searchInput) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchText = urlParams.get('search');
    if (searchText) {
      searchInput.value = searchText;
    }
  }

  [categoryFilter, authorFilter, yearFilter, availabilityFilter, searchInput].forEach(el => {
    if (el) {
      el.addEventListener('input', updateFilters);
      el.addEventListener('change', updateFilters);
    }
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      updateFilters();
      const query = searchInput.value.trim();
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('search', query);
      } else {
        url.searchParams.delete('search');
      }
      window.history.replaceState({}, '', url);
    });
  }

  const categories = [...new Set(books.map(book => book.category))];
  const authors = [...new Set(books.map(book => book.author))];
  const years = [...new Set(books.map(book => String(book.publicationYear)))].sort((a, b) => Number(b) - Number(a));

  if (categoryFilter) {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>' + categories.map(category => `<option value="${category}">${category}</option>`).join('');
  }

  if (authorFilter) {
    authorFilter.innerHTML = '<option value="all">All Authors</option>' + authors.map(author => `<option value="${author}">${author}</option>`).join('');
  }

  if (yearFilter) {
    yearFilter.innerHTML = '<option value="all">All Years</option>' + years.map(year => `<option value="${year}">${year}</option>`).join('');
  }

  renderResults(applyBookFilters(books));
}

async function loadBookDetails() {
  const params = new URLSearchParams(window.location.search);
  const bookId = params.get('id');
  const container = document.getElementById('bookDetailContent');
  const reserveBtn = document.getElementById('reserveBookBtn');
  const wishlistBtn = document.getElementById('wishlistBtn');

  if (!container) return;

  try {
    const book = await fetch(`/api/books/${bookId}`).then(res => res.json());

    container.innerHTML = `
      <div class="book-detail-layout">
        <div>
          <img class="detail-cover" src="${book.cover}" alt="${book.title}">
        </div>
        <div>
          <span class="tag">${book.category}</span>
          <h1 style="margin: 16px 0 8px; font-size: clamp(2rem, 3vw, 3rem); color: var(--primary-dark);">${book.title}</h1>
          <p style="font-size: 1.1rem; color: var(--muted); margin: 0;">by ${book.author}</p>
          <div class="meta-list">
            <div><strong>ISBN</strong>${book.isbn}</div>
            <div><strong>Publisher</strong>${book.publisher}</div>
            <div><strong>Edition</strong>${book.edition}</div>
            <div><strong>Publication Year</strong>${book.publicationYear}</div>
            <div><strong>Subject</strong>${book.subject}</div>
            <div><strong>Library Location</strong>${book.location}</div>
            <div><strong>Availability</strong><span class="status-pill ${book.availability === 'Available' ? 'available' : 'checked-out'}">${book.availability}</span></div>
            <div><strong>Available Copies</strong>${book.copies}</div>
          </div>
          <p>${book.description}</p>
          <div class="detail-actions">
            <button id="reserveBookBtn" class="btn btn-primary">Reserve Book</button>
            <button id="wishlistBtn" class="btn btn-secondary">Add to Wishlist</button>
          </div>
        </div>
      </div>
    `;

    const reserveButton = document.getElementById('reserveBookBtn');
    const wishlistButton = document.getElementById('wishlistBtn');

    reserveButton.addEventListener('click', () => {
      const list = JSON.parse(localStorage.getItem('libraryReservations') || '[]');
      if (!list.some(item => item.id === book.id)) {
        list.push({ id: book.id, title: book.title, date: new Date().toLocaleDateString() });
        localStorage.setItem('libraryReservations', JSON.stringify(list));
      }
      alert(`${book.title} has been reserved successfully.`);
    });

    wishlistButton.addEventListener('click', () => {
      const wishList = JSON.parse(localStorage.getItem('libraryWishlist') || '[]');
      if (!wishList.some(item => item.id === book.id)) {
        wishList.push({ id: book.id, title: book.title });
        localStorage.setItem('libraryWishlist', JSON.stringify(wishList));
      }
      alert(`${book.title} was added to your wishlist.`);
    });
  } catch (error) {
    container.innerHTML = '<p>Unable to load this book. Please try again later.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (body.dataset.page === 'books') {
    loadBooksPage();
  }

  if (body.dataset.page === 'btech') {
    loadBtechPage();
  }

  if (body.dataset.page === 'book-details') {
    loadBookDetails();
  }

  if (body.dataset.page === 'home') {
    setHomeCards();
  }
});
