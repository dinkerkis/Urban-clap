import { colors, fontFamilies, fontSizes } from '../theme';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type DashboardTab = 'home' | 'rewards' | 'native' | 'bookings' | 'categories' | 'cart';

type BottomTabBarProps = {
  activeTab: DashboardTab;
  cartCount: number;
  onChange: (tab: DashboardTab) => void;
};

const tabs: { id: DashboardTab; label: string }[] = [
  { id: 'home', label: 'UC' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'native', label: 'Native' },
];

function TabIcon({ active, tab }: { active: boolean; tab: DashboardTab }) {
  const color = active ? colors.white : colors.blueTone56;
  const badgeColor = active ? colors.violetTone58 : colors.transparent;
  const iconStroke = active ? colors.violetTone58 : colors.blueTone56;

  if (tab === 'home') {
    return (
      <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.4, borderColor: active ? colors.violetTone58 : color, borderRadius: 4, borderCurve: 'continuous', backgroundColor: badgeColor }}>
        <Text style={{ fontSize: fontSizes.size7, lineHeight: 9, fontFamily: fontFamilies.extraBold, color }}>UC</Text>
      </View>
    );
  }

  if (tab === 'rewards') {
    return (
      <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 18, height: 15, borderWidth: 1.3, borderColor: iconStroke, borderRadius: 2, borderCurve: 'continuous', backgroundColor: active ? colors.violetTone58 : colors.transparent }} />
        <View style={{ position: 'absolute', right: 0, top: 7, width: 7, height: 7, alignItems: 'center', justifyContent: 'center', borderWidth: 1.3, borderColor: iconStroke, borderRadius: 2, backgroundColor: active ? colors.violetTone58 : colors.white }}>
          <View style={{ width: 1.7, height: 1.7, borderRadius: 1, backgroundColor: color }} />
        </View>
        <View style={{ position: 'absolute', left: 3, right: 4, top: 6, height: 1.2, backgroundColor: color }} />
      </View>
    );
  }

  return (
    <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: 15, height: 14, borderWidth: 1.3, borderColor: iconStroke, borderRadius: 2, borderCurve: 'continuous', backgroundColor: active ? colors.violetTone58 : colors.transparent }} />
      <View style={{ position: 'absolute', top: 1, width: 8, height: 7, borderWidth: 1.3, borderBottomWidth: 0, borderColor: iconStroke, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
    </View>
  );
}

export function BottomTabBar({ activeTab, cartCount, onChange }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: 64 + insets.bottom,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.violetTone94,
        boxShadow: `0 -3px 14px ${colors.violetTone15Alpha6}`,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => ({ flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3, opacity: pressed ? 0.64 : 1 })}
          >
            <View
              style={{
                minWidth: 42,
                height: 25,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 6,
                backgroundColor: colors.transparent,
              }}
            >
              <TabIcon active={active} tab={tab.id} />
            </View>
            <Text style={{ fontSize: fontSizes.size10, lineHeight: 13, fontFamily: active ? fontFamilies.bold : fontFamilies.medium, color: colors.black }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
