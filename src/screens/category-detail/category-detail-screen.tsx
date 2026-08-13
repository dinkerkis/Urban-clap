import { Image } from 'expo-image';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          height: insets.top + 66,
          paddingTop: insets.top,
          backgroundColor: '#FFFFFF',
        }}
      >
        <View style={{ height: 66, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, opacity: pressed ? 0.58 : 1 })}
          >
            <Text style={{ fontSize: 23, lineHeight: 25, fontWeight: '400', color: '#171419' }}>←</Text>
          </Pressable>

          <Text selectable numberOfLines={2} style={{ flex: 1, fontSize: 20, lineHeight: 26, fontWeight: '600', color: '#171419' }}>
            {category.title}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Share ${category.title}`}
            hitSlop={8}
            onPress={shareCategory}
            style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, opacity: pressed ? 0.58 : 1 })}
          >
            <View style={{ width: 19, height: 19 }}>
              <View style={{ position: 'absolute', left: 4.5, top: 6, width: 10, height: 1.7, borderRadius: 2, backgroundColor: '#171419', transform: [{ rotate: '-29deg' }] }} />
              <View style={{ position: 'absolute', left: 4.5, top: 11.5, width: 10, height: 1.7, borderRadius: 2, backgroundColor: '#171419', transform: [{ rotate: '29deg' }] }} />
              <View style={{ position: 'absolute', left: 1, top: 7, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#171419' }} />
              <View style={{ position: 'absolute', right: 1, top: 1.5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#171419' }} />
              <View style={{ position: 'absolute', right: 1, bottom: 1.5, width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#171419' }} />
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(28, insets.bottom + 16) }}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 30, gap: 8 }}>
          <Text selectable style={{ fontSize: 23, lineHeight: 30, fontWeight: '600', color: '#171419' }}>
            {category.title}
          </Text>
          <Text selectable style={{ fontSize: 18, lineHeight: 25, color: '#625D64' }}>
            Select your scope
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: '#E7E5E8' }} />

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
                  backgroundColor: pressed ? '#F8F7F9' : '#FFFFFF',
                })}
              >
                <View style={{ width: 112, height: 132, overflow: 'hidden', borderRadius: 14, borderCurve: 'continuous', backgroundColor: '#F3F2F3' }}>
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
                      <Text style={{ fontSize: 12, color: '#8A8490' }}>No image</Text>
                    </View>
                  )}
                </View>

                <View style={{ flex: 1, gap: 7 }}>
                  <Text selectable numberOfLines={2} style={{ fontSize: 18, lineHeight: 24, fontWeight: '700', color: '#171419' }}>
                    {subcategory.title}
                  </Text>
                  {subcategory.subtitle ? (
                    <Text selectable numberOfLines={3} style={{ fontSize: 15, lineHeight: 22, color: '#625D64' }}>
                      {subcategory.subtitle}
                    </Text>
                  ) : null}
                </View>

                <Text style={{ fontSize: 31, lineHeight: 34, fontWeight: '300', color: '#777379' }}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ minHeight: 190, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <Text selectable style={{ textAlign: 'center', fontSize: 14, lineHeight: 20, color: '#625D64' }}>
              No service scopes available yet.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
