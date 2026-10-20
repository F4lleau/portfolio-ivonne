export type Locale = 'es' | 'en';
export type Text = Record<Locale, string>;
export interface Technology {
  id: string;
  slug: string;
  name: string;
  category: string;
  sort_order: number;
}
export interface Project {
  id: string;
  slug: string;
  title: Text;
  summary: Text;
  description: Text;
  role: Text;
  decisions: Text;
  result: Text;
  cover: string | null;
  cover_alt: string;
  repo_url: string;
  demo_url: string;
  year: number;
  category: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  technologies: Technology[];
  gallery: GalleryImage[];
}
export interface Experience {
  company: string;
  period: string;
  role: Text;
  description: Text;
  stack: string[];
}
export interface Education {
  school: string;
  period: string;
  title: Text;
  status: Text;
}
export interface Profile {
  id: string;
  full_name: string;
  headline: Text;
  summary: Text;
  availability: Text;
  location: string;
  timezone: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  photo: string | null;
  languages: { name: Text; level: string }[];
  experience: Experience[];
  education: Education[];
  skills: { name: Text; items: string[] }[];
}
export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  locale: Locale;
  is_read: boolean;
  created_at: string;
}
export interface Repository {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  year: number;
  fork: boolean;
}
export interface BotAnswer {
  answer: string;
  projects: { title: string; summary: string; result: string; url: string }[];
  links: { label: string; url: string }[];
}

export interface GalleryImage {
  id: string;
  project: string;
  image: string;
  alt: string;
  sort_order: number;
}
