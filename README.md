# SiknSux — Premium Skincare (HTML • CSS • JS)

A modern, dependency‑free skincare storefront inspired by a warm beige glassmorphism aesthetic, featuring a hero landing, product catalog, search + filters, quick view modal, cart with localStorage, checkout with validation, reviews, blog, and a dark‑mode toggle.  

## Highlights
- Zero build tools; runs on any static host.  
- Hash routing for Home, Products, About, Reviews, Blog, Cart, Checkout, and Thank‑you.  
- Persistent cart, theme, and user reviews via localStorage.  
- Accessible, responsive layout with micro‑interactions and SVG‑based visuals.  

## Tech stack
- Markup and styling: HTML, CSS (custom properties, responsive grid)  
- Interactivity: Vanilla JavaScript, SVG icons  
- State and persistence: localStorage (theme, cart, reviews, lastOrder)  
- Routing: Hash‑based navigation (#/home etc.)  

## Project structure
.
├─ index.html # App shell, header/nav, routes mount, SVG icons
├─ css/
│ └─ style.css # Theme tokens, components, modal, responsive rules
├─ js/
│ ├─ data.js # Products, categories, seeded reviews and posts
│ └─ app.js # Router, views, filters, cart, checkout, modals
└─ assets/ # Optional screenshots or images

text

## Features
- Hero section with CTA pill, social proof avatars rail, and product mockup frame.  
- Products grid with search, category filter, sort, price range, color swatches, and quick view.  
- Cart page with quantity controls, line totals, shipping logic, and tax calculation.  
- Checkout form with email and postal validation and order confirmation screen.  
- Reviews page with client‑side create and local persistence.  
- Blog list and simple post detail rendering.  
- Light/Dark theme toggle with persistence.  

## Getting started
1. Clone or download the repository.  
2. Serve the folder with any static server or open index.html directly.  
   - Examples: VS Code Live Server, Python http.server, or any static host.  
3. Navigate between routes using the top navigation or CTAs.  

## Available routes
- #/home  
- #/products  
- #/about  
- #/reviews  
- #/blog  
- #/post/:id  
- #/cart  
- #/checkout  
- #/thanks  

## Data and storage
- Products, categories, reviews, and posts are defined in js/data.js.  
- localStorage keys and purpose:  
  - theme → "light" or "dark"  
  - cart → array of { id, name, price, color, qty }  
  - reviews → array of { name, rating, text }  
  - lastOrder → snapshot for the Thank‑you page  

## Theming and customization
- Edit CSS custom properties in :root to retheme quickly (beige, amber, or cool gray).  
- Replace the hero SVG mockup with a product image by swapping the inner SVG for an <img> while keeping container styles.  
- Add products by appending to DB.products in js/data.js, including c1 and c2 for gradient thumbs.  

## Accessibility
- Semantic regions and focusable controls.  
- Sufficient contrast with both themes; verify with design tools as needed.  
- Reduced motion friendly: reveal animations are subtle and non‑blocking.  

## Performance notes
- No external requests by default; all assets inline or local.  
- Lightweight DOM rendering; filters and sorting operate on an in‑memory list.  
- Suitable for GitHub Pages or any CDN‑backed static host.  

## Porting to React (optional)
- Treat each view in js/app.js as a component and migrate state to a top‑level provider.  
- Replace hash routing with a client router and move localStorage helpers into custom hooks.  

## Scripts
No build steps required; use any static server for local development.  

## Roadmap
- Coupons and promo codes.  
- Wishlist and saved filters.  
- Pagination or infinite scroll for large catalogs.  
- Optional GSAP motion for hero and section reveals.  

## Contributing
Open issues for bugs or enhancements and submit PRs from a feature branch; keep code framework‑free and avoid external dependencies where possible.  

## License
MIT — Use freely in personal or commercial projects; replace branding and product names as needed.  
