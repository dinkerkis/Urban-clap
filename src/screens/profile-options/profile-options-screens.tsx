import { colors, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';

type ProfileOptionScreenProps = {
  onBack: () => void;
};

type AccountHelpScreenProps = ProfileOptionScreenProps & {
  onChangeEmail: () => void;
  onChangePhone: () => void;
  onPaymentDetails: () => void;
  onSavedAddresses: () => void;
};

type MyBookingsScreenProps = ProfileOptionScreenProps & {
  onExplore: () => void;
  onHelp?: () => void;
};

function ProfilePageHeader({
  onBack,
  overlay = false,
  rightSlot,
  title,
}: ProfileOptionScreenProps & { overlay?: boolean; rightSlot?: ReactNode; title?: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        { paddingTop: Math.max(insets.top, 18) + 8, paddingHorizontal: 20, paddingBottom: 10 },
        overlay
          ? { position: 'absolute', zIndex: 10, top: 0, left: 0, right: 0, backgroundColor: colors.whiteAlpha88 }
          : { backgroundColor: colors.white },
      ]}
    >
      <View style={{ height: 34, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
          onPress={onBack}
          style={({ pressed }) => ({
            width: 34,
            height: 34,
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: colors.transparent,
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <BackIcon color={colors.violetTone15} />
        </Pressable>
        {title ? <Text style={{ marginLeft: 5, flex: 1, fontSize: fontSizes.size18, lineHeight: 24, fontWeight: '700', color: colors.mauveTone12_2 }}>{title}</Text> : <View style={{ flex: 1 }} />}
        {rightSlot ?? null}
      </View>
    </View>
  );
}

export function MyPlansScreen({ onBack }: ProfileOptionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader title="My plan" onBack={onBack} />
      <View style={{ height: 1, backgroundColor: colors.mauveTone94 }} />
      <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: Math.max(insets.bottom, 20) }}>
        <Text style={{ fontSize: fontSizes.size21, lineHeight: 27, fontWeight: '700', color: colors.mauveTone11 }}>Active plans</Text>
        <Text style={{ paddingTop: 16, fontSize: fontSizes.size15, lineHeight: 23, color: colors.neutralTone45 }}>You have no active plans</Text>
      </View>
    </View>
  );
}

function EmptyPassIcon() {
  return (
    <View style={{ width: 48, height: 48 }}>
      <View style={{ position: 'absolute', left: 5, top: 2, width: 34, height: 42, paddingTop: 9, paddingHorizontal: 7, gap: 5, borderRadius: 3, backgroundColor: colors.mauveTone95 }}>
        {[0, 1, 2].map((line) => <View key={line} style={{ width: line === 2 ? 13 : 20, height: 3, borderRadius: 2, backgroundColor: colors.mauveTone77_2 }} />)}
      </View>
      <View style={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.redTone54_2 }}>
        <Text style={{ marginTop: -1, fontSize: fontSizes.size14, lineHeight: 17, fontWeight: '700', color: colors.white }}>×</Text>
      </View>
    </View>
  );
}

export function PassesMembershipScreen({ onBack }: ProfileOptionScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader title="Passes & membership" onBack={onBack} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 70 }}>
        <EmptyPassIcon />
        <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone20 }}>No passes or memberships found</Text>
      </View>
    </View>
  );
}

const RATING_TIPS = [
  { icon: '🤝', title: 'Empathise', description: "Show them you care by offering water, it’ll help raise their spirit and energy levels" },
  { icon: '❤️', title: 'Support', description: 'Provide access to the washroom (if required); they might have been on the go for a while!' },
  { icon: '💬', title: 'Respect', description: 'Treat professionals the way you’d expect to be treated.' },
] as const;

