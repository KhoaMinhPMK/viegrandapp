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
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import Feather from 'react-native-vector-icons/Feather';
import { BackgroundImages } from '../../../utils/assetUtils';
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
  const cellStyle = useMemo(() => [
    styles.cell,
    { width: size, height: size },
    cell.isFixed && styles.fixedCell,
    !cell.isFixed && cell.isHighlighted && styles.highlightedCell,
    cell.isError && styles.errorCell,
    isSelected && !cell.isFixed && styles.selectedCell,
  ], [cell, isSelected, size]);

  const textStyle = useMemo(() => [
    styles.cellText,
    cell.isFixed && styles.fixedCellText,
    cell.isError && styles.errorCellText,
    isSelected && !cell.isFixed && styles.selectedCellText,
  ], [cell, isSelected]);

  return (
    <TouchableOpacity
      style={cellStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>
        {cell.value !== 0 ? cell.value : ''}
      </Text>
    </TouchableOpacity>
  );
});

// Memoized number button component
const NumberButton = React.memo<{
  number: number;
  onPress: (number: number) => void;
  disabled: boolean;
  isComplete: boolean;
}>(({ number, onPress, disabled, isComplete }) => (
  <TouchableOpacity
    style={[
      styles.numberButton,
      (disabled || isComplete) && styles.disabledButton,
    ]}
    onPress={() => onPress(number)}
    disabled={disabled || isComplete}
    activeOpacity={0.7}
  >
    <Text style={styles.numberButtonText}>
      {number}
    </Text>
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
  const insets = useSafeAreaInsets();

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
  const cellSize = useMemo(() => (width - 40) / 9, []);
  
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
    Vibration.vibrate(10); // Lighter vibration
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
      const isValid = solution[row][col] === number;

      newGrid[row][col] = {
        ...newGrid[row][col],
        value: number,
        isError: !isValid,
      };

      // Increment mistake count if invalid
      if (!isValid) {
        setMistakeCount(prev => prev + 1);
        Vibration.vibrate([100, 50, 100]);
      } else {
        Vibration.vibrate(30);
      }
    }

    // No need to validate the whole grid on every input if we check against the solution
    setGrid(newGrid);

    // Check if game is complete
    setTimeout(() => checkGameComplete(newGrid), 100);
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
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.difficultySafeArea}>
          <View style={styles.difficultyHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="x" size={26} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.difficultyScrollContent}>
            <View style={styles.difficultyTitleContainer}>
              <Text style={styles.difficultyTitle}>Sudoku</Text>
              <Text style={styles.difficultySubtext}>
                Chọn một cấp độ để bắt đầu.
              </Text>
            </View>

            <View>
              {(Object.entries(DIFFICULTIES) as [Difficulty, typeof DIFFICULTIES[Difficulty]][]).map(([key, diff], index) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.difficultyCardTouchable,
                    index > 0 && styles.difficultyCardMarginTop
                  ]}
                  onPress={() => {
                    setDifficulty(key as Difficulty);
                    initializeGame(key as Difficulty);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.difficultyCardContent}>
                    <Feather name={diff.icon} size={24} color={styles[`difficultyColor__${key}`].color} />
                    <View style={styles.difficultyCardTextContainer}>
                      <Text style={styles.difficultyCardTitle}>{diff.name}</Text>
                      <Text style={styles.difficultyCardSubtext}>{diff.description}</Text>
                    </View>
                    <Feather name="chevron-right" size={24} color="#C7C7CC" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                setSelectedCell(null);
                setShowDifficultySelector(true);
              }}
            >
              <Feather name="chevron-left" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{DIFFICULTIES[difficulty].name}</Text>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={resetGame}
            >
              <Feather name="refresh-cw" size={24} color="#333" />
            </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.gameInfo}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{TimerUtils.formatTime(timer)}</Text>
              <Text style={styles.statLabel}>Thời gian</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mistakeCount}</Text>
              <Text style={styles.statLabel}>Lỗi</Text>
            </View>
             <View style={styles.statItem}>
              <Text style={styles.statValue}>{hintsUsed}<Text style={{ fontSize: 16, color: '#8A8A8E' }}>/3</Text></Text>
              <Text style={styles.statLabel}>Gợi ý</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={[
                styles.row,
                (rowIndex === 2 || rowIndex === 5) && styles.heavyBorderBottom
              ]}>
                {row.map((cell, colIndex) => (
                  <View key={`${rowIndex}-${colIndex}`} style={[
                    styles.cellContainer,
                    (colIndex === 2 || colIndex === 5) && styles.heavyBorderRight,
                    ((Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 1) && styles.altBlock
                  ]}>
                    <SudokuCell
                      cell={cell}
                      isSelected={selectedCell?.row === rowIndex && selectedCell?.col === colIndex}
                      onPress={() => handleCellPress(rowIndex, colIndex)}
                      size={cellSize}
                      disabled={isGameComplete}
                    />
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 40 }]}>
              <View style={styles.numberPad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                  <NumberButton
                    key={number}
                    number={number}
                    onPress={handleNumberPress}
                    disabled={!selectedCell || isGameComplete}
                    isComplete={numberCounts[number] >= 9}
                  />
                ))}
              </View>
              <View style={styles.actionButtons}>
                 <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleClearCell}
                  disabled={!selectedCell || isGameComplete}
                >
                  <Feather name="delete" size={24} color="#8A8A8E" />
                  <Text style={styles.actionButtonText}>Xóa</Text>
                </TouchableOpacity>
                 <TouchableOpacity
                  style={[styles.actionButton, hintsUsed >= 3 && styles.disabledButton]}
                  onPress={getHint}
                  disabled={!selectedCell || isGameComplete || hintsUsed >= 3}
                >
                  <Feather name="lightbulb" size={24} color="#8A8A8E" />
                  <Text style={styles.actionButtonText}>Gợi ý</Text>
                </TouchableOpacity>
                 <TouchableOpacity
                  style={styles.actionButton}
                  onPress={togglePause}
                  disabled={isGameComplete}
                >
                  <Feather name={isPaused ? "play" : "pause"} size={24} color="#8A8A8E" />
                  <Text style={styles.actionButtonText}>{isPaused ? "Chơi" : "Dừng"}</Text>
                </TouchableOpacity>
              </View>
            </View>
        </View>
      </SafeAreaView>

      {isPaused && (
        <View style={styles.pausedOverlay}>
          <Feather name="pause-circle" size={60} color="rgba(0, 0, 0, 0.5)" />
          <Text style={styles.pausedText}>Đã tạm dừng</Text>
          <TouchableOpacity style={styles.resumeButton} onPress={togglePause}>
            <Text style={styles.resumeButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Global ---
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS system background color
  },
  safeArea: {
    flex: 1,
  },

  // --- Difficulty Selection Screen ---
  difficultySafeArea: {
    flex: 1,
  },
  difficultyHeader: {
    paddingTop: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
  },
  difficultyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  difficultyTitleContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  difficultyTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  difficultySubtext: {
    fontSize: 17,
    color: '#8A8A8E',
    textAlign: 'center',
    marginTop: 8,
  },
  difficultyCardTouchable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  difficultyCardMarginTop: {
    marginTop: 18,
  },
  difficultyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  difficultyCardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  difficultyCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  difficultyCardSubtext: {
    fontSize: 15,
    color: '#8A8A8E',
    marginTop: 2,
  },
  difficultyColor__easy: { color: '#34C759' },
  difficultyColor__medium: { color: '#FF9500' },
  difficultyColor__hard: { color: '#FF3B30' },

  // --- Main Game Screen (Light Mode) ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 13,
    color: '#8A8A8E',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  gridContainer: {
    marginHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  heavyBorderBottom: {
    borderBottomWidth: 2,
    borderBottomColor: '#C7C7CC',
  },
  heavyBorderRight: {
    borderRightWidth: 2,
    borderRightColor: '#C7C7CC',
  },
  cellContainer: {},
  altBlock: {
    backgroundColor: '#F2F2F7',
  },
  cell: {
    borderWidth: 0.5,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fixedCell: {},
  highlightedCell: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  selectedCell: {
    backgroundColor: '#007AFF',
  },
  errorCell: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  cellText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#007AFF',
  },
  fixedCellText: {
    color: '#1C1C1E',
    fontSize: 28,
    fontWeight: '500',
  },
  errorCellText: {
    color: '#FF3B30',
  },
  selectedCellText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  controlsContainer: {
    paddingHorizontal: 15,
    marginTop: 'auto',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 4,
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#3C3C43',
    marginTop: 4,
  },
  numberPad: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  numberButton: {
    width: (width - 40) / 9,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  disabledButton: {
    opacity: 0.4,
  },
  numberButtonText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#1C1C1E',
  },
  pausedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 242, 247, 0.8)',
    zIndex: 10,
  },
  pausedText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
  },
  resumeButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 30,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  resumeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default SudokuScreen; 