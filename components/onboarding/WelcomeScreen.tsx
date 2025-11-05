import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Image, Linking } from 'react-native';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { trackEvent } from '@/lib/analytics';

interface WelcomeScreenProps {
  onNext: () => void;
}

const { width } = Dimensions.get('window');

// Slides do carrossel - 4 imagens do Shotsy
const slides = [
  {
    id: '1',
    image: require('../../assets/imagens_carrossel_tela_inicial/imagem_1 (1).png'),
    title: 'Aproveite ao máximo seu medicamento GLP-1',
    subtitle: 'Mounjaro Tracker foi projetado para ajudar você a entender e acompanhar suas aplicações semanais.',
    accessibilityLabel: 'Aproveite ao máximo seu medicamento GLP-1',
  },
  {
    id: '2',
    image: require('../../assets/imagens_carrossel_tela_inicial/imagem_2 (1).png'),
    title: 'Acompanhe com widgets personalizáveis',
    subtitle: 'Nunca perca uma dose com widgets na tela inicial e lembretes por notificação.',
    accessibilityLabel: 'Acompanhe com widgets personalizáveis',
  },
  {
    id: '3',
    image: require('../../assets/imagens_carrossel_tela_inicial/imagem_3 (1).png'),
    title: 'Entenda seu progresso com gráficos bonitos',
    subtitle: 'Aprenda mais sobre seu medicamento com ferramentas baseadas em resultados de ensaios clínicos.',
    accessibilityLabel: 'Entenda seu progresso com gráficos bonitos',
  },
  {
    id: '4',
    image: require('../../assets/imagens_carrossel_tela_inicial/imagem_4.png'),
    title: 'Personalize o app para combinar com seu estilo',
    subtitle: 'Personalize sua jornada com temas personalizados. Você pode até mudar o ícone!',
    accessibilityLabel: 'Personalize o app para combinar com seu estilo',
  },
];

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Track carousel view on mount
  useEffect(() => {
    trackEvent('carousel_view', {
      slides: 4,
      source: 'onboarding',
    });
  }, []);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      trackEvent('carousel_slide_view', {
        index: currentIndex + 2,
      });
    } else {
      trackEvent('cta_start_click', {
        from: 'onboarding_carousel',
      });
      onNext();
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleOpenTerms = () => {
    trackEvent('legal_open', { which: 'terms' });
    Linking.openURL('https://mounjarotracker.app/terms');
  };

  const handleOpenPrivacy = () => {
    trackEvent('legal_open', { which: 'privacy' });
    Linking.openURL('https://mounjarotracker.app/privacy');
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Carrossel de Imagens */}
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.imageContainer}>
              <Image 
                source={item.image} 
                style={styles.appImage} 
                resizeMode="contain"
                accessible={true}
                accessibilityLabel={item.accessibilityLabel}
              />
            </View>
          </View>
        )}
      />

      {/* Conteúdo abaixo da imagem */}
      <View style={styles.contentWrapper}>
        {/* Título e Subtítulo */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentSlide.title}
          </Text>
          {currentSlide.subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {currentSlide.subtitle}
            </Text>
          )}
        </View>

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentIndex ? currentAccent : colors.border,
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Botão */}
        <View style={styles.buttonContainer}>
          <ShotsyButton
            title={currentIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
            onPress={handleNext}
          />
        </View>

        {/* Links legais */}
        <TouchableOpacity style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            Ao continuar, você concorda com os{'\n'}
            <Text style={[styles.termsLink, { color: currentAccent }]} onPress={handleOpenTerms}>
              Termos de Uso
            </Text>
            {' '}e a{' '}
            <Text style={[styles.termsLink, { color: currentAccent }]} onPress={handleOpenPrivacy}>
              Política de Privacidade
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  imageContainer: {
    width: width * 0.85,
    height: width * 1.2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appImage: {
    width: '100%',
    height: '100%',
  },
  contentWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 24,
  },
  textContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
  },
});