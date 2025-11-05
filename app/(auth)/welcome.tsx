import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { useTheme } from '@/lib/theme-context';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { useFeatureFlag } from '@/lib/feature-flags';
import { useAuth } from '@/lib/clerk';
import { useUser } from '@/hooks/useUser';
import { trackEvent } from '@/lib/analytics';

const { width } = Dimensions.get('window');

// Slides do carrossel - 4 imagens novas com fundo transparente (igual ao Shotsy)
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

export default function WelcomeScreen() {
  const colors = useShotsyColors();
  const { currentAccent } = useTheme();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const showCarousel = useFeatureFlag('FF_MARKETING_CAROUSEL_SHOTSY');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // GUARD: Se já estiver logado, redirecionar
  useEffect(() => {
    if (!isLoaded) return;

    // Se estiver logado e já completou onboarding, ir para dashboard
    if (isSignedIn && user?.onboarding_completed) {
      console.log('✅ Usuário já autenticado e onboarding completo, redirecionando para dashboard');
      router.replace('/(tabs)');
      return;
    }

    // Se estiver logado mas não completou onboarding, ir para onboarding
    if (isSignedIn && !user?.onboarding_completed) {
      console.log('📋 Usuário autenticado mas sem onboarding, redirecionando para onboarding');
      router.replace('/(auth)/onboarding-flow');
      return;
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Track carousel view on mount (apenas se não estiver logado)
  useEffect(() => {
    if (showCarousel && !isSignedIn) {
      trackEvent('carousel_view', {
        slides: 4,
        source: 'first_run',
      });
    }
  }, [showCarousel, isSignedIn]);

  // Track each slide view
  useEffect(() => {
    if (showCarousel && currentIndex >= 0) {
      trackEvent('carousel_slide_view', {
        index: currentIndex + 1,
      });
    }
  }, [currentIndex, showCarousel]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleStart();
    }
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  const handleStart = () => {
    trackEvent('cta_start_click', {
      from: 'carousel',
    });

    if (!isLoaded) {
      return;
    }

    // O carrossel só deve aparecer para não logados
    // Se chegar aqui, significa que não está logado
    router.push('/(auth)/sign-up');
  };

  const handleOpenTerms = () => {
    trackEvent('legal_open', { which: 'terms' });
    Linking.openURL('https://mounjarotracker.app/terms');
  };

  const handleOpenPrivacy = () => {
    trackEvent('legal_open', { which: 'privacy' });
    Linking.openURL('https://mounjarotracker.app/privacy');
  };

  // Se já estiver logado, não mostrar nada (será redirecionado)
  if (isLoaded && isSignedIn) {
    return null;
  }

  // Se feature flag desativada, mostrar apenas botão
  if (!showCarousel) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.fallbackContainer}>
          <View style={styles.buttonContainer}>
            <ShotsyButton
              title="Começar"
              onPress={handleStart}
            />
          </View>

          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: colors.textSecondary }]}>
              Ao continuar, você concorda com os{'\n'}
              <Text style={[styles.termsLink, { color: colors.primary }]} onPress={handleOpenTerms}>
                Termos de Uso
              </Text>
              {' '}e a{' '}
              <Text style={[styles.termsLink, { color: colors.primary }]} onPress={handleOpenPrivacy}>
                Política de Privacidade
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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

      {/* Conteúdo abaixo da imagem (igual ao Shotsy) */}
      <View style={[styles.contentWrapper, { backgroundColor: colors.background }]}>
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
        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            Ao continuar, você concorda com os{'\n'}
            <Text style={[styles.termsLink, { color: colors.primary }]} onPress={handleOpenTerms}>
              Termos de Uso
            </Text>
            {' '}e a{' '}
            <Text style={[styles.termsLink, { color: colors.primary }]} onPress={handleOpenPrivacy}>
              Política de Privacidade
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    paddingTop: 32,  // Mudança: 24 → 32px (Shotsy spacing)
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
    lineHeight: 42,  // Mudança: 40 → 42px (Shotsy line height)
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,  // Mudança: 24 → 26px (Shotsy line height)
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,  // Mudança: 8 → 10px (Shotsy dot spacing)
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 20,  // Mudança: 16 → 20px (Shotsy spacing to terms)
  },
  termsContainer: {
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
