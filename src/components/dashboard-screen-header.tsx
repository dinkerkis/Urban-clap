import { colors, fontFamilies, fontSizes } from '../theme';
import { Pressable, View } from 'react-native';
import { Text } from './app-text';

import { BackIcon } from './back-icon';

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
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.violetTone98_3,
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
            backgroundColor: colors.violetTone96_3,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <BackIcon color={colors.violetTone15} />
        </Pressable>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text selectable style={{ fontSize: fontSizes.size21, lineHeight: 27, fontFamily: fontFamilies.semiBold, color: colors.violetTone12 }}>
          {title}
        </Text>
        {subtitle && (
          <Text selectable style={{ fontSize: fontSizes.size12, lineHeight: 17, color: colors.violetTone47 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}
