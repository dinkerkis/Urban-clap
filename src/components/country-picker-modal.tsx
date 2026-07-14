import { Modal, Pressable, Text, View } from 'react-native';

import { countries, type Country } from '../config/countries';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

type Props = {
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountry: Country;
  visible: boolean;
};

export function CountryPickerModal({ onClose, onSelect, selectedCountry, visible }: Props) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          accessibilityLabel="Close country selection"
          onPress={onClose}
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(9, 12, 18, 0.66)' }}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close country selection"
          hitSlop={10}
          onPress={onClose}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            alignSelf: 'flex-end',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 24,
            marginBottom: 16,
            borderRadius: 22,
            backgroundColor: '#FFFFFF',
            opacity: pressed ? 0.7 : 1,
            boxShadow: '0 8px 26px rgba(0, 0, 0, 0.18)',
          })}
        >
          <Text style={{ fontSize: 21, lineHeight: 24, fontWeight: '300', color: colors.text }}>×</Text>
        </Pressable>

        <View
          style={{
            paddingTop: 28,
            paddingHorizontal: 24,
            paddingBottom: process.env.EXPO_OS === 'ios' ? 34 : 20,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderCurve: 'continuous',
            backgroundColor: colors.surface,
            boxShadow: '0 -12px 36px rgba(0, 0, 0, 0.12)',
          }}
        >
          <Text style={{ ...typography.title, paddingBottom: 14, color: colors.text }}>Select your country</Text>
          {countries.map((country) => {
            const selected = country.id === selectedCountry.id;
            return (
              <Pressable
                key={country.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => onSelect(country)}
                style={({ pressed }) => ({
                  minHeight: 64,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  opacity: pressed ? 0.55 : 1,
                })}
              >
                <Text style={{ fontSize: 21 }}>{country.flag}</Text>
                <Text style={{ flex: 1, ...typography.body, color: colors.text }}>
                  {country.name} ({country.callingCode})
                </Text>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: selected ? colors.primary : '#777980',
                    borderRadius: 11,
                  }}
                >
                  {selected && <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary }} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}
