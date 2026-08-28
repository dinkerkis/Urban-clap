import { colors, fontSizes } from '../../theme';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { cancelAnimation, Easing, Extrapolation, interpolate, SlideInRight, SlideOutRight, type SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingDots } from '../../components/loading-dots';
import { BackIcon } from '../../components/back-icon';
import { useNativeCategoryProducts } from '../../hooks/use-native-category-products';
import { useNativeDescription } from '../../hooks/use-native-description';
import { useNativeProducts } from '../../hooks/use-native-products';
import { resolveNativeMediaUrl, type NativeCategoryDetailSection, type NativeDescriptionMedia, type NativeProduct, type NativeProductCategory } from '../../services/native-products-api';
import { NativeProductDetailModal } from './native-product-detail-modal';
import type { NativeCartSelection } from './native-product-detail-modal';

type NativeScreenProps = {
  cart: Record<string, number>;
  onAddToCart: (selections: NativeCartSelection[]) => Promise<boolean>;
  onCategoryVisibilityChange?: (visible: boolean) => void;
  onViewCart: () => void;
};

type Product = { id: string; imageUrl?: string; kind: 'lock' | 'purifier'; name: string; optionsCount?: number; price: string; rating: string };

function compactCount(count = 0): string {
  if (count >= 1_000_000) return `${Math.round(count / 100_000) / 10}M`;
  if (count >= 1_000) return `${Math.round(count / 100) / 10}K`;
  return String(count);
}

function mapNativeProduct(product: NativeProduct): Product {
  const average = product.rating?.average ?? 0;
  return {
    id: product._id,
    imageUrl: product.main_image ? resolveNativeMediaUrl(product.main_image) : undefined,
    kind: product.product_name.toLowerCase().includes('lock') ? 'lock' : 'purifier',
    name: product.product_name,
    optionsCount: product.options_count,
    price: `₹${product.base_price.toLocaleString('en-IN')}`,
    rating: `${average} (${compactCount(product.rating?.count)})`,
  };
}

function ProductArt({ compact, kind }: { compact?: boolean; kind: Product['kind'] }) {
  if (kind === 'lock') {
    return (
      <View style={{ width: compact ? 52 : 112, height: compact ? 72 : 122, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: compact ? 14 : 25, height: compact ? 62 : 108, borderRadius: 4, backgroundColor: colors.slateTone10, boxShadow: `0 7px 14px ${colors.slateTone9Alpha16}` }}>
          <View style={{ width: compact ? 7 : 12, height: compact ? 7 : 12, marginTop: compact ? 12 : 20, alignSelf: 'center', borderRadius: 7, backgroundColor: colors.cyanTone60 }} />
          <View style={{ position: 'absolute', right: compact ? -22 : -36, top: compact ? 31 : 53, width: compact ? 26 : 42, height: compact ? 5 : 7, borderRadius: 4, backgroundColor: colors.slateTone22 }} />
        </View>
      </View>
    );
  }
  return (
    <View style={{ width: compact ? 52 : 112, height: compact ? 72 : 122, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ width: compact ? 42 : 88, height: compact ? 64 : 102, borderRadius: compact ? 5 : 9, backgroundColor: colors.slateTone13, boxShadow: `0 7px 14px ${colors.slateTone9Alpha17}` }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: compact ? 24 : 39, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: compact ? 5 : 9, borderTopRightRadius: compact ? 5 : 9, backgroundColor: colors.slateTone24 }}>
          <View style={{ width: compact ? 12 : 20, height: compact ? 12 : 20, borderRadius: 10, borderWidth: 2, borderColor: colors.neutralTone66 }} />
        </View>
        <View style={{ position: 'absolute', left: '50%', bottom: compact ? 12 : 17, width: compact ? 4 : 6, height: compact ? 9 : 14, marginLeft: compact ? -2 : -3, borderRadius: 2, backgroundColor: colors.neutralTone84 }} />
      </View>
    </View>
  );
}

function CategoryCard({ imageUrl, kind, onPress, title }: { imageUrl?: string; kind: Product['kind']; onPress: () => void; title: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ width: 118, height: 120, alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, paddingBottom: 9, borderRadius: 6, backgroundColor: colors.slateTone96_2, opacity: pressed ? 0.62 : 1 })}>
      <View style={{ width: 100, height: 78, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imageUrl ? <Image source={{ uri: imageUrl }} contentFit="contain" transition={180} style={{ width: 120, height: 120 }} /> : <ProductArt compact kind={kind} />}
      </View>
      <Text numberOfLines={1} style={{ transform: [{ translateY: -4 }], fontSize: fontSizes.size14, lineHeight: 18, fontWeight: '600', color: colors.mauveTone17_3 }}>{title}</Text>
    </Pressable>
  );
}

