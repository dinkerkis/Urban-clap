export const apiEndpoints = {
  auth: {
    requestOtp: '/mobile/auth/login_twilio_otp',
    verifyOtp: '/mobile/auth/login_twilio_otp_verify',
  },
  categories: {
    list: '/mobile/category/list',
    products: (categoryId: string) => `/mobile/product/products-with-category/${encodeURIComponent(categoryId)}`,
  },
  cart: {
    add: '/mobile/cart/add',
    clear: '/mobile/cart/clear',
    details: '/mobile/cart',
    decrement: (itemId: string) => `/mobile/cart/${encodeURIComponent(itemId)}/decrement`,
  },
  addresses: {
    list: '/mobile/address',
    add: '/mobile/address',
    byId: (addressId: string) => `/mobile/address/${encodeURIComponent(addressId)}`,
    setDefault: (addressId: string) => `/mobile/address/${encodeURIComponent(addressId)}/default`,
  },
  nativeProducts: {
    list: '/mobile/native-product',
    description: '/mobile/native-product/description',
    detail: (productId: string) => `/mobile/native-product/${encodeURIComponent(productId)}`,
    byCategory: (categoryId: string) => `/mobile/native-category/${encodeURIComponent(categoryId)}/products`,
  },
  home: {
    promotionalBanner: '/mobile/home/promotional-banner',
    spotlights: '/mobile/home/spotlights',
  },
  user: {
    profile: '/mobile/user/profile',
    verifyEmail: '/mobile/user/profile/verify-email',
  },
} as const;
