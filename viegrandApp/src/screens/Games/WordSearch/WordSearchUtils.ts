export interface GridCell {
  letter: string;
  row: number;
  col: number;
  isPartOfWord: boolean;
  wordId?: string;
  isSelected: boolean;
  isFound: boolean;
}

export interface WordInfo {
  id: string;
  word: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: Direction;
  isFound: boolean;
}

export type Direction = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Theme = 'animals' | 'cities' | 'plants';

export interface DifficultySetting {
  name: string;
  gridSize: number;
  wordCount: number;
  description: string;
  icon: string;
}

export interface ThemeSetting {
  name: string;
  icon: string;
  description: string;
  words: string[];
}

// Difficulty settings
export const DIFFICULTIES: Record<Difficulty, DifficultySetting> = {
  easy: {
    name: 'Dễ',
    gridSize: 8,
    wordCount: 5,
    description: 'Lưới nhỏ, ít từ',
    icon: 'smile',
  },
  medium: {
    name: 'Trung bình',
    gridSize: 10,
    wordCount: 7,
    description: 'Lưới vừa, nhiều từ hơn',
    icon: 'target',
  },
  hard: {
    name: 'Khó',
    gridSize: 12,
    wordCount: 9,
    description: 'Lưới lớn, nhiều từ phức tạp',
    icon: 'zap',
  },
};

// Theme data với từ tiếng Việt
export const THEMES: Record<Theme, ThemeSetting> = {
  animals: {
    name: 'Động vật',
    icon: 'heart',
    description: 'Tìm tên các loài động vật',
    words: [
      'CHO', 'MEO', 'BO', 'HEO', 'GA', 'VIT',
      'CHUOT', 'THO', 'KHỈNH', 'VOI', 'SƯA', 
      'CƯU', 'NGỰA', 'CHIM', 'CA', 'RỒNG',
      'BAO', 'SƯ TỬ', 'GÀNG', 'ẾCH', 'RẮN'
    ],
  },
  cities: {
    name: 'Địa danh',
    icon: 'map-pin',
    description: 'Tìm tên thành phố Việt Nam',
    words: [
      'HÀ NỘI', 'SÀI GÒN', 'ĐÀ NẴNG', 'HUẾ', 'CẦN THƠ',
      'NHA TRANG', 'HỘI AN', 'VŨNG TÀU', 'ĐÀ LẠT', 'PHAN THIẾT',
      'HÀ LONG', 'SAPA', 'MŨI NÉ', 'PHÚ QUỐC', 'CÁT BÀ',
      'MAI CHÂU', 'TAM ĐẢO', 'BÀ NÀ', 'CÚC PHƯƠNG'
    ],
  },
  plants: {
    name: 'Thực vật',
    icon: 'sun',
    description: 'Tìm tên cây cối, hoa quả',
    words: [
      'ĐÀO', 'MAI', 'LAN', 'HỒNG', 'SEN', 'CÚC',
      'CHUỐI', 'XOÀI', 'CAM', 'CHANH', 'DỪA', 'ỔI',
      'THỐT NỐT', 'VẢI', 'NHÃN', 'CHÔM CHÔM', 'SẦU RIÊNG',
      'BÔNG', 'LÚA', 'NGÔ', 'LẠC', 'ĐẬU'
    ],
  },
};

export class WordSearchLogic {
  static generateGrid(difficulty: Difficulty, theme: Theme): {
    grid: GridCell[][];
    words: WordInfo[];
  } {
    const { gridSize, wordCount } = DIFFICULTIES[difficulty];
    const themeWords = THEMES[theme].words;
    
    // Chọn từ ngẫu nhiên
    const selectedWords = this.selectRandomWords(themeWords, wordCount);
    
    // Tạo lưới trống
    const grid = this.createEmptyGrid(gridSize);
    const placedWords: WordInfo[] = [];
    
    // Đặt từ vào lưới
    selectedWords.forEach((word, index) => {
      const wordInfo = this.placeWordInGrid(grid, word, `word-${index}`);
      if (wordInfo) {
        placedWords.push(wordInfo);
      }
    });
    
    // Điền chữ cái ngẫu nhiên vào ô trống
    this.fillEmptySpaces(grid);
    
    return { grid, words: placedWords };
  }
  
  private static selectRandomWords(words: string[], count: number): string[] {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }
  
  private static createEmptyGrid(size: number): GridCell[][] {
    const grid: GridCell[][] = [];
    for (let row = 0; row < size; row++) {
      grid[row] = [];
      for (let col = 0; col < size; col++) {
        grid[row][col] = {
          letter: '',
          row,
          col,
          isPartOfWord: false,
          isSelected: false,
          isFound: false,
        };
      }
    }
    return grid;
  }
  
