import React, { useState, useMemo } from 'react';
import { Award, Building2, Plus, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import { GREGORIAN_MONTH_NAMES } from '../lib/calendarEngine';

export interface CommunitySponsor {
  id: string;
  businessName: string;
  tagline: string;
  contact: string;
  tier: 'cell' | 'banner' | 'patron';
  amount: number;
  monthIndex: number | 'all'; // 0..11 or 'all'
  accentColor?: string;
}

export const DEFAULT_SPONSORS: CommunitySponsor[] = [
  {
    id: 'sp-1',
    businessName: 'Kingston Kosher Bakery & Cafe',
    tagline: 'Fresh Challah, Babka & Artisanal Pastries Daily · Pas Yisroel',
    contact: '(718) 555-0148 · 392 Kingston Ave',
    tier: 'banner',
    amount: 360,
    monthIndex: 0,
  },
  {
    id: 'sp-2',
    businessName: 'Crown Judaica & Seforim',
    tagline: 'Sterling Silver Candlesticks, Mezuzot & Custom Embossing',
    contact: '(718) 555-0192 · crownjudaica.example.com',
    tier: 'cell',
    amount: 180,
    monthIndex: 'all',
  },
];

const TIER_INFO: Record<
  CommunitySponsor['tier'],
  { label: string; defaultAmount: number; placement: string }
> = {
  cell: {
    label: 'Empty Grid Cell Ad ($180)',
    defaultAmount: 180,
    placement: 'Fills blank calendar grid cells',
  },
  banner: {
    label: 'Month Footer Banner ($360)',
    defaultAmount: 360,
    placement: 'Full-width strip below month grid',
  },
  patron: {
    label: 'Chai Year Patron ($1,000)',
    defaultAmount: 1000,
    placement: 'Featured on all months & masthead',
  },
};

export function SponsorGridManager({
  sponsors,
  enabled,
  onToggleEnabled,
  onAddSponsor,
  onRemoveSponsor,
}: {
  sponsors: CommunitySponsor[];
  enabled: boolean;
  onToggleEnabled: (next: boolean) => void;
  onAddSponsor: (sponsor: CommunitySponsor) => void;
  onRemoveSponsor: (id: string) => void;
}) {
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contact, setContact] = useState('');
  const [tier, setTier] = useState<CommunitySponsor['tier']>('cell');
  const [amount, setAmount] = useState<number>(180);
  const [monthIndex, setMonthIndex] = useState<number | 'all'>('all');

  const totalRaised = useMemo(
    () => sponsors.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [sponsors]
  );

  const handleTierChange = (nextTier: CommunitySponsor['tier']) => {
    setTier(nextTier);
    setAmount(TIER_INFO[nextTier].defaultAmount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    onAddSponsor({
      id: `sp-${Date.now().toString(36)}`,
      businessName: businessName.trim(),
      tagline: tagline.trim() || 'Proud supporter of our community calendar',
      contact: contact.trim(),
      tier,
      amount: Number(amount) || TIER_INFO[tier].defaultAmount,
      monthIndex,
    });

    if (!enabled) onToggleEnabled(true);
    setBusinessName('');
    setTagline('');
    setContact('');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary" />
          <h2 className="font-display text-base font-semibold">
            Sponsor &amp; Ad-Box Grid
          </h2>
        </div>
        <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
          ${totalRaised.toLocaleString()} raised
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Place local business sponsor ads or family dedications into empty grid cells and monthly footer banners.
      </p>

      <label className="mt-3.5 flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted/25 px-3.5 py-2 text-xs">
        <div>
          <span className="block font-semibold text-foreground">
            Show Sponsor Ad-Boxes on Calendar
          </span>
          <span className="text-[11px] text-muted-foreground">
            Auto-populates blank grid cells &amp; month footers
          </span>
        </div>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          className="size-4 accent-primary"
        />
      </label>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            Business or Sponsor Name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Mendel's Glatt Market / Cohen Family"
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Ad Placement Tier
            </label>
            <select
              value={tier}
              onChange={(e) => handleTierChange(e.target.value as CommunitySponsor['tier'])}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="cell">Empty Cell Ad ($180)</option>
              <option value="banner">Month Banner ($360)</option>
              <option value="patron">Year Patron ($1,000)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Target Month
            </label>
            <select
              value={monthIndex === 'all' ? 'all' : String(monthIndex)}
              onChange={(e) =>
                setMonthIndex(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All 12 Months (Rotating)</option>
              {GREGORIAN_MONTH_NAMES.map((mName, idx) => (
                <option key={mName} value={idx}>
                  {mName} Only
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground">
            Tagline or Dedication Copy
          </label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Wishing the community a sweet & kosher New Year"
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Phone / Website
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="(718) 555-0199"
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground">
              Pledge Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs tabular-nums outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!businessName.trim()}
          className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-40 whitespace-nowrap shrink-0"
        >
          <Plus className="size-4" />
          <span>Add Sponsor to Calendar</span>
        </button>
      </form>

      {/* Active Sponsors List */}
      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
          <span>Active Sponsors ({sponsors.length})</span>
          <span>Tier &amp; Placement</span>
        </div>

        {sponsors.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            No sponsors added yet. Add a business or family dedication above.
          </p>
        ) : (
          <div className="mt-2.5 flex max-h-52 flex-col gap-2 overflow-y-auto pr-0.5">
            {sponsors.map((sp) => (
              <div
                key={sp.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background p-2.5 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Award className="size-3.5 shrink-0 text-chabad" />
                    <span className="truncate font-semibold text-foreground">
                      {sp.businessName}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {sp.tagline}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      ${sp.amount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {sp.tier === 'cell'
                        ? 'Grid Cell Ad'
                        : sp.tier === 'banner'
                        ? 'Month Banner'
                        : 'Year Patron'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {sp.monthIndex === 'all'
                        ? 'All Months'
                        : GREGORIAN_MONTH_NAMES[sp.monthIndex]?.slice(0, 3)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${sp.businessName}`}
                  onClick={() => onRemoveSponsor(sp.id)}
                  className="flex min-h-[38px] min-w-[38px] cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-red-600"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
