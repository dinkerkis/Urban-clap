import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';

type ProfileOptionScreenProps = {
  onBack: () => void;
};

function ProfilePageHeader({ onBack, overlay = false, showBackBorder = false, title }: ProfileOptionScreenProps & { overlay?: boolean; showBackBorder?: boolean; title?: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        { paddingTop: Math.max(insets.top, 16) + 6, paddingHorizontal: 20, paddingBottom: 10 },
        overlay
          ? { position: 'absolute', zIndex: 10, top: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 255, 255, 0.88)' }
          : { backgroundColor: '#FFFFFF' },
      ]}
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
            borderRadius: showBackBorder ? 17 : 0,
            borderWidth: showBackBorder ? 1 : 0,
            borderColor: showBackBorder ? '#E4E0E6' : 'transparent',
            backgroundColor: 'transparent',
            opacity: pressed ? 0.65 : 1,
          })}
        >
          <BackIcon color="#241A30" />
        </Pressable>
        {title ? <Text style={{ marginLeft: 13, fontSize: 18, lineHeight: 24, fontWeight: '700', color: '#1F1A22' }}>{title}</Text> : null}
      </View>
    </View>
  );
}

export function MyPlansScreen({ onBack }: ProfileOptionScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ProfilePageHeader title="My plan" onBack={onBack} />
      <View style={{ height: 1, backgroundColor: '#F0EDF1' }} />
      <View style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: Math.max(insets.bottom, 20) }}>
        <Text style={{ fontSize: 21, lineHeight: 27, fontWeight: '700', color: '#1D1820' }}>Active plans</Text>
        <Text style={{ paddingTop: 16, fontSize: 15, lineHeight: 23, color: '#777078' }}>You have no active plans</Text>
      </View>
    </View>
  );
}

function EmptyPassIcon() {
  return (
    <View style={{ width: 48, height: 48 }}>
      <View style={{ position: 'absolute', left: 5, top: 2, width: 34, height: 42, paddingTop: 9, paddingHorizontal: 7, gap: 5, borderRadius: 3, backgroundColor: '#F2F0F2' }}>
        {[0, 1, 2].map((line) => <View key={line} style={{ width: line === 2 ? 13 : 20, height: 3, borderRadius: 2, backgroundColor: '#C7C3C8' }} />)}
      </View>
      <View style={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#EF2538' }}>
        <Text style={{ marginTop: -1, fontSize: 14, lineHeight: 17, fontWeight: '700', color: '#FFFFFF' }}>×</Text>
      </View>
    </View>
  );
}

export function PassesMembershipScreen({ onBack }: ProfileOptionScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ProfilePageHeader title="Passes & membership" onBack={onBack} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 70 }}>
        <EmptyPassIcon />
        <Text style={{ paddingTop: 18, fontSize: 15, lineHeight: 23, color: '#363037' }}>No passes or memberships found</Text>
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
  const headerHeight = Math.max(insets.top, 16) + 60;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ProfilePageHeader overlay showBackBorder onBack={onBack} />
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: Math.max(insets.bottom, 20) + 28 }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 26, paddingBottom: 28, gap: 7 }}>
          <Text style={{ fontSize: 13, lineHeight: 19, color: '#777078' }}>Your rating</Text>
          <Text style={{ alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: '#EEF8F1', fontSize: 12, lineHeight: 17, fontWeight: '600', color: '#31804D' }}>New user</Text>
          <Text style={{ paddingTop: 3, fontSize: 24, lineHeight: 30, fontWeight: '700', color: '#1D1820' }}>No rating yet</Text>
        </View>

        <View style={{ height: 8, backgroundColor: '#F6F5F7' }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 28, gap: 10 }}>
          <Text style={{ fontSize: 19, lineHeight: 25, fontWeight: '600', color: '#1D1820' }}>Introducing customer ratings</Text>
          <Text style={{ fontSize: 17, lineHeight: 25, color: '#777078' }}>Just like you rate UC professionals for the overall quality of the service, they also rate you on a scale of 1 to 5. Your aggregate rating is calculated after you have received ratings in at least 3 services.</Text>

          <Text style={{ paddingTop: 26, fontSize: 19, lineHeight: 25, fontWeight: '600', color: '#1D1820' }}>How can I be a 5-star customer?</Text>
          <Text style={{ fontSize: 17, lineHeight: 25, color: '#777078' }}>Did you know that nearly 80% of UC customers are 5-star rated. If you also want that coveted rating, here are a few kind gestures.</Text>

          {RATING_TIPS.map((tip) => (
            <View key={tip.title} style={{ paddingTop: 24, gap: 7 }}>
              <Text style={{ fontSize: 42, lineHeight: 48 }}>{tip.icon}</Text>
              <Text style={{ fontSize: 17, lineHeight: 23, fontWeight: '500', color: '#1D1820' }}>{tip.title}</Text>
              <Text style={{ fontSize: 17, lineHeight: 25, color: '#777078' }}>{tip.description}</Text>
            </View>
          ))}

          <Text style={{ paddingTop: 28, fontSize: 19, lineHeight: 25, fontWeight: '600', color: '#1D1820' }}>How is customer rating calculated?</Text>
          <Text style={{ fontSize: 17, lineHeight: 25, color: '#777078' }}>Your aggregate rating is a simple average of all the ratings you’ve received from UC professionals in the past. These individual ratings are anonymous, and so won’t be visible to you or the professional.</Text>
        </View>
      </ScrollView>
    </View>
  );
}
