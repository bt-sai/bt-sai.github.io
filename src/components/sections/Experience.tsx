import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import { Section, Card, Badge } from '../ui';

// Company colors for background fallback
const companyColors: Record<string, string> = {
  'Best Buy Co., Inc.': '#0046be',
  'Hike': '#ffd700',
  'Kantar Analytics': '#ed1c24',
};

/**
 * Experience section showcasing professional work history
 * Uses timeline layout with company logos
 */
export function Experience() {
  const { experience } = portfolioData;

  return (
    <Section
      id="experience"
      title="Experience"
      subtitle="Work History"
      className="relative"
    >
      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-500 via-teal-500 to-coral-500 opacity-30 hidden md:block" />

        {experience.map((job, index) => {
          const bgColor = companyColors[job.company] || '#6366f1';
          
          // Component to handle logo with error state
          const CompanyLogo = () => {
            const [imageError, setImageError] = useState(false);
            
            if (!job.logo || imageError) {
              return (
                <div
                  className="w-full h-full rounded-lg"
                  style={{ backgroundColor: bgColor }}
                />
              );
            }
            
            return (
              <img
                src={job.logo}
                alt={`${job.company} logo`}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            );
          };
          
          return (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative mb-12 md:mb-16 md:w-1/2 ${
                index % 2 === 0 ? 'md:pr-12' : 'md:pl-12 md:ml-auto'
              }`}
            >
              {/* Timeline Dot */}
              <div
                className={`hidden md:block absolute top-8 w-4 h-4 rounded-full bg-accent-500 border-4 border-midnight-950 ${
                  index % 2 === 0 ? '-right-2' : '-left-2'
                }`}
              />

              <Card glass hover delay={index * 0.1}>
                {/* Header with Logo */}
                <div className="flex items-start gap-4 mb-6">
                  {/* Company Logo */}
                  {job.websiteUrl ? (
                    <a
                      href={job.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                      aria-label={`Visit ${job.company} website`}
                    >
                      <CompanyLogo />
                    </a>
                  ) : (
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                    >
                      <CompanyLogo />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-midnight-100 mb-1">
                      {job.role}
                    </h3>
                    <div className="flex items-center gap-2 text-accent-400 font-medium">
                      <span>{job.company}</span>
                      <Badge variant="teal" className="text-xs">{job.type}</Badge>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-midnight-400 mb-6">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {job.startDate} - {job.endDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {job.location}
                  </span>
                </div>

                {/* Highlights */}
                <div className="space-y-4">
                  {job.highlights.map((highlight, hIndex) => (
                    <motion.div
                      key={hIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + hIndex * 0.05 }}
                      className="group"
                    >
                      <div className="flex items-start gap-3">
                        <ChevronRight
                          size={18}
                          className="text-accent-500 mt-0.5 flex-shrink-0 group-hover:translate-x-1 transition-transform"
                        />
                        <div>
                          <h4 className="text-midnight-200 font-medium mb-1">
                            {highlight.title}
                          </h4>
                          <p className="text-midnight-400 text-sm">
                            {highlight.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
