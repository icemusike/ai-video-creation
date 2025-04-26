export interface TextElement {
  id: string;
  content: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  position: {
    x: number; // percentage from left
    y: number; // percentage from top
  };
  width: number; // percentage of slide width
  textAlign: 'left' | 'center' | 'right';
  zIndex: number;
}

export interface Slide {
  id: string;
  content: string;
  duration: number;
  voiceover?: string;
  background: {
    type: 'color' | 'image' | 'video';
    value: string; // color hex, image URL, or video URL
  };
  textColor: string;
  textPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
  textPadding: number;
  textAlign?: 'left' | 'center' | 'right';
  textElements?: TextElement[];
}

export interface AudioTrack {
  id: string;
  src: string;
  startTime: number;
  duration: number;
}

export interface Project {
  id: string;
  name: string;
  slides: Slide[];
  audioTracks: AudioTrack[];
  totalDuration: number;
}
