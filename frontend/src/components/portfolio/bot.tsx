import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSettings } from '@/lib/providers';
import type { BotAnswer } from '@/types';
export function PortfolioBot() {
  const { t, locale } = useSettings();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{ question: string; answer: BotAnswer }[]>([]);
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const mutation = useMutation({
    mutationFn: (q: string) =>
      api<BotAnswer>('/assistant/', {
        method: 'POST',
        body: JSON.stringify({ question: q, locale }),
      }),
    onSuccess: (answer, q) => {
      setHistory((h) => [...h, { question: q, answer }]);
      setQuestion('');
    },
  });
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'nearest' });
  }, [history, open]);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  return (
    <div className="bot-root">
      {open && (
        <section
          className="bot-panel"
          aria-label={t('botTitle')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div className="bot-header">
            <span>
              <Bot size={20} />
              {t('botTitle')}
            </span>
            <button className="icon-button" aria-label={t('close')} onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <div className="bot-messages" aria-live="polite">
            <p className="bot-answer">{t('botWelcome')}</p>
            <small className="text-muted">{t('botDisclosure')}</small>
            <div className="bot-suggestions">
              {[t('botPython'), t('botContact'), t('botCV')].map((q) => (
                <button key={q} disabled={mutation.isPending} onClick={() => mutation.mutate(q)}>
                  {q}
                </button>
              ))}
            </div>
            {history.map((row, i) => (
              <div key={i}>
                <p className="bot-question">{row.question}</p>
                <div className="bot-answer">
                  <p>{row.answer.answer}</p>
                  {row.answer.projects.map((p) => (
                    <Link
                      className="bot-project"
                      to={p.url}
                      key={p.url}
                      onClick={() => setOpen(false)}
                    >
                      <strong>
                        {p.title}
                        <ArrowUpRight size={15} />
                      </strong>
                      <span>{p.summary}</span>
                      <small>{p.result}</small>
                    </Link>
                  ))}
                  {row.answer.links.map((l) => (
                    <Link key={l.url} to={l.url} onClick={() => setOpen(false)}>
                      {l.label} ↗{' '}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {mutation.isPending && <p>{t('loading')}</p>}
            {mutation.error && (
              <p className="error" role="alert">
                {t('botError')}
              </p>
            )}
            <div ref={bottom} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (question.trim().length > 1) mutation.mutate(question);
            }}
          >
            <input
              ref={input}
              aria-label={t('botPlaceholder')}
              placeholder={t('botPlaceholder')}
              maxLength={500}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              className="icon-button"
              disabled={mutation.isPending || question.trim().length < 2}
              aria-label={t('send')}
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      <button
        className="bot-launcher"
        aria-label={t('botTitle')}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={23} /> : <MessageCircle size={23} />}
        <span>{t('askMe')}</span>
      </button>
    </div>
  );
}
