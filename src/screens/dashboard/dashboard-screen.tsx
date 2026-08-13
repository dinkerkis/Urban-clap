import { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import { BottomTabBar, type DashboardTab } from '../../components/bottom-tab-bar';
import type { ServiceCategory, ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useCart } from '../../hooks/use-cart';
import { useServiceCategories } from '../../hooks/use-service-categories';
import { BookingsScreen } from '../bookings';
import { CartScreen } from '../cart';
import { CategoriesScreen } from '../categories';
import { CategoryDetailScreen } from '../category-detail';
import { HomeScreen } from '../home';
import { LocationPickerScreen } from '../location-picker';
import { ProductDetailScreen } from '../product-detail';
import { ServiceListScreen } from '../service-list';

type DashboardPage =
  | { type: 'root' }
  | { type: 'location' }
  | { type: 'category'; category: ServiceCategory }
  | { type: 'services'; category: ServiceCategory; subcategory: ServiceSubcategory }
  | { type: 'product'; category: ServiceCategory; subcategory: ServiceSubcategory; item: ServiceItem }
  | { type: 'cart-product'; item: ServiceItem }
  | { type: 'checkout-cart'; category?: ServiceCategory; subcategory?: ServiceSubcategory; categoryTitle?: string };

type DashboardScreenProps = {
  authToken?: string;
  onLogout: () => void;
};

export function DashboardScreen({ authToken, onLogout }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [page, setPage] = useState<DashboardPage>({ type: 'root' });
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
    setPage({ type: 'root' });
  };

  const openCategory = (category: ServiceCategory) => {
    setPage({ type: 'category', category });
  };

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
  } else if (page.type === 'product') {
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
  } else if (page.type === 'services') {
    content = (
      <ServiceListScreen
        cart={cartState.quantities}
        categoryTitle={page.category.title}
        subcategory={page.subcategory}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onProductPress={(item) => setPage({ type: 'product', category: page.category, subcategory: page.subcategory, item })}
        onBack={() => setPage({ type: 'category', category: page.category })}
      />
    );
  } else if (page.type === 'category') {
    content = (
      <CategoryDetailScreen
        category={page.category}
        onBack={() => setPage({ type: 'root' })}
        onSubcategoryPress={(subcategory) => setPage({ type: 'services', category: page.category, subcategory })}
      />
    );
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
        authToken={authToken}
        categories={categories}
        errorMessage={categoriesError}
        isLoading={categoriesLoading}
        locationSubtitle={selectedLocation?.subtitle}
        locationTitle={selectedLocation?.title}
        onCategoryPress={openCategory}
        onLocationPress={() => setPage({ type: 'location' })}
        onSeeAllCategories={() => changeTab('categories')}
        onLogout={onLogout}
        onRetry={retryCategories}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      {content}
      {page.type === 'root' ? <BottomTabBar activeTab={activeTab} cartCount={cartState.totalItems} onChange={changeTab} /> : null}
    </View>
  );
}
