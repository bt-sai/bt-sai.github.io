import { Heart } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';

/**
 * Minimal footer - just copyright
 * Social links already in Hero section
 */
export function Footer() {
  const { personalInfo } = portfolioData;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 border-t border-midnight-800">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-midnight-500 text-sm text-center flex items-center justify-center gap-1">
          Built with <Heart size={14} className="text-coral-400" /> by {personalInfo.name} © {currentYear}
        </p>
      </div>
    </footer>
  );
}
