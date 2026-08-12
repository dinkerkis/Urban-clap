import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { BottomTabBar, type DashboardTab } from '../../components/bottom-tab-bar';
import type { ServiceCategory, ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useServiceCategories } from '../../hooks/use-service-categories';
import { BookingsScreen } from '../bookings';
import { CartScreen } from '../cart';
import { CategoriesScreen } from '../categories';
import { CategoryDetailScreen } from '../category-detail';
import { HomeScreen } from '../home';
import { ProductDetailScreen } from '../product-detail';
import { ServiceListScreen } from '../service-list';

type DashboardPage =
  | { type: 'root' }
  | { type: 'category'; category: ServiceCategory }
  | { type: 'services'; category: ServiceCategory; subcategory: ServiceSubcategory }
  | { type: 'product'; category: ServiceCategory; subcategory: ServiceSubcategory; item: ServiceItem };

type DashboardScreenProps = {
  onLogout: () => void;
};

export function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [page, setPage] = useState<DashboardPage>({ type: 'root' });
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartItemsById, setCartItemsById] = useState<Record<string, ServiceItem>>({});
  const { categories, errorMessage: categoriesError, isLoading: categoriesLoading, retry: retryCategories } = useServiceCategories();

  const cartCount = useMemo(() => Object.values(cart).reduce((total, quantity) => total + quantity, 0), [cart]);

  const addToCart = (item: ServiceItem) => {
    setCartItemsById((current) => ({ ...current, [item.id]: item }));
    setCart((current) => ({
      ...current,
      [item.id]: Math.min((current[item.id] ?? 0) + 1, item.maxQuantity ?? 99),
    }));
  };

  const removeFromCart = (item: ServiceItem) => {
    setCart((current) => {
      const quantity = current[item.id] ?? 0;
      if (quantity <= 1) {
        const next = { ...current };
        delete next[item.id];
        return next;
      }
      return { ...current, [item.id]: quantity - 1 };
    });
  };

  const changeTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    setPage({ type: 'root' });
  };

  const openCategory = (category: ServiceCategory) => {
    setPage({ type: 'category', category });
  };

  let content;

  if (page.type === 'product') {
    content = (
      <ProductDetailScreen
        cart={cart}
        categoryTitle={page.category.title}
        item={page.item}
        subcategoryTitle={page.subcategory.title}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onBack={() => setPage({ type: 'services', category: page.category, subcategory: page.subcategory })}
      />
    );
  } else if (page.type === 'services') {
    content = (
      <ServiceListScreen
        cart={cart}
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
        cart={cart}
        items={Object.values(cartItemsById)}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onExplore={() => changeTab('categories')}
      />
    );
  } else {
    content = (
      <HomeScreen
        categories={categories}
        errorMessage={categoriesError}
        isLoading={categoriesLoading}
        onCategoryPress={openCategory}
        onSeeAllCategories={() => changeTab('categories')}
        onLogout={onLogout}
        onRetry={retryCategories}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      {content}
      {page.type === 'root' ? <BottomTabBar activeTab={activeTab} cartCount={cartCount} onChange={changeTab} /> : null}
    </View>
  );
}
