import { Image } from 'expo-image';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { Text } from '../../components/app-text';
import type { SpotlightCategoryDetail } from '../../services/home-spotlights-api';
import { colors, fontFamilies, fontSizes } from '../../theme';

export function SpotlightCategorySelectionScreen({ categories, onBack, onCategoryPress }: { categories: SpotlightCategoryDetail[]; onBack: () => void; onCategoryPress: (category: SpotlightCategoryDetail) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ height: insets.top + 64, paddingTop: insets.top, paddingHorizontal: 20, justifyContent: 'center' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={onBack} style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}>
          <BackIcon />
        </Pressable>
      </View>
      <ScrollView contentInsetAdjustmentBehavior="never" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 24, gap: 16 }}>
        {categories.map((category) => (
          <Pressable key={category.id} accessibilityRole="button" accessibilityLabel={category.name} onPress={() => onCategoryPress(category)} style={({ pressed }) => ({ minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 18, opacity: pressed ? 0.62 : 1 })}>
            <View style={{ width: 70, height: 70, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.violetTone98_3 }}>
              {category.imageUrl ? <Image source={category.imageUrl} contentFit="contain" transition={180} style={{ width: 68, height: 68 }} /> : null}
            </View>
            <Text style={{ flex: 1, fontSize: fontSizes.size16, lineHeight: 22, fontFamily: fontFamilies.regular, color: colors.black }}>{category.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
