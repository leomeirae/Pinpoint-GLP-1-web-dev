// app/(tabs)/faq.tsx
// Tela FAQ com 12 perguntas e busca remissiva

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShotsyColors } from '@/hooks/useShotsyColors';
import { Ionicons } from '@expo/vector-icons';
import { trackEvent } from '@/lib/analytics';
import { useFeatureFlag } from '@/lib/feature-flags';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  slug: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    question: 'Como posso aproveitar ao máximo o uso do Shotsy?',
    answer: 'Para aproveitar ao máximo o Shotsy, recomendamos:\n\n• Registre todas as suas aplicações regularmente\n• Acompanhe seu peso diariamente\n• Use o calendário para visualizar seu histórico\n• Configure lembretes para não esquecer suas doses\n• Explore os gráficos para entender seu progresso',
    slug: 'como-aproveitar',
  },
  {
    id: 2,
    question: 'O que inclui o Mounjaro+ premium?',
    answer: 'O Mounjaro+ inclui:\n\n• AI Pack / Nutrição com insights personalizados\n• Exportações PDF e CSV do seu histórico\n• Insights avançados e tendências\n• Lembretes inteligentes com janelas dinâmicas\n• Backup e sincronização em nuvem\n• Gráficos e filtros avançados\n• Anexos ilimitados por registro\n• Temas e personalização extras\n• Suporte prioritário',
    slug: 'o-que-inclui-premium',
  },
  {
    id: 3,
    question: 'Como adiciono ou ajusto pesos?',
    answer: 'Para adicionar ou ajustar pesos:\n\n1. Vá para a tela "Resultados"\n2. Toque no botão "+ Adicionar Peso"\n3. Digite seu peso atual\n4. Selecione a unidade (kg ou lb)\n5. Adicione a data (padrão: hoje)\n6. Toque em "Salvar"\n\nPara editar um peso existente, acesse o histórico e toque no registro desejado.',
    slug: 'adicionar-pesos',
  },
  {
    id: 4,
    question: 'Como altero ou excluo injeções?',
    answer: 'Para alterar ou excluir injeções:\n\n• Excluir: Na lista de injeções, deslize para a esquerda no registro desejado e toque em "Deletar"\n• Editar: Toque na injeção que deseja editar e faça as alterações necessárias\n• Salvar: Após fazer as alterações, toque em "Salvar"',
    slug: 'alterar-excluir-injecoes',
  },
  {
    id: 5,
    question: 'Como adiciono uma dosagem personalizada?',
    answer: 'Para adicionar uma dosagem personalizada:\n\n1. Ao registrar uma nova aplicação, toque no campo "Dosagem"\n2. Selecione uma das opções disponíveis (2.5mg, 5mg, 7.5mg, 10mg, 12.5mg, 15mg)\n3. Se sua dosagem não estiver na lista, escolha a mais próxima\n\nNota: Se você precisa de uma dosagem específica não listada, entre em contato com o suporte.',
    slug: 'dosagem-personalizada',
  },
  {
    id: 6,
    question: 'Como adiciono efeitos colaterais personalizados?',
    answer: 'Para adicionar efeitos colaterais:\n\n1. Ao registrar uma aplicação, role até a seção "Efeitos Colaterais"\n2. Toque nos chips dos efeitos que você está sentindo\n3. Os efeitos selecionados serão salvos junto com a aplicação\n\nOs efeitos colaterais mais comuns estão disponíveis como chips. Para efeitos não listados, você pode adicionar notas na seção "Notas de Injeção".',
    slug: 'efeitos-colaterais-personalizados',
  },
  {
    id: 7,
    question: 'Como posso alternar meus locais de injeção?',
    answer: 'O app sugere automaticamente o próximo local de injeção baseado em rotação inteligente:\n\n• Estômago → Coxas → Braços → Glúteos\n• O app marca visualmente o local sugerido no diagrama do corpo\n• Você pode escolher qualquer local disponível, mesmo que não seja o sugerido\n\nA rotação ajuda a evitar irritação e garantir melhor absorção do medicamento.',
    slug: 'alternar-locais-injecao',
  },
  {
    id: 8,
    question: 'Por que meu nível de medicação está mostrando o dobro da quantidade esperada?',
    answer: 'O nível estimado de medicação é calculado usando farmacocinética baseada na meia-vida do medicamento (aproximadamente 120 horas para GLP-1).\n\nSe você está vendo valores maiores que o esperado:\n\n• Verifique se todas as aplicações foram registradas corretamente\n• Confirme que as datas das aplicações estão corretas\n• Lembre-se que o cálculo é uma estimativa e pode variar entre indivíduos\n• Se persistir, entre em contato com o suporte',
    slug: 'nivel-medicacao-dobro',
  },
  {
    id: 9,
    question: 'Estou experimentando algum outro problema inesperado com o aplicativo.',
    answer: 'Se você está enfrentando problemas com o aplicativo:\n\n1. Tente fechar e reabrir o app\n2. Verifique se está usando a versão mais recente\n3. Limpe o cache nas configurações\n4. Entre em contato com o suporte através das configurações\n\nPor favor, inclua detalhes sobre o problema e quando ocorreu para que possamos ajudá-lo melhor.',
    slug: 'outro-problema',
  },
  {
    id: 10,
    question: 'Como restauro minha assinatura Mounjaro+ em um novo dispositivo?',
    answer: 'Para restaurar sua assinatura em um novo dispositivo:\n\n1. Faça login com a mesma conta do Clerk (Google, Apple, etc.)\n2. O app detectará automaticamente sua assinatura ativa\n3. Se não aparecer, vá em Configurações > Restaurar Compras\n\nNota: Sua assinatura está vinculada à sua conta do Clerk, não ao dispositivo. Ao fazer login, todas as funcionalidades premium serão restauradas automaticamente.',
    slug: 'restaurar-assinatura',
  },
  {
    id: 11,
    question: 'Enviei uma solicitação de suporte mas ainda não obtive resposta.',
    answer: 'Nosso tempo de resposta padrão é de 24-48 horas úteis.\n\nSe você ainda não recebeu resposta:\n\n• Verifique sua caixa de entrada e spam\n• Confirme que forneceu um email válido\n• Se você é assinante Mounjaro+, tem suporte prioritário com resposta mais rápida\n\nPara urgências, você pode tentar entrar em contato novamente através das configurações.',
    slug: 'suporte-sem-resposta',
  },
  {
    id: 12,
    question: 'Como excluo minha conta?',
    answer: 'Para excluir sua conta:\n\n1. Vá em Configurações\n2. Role até a seção "Conta"\n3. Toque em "Excluir Conta"\n4. Confirme a exclusão\n\n⚠️ ATENÇÃO: Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente excluídos, incluindo:\n• Histórico de aplicações\n• Registros de peso\n• Dados nutricionais\n• Configurações\n\nSe você tem uma assinatura ativa, ela será cancelada automaticamente.',
    slug: 'excluir-conta',
  },
];

