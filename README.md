# American Home Cinemas

A modern, responsive website for **American Home Cinemas** — a company specializing in home theater installations, smart home automation, security systems, and more.

## Pages

- **Home** (`index.html`) — Company overview with stats, key features, and service preview
- **Services** (`services.html`) — Full list of services and authorized reseller brands
- **Gallery** (`gallery.html`) — Project portfolio with a "Most Recent Project" section that can pull from social media
- **Testimonials** (`testimonials.html`) — 5-star Google reviews from satisfied customers

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Responsive design (mobile, tablet, desktop)
- CSS Custom Properties for consistent theming
- Intersection Observer API for scroll animations
- No build tools or dependencies required

## Features

- Dark cinema-themed design with gold accents
- Fully responsive navigation with mobile hamburger menu
- Animated counters and scroll-triggered fade-in effects
- Image lightbox for gallery photos
- Google Reviews integration on testimonials page
- Social media integration placeholder for latest project display

## Authorized Reseller Brands

Denon, Ecobee, Eero, Flexon, Google, JVC, KEF, Klipsch, LG, Lutron, Marantz, Nest, Ring, Samsung, Sanus, Sonance, Sonos, Sony, Sunbrite, Tru Audio, Ubiquiti, URC, Western Digital, Yamaha

## Running Locally

Simply open `index.html` in a browser, or use any static file server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .
```

## Customization

- **Colors**: Edit CSS custom properties in `css/styles.css` under `:root`
- **Content**: Update HTML files directly
- **Images**: Replace placeholder SVGs with actual photos in the gallery
- **Social Media**: Connect Instagram/Facebook API for the "Most Recent Project" feature on the gallery page
- **Contact Info**: Update phone numbers and email addresses across all pages
