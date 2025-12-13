import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { Icon } from '@iconify/react';
import { portfolioData } from '../../data/portfolio';
import { LinkButton } from '../ui';

// Social icon mappings with brand colors
const socialIcons: Record<string, { icon: string; color: string }> = {
  'linkedin': { icon: 'simple-icons:linkedin', color: '#0a66c2' },
  'github': { icon: 'simple-icons:github', color: '#181717' },
  'graduation-cap': { icon: 'simple-icons:googlescholar', color: '#4285f4' },
  'mail': { icon: 'mdi:email', color: '#ea4335' },
};

/**
 * Hero section with animated introduction
 * Social icons with brand logos
 */
export function Hero() {
  const { personalInfo } = portfolioData;

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 grid-bg" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <div className="flex flex-col items-center text-center">
          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-accent-400 font-mono text-sm">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              Available for opportunities
            </span>
          </motion.div>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4"
          >
            <span className="text-midnight-100">Hi, I'm </span>
            <span className="gradient-text">{personalInfo.name}</span>
          </motion.h1>

          {/* Title */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-midnight-300 font-medium mb-6"
          >
            {personalInfo.title}
          </motion.p>

          {/* Summary - Shorter */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-base text-midnight-400 max-w-xl mb-8"
          >
            Building production ML systems. Specialized in conversational AI & recommendations. Published researcher.
          </motion.p>

          {/* CTAs + Social in one row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <LinkButton href="#experience" variant="primary" size="md">
              View My Work
            </LinkButton>
            <LinkButton href="#contact" variant="outline" size="md">
              Get In Touch
            </LinkButton>
            
            {/* Social Icons with brand logos */}
            <div className="flex items-center gap-1 ml-2">
              {personalInfo.socialLinks.map((link) => {
                const iconData = socialIcons[link.icon] || { icon: 'mdi:link', color: '#6b7280' };
                return (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target={link.url.startsWith('mailto') ? undefined : '_blank'}
                    rel={link.url.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="p-2.5 rounded-lg text-midnight-400 hover:bg-white/10 transition-all"
                    aria-label={link.name}
                    title={link.name}
                  >
                    <Icon 
                      icon={iconData.icon} 
                      width={22} 
                      height={22}
                      className="transition-colors"
                      style={{ color: iconData.color }}
                    />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-midnight-500"
          >
            <ArrowDown size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
