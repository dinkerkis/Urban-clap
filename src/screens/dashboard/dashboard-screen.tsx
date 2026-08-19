import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import Animated, { Easing, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';

import { BottomTabBar, type DashboardTab } from '../../components/bottom-tab-bar';
import { CategorySubcategoriesSheet, isFullPageCategory } from '../../components/category-subcategories-sheet';
import type { ServiceCategory, ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useCart } from '../../hooks/use-cart';
import { useServiceCategories } from '../../hooks/use-service-categories';
import { BookingsScreen } from '../bookings';
import { CartScreen } from '../cart';
import { CategoriesScreen } from '../categories';
import { CategoryDetailScreen } from '../category-detail';
import { HomeScreen } from '../home';
import { LocationPickerScreen } from '../location-picker';
import { NativeScreen } from '../native';
import { ProfileDetailsScreen, ProfileEntryScreen, type CompletedProfile } from '../profile';
import { ProductDetailScreen } from '../product-detail';
import { RewardsScreen } from '../rewards';
import { ServiceListScreen } from '../service-list';

const STACK_SLIDE_IN = SlideInRight.duration(280).easing(Easing.out(Easing.cubic));
const STACK_SLIDE_OUT = SlideOutRight.duration(260).easing(Easing.out(Easing.cubic));

type DashboardPage =
  | { type: 'root' }
  | { type: 'location' }
  | { type: 'profile' }
  | { type: 'profile-details' }
  | { type: 'category'; category: ServiceCategory }
  | { type: 'services'; category: ServiceCategory; subcategory: ServiceSubcategory }
  | { type: 'product'; category: ServiceCategory; subcategory: ServiceSubcategory; item: ServiceItem }
  | { type: 'cart-product'; item: ServiceItem }
  | { type: 'checkout-cart'; category?: ServiceCategory; subcategory?: ServiceSubcategory; categoryTitle?: string };

type DashboardScreenProps = {
  authToken?: string;
  email?: string;
  name?: string;
  phone?: string;
  profilePicture?: string;
  onLogout: () => void;
  onProfileUpdated: (profile: CompletedProfile) => void;
};

export function DashboardScreen({ authToken, email, name, phone, profilePicture, onLogout, onProfileUpdated }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [page, setPage] = useState<DashboardPage>({ type: 'root' });
  const [sheetCategory, setSheetCategory] = useState<ServiceCategory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ subtitle: string; title: string } | null>(null);
  const cartState = useCart(authToken);
  const { categories, errorMessage: categoriesError, isLoading: categoriesLoading, retry: retryCategories } = useServiceCategories();
  const isCartScreenVisible = page.type === 'checkout-cart' || (page.type === 'root' && activeTab === 'cart');

  useEffect(() => {
    if (!isCartScreenVisible || !authToken) return;
    void cartState.refresh().catch(() => undefined);
  }, [authToken, cartState.refresh, isCartScreenVisible]);

  const tryAddToCart = async (item: ServiceItem) => {
    try {
      await cartState.add(item);
      return true;
    } catch (error) {
      Alert.alert('Could not add to cart', error instanceof Error ? error.message : 'Please try again.');
      return false;
    }
  };

  const addToCart = async (item: ServiceItem) => {
    await tryAddToCart(item);
  };

  const removeFromCart = async (item: ServiceItem) => {
    try {
      await cartState.decrement(item);
    } catch (error) {
      Alert.alert('Could not update cart', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const changeTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    setSheetCategory(null);
    setPage({ type: 'root' });
  };

  const openCategory = (category: ServiceCategory) => {
    if (isFullPageCategory(category)) {
      setSheetCategory(null);
      setPage({ type: 'category', category });
      return;
    }

    setSheetCategory(category);
  };

  const isPaintingStack =
    page.type === 'category' ||
    ((page.type === 'services' || page.type === 'product') && isFullPageCategory(page.category));
  const paintingCategory = isPaintingStack && (page.type === 'category' || page.type === 'services' || page.type === 'product') ? page.category : null;
  const paintingSubcategory = isPaintingStack && (page.type === 'services' || page.type === 'product') ? page.subcategory : null;
  const paintingItem = isPaintingStack && page.type === 'product' ? page.item : null;

  let content;

  if (page.type === 'location') {
    content = (
      <LocationPickerScreen
        authToken={authToken}
        onBack={() => setPage({ type: 'root' })}
        onSelectAddress={(title, subtitle) => {
          setSelectedLocation({ title, subtitle });
          setPage({ type: 'root' });
        }}
        onUseCurrentLocation={() => {
          setSelectedLocation(null);
          setPage({ type: 'root' });
        }}
      />
    );
  } else if (page.type === 'profile' || page.type === 'profile-details') {
    content = (
      <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ProfileEntryScreen
          email={email}
          name={name}
          phone={phone}
          profilePicture={profilePicture}
          onBack={() => setPage({ type: 'root' })}
          onCompleteProfile={() => setPage({ type: 'profile-details' })}
          onLogout={onLogout}
          onManageAddresses={() => setPage({ type: 'location' })}
        />
      </Animated.View>
    );
  } else if (page.type === 'checkout-cart') {
    content = (
      <CartScreen
        cart={cartState.quantities}
        categoryTitle={page.categoryTitle}
        errorMessage={cartState.errorMessage}
        isLoading={cartState.isLoading}
        items={cartState.items}
        totalItems={cartState.totalItems}
        totalPrice={cartState.totalPrice}
        onAdd={addToCart}
        onBack={() => {
          if (page.category && page.subcategory) {
            setPage({ type: 'services', category: page.category, subcategory: page.subcategory });
          } else {
            changeTab('cart');
          }
        }}
        onRemove={removeFromCart}
        onProductPress={(item) => setPage({ type: 'cart-product', item })}
        onExplore={() => changeTab('categories')}
        onRetry={() => void cartState.refresh().catch(() => undefined)}
      />
    );
  } else if (page.type === 'cart-product') {
    content = (
      <ProductDetailScreen
        cart={cartState.quantities}
        cartItemsById={cartState.itemsById}
        categoryTitle="Your cart"
        item={page.item}
        subcategoryTitle={page.item.selectedVariantLabel || 'Selected service'}
        onAdd={async (item) => {
          if (await tryAddToCart(item)) {
            setPage({ type: 'checkout-cart', categoryTitle: 'Selected services' });
          }
        }}
        onRemove={removeFromCart}
        onViewCart={() => setPage({ type: 'checkout-cart', categoryTitle: 'Selected services' })}
        onBack={() => changeTab('cart')}
        totalCartItems={cartState.totalItems}
      />
    );
  } else if (page.type === 'product' && !isFullPageCategory(page.category)) {
    content = (
      <ProductDetailScreen
        cart={cartState.quantities}
        cartItemsById={cartState.itemsById}
        categoryTitle={page.category.title}
        item={page.item}
        subcategoryTitle={page.subcategory.title}
        onAdd={async (item) => {
          if (await tryAddToCart(item)) {
            setPage({
              type: 'checkout-cart',
              category: page.category,
              subcategory: page.subcategory,
              categoryTitle: page.category.title,
            });
          }
        }}
        onRemove={removeFromCart}
        onViewCart={() => setPage({
          type: 'checkout-cart',
          category: page.category,
          subcategory: page.subcategory,
          categoryTitle: page.category.title,
        })}
        onBack={() => setPage({ type: 'services', category: page.category, subcategory: page.subcategory })}
        totalCartItems={cartState.totalItems}
      />
    );
  } else if (page.type === 'services' && !isFullPageCategory(page.category)) {
    content = (
      <ServiceListScreen
        cart={cartState.quantities}
        categoryTitle={page.category.title}
        subcategory={page.subcategory}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onProductPress={(item) => setPage({ type: 'product', category: page.category, subcategory: page.subcategory, item })}
        onBack={() => {
          if (isFullPageCategory(page.category)) {
            setPage({ type: 'category', category: page.category });
            return;
          }
          setPage({ type: 'root' });
        }}
      />
    );
  } else if (isPaintingStack) {
    content =
      activeTab === 'categories' ? (
        <CategoriesScreen
          categories={categories}
          errorMessage={categoriesError}
          isLoading={categoriesLoading}
          onCategoryPress={openCategory}
          onRetry={retryCategories}
        />
      ) : (
        <HomeScreen
          categories={categories}
          errorMessage={categoriesError}
          isLoading={categoriesLoading}
          locationSubtitle={selectedLocation?.subtitle}
          locationTitle={selectedLocation?.title}
          onCategoryPress={openCategory}
          onLocationPress={() => setPage({ type: 'location' })}
          onSeeAllCategories={() => changeTab('categories')}
          onProfilePress={() => setPage({ type: 'profile' })}
          onRetry={retryCategories}
        />
      );
  } else if (activeTab === 'rewards') {
    content = <RewardsScreen />;
  } else if (activeTab === 'native') {
    content = <NativeScreen />;
  } else if (activeTab === 'categories') {
    content = (
      <CategoriesScreen
        categories={categories}
        errorMessage={categoriesError}
        isLoading={categoriesLoading}
        onCategoryPress={openCategory}
        onRetry={retryCategories}
      />
    );
  } else if (activeTab === 'bookings') {
    content = <BookingsScreen onExplore={() => changeTab('home')} />;
  } else if (activeTab === 'cart') {
    content = (
      <CartScreen
        cart={cartState.quantities}
        errorMessage={cartState.errorMessage}
        isLoading={cartState.isLoading}
        items={cartState.items}
        totalItems={cartState.totalItems}
        totalPrice={cartState.totalPrice}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onProductPress={(item) => setPage({ type: 'cart-product', item })}
        onExplore={() => changeTab('categories')}
        onRetry={() => void cartState.refresh().catch(() => undefined)}
        showBottomTab
      />
    );
  } else {
    content = (
      <HomeScreen
        categories={categories}
        errorMessage={categoriesError}
        isLoading={categoriesLoading}
        locationSubtitle={selectedLocation?.subtitle}
        locationTitle={selectedLocation?.title}
        onCategoryPress={openCategory}
        onLocationPress={() => setPage({ type: 'location' })}
        onSeeAllCategories={() => changeTab('categories')}
        onProfilePress={() => setPage({ type: 'profile' })}
        onRetry={retryCategories}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      {content}
      {page.type === 'root' || isPaintingStack ? (
        <BottomTabBar activeTab={activeTab} cartCount={cartState.totalItems} onChange={changeTab} />
      ) : null}
      {page.type === 'profile-details' ? (
        <Animated.View
          entering={STACK_SLIDE_IN}
          exiting={STACK_SLIDE_OUT}
          style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}
        >
          <ProfileDetailsScreen
            email={email}
            name={name}
            phone={phone}
            onBack={() => setPage({ type: 'profile' })}
            onVerified={(profile) => {
              onProfileUpdated(profile);
              setPage({ type: 'profile' });
            }}
          />
        </Animated.View>
      ) : null}
      {paintingCategory ? (
        <Animated.View
          entering={STACK_SLIDE_IN}
          exiting={STACK_SLIDE_OUT}
          style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}
        >
          <CategoryDetailScreen
            category={paintingCategory}
            onBack={() => setPage({ type: 'root' })}
            onSubcategoryPress={(subcategory) => setPage({ type: 'services', category: paintingCategory, subcategory })}
          />
        </Animated.View>
      ) : null}
      {paintingCategory && paintingSubcategory ? (
        <Animated.View
          entering={STACK_SLIDE_IN}
          exiting={STACK_SLIDE_OUT}
          style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}
        >
          <ServiceListScreen
            cart={cartState.quantities}
            categoryTitle={paintingCategory.title}
            subcategory={paintingSubcategory}
            onAdd={addToCart}
            onRemove={removeFromCart}
            onProductPress={(item) => setPage({ type: 'product', category: paintingCategory, subcategory: paintingSubcategory, item })}
            onBack={() => setPage({ type: 'category', category: paintingCategory })}
          />
        </Animated.View>
      ) : null}
      {paintingCategory && paintingSubcategory && paintingItem ? (
        <Animated.View exiting={FadeOut.duration(320)} style={{ position: 'absolute', inset: 0 }}>
          <ProductDetailScreen
            cart={cartState.quantities}
            cartItemsById={cartState.itemsById}
            categoryTitle={paintingCategory.title}
            item={paintingItem}
            subcategoryTitle={paintingSubcategory.title}
            onAdd={async (item) => {
              if (await tryAddToCart(item)) {
                setPage({
                  type: 'checkout-cart',
                  category: paintingCategory,
                  subcategory: paintingSubcategory,
                  categoryTitle: paintingCategory.title,
                });
              }
            }}
            onRemove={removeFromCart}
            onViewCart={() => setPage({
              type: 'checkout-cart',
              category: paintingCategory,
              subcategory: paintingSubcategory,
              categoryTitle: paintingCategory.title,
            })}
            onBack={() => setPage({ type: 'services', category: paintingCategory, subcategory: paintingSubcategory })}
            totalCartItems={cartState.totalItems}
          />
        </Animated.View>
      ) : null}
      <CategorySubcategoriesSheet
        category={sheetCategory}
        onClose={() => setSheetCategory(null)}
        onSubcategoryPress={(subcategory) => {
          if (!sheetCategory) return;
          const category = sheetCategory;
          setSheetCategory(null);
          setPage({ type: 'services', category, subcategory });
        }}
      />
    </View>
  );
}
