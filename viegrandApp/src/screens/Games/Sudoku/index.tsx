import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  ScrollView,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import {
  SudokuGenerator,
  SudokuGameState,
  TimerUtils,
  Cell,
  Difficulty,
  DIFFICULTIES,
} from './SudokuUtils';

const { width } = Dimensions.get('window');

interface SudokuScreenProps {
  navigation: any;
}

// Memoized cell component for better performance
const SudokuCell = React.memo<{
  cell: Cell;
  isSelected: boolean;
  onPress: () => void;
  size: number;
  disabled: boolean;
}>(({ cell, isSelected, onPress, size, disabled }) => {
  const getCellStyle = () => {
    const baseStyle: any[] = [styles.cell, { width: size, height: size }];
    
    if (cell.isFixed) baseStyle.push(styles.fixedCell);
    if (cell.isHighlighted) baseStyle.push(styles.highlightedCell);
    if (cell.isError) baseStyle.push(styles.errorCell);
    if (isSelected) baseStyle.push(styles.selectedCell);
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle: any[] = [styles.cellText];
    
    if (cell.isFixed) baseStyle.push(styles.fixedCellText);
    if (cell.isError) baseStyle.push(styles.errorCellText);
    if (isSelected) baseStyle.push(styles.selectedCellText);
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getCellStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={getTextStyle()}>
        {cell.value !== 0 ? cell.value : ''}
      </Text>
      {cell.notes && cell.notes.length > 0 && cell.value === 0 && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText}>
            {cell.notes.join('')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Memoized number button component
const NumberButton = React.memo<{
  number: number;
  onPress: (number: number) => void;
  disabled: boolean;
  remainingCount?: number;
}>(({ number, onPress, disabled, remainingCount }) => (
  <TouchableOpacity
    style={[styles.numberButton, disabled && styles.disabledButton]}
    onPress={() => onPress(number)}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <Text style={[styles.numberButtonText, disabled && styles.disabledButtonText]}>
      {number}
    </Text>
    {remainingCount !== undefined && remainingCount > 0 && (
      <View style={styles.remainingBadge}>
        <Text style={styles.remainingText}>{9 - remainingCount}</Text>
      </View>
    )}
  </TouchableOpacity>
));

function SudokuScreen({ navigation }: SudokuScreenProps) {
  // Game state
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isGameComplete && !isPaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isGameComplete, isPaused]);

  // Memoized calculations
  const cellSize = useMemo(() => (width - 80) / 9, []);
  
  const numberCounts = useMemo(() => {
    const counts: { [key: number]: number } = {};
    for (let i = 1; i <= 9; i++) {
      counts[i] = 0;
    }
    
    grid.forEach(row => {
      row.forEach(cell => {
        if (cell.value > 0) {
          counts[cell.value]++;
        }
      });
    });
    
    return counts;
  }, [grid]);

  // Initialize game
  const initializeGame = useCallback((selectedDifficulty: Difficulty) => {
    const { puzzle, solution: gameSolution } = SudokuGenerator.generatePuzzle(selectedDifficulty);
    const newGrid = SudokuGameState.createCellGrid(puzzle);

    setGrid(newGrid);
    setSolution(gameSolution);
    setSelectedCell(null);
    setTimer(0);
    setHintsUsed(0);
    setMistakeCount(0);
    setIsGameComplete(false);
    setIsPaused(false);
    setGameStarted(true);
    setShowDifficultySelector(false);
  }, []);

  // Handle cell selection
  const handleCellPress = useCallback((row: number, col: number) => {
    if (grid[row][col].isFixed || isGameComplete || isPaused) return;
    
    setSelectedCell({ row, col });
    
    // Highlight related cells
    const newGrid = SudokuGameState.highlightRelatedCells(grid, row, col);
    setGrid(newGrid);
    
    // Haptic feedback
    Vibration.vibrate(50);
  }, [grid, isGameComplete, isPaused]);

  // Handle number input
  const handleNumberPress = useCallback((number: number) => {
    if (!selectedCell || isGameComplete || isPaused) return;
    
    const { row, col } = selectedCell;
    if (grid[row][col].isFixed) return;

    const newGrid = [...grid];
    const currentValue = newGrid[row][col].value;
    
    // If same number, clear cell
    if (currentValue === number) {
      newGrid[row][col] = {
        ...newGrid[row][col],
        value: 0,
        isError: false,
      };
    } else {
      // Check if placement is valid
      const isValid = SudokuGenerator.isValidPlacement(
        newGrid.map(row => row.map(cell => cell.value)),
        row,
        col,
        number
      );

      newGrid[row][col] = {
        ...newGrid[row][col],
        value: number,
        isError: !isValid,
      };

      // Increment mistake count if invalid
      if (!isValid) {
        setMistakeCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            Alert.alert(
              '⚠️ Quá nhiều lỗi!',
              'Bạn đã mắc 3 lỗi. Hãy cẩn thận hơn!',
              [{ text: 'OK' }]
            );
          }
          return newCount;
        });
        Vibration.vibrate([100, 50, 100]);
      } else {
        Vibration.vibrate(30);
      }
    }

    // Validate entire grid
    const validatedGrid = SudokuGameState.validateGrid(newGrid);
    setGrid(validatedGrid);

    // Check if game is complete
    setTimeout(() => checkGameComplete(validatedGrid), 100);
  }, [selectedCell, grid, isGameComplete, isPaused, solution]);

  // Clear cell
  const handleClearCell = useCallback(() => {
    if (!selectedCell || isGameComplete || isPaused) return;
    
    const { row, col } = selectedCell;
    if (grid[row][col].isFixed) return;

    const newGrid = [...grid];
    newGrid[row][col] = {
      ...newGrid[row][col],
      value: 0,
      isError: false,
    };
    setGrid(newGrid);
  }, [selectedCell, grid, isGameComplete, isPaused]);

  // Check if game is complete
  const checkGameComplete = useCallback((currentGrid: Cell[][]) => {
    if (SudokuGameState.isGameComplete(currentGrid, solution)) {
      setIsGameComplete(true);
      const performance = TimerUtils.getPerformanceRating(timer, difficulty);
      
      Alert.alert(
        '🎉 Chúc mừng!',
        `${performance}\n\nThời gian: ${TimerUtils.formatTime(timer)}\nGợi ý đã dùng: ${hintsUsed}\nLỗi: ${mistakeCount}`,
        [
          { text: 'Chơi lại', onPress: () => setShowDifficultySelector(true) },
          { text: 'OK' }
        ]
      );
    }
  }, [solution, timer, difficulty, hintsUsed, mistakeCount]);

  // Get hint
  const getHint = useCallback(() => {
    if (!selectedCell || isGameComplete || isPaused || hintsUsed >= 3) return;
    
    const { row, col } = selectedCell;
    if (grid[row][col].isFixed) return;

    const correctValue = solution[row][col];
    handleNumberPress(correctValue);
    setHintsUsed(prev => prev + 1);
    
    Alert.alert('💡 Gợi ý', `Số đúng là: ${correctValue}`, [{ text: 'OK' }]);
  }, [selectedCell, grid, solution, isGameComplete, isPaused, hintsUsed, handleNumberPress]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    Alert.alert(
      'Đặt lại game',
      'Bạn có chắc muốn bắt đầu lại không?',
      [
        { text: 'Hủy' },
        { text: 'Đặt lại', onPress: () => setShowDifficultySelector(true) }
      ]
    );
  }, []);

  // Difficulty selection screen
  if (showDifficultySelector) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sudoku</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Difficulty Selection */}
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyTitle}>Chọn độ khó</Text>
            
            {(Object.entries(DIFFICULTIES) as [Difficulty, typeof DIFFICULTIES[Difficulty]][]).map(([key, diff]) => (
              <TouchableOpacity
                key={key}
                style={styles.difficultyButton}
                onPress={() => {
                  setDifficulty(key as Difficulty);
                  initializeGame(key as Difficulty);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.difficultyButtonText}>{diff.name}</Text>
                <Text style={styles.difficultySubtext}>
                  {diff.description}
                </Text>
                <Text style={styles.difficultyInfo}>
                  {diff.cellsToRemove} ô trống
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setShowDifficultySelector(true)}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Sudoku - {DIFFICULTIES[difficulty].name}
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetGame}
          >
            <Feather name="refresh-cw" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Game Info */}
          <View style={styles.gameInfo}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Thời gian</Text>
              <Text style={styles.statValue}>{TimerUtils.formatTime(timer)}</Text>
            </View>
            <TouchableOpacity style={styles.statItem} onPress={togglePause}>
              <Feather 
                name={isPaused ? "play" : "pause"} 
                size={20} 
                color="#007AFF" 
              />
              <Text style={styles.statValue}>{isPaused ? "Tiếp tục" : "Tạm dừng"}</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Lỗi</Text>
              <Text style={styles.statValue}>{mistakeCount}/3</Text>
            </View>
          </View>

          {/* Sudoku Grid */}
          {!isPaused && (
            <View style={styles.gridContainer}>
              <View style={styles.grid}>
                {grid.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((cell, colIndex) => (
                      <SudokuCell
                        key={`${rowIndex}-${colIndex}`}
                        cell={cell}
                        isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                        onPress={() => handleCellPress(rowIndex, colIndex)}
                        size={cellSize}
                        disabled={isGameComplete}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )}

          {isPaused && (
            <View style={styles.pausedContainer}>
              <Feather name="pause" size={64} color="#fff" />
              <Text style={styles.pausedText}>Game đã tạm dừng</Text>
            </View>
          )}

          {/* Action Buttons */}
          {!isPaused && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, hintsUsed >= 3 && styles.disabledActionButton]}
                onPress={getHint}
                disabled={!selectedCell || isGameComplete || hintsUsed >= 3}
              >
                <Feather name="lightbulb" size={18} color={hintsUsed >= 3 ? "#999" : "#007AFF"} />
                <Text style={[styles.actionButtonText, hintsUsed >= 3 && styles.disabledActionButtonText]}>
                  Gợi ý ({3 - hintsUsed})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClearCell}
                disabled={!selectedCell || isGameComplete}
              >
                <Feather name="delete" size={18} color="#007AFF" />
                <Text style={styles.actionButtonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Number Pad */}
          {!isPaused && (
            <View style={styles.numberPad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <NumberButton
                  key={number}
                  number={number}
                  onPress={handleNumberPress}
                  disabled={!selectedCell || isGameComplete || numberCounts[number] >= 9}
                  remainingCount={numberCounts[number]}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  
  // Difficulty Selection
  difficultyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  difficultyTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  difficultyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  difficultyButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  difficultySubtext: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  difficultyInfo: {
    fontSize: 14,
    color: '#999',
  },

  // Game Info
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },

  // Grid
  gridContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  grid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  fixedCell: {
    backgroundColor: '#f8f9fa',
  },
  highlightedCell: {
    backgroundColor: '#e3f2fd',
  },
  selectedCell: {
    backgroundColor: '#2196f3',
  },
  errorCell: {
    backgroundColor: '#ffebee',
  },
  cellText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  fixedCellText: {
    color: '#333',
  },
  errorCellText: {
    color: '#f44336',
  },
  selectedCellText: {
    color: '#fff',
  },
  notesContainer: {
    position: 'absolute',
    top: 2,
    left: 2,
  },
  notesText: {
    fontSize: 8,
    color: '#999',
  },

  // Paused state
  pausedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  pausedText: {
    fontSize: 24,
    color: '#fff',
    marginTop: 20,
    fontWeight: 'bold',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 100,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledActionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  disabledActionButtonText: {
    color: '#999',
  },

  // Number Pad
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  numberButton: {
    width: (width - 80) / 3,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    position: 'relative',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  numberButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  disabledButtonText: {
    color: '#999',
  },
  remainingBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remainingText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default SudokuScreen; 