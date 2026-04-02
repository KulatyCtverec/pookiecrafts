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

/** Položky hero carouselu z metaobjectu `homepage_products`. */
export interface HomepageCarouselImage {
  id: string;
  url: string;
  alt: string;
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
  /** Zda jde o předobjednávku / prodej i bez skladové zásoby. */
  currentlyNotInStock?: boolean;
  /** Počet kusu k prodeji online; může být null, pokud sklad není v Storefront API vystavený. */
  quantityAvailable?: number | null;
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
  /** HTML z Shopify rich text editoru (Storefront `descriptionHtml`). */
  descriptionHtml?: string | null;
  updatedAt?: string;
  seo?: ShopifySeo | null;
  availableForSale?: boolean;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  options?: ShopifyProductOption[];
  variants: { nodes: ShopifyProductVariant[] };
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
}

export interface ShopifyProductSummary {
  id: string;
  handle: string;
  title: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
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
    availableForSale: boolean;
    currentlyNotInStock?: boolean;
    quantityAvailable?: number | null;
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
