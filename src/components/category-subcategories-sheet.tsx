import { colors, fontFamilies, fontSizes } from '../theme';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { Text } from './app-text';
import Animated, { Easing, ReduceMotion, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseButton } from './close-icon';
import type { ServiceCategory, ServiceSubcategory } from '../data/service-catalog';

type CategorySubcategoriesSheetProps = {
  category: ServiceCategory | null;
  onClose: () => void;
  onSubcategoryPress: (subcategory: ServiceSubcategory) => void;
};

export function isFullPageCategory(category: ServiceCategory) {
  return /paint/i.test(category.title);
}

export function CategorySubcategoriesSheet({ category, onClose, onSubcategoryPress }: CategorySubcategoriesSheetProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const itemWidth = Math.min(125, Math.max(88, Math.floor((width - 32 - 24) / 3)));
  const grouped = Boolean(category && /AC & Appliance|Electrician.*Plumber/i.test(category.title) && category.subcategories.some((item) => item.children?.length));
  const compactGroupedSheet = Boolean(category && /AC & Appliance/i.test(category.title));
  const compactCategoryBoxes = Boolean(category && /AC & Appliance|Electrician.*Plumber/i.test(category.title));

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={category != null}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          accessibilityLabel="Close category"
          onPress={onClose}
          style={{ position: 'absolute', inset: 0, backgroundColor: colors.blackAlpha72 }}
        />

        {category ? (
          <Animated.View
            entering={SlideInDown.duration(300)
              .easing(Easing.bezier(0.32, 0.72, 0, 1))
              .reduceMotion(ReduceMotion.System)}
            style={{ maxHeight: compactGroupedSheet ? '50%' : '76%' }}
          >
            <CloseButton color={colors.neutralTone10} floating onPress={onClose} />

            <View
              style={{
                flexShrink: 1,
                paddingTop: 22,
                paddingHorizontal: 16,
                paddingBottom: compactGroupedSheet ? Math.max(12, insets.bottom + 4) : Math.max(28, insets.bottom + 16),
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderCurve: 'continuous',
                backgroundColor: colors.white,
              }}
            >
              <Text selectable style={{ marginBottom: 22, fontSize: fontSizes.size22, lineHeight: 28, fontFamily: fontFamilies.bold, color: colors.black }}>
                {category.title}
              </Text>

              {grouped ? (
                <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: compactGroupedSheet ? 0 : 4, gap: compactCategoryBoxes ? 2 : 22 }}>
                  {category.subcategories.map((section) => (
                    <View key={section.id} style={{ gap: 14 }}>
                      <Text selectable style={{ fontSize: fontSizes.size18, lineHeight: 24, fontFamily: fontFamilies.semiBold, color: colors.black }}>
                        {section.title}
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {(section.children ?? []).map((subcategory) => (
                          <Pressable
                            key={subcategory.id}
                            accessibilityRole="button"
                            accessibilityLabel={subcategory.title}
                            onPress={() => onSubcategoryPress(subcategory)}
                            style={({ pressed }) => ({ width: itemWidth, alignItems: 'center', gap: 7, opacity: pressed ? 0.62 : 1 })}
                          >
                            <View style={{ width: itemWidth, height: compactCategoryBoxes ? 62 : 72, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: compactCategoryBoxes ? 9 : 12, borderCurve: 'continuous', backgroundColor: colors.violetTone98_3 }}>
                              {subcategory.imageUrl ? (
                                <Image source={subcategory.imageUrl} contentFit="contain" transition={180} style={{ width: 68, height: compactCategoryBoxes ? 48 : 56 }} />
                              ) : (
                                <Text style={{ fontSize: fontSizes.size22 }}>{subcategory.icon || '•'}</Text>
                              )}
                            </View>
                            <Text numberOfLines={2} style={{ width: itemWidth + 8, minHeight: 34, textAlign: 'center', fontSize: fontSizes.size13, lineHeight: 17, color: colors.black }}>
                              {subcategory.title}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : category.subcategories.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                  {category.subcategories.map((subcategory) => (
                    <Pressable
                      key={subcategory.id}
                      accessibilityRole="button"
                      accessibilityLabel={subcategory.title}
                      onPress={() => onSubcategoryPress(subcategory)}
                      style={({ pressed }) => ({ width: itemWidth, alignItems: 'center', gap: 6, opacity: pressed ? 0.62 : 1 })}
                    >
                      <View
                        style={{
                          width: itemWidth,
                          height: 64,
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          borderRadius: 12,
                          borderCurve: 'continuous',
                          backgroundColor: colors.violetTone98_3,
                        }}
                      >
                        {subcategory.imageUrl ? (
                          <Image
                            source={subcategory.imageUrl}
                            contentFit="contain"
                            transition={180}
                            style={{ position: 'absolute', width: 64, height: 48 }}
                          />
                        ) : (
                          <Text style={{ fontSize: fontSizes.size22 }}>{subcategory.icon || '•'}</Text>
                        )}
                      </View>
                      <Text
                        numberOfLines={2}
                        style={{
                          width: itemWidth + 8,
                          minHeight: 32,
                          textAlign: 'center',
                          fontSize: fontSizes.size12,
                          lineHeight: 16,
                          fontFamily: fontFamilies.regular,
                          color: colors.black,
                        }}
                      >
                        {subcategory.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={{ paddingBottom: 12, fontSize: fontSizes.size14, lineHeight: 20, color: colors.mauveTone38_2 }}>
                  No services available yet.
                </Text>
              )}
            </View>
          </Animated.View>
        ) : null}
      </View>
    </Modal>
  );
}
