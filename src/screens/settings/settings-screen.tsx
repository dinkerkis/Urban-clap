import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';

type SettingsScreenProps = {
  email?: string;
  onBack: () => void;
  onDeleteAccount: () => void;
};

const NOTIFICATIONS = [
  { imageSource: require('../../../assets/whatsapp_setting.png'), key: 'whatsapp', label: 'WhatsApp' },
  { imageSource: require('../../../assets/notifications.png'), key: 'push', label: 'Push Notifications' },
  { imageSource: require('../../../assets/email.png'), key: 'email', label: 'Email' },
  { imageSource: require('../../../assets/sms.png'), key: 'sms', label: 'SMS' },
  { imageSource: require('../../../assets/voice_calls.png'), key: 'calls', label: 'Voice calls' },
] as const;

type NotificationKey = (typeof NOTIFICATIONS)[number]['key'];

function ScreenHeader({ onBack, title }: { onBack: () => void; title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: Math.max(insets.top, 16) + 6, paddingHorizontal: 20, paddingBottom: 10, backgroundColor: '#FFFFFF' }}>
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
        <Text style={{ marginLeft: 13, fontSize: 18, lineHeight: 24, fontWeight: '700', color: '#1F1A22' }}>{title}</Text>
      </View>
    </View>
  );
}

function ChevronRight() {
  return <View style={{ width: 8, height: 8, borderTopWidth: 1.4, borderRightWidth: 1.4, borderColor: '#29242B', transform: [{ rotate: '45deg' }] }} />;
}

function DownloadDataModal({ initialEmail, visible, onClose }: { initialEmail?: string; visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(initialEmail ?? '');
  const isValid = /^\S+@\S+\.\S+$/.test(email.trim());

  const submit = () => {
    if (!isValid) return;
    onClose();
    Alert.alert('Request submitted', `Your data will be shared at ${email.trim()}.`);
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close download data form" onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)' }} />
        <View style={{ marginHorizontal: 10, paddingHorizontal: 20, paddingTop: 28, paddingBottom: Math.max(insets.bottom, 20) + 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#FFFFFF' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={({ pressed }) => ({ position: 'absolute', right: 14, top: -54, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#FFFFFF', opacity: pressed ? 0.65 : 1 })}
          >
            <Text style={{ fontSize: 24, lineHeight: 27, fontWeight: '300', color: '#322C34' }}>×</Text>
          </Pressable>
          <Text style={{ fontSize: 21, lineHeight: 27, fontWeight: '700', color: '#1D1820' }}>Add email address</Text>
          <Text style={{ paddingTop: 7, fontSize: 15, lineHeight: 22, color: '#777078' }}>All your details will be shared on the email.</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            autoFocus
            keyboardType="email-address"
            placeholder="Enter email address"
            placeholderTextColor="#AAA4AC"
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={submit}
            style={{ height: 48, marginTop: 20, paddingHorizontal: 14, borderWidth: 1, borderColor: '#6E45E2', borderRadius: 9, fontSize: 15, color: '#1D1820' }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
            disabled={!isValid}
            onPress={submit}
            style={({ pressed }) => ({ height: 46, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: isValid ? '#6E45E2' : '#F1EFF2', opacity: pressed ? 0.72 : 1 })}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: isValid ? '#FFFFFF' : '#AAA5AC' }}>Submit</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function SettingsScreen({ email, onBack, onDeleteAccount }: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({ whatsapp: true, push: true, email: true, sms: true, calls: true });

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScreenHeader title="Settings" onBack={onBack} />
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 28 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
          <Text style={{ paddingBottom: 10, fontSize: 21, lineHeight: 27, fontWeight: '700', color: '#1D1820' }}>Notifications & reminders</Text>
          {NOTIFICATIONS.map((item) => (
            <View key={item.key} style={{ minHeight: 54, flexDirection: 'row', alignItems: 'center', borderBottomWidth: item.key === 'calls' ? 0 : 1, borderBottomColor: '#F0EDF1' }}>
              <View style={{ width: 34, alignItems: 'flex-start', justifyContent: 'center' }}>
                <Image source={item.imageSource} contentFit="contain" style={{ width: item.key === 'sms' ? 20 : 18, height: item.key === 'sms' ? 20 : 18 }} />
              </View>
              <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: '#332D35' }}>{item.label}</Text>
              <View style={{ width: 52, height: 54, alignItems: 'center', justifyContent: 'center' }}>
                <Switch
                  accessibilityLabel={`${item.label} notifications`}
                  ios_backgroundColor="#D5D1D7"
                  thumbColor="#FFFFFF"
                  trackColor={{ false: '#D5D1D7', true: '#08784D' }}
                  value={notifications[item.key]}
                  onValueChange={(value) => setNotifications((current) => ({ ...current, [item.key]: value }))}
                  style={{ transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }] }}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={{ marginHorizontal: 20, marginTop: 18, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: '#F6F5F7' }}>
          <Text style={{ fontSize: 15, lineHeight: 21, fontWeight: '600', color: '#2B252D' }}>Order related messages</Text>
          <Text style={{ paddingTop: 5, fontSize: 13, lineHeight: 21, color: '#777078' }}>Order related messages can’t be turned off as they are important for service experience</Text>
        </View>

        <View style={{ height: 8, marginTop: 24, backgroundColor: '#F6F5F7' }} />

        <View style={{ paddingHorizontal: 20, paddingTop: 26 }}>
          <Text style={{ paddingBottom: 8, fontSize: 21, lineHeight: 27, fontWeight: '700', color: '#1D1820' }}>Privacy & data</Text>
          <Pressable onPress={() => setDownloadVisible(true)} style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: '#332D35' }}>Download data</Text>
            <ChevronRight />
          </Pressable>
          <Pressable onPress={onDeleteAccount} style={({ pressed }) => ({ minHeight: 44, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: '#332D35' }}>Delete account</Text>
            <ChevronRight />
          </Pressable>
        </View>
      </ScrollView>
      <DownloadDataModal initialEmail={email} visible={downloadVisible} onClose={() => setDownloadVisible(false)} />
    </View>
  );
}

export function PrivacyCenterScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const policies = [
    'You’ll no longer be able to access your saved professionals',
    'Your customer rating will be reset',
    'All your memberships will be cancelled',
    'You’ll not be able to claim under any active warranty or insurance',
    'The changes are irreversible',
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScreenHeader title="Privacy Center" onBack={onBack} />
      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: Math.max(insets.bottom, 20) + 28 }}>
        <Text style={{ fontSize: 21, lineHeight: 27, fontWeight: '700', color: '#1D1820' }}>Account Deletion Policy</Text>
        <View style={{ paddingTop: 18, gap: 12 }}>
          {policies.map((policy) => (
            <View key={policy} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ fontSize: 17, lineHeight: 23, color: '#332D35' }}>•</Text>
              <Text style={{ flex: 1, fontSize: 15, lineHeight: 23, color: '#332D35' }}>{policy}</Text>
            </View>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => Alert.alert('Delete account?', 'This action is irreversible.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete Account', style: 'destructive' }])}
          style={({ pressed }) => ({ alignSelf: 'flex-start', minWidth: 138, height: 40, marginTop: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#E3D9DC', opacity: pressed ? 0.65 : 1 })}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#B62B3C' }}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
