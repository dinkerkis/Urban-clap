import { colors, fontFamilies, fontSizes } from '../../theme';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';

type WalletScreenProps = {
  onBack: () => void;
  onHelp: () => void;
};

const FAQS = [
  {
    question: 'I have UC credits. What happens to them now?',
    answer: 'All UC Credits have been converted to UC Cash. They are applicable on all services.',
  },
  {
    question: 'What is UC Cash?',
    answer: 'UC cash is given by us as part of our customer experience programs. It is redeemable across all categories and is valid for 1 year from date of issue.',
  },
  {
    question: 'What is UC Rewards?',
    answer: 'UC reward points are given by us as part of promotional campaigns so that users like you can try out our flagship services. They are applicable on selected categories only as mentioned on the rewards. UC rewards may have limit on maximum credits applicable per booking.',
  },
  {
    question: 'Are there any other important terms and Conditions?',
    answer: "Yes: 1. Reward points can't be clubbed with other ongoing UC offers; however third party offers like Amazon Pay can be combined. 2. Locked date slots can't be unlocked using rewards/ UC cash; but you can use your rewards after service on the final bill after service delivery in such cases. 3. Rewards will expire irrespective of service delivery date - the expiry date will not change even if service delivery window is long. It is thus advised to use pre-payment options to avail rewards in such cases. 4. Rewards/Cash won't be applicable on cash payments.",
  },
] as const;

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        marginTop: 3,
        borderRightWidth: 1.4,
        borderBottomWidth: 1.4,
        borderColor: colors.neutralTone46,
        transform: [{ rotate: expanded ? '225deg' : '45deg' }],
      }}
    />
  );
}

export function WalletScreen({ onBack, onHelp }: WalletScreenProps) {
  const insets = useSafeAreaInsets();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const headerHeight = Math.max(insets.top, 16) + 58;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 0,
          left: 0,
          right: 0,
          paddingTop: Math.max(insets.top, 16) + 6,
          paddingHorizontal: 20,
          paddingBottom: 8,
          backgroundColor: colors.whiteAlpha88,
        }}
      >
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
            onPress={onBack}
            style={({ pressed }) => ({
              width: 34,
              height: 34,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 17,
              borderWidth: 1,
              borderColor: colors.mauveTone89,
              backgroundColor: colors.transparent,
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <BackIcon color={colors.violetTone15} />
          </Pressable>
          <Text style={{ marginLeft: 13, fontSize: fontSizes.size18, lineHeight: 24, fontFamily: fontFamilies.bold, color: colors.mauveTone12_2 }}>UC Wallet</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Help"
            onPress={onHelp}
            style={({ pressed }) => ({
              marginLeft: 'auto',
              minWidth: 66,
              height: 34,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 9,
              borderWidth: 1,
              borderColor: colors.mauveTone89,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: fontSizes.size15, fontFamily: fontFamilies.semiBold, color: colors.mauveTone15 }}>Help</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.white }}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(insets.bottom, 20) + 28 }}
      >
        <View style={{ paddingHorizontal: 20 }}>
        <View style={{ paddingTop: 26, paddingBottom: 30, gap: 7 }}>
          <Text style={{ fontSize: fontSizes.size14, color: colors.neutralTone45 }}>UC Cash</Text>
          <Text style={{ fontSize: fontSizes.size36, lineHeight: 43, fontFamily: fontFamilies.bold, color: colors.mauveTone9 }}>₹0</Text>
          <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.neutralTone45 }}>Formerly UC Credits. Applicable on all services</Text>
        </View>
        </View>

        <View style={{ height: 8, backgroundColor: colors.violetTone98_3 }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 10 }}>
        <Text style={{ fontSize: fontSizes.size21, lineHeight: 27, fontFamily: fontFamilies.bold, color: colors.mauveTone11 }}>Wallet activity</Text>
        <View style={{ height: 68, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: fontSizes.size15, color: colors.neutralTone45, transform: [{ translateY: 8 }] }}>No wallet activity yet.</Text>
        </View>
        </View>

        <View style={{ height: 8, backgroundColor: colors.violetTone98_3 }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
        <Text style={{ paddingBottom: 12, fontSize: fontSizes.size21, lineHeight: 27, fontFamily: fontFamilies.bold, color: colors.mauveTone11 }}>Have a question?</Text>
        {FAQS.map((faq, index) => {
          const expanded = expandedIndex === index;
          return (
            <Pressable
              key={faq.question}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setExpandedIndex(expanded ? null : index)}
              style={({ pressed }) => ({
                paddingVertical: 18,
                borderBottomWidth: index === FAQS.length - 1 ? 0 : 1,
                borderBottomColor: colors.violetTone98_3,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
                <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 21, fontFamily: fontFamilies.medium, color: colors.black }}>{faq.question}</Text>
                <Chevron expanded={expanded} />
              </View>
              {expanded ? (
                <Text style={{ paddingTop: 12, paddingRight: 25, fontSize: fontSizes.size15, lineHeight: 23, color: colors.neutralTone45 }}>{faq.answer}</Text>
              ) : null}
            </Pressable>
          );
        })}
        </View>
      </ScrollView>
    </View>
  );
}
