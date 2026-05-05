export const LOCALIZATION_QUERY = `
  query Localization($country: CountryCode) @inContext(country: $country) {
    localization {
      availableLanguages {
        isoCode
        endonymName
      }
      availableCountries {
        isoCode
        name
        availableLanguages {
          isoCode
          endonymName
        }
      }
    }
  }
`;

export const COLLECTIONS_QUERY = `
  query getCollections($language: LanguageCode) @inContext(language: $language) {
    collections(first: 20) {
      nodes {
        id
        title
        handle
        updatedAt
        description
        seo {
          title
          description
        }
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

export const COLLECTION_BY_HANDLE_QUERY = `
  query getCollectionByHandle($handle: String!, $language: LanguageCode) @inContext(language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      updatedAt
      description
      seo {
        title
        description
      }
      products(first: 50) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_BY_TYPE_QUERY = `
  query getProductsByType($query: String!, $language: LanguageCode) @inContext(language: $language) {
    products(first: 50, query: $query) {
      nodes {
        id
        handle
        title
        options(first: 5) {
          name
          optionValues {
            name
            swatch {
              color
            }
          }
        }
      }
    }
  }
`;

export const PRODUCTS_BY_TYPE_SUMMARY_QUERY = `
  query getProductsByTypeSummary($query: String!, $language: LanguageCode) @inContext(language: $language) {
    products(first: 50, query: $query) {
      nodes {
        id
        handle
        title
        availableForSale
        featuredImage {
          url
          altText
          width
          height
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

/* Variants: sklad vyžaduje Storefront scope `unauthenticated_read_product_inventory`. */
export const PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!, $language: LanguageCode) @inContext(language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      productType
      vendor
      description
      descriptionHtml
      updatedAt
      seo {
        title
        description
      }
      featuredImage {
        url
        altText
        width
        height
      }
      images(first: 10) {
        nodes {
          url
          altText
          width
          height
        }
      }
      options(first: 5) {
        name
        optionValues {
          name
          swatch {
            color
          }
        }
      }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          currentlyNotInStock
          quantityAvailable
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
          selectedOptions {
            name
            value
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

export const COLLECTIONS_PAGINATED_QUERY = `
  query getCollectionsPage($cursor: String, $language: LanguageCode) @inContext(language: $language) {
    collections(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        title
        updatedAt
      }
    }
  }
`;

export const PRODUCTS_PAGINATED_QUERY = `
  query getProductsPage($cursor: String, $language: LanguageCode) @inContext(language: $language) {
    products(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        updatedAt
      }
    }
  }
`;

/** Společná pole ProductVariant ve všech cart dotazech (včetně skladu). */
const CART_PRODUCT_VARIANT_FIELDS = `
                id
                title
                availableForSale
                currentlyNotInStock
                quantityAvailable
                product {
                  title
                  handle
                }
                price {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                  width
                  height
                }
                selectedOptions {
                  name
                  value
                }`;

export const CART_CREATE_MUTATION = `
  mutation cartCreate($language: LanguageCode) @inContext(language: $language) {
    cartCreate {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {${CART_PRODUCT_VARIANT_FIELDS}
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_GET_QUERY = `
  query cartGet($cartId: ID!, $language: LanguageCode) @inContext(language: $language) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {${CART_PRODUCT_VARIANT_FIELDS}
            }
          }
        }
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!, $language: LanguageCode) @inContext(language: $language) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {${CART_PRODUCT_VARIANT_FIELDS}
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!, $language: LanguageCode) @inContext(language: $language) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {${CART_PRODUCT_VARIANT_FIELDS}
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!, $language: LanguageCode) @inContext(language: $language) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          nodes {
            id
            quantity
            merchandise {
              ... on ProductVariant {${CART_PRODUCT_VARIANT_FIELDS}
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/** Metaobject typ `homepage_products` — pole `photo` (soubor), `key` (text). Scope: `unauthenticated_read_metaobjects`. */
export const HOMEPAGE_CAROUSEL_METAOBJECTS_QUERY = `
  query homepageCarouselMetaobjects($language: LanguageCode) @inContext(language: $language) {
    metaobjects(type: "homepage_products", first: 20, sortKey: "updated_at") {
      nodes {
        id
        handle
        photo: field(key: "photo") {
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
            ... on GenericFile {
              url
              alt
            }
          }
        }
        keyField: field(key: "key") {
          value
        }
      }
    }
  }
`;

/** Metaobject typ `about_photo` — vybere položku s key = "main" a vrátí pole `photo`. */
export const ABOUT_PHOTO_METAOBJECT_QUERY = `
  query aboutPhotoMetaobject {
    metaobjects(type: "about_photo", first: 20, sortKey: "updated_at") {
      nodes {
        id
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
            ... on GenericFile {
              url
              alt
            }
          }
        }
        keyField: field(key: "key") {
          value
        }
      }
    }
  }
`;

export const MEDIA_FILE_BY_ID_QUERY = `
  query mediaFileById($id: ID!) {
    node(id: $id) {
      __typename
      ... on MediaImage {
        image {
          url
          altText
        }
      }
      ... on GenericFile {
        url
        alt
      }
    }
  }
`;
