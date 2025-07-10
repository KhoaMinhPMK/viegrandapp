import Feather from 'react-native-vector-icons/Feather';

export interface Card {
  id: number; // Unique ID for each card instance
  value: string; // The underlying symbol/icon name that determines a match
  isFlipped: boolean;
  isMatched: boolean;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultySetting {
  name: string;
  rows: number;
  cols: number;
  description: string;
  icon: string; // Icon for the difficulty selection card
}

// Define a set of icons to be used for the cards
// We'll need (rows * cols) / 2 unique icons for the hardest difficulty
const POSSIBLE_ICONS: string[] = [
  'anchor', 'archive', 'award', 'aperture', 'bar-chart-2', 'battery-charging',
  'bell', 'bluetooth', 'book-open', 'briefcase', 'camera', 'cast',
  'check-circle', 'chrome', 'clipboard', 'cloud', 'codepen', 'compass',
  'cpu', 'credit-card', 'crop', 'crosshair', 'database', 'disc',
  'dollar-sign', 'droplet', 'edit', 'eye', 'feather', 'figma',
  'film', 'filter', 'flag', 'folder', 'gift', 'globe',
  'grid', 'hard-drive', 'hash', 'headphones', 'heart', 'help-circle',
  'home', 'image', 'inbox', 'key', 'layers', 'layout',
  'life-buoy', 'link', 'lock', 'log-in', 'map-pin', 'maximize',
  'mic', 'minimize', 'monitor', 'moon', 'music', 'navigation',
  'package', 'paperclip', 'pause-circle', 'pen-tool', 'percent', 'phone',
  'pie-chart', 'play-circle', 'plus-circle', 'power', 'printer', 'radio',
  'refresh-cw', 'rss', 'save', 'scissors', 'search', 'send',
  'settings', 'shield', 'shopping-bag', 'shopping-cart', 'shuffle', 'sidebar',
  'skip-back', 'skip-forward', 'slash', 'sliders', 'smartphone', 'speaker',
  'square', 'star', 'sun', 'sunrise', 'sunset', 'tablet',
  'tag', 'target', 'thermometer', 'thumbs-down', 'thumbs-up', 'tool',
  'trash-2', 'trending-up', 'truck', 'tv', 'twitch', 'twitter',
  'type', 'umbrella', 'unlock', 'upload-cloud', 'user', 'video',
  'volume-2', 'watch', 'wifi', 'wind', 'x-circle', 'youtube',
  'zap', 'zoom-in', 'zoom-out'
];

export const DIFFICULTIES: Record<Difficulty, DifficultySetting> = {
  easy: {
    name: 'Dễ',
    rows: 4,
    cols: 3,
    description: 'Lưới nhỏ, dễ nhớ',
    icon: 'award',
  },
  medium: {
    name: 'Trung bình',
    rows: 4,
    cols: 4,
    description: 'Thử thách vừa phải',
    icon: 'shield',
  },
  hard: {
    name: 'Khó',
    rows: 5,
    cols: 4,
    description: 'Kiểm tra trí nhớ tối đa',
    icon: 'zap',
  },
};

export class MemoryMatchLogic {
  static generateGrid(difficulty: Difficulty): Card[][] {
    const settings = DIFFICULTIES[difficulty];
    const numPairs = (settings.rows * settings.cols) / 2;

    if (numPairs > POSSIBLE_ICONS.length) {
      console.warn('Not enough unique icons for the selected difficulty!');
      // Potentially fallback to a smaller grid or repeat icons
    }

    // Select a subset of icons for the current game
    const gameIcons = POSSIBLE_ICONS.slice(0, numPairs);

    // Create card pairs
    let cardId = 0;
    const cards: Card[] = [];
    gameIcons.forEach(iconValue => {
      cards.push({ id: cardId++, value: iconValue, isFlipped: false, isMatched: false });
      cards.push({ id: cardId++, value: iconValue, isFlipped: false, isMatched: false });
    });

    // Shuffle cards (Fisher-Yates shuffle)
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Distribute cards into a grid
    const grid: Card[][] = [];
    let cardIndex = 0;
    for (let r = 0; r < settings.rows; r++) {
      const row: Card[] = [];
      for (let c = 0; c < settings.cols; c++) {
        row.push(cards[cardIndex++]);
      }
      grid.push(row);
    }

    return grid;
  }
} 