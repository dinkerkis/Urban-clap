import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';

type PaymentMethodsScreenProps = {
  onBack: () => void;
};

function ChevronRight() {
  return <View style={{ width: 8, height: 8, borderTopWidth: 1.4, borderRightWidth: 1.4, borderColor: '#29242B', transform: [{ rotate: '45deg' }] }} />;
}

function CardIcon({ size = 22 }: { size?: number }) {
  return <Image source={require('../../../assets/payment.png')} contentFit="contain" tintColor="#6E45E2" style={{ width: size, height: size }} />;
}

function AddCardModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveDetails, setSaveDetails] = useState(true);
  const cardDigits = cardNumber.replace(/\D/g, '');
  const expiryDigits = expiry.replace(/\D/g, '');
  const isValid = cardDigits.length >= 12 && expiryDigits.length === 4 && cvv.length >= 3;

  const updateCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits.replace(/(.{4})/g, '$1 ').trim());
  };

  const updateExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  };

  const submit = () => {
    if (!isValid) return;
    onClose();
    setCardNumber('');
    setExpiry('');
    setCvv('');
    Alert.alert('Card verification', 'Payment verification is not connected yet. No card details were stored.');
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close add card form" onPress={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)' }} />
        <View style={{ paddingHorizontal: 18, paddingTop: 26, paddingBottom: Math.max(insets.bottom, 16) + 12, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: '#FFFFFF' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={({ pressed }) => ({ position: 'absolute', right: 14, top: -42, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#FFFFFF', opacity: pressed ? 0.65 : 1 })}
          >
            <Text style={{ fontSize: 20, lineHeight: 23, fontWeight: '300', color: '#322C34' }}>×</Text>
          </Pressable>

          <Text style={{ fontSize: 21, lineHeight: 27, fontWeight: '700', color: '#1D1820' }}>Add new card</Text>

          <View style={{ height: 50, marginTop: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderWidth: 1, borderColor: '#E2DEE4', borderRadius: 9 }}>
            <CardIcon size={20} />
            <TextInput
              accessibilityLabel="Card number"
              keyboardType="number-pad"
              placeholder="Card Number"
              placeholderTextColor="#AAA4AC"
              value={cardNumber}
              onChangeText={updateCardNumber}
              style={{ flex: 1, height: 48, marginLeft: 10, fontSize: 15, color: '#1D1820' }}
            />
          </View>

          <View style={{ marginTop: 12, flexDirection: 'row', gap: 10 }}>
            <TextInput
              accessibilityLabel="Card expiry"
              keyboardType="number-pad"
              placeholder="MM/YY"
              placeholderTextColor="#AAA4AC"
              value={expiry}
              onChangeText={updateExpiry}
              style={{ flex: 1, height: 50, paddingHorizontal: 13, borderWidth: 1, borderColor: '#E2DEE4', borderRadius: 9, fontSize: 15, color: '#1D1820' }}
            />
            <TextInput
              accessibilityLabel="CVV"
              keyboardType="number-pad"
              maxLength={4}
              placeholder="CVV"
              placeholderTextColor="#AAA4AC"
              secureTextEntry
              value={cvv}
              onChangeText={(value) => setCvv(value.replace(/\D/g, '').slice(0, 4))}
              style={{ flex: 1, height: 50, paddingHorizontal: 13, borderWidth: 1, borderColor: '#E2DEE4', borderRadius: 9, fontSize: 15, color: '#1D1820' }}
            />
          </View>

          <Pressable onPress={() => setSaveDetails((current) => !current)} style={({ pressed }) => ({ marginTop: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 12, opacity: pressed ? 0.7 : 1 })}>
            <View style={{ width: 20, height: 20, marginTop: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: saveDetails ? '#29242B' : '#AAA4AC', backgroundColor: saveDetails ? '#29242B' : '#FFFFFF' }}>
              {saveDetails ? <Text style={{ fontSize: 14, lineHeight: 17, fontWeight: '700', color: '#FFFFFF' }}>✓</Text> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, lineHeight: 22, color: '#4E4850' }}>Save the card details (except CVV) securely.</Text>
              <Pressable onPress={() => Alert.alert('Card security', 'Your CVV is never stored.')}><Text style={{ paddingTop: 3, fontSize: 15, lineHeight: 21, fontWeight: '700', color: '#6E45E2' }}>Know more</Text></Pressable>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValid }}
            disabled={!isValid}
            onPress={submit}
            style={({ pressed }) => ({ height: 48, marginTop: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: isValid ? '#6E45E2' : '#D9D5DD', opacity: pressed ? 0.72 : 1 })}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Save & proceed</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function PaymentMethodsScreen({ onBack }: PaymentMethodsScreenProps) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ paddingTop: Math.max(insets.top, 16) + 6, paddingHorizontal: 20, paddingBottom: 10 }}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={onBack} style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.65 : 1 })}>
            <BackIcon color="#241A30" />
          </Pressable>
          <Text style={{ marginLeft: 13, fontSize: 16, lineHeight: 22, fontWeight: '700', color: '#1F1A22' }}>Manage payment methods</Text>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: '#F0EDF1' }} />

      <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) + 28 }}>
        <Text style={{ paddingHorizontal: 20, paddingTop: 18, fontSize: 13, lineHeight: 20, color: '#777078' }}>We will debit ₹1 to verify a new payment method. This will be refunded after verification.</Text>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Text style={{ fontSize: 19, lineHeight: 25, fontWeight: '600', color: '#1D1820' }}>Cards</Text>
          <Pressable onPress={() => setModalVisible(true)} style={({ pressed }) => ({ minHeight: 58, flexDirection: 'row', alignItems: 'center', opacity: pressed ? 0.6 : 1 })}>
            <View style={{ width: 40 }}><CardIcon /></View>
            <Text style={{ flex: 1, fontSize: 15, lineHeight: 22, color: '#332D35' }}>Add a card</Text>
            <ChevronRight />
          </Pressable>
        </View>
      </ScrollView>

      <AddCardModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}
