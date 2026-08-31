import { colors, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../../components/back-icon';
import { LoadingDots } from '../../components/loading-dots';
import type { ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useCategoryProducts } from '../../hooks/use-category-products';

type ServiceSearchScreenProps = {
  categoryTitle: string;
  onBack: () => void;
  onResultPress: (item: ServiceItem) => void;
  subcategory: ServiceSubcategory;
};

type SearchResult = {
  item: ServiceItem;
  sectionTitle: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedTitle({ queryTokens, title }: { queryTokens: string[]; title: string }) {
  if (!queryTokens.length) return <Text>{title}</Text>;
  const expression = new RegExp(`(${queryTokens.map(escapeRegExp).sort((left, right) => right.length - left.length).join('|')})`, 'gi');
  return (
    <Text>
      {title.split(expression).filter(Boolean).map((part, index) => {
        const matched = queryTokens.some((token) => part.toLocaleLowerCase().includes(token));
        return <Text key={`${part}-${index}`} style={{ fontWeight: matched ? '700' : '400', color: colors.mauveTone9_2 }}>{part}</Text>;
      })}
    </Text>
  );
}

function SearchResultRow({ onPress, queryTokens, result }: { onPress: () => void; queryTokens: string[]; result: SearchResult }) {
  const { item } = result;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Open ${item.title}`} onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 16, opacity: pressed ? 0.65 : 1, backgroundColor: colors.white })}>
      <View style={{ width: 92, height: 92, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.mauveTone95_3 }}>
        {item.imageUrl ? <Image source={item.imageUrl} contentFit="cover" transition={160} style={{ position: 'absolute', inset: 0 }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 7 }}>
        <Text selectable style={{ fontSize: fontSizes.size17, lineHeight: 23 }}>
          <HighlightedTitle queryTokens={queryTokens} title={item.title} />
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7 }}>
          {item.rating > 0 ? <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>★ {item.rating} ({item.reviews})</Text> : null}
          {item.rating > 0 && item.price > 0 ? <Text style={{ color: colors.mauveTone38_2 }}>•</Text> : null}
          {item.price > 0 ? <Text style={{ fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone38_2 }}>₹{item.price.toLocaleString('en-IN')}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

export function ServiceSearchScreen({ categoryTitle, onBack, onResultPress, subcategory }: ServiceSearchScreenProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const { errorMessage, isLoading, retry, sections } = useCategoryProducts(subcategory.id);
  const queryTokens = useMemo(() => Array.from(new Set(query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean))), [query]);
  const results = useMemo<SearchResult[]>(() => {
    if (!queryTokens.length) return [];
    return sections.flatMap((section) => section.products.flatMap((item) => {
      const searchableText = `${section.title} ${item.title} ${item.description ?? ''}`.toLocaleLowerCase();
      return queryTokens.some((token) => searchableText.includes(token)) ? [{ item, sectionTitle: section.title }] : [];
    }));
  }, [queryTokens, sections]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 18, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.mauveTone90_3, backgroundColor: colors.white }}>
        <View style={{ height: 54, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.violetTone58, borderRadius: 12, backgroundColor: colors.white }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={onBack} style={({ pressed }) => ({ width: 34, height: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}>
            <BackIcon />
          </Pressable>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            returnKeyType="search"
            value={query}
            onChangeText={setQuery}
            placeholder={`Search in ${categoryTitle}`}
            placeholderTextColor={colors.placeholder}
            style={{ flex: 1, height: '100%', paddingVertical: 0, fontSize: fontSizes.size17, color: colors.mauveTone9_2 }}
          />
          {query.length ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQuery('')} style={({ pressed }) => ({ width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.mauveTone39, opacity: pressed ? 0.65 : 1 })}>
              <Text style={{ marginTop: -1, fontSize: fontSizes.size17, lineHeight: 19, fontWeight: '600', color: colors.white }}>×</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {isLoading ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><LoadingDots /></View> : null}
      {!isLoading && errorMessage ? <View style={{ flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14 }}><Text selectable style={{ textAlign: 'center', color: colors.mauveTone38_2 }}>{errorMessage}</Text><Pressable onPress={retry} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9, backgroundColor: colors.violetTone58 }}><Text style={{ fontWeight: '700', color: colors.white }}>Retry</Text></Pressable></View> : null}
      {!isLoading && !errorMessage ? (
        <FlatList
          style={{ flex: 1 }}
          data={results}
          automaticallyAdjustKeyboardInsets
          automaticallyAdjustsScrollIndicatorInsets
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="handled"
          keyExtractor={({ item }) => item.id}
          contentContainerStyle={{ paddingTop: queryTokens.length ? 8 : 0, paddingBottom: Math.max(insets.bottom, 20) + 24, flexGrow: results.length ? 0 : 1 }}
          renderItem={({ item }) => <SearchResultRow onPress={() => onResultPress(item.item)} queryTokens={queryTokens} result={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 1, marginLeft: 128, backgroundColor: colors.mauveTone92 }} />}
          ListEmptyComponent={queryTokens.length ? <View style={{ flex: 1, minHeight: 260, padding: 24, alignItems: 'center', justifyContent: 'center' }}><Text selectable style={{ textAlign: 'center', fontSize: fontSizes.size14, color: colors.mauveTone39 }}>No matching services found.</Text></View> : null}
        />
      ) : null}
    </View>
  );
}
