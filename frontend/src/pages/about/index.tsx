import { useProfile } from './hooks';
import { useSettings } from '@/lib/providers';
import { QueryState } from '@/components/shared/query-state';
import { SectionHeading } from '@/components/portfolio/section-heading';
export default function About() {
  const query = useProfile();
  const { t, tx, fm } = useSettings();
  if (!query.data) return <QueryState loading={query.isPending} error={query.error} />;
  const p = query.data;
  return (
    <div className="container page">
      <div className="about-heading">
        <div className="page-heading">
          <span className="eyebrow">02 / {t('about')}</span>
          <h1>{t('aboutTitle')}</h1>
          <p>{tx(p.summary)}</p>
        </div>
        {p.photo ? (
          <img className="about-photo" src={p.photo} alt={p.full_name} />
        ) : (
          <div className="about-monogram">
            {p.full_name
              .split(' ')
              .map((s) => s[0])
              .join('')}
            <span>build. learn. repeat.</span>
          </div>
        )}
      </div>
      <section className="section">
        <SectionHeading number="01" title={t('skills')} />
        <p className="text-muted skills-note">{t('skillsNote')}</p>
        <div className="skills-grid">
          {p.skills.map((group, i) => (
            <div className="skill-group" key={i}>
              <span className="eyebrow">0{i + 1}</span>
              <h3>{tx(group.name)}</h3>
              <div className="chips">
                {group.items.map((item) => (
                  <span className="badge" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading number="02" title={t('education')} />
        <div className="education-list">
          {p.education.map((item, i) => (
            <div className="education-row" key={i}>
              <div>
                <h3>{tx(item.title)}</h3>
                <p>{item.school}</p>
              </div>
              <div>
                <span>{fm(item.period)}</span>
                <p className="text-primary">{tx(item.status)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>{t('languages')}</h2>
        <div className="chips languages">
          {p.languages.map((l, i) => (
            <span className="badge" key={i}>
              {tx(l.name)} · {fm(l.level)}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
