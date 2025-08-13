import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { StackActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../../assets/ob1.png'),
    title: 'Chào mừng đến với VieGrand',
    subtitle: 'Khám phá những trải nghiệm tuyệt vời và độc đáo đang chờ đón bạn.',
  },
  {
    id: '2',
    image: require('../../assets/ob2.png'),
    title: 'Kết nối và Chia sẻ',
    subtitle: 'Dễ dàng kết nối với bạn bè và chia sẻ những khoảnh khắc đáng nhớ.',
  },
];

const OnboardingScreen = ({ navigation }: any) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const updateCurrentSlideIndex = (e: any) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex !== slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const skip = () => {
    navigation.dispatch(StackActions.replace('Auth', { screen: 'Login' }));
  };

  const getStarted = () => {
    navigation.dispatch(StackActions.replace('Auth', { screen: 'Login' }));
  };

  const Slide = ({ item }: any) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.slideImage} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    );
  };

  const Footer = () => {
    return (
      <View style={styles.footerContainer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          {currentSlideIndex === slides.length - 1 ? (
            <TouchableOpacity style={styles.getStartedButton} onPress={getStarted}>
              <Text style={styles.buttonText}>Bắt đầu</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={goToNextSlide}>
              <Text style={styles.buttonText}>Tiếp theo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')}
      style={styles.backgroundImage}>
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity style={styles.skipButton} onPress={skip}>
          <Text style={styles.skipButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
        <FlatList
          ref={ref}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          contentContainerStyle={{ height: height * 0.75 }}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={slides}
          pagingEnabled
          renderItem={({ item }) => <Slide item={item} />}
        />
        <Footer />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  skipButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: '600',
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  slideImage: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D4C92',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
  footerContainer: {
    height: height * 0.25,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 10,
    width: 10,
    backgroundColor: '#C4C4C4',
    marginHorizontal: 3,
    borderRadius: 5,
  },
  indicatorActive: {
    backgroundColor: '#0D4C92',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  nextButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  getStartedButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#0D4C92',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default OnboardingScreen; 