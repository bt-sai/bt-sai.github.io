import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { Icon } from '@iconify/react';
import { portfolioData } from '../../data/portfolio';
import { Section, Card } from '../ui';

// Skill to icon mapping
const skillIcons: Record<string, { icon: string; color: string }> = {
  // Languages
  'Python': { icon: 'simple-icons:python', color: '#3776ab' },
  'C/C++': { icon: 'simple-icons:cplusplus', color: '#00599c' },
  'SQL': { icon: 'simple-icons:postgresql', color: '#4169e1' },
  'JavaScript': { icon: 'simple-icons:javascript', color: '#f7df1e' },
  
  // Frameworks & Tools
  'PyTorch': { icon: 'simple-icons:pytorch', color: '#ee4c2c' },
  'Kafka': { icon: 'simple-icons:apachekafka', color: '#231f20' },
  'Airflow': { icon: 'simple-icons:apacheairflow', color: '#017cee' },
  'NumPy': { icon: 'simple-icons:numpy', color: '#013243' },
  'Pandas': { icon: 'simple-icons:pandas', color: '#150458' },
  'MongoDB': { icon: 'simple-icons:mongodb', color: '#47a248' },
  
  // ML & AI
  'Deep Learning': { icon: 'mdi:brain', color: '#ff6b6b' },
  'Machine Learning': { icon: 'mdi:robot', color: '#4ecdc4' },
  'NLP': { icon: 'mdi:chat-processing', color: '#a855f7' },
  'Speech Recognition': { icon: 'mdi:microphone', color: '#f59e0b' },
  'Recommendation Systems': { icon: 'mdi:thumb-up', color: '#10b981' },
  'LLMs': { icon: 'simple-icons:openai', color: '#412991' },
  
  // Other
  'A/B Experimentation': { icon: 'mdi:ab-testing', color: '#6366f1' },
  'Data Analysis': { icon: 'mdi:chart-line', color: '#06b6d4' },
  'Statistics': { icon: 'mdi:chart-bell-curve', color: '#8b5cf6' },
  'Git': { icon: 'simple-icons:git', color: '#f05032' },
  'System Design': { icon: 'mdi:sitemap', color: '#ec4899' },
};

// Achievement icons
const achievementIcons: Record<string, React.ElementType> = {
  'gate': Medal,
  'iocl': Award,
  'mhrd': Trophy,
};

/**
 * Skills section with technology logos
 * Visual skill badges with brand icons
 */
export function Skills() {
  const { skills, achievements } = portfolioData;

  const categoryIcons: Record<string, string> = {
    'Languages': '💻',
    'Frameworks & Tools': '🛠️',
    'ML & AI': '🧠',
    'Other': '⚡',
  };

  return (
    <Section
      id="skills"
      title="Skills & Achievements"
      subtitle="Technical Expertise"
    >
      {/* Skills Grid */}
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
        {skills.map((category, index) => (
          <Card key={category.category} glass hover delay={index * 0.1}>
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{categoryIcons[category.category] || '📦'}</span>
              <h3 className="text-lg font-semibold text-midnight-100">
                {category.category}
              </h3>
            </div>

            {/* Skills with Icons */}
            <div className="flex flex-wrap gap-3">
              {category.skills.map((skill) => {
                const iconData = skillIcons[skill] || { icon: 'mdi:code-tags', color: '#6b7280' };
                return (
                  <motion.div
                    key={skill}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm font-medium text-midnight-200 cursor-default"
                  >
                    <Icon 
                      icon={iconData.icon} 
                      width={18} 
                      height={18} 
                      style={{ color: iconData.color }}
                    />
                    <span>{skill}</span>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-accent-500/20 flex items-center justify-center">
            <Trophy className="text-accent-400" size={20} />
          </div>
          <h3 className="text-2xl font-bold text-midnight-100">Achievements</h3>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => {
            const AchievementIcon = achievementIcons[achievement.id] || Trophy;
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl glass card-hover text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-500 to-coral-500 flex items-center justify-center">
                  <AchievementIcon className="text-white" size={24} />
                </div>
                <h4 className="text-lg font-semibold text-midnight-100 mb-2">
                  {achievement.title}
                </h4>
                <p className="text-sm text-midnight-400">{achievement.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </Section>
  );
}
