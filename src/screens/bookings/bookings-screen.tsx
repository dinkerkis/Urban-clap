import { Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';

type BookingsScreenProps = {
  onExplore: () => void;
};

export function BookingsScreen({ onExplore }: BookingsScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      <DashboardScreenHeader title="My bookings" subtitle="Track your scheduled services" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 116, justifyContent: 'center' }}
      >
        <View style={{ alignItems: 'center', gap: 10, paddingHorizontal: 22 }}>
          <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center', borderRadius: 30, borderCurve: 'continuous', backgroundColor: '#F0EBFF' }}>
            <Text style={{ fontSize: 42 }}>📅</Text>
          </View>
          <Text selectable style={{ paddingTop: 5, fontSize: 19, lineHeight: 25, fontWeight: '800', color: '#211A28' }}>No bookings yet</Text>
          <Text selectable style={{ maxWidth: 280, textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#77717D' }}>
            Your upcoming and completed services will appear here.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onExplore}
            style={({ pressed }) => ({ minWidth: 170, height: 46, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: pressed ? '#5933C4' : '#6E45E2' })}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Explore services</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