function CategoryVideo({ onPress, path }: { onPress: () => void; path: string }) {
  const player = useVideoPlayer(resolveNativeMediaUrl(path), (instance) => {
    instance.loop = false;
    instance.muted = true;
  });
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Play video" onPress={onPress} style={({ pressed }) => ({ width: 150, height: 238, overflow: 'hidden', borderRadius: 9, backgroundColor: colors.black, opacity: pressed ? 0.75 : 1 })}>
      <VideoView player={player} nativeControls={false} contentFit="cover" style={{ width: '100%', height: '100%' }} />
      <View pointerEvents="none" style={{ position: 'absolute', left: 10, bottom: 10, width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.white }}>
        <Text style={{ marginLeft: 2, fontSize: 13, color: colors.black }}>▶</Text>
      </View>
    </Pressable>
  );
}

function CategoryMarquee({ items }: { items: string[] }) {
  const { width: screenWidth } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(translateX);
    if (!contentWidth || reducedMotion) {
      translateX.set(0);
      return;
    }
    translateX.set(screenWidth);
    translateX.set(withRepeat(withTiming(-contentWidth, {
      duration: Math.round(((contentWidth + screenWidth) / 45) * 1000),
      easing: Easing.linear,
    }), -1, false));
    return () => cancelAnimation(translateX);
  }, [contentWidth, reducedMotion, screenWidth, translateX]);

  const marqueeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.get() }] }));
  return (
    <View style={{ minHeight: 42, justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.blueTone44 }}>
      <Animated.View
        onLayout={(event) => setContentWidth(event.nativeEvent.layout.width)}
        style={[{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 26 }, marqueeStyle]}
      >
        {items.map((item, index) => <Text key={`${item}-${index}`} numberOfLines={1} style={{ fontSize: fontSizes.size13, fontWeight: '600', color: colors.white }}>⚡ {item}</Text>)}
      </Animated.View>
    </View>
  );
}

function NativeCategorySection({ onOpenRelatedImages, onOpenVideos, section }: { onOpenRelatedImages: (images: string[]) => void; onOpenVideos: (videos: string[], index: number) => void; section: NativeCategoryDetailSection }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [sliderAspectRatio, setSliderAspectRatio] = useState(0.78);
  const sliderImageDetails = section.sliderImageDetails
    ? [...section.sliderImageDetails].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    : undefined;

  if (section.type === 'image' && section.url) {
    return section.relatedImages?.length ? (
      <Pressable accessibilityRole="button" accessibilityLabel="View related details" onPress={() => onOpenRelatedImages(section.relatedImages ?? [])} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
        <DescriptionImage path={section.url} />
      </Pressable>
    ) : <DescriptionImage path={section.url} />;
  }

  const images = sliderImageDetails?.map((item) => item.image) ?? section.slider_images ?? [];
  const videos = section.slider_videos?.map((item) => item.video) ?? [];
  return (
    <View style={{ paddingVertical: 24, gap: 14, backgroundColor: colors.white }}>
      {section.slider_title ? <Text style={{ paddingHorizontal: 16, fontSize: fontSizes.size21, lineHeight: 28, fontWeight: '700', color: colors.mauveTone10 }}>{section.slider_title}</Text> : null}
      {section.slider_description ? <Text style={{ paddingHorizontal: 16, marginTop: -8, fontSize: fontSizes.size13, lineHeight: 19, color: colors.mauveTone39 }}>{section.slider_description}</Text> : null}
      {images.length ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => setActiveSlide(Math.min(images.length - 1, Math.max(0, Math.round(event.nativeEvent.contentOffset.x / 212))))}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {images.map((image, index) => {
              const relatedImages = sliderImageDetails?.[index]?.relatedImages?.filter((path) => path.length > 0) ?? [];
              return (
              <Pressable key={`${section.sort_order}-image-${index}`} disabled={!relatedImages.length} onPress={() => onOpenRelatedImages(relatedImages)} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
              <Image
                source={{ uri: resolveNativeMediaUrl(image) }}
                contentFit="contain"
                transition={180}
                onLoad={index === 0 ? (event) => {
                  const { height, width } = event.source;
                  if (width > 0 && height > 0) setSliderAspectRatio(width / height);
                } : undefined}
                style={{ width: 200, aspectRatio: sliderAspectRatio, overflow: 'hidden', borderRadius: 8, backgroundColor: colors.violetTone96_5 }}
              />
              </Pressable>
              );
            })}
          </ScrollView>
          {images.length > 1 ? (
            <View style={{ width: 54, height: 4, alignSelf: 'center', overflow: 'hidden', borderRadius: 2, backgroundColor: colors.mauveTone88 }}>
              <View style={{ width: 54 / images.length, height: 4, borderRadius: 2, backgroundColor: colors.mauveTone39, transform: [{ translateX: activeSlide * (54 / images.length) }] }} />
            </View>
          ) : null}
        </>
      ) : null}
      {videos.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {videos.map((video, index) => <CategoryVideo key={`${section.sort_order}-video-${index}`} onPress={() => onOpenVideos(videos, index)} path={video} />)}
        </ScrollView>
      ) : null}
    </View>
  );
}

