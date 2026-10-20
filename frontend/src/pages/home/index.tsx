import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Mail,
  MapPin,
  Sparkles,
  Layers,
  Code2,
  Database,
  Braces,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile } from './hooks';
import { useProjects } from '@/pages/projects/hooks';
import { useSettings } from '@/lib/providers';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/portfolio/project-card';
import { SectionHeading } from '@/components/portfolio/section-heading';
import { QueryState } from '@/components/shared/query-state';
export default function Home() {
  const profile = useProfile();
  const projects = useProjects();
  const { tx, t, fm } = useSettings();
  if (!profile.data)
    return (
      <QueryState
        loading={profile.isPending}
        error={profile.error}
        retry={() => profile.refetch()}
      />
    );
  const p = profile.data;
  const featured = (projects.data || []).filter((v) => v.published && v.featured).slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="container hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-copy"
          >
            <div className="availability">
              <span className="status-dot" />
              <span>{tx(p.availability)}</span>
            </div>
            <p className="eyebrow hero-label">{t('heroLabel')}</p>
            <h1>
              {p.full_name}
              <span className="text-primary">.</span>
            </h1>
            <h2>{tx(p.headline)}</h2>
            <p className="hero-description">{tx(p.summary)}</p>
            <p className="hero-location">
              <MapPin size={16} />
              {p.location} <span>(UTC-3)</span>
            </p>
            <div className="hero-actions">
              <Button asChild variant="hero">
                <Link to="/projects">
                  {t('viewProjects')}
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/cv">
                  <Download size={17} />
                  {t('downloadCV')}
                </Link>
              </Button>
              {p.email && (
                <a className="email-link" href={`mailto:${p.email}`}>
                  <Mail size={16} />
                  {t('emailMe')}
                </a>
              )}
            </div>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            <div className="visual-top">
              <span>
                <Layers size={15} />
                {t('stack')}
              </span>
              <span className="visual-dots">•••</span>
            </div>
            {p.photo ? (
              <img className="hero-photo" src={p.photo} alt={p.full_name} />
            ) : (
              <div className="stack-scene">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="stack-core">
                  <Braces size={54} strokeWidth={1.3} />
                  <span>
                    {p.full_name
                      .split(' ')
                      .map((s) => s[0])
                      .join('')}
                    <span className="text-accent">_</span>
                  </span>
                </div>
                <div className="floating-tag tag-python">
                  <Code2 size={19} />
                  <span>Python</span>
                  <i />
                </div>
                <div className="floating-tag tag-react">
                  <span className="react-symbol">⚛</span>
                  <span>React</span>
                  <i />
                </div>
                <div className="floating-tag tag-data">
                  <Database size={18} />
                  <span>PostgreSQL</span>
                </div>
                <span className="code-fragment fragment-one">&lt;build /&gt;</span>
                <span className="code-fragment fragment-two">ideas.into(reality)</span>
              </div>
            )}
            <div className="visual-bottom">
              <span className="status-dot" />
              {t('heroNote')}
              <Sparkles size={14} />
            </div>
          </motion.div>
        </div>
        <div className="container hero-bottom">
          <span>
            PYTHON <b>/</b> REACT <b>/</b> AI
          </span>
          <span>
            {t('stackNote')}
            <span className="down-arrow">↓</span>
          </span>
        </div>
      </section>
      <section className="container section">
        <SectionHeading number="01" title={t('selectedWork')}>
          <Link className="text-link" to="/projects">
            {t('allProjects')}
            <ArrowUpRight size={18} />
          </Link>
        </SectionHeading>
        {projects.isPending ? (
          <QueryState loading />
        ) : projects.error ? (
          <QueryState error={projects.error} retry={() => projects.refetch()} />
        ) : featured.length ? (
          <div className="project-grid">
            {featured.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-projects">
            <span className="empty-icon">
              <Code2 size={30} />
            </span>
            <div>
              <h3>{t('noProjects')}</h3>
              <p>{t('noProjectsBody')}</p>
            </div>
            {p.github_url && (
              <Button asChild variant="outline">
                <a href={p.github_url} target="_blank" rel="noreferrer">
                  {t('visitGithub')}
                  <ArrowUpRight size={17} />
                </a>
              </Button>
            )}
          </div>
        )}
      </section>
      <section className="experience-section">
        <div className="container section">
          <SectionHeading number="02" title={t('experience')} />
          <div className="timeline">
            {p.experience.map((exp, index) => (
              <div className="timeline-row" key={index}>
                <span className="timeline-period">{fm(exp.period)}</span>
                <div>
                  <h3>{exp.company}</h3>
                  <p className="text-primary">{tx(exp.role)}</p>
                  <p className="timeline-description">{tx(exp.description)}</p>
                  <div className="chips">
                    {exp.stack.map((s) => (
                      <span className="badge" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowUpRight size={20} className="text-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container contact-cta">
        <span className="eyebrow">03 / {t('contact')}</span>
        <h2>{t('contactTitle')}</h2>
        <p>{t('contactSubtitle')}</p>
        <Button asChild>
          <Link to="/contact">
            {t('letsTalk')}
            <ArrowUpRight size={19} />
          </Link>
        </Button>
      </section>
    </>
  );
}
