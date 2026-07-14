import { Pressable, Text, View } from 'react-native';

export type DashboardTab = 'home' | 'bookings' | 'categories' | 'cart';

type BottomTabBarProps = {
  activeTab: DashboardTab;
  cartCount: number;
  onChange: (tab: DashboardTab) => void;
};

const tabs: { id: DashboardTab; icon: string; label: string }[] = [
  { id: 'home', icon: '⌂', label: 'Home' },
  { id: 'bookings', icon: '▣', label: 'Bookings' },
  { id: 'categories', icon: '⊞', label: 'Categories' },
  { id: 'cart', icon: '▱', label: 'Cart' },
];

export function BottomTabBar({ activeTab, cartCount, onChange }: BottomTabBarProps) {
  return (
    <View
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: process.env.EXPO_OS === 'ios' ? 12 : 10,
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 24,
        borderCurve: 'continuous',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EEEAF4',
        boxShadow: '0 10px 32px rgba(33, 22, 52, 0.16)',
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
            style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 3, opacity: pressed ? 0.64 : 1 })}
          >
            <View
              style={{
                minWidth: 48,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 999,
                backgroundColor: active ? '#6E45E2' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 20, lineHeight: 22, fontWeight: '800', color: active ? '#FFFFFF' : '#9A94A3' }}>
                {tab.icon}
              </Text>
              {tab.id === 'cart' && cartCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    right: 3,
                    top: -5,
                    minWidth: 18,
                    height: 18,
                    paddingHorizontal: 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 9,
                    backgroundColor: '#EF4D62',
                    borderWidth: 2,
                    borderColor: '#FFFFFF',
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 9, lineHeight: 11, fontWeight: '800', fontVariant: ['tabular-nums'] }}>
                    {cartCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 10, lineHeight: 13, fontWeight: active ? '800' : '600', color: active ? '#2A1B3D' : '#8D8793' }}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