export default function FAQScreen() {
  const colors = useShotsyColors();
  const router = useRouter();
  const useFAQ = useFeatureFlag('FF_FAQ');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Track screen view
  React.useEffect(() => {
    trackEvent('faq_viewed', {
      source: 'settings',
    });
  }, []);

  // Se feature flag desativada, redirecionar
  if (!useFAQ) {
    return null; // Ou mostrar mensagem de "em breve"
  }

  // Filtrar perguntas baseado na busca
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return FAQ_ITEMS;
    }

    const query = searchQuery.toLowerCase().trim();
    return FAQ_ITEMS.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Track busca
  React.useEffect(() => {
    if (searchQuery.trim()) {
      trackEvent('faq_searched', {
        query: searchQuery,
        results_count: filteredItems.length,
      });
    }
  }, [searchQuery, filteredItems.length]);

  const toggleItem = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      trackEvent('faq_question_opened', {
        question_number: id,
        question_text: FAQ_ITEMS.find((item) => item.id === id)?.question || '',
      });
    }
    setExpandedItems(newExpanded);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>FAQ</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Buscar perguntas..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* FAQ List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhuma pergunta encontrada
            </Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.faqItem, { borderBottomColor: colors.border }]}
              onPress={() => toggleItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.questionRow}>
                <Text style={[styles.questionText, { color: colors.text }]}>
                  {item.question}
                </Text>
                <Ionicons
                  name={expandedItems.has(item.id) ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              {expandedItems.has(item.id) && (
                <Text style={[styles.answerText, { color: colors.textSecondary }]}>
                  {item.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  answerText: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});