function StoryVideoPlayer({ muted, onEnd, path, progress }: { muted: boolean; onEnd: () => void; path: string; progress: SharedValue<number> }) {
  const player = useVideoPlayer(resolveNativeMediaUrl(path), (instance) => {
    instance.loop = false;
    instance.muted = muted;
    instance.timeUpdateEventInterval = 0.1;
    instance.play();
  });

  useEffect(() => {
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    const timeSubscription = player.addListener('timeUpdate', ({ currentTime }) => {
      const duration = player.duration;
      progress.set(duration > 0 ? Math.min(1, currentTime / duration) : 0);
    });
    const endSubscription = player.addListener('playToEnd', onEnd);
    return () => {
      timeSubscription.remove();
      endSubscription.remove();
    };
  }, [onEnd, player, progress]);

  return <VideoView player={player} nativeControls={false} contentFit="cover" style={{ position: 'absolute', left: -2, right: -2, top: -2, bottom: -2, backgroundColor: colors.black }} />;
}

function StoryProgressSegment({ active, complete, progress }: { active: boolean; complete: boolean; progress: SharedValue<number> }) {
  const activeStyle = useAnimatedStyle(() => ({ width: `${progress.get() * 100}%` }));
  return (
    <View style={{ flex: 1, height: 3, overflow: 'hidden', borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)' }}>
      {complete ? <View style={{ width: '100%', height: '100%', backgroundColor: colors.white }} /> : null}
      {active ? <Animated.View style={[{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.white }, activeStyle]} /> : null}
    </View>
  );
}

function VideoStoriesScreen({ initialIndex, onClose, videos }: { initialIndex: number; onClose: () => void; videos: string[] }) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [muted, setMuted] = useState(false);
  const progress = useSharedValue(0);
  const currentVideo = videos[currentIndex];

  useEffect(() => {
    progress.set(0);
  }, [currentIndex, progress]);

  const goNext = () => setCurrentIndex((index) => Math.min(videos.length - 1, index + 1));

  return (
    <Animated.View entering={SlideInRight.duration(280)} exiting={SlideOutRight.duration(250)} style={{ position: 'absolute', inset: 0, zIndex: 30, backgroundColor: colors.black }}>
      <View style={{ position: 'absolute', inset: 0 }}>
        {currentVideo ? <StoryVideoPlayer key={`${currentIndex}-${currentVideo}`} muted={muted} onEnd={goNext} path={currentVideo} progress={progress} /> : null}
      </View>

      <View style={{ position: 'absolute', left: 14, right: 14, top: Math.max(insets.top, 12) + 54, zIndex: 3, flexDirection: 'row', gap: 5 }}>
        {videos.map((_, index) => <StoryProgressSegment key={`story-progress-${index}`} active={index === currentIndex} complete={index < currentIndex} progress={progress} />)}
      </View>

      <Pressable accessibilityRole="button" accessibilityLabel="Close videos" hitSlop={12} onPress={onClose} style={({ pressed }) => ({ position: 'absolute', left: 18, top: Math.max(insets.top, 12) + 6, zIndex: 4, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ fontSize: 31, lineHeight: 34, fontWeight: '300', color: colors.white }}>×</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={muted ? 'Unmute video' : 'Mute video'} hitSlop={10} onPress={() => setMuted((current) => !current)} style={({ pressed }) => ({ position: 'absolute', right: 18, top: Math.max(insets.top, 12) + 6, zIndex: 4, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ fontSize: 20, color: colors.white }}>{muted ? '🔇' : '🔊'}</Text>
      </Pressable>

      <Pressable accessibilityLabel="Previous video" disabled={currentIndex === 0} onPress={() => setCurrentIndex((index) => Math.max(0, index - 1))} style={{ position: 'absolute', left: 0, top: 120, bottom: 0, zIndex: 2, width: '35%' }} />
      <Pressable accessibilityLabel="Next video" onPress={goNext} style={{ position: 'absolute', right: 0, top: 120, bottom: 0, zIndex: 2, width: '65%' }} />
    </Animated.View>
  );
}

function RelatedImagesScreen({ images, onBack }: { images: string[]; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const scrollOffset = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.set(event.contentOffset.y);
    },
  });
  const dividerStyle = useAnimatedStyle(() => ({ opacity: scrollOffset.get() > 4 ? 1 : 0 }));
  return (
    <Animated.View entering={SlideInRight.duration(280)} exiting={SlideOutRight.duration(250)} style={{ position: 'absolute', inset: 0, zIndex: 20, backgroundColor: colors.white }}>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: Math.max(insets.top, 18) + 54 }}>
        {images.map((image, index) => (
          <View key={`${image}-${index}`} style={{ marginHorizontal: -2, overflow: 'hidden', backgroundColor: colors.black }}>
            <DescriptionImage path={image} />
          </View>
        ))}
      </Animated.ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.max(insets.top, 18) + 54, paddingTop: Math.max(insets.top, 18), paddingHorizontal: 20, justifyContent: 'center', backgroundColor: colors.white }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={onBack} style={({ pressed }) => ({ width: 34, height: 34, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.55 : 1 })}><BackIcon /></Pressable>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: colors.violetTone93_2 }, dividerStyle]} />
      </View>
    </Animated.View>
  );
}

