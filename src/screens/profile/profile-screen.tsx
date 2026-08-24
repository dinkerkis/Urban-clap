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
  onLogout: () => void;
  onManageAddresses?: () => void;
  onManagePaymentMethods?: () => void;
  onMyPlans?: () => void;
  onMyRating?: () => void;
  onPassesMembership?: () => void;
  onSettings?: () => void;
  onWallet?: () => void;
};

type QuickAction = {
  imageSource: number;
  label: string;
};

type MenuItem = {
  imageSource?: number;
  isAbout?: boolean;
  label: string;
  onPress?: () => void;
};

const QUICK_ACTIONS: QuickAction[] = [
  { imageSource: require('../../../assets/bookings.png'), label: 'My bookings' },
  { imageSource: require('../../../assets/native_devices.png'), label: 'Native devices' },
  { imageSource: require('../../../assets/suport.png'), label: 'Help & support' },
];

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
        borderColor: '#2E2932',
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

export function ProfileScreen({ email, name, phone, onAbout, onBack, onCompleteProfile, onLogout, onManageAddresses, onManagePaymentMethods, onMyPlans, onMyRating, onPassesMembership, onSettings, onWallet }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const displayName = name?.trim() || 'Urban Clap User';
  const displayEmail = email?.trim();
  const displayPhone = phone?.trim();
  const isProfileIncomplete = !name?.trim() || !displayPhone || !displayEmail;

  const menuItems: MenuItem[] = [
    { imageSource: require('../../../assets/plans.png'), label: 'My Plans', onPress: onMyPlans },
    { imageSource: require('../../../assets/wallet.png'), label: 'Wallet', onPress: onWallet },
    { imageSource: require('../../../assets/passes.png'), label: 'Passes & membership', onPress: onPassesMembership },
    { imageSource: require('../../../assets/rating.png'), label: 'My rating', onPress: onMyRating },
    { imageSource: require('../../../assets/addresses.png'), label: 'Manage addresses', onPress: onManageAddresses },
    { imageSource: require('../../../assets/payment.png'), label: 'Manage payment methods', onPress: onManagePaymentMethods },
    { imageSource: require('../../../assets/setting.png'), label: 'Settings', onPress: onSettings },
    { isAbout: true, label: 'About UC', onPress: onAbout },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 24 }}
    >
      <View style={{ paddingTop: Math.max(insets.top, 18) + 8, paddingHorizontal: 20, gap: 18 }}>
        <View style={{ minHeight: 40, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
              borderColor: '#E4E0E6',
              backgroundColor: 'transparent',
              opacity: pressed ? 0.65 : 1,
            })}
          >
            <BackIcon color="#241A30" />
          </Pressable>

          {!isProfileIncomplete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              hitSlop={10}
              onPress={onCompleteProfile}
              style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}
            >
              <EditIcon size={19} />
            </Pressable>
          ) : <View style={{ width: 40 }} />}
        </View>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
            <View style={{ flex: 1, gap: 7 }}>
              {isProfileIncomplete ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#D83C50' }} />
                  <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: '600', color: '#C22C41' }}>Incomplete profile</Text>
                </View>
              ) : null}
              <Text selectable style={{ fontSize: 29, lineHeight: 35, fontWeight: '700', color: '#19151D' }}>
                {displayName}
              </Text>
              {displayPhone ? (
                <Text selectable style={{ fontSize: 14, lineHeight: 19, color: '#706A73' }}>{displayPhone}</Text>
              ) : null}
              {displayEmail ? (
                <Text selectable style={{ fontSize: 14, lineHeight: 19, color: '#706A73' }}>{displayEmail}</Text>
              ) : null}
              {!displayPhone && !displayEmail ? (
                <Text style={{ fontSize: 14, lineHeight: 20, color: '#706A73' }}>Add your contact details to complete your profile</Text>
              ) : null}
            </View>

            {isProfileIncomplete ? (
              <Pressable
                accessibilityRole="button"
                onPress={onCompleteProfile}
                style={({ pressed }) => ({
                  paddingHorizontal: 17,
                  paddingVertical: 9,
                  borderRadius: 9,
                  borderCurve: 'continuous',
                  borderWidth: 1,
                  borderColor: '#A9A3AD',
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#2D2830' }}>Complete</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              onPress={() => showComingSoon(action.label)}
              style={({ pressed }) => ({
                flex: 1,
                minHeight: 112,
                padding: 14,
                justifyContent: 'space-between',
                borderRadius: 14,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: '#E8E4EA',
                backgroundColor: pressed ? '#F8F6FA' : '#FFFFFF',
              })}
            >
              <Image source={action.imageSource} contentFit="contain" style={{ width: 24, height: 24 }} />
              <Text style={{ fontSize: 15, lineHeight: 21, fontWeight: '600', color: '#252027' }}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ height: 8, marginTop: 22, backgroundColor: '#F6F5F7' }} />

      <View style={{ paddingHorizontal: 20, paddingVertical: 6 }}>
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            onPress={item.onPress ?? (() => showComingSoon(item.label))}
            style={({ pressed }) => ({
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 15,
              paddingHorizontal: 4,
              opacity: pressed ? 0.55 : 1,
            })}
          >
            <View style={{ width: 24, alignItems: 'center' }}>
              {item.isAbout ? (
                <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1.2, borderColor: '#4E4752', borderRadius: 4, borderCurve: 'continuous' }}>
                  <Text style={{ fontSize: 7, lineHeight: 9, fontWeight: '800', color: '#4E4752' }}>UC</Text>
                </View>
              ) : item.imageSource ? (
                <Image source={item.imageSource} contentFit="contain" style={{ width: 16, height: 16 }} />
              ) : null}
            </View>
            <Text style={{ flex: 1, fontSize: 15, lineHeight: 21, fontWeight: '400', color: '#332E35' }}>{item.label}</Text>
            <ChevronRight />
          </Pressable>
        ))}
      </View>

      <View
        style={{
          marginHorizontal: 20,
          marginTop: 12,
          marginBottom: 12,
          padding: 18,
          minHeight: 165,
          overflow: 'hidden',
          borderRadius: 16,
          borderCurve: 'continuous',
          backgroundColor: '#F7F2FF',
        }}
      >
        <View style={{ maxWidth: '72%', gap: 8 }}>
          <Text selectable style={{ fontSize: 17, lineHeight: 23, fontWeight: '700', color: '#251D2E' }}>Refer & earn ₹50</Text>
          <Text style={{ fontSize: 14, lineHeight: 21, color: '#625A69' }}>Get ₹50 when your friend completes their first booking</Text>
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
              backgroundColor: '#6138DB',
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Refer now</Text>
          </Pressable>
        </View>
        <Text style={{ position: 'absolute', right: 18, top: 45, fontSize: 56 }}>🎁</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => Alert.alert('Logout', 'Are you sure you want to log out?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: onLogout },
        ])}
        style={({ pressed }) => ({
          minHeight: 46,
          marginHorizontal: 20,
          marginTop: 20,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 13,
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: '#ECE7EE',
          backgroundColor: pressed ? '#FFF4F5' : '#FFFFFF',
        })}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#B42738' }}>Logout</Text>
      </Pressable>

      <Text selectable style={{ paddingTop: 18, textAlign: 'center', fontSize: 11, color: '#B4AFB6' }}>Version 1.0.0</Text>
    </ScrollView>
  );
}
