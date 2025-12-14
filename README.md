# Personal Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. Features smooth animations, dark/light theme support, Xano backend integration, and optimized for deployment on GitHub Pages.

## 🚀 Tech Stack

- **Framework:** React 19 with TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React + Iconify
- **Build Tool:** Vite
- **Backend:** Xano (for thoughts, likes, visitor tracking)
- **Deployment:** GitHub Pages with GitHub Actions

## ✨ Features

- 🎨 Modern, distinctive design with dark/light theme
- 📱 Fully responsive design
- 💭 **Quick Thoughts** - Auto-scrolling feed with likes
- 🖼️ **Gallery** - Photo gallery with lightbox and horizontal scroll
- 🔐 **Admin Panel** - Manage thoughts and photos (password protected)
- 👁️ **Visitor Tracking** - Fingerprint-based unique visitor counting
- ❤️ **Like System** - Deduplicated likes with animations
- ⚡ Optimized performance with code splitting
- ♿ Accessible with ARIA labels
- 📊 SEO optimized with meta tags

## 🏗️ Project Structure

```
src/
├── components/
│   ├── admin/           # Admin panel for managing content
│   ├── layout/          # Header, Footer
│   ├── sections/        # Hero, Experience, Gallery, etc.
│   └── ui/              # Reusable UI components
├── config/              # Xano API configuration
├── data/                # Portfolio data (single source of truth)
├── hooks/               # Custom React hooks
├── services/            # API services (Xano integration)
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Xano account (for backend features)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Install dependencies
npm install

# Copy environment example and configure
cp .env.example .env
# Edit .env with your Xano URLs

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_XANO_BASE_URL=https://your-instance.xano.io/api:your_api_group
VITE_XANO_FILE_BASE_URL=https://your-instance.xano.io
VITE_XANO_API_GROUP=your_api_group
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |

## 📦 Deployment

### GitHub Pages Setup

1. **Create a GitHub repository:**
   - For user site: `YOUR_USERNAME.github.io`
   - For project site: Any name you prefer

2. **Add GitHub Secrets:**
   Go to **Settings** → **Secrets and variables** → **Actions** and add:
   - `VITE_XANO_BASE_URL`
   - `VITE_XANO_FILE_BASE_URL`
   - `VITE_XANO_API_GROUP`

3. **Enable GitHub Pages:**
   - Go to **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

4. **Push and Deploy:**
   ```bash
   git push origin main
   ```
   The GitHub Actions workflow will automatically build and deploy.

### Manual Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting
```

## 🔧 Backend Setup (Xano)

The portfolio uses Xano for:
- Storing and managing thoughts/updates
- Photo gallery management
- Visitor tracking
- Like functionality

### Required Xano Tables

1. **thoughts** - Content, images, visibility, likes
2. **visitor_count** - Visitor tracking with fingerprints
3. **admin_session** - Admin authentication sessions
4. **thought_likes** - Like tracking per visitor

### Required Xano Endpoints

- `GET /thoughts` - Public thoughts
- `POST /thoughts/create` - Create thought (admin)
- `POST /thoughts/like` - Like a thought
- `GET /thoughts/like-status` - Get liked thoughts for visitor
- `POST /visitor/track` - Track visitor
- `POST /admin/verify` - Admin login

## 🎨 Customization

### Portfolio Content

Edit `src/data/portfolio.ts` to update:
- Personal information
- Work experience
- Education
- Publications
- Skills

### Theme Colors

Colors are defined in `src/index.css`:
- Midnight palette (dark theme)
- Accent (gold/amber)
- Coral and Teal highlights

### Admin Panel

Access at `/admin` or click the admin link. Password is set in Xano environment variables.

## 📄 License

MIT License - feel free to use as a template for your own portfolio!

---

Built with ❤️ using React, TypeScript, and Xano
