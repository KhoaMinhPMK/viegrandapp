// Sudoku utility functions
export interface Cell {
  value: number;
  isFixed: boolean;
  isHighlighted: boolean;
  isError: boolean;
  notes?: number[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES = {
  easy: { name: 'Dễ', cellsToRemove: 40, description: 'Dành cho người mới bắt đầu', icon: 'award' },
  medium: { name: 'Trung bình', cellsToRemove: 50, description: 'Thử thách trung bình', icon: 'shield' },
  hard: { name: 'Khó', cellsToRemove: 60, description: 'Dành cho chuyên gia', icon: 'zap' },
};

export class SudokuGenerator {
  /**
   * Generates a complete valid Sudoku grid
   */
  static generateCompleteGrid(): number[][] {
    const grid = Array(9).fill(null).map(() => Array(9).fill(0));
    this.fillGrid(grid);
    return grid;
  }

  /**
   * Recursively fills the grid using backtracking
   */
  static fillGrid(grid: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of numbers) {
            if (this.isValidPlacement(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.fillGrid(grid)) {
                return true;
              }
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Checks if placing a number at given position is valid
   */
  static isValidPlacement(grid: number[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  }

  /**
   * Shuffles an array randomly
   */
  static shuffleArray(array: number[]): number[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  /**
   * Generates a puzzle by removing cells from complete grid
   */
  static generatePuzzle(difficulty: Difficulty): { puzzle: number[][], solution: number[][] } {
    const solution = this.generateCompleteGrid();
    const puzzle = solution.map(row => [...row]);
    
    const cellsToRemove = DIFFICULTIES[difficulty].cellsToRemove;
    let removed = 0;
    
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    
    return { puzzle, solution };
  }
}

export class SudokuGameState {
  /**
   * Converts puzzle array to Cell grid
   */
  static createCellGrid(puzzle: number[][]): Cell[][] {
    return puzzle.map((row) =>
      row.map((cell) => ({
        value: cell,
        isFixed: cell !== 0,
        isHighlighted: false,
        isError: false,
        notes: [],
      }))
    );
  }

  /**
   * Highlights related cells
   */
  static highlightRelatedCells(grid: Cell[][], selectedRow: number, selectedCol: number): Cell[][] {
    return grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        ...cell,
        isHighlighted: 
          rowIndex === selectedRow || 
          colIndex === selectedCol || 
          (Math.floor(rowIndex / 3) === Math.floor(selectedRow / 3) && 
           Math.floor(colIndex / 3) === Math.floor(selectedCol / 3)),
      }))
    );
  }

  /**
   * Validates current grid and marks errors
   */
  static validateGrid(grid: Cell[][]): Cell[][] {
    const gridValues = grid.map(row => row.map(cell => cell.value));
    
    return grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (cell.value === 0) return { ...cell, isError: false };
        
        const isValid = SudokuGenerator.isValidPlacement(
          gridValues.map((r, rIdx) => r.map((c, cIdx) => rIdx === rowIndex && cIdx === colIndex ? 0 : c)),
          rowIndex,
          colIndex,
          cell.value
        );
        
        return { ...cell, isError: !isValid };
      })
    );
  }

  /**
   * Checks if game is complete and valid
   */
  static isGameComplete(grid: Cell[][], solution: number[][]): boolean {
    return grid.every((row, rowIndex) =>
      row.every((cell, colIndex) => 
        cell.value === solution[rowIndex][colIndex]
      )
    );
  }
}

export class TimerUtils {
  /**
   * Formats seconds to MM:SS format
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Gets time-based performance rating
   */
  static getPerformanceRating(seconds: number, difficulty: Difficulty): string {
    const thresholds = {
      easy: { excellent: 300, good: 600, average: 900 },
      medium: { excellent: 600, good: 1200, average: 1800 },
      hard: { excellent: 1200, good: 2400, average: 3600 },
    };

    const threshold = thresholds[difficulty];
    
    if (seconds <= threshold.excellent) return 'Xuất sắc! 🏆';
    if (seconds <= threshold.good) return 'Tốt! 👏';
    if (seconds <= threshold.average) return 'Khá! 👍';
    return 'Hoàn thành! ✅';
  }
} 