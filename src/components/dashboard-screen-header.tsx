import { Pressable, Text, View } from 'react-native';

type DashboardScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function DashboardScreenHeader({ title, subtitle, onBack }: DashboardScreenHeaderProps) {
  return (
    <View
      style={{
        paddingTop: process.env.EXPO_OS === 'ios' ? 56 : 26,
        paddingHorizontal: 20,
        paddingBottom: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0EDF3',
      }}
    >
      {onBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={onBack}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: '#F3F0F8',
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <Text style={{ fontSize: 25, lineHeight: 27, color: '#241A30' }}>‹</Text>
        </Pressable>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text selectable style={{ fontSize: 21, lineHeight: 27, fontWeight: '800', color: '#1E1725' }}>
          {title}
        </Text>
        {subtitle && (
          <Text selectable style={{ fontSize: 12, lineHeight: 17, color: '#77717D' }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
