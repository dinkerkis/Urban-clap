import { colors, fontFamilies, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import type { ServiceCategory, ServiceSubcategory } from '../../data/service-catalog';

type CategoryDetailScreenProps = {
  category: ServiceCategory;
  onBack: () => void;
  onSubcategoryPress: (subcategory: ServiceSubcategory) => void;
};

export function CategoryDetailScreen({ category, onBack, onSubcategoryPress }: CategoryDetailScreenProps) {
  const insets = useSafeAreaInsets();

  const shareCategory = () => {
    void Share.share({ message: `Explore ${category.title} services on Urban Clap.` });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View
        style={{
          height: insets.top + 66,
          paddingTop: insets.top,
          backgroundColor: colors.white,
        }}
      >
        <View style={{ height: 66, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, right: 8, left: 0 }}
            onPress={onBack}
            style={({ pressed }) => ({ height: 40, justifyContent: 'center', opacity: pressed ? 0.58 : 1 })}
          >
            <BackIcon />
          </Pressable>

          <Text selectable numberOfLines={2} style={{ flex: 1, fontSize: fontSizes.size20, lineHeight: 26, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>
            {category.title}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Share ${category.title}`}
            hitSlop={8}
            onPress={shareCategory}
            style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, opacity: pressed ? 0.58 : 1 })}
          >
            <Image
              source={require('../../../assets/share.png')}
              contentFit="contain"
              tintColor={colors.mauveTone9_2}
              style={{ width: 18, height: 18 }}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(28, insets.bottom + 16) }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30, gap: 8 }}>
          <Text selectable style={{ fontSize: fontSizes.size23, lineHeight: 30, fontFamily: fontFamilies.semiBold, color: colors.mauveTone9_2 }}>
            {category.title}
          </Text>
          <Text selectable style={{ fontSize: fontSizes.size18, lineHeight: 25, color: colors.mauveTone38_2 }}>
            Select your scope
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: colors.mauveTone90_3 }} />

        {category.subcategories.length > 0 ? (
          <View>
            {category.subcategories.map((subcategory) => (
              <Pressable
                key={subcategory.id}
                accessibilityRole="button"
                accessibilityLabel={`Open ${subcategory.title}`}
                onPress={() => onSubcategoryPress(subcategory)}
                style={({ pressed }) => ({
                  minHeight: 170,
                  paddingHorizontal: 20,
                  paddingVertical: 26,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 18,
                  backgroundColor: pressed ? colors.violetTone97_5 : colors.white,
                })}
              >
                <View style={{ width: 112, height: 132, overflow: 'hidden', borderRadius: 14, borderCurve: 'continuous', backgroundColor: colors.mauveTone95_3 }}>
                  {subcategory.imageUrl ? (
                    <Image
                      source={subcategory.imageUrl}
                      contentFit="cover"
                      contentPosition="center"
                      transition={180}
                      style={{ position: 'absolute', inset: -10 }}
                    />
                  ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: fontSizes.size12, color: colors.violetTone54_2 }}>No image</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, gap: 7 }}>
                  <Text selectable numberOfLines={2} style={{ fontSize: fontSizes.size18, lineHeight: 24, fontFamily: fontFamilies.bold, color: colors.mauveTone9_2 }}>
                    {subcategory.title}
                  </Text>
                  {subcategory.subtitle ? (
                    <Text selectable numberOfLines={3} style={{ fontSize: fontSizes.size15, lineHeight: 22, color: colors.mauveTone38_2 }}>
                      {subcategory.subtitle}
                    </Text>
                  ) : null}
                </View>

                <Text style={{ fontSize: fontSizes.size31, lineHeight: 34, fontFamily: fontFamilies.light, color: colors.neutralTone46_2 }}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ minHeight: 190, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone38_2 }}>
              No service scopes available yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
