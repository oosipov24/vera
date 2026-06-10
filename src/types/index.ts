// Vera Finance Domain Types
// Assets 
//Any ticker the platform understands (crypto + fiat)
export type AssetSymbol =
  | 'BTC' | 'ETH' | 'BNB' | 'SOL' | 'ADA' | 'XRP' | 'AVAX' | 'AAVE'
  | 'USDT' | 'USDC'
  | 'EUR' | 'USD' | 'GBP' | 'CHF' | 'AED';

export type AssetClass = 'major' | 'stable' | 'fiat';

// Static, display-level metadata for an asset.
export interface AssetMeta {
  name: string;
  symbol?: string;
  rail?: PaymentRail;
}

// Accounts & balances 
export type AccountType = 'Individual' | 'Corporate';

// asset → amount held.
export type BalanceMap = Partial<Record<AssetSymbol, number>>;

// Trading 
export type OrderSide = 'buy' | 'sell';
export type QtyUnit = 'asset' | 'quote';

// A tradeable pair, e.g. "BNB/USDT"
export type TradingPair = `${string}/${string}`;

export type ExecutionStatus = 'Executed' | 'Pending' | 'Rejected';

export interface Execution {
  id: string;
  pair: TradingPair;
  side: 'Buy' | 'Sell';
  // Quantity in the base asset 
  amount: number;
  asset: AssetSymbol;
  // Quote-currency price per 1 unit of base
  price: number;
  total: number;
  status: ExecutionStatus;
  created: string;
  executed: string;
}

// A live two-sided RFQ quote for a pair
export interface Quote {
  pair: TradingPair;
  base: AssetSymbol;
  quote: AssetSymbol;
  bid: number;
  ask: number;
  // Spread in basis points
  spreadBps: number;
}

//  Deposits & withdrawals (ledger) 
export type PaymentRail = 'SEPA' | 'SWIFT';
// What appears in the "method" column: fiat rail, or "Crypto"
export type PaymentMethod = PaymentRail | 'Crypto';

export type TxnType = 'Deposit' | 'Withdrawal';
export type TxnStatus = 'Completed' | 'Pending' | 'RFI Hold' | 'Rejected';

export interface Transaction {
  id: string;
  type: TxnType;
  asset: AssetSymbol;
  amount: number;
  method: PaymentMethod;
  status: TxnStatus;
  created: string;
  // Free-text note (e.g. RFI / rejection reason). Empty when none.
  reason: string;
}

//  Filters 
export type RailFilter = 'All Rails' | 'Fiat' | 'Crypto';
// "All" = no method filter, otherwise a rail (SEPA/SWIFT) or an asset symbol
export type MethodFilter = 'All' | PaymentRail | AssetSymbol;
export type StatusFilter = 'All Status' | TxnStatus;

export interface TxnFilter {
  rail: RailFilter;
  method: MethodFilter;
  status: StatusFilter;
}

//  Networks (crypto deposit/withdraw) 
export type NetworkName =
  | 'Native Bitcoin'
  | 'ERC-20 (Ethereum)'
  | 'TRC-20 (Tron)'
  | 'BEP-20 (BSC)'
  | 'Cardano'
  | 'Solana'
  | 'XRP Ledger'
  | 'Avalanche C-Chain';
//  Display / FX 
export type DisplayCurrency = 'USD' | 'EUR';

//  Portfolio 
export type PortfolioView = 'all' | 'fiat' | 'stables' | 'majors';

//  UI 
export type ThemeMode = 'dark' | 'light';
export type ToastKind = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message: string;
}

// Destination bank-field descriptor used by the withdraw form
export interface FiatField {
  id: string;
  lbl: string;
  ph: string;
  req: boolean;
}
