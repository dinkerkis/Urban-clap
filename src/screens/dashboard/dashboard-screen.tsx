import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { BottomTabBar, type DashboardTab } from '../../components/bottom-tab-bar';
import type { ServiceCategory, ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { BookingsScreen } from '../bookings';
import { CartScreen } from '../cart';
import { CategoriesScreen } from '../categories';
import { CategoryDetailScreen } from '../category-detail';
import { HomeScreen } from '../home';
import { ServiceListScreen } from '../service-list';

type DashboardPage =
  | { type: 'root' }
  | { type: 'category'; category: ServiceCategory }
  | { type: 'services'; category: ServiceCategory; subcategory: ServiceSubcategory };

type DashboardScreenProps = {
  onLogout: () => void;
};

export function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('home');
  const [page, setPage] = useState<DashboardPage>({ type: 'root' });
  const [cart, setCart] = useState<Record<string, number>>({});

  const cartCount = useMemo(() => Object.values(cart).reduce((total, quantity) => total + quantity, 0), [cart]);

  const addToCart = (item: ServiceItem) => {
    setCart((current) => ({ ...current, [item.id]: (current[item.id] ?? 0) + 1 }));
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

  if (page.type === 'services') {
    content = (
      <ServiceListScreen
        cart={cart}
        subcategory={page.subcategory}
        onAdd={addToCart}
        onRemove={removeFromCart}
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
    content = <CategoriesScreen onCategoryPress={openCategory} />;
  } else if (activeTab === 'bookings') {
    content = <BookingsScreen onExplore={() => changeTab('home')} />;
  } else if (activeTab === 'cart') {
    content = <CartScreen cart={cart} onAdd={addToCart} onRemove={removeFromCart} onExplore={() => changeTab('categories')} />;
  } else {
    content = <HomeScreen cart={cart} onAdd={addToCart} onCategoryPress={openCategory} onLogout={onLogout} onRemove={removeFromCart} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      {content}
      <BottomTabBar activeTab={activeTab} cartCount={cartCount} onChange={changeTab} />
    </View>
  );
}
