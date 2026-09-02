import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { Alert, Pressable, ScrollView, Share, View } from 'react-native';
import { Text } from '../../components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REFERRAL_MESSAGE = 'Try Urban Clap and get ₹50 off your first service!';

const STEPS = [
  'Invite your friends & get rewarded',
  'They get ₹50 on their first service',
  'You get ₹50 once their service is completed',
];

function ShareAction({ imageSource, label, onPress }: { imageSource: number; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ flex: 1, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}>
      <View style={{ width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: colors.white, boxShadow: `0 3px 12px ${colors.violetTone16Alpha10}` }}>
        <Image source={imageSource} contentFit="contain" style={{ width: 32, height: 32 }} />
      </View>
      <Text style={{ fontSize: fontSizes.size13, color: colors.mauveTone21 }}>{label}</Text>
    </Pressable>
  );
}

export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const shareReferral = () => void Share.share({ message: REFERRAL_MESSAGE });

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ paddingTop: Math.max(insets.top, 18) + 8, paddingBottom: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.violetTone98_3, backgroundColor: colors.white }}>
        <Text selectable style={{ fontSize: fontSizes.size18, lineHeight: 24, fontFamily: fontFamilies.semiBold, color: colors.mauveTone12_4 }}>Refer and Earn</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 16, gap: 18, backgroundColor: colors.blueTone97 }}>
          <View style={{ minHeight: 105, paddingRight: 88, gap: 8 }}>
            <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.84} style={{ fontSize: fontSizes.size19, lineHeight: 25, fontFamily: fontFamilies.bold, color: colors.violetTone12_2 }}>Refer and get FREE services</Text>
            <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38 }}>Invite your friends to try Urban Clap services. They get instant ₹50 off. You win ₹50 once they take a service.</Text>
            <Text style={{ position: 'absolute', right: 12, top: 6, fontSize: fontSizes.size67 }}>🎁</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.violetTone98_3 }} />
            <Text style={{ textAlign: 'center', fontSize: fontSizes.size14, color: colors.violetTone31 }}>Refer via</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.violetTone98_3 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <ShareAction imageSource={require('../../../assets/whatsapp.png')} label="Whatsapp" onPress={shareReferral} />
            <ShareAction imageSource={require('../../../assets/messenger.png')} label="Messenger" onPress={shareReferral} />
            <ShareAction imageSource={require('../../../assets/link.png')} label="Copy Link" onPress={shareReferral} />
          </View>
        </View>

        <View style={{ height: 40, backgroundColor: colors.white }} />
        <View style={{ height: 12, backgroundColor: colors.violetTone98_3, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.violetTone98_3 }} />

        <View style={{ marginHorizontal: 20, marginTop: 16, padding: 22, gap: 21, borderRadius: 10, borderCurve: 'continuous', backgroundColor: colors.blueTone97_3 }}>
          <Text selectable style={{ fontSize: fontSizes.size20, lineHeight: 27, fontFamily: fontFamilies.bold, color: colors.mauveTone12 }}>How it works?</Text>
          {STEPS.map((step, index) => (
            <View key={step} style={{ minHeight: 46, flexDirection: 'row', alignItems: 'flex-start', gap: 15 }}>
              <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.blueTone93 }}>
                <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.mauveTone17_3 }}>{index + 1}</Text>
              </View>
              {index < STEPS.length - 1 ? <View style={{ position: 'absolute', left: 13.5, top: 28, width: 1, height: 39, backgroundColor: colors.violetTone88 }} /> : null}
              <Text style={{ flex: 1, fontSize: fontSizes.size17, lineHeight: 24, color: colors.mauveTone19 }}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 25, paddingVertical: 26, flexDirection: 'row', alignItems: 'center', gap: 28 }}>
          <Pressable onPress={() => Alert.alert('Terms & Conditions', 'Referral terms will be available here.')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: pressed ? 0.6 : 1 })}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyanTone46_2 }} />
            <Text style={{ fontSize: fontSizes.size13, color: colors.cyanTone46_2 }}>Terms & Conditions</Text>
          </Pressable>
          <Pressable onPress={() => Alert.alert('FAQs', 'Referral FAQs will be available here.')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: pressed ? 0.6 : 1 })}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyanTone46_2 }} />
            <Text style={{ fontSize: fontSizes.size13, color: colors.cyanTone46_2 }}>FAQs</Text>
          </Pressable>
        </View>

        <View style={{ height: 12, backgroundColor: colors.violetTone98_3, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.violetTone98_3 }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 26, gap: 8 }}>
          <Text selectable style={{ fontSize: fontSizes.size18, lineHeight: 24, fontFamily: fontFamilies.bold, color: colors.violetTone12_2 }}>You are yet to earn any scratch cards</Text>
          <Text style={{ fontSize: fontSizes.size13, color: colors.mauveTone53 }}>Start referring to get surprises</Text>
          <View style={{ marginTop: 18, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 15, borderTopWidth: 1, borderColor: colors.violetTone94_2 }}>
            <Text style={{ fontSize: fontSizes.size27 }}>🎁</Text>
            <Text style={{ fontSize: fontSizes.size14, color: colors.mauveTone38 }}>Earn ₹50 on every successful referral</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
