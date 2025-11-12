import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/useShotsyColors';
import { supabase } from '@/lib/supabase';
import { ShotsyDesignTokens } from '@/constants/shotsyDesignTokens';
import { useWeightLogs } from '@/hooks/useWeightLogs';
import { SafeAreaView } from 'react-native-safe-area-context';

// Supabase auto-generated type for a purchase
interface Purchase {
    id: string;
    created_at: string;
    medication_name: string;
    package_details?: string;
    price: number;
    location?: string;
    purchase_date: string;
}

export default function CostsScreen() {
    const colors = useColors();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const { weightLogs } = useWeightLogs();

    useEffect(() => {
        const fetchPurchases = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('purchases')
                    .select('*')
                    .order('purchase_date', { ascending: false });

                if (error) throw error;
                setPurchases(data || []);
            } catch (error: any) {
                Alert.alert('Erro', 'Não foi possível buscar o histórico de compras.');
            } finally {
                setLoading(false);
            }
        };

        fetchPurchases();
    }, []);

    const summary = useMemo(() => {
        const totalCost = purchases.reduce((sum, p) => sum + p.price, 0);

        // Custo por semana (simplificado)
        const firstPurchaseDate = purchases.length > 0 ? new Date(purchases[purchases.length - 1].purchase_date) : new Date();
        const weeks = (new Date().getTime() - firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 7);
        const costPerWeek = weeks > 1 ? totalCost / weeks : totalCost;

        // Custo por kg perdido
        const initialWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 0;
        const currentWeight = weightLogs.length > 0 ? weightLogs[0].weight : 0;
        const kgLost = initialWeight > currentWeight ? initialWeight - currentWeight : 0;
        const costPerKg = kgLost > 0 ? totalCost / kgLost : 0;

        return {
            totalCost,
            costPerWeek,
            costPerKg,
        };
    }, [purchases, weightLogs]);

    const renderItem = ({ item }: { item: Purchase }) => (
        <View style={[styles.purchaseItem, { backgroundColor: colors.card }]}>
            <View>
                <Text style={[styles.itemDate, { color: colors.textSecondary }]}>{new Date(item.purchase_date).toLocaleDateString('pt-BR')}</Text>
                <Text style={[styles.itemMedication, { color: colors.text }]}>{item.medication_name}</Text>
                {item.location && <Text style={[styles.itemLocation, { color: colors.textSecondary }]}>{item.location}</Text>}
            </View>
            <Text style={[styles.itemPrice, { color: colors.primary }]}>R$ {item.price.toFixed(2)}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Custos e Compras</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }}/>
            ) : (
                <>
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Gasto Total</Text>
                            <Text style={styles.summaryValue}>R$ {summary.totalCost.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Custo / Semana</Text>
                            <Text style={styles.summaryValue}>R$ {summary.costPerWeek.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Custo / kg perdido</Text>
                            <Text style={styles.summaryValue}>R$ {summary.costPerKg.toFixed(2)}</Text>
                        </View>
                    </View>

                    <FlatList
                        data={purchases}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textSecondary }}>Nenhuma compra registrada.</Text>}
                    />
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    headerTitle: { ...ShotsyDesignTokens.typography.h2 },
    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        margin: 16,
        borderRadius: ShotsyDesignTokens.borderRadius.lg,
        backgroundColor: '#F3F4F6', // Cor temporária
    },
    summaryItem: { alignItems: 'center' },
    summaryLabel: { ...ShotsyDesignTokens.typography.caption, marginBottom: 4 },
    summaryValue: { ...ShotsyDesignTokens.typography.h4 },
    listContent: { paddingHorizontal: 16 },
    purchaseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: ShotsyDesignTokens.borderRadius.md,
        marginBottom: 12,
    },
    itemDate: { ...ShotsyDesignTokens.typography.caption },
    itemMedication: { ...ShotsyDesignTokens.typography.body, fontWeight: '600' },
    itemLocation: { ...ShotsyDesignTokens.typography.bodySmall },
    itemPrice: { ...ShotsyDesignTokens.typography.h4 },
});
