export interface WalletTransaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  courseTitle?: string;
  createdAt: string;
}

export interface WalletSummary {
  ownerType: string;
  ownerId?: string;
  balance: number;
  transactions: WalletTransaction[];
}

export interface WalletResponse {
  wallet: WalletSummary;
  transactions: WalletTransaction[];
  total: number;
  totalPages: number;
  currentPage?: number;
}