export function MyRatingScreen({ onBack }: ProfileOptionScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 18) + 52;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader overlay onBack={onBack} />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(insets.bottom, 20) + 28 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 26, paddingBottom: 28, gap: 7 }}>
          <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.neutralTone45 }}>Your rating</Text>
          <Text style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: colors.greenTone95_2, fontSize: fontSizes.size12, lineHeight: 17, fontWeight: '600', color: colors.greenTone35 }}>New user</Text>
          <Text style={{ paddingTop: 3, fontSize: fontSizes.size24, lineHeight: 30, fontWeight: '700', color: colors.mauveTone11 }}>No rating yet</Text>
        </View>

        <View style={{ height: 8, backgroundColor: colors.violetTone96_6 }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 10 }}>
          <Text style={{ fontSize: fontSizes.size19, lineHeight: 25, fontWeight: '600', color: colors.mauveTone11 }}>Introducing customer ratings</Text>
          <Text style={{ fontSize: fontSizes.size17, lineHeight: 25, color: colors.neutralTone45 }}>Just like you rate UC professionals for the overall quality of the service, they also rate you on a scale of 1 to 5. Your aggregate rating is calculated after you have received ratings in at least 3 services.</Text>

          <Text style={{ paddingTop: 26, fontSize: fontSizes.size19, lineHeight: 25, fontWeight: '600', color: colors.mauveTone11 }}>How can I be a 5-star customer?</Text>
          <Text style={{ fontSize: fontSizes.size17, lineHeight: 25, color: colors.neutralTone45 }}>Did you know that nearly 80% of UC customers are 5-star rated. If you also want that coveted rating, here are a few kind gestures.</Text>

          {RATING_TIPS.map((tip) => (
            <View key={tip.title} style={{ paddingTop: 24, gap: 7 }}>
              <Text style={{ fontSize: fontSizes.size42, lineHeight: 48 }}>{tip.icon}</Text>
              <Text style={{ fontSize: fontSizes.size17, lineHeight: 23, fontWeight: '500', color: colors.mauveTone11 }}>{tip.title}</Text>
              <Text style={{ fontSize: fontSizes.size17, lineHeight: 25, color: colors.neutralTone45 }}>{tip.description}</Text>
            </View>
          ))}

          <Text style={{ paddingTop: 28, fontSize: fontSizes.size19, lineHeight: 25, fontWeight: '600', color: colors.mauveTone11 }}>How is customer rating calculated?</Text>
          <Text style={{ fontSize: fontSizes.size17, lineHeight: 25, color: colors.neutralTone45 }}>Your aggregate rating is a simple average of all the ratings you’ve received from UC professionals in the past. These individual ratings are anonymous, and so won’t be visible to you or the professional.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function HelpChip({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Help"
      onPress={onPress}
      style={({ pressed }) => ({
        minWidth: 62,
        height: 32,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderCurve: 'continuous',
        borderWidth: 1,
        borderColor: colors.violetTone84,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontSize: fontSizes.size14, fontWeight: '600', color: colors.violetTone58 }}>Help</Text>
    </Pressable>
  );
}

function TopicChevron({ color = colors.mauveTone60_2 }: { color?: string }) {
  return (
    <View
      style={{
        width: 7,
        height: 7,
        borderTopWidth: 1.5,
        borderRightWidth: 1.5,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

function NativeDevicesArt() {
  return (
    <View style={{ width: 120, height: 100, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 72,
          height: 52,
          borderRadius: 8,
          borderCurve: 'continuous',
          backgroundColor: colors.slateTone18,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ rotate: '-8deg' }],
        }}
      >
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.cyanTone63 }} />
        <View style={{ position: 'absolute', right: -4, top: 14, width: 8, height: 22, borderRadius: 3, backgroundColor: colors.slateTone11 }} />
      </View>
      <View
        style={{
          position: 'absolute',
          right: 18,
          bottom: 8,
          width: 28,
          height: 68,
          borderRadius: 5,
          backgroundColor: colors.slateTone85,
          transform: [{ rotate: '6deg' }],
        }}
      >
        <View style={{ width: 14, height: 3, marginTop: 10, alignSelf: 'center', borderRadius: 2, backgroundColor: colors.neutralTone70 }} />
        <View style={{ width: 14, height: 3, marginTop: 5, alignSelf: 'center', borderRadius: 2, backgroundColor: colors.neutralTone70 }} />
      </View>
    </View>
  );
}

const HELP_TOPICS = [
  { imageSource: require('../../../assets/profile.png'), label: 'Account' },
  { imageSource: require('../../../assets/native_devices.png'), label: 'Getting started with UC' },
  { imageSource: require('../../../assets/wallet.png'), label: 'Payment & UC Credits' },
  { imageSource: require('../../../assets/passes.png'), label: 'UC Plus Membership' },
  { imageSource: require('../../../assets/safety.png'), label: 'UC Safety' },
  { imageSource: require('../../../assets/claim.png'), label: 'Claim Warranty' },
] as const;

export function ProfileMyBookingsScreen({ onBack, onExplore, onHelp }: MyBookingsScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader
        title="My bookings"
        onBack={onBack}
        rightSlot={<HelpChip onPress={onHelp ?? (() => Alert.alert('Help', 'Support will be available soon.'))} />}
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, paddingBottom: Math.max(insets.bottom, 20) + 40 }}>
        <Text style={{ fontSize: fontSizes.size20, lineHeight: 26, fontWeight: '700', color: colors.violetTone10_2, textAlign: 'center' }}>No bookings yet.</Text>
        <Text style={{ paddingTop: 10, maxWidth: 280, textAlign: 'center', fontSize: fontSizes.size14, lineHeight: 21, color: colors.neutralTone45 }}>
          Looks like you haven’t experienced quality services at home.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={onExplore}
          style={({ pressed }) => ({ marginTop: 18, opacity: pressed ? 0.55 : 1 })}
        >
          <Text style={{ fontSize: fontSizes.size15, lineHeight: 21, fontWeight: '600', color: colors.violetTone58 }}>Explore our services →</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function NativeDevicesScreen({ onBack }: ProfileOptionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader onBack={onBack} />
      <Text style={{ paddingHorizontal: 20, paddingTop: 8, fontSize: fontSizes.size28, lineHeight: 34, fontWeight: '700', color: colors.violetTone10_2 }}>Your Native devices</Text>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: Math.max(insets.bottom, 20) + 60 }}>
        <NativeDevicesArt />
        <Text style={{ paddingTop: 22, fontSize: fontSizes.size16, lineHeight: 22, fontWeight: '700', color: colors.violetTone10_2 }}>No devices</Text>
        <Text style={{ paddingTop: 6, fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone54 }}>Your Native devices will be visible here</Text>
      </View>
    </View>
  );
}

