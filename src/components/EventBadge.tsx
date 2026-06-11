import React from 'react';
import {
  Globe,
  Send,
  MessageCircle,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MessagesSquare,
  type LucideIcon,
} from 'lucide-react';
import { TikTokIcon, ThreadsIcon } from '@/components/icons/SocialIcons';

export type BadgeColor = 'primary' | 'red' | 'yellow' | 'blue' | 'purple' | 'green';
export type BadgeIcon =
  | 'none'
  | 'web'
  | 'telegram'
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'twitter'
  | 'threads'
  | 'discord';

export const BADGE_COLOR_OPTIONS: { value: BadgeColor; label: string; swatch: string }[] = [
  { value: 'primary', label: 'Primary', swatch: 'bg-primary' },
  { value: 'red', label: 'Merah', swatch: 'bg-red-500' },
  { value: 'yellow', label: 'Kuning', swatch: 'bg-yellow-500' },
  { value: 'blue', label: 'Biru', swatch: 'bg-blue-500' },
  { value: 'purple', label: 'Ungu', swatch: 'bg-purple-500' },
  { value: 'green', label: 'Hijau', swatch: 'bg-emerald-500' },
];

type IconCmp = React.ComponentType<{ className?: string }>;

const ICON_MAP: Record<BadgeIcon, IconCmp | null> = {
  none: null,
  web: Globe as LucideIcon,
  telegram: Send as LucideIcon,
  whatsapp: MessageCircle as LucideIcon,
  facebook: Facebook as LucideIcon,
  instagram: Instagram as LucideIcon,
  tiktok: TikTokIcon,
  youtube: Youtube as LucideIcon,
  twitter: Twitter as LucideIcon,
  threads: ThreadsIcon,
  discord: MessagesSquare as LucideIcon,
};

export const BADGE_ICON_OPTIONS: { value: BadgeIcon; label: string }[] = [
  { value: 'none', label: 'Tanpa Icon' },
  { value: 'web', label: 'Website' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'threads', label: 'Threads' },
  { value: 'discord', label: 'Discord' },
];

export const getBadgeIconComponent = (icon: BadgeIcon): IconCmp | null => ICON_MAP[icon] || null;

const COLOR_CLASS: Record<BadgeColor, string> = {
  primary: 'bg-primary text-primary-foreground',
  red: 'bg-red-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  blue: 'bg-blue-500 text-white',
  purple: 'bg-purple-500 text-white',
  green: 'bg-emerald-500 text-white',
};

interface EventBadgeProps {
  label: string;
  color?: BadgeColor;
  icon?: BadgeIcon;
  size?: 'sm' | 'md';
  className?: string;
}

const EventBadge: React.FC<EventBadgeProps> = ({
  label,
  color = 'primary',
  icon = 'none',
  size = 'sm',
  className = '',
}) => {
  const IconCmp = getBadgeIconComponent(icon);
  const sizeCls = size === 'md' ? 'text-sm px-3 py-1' : 'text-[11px] px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold shadow-md backdrop-blur ${COLOR_CLASS[color]} ${sizeCls} ${className}`}
    >
      {IconCmp && <IconCmp className={size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span className="leading-none">{label}</span>
    </span>
  );
};

export default EventBadge;