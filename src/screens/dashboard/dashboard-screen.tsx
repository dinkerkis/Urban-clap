import { colors, fontSizes } from '../../theme';
import { useEffect, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, { Easing, FadeIn, FadeOut, SlideInLeft, SlideInRight, SlideOutRight } from 'react-native-reanimated';

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
import type { NativeCartSelection } from '../native/native-product-detail-modal';
import type { HomeSpotlight } from '../../services/home-spotlights-api';
import { PaymentMethodsScreen } from '../payment-methods';
import { ProfileDetailsScreen, ProfileEntryScreen, type CompletedProfile } from '../profile';
import { ProductDetailScreen } from '../product-detail';
import { AccountArticleScreen, AccountHelpScreen, ChangePhoneHelpScreen, GettingStartedArticleScreen, GettingStartedHelpScreen, HelpSupportScreen, MembershipArticleScreen, MembershipHelpScreen, MyPlansScreen, MyRatingScreen, NativeDevicesScreen, PassesMembershipScreen, PaymentCreditsArticleScreen, PaymentCreditsHelpScreen, ProfileMyBookingsScreen, SafetyArticleScreen, WarrantyArticleScreen, WarrantyHelpScreen, type GettingStartedArticleKey, type MembershipArticleKey, type PaymentCreditsArticleKey, type WarrantyArticleKey } from '../profile-options';
import { RewardsScreen } from '../rewards';
import { ServiceListScreen } from '../service-list';
import { PrivacyCenterScreen, SettingsScreen } from '../settings';
import { WalletScreen } from '../wallet';

const STACK_SLIDE_IN = SlideInRight.duration(280).easing(Easing.out(Easing.cubic));
const STACK_POP_IN = SlideInLeft.duration(260).easing(Easing.out(Easing.cubic));
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
  | { type: 'manage-addresses'; from?: 'help-address-article' }
  | { type: 'profile' }
  | { type: 'profile-details'; from?: 'help-email-article' | 'help-phone-article' }
  | { type: 'about' }
  | { type: 'help-support'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-account'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-getting-started'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-getting-started-article'; article: GettingStartedArticleKey; from?: 'my-bookings' | 'profile' }
  | { type: 'help-payment-credits'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-payment-credits-article'; article: PaymentCreditsArticleKey; from?: 'my-bookings' | 'profile' }
  | { type: 'help-membership'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-membership-article'; article: MembershipArticleKey; from?: 'my-bookings' | 'profile' }
  | { type: 'help-safety-article'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-warranty'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-warranty-article'; article: WarrantyArticleKey; from?: 'my-bookings' | 'profile' }
  | { type: 'help-phone-article'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-address-article'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-email-article'; from?: 'my-bookings' | 'profile' }
  | { type: 'help-payment-article'; from?: 'my-bookings' | 'profile' }
  | { type: 'my-bookings' }
  | { type: 'my-plans' }
  | { type: 'my-rating' }
  | { type: 'native-devices' }
  | { type: 'passes-membership' }
  | { type: 'payment-methods'; from?: 'help-payment-article' | 'help-payment-credits-article'; helpArticle?: PaymentCreditsArticleKey; helpFrom?: 'my-bookings' | 'profile' }
  | { type: 'settings' }
  | { type: 'privacy-center' }
  | { type: 'wallet'; from?: 'help-payment-credits-article'; helpArticle?: PaymentCreditsArticleKey; helpFrom?: 'my-bookings' | 'profile' }
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
  const [profileTransition, setProfileTransition] = useState<'pop' | 'push'>('push');
  const productNavigationPendingRef = useRef(false);
  const cartState = useCart(authToken);
  const { categories, errorMessage: categoriesError, isLoading: categoriesLoading, retry: retryCategories } = useServiceCategories();
  const isCartScreenVisible = page.type === 'root' && activeTab === 'cart';

  useEffect(() => {
    if (!isCartScreenVisible || !authToken) return;
    void cartState.refresh().catch(() => undefined);
  }, [authToken, cartState.refresh, isCartScreenVisible]);

  const tryAddToCart = async (item: ServiceItem, quantity = 1) => {
    try {
      await cartState.add(item, quantity);
      return true;
    } catch (error) {
      Alert.alert('Could not add to cart', error instanceof Error ? error.message : 'Please try again.');
      return false;
    }
  };

  const addToCart = async (item: ServiceItem) => {
    await tryAddToCart(item);
  };

  const addNativeSelectionsToCart = async (selections: NativeCartSelection[]) => {
    for (const selection of selections) {
      if (!(await tryAddToCart(selection.item, selection.quantity))) return false;
    }
    return true;
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

  const openSpotlight = (spotlight: HomeSpotlight) => {
    if (spotlight.redirectType === 'native') {
      changeTab('native');
      return;
    }

    const category = categories.find((item) => item.id === spotlight.redirectId)
      ?? categories.find((item) => item.subcategories.some((subcategory) => subcategory.id === spotlight.redirectId));
    if (!category) {
      changeTab('categories');
      return;
    }

    const subcategory = category.subcategories.find((item) => item.id === spotlight.redirectId);
    if (subcategory && !isFullPageCategory(category)) {
      setPage({ type: 'services', category, subcategory });
      return;
    }
    openCategory(category);
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
  } else if (page.type === 'profile' || page.type === 'profile-details' || page.type === 'about' || page.type === 'wallet' || page.type === 'my-bookings' || page.type === 'native-devices' || page.type === 'help-support' || page.type === 'help-account' || page.type === 'help-getting-started' || page.type === 'help-getting-started-article' || page.type === 'help-payment-credits' || page.type === 'help-payment-credits-article' || page.type === 'help-membership' || page.type === 'help-membership-article' || page.type === 'help-safety-article' || page.type === 'help-warranty' || page.type === 'help-warranty-article' || page.type === 'help-phone-article' || page.type === 'help-address-article' || page.type === 'help-email-article' || page.type === 'help-payment-article' || page.type === 'my-plans' || page.type === 'passes-membership' || page.type === 'payment-methods' || page.type === 'manage-addresses' || page.type === 'my-rating' || page.type === 'settings' || page.type === 'privacy-center') {
    content = (
      <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ flex: 1, backgroundColor: colors.white }}>
        <ProfileEntryScreen
          email={email}
          name={name}
          phone={phone}
          profilePicture={profilePicture}
          onAbout={() => setPage({ type: 'about' })}
          onBack={() => setPage({ type: 'root' })}
          onCompleteProfile={() => setPage({ type: 'profile-details' })}
          onHelpSupport={() => { setProfileTransition('push'); setPage({ type: 'help-support', from: 'profile' }); }}
          onLogout={onLogout}
          onManageAddresses={() => setPage({ type: 'manage-addresses' })}
          onManagePaymentMethods={() => setPage({ type: 'payment-methods' })}
          onMyBookings={() => setPage({ type: 'my-bookings' })}
          onMyPlans={() => setPage({ type: 'my-plans' })}
          onMyRating={() => setPage({ type: 'my-rating' })}
          onNativeDevices={() => setPage({ type: 'native-devices' })}
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
    content = <NativeScreen cart={cartState.quantities} onAddToCart={addNativeSelectionsToCart} onViewCart={() => changeTab('cart')} />;
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
        onSpotlightPress={openSpotlight}
        onSeeAllCategories={() => changeTab('categories')}
        onProfilePress={() => setPage({ type: 'profile' })}
        onRetry={retryCategories}
      />
    );
  }

  const dashboardRoot = (
    <View style={{ flex: 1, backgroundColor: colors.violetTone98_2 }}>
      {content}
      {page.type === 'root' ? <BottomTabBar activeTab={activeTab} cartCount={cartState.totalItems} onChange={changeTab} /> : null}
      {page.type === 'profile-details' ? (
        <Animated.View
          entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN}
          exiting={STACK_SLIDE_OUT}
          style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}
        >
          <ProfileDetailsScreen
            authToken={authToken}
            email={email}
            name={name}
            phone={phone}
            onBack={() => { setProfileTransition('pop'); setPage(page.from === 'help-phone-article' ? { type: 'help-phone-article', from: 'profile' } : page.from === 'help-email-article' ? { type: 'help-email-article', from: 'profile' } : { type: 'profile' }); }}
            onVerified={(profile) => {
              onProfileUpdated(profile);
              setPage({ type: 'profile' });
            }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'wallet' ? (
        <Animated.View
          entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN}
          exiting={STACK_SLIDE_OUT}
          style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}
        >
          <WalletScreen onBack={() => { setProfileTransition('pop'); setPage(page.from === 'help-payment-credits-article' && page.helpArticle ? { type: 'help-payment-credits-article', article: page.helpArticle, from: page.helpFrom } : { type: 'profile' }); }} />
        </Animated.View>
      ) : null}
      {page.type === 'about' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <AboutScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'payment-methods' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <PaymentMethodsScreen onBack={() => { setProfileTransition('pop'); setPage(page.from === 'help-payment-article' ? { type: 'help-payment-article', from: 'profile' } : page.from === 'help-payment-credits-article' && page.helpArticle ? { type: 'help-payment-credits-article', article: page.helpArticle, from: page.helpFrom } : { type: 'profile' }); }} />
        </Animated.View>
      ) : null}
      {page.type === 'manage-addresses' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <ManageAddressesScreen authToken={authToken} name={name} phone={phone} onBack={() => { setProfileTransition('pop'); setPage(page.from === 'help-address-article' ? { type: 'help-address-article', from: 'profile' } : { type: 'profile' }); }} />
        </Animated.View>
      ) : null}
      {page.type === 'my-bookings' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <ProfileMyBookingsScreen
            onBack={() => setPage({ type: 'profile' })}
            onExplore={() => {
              setActiveTab('home');
              setPage({ type: 'root' });
            }}
            onHelp={() => { setProfileTransition('push'); setPage({ type: 'help-support', from: 'my-bookings' }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'native-devices' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <NativeDevicesScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'help-support' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <HelpSupportScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: page.from === 'my-bookings' ? 'my-bookings' : 'profile' }); }}
            onAccount={() => { setProfileTransition('push'); setPage({ type: 'help-account', from: page.from }); }}
            onGettingStarted={() => { setProfileTransition('push'); setPage({ type: 'help-getting-started', from: page.from }); }}
            onMembership={() => { setProfileTransition('push'); setPage({ type: 'help-membership', from: page.from }); }}
            onPaymentCredits={() => { setProfileTransition('push'); setPage({ type: 'help-payment-credits', from: page.from }); }}
            onSafety={() => { setProfileTransition('push'); setPage({ type: 'help-safety-article', from: page.from }); }}
            onWarranty={() => { setProfileTransition('push'); setPage({ type: 'help-warranty', from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-account' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <AccountHelpScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-support', from: page.from }); }}
            onChangeEmail={() => { setProfileTransition('push'); setPage({ type: 'help-email-article', from: page.from }); }}
            onChangePhone={() => { setProfileTransition('push'); setPage({ type: 'help-phone-article', from: page.from }); }}
            onPaymentDetails={() => { setProfileTransition('push'); setPage({ type: 'help-payment-article', from: page.from }); }}
            onSavedAddresses={() => { setProfileTransition('push'); setPage({ type: 'help-address-article', from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-getting-started' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <GettingStartedHelpScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-support', from: page.from }); }}
            onTopic={(article) => { setProfileTransition('push'); setPage({ type: 'help-getting-started-article', article, from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-getting-started-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <GettingStartedArticleScreen
            article={page.article}
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-getting-started', from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-payment-credits' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <PaymentCreditsHelpScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-support', from: page.from }); }}
            onTopic={(article) => { setProfileTransition('push'); setPage({ type: 'help-payment-credits-article', article, from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-payment-credits-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <PaymentCreditsArticleScreen
            article={page.article}
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-payment-credits', from: page.from }); }}
            onSavedPayments={() => { setProfileTransition('push'); setPage({ type: 'payment-methods', from: 'help-payment-credits-article', helpArticle: page.article, helpFrom: page.from }); }}
            onWallet={() => { setProfileTransition('push'); setPage({ type: 'wallet', from: 'help-payment-credits-article', helpArticle: page.article, helpFrom: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-membership' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <MembershipHelpScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-support', from: page.from }); }}
            onTopic={(article) => { setProfileTransition('push'); setPage({ type: 'help-membership-article', article, from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-membership-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <MembershipArticleScreen
            article={page.article}
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-membership', from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-safety-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <SafetyArticleScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-support', from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-warranty' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <WarrantyHelpScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-support', from: page.from }); }}
            onTopic={(article) => { setProfileTransition('push'); setPage({ type: 'help-warranty-article', article, from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-warranty-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <WarrantyArticleScreen
            article={page.article}
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-warranty', from: page.from }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-phone-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <ChangePhoneHelpScreen
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-account', from: page.from }); }}
            onChangePhone={() => { setProfileTransition('push'); setPage({ type: 'profile-details', from: 'help-phone-article' }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-address-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <AccountArticleScreen
            title="Where can I check my saved addresses?"
            description="You can check your saved addresses using the following ways:"
            buttonLabel="My addresses"
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-account', from: page.from }); }}
            onAction={() => { setProfileTransition('push'); setPage({ type: 'manage-addresses', from: 'help-address-article' }); }}
          >
            <View style={{ paddingTop: 16, gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 12 }}>
                <Text style={{ width: 28, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>1.</Text>
                <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>While selecting the location on the app homescreen</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingLeft: 12 }}>
                <Text style={{ width: 28, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>2.</Text>
                <Text style={{ flex: 1, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Check address on the checkout screen before making payment</Text>
              </View>
              <Text style={{ paddingTop: 8, fontSize: fontSizes.size15, lineHeight: 23, color: colors.mauveTone38_2 }}>Alternatively, you can also use the link below to check all saved addresses.</Text>
            </View>
          </AccountArticleScreen>
        </Animated.View>
      ) : null}
      {page.type === 'help-email-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <AccountArticleScreen
            title="I want to change my email address"
            description="You can change your email address from the profile section after verifying it with an OTP."
            buttonLabel="Change email address"
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-account', from: page.from }); }}
            onAction={() => { setProfileTransition('push'); setPage({ type: 'profile-details', from: 'help-email-article' }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'help-payment-article' ? (
        <Animated.View entering={profileTransition === 'pop' ? STACK_POP_IN : STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <AccountArticleScreen
            title="Where can I see my saved payment details?"
            description="You can check all your saved payment details using the button below. To remove a saved payment method, open your saved payments and delete the card."
            buttonLabel="Check saved payments"
            onBack={() => { setProfileTransition('pop'); setPage({ type: 'help-account', from: page.from }); }}
            onAction={() => { setProfileTransition('push'); setPage({ type: 'payment-methods', from: 'help-payment-article' }); }}
          />
        </Animated.View>
      ) : null}
      {page.type === 'my-plans' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <MyPlansScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'passes-membership' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <PassesMembershipScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'my-rating' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <MyRatingScreen onBack={() => setPage({ type: 'profile' })} />
        </Animated.View>
      ) : null}
      {page.type === 'settings' || page.type === 'privacy-center' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
          <SettingsScreen email={email} onBack={() => setPage({ type: 'profile' })} onDeleteAccount={() => setPage({ type: 'privacy-center' })} />
        </Animated.View>
      ) : null}
      {page.type === 'privacy-center' ? (
        <Animated.View entering={STACK_SLIDE_IN} exiting={STACK_SLIDE_OUT} style={{ position: 'absolute', inset: 0, backgroundColor: colors.white }}>
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
        style={{ position: 'absolute', inset: 0, zIndex: 100, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.whiteAlpha72 }}
      >
        <LoadingDots />
      </Animated.View>
    ) : null}
    </View>
  );
}