  private static placeWordInGrid(
    grid: GridCell[][],
    word: string,
    wordId: string
  ): WordInfo | null {
    const size = grid.length;
    const cleanWord = word.replace(/\s/g, ''); // Loại bỏ khoảng trắng
    const attempts = 50; // Số lần thử đặt từ
    
    for (let attempt = 0; attempt < attempts; attempt++) {
      const direction = this.getRandomDirection();
      const position = this.getRandomPosition(size, cleanWord.length, direction);
      
      if (this.canPlaceWord(grid, cleanWord, position, direction)) {
        this.placeWord(grid, cleanWord, position, direction, wordId);
        
        return {
          id: wordId,
          word,
          startRow: position.row,
          startCol: position.col,
          endRow: position.row + (direction === 'vertical' || direction.includes('diagonal') ? cleanWord.length - 1 : 0),
          endCol: position.col + (direction === 'horizontal' || direction.includes('diagonal') ? cleanWord.length - 1 : 0),
          direction,
          isFound: false,
        };
      }
    }
    
    return null; // Không thể đặt từ
  }
  
  private static getRandomDirection(): Direction {
    const directions: Direction[] = ['horizontal', 'vertical', 'diagonal-down', 'diagonal-up'];
    return directions[Math.floor(Math.random() * directions.length)];
  }
  
  private static getRandomPosition(
    gridSize: number,
    wordLength: number,
    direction: Direction
  ): { row: number; col: number } {
    let maxRow = gridSize - 1;
    let maxCol = gridSize - 1;
    
    switch (direction) {
      case 'horizontal':
        maxCol = gridSize - wordLength;
        break;
      case 'vertical':
        maxRow = gridSize - wordLength;
        break;
      case 'diagonal-down':
        maxRow = gridSize - wordLength;
        maxCol = gridSize - wordLength;
        break;
      case 'diagonal-up':
        maxCol = gridSize - wordLength;
        break;
    }
    
    return {
      row: Math.floor(Math.random() * (maxRow + 1)),
      col: Math.floor(Math.random() * (maxCol + 1)),
    };
  }
  
  private static canPlaceWord(
    grid: GridCell[][],
    word: string,
    position: { row: number; col: number },
    direction: Direction
  ): boolean {
    for (let i = 0; i < word.length; i++) {
      const { row, col } = this.getLetterPosition(position, direction, i);
      
      if (row < 0 || row >= grid.length || col < 0 || col >= grid[0].length) {
        return false;
      }
      
      const cell = grid[row][col];
      if (cell.letter !== '' && cell.letter !== word[i]) {
        return false;
      }
    }
    
    return true;
  }
  
  private static placeWord(
    grid: GridCell[][],
    word: string,
    position: { row: number; col: number },
    direction: Direction,
    wordId: string
  ): void {
    for (let i = 0; i < word.length; i++) {
      const { row, col } = this.getLetterPosition(position, direction, i);
      const cell = grid[row][col];
      
      cell.letter = word[i];
      cell.isPartOfWord = true;
      cell.wordId = wordId;
    }
  }
  
  private static getLetterPosition(
    start: { row: number; col: number },
    direction: Direction,
    index: number
  ): { row: number; col: number } {
    switch (direction) {
      case 'horizontal':
        return { row: start.row, col: start.col + index };
      case 'vertical':
        return { row: start.row + index, col: start.col };
      case 'diagonal-down':
        return { row: start.row + index, col: start.col + index };
      case 'diagonal-up':
        return { row: start.row - index, col: start.col + index };
      default:
        return start;
    }
  }
  
  private static fillEmptySpaces(grid: GridCell[][]): void {
    const vietnameseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZĂÂĐÊÔƠƯ';
    
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col].letter === '') {
          const randomLetter = vietnameseLetters[Math.floor(Math.random() * vietnameseLetters.length)];
          grid[row][col].letter = randomLetter;
        }
      }
    }
  }
  
  // Check if selection forms a valid word
  static checkWordSelection(
    grid: GridCell[][],
    selectedCells: { row: number; col: number }[],
    words: WordInfo[]
  ): WordInfo | null {
    if (selectedCells.length < 2) return null;
    
    const selectedWord = selectedCells
      .map(cell => grid[cell.row][cell.col].letter)
      .join('');
    
    // Check forward and backward
    const reversedWord = selectedWord.split('').reverse().join('');
    
    for (const wordInfo of words) {
      if (wordInfo.isFound) continue;
      
      const cleanTargetWord = wordInfo.word.replace(/\s/g, '');
      if (selectedWord === cleanTargetWord || reversedWord === cleanTargetWord) {
        return wordInfo;
      }
    }
    
    return null;
  }
  
  // Get cells that form a straight line (for word selection)
  static getLineCells(
    startCell: { row: number; col: number },
    endCell: { row: number; col: number }
  ): { row: number; col: number }[] {
    const cells: { row: number; col: number }[] = [];
    const rowDiff = endCell.row - startCell.row;
    const colDiff = endCell.col - startCell.col;
    
    // Check if it's a valid line (horizontal, vertical, or diagonal)
    if (rowDiff !== 0 && colDiff !== 0 && Math.abs(rowDiff) !== Math.abs(colDiff)) {
      return []; // Not a straight line
    }
    
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = steps > 0 ? rowDiff / steps : 0;
    const colStep = steps > 0 ? colDiff / steps : 0;
    
    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: startCell.row + Math.round(rowStep * i),
        col: startCell.col + Math.round(colStep * i),
      });
    }
    
    return cells;
  }
} 