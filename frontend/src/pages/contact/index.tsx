import { useState } from 'react';
import { Mail, Linkedin, Github, ArrowUpRight, Check, Send, MapPin } from 'lucide-react';
import { useProfile } from '@/pages/home/hooks';
import { useSettings } from '@/lib/providers';
import { contactSchema } from '@/lib/schemas';
import { useSendContact } from './hooks';
import { Button } from '@/components/ui/button';
export default function Contact() {
  const { data: p } = useProfile();
  const { t, locale, tx } = useSettings();
  const mutation = useSendContact();
  const [validation, setValidation] = useState('');
  return (
    <div className="container page">
      <div className="page-heading">
        <span className="eyebrow">04 / {t('contact')}</span>
        <h1>{t('contactPageTitle')}</h1>
        <p>{t('contactSubtitle')}</p>
      </div>
      <div className="contact-grid">
        <aside>
          <h2>{t('directContact')}</h2>
          <div className="direct-links">
            {p?.email && (
              <a href={`mailto:${p.email}`}>
                <Mail />
                {p.email}
                <ArrowUpRight size={17} />
              </a>
            )}
            {p?.linkedin_url && (
              <a href={p.linkedin_url} target="_blank" rel="noreferrer">
                <Linkedin />
                LinkedIn
                <ArrowUpRight size={17} />
              </a>
            )}
            {p?.github_url && (
              <a href={p.github_url} target="_blank" rel="noreferrer">
                <Github />
                GitHub
                <ArrowUpRight size={17} />
              </a>
            )}
          </div>
          {p && (
            <>
              <p className="hero-location">
                <MapPin size={16} />
                {p.location} · UTC-3
              </p>
              <p className="availability">
                <span className="status-dot" />
                {tx(p.availability)}
              </p>
            </>
          )}
        </aside>
        <div className="card contact-form">
          {mutation.isSuccess ? (
            <div role="status" className="success-message">
              <Check size={35} />
              <h2>{t('messageSaved')}</h2>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                const parsed = contactSchema.safeParse(data);
                if (!parsed.success) {
                  setValidation(t('contactValidation'));
                  return;
                }
                setValidation('');
                mutation.mutate({ ...parsed.data, locale });
              }}
            >
              <label>
                {t('name')}
                <input name="name" required minLength={2} maxLength={120} autoComplete="name" />
              </label>
              <label>
                {t('email')}
                <input name="email" type="email" required maxLength={254} autoComplete="email" />
              </label>
              <label>
                {t('message')}
                <textarea name="message" rows={6} required minLength={10} maxLength={5000} />
              </label>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <p className="form-help">{t('contactPrivacy')}</p>
              {validation && (
                <p role="alert" className="error">
                  {validation}
                </p>
              )}
              {mutation.error && (
                <p role="alert" className="error">
                  {mutation.error.message}
                </p>
              )}
              <Button disabled={mutation.isPending} type="submit">
                {mutation.isPending ? t('sending') : t('sendMessage')}
                <Send size={17} />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
