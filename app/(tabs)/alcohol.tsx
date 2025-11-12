import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { supabase } from '@/lib/supabase';
import { trackEvent } from '@/lib/analytics';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShotsyButton } from '@/components/ui/shotsy-button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'phosphor-react-native';

interface AlcoholLog {
    id: string;
    date: string;
}

export default function AlcoholLogScreen() {
    const colors = useColors();
    const [logs, setLogs] = useState<AlcoholLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('alcohol_logs')
                .select('id, date')
                .order('date', { ascending: false });
            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível buscar os registros.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const isDateLogged = logs.some(log => log.date === selectedDate.toISOString().split('T')[0]);

    const handleToggleDate = async () => {
        const dateString = selectedDate.toISOString().split('T')[0];
        try {
            if (isDateLogged) {
                // Delete the log
                const logToDelete = logs.find(log => log.date === dateString);
                if (logToDelete) {
                    const { error } = await supabase.from('alcohol_logs').delete().match({ id: logToDelete.id });
                    if (error) throw error;
                    trackEvent('alcohol_marked', { marked: false });
                }
            } else {
                // Insert a new log
                const { error } = await supabase.from('alcohol_logs').insert([{ date: dateString }]);
                if (error) throw error;
                trackEvent('alcohol_marked', { marked: true });
            }
            fetchLogs(); // Refresh the list
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o registro.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Registro de Álcool</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Marque os dias em que consumiu bebidas alcoólicas para visualizar o impacto no seu tratamento.
                </Text>

                <TouchableOpacity style={[styles.dateSelector, { backgroundColor: colors.card }]} onPress={() => setShowDatePicker(true)}>
                    <Calendar size={24} color={colors.textSecondary}/>
                    <Text style={[styles.dateText, { color: colors.text }]}>
                        {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setSelectedDate(date);
                    }}
                    />
                )}

                <ShotsyButton
                    title={isDateLogged ? "Desmarcar Dia" : "Marcar Consumo"}
                    onPress={handleToggleDate}
                    variant={isDateLogged ? "destructive" : "primary"}
                />

                <Text style={[styles.historyTitle, { color: colors.text }]}>Histórico</Text>
                {loading ? <ActivityIndicator/> : (
                    <FlatList
                        data={logs}
                        keyExtractor={(item) => item.id}
                        renderItem={({item}) => (
                            <View style={styles.logItem}>
                                <Text style={{color: colors.text}}>{new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={{textAlign: 'center', color: colors.textMuted}}>Nenhum registro encontrado.</Text>}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { ...ShotsyDesignTokens.typography.h2 },
    content: { padding: 24, gap: 20 },
    description: { ...ShotsyDesignTokens.typography.body, textAlign: 'center', marginBottom: 10 },
    dateSelector: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 12 },
    dateText: { ...ShotsyDesignTokens.typography.h5 },
    historyTitle: { ...ShotsyDesignTokens.typography.h4, marginTop: 20, marginBottom: 10 },
    logItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }
});
