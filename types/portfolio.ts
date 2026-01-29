export type SizeMode = "amount";
export type FormState = "editing" | "submitting" | "submitted" | "error";

export type Currency = "JPY" | "USD" | "EUR" | "GBP" | "AUD";

export interface DetailRow {
  name?: string;
  sizeMode: SizeMode;
  amount?: number;
}

export interface CashDetail extends DetailRow {
  currency?: Currency;
}

export interface ListedStockDetail extends DetailRow {
  market?: string;
}

export interface FundDetail extends DetailRow {
  fundType?: string;
}

export interface BondDetail extends DetailRow {
  bondType?: string;
  currency?: string;
  tenor?: string;
}

export interface CommodityDetail extends DetailRow {
  commodityType?: "GOLD" | "SILVER" | "PLATINUM" | "OTHER";
  form?: string;
}

export interface CryptoDetail extends DetailRow {
  custody?: string;
}

export type OtherInvestmentType =
  | "未上場株（エンジェル投資・VC投資）"
  | "事業投資（個人出資・共同事業など）"
  | "私募ファンド・組合出資"
  | "貸付・社債（個人間貸付・企業向け貸付）"
  | "持分投資・権利収入型投資"
  | "その他（分類が分からない投資）";

export interface OtherDetail extends DetailRow {
  investmentType?: OtherInvestmentType;
}

export interface CashData {
  details: CashDetail[];
}

export interface ListedStocksData {
  details: ListedStockDetail[];
}

export interface FundsData {
  details: FundDetail[];
}

export interface BondsData {
  details: BondDetail[];
}

export interface CommoditiesData {
  details: CommodityDetail[];
}

export interface CryptoData {
  details: CryptoDetail[];
}

export interface OtherData {
  details: OtherDetail[];
}

// 送信payload
export interface PortfolioSubmission {
  submittedAt: string;
  familyName?: string;
  givenName?: string;
  email?: string;
  cash: CashData;
  listedStocks: ListedStocksData;
  funds: FundsData;
  bonds: BondsData;
  commodities: CommoditiesData;
  crypto: CryptoData;
  other: OtherData;
}
