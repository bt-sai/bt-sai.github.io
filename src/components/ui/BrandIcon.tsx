import { Icon } from '@iconify/react';

/**
 * Brand icon mappings using Iconify icons
 * Includes companies, colleges, tools, and social platforms
 */
export const brandIcons: Record<string, string> = {
  // Companies
  'bestbuy': 'simple-icons:bestbuy',
  'hike': 'mdi:poker-chip', // Gaming/poker app
  'kantar': 'mdi:chart-bar',
  'sony': 'simple-icons:sony',
  'google': 'simple-icons:google',
  
  // Colleges
  'iisc': 'mdi:school',
  'nit': 'mdi:school-outline',
  
  // Social
  'linkedin': 'simple-icons:linkedin',
  'github': 'simple-icons:github',
  'googlescholar': 'simple-icons:googlescholar',
  'email': 'mdi:email',
  'mail': 'mdi:email-outline',
  
  // Languages
  'python': 'simple-icons:python',
  'c': 'simple-icons:c',
  'cpp': 'simple-icons:cplusplus',
  'c/c++': 'simple-icons:cplusplus',
  'sql': 'simple-icons:postgresql',
  'javascript': 'simple-icons:javascript',
  
  // Frameworks & Tools
  'pytorch': 'simple-icons:pytorch',
  'tensorflow': 'simple-icons:tensorflow',
  'kafka': 'simple-icons:apachekafka',
  'airflow': 'simple-icons:apacheairflow',
  'numpy': 'simple-icons:numpy',
  'pandas': 'simple-icons:pandas',
  'mongodb': 'simple-icons:mongodb',
  'redis': 'simple-icons:redis',
  'docker': 'simple-icons:docker',
  'kubernetes': 'simple-icons:kubernetes',
  'aws': 'simple-icons:amazonaws',
  'gcp': 'simple-icons:googlecloud',
  
  // ML & AI
  'deep learning': 'mdi:brain',
  'machine learning': 'mdi:robot',
  'nlp': 'mdi:chat-processing',
  'speech recognition': 'mdi:microphone',
  'recommendation systems': 'mdi:thumb-up',
  'llms': 'mdi:head-cog',
  
  // Other
  'a/b experimentation': 'mdi:ab-testing',
  'data analysis': 'mdi:chart-line',
  'statistics': 'mdi:chart-bell-curve',
  'git': 'simple-icons:git',
  'system design': 'mdi:sitemap',
  
  // Publications
  'ieee': 'simple-icons:ieee',
  'interspeech': 'mdi:microphone-variant',
  'elsevier': 'simple-icons:elsevier',
  
  // Achievements
  'gate': 'mdi:medal',
  'scholarship': 'mdi:school',
  
  // Default
  'default': 'mdi:code-tags',
};

interface BrandIconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * BrandIcon component - renders brand logos using Iconify
 */
export function BrandIcon({ name, size = 20, className = '' }: BrandIconProps) {
  const iconName = brandIcons[name.toLowerCase()] || brandIcons['default'];
  
  return (
    <Icon 
      icon={iconName} 
      width={size} 
      height={size} 
      className={className}
    />
  );
}

/**
 * Get icon name for a skill/tool
 */
export function getSkillIcon(skill: string): string {
  return brandIcons[skill.toLowerCase()] || brandIcons['default'];
}

