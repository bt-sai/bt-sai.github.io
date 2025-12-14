import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Award } from 'lucide-react';
import { portfolioData } from '../../data/portfolio';
import { Section, Card, Badge } from '../ui';

// College colors for fallback
const collegeColors: Record<string, { bg: string; accent: string }> = {
  'Indian Institute of Science': { bg: '#003366', accent: '#c4a000' },
  'National Institute of Technology Patna': { bg: '#1a1a6c', accent: '#ffd700' },
};

/**
 * Education section displaying academic background
 * Clean card-based layout with institution logos
 */
export function Education() {
  const { education } = portfolioData;

  return (
    <Section
      id="education"
      title="Education"
      subtitle="Academic Background"
    >
      <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
        {education.map((edu, index) => {
          const colors = collegeColors[edu.institution] || { bg: '#003366', accent: '#ffd700' };
          
          // Component to handle logo with error state
          const CollegeLogo = () => {
            const [imageError, setImageError] = useState(false);
            
            if (!edu.logo || imageError) {
              return (
                <div
                  className="w-full h-full rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.bg }}
                >
                  <span style={{ color: colors.accent }} className="font-bold text-lg">
                    {edu.institution.split(' ').map((w) => w[0]).join('')}
                  </span>
                </div>
              );
            }
            
            return (
              <img
                src={edu.logo}
                alt={`${edu.institution} logo`}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            );
          };
          
          return (
            <Card key={edu.id} glass hover delay={index * 0.15}>
              {/* College Logo */}
              {edu.websiteUrl ? (
                <a
                  href={edu.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 overflow-hidden hover:opacity-80 transition-opacity inline-block"
                  aria-label={`Visit ${edu.institution} website`}
                >
                  <CollegeLogo />
                </a>
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
                  <CollegeLogo />
                </div>
              )}

              {/* Institution */}
              <h3 className="text-xl font-bold text-midnight-100 mb-2">
                {edu.institution}
              </h3>

              {/* Degree */}
              <div className="mb-4">
                <p className="text-accent-400 font-medium">{edu.degree}</p>
                <p className="text-midnight-300">{edu.field}</p>
              </div>

              {/* GPA Badge */}
              <div className="mb-6">
                <Badge variant="accent">
                  <Award size={12} className="mr-1" />
                  GPA: {edu.gpa}
                </Badge>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-midnight-400">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {edu.startDate} - {edu.endDate}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {edu.location}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16"
      >
        <h3 className="text-2xl font-bold text-midnight-100 mb-8">
          Research Projects
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {portfolioData.projects.map((project, index) => (
            <Card key={project.id} glass hover delay={index * 0.15}>
              <Badge variant="teal" className="mb-4">{project.type}</Badge>
              
              <h4 className="text-lg font-bold text-midnight-100 mb-2">
                {project.title}
              </h4>
              
              <p className="text-sm text-accent-400 mb-4">
                {project.advisor}
              </p>
              
              <p className="text-midnight-300 text-sm mb-4">
                {project.description}
              </p>
              
              <ul className="space-y-2">
                {project.achievements.map((achievement, aIndex) => (
                  <li
                    key={aIndex}
                    className="flex items-start gap-2 text-sm text-midnight-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0" />
                    {achievement}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </motion.div>
    </Section>
  );
}
