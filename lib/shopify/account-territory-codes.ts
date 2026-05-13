/** ISO 3166-1 alpha-2 codes accepted by Customer Account API `territoryCode` on addresses. */
export const ACCOUNT_ADDRESS_TERRITORY_CODES = [
  "CZ",
  "SK",
  "DE",
  "AT",
  "PL",
  "HU",
  "GB",
  "US",
  "FR",
  "ES",
  "IT",
  "NL",
  "BE",
  "CH",
  "IE",
  "PT",
  "RO",
  "BG",
  "HR",
  "SI",
  "SE",
  "NO",
  "DK",
  "FI",
] as const;

export type AccountAddressTerritoryCode = (typeof ACCOUNT_ADDRESS_TERRITORY_CODES)[number];
