import { colors, fontFamilies, fontSizes } from '../../theme';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';

type AboutScreenProps = {
  onBack: () => void;
};

function ChevronRight() {
  return <View style={{ width: 8, height: 8, borderTopWidth: 1.4, borderRightWidth: 1.4, borderColor: colors.mauveTone15_4, transform: [{ rotate: '45deg' }] }} />;
}

function TermsIcon() {
  return (
    <View style={{ width: 22, height: 25, transform: [{ scale: 0.78 }] }}>
      <View style={{ position: 'absolute', left: 1, top: 0, width: 16, height: 22, borderWidth: 1.4, borderColor: colors.mauveTone22, borderRadius: 2 }} />
      <View style={{ position: 'absolute', left: 5, top: 6, width: 7, height: 1.4, backgroundColor: colors.mauveTone22 }} />
      <View style={{ position: 'absolute', left: 5, top: 10, width: 7, height: 1.4, backgroundColor: colors.mauveTone22 }} />
      <Text style={{ position: 'absolute', right: 0, bottom: -2, fontSize: fontSizes.size15, lineHeight: 17, fontFamily: fontFamilies.semiBold, color: colors.mauveTone22 }}>+</Text>
    </View>
  );
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ paddingTop: Math.max(insets.top, 16) + 6, paddingHorizontal: 20, paddingBottom: 8 }}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={onBack}
            style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 1, borderColor: colors.mauveTone89, opacity: pressed ? 0.65 : 1 })}
          >
            <BackIcon color={colors.violetTone15} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: Math.max(insets.bottom, 20) + 28 }}>
        <View style={{ width: 82, height: 82, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: colors.violetTone58 }}>
          <Text style={{ fontSize: fontSizes.size34, lineHeight: 40, fontFamily: fontFamilies.extraBold, letterSpacing: 1, color: colors.white }}>UC</Text>
        </View>

        <Text style={{ paddingTop: 18, fontSize: fontSizes.size24, lineHeight: 30, fontFamily: fontFamilies.bold, color: colors.mauveTone11 }}>Urban Company</Text>
        <Text style={{ paddingTop: 3, fontSize: fontSizes.size13, lineHeight: 19, color: colors.neutralTone45 }}>Version 1.0.0</Text>

        <Text style={{ paddingTop: 24, fontSize: fontSizes.size15, lineHeight: 24, color: colors.mauveTone19_3 }}>
          Urban Company (Formerly UrbanClap) was launched in Nov 2014. It is the largest home services platform in Asia, with presence in India, UAE and Singapore. The platform helps customers book reliable home services like beauty services, massage therapy, cleaning, plumbing, carpentry, appliance repair, painting etc. The company&apos;s vision is to empower millions of service professionals across the world to deliver services at home like never seen before. The company partners with tens of thousands of service professionals, helping them with training, credit, product procurement, insurance, technology etc.
        </Text>

        <View style={{ height: 8, marginHorizontal: -20, marginTop: 28, backgroundColor: colors.violetTone96_6 }} />

        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Terms and conditions', 'Terms and conditions will be available soon.')}
          style={({ pressed }) => ({ minHeight: 58, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.6 : 1 })}
        >
          <TermsIcon />
          <Text style={{ flex: 1, fontSize: fontSizes.size16, lineHeight: 23, color: colors.mauveTone19_3 }}>Terms and conditions</Text>
          <ChevronRight />
        </Pressable>
      </ScrollView>
    </View>
  );
}
