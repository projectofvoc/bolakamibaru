import React from 'react';
import { icons } from 'lucide-react';

export type BadgeColor = 'primary' | 'red' | 'yellow' | 'blue' | 'purple' | 'green';
export type BadgeIcon = 'none' | 'flame' | 'star' | 'trophy' | 'gift' | 'sparkles' | 'crown' | 'zap';

export const BADGE_COLOR_OPTIONS: { value: BadgeColor; label: string; swatch: string }[] = [
  { value: 'primary', label: 'Primary', swatch: 'bg-primary' },
  { value: 'red', label: 'Merah', swatch: 'bg-red-500' },
  { value: 'yellow', label: 'Kuning', swatch: 'bg-yellow-500' },
  { value: 'blue', label: 'Biru', swatch: 'bg-blue-500' },
  { value: 'purple', label: 'Ungu', swatch: 'bg-purple-500' },
  { value: 'green', label: 'Hijau', swatch: 'bg-emerald-500' },
];

export const BADGE_ICON_OPTIONS: { value: BadgeIcon; label: string; iconName: string | null }[] = [
  { value: 'none', label: 'Tanpa Icon', iconName: null },
  { value: 'flame', label: 'Flame', iconName: 'Flame' },
  { value: 'star', label: 'Star', iconName: 'Star' },
  { value: 'trophy', label: 'Trophy', iconName: 'Trophy' },
  { value: 'gift', label: 'Gift', iconName: 'Gift' },
  { value: 'sparkles', label: 'Sparkles', iconName: 'Sparkles' },
  { value: 'crown', label: 'Crown', iconName: 'Crown' },
  { value: 'zap', label: 'Zap', iconName: 'Zap' },
];

const COLOR_CLASS: Record<BadgeColor, string> = {
  primary: 'bg-primary text-primary-foreground',
  red: 'bg-red-500 text-white',
  yellow: 'bg-yellow-500 text-black',
  blue: 'bg-blue-500 text-white',
  purple: 'bg-purple-500 text-white',
  green: 'bg-emerald-500 text-white',
};

const ICON_NAME: Record<BadgeIcon, string | null> = {
  none: null,
  flame: 'Flame',
  star: 'Star',
  trophy: 'Trophy',
  gift: 'Gift',
  sparkles: 'Sparkles',
  crown: 'Crown',
  zap: 'Zap',
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
  const iconName = ICON_NAME[icon];
  const IconCmp = iconName ? (icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName] : null;
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