import type { PortfolioData, NavItem } from '../types';

// Import local logo assets
import bestbuyLogo from '../assets/logos/bestbuy.jpeg';
import hikeLogo from '../assets/logos/hike.jpeg';
import kantarLogo from '../assets/logos/kantar.jpeg';
import iiscLogo from '../assets/logos/iisc.jpeg';
import nitpLogo from '../assets/logos/nitp.jpeg';

/**
 * Portfolio data - Single source of truth for all portfolio content
 * Follows Open/Closed Principle - easy to extend without modifying core logic
 */
export const portfolioData: PortfolioData = {
  personalInfo: {
    name: 'Tarun Sai',
    title: 'Senior Applied AI Scientist',
    email: 'tarunsaib1997@gmail.com',
    phone: '+91-707-522-0608',
    location: 'Bengaluru, India',
    summary: `Passionate AI/ML professional with expertise in building production-grade machine learning systems. 
    Specialized in conversational AI, recommendation systems, and real-time ML applications. 
    Published researcher with contributions to speech recognition and language processing.`,
    socialLinks: [
      {
        name: 'LinkedIn',
        url: 'https://linkedin.com/in/tarunsaib',
        icon: 'linkedin',
      },
      {
        name: 'GitHub',
        url: 'https://github.com/tarunsai',
        icon: 'github',
      },
      {
        name: 'Google Scholar',
        url: 'https://scholar.google.com/citations?user=tarunsai',
        icon: 'graduation-cap',
      },
      {
        name: 'Email',
        url: 'mailto:tarunsaib1997@gmail.com',
        icon: 'mail',
      },
    ],
  },
  education: [
    {
      id: 'iisc',
      institution: 'Indian Institute of Science',
      degree: 'Master of Technology',
      field: 'Artificial Intelligence',
      gpa: '8.00/10.00',
      startDate: 'Jun 2020',
      endDate: 'May 2022',
      location: 'Bengaluru, KA, India',
      logo: iiscLogo,
      websiteUrl: 'https://iisc.ac.in/',
    },
    {
      id: 'nitp',
      institution: 'National Institute of Technology Patna',
      degree: 'Bachelor of Technology',
      field: 'Electronics and Communication',
      gpa: '8.41/10.00',
      startDate: 'Aug 2014',
      endDate: 'May 2018',
      location: 'Patna, BR, India',
      logo: nitpLogo,
      websiteUrl: 'https://www.nitp.ac.in/',
    },
  ],
  experience: [
    {
      id: 'bestbuy',
      company: 'Best Buy Co., Inc.',
      role: 'Senior Applied AI Scientist',
      type: 'Hybrid',
      startDate: 'Apr 2025',
      endDate: 'Present',
      location: 'Bengaluru, India',
      logo: bestbuyLogo,
      websiteUrl: 'https://corporate.bestbuy.com/',
      highlights: [
        {
          title: 'Conversational Gifting',
          description:
            'Implemented a LLM-based system for generating gifting recommendations for users.',
        },
        {
          title: 'Ecommerce Search',
          description:
            'Involved in building semantic reranker for Best Buy\'s ecommerce search engine.',
        }
      ],
    },
    {
      id: 'hike',
      company: 'Hike',
      role: 'Machine Learning Scientist',
      type: 'Remote',
      startDate: 'Jun 2022',
      endDate: 'Mar 2025',
      location: 'Remote',
      logo: hikeLogo,
      websiteUrl: 'https://www.linkedin.com/company/hike/',
      highlights: [
        {
          title: 'User Trajectory Prediction',
          description:
            'Built transformer-based model for next action prediction, increasing platform ARPU by 5%.',
        },
        {
          title: 'Online Matchmaking System',
          description:
            'Implemented GBM-based matchmaking for multiplayer games, improving user retention by 5%.',
        },
        {
          title: 'Click Prediction Model',
          description:
            'Developed click prediction to optimize offer targeting, increasing deposits by 3%.',
        },
        {
          title: 'Churn Prediction System',
          description:
            'Built GBM churn prediction model for personalized retention offers, improving retention by 3%.',
        },
        {
          title: 'Dynamic Pricing Engine',
          description:
            'Implemented Multi-Arm Bandit rake personalization, increasing net revenue by 3.5%.',
        },
        {
          title: 'Real-time Features Store',
          description:
            'Built Kafka consumer for storing real-time user features in MongoDB for ML projects.',
        },
        {
          title: 'A/B Experimentation Platform',
          description:
            'Led integration of A/B platform, adopted for 100% of experiments across the organization.',
        },
      ],
    },
    {
      id: 'kantar',
      company: 'Kantar Analytics',
      role: 'Software Engineer',
      type: 'On-site',
      startDate: 'Jun 2018',
      endDate: 'May 2019',
      location: 'Bengaluru, KA, India',
      logo: kantarLogo,
      websiteUrl: 'https://www.kantar.com/',
      highlights: [
        {
          title: 'Data Visualization Platform',
          description:
            'Designed web application for KPI visualization with d3.js charts and lazy loading for Coca-Cola bottlers revenue data.',
        },
      ],
    },
  ],
  publications: [
    {
      id: 'interspeech2022',
      title: 'Semi-supervised Acoustic and Language Modeling for Hindi ASR',
      authors: 'B. Tarun Sai, Shakthi P. Rath, Nirmesh Shah, Naoyuki Onoe, Sriram Ganapathy',
      venue: 'Interspeech',
      year: '2022',
      url: 'https://www.isca-archive.org/interspeech_2022/bandarupalli22_interspeech.pdf',
    },
    {
      id: 'taslp2023',
      title: 'Representation learning with hidden unit clustering for low resource speech applications',
      authors: 'V Krishna, B. Tarun Sai, S Ganapathy',
      venue: 'IEEE/ACM TASLP',
      year: '2023',
      url: 'https://ieeexplore.ieee.org/document/10339798',
    },
    {
      id: 'spcom2018-1',
      title: 'Improving ASR via binary classification of adult and children speakers',
      authors: 'B. Tarun Sai, Syed Shahnawazuddin',
      venue: 'SPCOM',
      year: '2018',
      url: 'https://ieeexplore.ieee.org/abstract/document/9179497',
    },
    {
      id: 'spcom2018-2',
      title: 'Enhancing pitch robustness of speech recognition system through spectral smoothing',
      authors: 'B. Tarun Sai, Syed Shahnawazuddin',
      venue: 'SPCOM',
      year: '2018',
      url: 'https://ieeexplore.ieee.org/abstract/document/8724416',
    },
  ],
  projects: [
    {
      id: 'masters-thesis',
      title: "Master's Thesis",
      type: 'Research',
      advisor:
        'Prof. Sriram Ganapathy, LEAP lab, IISc & Google R&D India | Naoyuki Onoe, Sony R&D India',
      description:
        'Self-supervised learning architectures for low-resource speech recognition',
      achievements: [
        'Published at Interspeech conference',
        'Journal publication in IEEE/ACM TASLP',
        'Collaboration with Google R&D and Sony R&D India',
      ],
    },
    {
      id: 'bachelors-thesis',
      title: "Bachelor's Thesis",
      type: 'Research',
      advisor: 'Prof. Syed Shahnawzuddin, DSP lab, NIT Patna',
      description:
        'Improving automatic speech recognition via binary classification of adult and children speakers',
      achievements: [
        'Published at SPCOM conference',
        'Journal publication in DSP, Elsevier',
      ],
    },
  ],
  skills: [
    {
      category: 'Languages',
      skills: ['Python', 'C/C++', 'SQL', 'JavaScript'],
    },
    {
      category: 'Frameworks & Tools',
      skills: ['PyTorch', 'Kafka', 'Airflow', 'NumPy', 'Pandas', 'MongoDB'],
    },
    {
      category: 'ML & AI',
      skills: [
        'Deep Learning',
        'Machine Learning',
        'NLP',
        'Speech Recognition',
        'Recommendation Systems',
        'LLMs',
      ],
    },
    {
      category: 'Other',
      skills: [
        'A/B Experimentation',
        'Data Analysis',
        'Statistics',
        'Git',
        'System Design',
      ],
    },
  ],
  achievements: [
    {
      id: 'gate',
      title: 'GATE CSE 2020',
      description: 'All India Rank 101',
    },
    {
      id: 'iocl',
      title: 'IOCL Scholarship',
      description: 'Received Indian Oil Corporation Limited scholarship',
    },
    {
      id: 'mhrd',
      title: 'MHRD Scholarship',
      description: 'Awarded Government of India MHRD scholarship',
    },
  ],
};

export const navItems: readonly NavItem[] = [
  { id: 'about', label: 'About', href: '#about' },
  { id: 'experience', label: 'Experience', href: '#experience' },
  { id: 'education', label: 'Education', href: '#education' },
  { id: 'publications', label: 'Publications', href: '#publications' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'contact', label: 'Contact', href: '#contact' },
] as const;

