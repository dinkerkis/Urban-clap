export const apiEndpoints = {
  auth: {
    requestOtp: '/mobile/auth/login_twilio_otp',
    verifyOtp: '/mobile/auth/login_twilio_otp_verify',
  },
  categories: {
    list: '/mobile/category/list',
    products: (categoryId: string) => `/products-with-category/${encodeURIComponent(categoryId)}`,
  },
  cart: {
    add: '/cart/add',
    details: '/cart',
    decrement: (itemId: string) => `/cart/${encodeURIComponent(itemId)}/decrement`,
  },
  addresses: {
    list: '/address',
    add: '/address',
    byId: (addressId: string) => `/address/${encodeURIComponent(addressId)}`,
    setDefault: (addressId: string) => `/address/${encodeURIComponent(addressId)}/default`,
  },
  nativeProducts: {
    list: '/native-products/mobile',
    description: '/native-products/description/mobile',
    detail: (productId: string) => `/native-products/${encodeURIComponent(productId)}/mobile`,
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
