import { colors, typography } from '../theme';
import { Modal, Pressable, View } from 'react-native';
import { Text } from './app-text';

import { CloseButton } from './close-icon';
import { countries, type Country } from '../config/countries';

type Props = {
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountry: Country;
  visible: boolean;
};

export function CountryPickerModal({ onClose, onSelect, selectedCountry, visible }: Props) {
  return (
    <Modal
      animationType="slide"
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
          style={{ position: 'absolute', inset: 0, backgroundColor: colors.blueTone5Alpha66 }}
        />

        <CloseButton
          accessibilityLabel="Close country selection"
          color={colors.text}
          floating
          onPress={onClose}
        />

        <View
          style={{
            paddingTop: 28,
            paddingHorizontal: 24,
            paddingBottom: process.env.EXPO_OS === 'ios' ? 34 : 20,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderCurve: 'continuous',
            backgroundColor: colors.surface,
            boxShadow: `0 -12px 36px ${colors.blackAlpha12}`,
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
                    borderColor: selected ? colors.primary : colors.slateTone48,
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
