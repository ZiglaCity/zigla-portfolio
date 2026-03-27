# Zigla City Portfolio

Some people build a simple HTML/CSS portfolio and call it a day.

Me?

I picked Next.js, built a terminal vibe, added an OS-like experience, wired in interactive games, then created simulation modes for things like CNNs, linear regression, a donut, a 3D bird, and an ASCII portrait.

And yes, there is a dedicated space where I write about life, goals, tech, funny moments, and whatever is on my mind.

Because I build what I want.

## Live Website

- Main site: [https://ziglacity.tech](https://ziglacity.tech)
- Home: [https://ziglacity.tech/](https://ziglacity.tech/)
- Projects: [https://ziglacity.tech/projects](https://ziglacity.tech/projects)
- Blogs: [https://ziglacity.tech/blogs](https://ziglacity.tech/blogs)
- Contact: [https://ziglacity.tech/contact](https://ziglacity.tech/contact)

## What This Portfolio Includes

- Next.js 16 App Router architecture
- SEO-focused metadata, Open Graph, Twitter cards, sitemap, robots, JSON-LD
- Terminal-like interactive interface (ZiglaOS style)
- Content pages for projects, blogs, experience, and contact
- Game mode with playable terminal games
- Simulation mode with special word profiles

## Terminal Features

Terminal supports commands like:

- help
- about
- experience
- projects
- blogs
- open
- read
- search
- clear
- theme
- game
- simulate
- exc
- quit / exit / close

## Simulation Mode

Run simulation mode with:

```bash
simulate <word>
```

Special words currently supported:

- donut
- bird
- cnn
- linreg
- zigla
- ziglacity

What they do:

- donut: 3D ASCII torus simulation
- bird: large 3D ASCII bird with flapping wings
- cnn: layered neural network flow visualization
- linreg: 3D linear regression scene with plane and residuals
- zigla / ziglacity: mouse-controlled 3D ASCII portrait mode

Detailed simulation notes:

- [docs/terminal-simulations.md](docs/terminal-simulations.md)

## Site Pages and Code Paths

- App root pages: [src/app](src/app)
- Home page: [src/app/page.tsx](src/app/page.tsx)
- Projects page: [src/app/projects/page.tsx](src/app/projects/page.tsx)
- Blogs page: [src/app/blogs/page.tsx](src/app/blogs/page.tsx)
- Contact page: [src/app/contact/page.tsx](src/app/contact/page.tsx)
- Terminal logic: [src/components/terminal](src/components/terminal)
- Simulations engine: [src/components/terminal/simulations/AsciiSimulation.tsx](src/components/terminal/simulations/AsciiSimulation.tsx)
- Games engine: [src/components/terminal/games](src/components/terminal/games)

## Tech Stack

- Framework: Next.js 16+
- UI: React 19 + Tailwind CSS
- Animation: Framer Motion
- Icons: Lucide React
- Language: TypeScript
- Hosting: Vercel

## Local Setup

Prerequisites:

- Node.js 20+
- npm or yarn

Clone and install:

```bash
git clone https://github.com/ZiglaCity/zigla-portfolio.git
cd zigla-portfolio
npm install
```

Run dev server:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## Deployment

Deployed on Vercel:

- [https://ziglacity.tech](https://ziglacity.tech)

## Author

Solomon Dzah

- Software Engineer
- AI/ML Developer
- Cybersecurity Enthusiast

## Final Note

This project is a portfolio, playground, and personal expression space in one place.

If you came here for a boring template, wrong repo.

If you came here for personality, systems thinking, weird ideas, and clean execution, welcome.
