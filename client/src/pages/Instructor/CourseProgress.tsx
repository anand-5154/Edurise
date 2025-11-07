import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getCourseProgressByUser } from "../../services/instructor.services";
import type { 
  CourseProgressByUser,
  CourseProgressListResponse 
} from "../../services/instructor.services";
import Pagination from "../../components/Pagination";
import { INSTRUCTOR_ROUTES } from "../../constants/routes.constants";
import { User, CheckCircle, XCircle, Award, Search, ArrowLeft, Clock } from "lucide-react";
import { errorToast } from "../../components/Toast";

const CourseProgress: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [progressList, setProgressList] = useState<CourseProgressByUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debounce, setDebounce] = useState<string>("");
  
  const pageParam = parseInt(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounce(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page") || "1");
    setCurrentPage(pageParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        setError(null);
        const res = await getCourseProgressByUser(
          courseId,
          currentPage,
          itemsPerPage,
          debounce
        );
        const data: CourseProgressListResponse = res.data;
        setProgressList(data.progressList);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || "Failed to load course progress";
        setError(errorMessage);
        errorToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [courseId, currentPage, itemsPerPage, debounce]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course progress...</p>
        </div>
      </div>
    );
  }

  if (error && progressList.length === 0) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(INSTRUCTOR_ROUTES.COURSES)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </button>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(INSTRUCTOR_ROUTES.COURSES)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const courseTitle = progressList.length > 0 ? progressList[0].courseTitle : "Course Progress";

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(INSTRUCTOR_ROUTES.COURSES)}
            className="mb-4 flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{courseTitle}</h1>
          <p className="text-gray-600">
            View progress and completion status for all enrolled students
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats Summary */}
        {progressList.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Total Enrollments</p>
              <p className="text-2xl font-bold text-blue-900">{total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {progressList.filter((p) => p.progress.isCompleted).length}
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-orange-900">
                {progressList.filter((p) => !p.progress.isCompleted).length}
              </p>
            </div>
          </div>
        )}

        {/* Progress Table */}
        {progressList.length === 0 && !loading ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No students enrolled yet</p>
            <p className="text-gray-500 text-sm">
              {debounce ? "No results found for your search." : "Students will appear here once they enroll in this course."}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrolled On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Accessed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {progressList.map((progress) => (
                      <tr key={progress.userId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {progress.userName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {progress.userEmail}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700">
                                  {progress.progress.watchedLectures.length} / {progress.progress.totalLectures} lectures
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {progress.progress.progressPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${progress.progress.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {progress.progress.isCompleted ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">Completed</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-5 h-5 text-orange-500" />
                                <span className="text-sm text-orange-600 font-medium">In Progress</span>
                              </>
                            )}
                            {progress.progress.isCertificateIssued && (
                              <Award className="w-5 h-5 text-yellow-500 ml-2" title="Certificate Issued" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(progress.enrollmentDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {progress.progress.lastAccessedAt
                            ? formatDate(progress.progress.lastAccessedAt)
                            : "Never"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseProgress;

