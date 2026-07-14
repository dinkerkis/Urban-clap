import { Image } from 'expo-image';
import { View } from 'react-native';

import { colors } from '../theme/colors';

export function PhoneMessageIcon() {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Phone verification by text message"
      style={{ width: 58, height: 48 }}
    >
      <View
        style={{
          position: 'absolute',
          left: 31,
          top: 3,
          width: 20,
          height: 18,
          borderRadius: 3,
          borderCurve: 'continuous',
          backgroundColor: '#B9C9ED',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 2,
            bottom: -2,
            width: 6,
            height: 6,
            backgroundColor: '#B9C9ED',
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>

      <Image
        source={require('../../assets/phone-call.png')}
        contentFit="contain"
        tintColor={colors.primary as string}
        style={{ position: 'absolute', left: 0, bottom: 1, width: 41, height: 41 }}
      />
    </View>
  );
}
