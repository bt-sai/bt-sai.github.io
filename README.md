# Tarun Sai - Personal Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. Features smooth animations, dark/light theme support, and optimized for deployment on GitHub Pages.

![Portfolio Preview](./docs/preview.png)

## 🚀 Tech Stack

- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Build Tool:** Vite
- **Deployment:** GitHub Pages

## ✨ Features

- 🎨 Modern, distinctive design (not generic AI aesthetics)
- 🌙 Dark/Light theme with system preference detection
- 📱 Fully responsive design
- ⚡ Optimized performance with code splitting
- ♿ Accessible with ARIA labels and focus management
- 🔒 Security best practices
- 📊 SEO optimized with meta tags

## 🏗️ Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Footer
│   ├── sections/        # Hero, Experience, Education, etc.
│   └── ui/              # Reusable UI components
├── data/                # Portfolio data (single source of truth)
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tarunsai/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run type-check` | Run TypeScript type checking |
| `npm run deploy` | Deploy to GitHub Pages |

## 📦 Deployment

### GitHub Pages (Automated)

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the `main` branch.

1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Push to `main` branch

### Manual Deployment

```bash
npm run deploy
```

## 🎨 Customization

### Updating Portfolio Content

Edit `src/data/portfolio.ts` to update:
- Personal information
- Work experience
- Education
- Publications
- Skills
- Achievements

### Theme Colors

Colors are defined in `src/index.css` using CSS custom properties:
- Midnight palette (dark theme base)
- Accent (gold/amber)
- Coral (accent highlights)
- Teal (accent highlights)

## 📄 License

MIT License - feel free to use this as a template for your own portfolio!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ by Tarun Sai
