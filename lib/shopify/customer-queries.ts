export const CUSTOMER_ACCOUNT_SUMMARY_QUERY = `
  query CustomerAccountSummary($ordersFirst: Int!, $ordersAfter: String) {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
        marketingState
      }
      phoneNumber {
        phoneNumber
      }
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        zip
        territoryCode
        zoneCode
        phoneNumber
      }
      orders(first: $ordersFirst, after: $ordersAfter, reverse: true) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          number
          processedAt
          financialStatus
          fulfillmentStatus
          totalPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export const CUSTOMER_UPDATE_PROFILE_MUTATION = `
  mutation CustomerUpdateProfile($firstName: String, $lastName: String) {
    customerUpdate(input: { firstName: $firstName, lastName: $lastName }) {
      customer {
        id
        firstName
        lastName
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_CREATE_MUTATION = `
  mutation CustomerAddressCreate($address: CustomerAddressInput!, $defaultAddress: Boolean) {
    customerAddressCreate(address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        zip
        territoryCode
        zoneCode
        phoneNumber
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_ADDRESS_UPDATE_MUTATION = `
  mutation CustomerAddressUpdate(
    $addressId: ID!
    $address: CustomerAddressInput
    $defaultAddress: Boolean
  ) {
    customerAddressUpdate(addressId: $addressId, address: $address, defaultAddress: $defaultAddress) {
      customerAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        zip
        territoryCode
        zoneCode
        phoneNumber
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_EMAIL_MARKETING_SUBSCRIBE_MUTATION = `
  mutation CustomerEmailMarketingSubscribe {
    customerEmailMarketingSubscribe {
      emailAddress {
        emailAddress
        marketingState
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const CUSTOMER_EMAIL_MARKETING_UNSUBSCRIBE_MUTATION = `
  mutation CustomerEmailMarketingUnsubscribe {
    customerEmailMarketingUnsubscribe {
      emailAddress {
        emailAddress
        marketingState
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
