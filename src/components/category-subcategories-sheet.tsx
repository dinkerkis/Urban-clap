import { Image } from 'expo-image';
import { Modal, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const itemWidth = Math.floor((width - 40 - 24) / 3);

  return (
    <Modal
      animationType="fade"
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
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.46)' }}
        />

        {category ? (
          <Animated.View entering={SlideInDown.duration(320).easing(Easing.out(Easing.cubic))}>
            <Animated.View entering={FadeIn.duration(180)} style={{ alignItems: 'flex-end', paddingRight: 18, marginBottom: 12 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={8}
                onPress={onClose}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 18,
                  backgroundColor: '#F2F2F2',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 22, lineHeight: 24, fontWeight: '400', color: '#1A1A1A', marginTop: -1 }}>×</Text>
              </Pressable>
            </Animated.View>

            <View
              style={{
                paddingTop: 22,
                paddingHorizontal: 20,
                paddingBottom: Math.max(28, insets.bottom + 16),
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderCurve: 'continuous',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Text selectable style={{ marginBottom: 22, fontSize: 22, lineHeight: 28, fontWeight: '700', color: '#111111' }}>
                {category.title}
              </Text>

              {category.subcategories.length > 0 ? (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {category.subcategories.map((subcategory) => (
                    <Pressable
                      key={subcategory.id}
                      accessibilityRole="button"
                      accessibilityLabel={subcategory.title}
                      onPress={() => onSubcategoryPress(subcategory)}
                      style={({ pressed }) => ({ width: itemWidth, alignItems: 'center', gap: 8, opacity: pressed ? 0.62 : 1 })}
                    >
                      <View
                        style={{
                          width: itemWidth,
                          height: 72,
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          borderRadius: 14,
                          borderCurve: 'continuous',
                          backgroundColor: '#F3F3F3',
                        }}
                      >
                        {subcategory.imageUrl ? (
                          <Image
                            source={subcategory.imageUrl}
                            contentFit="contain"
                            transition={180}
                            style={{ position: 'absolute', inset: 10 }}
                          />
                        ) : (
                          <Text style={{ fontSize: 22 }}>{subcategory.icon || '•'}</Text>
                        )}
                      </View>
                      <Text
                        numberOfLines={3}
                        style={{
                          width: itemWidth,
                          minHeight: 36,
                          textAlign: 'center',
                          fontSize: 12,
                          lineHeight: 16,
                          fontWeight: '400',
                          color: '#2B2433',
                        }}
                      >
                        {subcategory.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={{ paddingBottom: 12, fontSize: 14, lineHeight: 20, color: '#625D64' }}>
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
