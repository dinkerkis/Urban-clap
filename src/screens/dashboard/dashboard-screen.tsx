import { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, { Easing, FadeIn, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';

import { BottomTabBar, type DashboardTab } from '../../components/bottom-tab-bar';
import { CategorySubcategoriesSheet, isFullPageCategory } from '../../components/category-subcategories-sheet';
import { LoadingDots } from '../../components/loading-dots';
import type { ServiceCategory, ServiceItem, ServiceSubcategory } from '../../data/service-catalog';
import { useCart } from '../../hooks/use-cart';
import { useServiceCategories } from '../../hooks/use-service-categories';
import { BookingsScreen } from '../bookings';
import { AboutScreen } from '../about';
import { CartScreen } from '../cart';
import { CategoriesScreen } from '../categories';
import { CategoryDetailScreen } from '../category-detail';
import { HomeScreen } from '../home';
import { LocationPickerScreen } from '../location-picker';
import { ManageAddressesScreen } from '../manage-addresses';
import { NativeScreen } from '../native';
import { PaymentMethodsScreen } from '../payment-methods';
import { ProfileDetailsScreen, ProfileEntryScreen, type CompletedProfile } from '../profile';
import { ProductDetailScreen } from '../product-detail';
import { MyPlansScreen, MyRatingScreen, PassesMembershipScreen } from '../profile-options';
import { RewardsScreen } from '../rewards';
import { ServiceListScreen } from '../service-list';
import { PrivacyCenterScreen, SettingsScreen } from '../settings';
import { WalletScreen } from '../wallet';

const STACK_SLIDE_IN = SlideInRight.duration(280).easing(Easing.out(Easing.cubic));
const STACK_SLIDE_OUT = SlideOutRight.duration(260).easing(Easing.out(Easing.cubic));

type CategoryStackParams = {
  DashboardRoot: undefined;
  CategoryDetail: { category: ServiceCategory };
  ServiceList: { category: ServiceCategory; subcategory: ServiceSubcategory };
  ProductDetail: { category: ServiceCategory; subcategory: ServiceSubcategory; item: ServiceItem };
  CheckoutCart: { category: ServiceCategory; consultationMode?: boolean; subcategory: ServiceSubcategory };
};

const CategoryStack = createNativeStackNavigator<CategoryStackParams>();
const categoryNavigationRef = createNavigationContainerRef<CategoryStackParams>();

type DashboardPage =
  | { type: 'root' }
  | { type: 'location' }
  | { type: 'manage-addresses' }
  | { type: 'profile' }
  | { type: 'profile-details' }
  | { type: 'about' }
  | { type: 'my-plans' }
  | { type: 'my-rating' }
  | { type: 'passes-membership' }
  | { type: 'payment-methods' }
  | { type: 'settings' }
  | { type: 'privacy-center' }
  | { type: 'wallet' }
  | { type: 'category'; category: ServiceCategory }
  | { type: 'services'; category: ServiceCategory; subcategory: ServiceSubcategory }
  | { type: 'product'; category: ServiceCategory; subcategory: ServiceSubcategory; item: ServiceItem }
  | { type: 'cart-product'; item: ServiceItem }
  | { type: 'checkout-cart'; category?: ServiceCategory; consultationMode?: boolean; subcategory?: ServiceSubcategory; categoryTitle?: string };

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
  const [isConsultationLoading, setIsConsultationLoading] = useState(false);
  const productNavigationPendingRef = useRef(false);
  const cartState = useCart(authToken);
  const { categories, errorMessage: categoriesError, isLoading: categoriesLoading, retry: retryCategories } = useServiceCategories();
  const isCartScreenVisible = page.type === 'root' && activeTab === 'cart';

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
      if (categoryNavigationRef.isReady()) {
        categoryNavigationRef.navigate('CategoryDetail', { category });
      }
      return;
    }

    setSheetCategory(category);
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
  } else if (page.type === 'profile' || page.type === 'profile-details' || page.type === 'about' || page.type === 'wallet' || page.type === 'my-plans' || page.type === 'passes-membership' || page.type === 'payment-methods' || page.type === 'manage-addresses' || page.type === 'my-rating' || page.type === 'settings' || page.type === 'privacy-center') {
    content = (
      <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <ProfileEntryScreen
          email={email}
          name={name}
          phone={phone}
          profilePicture={profilePicture}
          onAbout={() => setPage({ type: 'about' })}
          onBack={() => setPage({ type: 'root' })}
          onCompleteProfile={() => setPage({ type: 'profile-details' })}
          onLogout={onLogout}
          onManageAddresses={() => setPage({ type: 'manage-addresses' })}
          onManagePaymentMethods={() => setPage({ type: 'payment-methods' })}
          onMyPlans={() => setPage({ type: 'my-plans' })}
          onMyRating={() => setPage({ type: 'my-rating' })}
          onPassesMembership={() => setPage({ type: 'passes-membership' })}
          onSettings={() => setPage({ type: 'settings' })}
          onWallet={() => setPage({ type: 'wallet' })}
        />
      </Animated.View>
    );
  } else if (page.type === 'checkout-cart') {
    content = (
      <CartScreen
        authToken={authToken}
        cart={cartState.quantities}
        categoryTitle={page.categoryTitle}
        consultationMode={page.consultationMode}
        errorMessage={cartState.errorMessage}
        isLoading={cartState.isLoading}
        items={cartState.items}
        name={name}
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
        onExplore={() => changeTab('home')}
        onRetry={() => void cartState.refresh().catch(() => undefined)}
        phone={phone}
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
        onLoadingChange={setIsConsultationLoading}
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
              consultationMode: true,
              subcategory: page.subcategory,
              categoryTitle: page.category.title,
            });
          }
        }}
        onRemove={removeFromCart}
        onViewCart={() => setPage({
          type: 'checkout-cart',
          category: page.category,
          consultationMode: true,
          subcategory: page.subcategory,
          categoryTitle: page.category.title,
        })}
        onBack={() => setPage({ type: 'services', category: page.category, subcategory: page.subcategory })}
        onLoadingChange={setIsConsultationLoading}
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
        authToken={authToken}
        cart={cartState.quantities}
        errorMessage={cartState.errorMessage}
        isLoading={cartState.isLoading}
        items={cartState.items}
        name={name}
        totalItems={cartState.totalItems}
        totalPrice={cartState.totalPrice}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onProductPress={(item) => setPage({ type: 'cart-product', item })}
        onExplore={() => changeTab('home')}
        onRetry={() => void cartState.refresh().catch(() => undefined)}
        phone={phone}
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

  const dashboardRoot = (
    <View style={{ flex: 1, backgroundColor: '#FAF9FB' }}>
      {content}
      {page.type === 'root' ? <BottomTabBar activeTab={activeTab} cartCount={cartState.totalItems} onChange={changeTab} /> : null}
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
      {page.type === 'wallet' ? (
        <Animated.View
          entering={STACK_SLIDE_IN}
          exiting={STACK_SLIDE_OUT}
          style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}
        >
          <WalletScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'about' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <AboutScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'payment-methods' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <PaymentMethodsScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'manage-addresses' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <ManageAddressesScreen authToken={authToken} name={name} phone={phone} onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'my-plans' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <MyPlansScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'passes-membership' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <PassesMembershipScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'my-rating' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <MyRatingScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'settings' || page.type === 'privacy-center' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <SettingsScreen email={email} onBack={() => setPage({ type: 'profile' })} onDeleteAccount={() => setPage({ type: 'privacy-center' })} />
        </Animated.View>
      ) : null}
      {page.type === 'privacy-center' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: '#FFFFFF' }}>
          <PrivacyCenterScreen onBack={() => setPage({ type: 'settings' })} />
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

  return (
    <View style={{ flex: 1 }}>
    <NavigationContainer ref={categoryNavigationRef}>
      <CategoryStack.Navigator screenOptions={{ animation: 'slide_from_right', headerShown: false }}>
        <CategoryStack.Screen name="DashboardRoot">{() => dashboardRoot}</CategoryStack.Screen>
        <CategoryStack.Screen name="CategoryDetail">
          {({ navigation, route }) => (
            <CategoryDetailScreen
              category={route.params.category}
              onBack={navigation.goBack}
              onSubcategoryPress={(subcategory) =>
                navigation.push('ServiceList', { category: route.params.category, subcategory })
              }
            />
          )}
        </CategoryStack.Screen>
        <CategoryStack.Screen name="ServiceList">
          {({ navigation, route }) => (
            <ServiceListScreen
              cart={cartState.quantities}
              categoryTitle={route.params.category.title}
              subcategory={route.params.subcategory}
              onAdd={addToCart}
              onRemove={removeFromCart}
              onProductPress={(item) => {
                if (productNavigationPendingRef.current) return;
                productNavigationPendingRef.current = true;
                navigation.push('ProductDetail', { ...route.params, item });
              }}
              onBack={navigation.goBack}
            />
          )}
        </CategoryStack.Screen>
        <CategoryStack.Screen
          name="ProductDetail"
          options={{
            animation: 'none',
            gestureEnabled: false,
            presentation: 'card',
          }}
          listeners={{
            beforeRemove: () => {
              productNavigationPendingRef.current = false;
            },
            transitionEnd: () => {
              productNavigationPendingRef.current = false;
            },
          }}
        >
          {({ navigation, route }) => (
            <ProductDetailScreen
              cart={cartState.quantities}
              cartItemsById={cartState.itemsById}
              categoryTitle={route.params.category.title}
              item={route.params.item}
              subcategoryTitle={route.params.subcategory.title}
              onAdd={async (item) => {
                if (!(await tryAddToCart(item))) return;
                navigation.push('CheckoutCart', {
                  category: route.params.category,
                  consultationMode: true,
                  subcategory: route.params.subcategory,
                });
              }}
              onRemove={removeFromCart}
              onViewCart={() => {
                navigation.push('CheckoutCart', {
                  category: route.params.category,
                  consultationMode: true,
                  subcategory: route.params.subcategory,
                });
              }}
              onBack={navigation.goBack}
              onLoadingChange={setIsConsultationLoading}
              totalCartItems={cartState.totalItems}
            />
          )}
        </CategoryStack.Screen>
        <CategoryStack.Screen name="CheckoutCart">
          {({ navigation, route }) => (
            <CartScreen
              authToken={authToken}
              cart={cartState.quantities}
              categoryTitle={route.params.category.title}
              consultationMode={route.params.consultationMode}
              errorMessage={cartState.errorMessage}
              isLoading={cartState.isLoading}
              items={cartState.items}
              name={name}
              totalItems={cartState.totalItems}
              totalPrice={cartState.totalPrice}
              onAdd={addToCart}
              onBack={() => {
                if (route.params.consultationMode) {
                  navigation.popTo('ServiceList', {
                    category: route.params.category,
                    subcategory: route.params.subcategory,
                  });
                  return;
                }
                navigation.goBack();
              }}
              onRemove={removeFromCart}
              onProductPress={(item) =>
                navigation.push('ProductDetail', {
                  category: route.params.category,
                  subcategory: route.params.subcategory,
                  item,
                })
              }
              onExplore={() => {
                navigation.popToTop();
                changeTab('home');
              }}
              onRetry={() => void cartState.refresh().catch(() => undefined)}
              phone={phone}
            />
          )}
        </CategoryStack.Screen>
      </CategoryStack.Navigator>
    </NavigationContainer>
    {isConsultationLoading ? (
      <Animated.View
        entering={FadeIn.duration(140)}
        exiting={FadeOut.duration(120)}
        accessibilityLabel="Adding consultation to cart"
        accessibilityRole="progressbar"
        style={{ position: 'absolute', inset: 0, zIndex: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.72)' }}
      >
        <LoadingDots />
      </Animated.View>
    ) : null}
    </View>
  );
}
