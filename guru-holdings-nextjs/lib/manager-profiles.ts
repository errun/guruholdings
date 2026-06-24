import profiles from '@/data-source/manager-profiles.json';
import type { Locale } from '@/lib/i18n/site';

export type ManagerProfile = {
  overview: string;
  style: string;
  history: string;
  scale: string;
  leader: string;
  record: string;
};

type LocalizedProfile = {
  [Key in keyof ManagerProfile]: Partial<Record<Locale, string>>;
};

const profileMap = profiles as Record<string, LocalizedProfile>;

export function getManagerProfile(managerId: string, locale: Locale): ManagerProfile | null {
  const profile = profileMap[managerId];
  if (!profile) return null;

  return {
    overview: profile.overview[locale] || profile.overview.en || '',
    style: profile.style[locale] || profile.style.en || '',
    history: profile.history[locale] || profile.history.en || '',
    scale: profile.scale[locale] || profile.scale.en || '',
    leader: profile.leader[locale] || profile.leader.en || '',
    record: profile.record[locale] || profile.record.en || '',
  };
}
