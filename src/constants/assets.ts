import type {
  AssetSymbol,
  AssetMeta,
  NetworkName,
  FiatField,
  DisplayCurrency,
} from '@/types';

//  Asset classification 
export const STABLES: AssetSymbol[] = ['USDT', 'USDC'];
export const MAJORS: AssetSymbol[] = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'AVAX', 'AAVE'];
export const FIAT_SET: AssetSymbol[] = ['EUR', 'USD', 'GBP', 'CHF', 'AED'];
//  Crypto assets selectable for deposit/withdraw, in display order
export const CRYPTO_SET: AssetSymbol[] = ['USDT', 'BTC', 'ETH', 'USDC', 'ADA', 'BNB', 'SOL', 'XRP', 'AVAX', 'AAVE'];

export const isFiat = (a: AssetSymbol): boolean => FIAT_SET.includes(a);
export const isStable = (a: AssetSymbol): boolean => STABLES.includes(a);

//  Reference prices (USD per 1 unit), replace with a live price feed.
export const PRICES_USD: Record<AssetSymbol, number> = {
  USDT: 1, USDC: 1,
  BTC: 68240, ETH: 3800, BNB: 615, SOL: 165, ADA: 0.421, XRP: 0.618, AVAX: 28.4, AAVE: 95.2,
  EUR: 1.08, USD: 1, GBP: 1.27, CHF: 1.11, AED: 0.27,
};

//  Demo prices, replace with the market data API.
export const FX: Record<DisplayCurrency, number> = { USD: 1, EUR: 0.926 };

//  Display metadata 
export const ASSET_META: Record<AssetSymbol, AssetMeta> = {
  USDT: { name: 'Tether' },
  BTC: { name: 'Bitcoin' },
  ETH: { name: 'Ethereum' },
  USDC: { name: 'USD Coin' },
  ADA: { name: 'Cardano' },
  BNB: { name: 'BNB Chain' },
  SOL: { name: 'Solana' },
  XRP: { name: 'Ripple' },
  AVAX: { name: 'Avalanche' },
  AAVE: { name: 'Aave' },
  EUR: { name: 'Euro', symbol: '€', rail: 'SEPA' },
  USD: { name: 'US Dollar', symbol: '$', rail: 'SWIFT' },
  GBP: { name: 'British Pound', symbol: '£', rail: 'SWIFT' },
  CHF: { name: 'Swiss Franc', symbol: 'CHF ', rail: 'SWIFT' },
  AED: { name: 'UAE Dirham', symbol: 'AED ', rail: 'SWIFT' },
};

//  Crypto networks per coin 
export const NETWORKS: Partial<Record<AssetSymbol, NetworkName[]>> = {
  BTC: ['Native Bitcoin'],
  ETH: ['ERC-20 (Ethereum)', 'BEP-20 (BSC)'],
  USDT: ['ERC-20 (Ethereum)', 'TRC-20 (Tron)', 'BEP-20 (BSC)'],
  USDC: ['ERC-20 (Ethereum)', 'BEP-20 (BSC)', 'Solana'],
  ADA: ['Cardano'],
  BNB: ['BEP-20 (BSC)'],
  SOL: ['Solana'],
  XRP: ['XRP Ledger'],
  AVAX: ['Avalanche C-Chain'],
  AAVE: ['ERC-20 (Ethereum)'],
};

//  Demo addresses
export const NET_ADDR: Record<NetworkName, string> = {
  'Native Bitcoin': 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  'ERC-20 (Ethereum)': '0x742d35Cc6634C0532925a3b8D4C9C62F4e6B9D23',
  'TRC-20 (Tron)': 'TJYeasTPa6gpEEfYY5gFs8sNkbW4ZdGqt9',
  'BEP-20 (BSC)': '0x742d35Cc6634C0532925a3b8D4C9C62F4e6B9D23',
  Cardano: 'addr1qxck9w4f4xck9w4f4xck9w4f4xck9w4f4xck9w4f4',
  Solana: '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs',
  'XRP Ledger': 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh',
  'Avalanche C-Chain': '0x742d35Cc6634C0532925a3b8D4C9C62F4e6B9D23',
};

export const FIAT_METHODS = ['SEPA', 'SWIFT'] as const;

