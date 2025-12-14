/**
 * Type definitions for the portfolio application
 * Following Interface Segregation Principle - small, focused interfaces
 */

export interface SocialLink {
  readonly name: string;
  readonly url: string;
  readonly icon: string;
}

export interface PersonalInfo {
  readonly name: string;
  readonly title: string;
  readonly email: string;
  readonly location: string;
  readonly summary: string;
  readonly socialLinks: readonly SocialLink[];
}

export interface Education {
  readonly id: string;
  readonly institution: string;
  readonly degree: string;
  readonly field: string;
  readonly gpa: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly location: string;
  readonly logo?: string;
  readonly websiteUrl?: string;
}

export interface ExperienceHighlight {
  readonly title: string;
  readonly description: string;
}

export interface Experience {
  readonly id: string;
  readonly company: string;
  readonly role: string;
  readonly type: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly location: string;
  readonly highlights: readonly ExperienceHighlight[];
  readonly logo?: string;
  readonly websiteUrl?: string;
}

export interface Publication {
  readonly id: string;
  readonly title: string;
  readonly authors: string;
  readonly venue: string;
  readonly year: string;
  readonly url?: string;
}

export interface Project {
  readonly id: string;
  readonly title: string;
  readonly type: string;
  readonly advisor: string;
  readonly description: string;
  readonly achievements: readonly string[];
}

export interface SkillCategory {
  readonly category: string;
  readonly skills: readonly string[];
}

export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface PortfolioData {
  readonly personalInfo: PersonalInfo;
  readonly education: readonly Education[];
  readonly experience: readonly Experience[];
  readonly publications: readonly Publication[];
  readonly projects: readonly Project[];
  readonly skills: readonly SkillCategory[];
  readonly achievements: readonly Achievement[];
}

export type Theme = 'dark' | 'light';

export interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
}

export interface Thought {
  readonly id: number;
  readonly content: string;
  readonly source: 'manual' | 'linkedin' | 'x';
  readonly external_url?: string;
  readonly image_url?: string;
  readonly is_visible: boolean;
  readonly likes_count: number;
  readonly created_by?: number;
  readonly created_at: string;
  readonly updated_at?: string;
}

export interface ThoughtLike {
  readonly id: number;
  readonly thought_id: number;
  readonly visitor_fingerprint: string;
  readonly created_at: string;
}

export interface VisitorCount {
  readonly total_visitors: number;
}

