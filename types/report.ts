export interface ReportRegistrationBody {
  name: string;
  email: string;
  postalCode: string;
  address1: string;
  address2: string;
  disclaimerAccepted: boolean;
}

export interface PendingReportRegistration {
  name: string;
  email: string;
  address: string; // 郵便番号｜住所1｜住所2 の結合
  createdAt: number;
  phone?: string;
  code?: string;
  codeExpires?: number;
  verified?: boolean;
}
