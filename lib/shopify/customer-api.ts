import { getCustomerApiDiscovery } from "./customer-auth";
import {
  CUSTOMER_ACCOUNT_SUMMARY_QUERY,
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

export interface CustomerSummary {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phoneNumber: string | null;
}

export interface CustomerOrdersPage {
  orders: CustomerOrder[];
  hasNextPage: boolean;
  endCursor: string | null;
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
      emailAddress: { emailAddress: string };
      phoneNumber: { phoneNumber: string } | null;
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

  return {
    customer: {
      id: data.customer.id,
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      email: data.customer.emailAddress.emailAddress,
      phoneNumber: data.customer.phoneNumber?.phoneNumber ?? null,
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
