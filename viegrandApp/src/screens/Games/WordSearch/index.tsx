import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  ScrollView,
  Vibration,
  Animated,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import {
  WordSearchLogic,
  GridCell,
  WordInfo,
  Difficulty,
  Theme,
  DIFFICULTIES,
  THEMES,
  DifficultySetting,
  ThemeSetting,
} from './WordSearchUtils';

const { width } = Dimensions.get('window');

interface WordSearchScreenProps {
  navigation: any;
}

// Enhanced Grid Cell Component với selection preview
const GridCellComponent = React.memo<{
  cell: GridCell;
  size: number;
  onPress: () => void;
  isInSelectionPath: boolean;
  isSelectionStart: boolean;
  isSelectionEnd: boolean;
}>(({ cell, size, onPress, isInSelectionPath, isSelectionStart, isSelectionEnd }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cell.isFound) {
      // Victory animation khi tìm được từ
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          tension: 150,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 150,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cell.isFound]);

  const cellStyle = [
    styles.gridCell,
    { width: size, height: size },
    cell.isSelected && styles.selectedCell,
    cell.isFound && styles.foundCell,
    isInSelectionPath && styles.previewCell,
    isSelectionStart && styles.selectionStartCell,
    isSelectionEnd && styles.selectionEndCell,
  ];

  const textStyle = [
    styles.cellText, 
    { fontSize: size * 0.4 },
    (cell.isSelected || cell.isFound || isInSelectionPath) && styles.selectedCellText,
  ];

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={cellStyle}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={textStyle}>
          {cell.letter}
        </Text>
        {/* Selection indicators */}
        {isSelectionStart && (
          <View style={styles.selectionIndicator}>
            <Feather name="play" size={size * 0.25} color="#FFFFFF" />
          </View>
        )}
        {isSelectionEnd && (
          <View style={styles.selectionIndicator}>
            <Feather name="square" size={size * 0.25} color="#FFFFFF" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// Instruction Component
const InstructionComponent = React.memo<{
  foundWordsCount: number;
  totalWords: number;
  currentSelectionLength: number;
  isSelecting: boolean;
}>(({ foundWordsCount, totalWords, currentSelectionLength, isSelecting }) => {
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (foundWordsCount > 0) {
      setShowInstructions(false);
    }
  }, [foundWordsCount]);

  if (!showInstructions && currentSelectionLength === 0) return null;

  return (
    <View style={styles.instructionContainer}>
      {showInstructions && foundWordsCount === 0 ? (
        <View style={styles.instructionContent}>
          <Feather name="info" size={20} color="#007AFF" />
          <Text style={styles.instructionText}>
            Bấm vào từng chữ cái để tạo từ theo đường thẳng
          </Text>
        </View>
      ) : currentSelectionLength > 0 ? (
        <View style={styles.instructionContent}>
          <Feather name="target" size={20} color="#FF9500" />
          <Text style={styles.instructionText}>
            Đã chọn {currentSelectionLength} chữ cái{isSelecting ? ' - Bấm tiếp hoặc nhấn Xong' : ''}
          </Text>
          {isSelecting && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {}} // Will be passed from parent
            >
              <Text style={styles.doneButtonText}>Xong</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
});

// Word List Component với animation
const WordListComponent = React.memo<{
  words: WordInfo[];
}>(({ words }) => {
  const fadeAnims = useRef(
    words.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate words appearing
    words.forEach((word, index) => {
      if (word.isFound) {
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      }
    });
  }, [words]);

  return (
    <View style={styles.wordListContainer}>
      <Text style={styles.wordListTitle}>Tìm các từ:</Text>
      <View style={styles.wordList}>
        {words.map((wordInfo, index) => (
          <Animated.View
            key={wordInfo.id}
            style={[
              styles.wordItem,
              wordInfo.isFound && styles.foundWordItem,
              { opacity: wordInfo.isFound ? fadeAnims[index] : 1 }
            ]}
          >
            <Text
              style={[
                styles.wordText,
                wordInfo.isFound && styles.foundWordText,
              ]}
            >
              {wordInfo.word}
            </Text>
            {wordInfo.isFound && (
              <Animated.View
                style={{ 
                  opacity: fadeAnims[index],
                  transform: [{
                    scale: fadeAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }]
                }}
              >
                <Feather name="check" size={16} color="#FFFFFF" />
              </Animated.View>
            )}
          </Animated.View>
        ))}
      </View>
    </View>
  );
});

function WordSearchScreen({ navigation }: WordSearchScreenProps) {
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedTheme, setSelectedTheme] = useState<Theme>('animals');
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [words, setWords] = useState<WordInfo[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([]);
  const [selectionPath, setSelectionPath] = useState<{ row: number; col: number }[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [timer, setTimer] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const selectionStart = useRef<{ row: number; col: number } | null>(null);
  const successAnim = useRef(new Animated.Value(0)).current;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isGameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isGameWon]);

  const startNewGame = useCallback(() => {
    const { grid: newGrid, words: newWords } = WordSearchLogic.generateGrid(
      selectedDifficulty,
      selectedTheme
    );
    setGrid(newGrid);
    setWords(newWords);
    setSelectedCells([]);
    setSelectionPath([]);
    setFoundWords([]);
    setTimer(0);
    setIsGameWon(false);
    setGameStarted(true);
    setIsSelecting(false);
    setShowDifficultySelector(false);
    setShowThemeSelector(false);
    successAnim.setValue(0);
  }, [selectedDifficulty, selectedTheme]);

  const handleDifficultySelect = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowDifficultySelector(false);
    setShowThemeSelector(true);
  }, []);

  const handleThemeSelect = useCallback((theme: Theme) => {
    setSelectedTheme(theme);
    startNewGame();
  }, [startNewGame]);

  // Enhanced selection với tap-to-build
  const handleCellPress = useCallback((row: number, col: number) => {
    if (!gameStarted || isGameWon) return;

    const cellPosition = { row, col };

    if (!isSelecting) {
      // Start new selection
      setIsSelecting(true);
      selectionStart.current = cellPosition;
      setSelectionPath([cellPosition]);
      setSelectedCells([cellPosition]);
      
      // Light haptic feedback
      Vibration.vibrate(30);
    } else {
      // Continue selection or end it
      if (selectionStart.current) {
        const newPath = WordSearchLogic.getLineCells(selectionStart.current, cellPosition);
        
        if (newPath.length > 1) {
          // Valid line - update selection
          setSelectionPath(newPath);
          setSelectedCells(newPath);
          
          // Light haptic feedback
          Vibration.vibrate(30);
        } else {
          // Invalid line - feedback
          Vibration.vibrate(100);
        }
      }
    }
  }, [gameStarted, isGameWon, isSelecting]);

  const handleCompleteSelection = useCallback(() => {
    if (!isSelecting || selectionPath.length < 2) {
      // Reset if invalid
      setIsSelecting(false);
      setSelectionPath([]);
      setSelectedCells([]);
      selectionStart.current = null;
      return;
    }

    const foundWord = WordSearchLogic.checkWordSelection(grid, selectionPath, words);
    
    if (foundWord) {
      // Success animation
      Animated.spring(successAnim, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }).start(() => {
        successAnim.setValue(0);
      });

      // Found a word!
      Vibration.vibrate([50, 30, 50]);
      
      // Mark word as found
      const updatedWords = words.map(w =>
        w.id === foundWord.id ? { ...w, isFound: true } : w
      );
      setWords(updatedWords);
      setFoundWords(prev => [...prev, foundWord.id]);
      
      // Mark cells as found
      const updatedGrid = grid.map(row =>
        row.map(cell => {
          const isInFoundWord = selectionPath.some(
            lc => lc.row === cell.row && lc.col === cell.col
          );
          return isInFoundWord ? { ...cell, isFound: true } : cell;
        })
      );
      setGrid(updatedGrid);
      
      // Check win condition
      if (updatedWords.filter(w => w.isFound).length === words.length) {
        setIsGameWon(true);
        Vibration.vibrate([100, 50, 100, 50, 200]);
      }
    } else {
      // Failure feedback
      Vibration.vibrate(100);
    }
    
    // Reset selection
    setIsSelecting(false);
    setSelectionPath([]);
    setSelectedCells([]);
    selectionStart.current = null;
  }, [isSelecting, selectionPath, grid, words]);

  // Cancel current selection
  const handleCancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectionPath([]);
    setSelectedCells([]);
    selectionStart.current = null;
    Vibration.vibrate(50);
  }, []);

  // Memoized calculations
  const formatTime = useMemo(() => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timer]);

  const gridSize = useMemo(() => {
    if (grid.length === 0) return 0;
    const padding = 40;
    const spacing = 2;
    const availableSize = width - padding;
    return (availableSize - ((grid.length - 1) * spacing)) / grid.length;
  }, [grid]);

  const completedWords = useMemo(() => words.filter(w => w.isFound).length, [words]);

  // Check if cell is in current selection path
  const isInSelectionPath = useCallback((row: number, col: number) => {
    return selectionPath.some(cell => cell.row === row && cell.col === col);
  }, [selectionPath]);

  const isSelectionStart = useCallback((row: number, col: number) => {
    return selectionStart.current?.row === row && selectionStart.current?.col === col;
  }, []);

  const isSelectionEnd = useCallback((row: number, col: number) => {
    return selectionPath.length > 1 && 
           selectionPath[selectionPath.length - 1].row === row && 
           selectionPath[selectionPath.length - 1].col === col;
  }, [selectionPath]);

  // Difficulty Selection Screen
  if (showDifficultySelector) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="x" size={26} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            contentContainerStyle={styles.selectorScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.selectorTitleContainer}>
              <View style={styles.titleIconContainer}>
                <Feather name="search" size={32} color="#007AFF" />
              </View>
              <Text style={styles.selectorTitle}>Tìm Từ</Text>
              <Text style={styles.selectorSubtext}>
                Chọn độ khó để bắt đầu
              </Text>
            </View>

            <View style={styles.selectorCardsContainer}>
              {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultySetting][]).map(([key, diff], index) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.selectorCard,
                    index > 0 && styles.selectorCardMarginTop
                  ]}
                  onPress={() => handleDifficultySelect(key as Difficulty)}
                  activeOpacity={0.8}
                >
                  <View style={styles.selectorCardContent}>
                    <View style={[styles.selectorIconContainer, { backgroundColor: getDifficultyBgColor(key as Difficulty) }]}>
                      <Feather name={diff.icon} size={24} color={getDifficultyColor(key as Difficulty)} />
                    </View>
                    <View style={styles.selectorCardTextContainer}>
                      <Text style={styles.selectorCardTitle}>{diff.name}</Text>
                      <Text style={styles.selectorCardSubtext}>
                        {diff.description} • {diff.gridSize}×{diff.gridSize}
                      </Text>
                    </View>
                    <View style={styles.selectorChevronContainer}>
                      <Feather name="chevron-right" size={20} color="#C7C7CC" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Theme Selection Screen
  if (showThemeSelector) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowDifficultySelector(true)}
            >
              <Feather name="chevron-left" size={28} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            contentContainerStyle={styles.selectorScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.selectorTitleContainer}>
              <View style={styles.titleIconContainer}>
                <Feather name="layers" size={32} color="#007AFF" />
              </View>
              <Text style={styles.selectorTitle}>Chọn chủ đề</Text>
              <Text style={styles.selectorSubtext}>
                Chọn loại từ bạn muốn tìm
              </Text>
            </View>

            <View style={styles.selectorCardsContainer}>
              {(Object.entries(THEMES) as [Theme, ThemeSetting][]).map(([key, theme], index) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.selectorCard,
                    index > 0 && styles.selectorCardMarginTop
                  ]}
                  onPress={() => handleThemeSelect(key as Theme)}
                  activeOpacity={0.8}
                >
                  <View style={styles.selectorCardContent}>
                    <View style={[styles.selectorIconContainer, { backgroundColor: getThemeBgColor(key as Theme) }]}>
                      <Feather name={theme.icon} size={24} color={getThemeColor(key as Theme)} />
                    </View>
                    <View style={styles.selectorCardTextContainer}>
                      <Text style={styles.selectorCardTitle}>{theme.name}</Text>
                      <Text style={styles.selectorCardSubtext}>
                        {theme.description}
                      </Text>
                    </View>
                    <View style={styles.selectorChevronContainer}>
                      <Feather name="chevron-right" size={20} color="#C7C7CC" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // Main Game Screen
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowDifficultySelector(true)}
          >
            <Feather name="chevron-left" size={28} color="#007AFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>
              {THEMES[selectedTheme].name} - {DIFFICULTIES[selectedDifficulty].name}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={startNewGame}
          >
            <Feather name="refresh-cw" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        
        {/* Game Stats */}
        <View style={styles.gameInfo}>
          <View style={styles.statCard}>
            <Feather name="clock" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{formatTime}</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="check-circle" size={18} color="#34C759" />
            <Text style={styles.statValue}>{completedWords}/{words.length}</Text>
          </View>
        </View>

        {/* Instructions */}
        <InstructionComponent 
          foundWordsCount={completedWords}
          totalWords={words.length}
          currentSelectionLength={selectionPath.length}
          isSelecting={isSelecting}
        />

        {/* Selection Controls */}
        {isSelecting && (
          <View style={styles.selectionControls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelSelection}
            >
              <Feather name="x" size={20} color="#FF3B30" />
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.completeButton,
                selectionPath.length < 2 && styles.completeButtonDisabled
              ]}
              onPress={handleCompleteSelection}
              disabled={selectionPath.length < 2}
            >
              <Feather name="check" size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Xong</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={styles.gameContent} showsVerticalScrollIndicator={false}>
          {/* Game Grid */}
          <View style={styles.gridContainer}>
            <Animated.View
              style={[
                styles.successOverlay,
                {
                  opacity: successAnim,
                  transform: [{
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.2],
                    })
                  }]
                }
              ]}
            >
              <Feather name="check-circle" size={40} color="#34C759" />
            </Animated.View>
            
            {grid.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {row.map((cell, colIndex) => (
                  <GridCellComponent
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    size={gridSize}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    isInSelectionPath={isInSelectionPath(rowIndex, colIndex)}
                    isSelectionStart={isSelectionStart(rowIndex, colIndex)}
                    isSelectionEnd={isSelectionEnd(rowIndex, colIndex)}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Word List */}
          <WordListComponent words={words} />
        </ScrollView>

        {/* Victory Overlay */}
        {isGameWon && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <View style={styles.victoryIcon}>
                <Feather name="award" size={48} color="#FFD700" />
              </View>
              <Text style={styles.overlayTitle}>Xuất sắc! 🎉</Text>
              <Text style={styles.overlaySubtitle}>
                Bạn đã tìm được tất cả các từ
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Thời gian:</Text>
                  <Text style={styles.statText}>{formatTime}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Số từ tìm được:</Text>
                  <Text style={styles.statText}>{completedWords}/{words.length}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={() => setShowDifficultySelector(true)}
              >
                <Text style={styles.overlayButtonText}>Chơi lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

// Helper functions
const getDifficultyColor = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy': return '#34C759';
    case 'medium': return '#FF9500';
    case 'hard': return '#FF3B30';
    default: return '#007AFF';
  }
};

const getDifficultyBgColor = (difficulty: Difficulty) => {
  switch (difficulty) {
    case 'easy': return 'rgba(52, 199, 89, 0.1)';
    case 'medium': return 'rgba(255, 149, 0, 0.1)';
    case 'hard': return 'rgba(255, 59, 48, 0.1)';
    default: return 'rgba(0, 122, 255, 0.1)';
  }
};

const getThemeColor = (theme: Theme) => {
  switch (theme) {
    case 'animals': return '#FF3B30';
    case 'cities': return '#007AFF';
    case 'plants': return '#34C759';
    default: return '#007AFF';
  }
};

const getThemeBgColor = (theme: Theme) => {
  switch (theme) {
    case 'animals': return 'rgba(255, 59, 48, 0.1)';
    case 'cities': return 'rgba(0, 122, 255, 0.1)';
    case 'plants': return 'rgba(52, 199, 89, 0.1)';
    default: return 'rgba(0, 122, 255, 0.1)';
  }
};

const styles = StyleSheet.create({
  // Global Styles
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    minWidth: 44,
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },

  // Selector Screens (Difficulty & Theme)
  selectorScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  selectorTitleContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  titleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  selectorSubtext: {
    fontSize: 17,
    color: '#8A8A8E',
    textAlign: 'center',
    lineHeight: 24,
  },
  selectorCardsContainer: {
    gap: 16,
  },
  selectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectorCardMarginTop: {
    marginTop: 0,
  },
  selectorCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  selectorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectorCardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  selectorCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  selectorCardSubtext: {
    fontSize: 15,
    color: '#8A8A8E',
    lineHeight: 20,
  },
  selectorChevronContainer: {
    marginLeft: 12,
  },

  // Game Stats
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 6,
    fontVariant: ['tabular-nums'],
  },

  // Instructions
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  instructionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'center',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Game Content
  gameContent: {
    flex: 1,
  },

  // Grid
  gridContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'relative',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  gridCell: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  selectedCell: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  foundCell: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  previewCell: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderColor: '#007AFF',
  },
  selectionStartCell: {
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectionEndCell: {
    backgroundColor: '#FF9500',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cellText: {
    fontWeight: '600',
    color: '#1C1C1E',
  },
  selectedCellText: {
    color: '#FFFFFF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },

  // Selection Controls
  selectionControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 12,
    minWidth: 120,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 120,
  },
  completeButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Success Animation
  successOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -20,
    marginLeft: -20,
    zIndex: 10,
    pointerEvents: 'none',
  },

  // Word List
  wordListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  wordListTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  wordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  wordItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  foundWordItem: {
    backgroundColor: '#34C759',
  },
  wordText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  foundWordText: {
    color: '#FFFFFF',
    textDecorationLine: 'line-through',
  },

  // Victory Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 280,
  },
  victoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 17,
    color: '#8A8A8E',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  statLabel: {
    fontSize: 16,
    color: '#8A8A8E',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  overlayButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 160,
    alignItems: 'center',
  },
  overlayButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default WordSearchScreen; 