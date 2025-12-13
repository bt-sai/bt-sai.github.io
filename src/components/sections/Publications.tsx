import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Users } from 'lucide-react';
import { Icon } from '@iconify/react';
import { portfolioData } from '../../data/portfolio';
import { Section, Badge } from '../ui';

// Publication venue icons
const venueIcons: Record<string, { icon: string; color: string }> = {
  'Interspeech': { icon: 'mdi:microphone-variant', color: '#e91e63' },
  'IEEE/ACM TASLP': { icon: 'simple-icons:ieee', color: '#00629b' },
  'SPCOM': { icon: 'simple-icons:ieee', color: '#00629b' },
  'DSP, Elsevier': { icon: 'simple-icons:elsevier', color: '#ff6c00' },
};

/**
 * Publications section showcasing research work
 * Clickable cards with venue logos
 */
export function Publications() {
  const { publications } = portfolioData;

  return (
    <Section
      id="publications"
      title="Publications"
      subtitle="Research & Papers"
    >
      {/* Publications Grid - 2 columns for better space usage */}
      <div className="grid md:grid-cols-2 gap-6">
        {publications.map((pub, index) => {
          const venueData = venueIcons[pub.venue] || { icon: 'mdi:file-document', color: '#6b7280' };
          
          return (
            <motion.a
              key={pub.id}
              href={pub.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group block rounded-2xl p-6 glass card-hover"
            >
              <div className="flex items-start gap-4">
                {/* Venue Icon */}
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${venueData.color}20` }}
                >
                  <Icon 
                    icon={venueData.icon} 
                    width={24} 
                    height={24}
                    style={{ color: venueData.color }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Venue & Year */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="coral">{pub.venue}</Badge>
                    <span className="flex items-center gap-1 text-xs text-midnight-400">
                      <Calendar size={12} />
                      {pub.year}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-midnight-100 mb-2 group-hover:text-accent-400 transition-colors line-clamp-2">
                    {pub.title}
                    <ExternalLink size={14} className="inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>

                  {/* Authors */}
                  <div className="flex items-start gap-2 text-midnight-400 text-sm">
                    <Users size={14} className="flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{pub.authors}</span>
                  </div>
                </div>
              </div>
            </motion.a>
          );
        })}
      </div>

      {/* Scholar Link - with icon */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-8 text-center"
      >
        <a
          href="https://scholar.google.com/citations?user=tarunsai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-midnight-400 hover:text-accent-400 transition-colors"
        >
          <Icon icon="simple-icons:googlescholar" width={16} height={16} />
          View all on Google Scholar
          <ExternalLink size={14} />
        </a>
      </motion.div>
    </Section>
  );
}
