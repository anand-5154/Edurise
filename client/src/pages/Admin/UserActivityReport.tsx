import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getUserActivityReport,
  type UserActivityReportType,
  type UserActivity,
} from "../../services/admin.services";
import Pagination from "../../components/Pagination";
import { errorToast } from "../../components/Toast";
import BeatLoader from "react-spinners/BeatLoader";
import { User, Search, TrendingUp, DollarSign, BookOpen, Award, Activity } from "lucide-react";
import type { AxiosError } from "axios";

const UserActivityReport: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [report, setReport] = useState<UserActivityReportType | null>(null);
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
        const res = await getUserActivityReport(
          currentPage,
          itemsPerPage,
          debounce
        );
        setReport(res.data);
      } catch (err: unknown) {
        const errorMessage =
          (err as AxiosError<{ message: string }>)?.response?.data?.message ||
          "Failed to load user activity report";
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
            User Activity Report
          </h1>
          <p className="text-gray-600">
            Comprehensive overview of user engagement and activity
          </p>
        </div>

        {/* Summary Statistics */}
        {report.summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {report.summary.totalUsers}
                  </p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-green-900">
                    {report.summary.activeUsers}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Blocked Users</p>
                  <p className="text-2xl font-bold text-red-900">
                    {report.summary.blockedUsers}
                  </p>
                </div>
                <User className="w-8 h-8 text-red-600" />
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
                <BookOpen className="w-8 h-8 text-purple-600" />
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
                  <p className="text-sm text-indigo-600 font-medium">Avg Courses/User</p>
                  <p className="text-2xl font-bold text-indigo-900">
                    {report.summary.averageCoursesPerUser.toFixed(1)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-600" />
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
              placeholder="Search by name, email, or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* User Activity Table */}
        {report.users.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No users found</p>
            <p className="text-gray-500 text-sm">
              {debounce
                ? "No results found for your search."
                : "No users have been registered yet."}
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
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spending
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.users.map((user: UserActivity) => (
                      <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.userName}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <User className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.userName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.userEmail}
                              </div>
                              <div className="text-xs text-gray-400">
                                Joined: {formatDate(user.accountCreatedAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center space-x-4">
                              <span>
                                <BookOpen className="w-4 h-4 inline mr-1" />
                                {user.activity.totalEnrollments} Enrolled
                              </span>
                              <span>
                                <Award className="w-4 h-4 inline mr-1" />
                                {user.activity.certificatesEarned} Certificates
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {user.activity.completedCourses} Completed,{" "}
                              {user.activity.inProgressCourses} In Progress
                            </div>
                            {user.activity.lastActivityDate && (
                              <div className="text-xs text-gray-400 mt-1">
                                Last active: {formatDate(user.activity.lastActivityDate)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {user.activity.averageProgress}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${user.activity.averageProgress}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{user.activity.totalSpent.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.activity.totalPurchases} purchases
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isBlocked
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
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

export default UserActivityReport;

