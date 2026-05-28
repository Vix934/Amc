# American Home Cinemas

A modern, responsive website for **American Home Cinemas** — a company specializing in home theater installations, smart home automation, security systems, and more.

## Pages

- **Home** (`index.html`) — Company overview with stats, key features, and service preview
- **Services** (`services.html`) — Full list of services and authorized reseller brands
- **Gallery** (`gallery.html`) — Project portfolio with a "Most Recent Project" section that can pull from social media
- **Testimonials** (`testimonials.html`) — 5-star Google reviews from satisfied customers
- **Admin Dashboard** (`/admin`) — Manage gallery photos, testimonials, contact info, and site settings

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Node.js + Express backend
- SQLite (better-sqlite3) database
- Responsive design (mobile, tablet, desktop)
- CSS Custom Properties for consistent theming
- American flag color scheme (navy blue, red, white)

## Features

- American flag color scheme with navy blue, red, and white
- Fully responsive navigation with mobile hamburger menu
- Admin dashboard with login authentication
- Gallery photo management (upload, reorder, feature)
- Testimonial management (add, edit, toggle visibility)
- Contact info and site settings management
- Animated counters and scroll-triggered fade-in effects
- Image lightbox for gallery photos

## Running Locally

```bash
npm install
node server.js
```

The site runs at `http://localhost:3000`. The SQLite database auto-initializes at `data/ahc.db`.

**Default admin login:** `admin` / `admin123` at `/auth/login`

## Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up / log in
2. Click **New Project > Deploy from GitHub Repo**
3. Connect your GitHub repo (`Vix934/Amc`)
4. Railway auto-detects the Node.js app and `railway.toml` config
5. Add environment variables in the **Variables** tab:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = (click **Generate** or type a random string)
6. Click **Deploy** — your site goes live with a `.up.railway.app` URL

### Adding Your Custom Domain

Once your site is live on Railway:

1. Go to your service's **Settings** tab
2. Click **Custom Domain** under **Networking**
3. Enter your domain (e.g., `americanhomecinemas.com`)
4. Railway will give you a **CNAME record** to add at your domain registrar:
   - Point your domain (or `www` subdomain) to the provided Railway CNAME
   - For root domains, use your registrar's CNAME flattening or ALIAS record if supported
5. Railway automatically provisions a free SSL certificate

### Important Notes for Production

- **Change the admin password** immediately after first login — the default is `admin123`
- **Persistent storage:** Railway provides a persistent volume. To attach one:
  1. Go to your service in Railway dashboard
  2. Click **+ New** > **Volume**
  3. Set the mount path to `/app/data` (for the SQLite database)
  4. Optionally add another volume at `/app/uploads` for gallery photos
- **Session secret** should be set as an environment variable in Railway's Variables tab
- Without a volume, the database and uploads reset on each deploy

## Authorized Reseller Brands

Denon, Ecobee, Eero, Flexon, Google, JVC, KEF, Klipsch, LG, Lutron, Marantz, Nest, Ring, Samsung, Sanus, Sonance, Sonos, Sony, Sunbrite, Tru Audio, Ubiquiti, URC, Western Digital, Yamaha

## Customization

- **Colors**: Edit CSS custom properties in `css/styles.css` under `:root`
- **Content**: Update HTML files directly or use the admin dashboard
- **Images**: Upload via admin dashboard at `/admin`
- **Social Media**: Connect Instagram/Facebook API for the "Most Recent Project" feature on the gallery page
- **Contact Info**: Manage through admin dashboard at `/admin`
