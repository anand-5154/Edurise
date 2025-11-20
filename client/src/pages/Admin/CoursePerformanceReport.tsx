import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCoursePerformanceReport,
  type CoursePerformanceReportType,
  type CoursePerformance,
} from "../../services/admin.services";
import Pagination from "../../components/Pagination";
import { errorToast } from "../../components/Toast";
import BeatLoader from "react-spinners/BeatLoader";
import {
  BookOpen,
  Search,
  TrendingUp,
  DollarSign,
  Star,
  Users,
  Award,
  BarChart3,
} from "lucide-react";
import type { AxiosError } from "axios";

const CoursePerformanceReport: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [report, setReport] = useState<CoursePerformanceReportType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debounce, setDebounce] = useState<string>("");
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const pageParam = parseInt(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState<number>(pageParam);

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
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCoursePerformanceReport(
          currentPage,
          itemsPerPage,
          debounce
        );
        setReport(res.data);
      } catch (err: unknown) {
        const errorMessage =
          (err as AxiosError<{ message: string }>)?.response?.data?.message ||
          "Failed to load course performance report";
        setError(errorMessage);
        errorToast(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [currentPage, itemsPerPage, debounce]);

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

  if (loading && !report) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Performance Report
          </h1>
          <p className="text-gray-600">
            Comprehensive overview of course performance and engagement metrics
          </p>
        </div>

        {/* Summary Statistics */}
        {report.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {report.summary.totalCourses}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Courses</p>
                  <p className="text-2xl font-bold text-green-900">
                    {report.summary.activeCourses}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Total Enrollments</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {report.summary.totalEnrollments}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    ₹{report.summary.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Avg Completion</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {report.summary.averageCompletionRate}%
                  </p>
                </div>
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Avg Rating</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {report.summary.averageRating.toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by course title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Course Performance Table */}
        {report.courses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No courses found</p>
            <p className="text-gray-500 text-sm">
              {debounce
                ? "No results found for your search."
                : "No courses have been created yet."}
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
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.courses.map((course: CoursePerformance) => (
                      <tr key={course.courseId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {course.thumbnail && (
                              <img
                                src={course.thumbnail}
                                alt={course.courseTitle}
                                className="h-16 w-24 object-cover rounded mr-4"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {course.courseTitle}
                              </div>
                              <div className="text-sm text-gray-500">
                                {course.instructorName}
                              </div>
                              <div className="text-xs text-gray-400">
                                {course.category} • Created: {formatDate(course.createdAt)}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Price: ₹{course.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center space-x-2 mb-1">
                              <BarChart3 className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900 font-medium">
                                {course.performance.completionRate}% Completion
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.performance.completionRate}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-600">
                              Avg Progress: {course.performance.averageProgress}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">
                                {course.performance.totalEnrollments}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {course.performance.completedEnrollments} Completed
                            </div>
                            <div className="text-xs text-gray-500">
                              {course.performance.inProgressEnrollments} In Progress
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{course.performance.totalRevenue.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {course.performance.totalEnrollments > 0
                              ? `₹${Math.round(
                                  course.performance.totalRevenue /
                                    course.performance.totalEnrollments
                                ).toLocaleString()} avg`
                              : "No enrollments"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {course.performance.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {course.performance.totalReviews} reviews
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={report.totalPages}
                onPageChange={handlePageChange}
                limit={itemsPerPage}
                onLimitChange={limit => {
                  setItemsPerPage(limit);
                  setCurrentPage(1);
                  setSearchParams({ page: "1" });
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CoursePerformanceReport;

