// 📁 src/types/react-player.d.ts
declare module "react-player" {
  import { Component } from "react";

  // -------------------- Config YouTube --------------------
  export interface YouTubeConfig {
    playerVars?: {
      autoplay?: 0 | 1;
      modestbranding?: 0 | 1;
      rel?: 0 | 1;
      start?: number;
      end?: number;
      [key: string]: any;
    };
  }

  // -------------------- Config Vimeo --------------------
  export interface VimeoConfig {
    playerOptions?: {
      autoplay?: boolean;
      byline?: boolean;
      portrait?: boolean;
      title?: boolean;
      [key: string]: any;
    };
  }

  // -------------------- Config SoundCloud --------------------
  export interface SoundCloudConfig {
    options?: {
      auto_play?: boolean;
      buying?: boolean;
      liking?: boolean;
      download?: boolean;
      sharing?: boolean;
      show_artwork?: boolean;
      show_comments?: boolean;
      [key: string]: any;
    };
  }

  // -------------------- Config Facebook --------------------
  export interface FacebookConfig {
    appId?: string;
    [key: string]: any;
  }

  // -------------------- Config DailyMotion --------------------
  export interface DailyMotionConfig {
    params?: {
      autoplay?: boolean;
      controls?: boolean;
      [key: string]: any;
    };
  }

  // -------------------- Config Twitch --------------------
  export interface TwitchConfig {
    options?: {
      autoplay?: boolean;
      muted?: boolean;
      [key: string]: any;
    };
  }

  // -------------------- Config fichiers locaux --------------------
  export interface FileConfig {
    attributes?: React.VideoHTMLAttributes<HTMLVideoElement> & {
      playsInline?: boolean;
      muted?: boolean;
    };
  }

  // -------------------- Config complète --------------------
  export interface ReactPlayerConfig {
    youtube?: YouTubeConfig;
    vimeo?: VimeoConfig;
    soundcloud?: SoundCloudConfig;
    facebook?: FacebookConfig;
    dailymotion?: DailyMotionConfig;
    twitch?: TwitchConfig;
    file?: FileConfig;
    [key: string]: any;
  }

  // -------------------- Props du composant --------------------
  export interface ReactPlayerProps {
    url: string | string[];
    playing?: boolean;
    controls?: boolean;
    width?: string | number;
    height?: string | number;
    muted?: boolean;
    onEnded?: () => void;
    onError?: (e: any) => void;
    onReady?: () => void;
    onStart?: () => void;
    onDuration?: (duration: number) => void;
    onProgress?: (state: { played: number; loaded: number }) => void;
    config?: ReactPlayerConfig;
  }

  // -------------------- Composant --------------------
  export default class ReactPlayer extends Component<ReactPlayerProps> {
    static canPlay(url: string): boolean;
     getInternalPlayer(): HTMLVideoElement | null;

  }
}
