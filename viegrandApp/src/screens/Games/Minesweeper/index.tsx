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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { MinesweeperLogic, Cell, Difficulty, DIFFICULTIES } from './MinesweeperUtils';

const { width } = Dimensions.get('window');

interface MinesweeperScreenProps {
  navigation: any;
}

const CellComponent = React.memo<{
  cell: Cell;
  onPress: () => void;
  onLongPress: () => void;
  cellSize: number;
}>(({ cell, onPress, onLongPress, cellSize }) => {
  const getCellContent = () => {
    if (!cell.isRevealed) {
      if (cell.isFlagged) {
        return <Feather name="flag" size={cellSize * 0.6} color="#E74C3C" />;
      }
      return null;
    }

    if (cell.value === -1) {
      return <Feather name="alert-triangle" size={cellSize * 0.6} color="#1C1C1E" />;
    }

    if (cell.value > 0) {
      const colors = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#5E5CE6', '#FF2D55', '#AF52DE', '#5856D6'];
      return <Text style={[styles.cellText, { color: colors[cell.value - 1] }]}>{cell.value}</Text>;
    }

    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { width: cellSize, height: cellSize },
        cell.isRevealed && styles.revealedCell,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {getCellContent()}
    </TouchableOpacity>
  );
});

function MinesweeperScreen({ navigation }: MinesweeperScreenProps) {
  // Game state
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const [timer, setTimer] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [isFlaggingMode, setIsFlaggingMode] = useState(false);

  const insets = useSafeAreaInsets();

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!showDifficultySelector && !isGameOver && !isGameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showDifficultySelector, isGameOver, isGameWon]);

  const startNewGame = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    const newGrid = MinesweeperLogic.generateGrid(newDifficulty);
    setGrid(newGrid);
    setIsGameOver(false);
    setIsGameWon(false);
    setTimer(0);
    setFlagCount(0);
    setShowDifficultySelector(false);
    setFirstClick(true);
  }, []);

  const checkWinCondition = (currentGrid: Cell[][]) => {
    const { rows, cols, mines } = DIFFICULTIES[difficulty];
    const revealedCount = currentGrid.flat().filter(cell => cell.isRevealed).length;
    if (rows * cols - revealedCount === mines) {
      setIsGameWon(true);
      setIsGameOver(true);
      Alert.alert("Thắng rồi!", "Bạn đã tìm thấy tất cả các quả mìn!");
    }
  };

  const revealAllMines = () => {
    setGrid(prevGrid =>
      prevGrid.map(row =>
        row.map(cell => (cell.value === -1 ? { ...cell, isRevealed: true } : cell))
      )
    );
  };

  const handleCellPress = (row: number, col: number) => {
    if (isGameOver || grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    if (isFlaggingMode) {
      handleLongPress(row, col);
      return;
    }

    // First click is not on a flag
    if (firstClick && grid[row][col].isFlagged) return;

    let currentGrid = [...grid];

    if (firstClick) {
      currentGrid = MinesweeperLogic.generateMines(currentGrid, row, col, difficulty);
      setFirstClick(false);
    }
    
    if (currentGrid[row][col].value === -1) {
      setIsGameOver(true);
      revealAllMines();
      Alert.alert("Thua rồi!", "Bạn đã nhấn phải mìn.");
      return;
    }
    
    currentGrid = MinesweeperLogic.revealCell(currentGrid, row, col);
    setGrid(currentGrid);
    checkWinCondition(currentGrid);
  };

  const handleLongPress = (row: number, col: number) => {
    if (isGameOver || grid[row][col].isRevealed) return;
    Vibration.vibrate(50);
    const newGrid = [...grid];
    const cell = newGrid[row][col];
    const newFlagCount = cell.isFlagged ? flagCount - 1 : flagCount + 1;

    if (!cell.isFlagged && newFlagCount > DIFFICULTIES[difficulty].mines) return;
    
    cell.isFlagged = !cell.isFlagged;
    setFlagCount(newFlagCount);
    setGrid(newGrid);
  };

  // --- Màn hình chọn độ khó ---
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
              <Text style={styles.difficultyTitle}>Dò Mìn</Text>
              <Text style={styles.difficultySubtext}>
                Chọn một cấp độ để thử thách.
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
                  onPress={() => startNewGame(key as Difficulty)}
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

  // --- Màn hình chơi game ---
  const { rows, cols, mines } = DIFFICULTIES[difficulty];
  const mineCount = mines - flagCount;
  const cellSize = Math.floor((width - 40) / cols);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowDifficultySelector(true)}
          >
            <Feather name="chevron-left" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{DIFFICULTIES[difficulty].name}</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => startNewGame(difficulty)}
          >
            <Feather name="refresh-cw" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.gameInfo}>
          <View style={styles.statItem}>
            <Feather name="flag" size={18} color="#555" />
            <Text style={styles.statValue}>{mineCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="clock" size={18} color="#555" />
            <Text style={styles.statValue}>{timer}</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((cell, colIndex) => (
                <CellComponent
                  key={colIndex}
                  cell={cell}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                  onLongPress={() => handleLongPress(rowIndex, colIndex)}
                  cellSize={cellSize}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.controlsContainer, { paddingBottom: insets.bottom + 10 }]}>
           <TouchableOpacity 
              style={[styles.modeButton, isFlaggingMode && styles.modeButtonActive]}
              onPress={() => setIsFlaggingMode(!isFlaggingMode)}
            >
              <Feather name="flag" size={24} color={isFlaggingMode ? '#FFFFFF' : '#1C1C1E'}/>
              <Text style={[styles.modeButtonText, isFlaggingMode && styles.modeButtonTextActive]}>
                {isFlaggingMode ? 'Cắm cờ' : 'Mở ô'}
              </Text>
           </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isGameOver && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.overlayTitle}>{isGameWon ? "Thắng rồi!" : "Thua rồi!"}</Text>
            <Text style={styles.overlaySubtitle}>
              {isGameWon
                ? "Bạn đã xuất sắc tìm thấy tất cả mìn."
                : "Chúc bạn may mắn lần sau."}
            </Text>
            <TouchableOpacity
              style={styles.overlayButton}
              onPress={() => setShowDifficultySelector(true)}
            >
              <Text style={styles.overlayButtonText}>Chơi lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles for difficulty selection screen (similar to Sudoku)
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  safeArea: {
    flex: 1,
  },
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

  // --- Main Game Screen ---
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
    paddingVertical: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 25,
    height: 25,
    backgroundColor: '#D1D1D6',
    margin: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  revealedCell: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BDBDBD',
  },
  cellText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  modeButtonActive: {
    backgroundColor: '#1C1C1E',
    borderColor: '#1C1C1E',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },

  // --- Overlay ---
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlayContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  overlayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: '#3C3C43',
    textAlign: 'center',
    marginBottom: 24,
  },
  overlayButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
  },
  overlayButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MinesweeperScreen; 