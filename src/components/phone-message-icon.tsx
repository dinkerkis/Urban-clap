import { colors } from '../theme';
import { Image } from 'expo-image';
import { View } from 'react-native';


export function PhoneMessageIcon() {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Phone verification by text message"
      style={{ width: 48, height: 40 }}
    >
      <View
        style={{
          position: 'absolute',
          left: 26,
          top: 2,
          width: 17,
          height: 15,
          borderRadius: 3,
          borderCurve: 'continuous',
          backgroundColor: colors.blueTone83,
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 2,
            bottom: -2,
            width: 5,
            height: 5,
            backgroundColor: colors.blueTone83,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>

      <Image
        source={require('../../assets/phone-call.png')}
        contentFit="contain"
        tintColor={colors.primary as string}
        style={{ position: 'absolute', left: 0, bottom: 1, width: 34, height: 34 }}
      />
    </View>
  );
}
