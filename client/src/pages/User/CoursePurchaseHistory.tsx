import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { purchaseHistoryS } from "../../services/user.services";

interface Course { _id: string; title: string; }
interface Orders { _id: string; course: Course; purchasedAt: string; amount: number; status: string; }

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<Orders[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const itemsPerPage = 5;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await purchaseHistoryS(currentPage, itemsPerPage);
        setPurchases(res.data.purchases);
        setTotalPages(res.data.totalPages);
      } catch {}
    };
    fetchOrders();
  }, [currentPage, itemsPerPage]);

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
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase, index) => (
                    <tr key={purchase._id} className="hover:bg-[var(--primary-50)]">
                      <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                        {`ORD${String((currentPage - 1) * itemsPerPage + index + 1).padStart(3, "0")}`}
                      </td>
                      <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                        {purchase.course.title}
                      </td>
                      <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                        {new Date(purchase.purchasedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>₹{purchase.amount}</td>
                      <td className="px-4 py-2 border-b" style={{ borderColor: "var(--stroke-200)" }}>
                        <span
                          className={`badge ${purchase.status === "paid" ? "" : ""}`}
                        >
                          {purchase.status}
                        </span>
                      </td>
                    </tr>
                  ))}
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
