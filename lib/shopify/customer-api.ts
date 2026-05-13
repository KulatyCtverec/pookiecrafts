import { getCustomerApiDiscovery } from "./customer-auth";
import {
  CUSTOMER_ACCOUNT_SUMMARY_QUERY,
  CUSTOMER_ADDRESS_CREATE_MUTATION,
  CUSTOMER_ADDRESS_UPDATE_MUTATION,
  CUSTOMER_EMAIL_MARKETING_SUBSCRIBE_MUTATION,
  CUSTOMER_EMAIL_MARKETING_UNSUBSCRIBE_MUTATION,
  CUSTOMER_UPDATE_PROFILE_MUTATION,
} from "./customer-queries";

interface GraphQlError {
  message: string;
  extensions?: { code?: string };
}

interface CustomerApiResponse<T> {
  data?: T;
  errors?: GraphQlError[];
}

export interface CustomerOrder {
  id: string;
  number: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
}

export interface CustomerAddressSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  address1: string | null;
  address2: string | null;
  city: string | null;
  zip: string | null;
  territoryCode: string | null;
  zoneCode: string | null;
  phoneNumber: string | null;
}

export type EmailMarketingState =
  | "INVALID"
  | "NOT_SUBSCRIBED"
  | "PENDING"
  | "REDACTED"
  | "SUBSCRIBED"
  | "UNSUBSCRIBED";

export interface CustomerSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  emailMarketingState: EmailMarketingState;
  phoneNumber: string | null;
  defaultAddress: CustomerAddressSummary | null;
}

export interface CustomerOrdersPage {
  orders: CustomerOrder[];
  hasNextPage: boolean;
  endCursor: string | null;
}

function mapAddress(
  row: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    company: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    zip: string | null;
    territoryCode: string | null;
    zoneCode: string | null;
    phoneNumber: string | null;
  } | null
): CustomerAddressSummary | null {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    company: row.company,
    address1: row.address1,
    address2: row.address2,
    city: row.city,
    zip: row.zip,
    territoryCode: row.territoryCode,
    zoneCode: row.zoneCode,
    phoneNumber: row.phoneNumber,
  };
}

export async function customerAccountFetch<T>({
  accessToken,
  query,
  variables,
  language,
}: {
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
  language?: string;
}): Promise<T> {
  const { graphql_api } = await getCustomerApiDiscovery();
  const response = await fetch(graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
      ...(language ? { "Accept-Language": language } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const payload = (await response.json()) as CustomerApiResponse<T>;
  if (!response.ok) {
    throw new Error(`Customer API request failed with status ${response.status}`);
  }

  if (payload.errors?.length) {
    const code = payload.errors[0].extensions?.code;
    const message = payload.errors[0].message;
    if (code === "THROTTLED") {
      throw new Error("Customer API throttled. Please retry shortly.");
    }
    throw new Error(message || "Customer API error");
  }

  if (!payload.data) {
    throw new Error("Customer API returned no data.");
  }

  return payload.data;
}

export async function getCustomerSummaryAndOrders(
  accessToken: string,
  options?: { first?: number; after?: string | null; language?: string }
): Promise<{ customer: CustomerSummary; ordersPage: CustomerOrdersPage }> {
  const first = options?.first ?? 10;
  const data = await customerAccountFetch<{
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      emailAddress: { emailAddress: string; marketingState: EmailMarketingState };
      phoneNumber: { phoneNumber: string } | null;
      defaultAddress: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        company: string | null;
        address1: string | null;
        address2: string | null;
        city: string | null;
        zip: string | null;
        territoryCode: string | null;
        zoneCode: string | null;
        phoneNumber: string | null;
      } | null;
      orders: {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
        nodes: CustomerOrder[];
      };
    } | null;
  }>({
    accessToken,
    language: options?.language,
    query: CUSTOMER_ACCOUNT_SUMMARY_QUERY,
    variables: { ordersFirst: first, ordersAfter: options?.after ?? null },
  });

  if (!data.customer) {
    throw new Error("Customer session is not available.");
  }

  const accountPhone = data.customer.phoneNumber?.phoneNumber ?? null;
  const defaultAddr = mapAddress(data.customer.defaultAddress);

  return {
    customer: {
      id: data.customer.id,
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.emailAddress.emailAddress,
      emailMarketingState: data.customer.emailAddress.marketingState,
      phoneNumber: accountPhone ?? defaultAddr?.phoneNumber ?? null,
      defaultAddress: defaultAddr,
    },
    ordersPage: {
      orders: data.customer.orders.nodes,
      hasNextPage: data.customer.orders.pageInfo.hasNextPage,
      endCursor: data.customer.orders.pageInfo.endCursor,
    },
  };
}

