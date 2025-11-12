import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import { HandPalm, Play } from 'phosphor-react-native';

interface Pause {
    id: string;
    start_date: string;
    end_date?: string;
}

export default function PausesScreen() {
    const colors = useColors();
    const [activePause, setActivePause] = useState<Pause | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchActivePause = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('treatment_pauses')
                .select('*')
                .is('end_date', null)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
                throw error;
            }
            setActivePause(data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível buscar o estado da pausa.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivePause();
    }, []);

    const handleStartPause = async () => {
        try {
            const { data, error } = await supabase
                .from('treatment_pauses')
                .insert([{ start_date: new Date().toISOString().split('T')[0] }])
                .select()
                .single();

            if (error) throw error;
            setActivePause(data);
            trackEvent('pause_started');
            Alert.alert('Sucesso', 'O tratamento foi pausado.');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível iniciar a pausa.');
        }
    };

    const handleEndPause = async () => {
        if (!activePause) return;
        try {
            const { error } = await supabase
                .from('treatment_pauses')
                .update({ end_date: new Date().toISOString().split('T')[0] })
                .match({ id: activePause.id });

            if (error) throw error;
            trackEvent('pause_ended');
            setActivePause(null);
            Alert.alert('Sucesso', 'O tratamento foi retomado.');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível retomar o tratamento.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Pausar Tratamento</Text>
            </View>

            <View style={styles.content}>
                {loading ? <ActivityIndicator/> : (
                    activePause ? (
                        <>
                            <HandPalm size={64} color={colors.primary} />
                            <Text style={[styles.statusText, { color: colors.text }]}>Tratamento Pausado</Text>
                            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                                Pausado desde {new Date(activePause.start_date).toLocaleDateString('pt-BR')}
                            </Text>
                            <ShotsyButton
                                title="Retomar Tratamento"
                                onPress={handleEndPause}
                                icon={<Play />}
                            />
                        </>
                    ) : (
                        <>
                            <Play size={64} color={colors.success} />
                            <Text style={[styles.statusText, { color: colors.text }]}>Tratamento Ativo</Text>
                            <Text style={[styles.description, { color: colors.textSecondary }]}>
                                Se precisar interromper seu tratamento temporariamente, você pode pausá-lo aqui. Isso irá suspender os lembretes e notificações.
                            </Text>
                            <ShotsyButton
                                title="Iniciar Pausa"
                                onPress={handleStartPause}
                                variant="destructive"
                                icon={<HandPalm />}
                            />
                        </>
                    )
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { ...ShotsyDesignTokens.typography.h2 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 20 },
    statusText: { ...ShotsyDesignTokens.typography.h2, textAlign: 'center' },
    dateText: { ...ShotsyDesignTokens.typography.body, textAlign: 'center' },
    description: { ...ShotsyDesignTokens.typography.body, textAlign: 'center' },
});
