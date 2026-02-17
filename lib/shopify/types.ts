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

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  image?: ShopifyImage | null;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: { name: string; value: string }[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
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