function NativeCategoryScreen({ category, onBack, onOpenProduct }: { category: NativeProductCategory; onBack: () => void; onOpenProduct: (id: string) => void }) {
  const insets = useSafeAreaInsets();
  const { data, errorMessage, isLoading, retry } = useNativeCategoryProducts(category._id);
  const [relatedImages, setRelatedImages] = useState<string[]>();
  const [videoStories, setVideoStories] = useState<{ initialIndex: number; videos: string[] }>();
  const [bannerHeight, setBannerHeight] = useState(0);
  const scrollOffset = useSharedValue(0);
  const headerHeight = Math.max(insets.top, 18) + 54;
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => scrollOffset.set(event.contentOffset.y),
  });
  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.get(), [Math.max(0, bannerHeight - headerHeight - 20), Math.max(1, bannerHeight - headerHeight)], [0, 1], Extrapolation.CLAMP),
  }));
  const bannerIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - interpolate(scrollOffset.get(), [Math.max(0, bannerHeight - headerHeight - 20), Math.max(1, bannerHeight - headerHeight)], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.black }} contentContainerStyle={{ paddingTop: Math.max(insets.top, 18), paddingBottom: 0 }}>
        {data?.bannerImage ? <View onLayout={(event) => setBannerHeight(event.nativeEvent.layout.height)} style={{ marginHorizontal: -2, overflow: 'hidden', backgroundColor: colors.black }}><DescriptionImage path={data.bannerImage} /></View> : null}
        {data?.marqueeContent.length ? <CategoryMarquee items={data.marqueeContent} /> : null}
        {data?.products.length ? <ProductSection onOpen={onOpenProduct} products={data.products.map(mapNativeProduct)} title={category.name} /> : null}
        {data?.products.length ? (
          <View style={{ backgroundColor: colors.white }}>
            <View style={{ paddingHorizontal: 20 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Compare all models"
              onPress={() => Alert.alert('Compare all models', 'Product comparison will be available soon.')}
              style={({ pressed }) => ({ minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 14, borderTopWidth: 1, borderColor: colors.mauveTone92, opacity: pressed ? 0.6 : 1 })}
            >
              <Image source={require('../../../assets/compare.png')} contentFit="contain" tintColor={colors.black} style={{ width: 23, height: 23 }} />
              <Text style={{ flex: 1, fontSize: fontSizes.size16, fontWeight: '600', color: colors.black }}>Compare all models</Text>
              <Text style={{ fontSize: fontSizes.size22, color: colors.black }}>›</Text>
            </Pressable>
            </View>
            <View style={{ height: 8, backgroundColor: colors.violetTone96_4 }} />
          </View>
        ) : null}
        {data?.categoryDetails.map((section, index) => <NativeCategorySection key={`${section.type}-${section.sort_order}-${index}`} onOpenRelatedImages={setRelatedImages} onOpenVideos={(videos, initialIndex) => setVideoStories({ videos, initialIndex })} section={section} />)}
        {!isLoading && errorMessage ? <View style={{ minHeight: 260, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14 }}><Text style={{ textAlign: 'center', color: colors.mauveTone39 }}>{errorMessage}</Text><Pressable onPress={retry} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9, backgroundColor: colors.violetTone58 }}><Text style={{ fontWeight: '700', color: colors.white }}>Retry</Text></Pressable></View> : null}
      </Animated.ScrollView>
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: Math.max(insets.top, 18), backgroundColor: colors.white }} />
      <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: headerHeight, paddingTop: Math.max(insets.top, 18), paddingHorizontal: 20, justifyContent: 'center' }}>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0, backgroundColor: colors.white }, stickyHeaderStyle]} />
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={12} onPress={onBack} style={({ pressed }) => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
          <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0, borderRadius: 20, backgroundColor: colors.white }, bannerIconStyle]} />
          <BackIcon />
        </Pressable>
      </View>
      {isLoading ? <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}><LoadingDots /></View> : null}
      {relatedImages ? <RelatedImagesScreen images={relatedImages} onBack={() => setRelatedImages(undefined)} /> : null}
      {videoStories ? <VideoStoriesScreen initialIndex={videoStories.initialIndex} onClose={() => setVideoStories(undefined)} videos={videoStories.videos} /> : null}
    </View>
  );
}

