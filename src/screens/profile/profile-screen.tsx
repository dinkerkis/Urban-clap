import { colors, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { EditIcon } from '../../components/edit-icon';

type ProfileScreenProps = {
  email?: string;
  name?: string;
  phone?: string;
  profilePicture?: string;
  onAbout?: () => void;
  onBack: () => void;
  onCompleteProfile: () => void;
  onHelpSupport?: () => void;
  onLogout: () => void;
  onManageAddresses?: () => void;
  onManagePaymentMethods?: () => void;
  onMyBookings?: () => void;
  onMyPlans?: () => void;
  onMyRating?: () => void;
  onNativeDevices?: () => void;
  onPassesMembership?: () => void;
  onSettings?: () => void;
  onWallet?: () => void;
};

type QuickAction = {
  imageSource: number;
  label: string;
  onPress?: () => void;
};

type MenuItem = {
  imageSource?: number;
  isAbout?: boolean;
  label: string;
  onPress?: () => void;
};

function showComingSoon(label: string) {
  Alert.alert(label, 'This section will be available soon.');
}

function ChevronRight() {
  return (
    <View
      style={{
        width: 7,
        height: 7,
        borderTopWidth: 1.4,
        borderRightWidth: 1.4,
        borderColor: colors.violetTone18,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

export function ProfileScreen({ email, name, phone, onAbout, onBack, onCompleteProfile, onHelpSupport, onLogout, onManageAddresses, onManagePaymentMethods, onMyBookings, onMyPlans, onMyRating, onNativeDevices, onPassesMembership, onSettings, onWallet }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const displayName = name?.trim() || 'Verified Customer';
  const displayEmail = email?.trim();
  const displayPhone = phone?.trim();
  const isProfileIncomplete = !name?.trim() || !displayEmail;

  const quickActions: QuickAction[] = [
    { imageSource: require('../../../assets/bookings.png'), label: 'My bookings', onPress: onMyBookings },
    { imageSource: require('../../../assets/native_devices.png'), label: 'Native devices', onPress: onNativeDevices },
    { imageSource: require('../../../assets/suport.png'), label: 'Help & support', onPress: onHelpSupport },
  ];

  const menuItems: MenuItem[] = [
    { imageSource: require('../../../assets/plans.png'), label: 'My Plans', onPress: onMyPlans },
    { imageSource: require('../../../assets/wallet.png'), label: 'Wallet', onPress: onWallet },
    { imageSource: require('../../../assets/passes.png'), label: 'Passes & membership', onPress: onPassesMembership },
    { imageSource: require('../../../assets/rating.png'), label: 'My rating', onPress: onMyRating },
    { imageSource: require('../../../assets/location.png'), label: 'Manage addresses', onPress: onManageAddresses },
    { imageSource: require('../../../assets/payment.png'), label: 'Manage payment methods', onPress: onManagePaymentMethods },
    { imageSource: require('../../../assets/setting.png'), label: 'Settings', onPress: onSettings },
    { isAbout: true, label: 'About UC', onPress: onAbout },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: colors.white }}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 24 }}
    >
      <View style={{ paddingTop: Math.max(insets.top, 18) + 8, paddingHorizontal: 16, gap: 18 }}>
        <View style={{ height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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

          {!isProfileIncomplete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              hitSlop={10}
              onPress={onCompleteProfile}
              style={({ pressed }) => ({ width: 40, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
            >
              <EditIcon size={19} />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        <View style={{ gap: 10 }}>
          {isProfileIncomplete ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: colors.redTone96,
                }}
              >
                <View
                  style={{
                    width: 14,
                    height: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 7,
                    backgroundColor: colors.redTone54,
                  }}
                >
                  <Text style={{ marginTop: -0.5, fontSize: 10, lineHeight: 11, fontWeight: '700', color: colors.white }}>!</Text>
                </View>
                <Text style={{ fontSize: fontSizes.size12, lineHeight: 16, fontWeight: '600', color: colors.redTone47 }}>Incomplete profile</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={onCompleteProfile}
                style={({ pressed }) => ({
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: colors.mauveTone17_2,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: fontSizes.size13, fontWeight: '600', color: colors.mauveTone17_2 }}>Complete</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={{ gap: 6 }}>
            <Text selectable style={{ fontSize: fontSizes.size29, lineHeight: 35, fontWeight: '700', color: colors.violetTone10 }}>
              {displayName}
            </Text>
            {displayPhone ? (
              <Text selectable style={{ fontSize: fontSizes.size14, lineHeight: 19, color: colors.mauveTone43_2 }}>{displayPhone}</Text>
            ) : null}
            {displayEmail ? (
              <Text selectable style={{ fontSize: fontSizes.size14, lineHeight: 19, color: colors.mauveTone43_2 }}>{displayEmail}</Text>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              onPress={action.onPress ?? (() => showComingSoon(action.label))}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 112,
                padding: 14,
                justifyContent: 'space-between',
                borderRadius: 14,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: colors.mauveTone91,
                backgroundColor: pressed ? colors.violetTone97_4 : colors.white,
              })}
            >
              <Image source={action.imageSource} contentFit="contain" style={{ width: 24, height: 24 }} />
              <Text style={{ fontSize: fontSizes.size15, lineHeight: 21, fontWeight: '600', color: colors.mauveTone14_3 }}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ height: 8, marginTop: 22, backgroundColor: colors.violetTone96_6 }} />

      <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            onPress={item.onPress ?? (() => showComingSoon(item.label))}
            style={({ pressed }) => ({
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 4,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <View style={{ width: 24, alignItems: 'center' }}>
              {item.isAbout ? (
                <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.2, borderColor: colors.mauveTone30_2, borderRadius: 4, borderCurve: 'continuous' }}>
                  <Text style={{ fontSize: fontSizes.size7, lineHeight: 9, fontWeight: '800', color: colors.mauveTone30_2 }}>UC</Text>
                </View>
              ) : item.imageSource ? (
                <Image source={item.imageSource} contentFit="contain" style={{ width: 16, height: 16 }} />
              ) : null}
            </View>
            <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 21, fontWeight: '400', color: colors.mauveTone19_4 }}>{item.label}</Text>
            <ChevronRight />
          </Pressable>
        ))}
      </View>

      <View
        style={{
          marginHorizontal: 16,
          marginTop: 12,
          marginBottom: 12,
          padding: 18,
          minHeight: 165,
          overflow: 'hidden',
          borderRadius: 16,
          borderCurve: 'continuous',
          backgroundColor: colors.violetTone97_2,
        }}
      >
        <View style={{ maxWidth: '72%', gap: 8 }}>
          <Text selectable style={{ fontSize: fontSizes.size17, lineHeight: 23, fontWeight: '700', color: colors.violetTone15_2 }}>Refer & earn ₹50</Text>
          <Text style={{ fontSize: fontSizes.size14, lineHeight: 21, color: colors.violetTone38_2 }}>Get ₹50 when your friend completes their first booking</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => showComingSoon('Refer & earn')}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              marginTop: 7,
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 8,
              borderCurve: 'continuous',
              backgroundColor: colors.violetTone54,
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text style={{ fontSize: fontSizes.size13, fontWeight: '700', color: colors.white }}>Refer now</Text>
          </Pressable>
        </View>
        <Text style={{ position: 'absolute', right: 18, top: 45, fontSize: fontSizes.size56 }}>🎁</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert('Logout', 'Are you sure you want to log out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: onLogout },
        ])}
        style={({ pressed }) => ({
          minHeight: 44,
          marginHorizontal: 16,
          marginTop: 20,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: colors.violetTone92,
          backgroundColor: pressed ? colors.redTone98 : colors.white,
        })}
      >
        <Text style={{ fontSize: fontSizes.size16, fontWeight: '600', color: colors.redTone43 }}>Logout</Text>
      </Pressable>

      <Text selectable style={{ paddingTop: 18, textAlign: 'center', fontSize: fontSizes.size11, color: colors.mauveTone70 }}>Version 1.0.0</Text>
    </ScrollView>
  );
}
