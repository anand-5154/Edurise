import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { cancelOrderS, purchaseHistoryS } from "../../services/user.services";
import { errorToast, successToast } from "../../components/Toast";

interface Course { _id: string; title: string; }
interface Orders { _id: string; course: Course; purchasedAt: string; amount: number; status: string; }

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<Orders[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const itemsPerPage = 5;
  const CANCEL_WINDOW_MS = 15 * 60 * 1000;
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await purchaseHistoryS(currentPage, itemsPerPage);
      setPurchases(res.data.purchases);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      errorToast("Failed to load purchase history");
    }
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const canCancel = (purchase: Orders) => {
    if (purchase.status !== "paid") return false;
    const purchaseTime = new Date(purchase.purchasedAt).getTime();
    return currentTime - purchaseTime <= CANCEL_WINDOW_MS;
  };

  const remainingTimeLabel = (purchase: Orders) => {
    const purchaseTime = new Date(purchase.purchasedAt).getTime();
    const remainingMs = CANCEL_WINDOW_MS - (currentTime - purchaseTime);
    if (remainingMs <= 0) return "Expired";
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleCancel = async (orderId: string) => {
    try {
      setCancelLoadingId(orderId);
      await cancelOrderS(orderId);
      successToast("Order cancelled. Refund credited to your wallet.");
      await fetchOrders();
    } catch (error) {
      const message = (error as any)?.response?.data?.message || "Unable to cancel order";
      errorToast(message);
    } finally {
      setCancelLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <div className="card p-6">
          <h2 className="h3 mb-4">Purchase History</h2>

          {purchases.length === 0 ? (
            <p className="text-[color:var(--text-600)]">You haven't purchased any courses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Course</th>
                    <th className="px-4 py-2 text-left">Purchase Date</th>
                    <th className="px-4 py-2 text-left">Price (₹)</th>
                    <th className="px-4 py-2 text-left">Payment Method</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Refund</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase, index) => {
                    const disableCancellation = !canCancel(purchase);
                    const refundAmount = Number(
                      purchase.refundAmount ?? purchase.amount ?? 0
                    );
                    return (
                      <tr key={purchase._id} className="hover:bg-[var(--primary-50)]">
                        <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                          {`ORD${String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, "0")}`}
                        </td>
                        <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                          {purchase.course.title}
                        </td>
                        <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                          {new Date(purchase.purchasedAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>₹{purchase.amount}</td>
                        <td className="px-4 py-2 border-b capitalize" style={{ borderColor: "var(--stroke-200)" }}>
                          {purchase.paymentMethod || "razorpay"}
                        </td>
                        <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                          <span
                            className={`badge ${
                              purchase.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : purchase.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                          {purchase.status === "cancelled"
                            ? `₹${refundAmount.toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                          {purchase.status === "cancelled" ? (
                            <span className="text-sm text-slate-500">Refunded</span>
                          ) : disableCancellation ? (
                            <span className="text-xs text-slate-500">Cancellation unavailable</span>
                          ) : (
                            <button
                              onClick={() => handleCancel(purchase._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold hover:bg-red-600 disabled:opacity-50"
                              disabled={cancelLoadingId === purchase._id}
                            >
                              {cancelLoadingId === purchase._id ? "Cancelling..." : `Cancel (${remainingTimeLabel(purchase)})`}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
