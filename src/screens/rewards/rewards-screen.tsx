import { Image } from 'expo-image';
import { Alert, Pressable, ScrollView, Share, Text, View } from 'react-native';
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
      <View style={{ width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 27, backgroundColor: '#FFFFFF', boxShadow: '0 3px 12px rgba(39, 32, 52, 0.10)' }}>
        <Image source={imageSource} contentFit="contain" style={{ width: 32, height: 32 }} />
      </View>
      <Text style={{ fontSize: 13, color: '#38313C' }}>{label}</Text>
    </Pressable>
  );
}

export function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const shareReferral = () => void Share.share({ message: REFERRAL_MESSAGE });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ paddingTop: Math.max(insets.top, 18) + 8, paddingBottom: 14, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F1EEF2', backgroundColor: '#FFFFFF' }}>
        <Text selectable style={{ fontSize: 18, lineHeight: 24, fontWeight: '600', color: '#211B24' }}>Refer and Earn</Text>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 + insets.bottom }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 16, gap: 18, backgroundColor: '#F0F3FF' }}>
          <View style={{ minHeight: 105, paddingRight: 88, gap: 8 }}>
            <Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.84} style={{ fontSize: 19, lineHeight: 25, fontWeight: '700', color: '#211A25' }}>Refer and get FREE services</Text>
            <Text style={{ fontSize: 13, lineHeight: 19, color: '#625B67' }}>Invite your friends to try Urban Clap services. They get instant ₹50 off. You win ₹50 once they take a service.</Text>
            <Text style={{ position: 'absolute', right: 12, top: 6, fontSize: 67 }}>🎁</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#D9DCE8' }} />
            <Text style={{ textAlign: 'center', fontSize: 14, color: '#504957' }}>Refer via</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#D9DCE8' }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <ShareAction imageSource={require('../../../assets/whatsapp.png')} label="Whatsapp" onPress={shareReferral} />
            <ShareAction imageSource={require('../../../assets/messenger.png')} label="Messenger" onPress={shareReferral} />
            <ShareAction imageSource={require('../../../assets/link.png')} label="Copy Link" onPress={shareReferral} />
          </View>
        </View>

        <View style={{ height: 40, backgroundColor: '#FFFFFF' }} />
        <View style={{ height: 12, backgroundColor: '#F1F1F1', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E8E8E8' }} />

        <View style={{ marginHorizontal: 20, marginTop: 16, padding: 22, gap: 21, borderRadius: 10, borderCurve: 'continuous', backgroundColor: '#F6F6FA' }}>
          <Text selectable style={{ fontSize: 20, lineHeight: 27, fontWeight: '700', color: '#1F1922' }}>How it works?</Text>
          {STEPS.map((step, index) => (
            <View key={step} style={{ minHeight: 46, flexDirection: 'row', alignItems: 'flex-start', gap: 15 }}>
              <View style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#ECEBF0' }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#2E2831' }}>{index + 1}</Text>
              </View>
              {index < STEPS.length - 1 ? <View style={{ position: 'absolute', left: 13.5, top: 28, width: 1, height: 39, backgroundColor: '#DFDDE3' }} /> : null}
              <Text style={{ flex: 1, fontSize: 17, lineHeight: 24, color: '#312A35' }}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 25, paddingVertical: 26, flexDirection: 'row', alignItems: 'center', gap: 28 }}>
          <Pressable onPress={() => Alert.alert('Terms & Conditions', 'Referral terms will be available here.')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: pressed ? 0.6 : 1 })}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#1685D3' }} />
            <Text style={{ fontSize: 13, color: '#1685D3' }}>Terms & Conditions</Text>
          </Pressable>
          <Pressable onPress={() => Alert.alert('FAQs', 'Referral FAQs will be available here.')} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, opacity: pressed ? 0.6 : 1 })}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#1685D3' }} />
            <Text style={{ fontSize: 13, color: '#1685D3' }}>FAQs</Text>
          </Pressable>
        </View>

        <View style={{ height: 12, backgroundColor: '#F1F1F1', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E8E8E8' }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 26, gap: 8 }}>
          <Text selectable style={{ fontSize: 18, lineHeight: 24, fontWeight: '700', color: '#211A25' }}>You are yet to earn any scratch cards</Text>
          <Text style={{ fontSize: 13, color: '#89828C' }}>Start referring to get surprises</Text>
          <View style={{ marginTop: 18, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 15, borderTopWidth: 1, borderColor: '#F0EDF2' }}>
            <Text style={{ fontSize: 27 }}>🎁</Text>
            <Text style={{ fontSize: 14, color: '#625B67' }}>Earn ₹50 on every successful referral</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
