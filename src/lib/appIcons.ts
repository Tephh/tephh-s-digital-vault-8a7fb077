import spotifyIcon from '@/assets/icons/spotify.png';
import youtubeIcon from '@/assets/icons/youtube.png';
import capcutIcon from '@/assets/icons/capcut.png';
import alightIcon from '@/assets/icons/alight.png';
import discordIcon from '@/assets/icons/discord.png';

export const appIcons: Record<string, string> = {
  spotify: spotifyIcon,
  youtube: youtubeIcon,
  capcut: capcutIcon,
  alight: alightIcon,
  discord: discordIcon,
};

export const getAppIcon = (app: string): string => {
  return appIcons[app] || spotifyIcon;
};

export const getAppColor = (app: string): string => {
  const colors: Record<string, string> = {
    spotify: 'from-green-500 to-green-600',
    youtube: 'from-red-500 to-red-600',
    capcut: 'from-violet-500 to-purple-600',
    alight: 'from-orange-500 to-pink-500',
    discord: 'from-indigo-500 to-purple-600',
  };
  return colors[app] || 'from-primary to-primary';
};

export const getAppName = (app: string): string => {
  const names: Record<string, string> = {
    spotify: 'Spotify',
    youtube: 'YouTube',
    capcut: 'CapCut',
    alight: 'Alight Motion',
    discord: 'Discord',
  };
  return names[app] || app;
};

export const getAppEmoji = (app: string): string => {
  const emojis: Record<string, string> = {
    spotify: '🎵',
    youtube: '📺',
    capcut: '🎬',
    alight: '✨',
    discord: '💬',
  };
  return emojis[app] || '📱';
};
