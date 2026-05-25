import {FooterGrid} from '@/components/ui/FooterGrid';
import {getProfiles} from '@/lib/server/getProfiles';
import {currentYear} from '@/lib/utils/datetime';

const FOOTER_NAV_GROUPS = [
  {
    label: 'Kapela',
    links: [
      {label: 'O nás', href: '#about-us'},
      {label: 'Fotogalerie', href: '/fotogalerie'},
      {label: 'Videogalerie', href: '#videogallery'},
      {label: 'Diskografie', href: '#discography'},
      {label: 'Sestava', href: '#lineup'},
    ],
  },
  {
    label: '',
    links: [
      {label: 'Koncerty', href: '/koncerty'},
      {label: 'Merch', href: '/merch'},
      {label: 'Kontakt', href: '#contact'},
    ],
  },
  {
    label: 'Pro pořadatele',
    href: '#for-organizers',
    links: [],
  },
] as const;

/** Public footer data wrapper for FooterGrid. */
export async function Footer() {
  const profiles = await getProfiles();

  const socialLinks = profiles.map((profile) => ({
    href: profile.link,
    label: profile.name,
    icon: profile.icon,
    iconColor: profile.iconColor,
  }));

  return (
    <FooterGrid
      logoWidth={140}
      logoHeight={35}
      companyDescription="Rock/metalová kapela z okolí Uherského Hradiště."
      navGroups={FOOTER_NAV_GROUPS}
      socialTitle="Sociální sítě"
      socialLinks={socialLinks}
      copyrightText={`FREE FALL © ${currentYear()}. Všechna práva vyhrazena.`}
    />
  );
}