function ProductCard({ onOpen, product }: { onOpen: (productId: string) => void; product: Product }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${product.name} details`} onPress={() => onOpen(product.id)} style={({ pressed }) => ({ width: 162, gap: 7, opacity: pressed ? 0.72 : 1 })}>
      <View style={{ width: 162, height: 145, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 10, backgroundColor: colors.slateTone96 }}>{product.imageUrl ? <Image source={{ uri: product.imageUrl }} contentFit="contain" transition={180} style={{ width: '100%', height: '100%' }} /> : <ProductArt kind={product.kind} />}</View>
      <Text numberOfLines={1} style={{ fontSize: fontSizes.size14, fontWeight: '500', color: colors.mauveTone17 }}>{product.name}</Text>
      <Text style={{ fontSize: fontSizes.size12, color: colors.mauveTone37 }}>★ {product.rating}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <View>
          <Text style={{ fontSize: fontSizes.size11, lineHeight: 14, color: colors.neutralTone54 }}>Starts at</Text>
          <Text style={{ fontSize: fontSizes.size14, lineHeight: 19, fontWeight: '700', color: colors.neutralTone10 }}>{product.price}</Text>
        </View>
        <View style={{ width: 72, height: 40, alignItems: 'center' }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name}, ${product.optionsCount ?? 2} options`}
            onPress={() => onOpen(product.id)}
            style={({ pressed }) => ({
              width: 72,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? colors.neutralTone98 : colors.white,
              borderWidth: 1,
              borderColor: colors.neutralTone85,
              borderRadius: 6,
            })}
          >
            <Text style={{ fontSize: fontSizes.size14, lineHeight: 18, fontWeight: '700', color: colors.violetTone58 }}>Add</Text>
          </Pressable>
          <Text style={{ marginTop: -7, paddingHorizontal: 4, fontSize: fontSizes.size10, lineHeight: 13, fontWeight: '400', color: colors.neutralTone54, backgroundColor: colors.white }}>{product.optionsCount ?? 2} options</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ProductSection({ onOpen, products, subtitle, title }: { onOpen: (productId: string) => void; products: Product[]; subtitle?: string; title: string }) {
  return (
    <View style={{ paddingVertical: 24, gap: 16, borderTopWidth: 8, borderTopColor: colors.violetTone96_4, backgroundColor: colors.white }}>
      <View style={{ paddingHorizontal: 20, gap: 4 }}><Text style={{ fontSize: fontSizes.size21, lineHeight: 27, fontWeight: '700' }}>{title}</Text>{subtitle ? <Text style={{ fontSize: fontSizes.size13, color: colors.mauveTone40 }}>{subtitle}</Text> : null}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>{products.map((product) => <ProductCard key={`${title}-${product.name}`} onOpen={onOpen} product={product} />)}</ScrollView>
    </View>
  );
}

