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

export const PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!, $language: LanguageCode) @inContext(language: $language) {
    product(handle: $handle) {
      id
      title
      handle
      productType
      description
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
              ... on ProductVariant {
                id
                title
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
                }
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
            ... on ProductVariant {
              id
              title
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
              }
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
              ... on ProductVariant {
                id
                title
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
                }
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
              ... on ProductVariant {
                id
                title
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
                }
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
              ... on ProductVariant {
                id
                title
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
                }
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
