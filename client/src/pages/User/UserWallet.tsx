import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getUserWalletS } from "../../services/user.services";
import type { WalletSummary, WalletTransaction } from "../../types/wallet.types";
import { errorToast } from "../../components/Toast";

const UserWallet = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  const handleLimitChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
    setSearchParams({ page: "1" });
  };

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUserWalletS(currentPage, itemsPerPage);
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
      errorToast("Failed to load wallet details");
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />
      <div className="max-w-5xl mx-auto py-16 px-4">
        <div className="card p-6 mb-6">
          <h1 className="h2 mb-4">Wallet</h1>
          <p className="text-[color:var(--text-600)] text-sm">
            Refunds from cancelled purchases appear here. Use your wallet balance to enrol in new courses instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-6 h-full">
              <p className="text-sm text-[color:var(--text-600)] font-medium">Current Balance</p>
              <div className="text-4xl font-extrabold text-[color:var(--text-900)] mt-2">
                ₹{(wallet?.balance ?? 0).toFixed(2)}
              </div>
              <p className="text-xs text-[color:var(--text-500)] mt-3">
                Wallet funds can be used for any course purchase.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="h4">Transaction History</h2>
              </div>

              {loading ? (
                <p className="text-sm text-[color:var(--text-600)]">Loading transactions...</p>
              ) : transactions.length === 0 ? (
                <p className="text-sm text-[color:var(--text-600)]">
                  No wallet activity yet. Cancel a purchase within 15 minutes to see refund history here.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-right">Amount (₹)</th>
                        <th className="px-4 py-2 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn, index) => (
                        <tr key={`${txn.createdAt}-${index}`} className="border-b" style={{ borderColor: "var(--stroke-200)" }}>
                          <td className="px-4 py-2 capitalize font-semibold">
                            {txn.type}
                          </td>
                          <td className="px-4 py-2 text-sm text-[color:var(--text-700)]">
                            {txn.description}
                          </td>
                          <td className={`px-4 py-2 text-right font-semibold ${txn.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                            {txn.type === "credit" ? "+" : "-"}
                            {txn.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm text-[color:var(--text-500)]">
                            {new Date(txn.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  limit={itemsPerPage}
                  onLimitChange={handleLimitChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWallet;
