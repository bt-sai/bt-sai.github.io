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

### Setting Up GitHub Repository

1. **Create a new repository on GitHub:**
   - Go to [GitHub](https://github.com/new)
   - Repository name: `Personal_page` (or your preferred name)
   - Set visibility to **Private** (or Public if you prefer)
   - **Do NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   # Add the remote repository (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/Personal_page.git
   
   # Rename branch to main if needed
   git branch -M main
   
   # Push to GitHub
   git push -u origin main
   ```

### GitHub Pages Setup

**Important Note:** GitHub Pages for private repositories requires a paid GitHub plan (GitHub Pro, Team, or Enterprise). If you have a free account, you'll need to make the repository public to use GitHub Pages.

1. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** > **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save the settings

2. **Automatic Deployment:**
   - The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`)
   - It automatically deploys to GitHub Pages on every push to the `main` branch
   - After the first push, go to **Actions** tab to see the deployment progress
   - Once complete, your site will be available at: `https://YOUR_USERNAME.github.io/Personal_page/`

3. **Update base path in vite.config.ts:**
   - If your repository name is different from `Personal_page`, update the `base` field in `vite.config.ts`
   - Currently set to `base: './'` which works for GitHub Pages

### Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
npm run deploy
```

This uses `gh-pages` to deploy the `dist` folder directly.

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
