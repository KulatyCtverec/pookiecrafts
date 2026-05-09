export const CUSTOMER_ACCOUNT_SUMMARY_QUERY = `
  query CustomerAccountSummary($ordersFirst: Int!, $ordersAfter: String) {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      phoneNumber {
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
