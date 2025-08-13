import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { MemoryMatchLogic, Card, Difficulty, DIFFICULTIES, DifficultySetting } from './MemoryMatchUtils';

const { width } = Dimensions.get('window');

interface MemoryMatchScreenProps {
  navigation: any;
}

// Optimized Card Component - Simplified animations
const OptimizedCardComponent = React.memo<{
  card: Card;
  onPress: () => void;
  size: number;
  isDisabled: boolean;
}>(({ card, onPress, size, isDisabled }) => {
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Simple flip animation only
  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: card.isFlipped ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [card.isFlipped]);

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={[styles.cardContainer, { width: size, height: size }]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled || card.isMatched}
        activeOpacity={0.8}
        style={styles.cardTouchable}
      >
        {/* Card Back */}
        <Animated.View 
          style={[
            styles.cardFace,
            styles.cardBack,
            { 
              opacity: backOpacity,
              transform: [{ rotateY }]
            }
          ]}
        >
          <Feather name="layers" size={size * 0.35} color="rgba(255,255,255,0.7)" />
        </Animated.View>

        {/* Card Front */}
        <Animated.View 
          style={[
            styles.cardFace,
            styles.cardFront,
            { opacity: frontOpacity }
          ]}
        >
          {card.isMatched ? (
            <View style={styles.matchedContainer}>
              <Feather name={card.value} size={size * 0.4} color="#FFFFFF" />
            </View>
          ) : (
            <Feather name={card.value} size={size * 0.4} color="#1C1C1E" />
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
});

function MemoryMatchScreen({ navigation }: MemoryMatchScreenProps) {
  const [grid, setGrid] = useState<Card[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [turns, setTurns] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const insets = useSafeAreaInsets();

  // Simple timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!showDifficultySelector && !isGameWon && gameStarted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showDifficultySelector, isGameWon, gameStarted]);

  const startNewGame = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    const newGrid = MemoryMatchLogic.generateGrid(newDifficulty);
    setGrid(newGrid);
    setFlippedCards([]);
    setMatchedPairs(0);
    setTurns(0);
    setTimer(0);
    setIsGameWon(false);
    setStreak(0);
    setGameStarted(false);
    setShowDifficultySelector(false);
  }, []);

  // Optimized card matching logic - batch state updates
  useEffect(() => {
    if (flippedCards.length === 2) {
      if (!gameStarted) setGameStarted(true);
      
      const [firstCard, secondCard] = flippedCards;
      const isMatch = firstCard.value === secondCard.value;
      
      // Batch state updates
      setTurns(prev => prev + 1);
      
      if (isMatch) {
        // Success case
        setMatchedPairs(prev => prev + 1);
        setStreak(prev => prev + 1);
        Vibration.vibrate(50); // Light haptic
        
        const newGrid = grid.map(row =>
          row.map(card =>
            card.value === firstCard.value
              ? { ...card, isFlipped: true, isMatched: true }
              : card
          )
        );
        setGrid(newGrid);
        setFlippedCards([]);
      } else {
        // Fail case
        setStreak(0);
        Vibration.vibrate(100);
        
        // Quick flip back
        const timer = setTimeout(() => {
          const newGrid = grid.map(row =>
            row.map(card =>
              card.id === firstCard.id || card.id === secondCard.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setGrid(newGrid);
          setFlippedCards([]);
        }, 800); // Faster timing
        return () => clearTimeout(timer);
      }
    }
  }, [flippedCards, grid, gameStarted]);
  
  // Win condition check
  useEffect(() => {
    if (matchedPairs > 0 && matchedPairs === (DIFFICULTIES[difficulty].rows * DIFFICULTIES[difficulty].cols) / 2) {
      setIsGameWon(true);
      Vibration.vibrate([100, 50, 100]);
    }
  }, [matchedPairs, difficulty]);

  const handleCardPress = useCallback((pressedCard: Card) => {
    if (flippedCards.length >= 2 || pressedCard.isFlipped || pressedCard.isMatched) return;

    Vibration.vibrate(30);

    const newGrid = grid.map(row =>
      row.map(card =>
        card.id === pressedCard.id ? { ...card, isFlipped: true } : card
      )
    );
    setGrid(newGrid);
    setFlippedCards([...flippedCards, pressedCard]);
  }, [flippedCards, grid]);

  // Memoized calculations
  const formatTime = useMemo(() => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timer]);

  const getPerformanceStars = useMemo(() => {
    const totalPairs = (DIFFICULTIES[difficulty].rows * DIFFICULTIES[difficulty].cols) / 2;
    const efficiency = totalPairs / Math.max(turns, 1);
    if (efficiency > 0.8) return '⭐⭐⭐';
    if (efficiency > 0.6) return '⭐⭐';
    return '⭐';
  }, [difficulty, turns]);

  const getDifficultyColor = useCallback((key: Difficulty) => {
    switch (key) {
      case 'easy': return '#34C759';
      case 'medium': return '#FF9500';
      case 'hard': return '#FF3B30';
      default: return '#007AFF';
    }
  }, []);

  const getDifficultyBgColor = useCallback((key: Difficulty) => {
    switch (key) {
      case 'easy': return 'rgba(52, 199, 89, 0.1)';
      case 'medium': return 'rgba(255, 149, 0, 0.1)';
      case 'hard': return 'rgba(255, 59, 48, 0.1)';
      default: return 'rgba(0, 122, 255, 0.1)';
    }
  }, []);

  // Memoized grid calculation
  const { cardSize, rows, cols } = useMemo(() => {
    const { rows, cols } = DIFFICULTIES[difficulty];
    const padding = 20;
    const cardSpacing = 8;
    const availableWidth = width - (2 * padding);
    const cardSize = (availableWidth - ((cols - 1) * cardSpacing)) / cols;
    return { cardSize, rows, cols };
  }, [difficulty]);

  // Difficulty Selection Screen
  if (showDifficultySelector) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
        <SafeAreaView style={styles.difficultySafeArea}>
          <View style={styles.difficultyHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="x" size={26} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
          <ScrollView 
            contentContainerStyle={styles.difficultyScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.difficultyTitleContainer}>
              <View style={styles.titleIconContainer}>
                <Feather name="layers" size={32} color="#007AFF" />
              </View>
              <Text style={styles.difficultyTitle}>Lật Thẻ Bài</Text>
              <Text style={styles.difficultySubtext}>
                Thử thách trí nhớ với game ghép cặp
              </Text>
            </View>

            <View style={styles.difficultyCardsContainer}>
              {(Object.entries(DIFFICULTIES) as [Difficulty, DifficultySetting][]).map(([key, diff], index) => (
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
                    <View style={[styles.difficultyIconContainer, { backgroundColor: getDifficultyBgColor(key as Difficulty) }]}>
                      <Feather name={diff.icon} size={24} color={getDifficultyColor(key as Difficulty)} />
                    </View>
                    <View style={styles.difficultyCardTextContainer}>
                      <Text style={styles.difficultyCardTitle}>{diff.name}</Text>
                      <Text style={styles.difficultyCardSubtext}>
                        {diff.description} • {diff.rows}×{diff.cols}
                      </Text>
                    </View>
                    <View style={styles.difficultyChevronContainer}>
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
            <Text style={styles.headerTitle}>{DIFFICULTIES[difficulty].name}</Text>
            {streak > 1 && (
              <Text style={styles.streakText}>🔥 {streak} liên tiếp</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => startNewGame(difficulty)}
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
            <Feather name="target" size={18} color="#FF9500" />
            <Text style={styles.statValue}>{turns} lượt</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="check-circle" size={18} color="#34C759" />
            <Text style={styles.statValue}>{matchedPairs}/{(rows * cols) / 2}</Text>
          </View>
        </View>

        {/* Game Grid */}
        <View style={styles.gridContainer}>
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((card, colIndex) => (
                <OptimizedCardComponent
                  key={card.id}
                  card={card}
                  onPress={() => handleCardPress(card)}
                  size={cardSize}
                  isDisabled={flippedCards.length >= 2}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Victory Overlay */}
        {isGameWon && (
          <View style={styles.overlay}>
            <View style={styles.overlayContent}>
              <View style={styles.victoryIcon}>
                <Feather name="award" size={48} color="#FFD700" />
              </View>
              <Text style={styles.overlayTitle}>Xuất sắc! 🎉</Text>
              <Text style={styles.overlaySubtitle}>
                Bạn đã hoàn thành thử thách {DIFFICULTIES[difficulty].name.toLowerCase()}
              </Text>
              <View style={styles.statsContainer}>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Thời gian:</Text>
                  <Text style={styles.statText}>{formatTime}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Số lượt:</Text>
                  <Text style={styles.statText}>{turns}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Đánh giá:</Text>
                  <Text style={styles.statText}>{getPerformanceStars}</Text>
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

const styles = StyleSheet.create({
  // Global Styles
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  safeArea: {
    flex: 1,
  },

  // Difficulty Selection Screen
  difficultySafeArea: {
    flex: 1,
  },
  difficultyHeader: {
    paddingTop: 15,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  difficultyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  difficultyTitleContainer: {
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
  difficultyTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  difficultySubtext: {
    fontSize: 17,
    color: '#8A8A8E',
    textAlign: 'center',
    lineHeight: 24,
  },
  difficultyCardsContainer: {
    gap: 16,
  },
  difficultyCardTouchable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  difficultyCardMarginTop: {
    marginTop: 0,
  },
  difficultyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  difficultyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyCardTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  difficultyCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  difficultyCardSubtext: {
    fontSize: 15,
    color: '#8A8A8E',
    lineHeight: 20,
  },
  difficultyChevronContainer: {
    marginLeft: 12,
  },

  // Game Screen Header
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  streakText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
    marginTop: 2,
  },

  // Game Info Stats
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
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

  // Grid Container
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },

  // Optimized Card Styles
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  matchedContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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

export default MemoryMatchScreen; 