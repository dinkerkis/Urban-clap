import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';

type AboutScreenProps = {
  onBack: () => void;
};

function ChevronRight() {
  return <View style={{ width: 8, height: 8, borderTopWidth: 1.4, borderRightWidth: 1.4, borderColor: '#29242B', transform: [{ rotate: '45deg' }] }} />;
}

function TermsIcon() {
  return (
    <View style={{ width: 22, height: 25, transform: [{ scale: 0.78 }] }}>
      <View style={{ position: 'absolute', left: 1, top: 0, width: 16, height: 22, borderWidth: 1.4, borderColor: '#39333B', borderRadius: 2 }} />
      <View style={{ position: 'absolute', left: 5, top: 6, width: 7, height: 1.4, backgroundColor: '#39333B' }} />
      <View style={{ position: 'absolute', left: 5, top: 10, width: 7, height: 1.4, backgroundColor: '#39333B' }} />
      <Text style={{ position: 'absolute', right: 0, bottom: -2, fontSize: 15, lineHeight: 17, fontWeight: '600', color: '#39333B' }}>+</Text>
    </View>
  );
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ paddingTop: Math.max(insets.top, 16) + 6, paddingHorizontal: 20, paddingBottom: 8 }}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={onBack}
            style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, borderWidth: 1, borderColor: '#E4E0E6', opacity: pressed ? 0.65 : 1 })}
          >
            <BackIcon color="#241A30" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: Math.max(insets.bottom, 20) + 28 }}>
        <View style={{ width: 82, height: 82, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#6E45E2' }}>
          <Text style={{ fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: 1, color: '#FFFFFF' }}>UC</Text>
        </View>

        <Text style={{ paddingTop: 18, fontSize: 24, lineHeight: 30, fontWeight: '700', color: '#1D1820' }}>Urban Company</Text>
        <Text style={{ paddingTop: 3, fontSize: 13, lineHeight: 19, color: '#777078' }}>Version 1.0.0</Text>

        <Text style={{ paddingTop: 24, fontSize: 15, lineHeight: 24, color: '#332D35' }}>
          Urban Company (Formerly UrbanClap) was launched in Nov 2014. It is the largest home services platform in Asia, with presence in India, UAE and Singapore. The platform helps customers book reliable home services like beauty services, massage therapy, cleaning, plumbing, carpentry, appliance repair, painting etc. The company&apos;s vision is to empower millions of service professionals across the world to deliver services at home like never seen before. The company partners with tens of thousands of service professionals, helping them with training, credit, product procurement, insurance, technology etc.
        </Text>

        <View style={{ height: 8, marginHorizontal: -20, marginTop: 28, backgroundColor: '#F6F5F7' }} />

        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Terms and conditions', 'Terms and conditions will be available soon.')}
          style={({ pressed }) => ({ minHeight: 58, marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.6 : 1 })}
        >
          <TermsIcon />
          <Text style={{ flex: 1, fontSize: 16, lineHeight: 23, color: '#332D35' }}>Terms and conditions</Text>
          <ChevronRight />
        </Pressable>
      </ScrollView>
    </View>
  );
}
