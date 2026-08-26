import { colors, fontSizes } from '../../theme';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { DashboardScreenHeader } from '../../components/dashboard-screen-header';

type BookingsScreenProps = {
  onExplore: () => void;
};

export function BookingsScreen({ onExplore }: BookingsScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.violetTone98_2 }}>
      <DashboardScreenHeader title="My bookings" subtitle="Track your scheduled services" />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 116, justifyContent: 'center' }}
      >
        <View style={{ alignItems: 'center', gap: 10, paddingHorizontal: 22 }}>
          <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center', borderRadius: 30, borderCurve: 'continuous', backgroundColor: colors.violetTone96 }}>
            <Text style={{ fontSize: fontSizes.size42 }}>📅</Text>
          </View>
          <Text selectable style={{ paddingTop: 5, fontSize: fontSizes.size19, lineHeight: 25, fontWeight: '600', color: colors.violetTone13 }}>No bookings yet</Text>
          <Text selectable style={{ maxWidth: 280, textAlign: 'center', fontSize: fontSizes.size12, lineHeight: 18, color: colors.violetTone47 }}>
            Your upcoming and completed services will appear here.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onExplore}
            style={({ pressed }) => ({ minWidth: 170, height: 46, marginTop: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: pressed ? colors.violetTone48 : colors.violetTone58 })}
          >
            <Text style={{ fontSize: fontSizes.size13, fontWeight: '600', color: colors.white }}>Explore services</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
