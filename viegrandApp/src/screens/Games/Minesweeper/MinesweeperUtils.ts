export type Cell = {
  value: number; // -1 for mine, 0-8 for surrounding mines
  isRevealed: boolean;
  isFlagged: boolean;
};

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES = {
  easy: {
    name: 'Dễ',
    rows: 9,
    cols: 9,
    mines: 10,
    description: 'Dành cho người mới bắt đầu',
    icon: 'award',
  },
  medium: {
    name: 'Trung bình',
    rows: 16,
    cols: 16,
    mines: 40,
    description: 'Thử thách kỹ năng của bạn',
    icon: 'shield',
  },
  hard: {
    name: 'Khó',
    rows: 16,
    cols: 30,
    mines: 99,
    description: 'Dành cho chuyên gia dò mìn',
    icon: 'zap',
  },
};

export class MinesweeperLogic {
  /**
   * Generates a new game grid.
   */
  static generateGrid(difficulty: Difficulty): Cell[][] {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    
    // 1. Create an empty grid
    let grid: Cell[][] = Array(rows)
      .fill(null)
      .map(() =>
        Array(cols)
          .fill(null)
          .map(() => ({
            value: 0,
            isRevealed: false,
            isFlagged: false,
          }))
      );

    // 2. Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (grid[row][col].value !== -1) {
        grid[row][col].value = -1;
        minesPlaced++;
      }
    }

    // 3. Calculate numbers for adjacent cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].value === -1) continue;
        let mineCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              grid[nr][nc].value === -1
            ) {
              mineCount++;
            }
          }
        }
        grid[r][c].value = mineCount;
      }
    }

    return grid;
  }

  static generateMines(grid: Cell[][], firstClickRow: number, firstClickCol: number, difficulty: Difficulty): Cell[][] {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    let minesPlaced = 0;
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      const isFirstClickArea = Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1;

      if (newGrid[row][col].value !== -1 && !isFirstClickArea) {
        newGrid[row][col].value = -1;
        minesPlaced++;
      }
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newGrid[row][col].value !== -1) {
          let mineCount = 0;
          for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
              if (
                row + r >= 0 && row + r < rows &&
                col + c >= 0 && col + c < cols &&
                newGrid[row + r][col + c].value === -1
              ) {
                mineCount++;
              }
            }
          }
          newGrid[row][col].value = mineCount;
        }
      }
    }
    return newGrid;
  }

  static revealCell(grid: Cell[][], row: number, col: number): Cell[][] {
    const { rows, cols } = grid.length > 0 ? { rows: grid.length, cols: grid[0].length } : { rows: 0, cols: 0 };
    const newGrid = grid.map(r => r.map(c => ({ ...c })));
    const stack: [number, number][] = [[row, col]];

    while (stack.length > 0) {
      const [r, c] = stack.pop()!;

      if (r < 0 || r >= rows || c < 0 || c >= cols || newGrid[r][c].isRevealed) {
        continue;
      }

      newGrid[r][c].isRevealed = true;

      if (newGrid[r][c].value === 0) {
        for (let ro = -1; ro <= 1; ro++) {
          for (let co = -1; co <= 1; co++) {
            if (ro === 0 && co === 0) continue;
            const newR = r + ro;
            const newC = c + co;
            if (newR >= 0 && newR < rows && newC >= 0 && newC < cols && !newGrid[newR][newC].isRevealed) {
              stack.push([newR, newC]);
            }
          }
        }
      }
    }
    
    return newGrid;
  }
} 