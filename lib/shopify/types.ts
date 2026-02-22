export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifySeo {
  title: string | null;
  description: string | null;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  image?: ShopifyImage | null;
  description?: string;
  updatedAt?: string;
  seo?: ShopifySeo | null;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  image?: ShopifyImage | null;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProductOptionValue {
  name: string;
  swatch?: { color?: string } | null;
}

export interface ShopifyProductOption {
  name: string;
  optionValues: ShopifyProductOptionValue[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  productType?: string;
  vendor?: string;
  description: string;
  updatedAt?: string;
  seo?: ShopifySeo | null;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  options?: ShopifyProductOption[];
  variants: { nodes: ShopifyProductVariant[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
}

export interface ShopifyCollectionWithProducts extends ShopifyCollection {
  products: { nodes: ShopifyProduct[] };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
    };
    price: ShopifyMoney;
    image: ShopifyImage | null;
    selectedOptions: { name: string; value: string }[];
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: { nodes: ShopifyCartLine[] };
}