export function HelpSupportScreen({ onAccount, onBack, onGettingStarted, onMembership, onPaymentCredits, onSafety, onWarranty }: ProfileOptionScreenProps & { onAccount: () => void; onGettingStarted: () => void; onMembership: () => void; onPaymentCredits: () => void; onSafety: () => void; onWarranty: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader title="Help" onBack={onBack} />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: Math.max(insets.bottom, 20) + 28 }}
      >
        <Text style={{ fontSize: fontSizes.size22, lineHeight: 28, fontWeight: '700', color: colors.violetTone10_2 }}>All topics</Text>
        <View style={{ marginTop: 14 }}>
          {HELP_TOPICS.map((topic, index) => (
            <Pressable
              key={topic.label}
              accessibilityRole="button"
              onPress={topic.label === 'Account' ? onAccount : topic.label === 'Getting started with UC' ? onGettingStarted : topic.label === 'Payment & UC Credits' ? onPaymentCredits : topic.label === 'UC Plus Membership' ? onMembership : topic.label === 'UC Safety' ? onSafety : onWarranty}
              style={({ pressed }) => ({
                minHeight: 56,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                borderBottomWidth: index === HELP_TOPICS.length - 1 ? 0 : 1,
                borderBottomColor: colors.mauveTone94,
                opacity: pressed ? 0.55 : 1,
              })}
            >
              <View style={{ width: 22, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={topic.imageSource} contentFit="contain" tintColor={colors.mauveTone9_2} style={{ width: 18, height: 18 }} />
              </View>
              <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 21, color: colors.violetTone18 }}>{topic.label}</Text>
              <TopicChevron color={colors.black} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const ACCOUNT_HELP_TOPICS = [
  { key: 'phone', label: 'I want to change my phone number' },
  { key: 'addresses', label: 'Where can I check my saved addresses?' },
  { key: 'email', label: 'I want to change my email address' },
  { key: 'payment', label: 'Where can I see my saved payment details?' },
] as const;

export type GettingStartedArticleKey = 'about' | 'booking' | 'cancellation' | 'minimum-order' | 'preferred-professional' | 'rebook';
export type MembershipArticleKey = 'benefits' | 'cancel' | 'cash-on-delivery' | 'excluded-categories' | 'family' | 'maximum-discount' | 'pause' | 'purchase';
export type PaymentCreditsArticleKey = 'credits' | 'payment-failed' | 'pay-later' | 'referral' | 'referral-missing' | 'rewards-validity' | 'saved-payments' | 'wallet-balance';
export type WarrantyArticleKey = 'covered-services' | 'payment';

export function SafetyArticleScreen({ onBack }: ProfileOptionScreenProps) {
  return (
    <AccountArticleScreen
      title="Know more about Urban Company’s safety measures"
      description="At Urban Company, the safety of customers and professionals is taken extremely seriously. To ensure this, we have taken the following precautionary measures:"
      onBack={onBack}
    >
      <BulletSteps steps={['We conduct background verification on all our professionals', 'In case of any critical support, SOS button is available in app for both our customers and professionals']} />
    </AccountArticleScreen>
  );
}

const WARRANTY_TOPICS: readonly { key: WarrantyArticleKey; label: string }[] = [
  { key: 'covered-services', label: 'Which services are covered under UC warranty?' },
  { key: 'payment', label: 'Do I have to pay for the service under warranty?' },
];

export function WarrantyHelpScreen({ onBack, onTopic }: ProfileOptionScreenProps & { onTopic: (key: WarrantyArticleKey) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader onBack={onBack} />
      <Text style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, fontSize: fontSizes.size26, lineHeight: 33, fontWeight: '700', color: colors.violetTone10_2 }}>Warranty</Text>
      <View style={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20) + 28, borderTopWidth: 1, borderTopColor: colors.mauveTone94 }}>
        {WARRANTY_TOPICS.map((topic, index) => (
          <Pressable key={topic.key} accessibilityRole="button" onPress={() => onTopic(topic.key)} style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: index === WARRANTY_TOPICS.length - 1 ? 0 : 1, borderBottomColor: colors.mauveTone94, opacity: pressed ? 0.55 : 1 })}>
            <Text style={{ flex: 1, paddingRight: 12, fontSize: fontSizes.size15, lineHeight: 22, color: colors.violetTone18 }}>{topic.label}</Text>
            <TopicChevron />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function WarrantyArticleScreen({ article, onBack }: ProfileOptionScreenProps & { article: WarrantyArticleKey }) {
  if (article === 'payment') {
    return <AccountArticleScreen title="Do I have to pay for the service under warranty?" description="No. You can book a free revisit from the booking screen if the same issue persists during warranty. Our professionals will visit your place again to solve the problem with your utmost satisfaction." onBack={onBack} />;
  }

  return (
    <AccountArticleScreen title="Which services are covered under UC warranty?" description="UC Warranty covers:" onBack={onBack}>
      <View style={{ paddingTop: 16, gap: 10 }}>
        {[
          ['Appliance repairs', ' like AC, RO, Washing machine repairs etc.'],
          ['Pest control', ' services'],
          ['Painting', ' services'],
        ].map(([label, detail], index) => (
          <View key={label} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 12 }}>
            <Text style={{ width: 20, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>{index + 1}.</Text>
            <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}><Text style={{ fontWeight: '700' }}>{label}</Text>{detail}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 1, marginTop: 20, backgroundColor: colors.mauveTone94 }} />
      <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>However, the UC warranty <Text style={{ fontWeight: '700' }}>does not</Text> cover:</Text>
      <NumberedSteps steps={['Any new issue that occurs post the service', 'Any item/service that is not mentioned on the invoice']} />
    </AccountArticleScreen>
  );
}

const MEMBERSHIP_SECTIONS: readonly {
  title: string;
  topics: readonly { key: MembershipArticleKey; label: string }[];
}[] = [
  {
    title: 'Purchase',
    topics: [
      { key: 'benefits', label: 'What are the benefits of the membership?' },
      { key: 'maximum-discount', label: 'What is the maximum discount that I can get by using UC Plus?' },
      { key: 'purchase', label: 'How do I buy the membership?' },
      { key: 'cash-on-delivery', label: 'Can I pay for membership with cash on delivery?' },
      { key: 'family', label: 'Can I share membership with family?' },
      { key: 'excluded-categories', label: 'Are any categories not included in Plus membership?' },
    ],
  },
  {
    title: 'Modifications',
    topics: [
      { key: 'cancel', label: 'How do I cancel my membership plan?' },
      { key: 'pause', label: 'Can I pause my membership?' },
    ],
  },
];

export function MembershipHelpScreen({ onBack, onTopic }: ProfileOptionScreenProps & { onTopic: (key: MembershipArticleKey) => void }) {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 18) + 52;

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader overlay onBack={onBack} />
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(insets.bottom, 20) + 28 }}>
        <Text style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, fontSize: fontSizes.size26, lineHeight: 33, fontWeight: '700', color: colors.violetTone10_2 }}>UC Plus membership</Text>
        {MEMBERSHIP_SECTIONS.map((section, sectionIndex) => (
          <View key={section.title} style={{ borderTopWidth: sectionIndex === 0 ? 1 : 8, borderTopColor: sectionIndex === 0 ? colors.mauveTone94 : colors.violetTone96_6, paddingHorizontal: 20, paddingTop: 18 }}>
            <Text style={{ paddingBottom: 8, fontSize: fontSizes.size17, lineHeight: 23, fontWeight: '600', color: colors.violetTone10_2 }}>{section.title}</Text>
            {section.topics.map((topic, index) => (
              <Pressable key={topic.key} accessibilityRole="button" onPress={() => onTopic(topic.key)} style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: index === section.topics.length - 1 ? 0 : 1, borderBottomColor: colors.mauveTone94, opacity: pressed ? 0.55 : 1 })}>
                <Text style={{ flex: 1, paddingRight: 12, fontSize: fontSizes.size15, lineHeight: 22, color: colors.violetTone18 }}>{topic.label}</Text>
                <TopicChevron />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function MembershipArticleScreen({ article, onBack }: ProfileOptionScreenProps & { article: MembershipArticleKey }) {
  const articleContent: Record<MembershipArticleKey, { title: string; description: string; children?: ReactNode }> = {
    benefits: {
      title: 'What are the benefits of the membership?',
      description: 'UC Plus membership comes with a range of benefits that are designed just for you.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>As a valued member of our community, you’ll enjoy our ever expanding list of exclusive perks.</Text>,
    },
    cancel: {
      title: 'How do I cancel my membership plan?',
      description: 'UC Plus membership once activated, cannot be cancelled.',
    },
    'cash-on-delivery': {
      title: 'Can I pay for membership with cash on delivery?',
      description: 'No, the membership can only be activated when payment is made online.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Once the membership is activated, you can place the next set of bookings using Cash on Delivery method as well.</Text>,
    },
    'excluded-categories': {
      title: 'Are any categories not included in Plus membership?',
      description: 'Plus discount is not applicable on Multi-session Packs, Weekly Bathroom Cleaning plans, Native smart appliances, and bookings made in Home Decor & Insta Help.',
    },
    family: {
      title: 'Can I share membership with family?',
      description: 'Only you can avail benefits of the UC Plus membership as it is linked with your UC account only.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>However, you can book the services for others from your account and still receive same benefits under your name.</Text>,
    },
    'maximum-discount': {
      title: 'What is the maximum discount that I can get by using UC Plus?',
      description: 'There is no limit on the number of bookings under the membership. But as per our fair usage policy, the total discount you can avail is limited to 6 times the membership price paid.',
    },
    pause: {
      title: 'Can I pause my membership?',
      description: 'No, the membership, once activated cannot be paused.',
    },
    purchase: {
      title: 'How do I buy the membership?',
      description: 'To buy UC Plus membership:',
      children: <><BulletSteps steps={['Select the service of your choice', 'During checkout you have an option to choose between annual and half-yearly membership plans', 'Once your booking is placed successfully, UC Plus membership will be activated']} /><Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Please note that the membership can only be activated when payment is made online.</Text></>,
    },
  };
  const content = articleContent[article];

  return <AccountArticleScreen title={content.title} description={content.description} onBack={onBack}>{content.children}</AccountArticleScreen>;
}

const GETTING_STARTED_SECTIONS = [
  { title: 'About us', topics: [{ key: 'about', label: 'What is Urban Company?' }] },
  {
    title: 'Bookings',
    topics: [
      { key: 'booking', label: 'How to place a booking?' },
      { key: 'rebook', label: 'Can I re-book the same professional if I like their service?' },
      { key: 'preferred-professional', label: 'How to book my preferred professional?' },
      { key: 'minimum-order', label: 'Do I have to order a minimum value of services before I can place the booking?' },
      { key: 'cancellation', label: 'Does Urban Company charge any cancellation fee?' },
    ],
  },
] as const;

export function GettingStartedHelpScreen({ onBack, onTopic }: ProfileOptionScreenProps & { onTopic: (key: GettingStartedArticleKey) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader onBack={onBack} />
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 28 }}>
        <Text style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, fontSize: fontSizes.size26, lineHeight: 33, fontWeight: '700', color: colors.violetTone10_2 }}>Getting started with UC</Text>
        {GETTING_STARTED_SECTIONS.map((section, sectionIndex) => (
          <View key={section.title} style={{ borderTopWidth: sectionIndex === 0 ? 1 : 8, borderTopColor: sectionIndex === 0 ? colors.mauveTone94 : colors.violetTone96_6, paddingHorizontal: 20, paddingTop: 18 }}>
            <Text style={{ paddingBottom: 8, fontSize: fontSizes.size17, lineHeight: 23, fontWeight: '600', color: colors.violetTone10_2 }}>{section.title}</Text>
            {section.topics.map((topic, index) => (
              <Pressable key={topic.key} accessibilityRole="button" onPress={() => onTopic(topic.key)} style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: index === section.topics.length - 1 ? 0 : 1, borderBottomColor: colors.mauveTone94, opacity: pressed ? 0.55 : 1 })}>
                <Text style={{ flex: 1, paddingRight: 12, fontSize: fontSizes.size15, lineHeight: 22, color: colors.violetTone18 }}>{topic.label}</Text>
                <TopicChevron />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function NumberedSteps({ steps }: { steps: readonly string[] }) {
  return (
    <View style={{ paddingTop: 16, gap: 10 }}>
      {steps.map((step, index) => (
        <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 12 }}>
          <Text style={{ width: 20, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>{index + 1}.</Text>
          <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

function BulletSteps({ steps }: { steps: readonly string[] }) {
  return (
    <View style={{ paddingTop: 16, gap: 10 }}>
      {steps.map((step) => (
        <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 12 }}>
          <Text style={{ width: 18, fontSize: fontSizes.size17, lineHeight: 23, color: colors.mauveTone38_2 }}>•</Text>
          <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>{step}</Text>
        </View>
      ))}
    </View>
  );
}

const PAYMENT_CREDITS_TOPICS: readonly { key: PaymentCreditsArticleKey; label: string }[] = [
  { key: 'payment-failed', label: 'I am unable to make payment' },
  { key: 'wallet-balance', label: 'How do I check my wallet balance?' },
  { key: 'credits', label: 'How do I use my UC credits?' },
  { key: 'rewards-validity', label: 'Can I extend the validity of the rewards?' },
  { key: 'referral', label: 'How does referral work?' },
  { key: 'referral-missing', label: 'I have not received a reward for referral' },
  { key: 'saved-payments', label: 'Where can I see my saved payment details?' },
  { key: 'pay-later', label: 'Will I be charged extra if I choose to pay later?' },
];

export function PaymentCreditsHelpScreen({ onBack, onTopic }: ProfileOptionScreenProps & { onTopic: (key: PaymentCreditsArticleKey) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader onBack={onBack} />
      <Text style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14, fontSize: fontSizes.size26, lineHeight: 33, fontWeight: '700', color: colors.violetTone10_2 }}>Payment & UC Credits</Text>
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20) + 28, borderTopWidth: 1, borderTopColor: colors.mauveTone94 }}>
        {PAYMENT_CREDITS_TOPICS.map((topic, index) => (
          <Pressable key={topic.key} accessibilityRole="button" onPress={() => onTopic(topic.key)} style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: index === PAYMENT_CREDITS_TOPICS.length - 1 ? 0 : 1, borderBottomColor: colors.mauveTone94, opacity: pressed ? 0.55 : 1 })}>
            <Text style={{ flex: 1, paddingRight: 12, fontSize: fontSizes.size15, lineHeight: 22, color: colors.violetTone18 }}>{topic.label}</Text>
            <TopicChevron />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export function PaymentCreditsArticleScreen({ article, onBack, onSavedPayments, onWallet }: ProfileOptionScreenProps & { article: PaymentCreditsArticleKey; onSavedPayments: () => void; onWallet: () => void }) {
  const articleContent: Record<PaymentCreditsArticleKey, { title: string; description: string; children?: ReactNode; buttonLabel?: string; onAction?: () => void }> = {
    credits: {
      title: 'How do I use my UC credits?',
      description: 'Usage of UC credits applies to specific services.',
      children: <><Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>For more details, you may check by accessing our mobile app &gt; profile &gt; my wallet.</Text><Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Activate the usage of your credits at the cart summary page before checking out!</Text></>,
      buttonLabel: 'Go to wallet', onAction: onWallet,
    },
    'payment-failed': {
      title: 'I am unable to make payment',
      description: 'If you are not able to complete payment, please try the following steps:',
      children: <><BulletSteps steps={["Select a different payment mode than the one you’re trying with (e.g. try using your debit card instead of UPI).", 'If switching payment mode doesn’t work - then select “Pay online after service” or “Pay with cash after service”. In case paying online, you will be able to pick a mode of your choice after the service ends.', 'If multiple payment options are failing or pay after service is not available - please wait for some time and try placing the booking again.']} /><Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>If any amount has been debited and the booking shows “payment failed” - please don’t worry. Any debited amount will be credited back to your source account within 7 working days.</Text></>,
    },
    'pay-later': {
      title: 'Will I be charged extra if I choose to pay later?',
      description: 'Yes, a ₹9 convenience fee is charged if you choose to pay later. You can avoid this fee by choosing to pay online at the time of booking.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Note: If your payment attempt fails and your booking automatically moves to pay later, no extra fee will be applied.</Text>,
    },
    referral: {
      title: 'How does referral work?',
      description: 'To be eligible for the referral reward, you have to fulfil the below requirements:',
      children: <><NumberedSteps steps={['Your friend must be a first-time user of Urban Company', 'Download our mobile app and register via your referral link', 'Account details must have a verified mobile number']} /><Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Once your friend takes service with us, they will get instant ₹100 off and you can win up to ₹5000 in rewards.</Text></>,
    },
    'referral-missing': {
      title: 'I have not received the reward for referral',
      description: 'You are eligible for referral reward when:',
      children: <><NumberedSteps steps={['Your referral is a first-time user on Urban Company app', 'They have successfully availed at least 1 service from us']} /><Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Your reward will be credited within 24 hours of service delivery.</Text></>,
    },
    'rewards-validity': {
      title: 'Can I extend the validity of the rewards?',
      description: 'No, the validity of the rewards or UC credits cannot be extended. Please use the credits before their validity expire.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>To check the validity of your rewards</Text>,
      buttonLabel: 'Go to wallet', onAction: onWallet,
    },
    'saved-payments': {
      title: 'Where can I see my saved payment details?',
      description: 'You can check all your saved payment details by clicking the below button.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>If you wish to remove any saved payment details, you can either unlink wallet account or delete the saved cards.</Text>,
      buttonLabel: 'Check saved payments', onAction: onSavedPayments,
    },
    'wallet-balance': {
      title: 'How do I check my wallet balance?',
      description: 'You can check your wallet balance from your profile section → My wallet.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>To check your wallet history:</Text>,
      buttonLabel: 'Go to wallet', onAction: onWallet,
    },
  };
  const content = articleContent[article];
  return <AccountArticleScreen title={content.title} description={content.description} buttonLabel={content.buttonLabel} onAction={content.onAction} onBack={onBack}>{content.children}</AccountArticleScreen>;
}

export function GettingStartedArticleScreen({ article, onBack }: ProfileOptionScreenProps & { article: GettingStartedArticleKey }) {
  const articleContent: Record<GettingStartedArticleKey, { title: string; description: string; children?: ReactNode }> = {
    about: {
      title: 'What is Urban Company?',
      description: "Urban Company (formerly UrbanClap) is Asia’s largest online home services marketplace. It was started in 2014 by Abhiraj Singh Bhal, Varun Khaitan and Raghav Chandra.",
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>We currently operate in multiple cities in India, Singapore, Saudi Arabia and UAE.</Text>,
    },
    booking: {
      title: 'How to place a booking?',
      description: 'You can follow the steps below to book a service on our app:',
      children: <NumberedSteps steps={['Search for the service on the home screen for the category you are looking for.', 'Open the category and follow the instructions as you proceed ahead.', 'Once you have booked a service, wait for the professional to get assigned. Professional will be assigned 1 hour prior to your booking time.', 'Assigned professional will reach your address at the time of the booking and will deliver the service.']} />,
    },
    cancellation: {
      title: 'Does Urban Company charge any cancellation fee?',
      description: 'Cancellation fee is charged only if a professional is assigned on your booking and the time of cancellation is closer to your booking time. This is done to fairly compensate our professionals for their time and the cost of travel while travelling to your place.',
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Exact cancellation amount will be shown while you proceed with a cancellation request.</Text>,
    },
    'minimum-order': {
      title: 'Do I have to order a minimum value of services before I can place the booking?',
      description: "To ensure efficient use of our professional’s time, there are minimum order requirements for each category.",
      children: <Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>If the services you’ve selected do not meet the minimum order requirement, you will be prompted to add more services before you can proceed to checkout.</Text>,
    },
    'preferred-professional': {
      title: 'How to book my preferred professional?',
      description: 'If you have already taken the service & rated the professional above 4 stars, you can book your preferred professional by:',
      children: <><NumberedSteps steps={['Adding services in your cart', 'Selecting your preferred professional from the list of professionals', 'Proceed with placing the booking']} /><Text style={{ paddingTop: 18, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>If the slots of your preferred professionals are not available, please proceed with placing the booking and we will try to assign you the best professional available. All our professionals are trained to deliver a high quality experience.</Text></>,
    },
    rebook: {
      title: 'Can I re-book the same professional if I like their service?',
      description: 'Yes. If you rate their service with five stars, you will get an option to re-book with the same professional the next time you book. Click on their profile and secure their slots.',
    },
  };
  const content = articleContent[article];

  return <AccountArticleScreen title={content.title} description={content.description} onBack={onBack}>{content.children}</AccountArticleScreen>;
}

export function AccountHelpScreen({ onBack, onChangeEmail, onChangePhone, onPaymentDetails, onSavedAddresses }: AccountHelpScreenProps) {
  const actions = {
    addresses: onSavedAddresses,
    email: onChangeEmail,
    payment: onPaymentDetails,
    phone: onChangePhone,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader onBack={onBack} />
      <Text style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, fontSize: fontSizes.size26, lineHeight: 33, fontWeight: '700', color: colors.violetTone10_2 }}>Account</Text>
      <View style={{ paddingHorizontal: 20 }}>
        {ACCOUNT_HELP_TOPICS.map((topic, index) => (
          <Pressable
            key={topic.key}
            accessibilityRole="button"
            onPress={actions[topic.key]}
            style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: index === ACCOUNT_HELP_TOPICS.length - 1 ? 0 : 1, borderBottomColor: colors.mauveTone94, opacity: pressed ? 0.55 : 1 })}
          >
            <Text style={{ flex: 1, paddingRight: 12, fontSize: fontSizes.size15, lineHeight: 22, color: colors.violetTone18 }}>{topic.label}</Text>
            <TopicChevron />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function ChangePhoneHelpScreen({ onBack, onChangePhone }: ProfileOptionScreenProps & { onChangePhone: () => void }) {
  return <AccountArticleScreen title="I want to change my phone number" description="You can change your phone number from the profile section after verifying it with an OTP." buttonLabel="Change phone number" onBack={onBack} onAction={onChangePhone} />;
}

type AccountArticleScreenProps = ProfileOptionScreenProps & {
  buttonLabel?: string;
  children?: ReactNode;
  description: string;
  onAction?: () => void;
  title: string;
};

export function AccountArticleScreen({ buttonLabel, children, description, onAction, onBack, title }: AccountArticleScreenProps) {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 18) + 52;
  const [feedback, setFeedback] = useState<'down' | 'up' | null>(null);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ProfilePageHeader overlay onBack={onBack} />
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(insets.bottom, 20) }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <Text style={{ fontSize: fontSizes.size22, lineHeight: 29, fontWeight: '700', color: colors.violetTone10_2 }}>{title}</Text>
          <Text style={{ paddingTop: 14, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>{description}</Text>
          {children}
          {buttonLabel && onAction ? <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => ({ alignSelf: 'flex-start', height: 40, marginTop: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.blueTone53, opacity: pressed ? 0.72 : 1 })}>
            <Text style={{ fontSize: fontSizes.size15, fontWeight: '600', color: colors.white }}>{buttonLabel}</Text>
          </Pressable> : null}
        </View>
        <View style={{ height: 1, marginTop: 24, backgroundColor: colors.mauveTone94 }} />
        <View style={{ minHeight: 72, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ flex: 1, fontSize: fontSizes.size15, color: colors.mauveTone38_2 }}>{feedback ? 'Thanks for your feedback' : 'Was this article helpful?'}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Not helpful" onPress={() => setFeedback('down')} style={({ pressed }) => ({ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}>
            <Image source="sf:hand.thumbsdown" contentFit="contain" tintColor={colors.mauveTone9_2} style={{ width: 20, height: 20, opacity: feedback === 'down' ? 1 : 0.78 }} />
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Helpful" onPress={() => setFeedback('up')} style={({ pressed }) => ({ width: 42, height: 42, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}>
            <Image source="sf:hand.thumbsup" contentFit="contain" tintColor={colors.mauveTone9_2} style={{ width: 20, height: 20, opacity: feedback === 'up' ? 1 : 0.78 }} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