function DescriptionImage({ path, slider = false }: { path: string; slider?: boolean }) {
  const [aspectRatio, setAspectRatio] = useState(slider ? 0.78 : 1);
  return (
    <Image
      source={{ uri: resolveNativeMediaUrl(path) }}
      contentFit="contain"
      transition={180}
      onLoad={(event) => {
        const { height, width } = event.source;
        if (width > 0 && height > 0) setAspectRatio(width / height);
      }}
      style={{ width: slider ? 200 : '100%', aspectRatio, borderRadius: slider ? 8 : 0, backgroundColor: colors.violetTone96_5 }}
    />
  );
}

function DescriptionSection({ media, showTopSeparator = true }: { media: NativeDescriptionMedia; showTopSeparator?: boolean }) {
  if (media.type === 'image') {
    return <View style={{ borderTopWidth: showTopSeparator ? 8 : 0, borderTopColor: colors.violetTone96_4 }}><DescriptionImage path={media.url} /></View>;
  }

  return (
    <View style={{ paddingVertical: 22, gap: 16, borderTopWidth: 8, borderTopColor: colors.violetTone96_4 }}>
      {media.slider_title ? <Text style={{ paddingHorizontal: 20, fontSize: fontSizes.size21, lineHeight: 28, fontWeight: '700', color: colors.mauveTone10 }}>{media.slider_title}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
        {media.slider_images.map((image, index) => <DescriptionImage key={`${media.sort_order}-${index}-${image}`} path={image} slider />)}
      </ScrollView>
    </View>
  );
}

export function NativeScreen({ cart, onAddToCart, onCategoryVisibilityChange, onViewCart }: NativeScreenProps) {
  const insets = useSafeAreaInsets();
  const { errorMessage, isLoading, media, retry } = useNativeDescription();
  const { data: productsData, errorMessage: productsError, isLoading: productsLoading, retry: retryProducts } = useNativeProducts();
  const [selectedProductId, setSelectedProductId] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<NativeProductCategory>();
  useEffect(() => {
    onCategoryVisibilityChange?.(Boolean(selectedCategory));
    return () => onCategoryVisibilityChange?.(false);
  }, [onCategoryVisibilityChange, selectedCategory]);
  const showPageLoader = productsLoading || isLoading;
  const nativeCartSummary = useMemo(() => {
    const categoryByProductId = new Map<string, string>();
    productsData.categorySections.forEach((section) => {
      section.products.forEach((product) => categoryByProductId.set(product._id, section.title));
    });
    productsData.newlyLaunched?.products.forEach((product) => {
      if (categoryByProductId.has(product._id)) return;
      const isLock = product.product_name.toLowerCase().includes('lock');
      const matchedCategory = productsData.categories.find((category) => category.name.toLowerCase().includes(isLock ? 'lock' : 'purifier'));
      categoryByProductId.set(product._id, matchedCategory?.name ?? (isLock ? 'Smart Locks' : 'Water Purifiers'));
    });
    const categories = new Set<string>();
    let items = 0;
    Object.entries(cart).forEach(([key, quantity]) => {
      if (quantity <= 0) return;
      const productId = key.split('::')[0];
      const category = categoryByProductId.get(productId);
      if (!category) return;
      items += quantity;
      categories.add(category);
    });
    return { categories: categories.size, items };
  }, [cart, productsData.categories, productsData.categorySections, productsData.newlyLaunched]);
  const showCartBar = nativeCartSummary.items > 0;
  if (selectedCategory) {
    return (
      <View style={{ flex: 1 }}>
        <NativeCategoryScreen category={selectedCategory} onBack={() => setSelectedCategory(undefined)} onOpenProduct={setSelectedProductId} />
        <NativeProductDetailModal onAddToCart={onAddToCart} onClose={() => setSelectedProductId(undefined)} productId={selectedProductId} />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: colors.white }} contentContainerStyle={{ paddingTop: Math.max(insets.top, 18) + 18, paddingBottom: showCartBar ? 94 : 0 }}>
      <View style={{ paddingHorizontal: 20, gap: 5 }}><Text style={{ fontSize: fontSizes.size25, lineHeight: 32, fontWeight: '700' }}>Native products</Text><Text style={{ fontSize: fontSizes.size16, lineHeight: 22, fontWeight: '700', color: colors.mauveTone39 }}>Innovative products. Designed in India for India.</Text></View>
      {!productsLoading && productsError ? <View style={{ minHeight: 220, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14 }}><Text style={{ textAlign: 'center', fontSize: fontSizes.size14, lineHeight: 21, color: colors.mauveTone39 }}>{productsError}</Text><Pressable accessibilityRole="button" onPress={retryProducts} style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9, backgroundColor: colors.violetTone58, opacity: pressed ? 0.7 : 1 })}><Text style={{ fontWeight: '700', color: colors.white }}>Retry</Text></Pressable></View> : null}
      {!productsLoading && !productsError ? <>
        <View style={{ paddingHorizontal: 20, paddingVertical: 30, flexDirection: 'row', gap: 18 }}>{productsData.categories.map((category) => <CategoryCard key={category._id} imageUrl={category.category_image ? resolveNativeMediaUrl(category.category_image) : undefined} kind={category.name.toLowerCase().includes('lock') ? 'lock' : 'purifier'} onPress={() => setSelectedCategory(category)} title={category.name} />)}</View>
        {productsData.newlyLaunched ? <ProductSection onOpen={setSelectedProductId} products={productsData.newlyLaunched.products.map(mapNativeProduct)} title={productsData.newlyLaunched.title} /> : null}
        {productsData.categorySections.map((section, index) => <View key={`${section.title}-${index}`}>
          <ProductSection onOpen={setSelectedProductId} products={section.products.map(mapNativeProduct)} subtitle={section.description} title={section.title} />
          {index === 0 ? <Pressable onPress={() => Alert.alert('Compare all models', 'Product comparison will be available soon.')} style={({ pressed }) => ({ minHeight: 66, marginHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.mauveTone92, opacity: pressed ? .6 : 1 })}><Image source={require('../../../assets/compare.png')} contentFit="contain" tintColor={colors.black} style={{ width: 23, height: 23 }} /><Text style={{ flex: 1, fontSize: fontSizes.size16, fontWeight: '600' }}>Compare all models</Text><Text style={{ fontSize: fontSizes.size22 }}>›</Text></Pressable> : null}
        </View>)}
      </> : null}
      {!isLoading && errorMessage ? <View style={{ minHeight: 180, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14, borderTopWidth: 8, borderTopColor: colors.violetTone96_4 }}><Text style={{ textAlign: 'center', fontSize: fontSizes.size14, lineHeight: 21, color: colors.mauveTone39 }}>{errorMessage}</Text><Pressable accessibilityRole="button" onPress={retry} style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 9, backgroundColor: colors.violetTone58, opacity: pressed ? 0.7 : 1 })}><Text style={{ fontWeight: '700', color: colors.white }}>Retry</Text></Pressable></View> : null}
      {!isLoading && !errorMessage ? media.map((item, index) => <DescriptionSection key={`${item.type}-${item.sort_order}`} media={item} showTopSeparator={index !== media.length - 1} />) : null}
    </ScrollView>
    {showPageLoader ? <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.transparent }}><LoadingDots /></View> : null}
    {showCartBar ? (
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 88, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 16, borderTopWidth: 1, borderTopColor: colors.mauveTone91_3, backgroundColor: colors.white, boxShadow: `0 -5px 16px ${colors.violetTone8Alpha7}` }}>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontSize: fontSizes.size16, lineHeight: 21, fontWeight: '700', color: colors.mauveTone9_2 }}>{nativeCartSummary.items} {nativeCartSummary.items === 1 ? 'item' : 'items'} added</Text>
          <Text style={{ fontSize: fontSizes.size13, lineHeight: 18, color: colors.mauveTone39 }}>From {nativeCartSummary.categories} {nativeCartSummary.categories === 1 ? 'category' : 'categories'}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onViewCart} style={({ pressed }) => ({ width: '48%', height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: pressed ? colors.blueTone50 : colors.violetTone58 })}>
          <Text style={{ fontSize: fontSizes.size16, fontWeight: '700', color: colors.white }}>View cart</Text>
        </Pressable>
      </View>
    ) : null}
    <NativeProductDetailModal onAddToCart={onAddToCart} onClose={() => setSelectedProductId(undefined)} productId={selectedProductId} />
    </View>
  );
}