export async function updateCustomerProfile(
  accessToken: string,
  input: { firstName?: string | null; lastName?: string | null },
  language?: string
): Promise<{ firstName: string | null; lastName: string | null }> {
  const data = await customerAccountFetch<{
    customerUpdate: {
      customer: {
        firstName: string | null;
        lastName: string | null;
      } | null;
      userErrors: { message: string; code?: string | null }[];
    };
  }>({
    accessToken,
    language,
    query: CUSTOMER_UPDATE_PROFILE_MUTATION,
    variables: {
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
    },
  });

  if (data.customerUpdate.userErrors.length > 0) {
    throw new Error(data.customerUpdate.userErrors[0].message);
  }

  if (!data.customerUpdate.customer) {
    throw new Error("Profile update failed.");
  }

  return {
    firstName: data.customerUpdate.customer.firstName,
    lastName: data.customerUpdate.customer.lastName,
  };
}

export interface CustomerAddressInputPayload {
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  zip: string;
  territoryCode: string;
  zoneCode?: string | null;
  phoneNumber?: string | null;
}

export async function upsertCustomerDefaultAddress(
  accessToken: string,
  params: { addressId?: string | null; address: CustomerAddressInputPayload },
  language?: string
): Promise<CustomerAddressSummary> {
  const addr = {
    firstName: params.address.firstName,
    lastName: params.address.lastName,
    company: params.address.company ?? null,
    address1: params.address.address1,
    address2: params.address.address2 ?? null,
    city: params.address.city,
    zip: params.address.zip,
    territoryCode: params.address.territoryCode,
    zoneCode: params.address.zoneCode ?? null,
    phoneNumber: params.address.phoneNumber ?? null,
  };

  if (params.addressId) {
    const data = await customerAccountFetch<{
      customerAddressUpdate: {
        customerAddress: {
          id: string;
          firstName: string | null;
          lastName: string | null;
          company: string | null;
          address1: string | null;
          address2: string | null;
          city: string | null;
          zip: string | null;
          territoryCode: string | null;
          zoneCode: string | null;
          phoneNumber: string | null;
        } | null;
        userErrors: { message: string; code?: string | null }[];
      };
    }>({
      accessToken,
      language,
      query: CUSTOMER_ADDRESS_UPDATE_MUTATION,
      variables: {
        addressId: params.addressId,
        address: addr,
        defaultAddress: true,
      },
    });

    if (data.customerAddressUpdate.userErrors.length > 0) {
      throw new Error(data.customerAddressUpdate.userErrors[0].message);
    }
    const row = data.customerAddressUpdate.customerAddress;
    if (!row) throw new Error("Address update failed.");
    const mapped = mapAddress(row);
    if (!mapped) throw new Error("Address update failed.");
    return mapped;
  }

  const data = await customerAccountFetch<{
    customerAddressCreate: {
      customerAddress: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        company: string | null;
        address1: string | null;
        address2: string | null;
        city: string | null;
        zip: string | null;
        territoryCode: string | null;
        zoneCode: string | null;
        phoneNumber: string | null;
      } | null;
      userErrors: { message: string; code?: string | null }[];
    };
  }>({
    accessToken,
    language,
    query: CUSTOMER_ADDRESS_CREATE_MUTATION,
    variables: {
      address: addr,
      defaultAddress: true,
    },
  });

  if (data.customerAddressCreate.userErrors.length > 0) {
    throw new Error(data.customerAddressCreate.userErrors[0].message);
  }
  const row = data.customerAddressCreate.customerAddress;
  if (!row) throw new Error("Address create failed.");
  const mapped = mapAddress(row);
  if (!mapped) throw new Error("Address create failed.");
  return mapped;
}

export async function setCustomerEmailMarketingSubscribed(
  accessToken: string,
  subscribed: boolean,
  language?: string
): Promise<EmailMarketingState> {
  if (subscribed) {
    const data = await customerAccountFetch<{
      customerEmailMarketingSubscribe: {
        emailAddress: { marketingState: EmailMarketingState } | null;
        userErrors: { message: string }[];
      };
    }>({
      accessToken,
      language,
      query: CUSTOMER_EMAIL_MARKETING_SUBSCRIBE_MUTATION,
    });
    if (data.customerEmailMarketingSubscribe.userErrors.length > 0) {
      throw new Error(data.customerEmailMarketingSubscribe.userErrors[0].message);
    }
    const state = data.customerEmailMarketingSubscribe.emailAddress?.marketingState;
    if (!state) throw new Error("Newsletter subscribe failed.");
    return state;
  }

  const data = await customerAccountFetch<{
    customerEmailMarketingUnsubscribe: {
      emailAddress: { marketingState: EmailMarketingState } | null;
      userErrors: { message: string }[];
    };
  }>({
    accessToken,
    language,
    query: CUSTOMER_EMAIL_MARKETING_UNSUBSCRIBE_MUTATION,
  });
  if (data.customerEmailMarketingUnsubscribe.userErrors.length > 0) {
    throw new Error(data.customerEmailMarketingUnsubscribe.userErrors[0].message);
  }
  const state = data.customerEmailMarketingUnsubscribe.emailAddress?.marketingState;
  if (!state) throw new Error("Newsletter unsubscribe failed.");
  return state;
}
