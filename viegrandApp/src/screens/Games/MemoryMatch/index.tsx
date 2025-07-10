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

const { width, height } = Dimensions.get('window');

interface MemoryMatchScreenProps {
  navigation: any;
}

// Enhanced Card Component với animation tinh tế hơn
const EnhancedCardComponent = React.memo<{
  card: Card;
  onPress: () => void;
  size: number;
  isDisabled: boolean;
  index: number;
}>(({ card, onPress, size, isDisabled, index }) => {
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const matchAnimation = useRef(new Animated.Value(0)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  // Flip animation với spring cho cảm giác tự nhiên
  useEffect(() => {
    Animated.spring(flipAnimation, {
      toValue: card.isFlipped ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [card.isFlipped]);

  // Match animation với scale và glow effect
  useEffect(() => {
    if (card.isMatched) {
      Animated.sequence([
        Animated.spring(matchAnimation, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [card.isMatched]);

  // Press animation
  const handlePressIn = () => {
    if (!isDisabled && !card.isMatched) {
      Animated.spring(scaleAnimation, {
        toValue: 0.95,
        tension: 150,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnimation, {
      toValue: 1,
      tension: 150,
      friction: 4,
      useNativeDriver: true,
    }).start();
    if (!isDisabled && !card.isMatched) {
      onPress();
    }
  };

  const frontRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const backRotateY = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const matchScale = matchAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const shimmerOpacity = shimmerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  return (
    <View style={[styles.cardContainer, { width: size, height: size }]}>
      <Animated.View 
        style={[
          styles.cardWrapper, 
          { 
            transform: [
              { scale: scaleAnimation },
              { scale: card.isMatched ? matchScale : 1 }
            ] 
          }
        ]}
      >
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled || card.isMatched}
          activeOpacity={1}
          style={styles.cardTouchable}
        >
          {/* Card Back - Premium gradient */}
          <Animated.View 
            style={[
              styles.cardFace, 
              styles.cardBack,
              { transform: [{ rotateY: backRotateY }] }
            ]}
          >
            <View style={styles.cardBackGradient}>
              <View style={styles.cardBackPattern}>
                <Feather name="layers" size={size * 0.3} color="rgba(255,255,255,0.3)" />
              </View>
            </View>
          </Animated.View>

          {/* Card Front - Clean white design */}
          <Animated.View 
            style={[
              styles.cardFace, 
              styles.cardFront,
              { transform: [{ rotateY: frontRotateY }] }
            ]}
          >
            {card.isMatched ? (
              <View style={styles.matchedContainer}>
                <View style={styles.matchedBackground}>
                  <Feather name={card.value} size={size * 0.4} color="#FFFFFF" />
                </View>
                <Animated.View 
                  style={[
                    styles.matchedShimmer,
                    { opacity: shimmerOpacity }
                  ]} 
                />
              </View>
            ) : (
              <View style={styles.cardIconContainer}>
                <Feather name={card.value} size={size * 0.45} color="#1C1C1E" />
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

// Component cho particle effects khi match
const MatchParticles = React.memo<{ visible: boolean; onComplete: () => void }>(
  ({ visible, onComplete }) => {
    const particles = useRef(
      Array.from({ length: 6 }, (_, i) => ({
        scale: new Animated.Value(0),
        translateX: new Animated.Value(0),
        translateY: new Animated.Value(0),
        opacity: new Animated.Value(1),
        rotation: new Animated.Value(0),
      }))
    ).current;

    useEffect(() => {
      if (visible) {
        const animations = particles.map((particle, index) => {
          const angle = (index / particles.length) * 2 * Math.PI;
          const distance = 50;
          
          return Animated.parallel([
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateX, {
              toValue: Math.cos(angle) * distance,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateY, {
              toValue: Math.sin(angle) * distance,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(particle.rotation, {
              toValue: 360,
              duration: 600,
              useNativeDriver: true,
            }),
          ]);
        });

        Animated.sequence([
          Animated.parallel(animations),
          Animated.delay(100),
        ]).start(() => {
          // Reset particles
          particles.forEach(particle => {
            particle.scale.setValue(0);
            particle.translateX.setValue(0);
            particle.translateY.setValue(0);
            particle.opacity.setValue(1);
            particle.rotation.setValue(0);
          });
          onComplete();
        });
      }
    }, [visible]);

    if (!visible) return null;

    return (
      <View style={styles.particleContainer}>
        {particles.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                transform: [
                  { scale: particle.scale },
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                  { rotate: particle.rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }) },
                ],
                opacity: particle.opacity,
              },
            ]}
          >
            <Feather name="star" size={12} color="#FFD700" />
          </Animated.View>
        ))}
      </View>
    );
  }
);

function MemoryMatchScreen({ navigation }: MemoryMatchScreenProps) {
  const [grid, setGrid] = useState<Card[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [showDifficultySelector, setShowDifficultySelector] = useState(true);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [turns, setTurns] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const insets = useSafeAreaInsets();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const gridAnimation = useRef(new Animated.Value(0)).current;

  // Animate screen entry
  useEffect(() => {
    if (!showDifficultySelector) {
      Animated.parallel([
        Animated.spring(headerAnimation, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.stagger(50, [
          Animated.spring(gridAnimation, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [showDifficultySelector]);

  // Enhanced timer with game state
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
    
    // Reset animations
    headerAnimation.setValue(0);
    gridAnimation.setValue(0);
  }, []);

  // Enhanced card matching logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      if (!gameStarted) setGameStarted(true);
      
      setTurns(turns + 1);
      const [firstCard, secondCard] = flippedCards;

      if (firstCard.value === secondCard.value) {
        // Match found - Enhanced feedback
        setMatchedPairs(matchedPairs + 1);
        setStreak(streak + 1);
        setShowParticles(true);
        
        // Haptic feedback for success
        Vibration.vibrate([50, 30, 50]);
        
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
        // No match - Reset streak
        setStreak(0);
        
        // Haptic feedback for failure
        Vibration.vibrate(100);
        
        // Delayed flip back với visual feedback
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
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [flippedCards, grid, matchedPairs, turns, streak, gameStarted]);
  
  // Enhanced win condition check
  useEffect(() => {
    if (matchedPairs > 0 && matchedPairs === (DIFFICULTIES[difficulty].rows * DIFFICULTIES[difficulty].cols) / 2) {
      setIsGameWon(true);
      
      // Celebration haptic pattern
      setTimeout(() => Vibration.vibrate([100, 50, 100, 50, 200]), 500);
    }
  }, [matchedPairs, difficulty]);

  const handleCardPress = (pressedCard: Card) => {
    if (flippedCards.length >= 2 || pressedCard.isFlipped || pressedCard.isMatched) return;

    // Light haptic feedback
    Vibration.vibrate(30);

    const newGrid = grid.map(row =>
      row.map(card =>
        card.id === pressedCard.id ? { ...card, isFlipped: true } : card
      )
    );
    setGrid(newGrid);
    setFlippedCards([...flippedCards, pressedCard]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPerformanceStars = () => {
    const totalPairs = (DIFFICULTIES[difficulty].rows * DIFFICULTIES[difficulty].cols) / 2;
    const efficiency = totalPairs / Math.max(turns, 1);
    if (efficiency > 0.8) return '⭐⭐⭐';
    if (efficiency > 0.6) return '⭐⭐';
    return '⭐';
  };

  const getDifficultyColor = (key: Difficulty) => {
    switch (key) {
      case 'easy': return '#34C759';
      case 'medium': return '#FF9500';
      case 'hard': return '#FF3B30';
      default: return '#007AFF';
    }
  };

  const getDifficultyBgColor = (key: Difficulty) => {
    switch (key) {
      case 'easy': return 'rgba(52, 199, 89, 0.1)';
      case 'medium': return 'rgba(255, 149, 0, 0.1)';
      case 'hard': return 'rgba(255, 59, 48, 0.1)';
      default: return 'rgba(0, 122, 255, 0.1)';
    }
  };

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
                Thử thách trí nhớ với game ghép cặp tinh tế
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

  // Main Game Screen
  const { rows, cols } = DIFFICULTIES[difficulty];
  const padding = 20;
  const cardSpacing = 8;
  const availableWidth = width - (2 * padding);
  const cardSize = (availableWidth - ((cols - 1) * cardSpacing)) / cols;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: headerAnimation,
              transform: [{
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                })
              }]
            }
          ]}
        >
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
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.gameInfo,
            {
              opacity: headerAnimation,
              transform: [{
                translateY: headerAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.statCard}>
            <Feather name="clock" size={18} color="#007AFF" />
            <Text style={styles.statValue}>{formatTime(timer)}</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="target" size={18} color="#FF9500" />
            <Text style={styles.statValue}>{turns} lượt</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="check-circle" size={18} color="#34C759" />
            <Text style={styles.statValue}>{matchedPairs}/{(rows * cols) / 2}</Text>
          </View>
        </Animated.View>

        <Animated.View 
          style={[
            styles.gridContainer,
            {
              opacity: gridAnimation,
              transform: [{
                scale: gridAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                })
              }]
            }
          ]}
        >
          {grid.map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.row, { marginBottom: cardSpacing }]}>
              {row.map((card, colIndex) => (
                <EnhancedCardComponent
                  key={card.id}
                  card={card}
                  onPress={() => handleCardPress(card)}
                  size={cardSize}
                  isDisabled={flippedCards.length >= 2}
                  index={rowIndex * cols + colIndex}
                />
              ))}
            </View>
          ))}
          
          <MatchParticles 
            visible={showParticles} 
            onComplete={() => setShowParticles(false)} 
          />
        </Animated.View>

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
                  <Text style={styles.statText}>{formatTime(timer)}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Số lượt:</Text>
                  <Text style={styles.statText}>{turns}</Text>
                </View>
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Đánh giá:</Text>
                  <Text style={styles.statText}>{getPerformanceStars()}</Text>
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
    marginTop: 0, // Using gap instead
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
  },

  // Enhanced Card Styles
  cardContainer: {
  },
  cardWrapper: {
    width: '100%',
    height: '100%',
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
    backfaceVisibility: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBack: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardBackGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardBackPattern: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchedContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  matchedBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  matchedShimmer: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 50,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    transform: [{ skewX: '-20deg' }],
  },

  // Particle Effects
  particleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
  },
  particle: {
    position: 'absolute',
    top: -6,
    left: -6,
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