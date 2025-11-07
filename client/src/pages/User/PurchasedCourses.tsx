import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { getPurchasedCoursesS } from "../../services/user.services";

interface PurchasedCourse {
  _id: string;
  title: string;
  description: string;
  price: number;
  purchasedAt: string;
  thumbnail: string;
}

export default function PurchasedCourses() {
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const itemsPerPage = 3;
  const navigate = useNavigate();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      try {
        const res = await getPurchasedCoursesS(currentPage, itemsPerPage);
        setCourses(res.data.purchasedCourses);
        setTotalPages(res.data.totalPages);
      } catch {}
    };
    fetchPurchasedCourses();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <div className="max-w-6xl mx-auto py-16 px-4">
        <h1 className="h1">My Purchased Courses</h1>
        {courses.length === 0 ? (
          <p className="text-[color:var(--text-600)] mt-2">You have not purchased any courses yet.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                onClick={() => navigate(`/users/courses/${course._id}`)}
                className="card p-4 hover:shadow-2 cursor-pointer soft-in"
              >
                <img src={course.thumbnail} alt={course.title} className="rounded-xl mb-3 w-full h-40 object-cover" />
                <h2 className="font-semibold">{course.title}</h2>
                <p className="text-sm text-[color:var(--text-600)] line-clamp-2 mt-1">{course.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold">₹{course.price}</span>
                  <span className="text-xs text-[color:var(--text-600)]">
                    Purchased on {new Date(course.purchasedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
}