export function networksFor(asset: AssetSymbol): NetworkName[] {
  const networks = NETWORKS[asset];

  if (!networks?.length) {
    throw new Error(`No supported network configured for ${asset}`);
  }

  return networks;
}
//  Destination bank-field schemas for the withdraw form 
export const FIAT_FIELDS: Record<string, FiatField[]> = {
  SEPA_EUR: [
    { id: 'accHolder', lbl: 'Account Holder Name', ph: 'Full legal name', req: true },
    { id: 'iban', lbl: 'IBAN', ph: 'e.g. PL61 1090 1014 0000 0712', req: true },
    { id: 'bankName', lbl: 'Bank Name', ph: 'e.g. Barclays Bank', req: true },
    { id: 'swiftBic', lbl: 'SWIFT / BIC', ph: 'e.g. BARCGB22', req: true },
    { id: 'bankAddr', lbl: 'Bank Address', ph: 'Full bank address', req: false },
    { id: 'holderAddr', lbl: 'Account Holder Address', ph: 'Your registered address', req: false },
    { id: 'payRef', lbl: 'Payment Reference', ph: 'Optional', req: false },
    { id: 'bankCountry', lbl: 'Bank Country', ph: 'e.g. Germany', req: false },
  ],
  SWIFT_USD: [
    { id: 'accHolder', lbl: 'Account Holder Name', ph: 'Full legal name', req: true },
    { id: 'accNum', lbl: 'Account Number', ph: 'e.g. 123456789', req: true },
    { id: 'routing', lbl: 'Routing Number', ph: '9-digit ABA routing number', req: true },
    { id: 'bankName', lbl: 'Bank Name', ph: 'e.g. JPMorgan Chase', req: true },
    { id: 'swiftBic', lbl: 'SWIFT / BIC', ph: 'e.g. CHASUS33', req: true },
    { id: 'bankAddr', lbl: 'Bank Address', ph: 'Full bank address', req: false },
    { id: 'holderAddr', lbl: 'Account Holder Address', ph: 'Your address', req: false },
    { id: 'payRef', lbl: 'Payment Reference', ph: 'Optional', req: false },
    { id: 'bankCountry', lbl: 'Bank Country', ph: 'e.g. United States', req: false },
    { id: 'intBank', lbl: 'Intermediary Bank Name', ph: 'If applicable', req: false },
    { id: 'intSwift', lbl: 'Intermediary SWIFT/BIC', ph: 'If applicable', req: false },
  ],
  SWIFT_EUR: [
    { id: 'accHolder', lbl: 'Account Holder Name', ph: 'Full legal name', req: true },
    { id: 'iban', lbl: 'IBAN', ph: 'e.g. DE89 3704 0044 0532 0130 00', req: true },
    { id: 'bankName', lbl: 'Bank Name', ph: 'Bank name', req: true },
    { id: 'swiftBic', lbl: 'SWIFT / BIC', ph: 'e.g. COBADEFFXXX', req: true },
    { id: 'bankAddr', lbl: 'Bank Address', ph: 'Full bank address', req: false },
    { id: 'holderAddr', lbl: 'Account Holder Address', ph: 'Your address', req: false },
    { id: 'payRef', lbl: 'Payment Reference', ph: 'Optional', req: false },
    { id: 'bankCountry', lbl: 'Bank Country', ph: 'e.g. Germany', req: false },
    { id: 'intBank', lbl: 'Intermediary Bank Name', ph: 'If applicable', req: false },
    { id: 'intSwift', lbl: 'Intermediary SWIFT/BIC', ph: 'If applicable', req: false },
  ],
  SWIFT_GBP: [
    { id: 'accHolder', lbl: 'Account Holder Name', ph: 'Full legal name', req: true },
    { id: 'accNum', lbl: 'Account Number', ph: '8-digit account number', req: true },
    { id: 'sortCode', lbl: 'Sort Code', ph: 'e.g. 20-00-00', req: true },
    { id: 'bankName', lbl: 'Bank Name', ph: 'e.g. Barclays', req: true },
    { id: 'bankAddr', lbl: 'Bank Address', ph: 'Full bank address', req: false },
    { id: 'holderAddr', lbl: 'Account Holder Address', ph: 'Your address', req: false },
    { id: 'payRef', lbl: 'Payment Reference', ph: 'Optional', req: false },
    { id: 'bankCountry', lbl: 'Bank Country', ph: 'United Kingdom', req: false },
  ],
  SWIFT_CHF: [
    { id: 'accHolder', lbl: 'Account Holder Name', ph: 'Full legal name', req: true },
    { id: 'iban', lbl: 'IBAN', ph: 'e.g. CH56 0483 5012 3456 7800 9', req: true },
    { id: 'bankName', lbl: 'Bank Name', ph: 'e.g. UBS', req: true },
    { id: 'swiftBic', lbl: 'SWIFT / BIC', ph: 'e.g. UBSWCHZH80A', req: true },
    { id: 'bankAddr', lbl: 'Bank Address', ph: 'Full bank address', req: false },
    { id: 'holderAddr', lbl: 'Account Holder Address', ph: 'Your address', req: false },
    { id: 'payRef', lbl: 'Payment Reference', ph: 'Optional', req: false },
    { id: 'bankCountry', lbl: 'Bank Country', ph: 'Switzerland', req: false },
    { id: 'intBank', lbl: 'Intermediary Bank Name', ph: 'If applicable', req: false },
    { id: 'intSwift', lbl: 'Intermediary SWIFT/BIC', ph: 'If applicable', req: false },
  ],
  SWIFT_AED: [
    { id: 'accHolder', lbl: 'Account Holder Name', ph: 'Full legal name', req: true },
    { id: 'iban', lbl: 'IBAN', ph: 'e.g. AE07 0331 2345 6789 0123 456', req: true },
    { id: 'bankName', lbl: 'Bank Name', ph: 'e.g. Emirates NBD', req: true },
    { id: 'swiftBic', lbl: 'SWIFT / BIC', ph: 'e.g. EBILAEAD', req: true },
    { id: 'bankAddr', lbl: 'Bank Address', ph: 'Full bank address', req: false },
    { id: 'holderAddr', lbl: 'Account Holder Address', ph: 'Your address', req: false },
    { id: 'payRef', lbl: 'Payment Reference', ph: 'Optional', req: false },
    { id: 'bankCountry', lbl: 'Bank Country', ph: 'United Arab Emirates', req: false },
    { id: 'intBank', lbl: 'Intermediary Bank Name', ph: 'If applicable', req: false },
    { id: 'intSwift', lbl: 'Intermediary SWIFT/BIC', ph: 'If applicable', req: false },
  ],
};

/** Resolve the field schema for a given rail + fiat asset. */
export function fiatFieldsFor(method: string, asset: AssetSymbol): FiatField[] {
  const key = method === 'SEPA' ? 'SEPA_EUR' : `SWIFT_${asset}`;
  return FIAT_FIELDS[key] ?? FIAT_FIELDS.SWIFT_USD;
}

