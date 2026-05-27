// Loads dynamic content from the API into frontend pages
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Promise.all([
      loadSettings(),
      loadDynamicGallery(),
      loadDynamicTestimonials(),
      loadDynamicContact()
    ]);
  } catch (e) {
    // API not available (static file mode) — use default HTML content
  }
});

async function loadSettings() {
  const res = await fetch('/api/settings');
  if (!res.ok) return;
  const s = await res.json();

  // Hero section
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle && s.hero_title) heroTitle.innerHTML = s.hero_title;

  const heroSubtitle = document.querySelector('.hero__subtitle');
  if (heroSubtitle && s.hero_subtitle) heroSubtitle.textContent = s.hero_subtitle;

  const heroBadge = document.querySelector('.hero__badge');
  if (heroBadge && s.hero_badge) {
    const svg = heroBadge.querySelector('svg');
    heroBadge.textContent = '';
    if (svg) heroBadge.appendChild(svg);
    heroBadge.appendChild(document.createTextNode(' ' + s.hero_badge));
  }

  // Stats
  const statMap = { stat_projects: 0, stat_brands: 1, stat_years: 2, stat_rating: 3 };
  const statItems = document.querySelectorAll('.stats__item h3[data-count]');
  Object.entries(statMap).forEach(([key, idx]) => {
    if (s[key] && statItems[idx]) {
      statItems[idx].dataset.count = s[key];
    }
  });

  // Social links
  const socialLinks = document.querySelectorAll('.footer__social a');
  if (s.facebook_url && socialLinks[0]) socialLinks[0].href = s.facebook_url;
  if (s.instagram_url && socialLinks[1]) socialLinks[1].href = s.instagram_url;
  if (s.youtube_url && socialLinks[2]) socialLinks[2].href = s.youtube_url;
}

async function loadDynamicGallery() {
  const grid = document.querySelector('.gallery__grid');
  if (!grid) return;

  const res = await fetch('/api/gallery');
  if (!res.ok) return;
  const photos = await res.json();
  if (photos.length === 0) return;

  // Featured photo for "Most Recent Project"
  const featured = photos.find(p => p.is_featured) || photos[0];
  const recentImage = document.getElementById('recent-work-image');
  if (recentImage && featured) {
    recentImage.innerHTML = `<img src="/uploads/${featured.filename}" alt="${featured.caption || 'Recent project'}" style="width:100%;height:100%;object-fit:cover;">`;
    const titleEl = document.getElementById('recent-work-title');
    if (titleEl && featured.caption) titleEl.textContent = featured.caption;
  }

  // Gallery grid
  grid.innerHTML = photos.map(p => `
    <div class="gallery__item fade-in fade-in--visible">
      <img src="/uploads/${p.filename}" alt="${p.caption || p.original_name}" loading="lazy">
      <div class="gallery__item-overlay">
        <p>${p.caption || p.category}</p>
      </div>
    </div>
  `).join('');

  // Re-attach lightbox listeners
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (lightbox && lightboxImg) {
    grid.querySelectorAll('.gallery__item img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('lightbox--active');
        document.body.style.overflow = 'hidden';
      });
    });
  }
}

async function loadDynamicTestimonials() {
  const grid = document.querySelector('.testimonials__grid');
  if (!grid) return;

  const res = await fetch('/api/testimonials');
  if (!res.ok) return;
  const testimonials = await res.json();
  if (testimonials.length === 0) return;

  const googleSvg = '<svg viewBox="0 0 24 24" fill="#4285F4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>';

  grid.innerHTML = testimonials.map(t => `
    <div class="testimonial-card fade-in fade-in--visible">
      <div class="testimonial-card__stars">
        ${'<span class="testimonial-card__star">&#9733;</span>'.repeat(t.rating)}
      </div>
      <p class="testimonial-card__text">"${t.text}"</p>
      <div class="testimonial-card__author">
        <div class="testimonial-card__avatar">${t.author_initials}</div>
        <div>
          <div class="testimonial-card__name">${t.author_name}</div>
          <div class="testimonial-card__source">${googleSvg} ${t.source}</div>
        </div>
      </div>
    </div>
  `).join('');
}

async function loadDynamicContact() {
  const res = await fetch('/api/contact');
  if (!res.ok) return;
  const contacts = await res.json();
  if (contacts.length === 0) return;

  // Update footer contact section
  const contactCols = document.querySelectorAll('.footer__col');
  const contactCol = contactCols[contactCols.length - 1];
  if (!contactCol) return;

  const ul = contactCol.querySelector('ul');
  if (!ul) return;

  ul.innerHTML = contacts.map(c => {
    if (c.type === 'phone') {
      return `<li><a href="tel:${c.value}">${c.value}</a></li>`;
    } else if (c.type === 'email') {
      return `<li><a href="mailto:${c.value}">${c.value}</a></li>`;
    } else {
      return `<li>${c.value}</li>`;
    }
  }).join('');

  // Update CTA phone links and nav CTA
  const phones = contacts.filter(c => c.type === 'phone');
  if (phones.length > 0) {
    const phone = phones[0].value;
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = `tel:${phone}`;
      if (a.classList.contains('nav__cta')) {
        a.textContent = 'Call Us';
      }
    });
  }
}
