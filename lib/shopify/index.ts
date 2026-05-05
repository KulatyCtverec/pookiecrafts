export {
  storefrontClient,
  shopifyFetch,
  getCollections,
  getCollectionByHandle,
  getProductByHandle,
  getProductsByHandles,
  getProductsByType,
  getCollectionHandles,
  getProductHandles,
  getHomepageCarouselImages,
  getAboutPhotoImage,
} from "./client";
export { getProductsByTypeSummary } from "./client";
export type { ShopifyProductForColor, AboutPhotoImage } from "./client";
export {
  createCart,
  getCart,
  addToCart,
  updateCartLine,
  removeCartLine,
} from "./cart-actions";
export type {
  HomepageCarouselImage,
  ShopifyCollection,
  ShopifyCollectionWithProducts,
  ShopifyProduct,
  ShopifyProductVariant,
  ShopifyCart,
  ShopifyCartLine,
  ShopifyImage,
  ShopifyMoney,
} from "./types";
export {
  DEFAULT_QUANTITY_CAP,
  getVariantMaxQuantity,
} from "./variant-max-quantity";
export type { VariantQuantityCapInput } from "./variant-max-quantity";
