import React from 'react';
import { CalendarDays, Globe } from 'lucide-react';
import { LANGUAGES, useTranslation } from '../i18n/translations';

export function LogoMark({
  className = 'size-8 rounded-xl',
  iconClassName = 'size-4',
}: {
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center bg-primary text-primary-foreground shadow-xs ${className}`}
    >
      <CalendarDays className={iconClassName} />
    </span>
  );
}

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted/50 p-0.5 text-xs">
      <Globe className="mx-1.5 size-3.5 text-muted-foreground" />
      {LANGUAGES.map((item) => {
        const active = lang === item.code;
        return (
          <button
            key={item.code}
            type="button"
            onClick={() => setLang(item.code)}
            className={`cursor-pointer rounded-md px-2 py-1 font-medium transition-colors whitespace-nowrap shrink-0 ${
              active
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
