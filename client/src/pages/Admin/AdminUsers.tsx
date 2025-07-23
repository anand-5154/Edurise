import {useState,useEffect} from 'react'
import axiosInstance from '../../services/apiService'
import BeatLoader from "react-spinners/BeatLoader"
import { Search, ChevronLeft, ChevronRight, Lock, LockOpen, Eye } from 'lucide-react'
import { successToast, errorToast } from '../../components/Toast'

interface User{
  _id: string,
  name: string,
  username: string,
  email: string,
  phone: string,
  role: "user",
  blocked: boolean,
  createdAt: Date,
  updatedAt: Date
}

interface UsersResponse {
  users: User[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 10

const AdminUsers = () => {
  const [loading,setLoading]=useState(true)
  const [users,setUsers]=useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalPages, setTotalPages] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(()=>{
    fetchUsers()
  },[currentPage, searchTerm])

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        search: searchTerm,
      })

      const response = await axiosInstance.get<UsersResponse>(`/admin/users?${params}`)
      setUsers(response.data.users)
      setTotalPages(response.data.totalPages)
      setTotalUsers(response.data.total)
    } catch (err) {
      console.error(err)
      errorToast('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleFilter = () => {
    setCurrentPage(1)
  }

  const handleBlockUser = async (userId: string) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/block`)
      successToast('User blocked successfully')
      fetchUsers()
    } catch (err) {
      errorToast('Failed to block user')
    }
  }

  const handleUnblockUser = async (userId: string) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/unblock`)
      successToast('User unblocked successfully')
      fetchUsers()
    } catch (err) {
      errorToast('Failed to unblock user')
    }
  }

  const handleViewDetails = async (userId: string) => {
    setSelectedUserId(userId)
    setDetailsLoading(true)
    setShowDetailsModal(true)
    try {
      const res = await axiosInstance.get(`/admin/users/${userId}/details`)
      setUserDetails(res.data)
    } catch (err) {
      errorToast('Failed to fetch user details')
      setUserDetails(null)
    } finally {
      setDetailsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#2563eb" size={30} />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
            </div>
          </form>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.blocked 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => user.blocked ? handleUnblockUser(user._id) : handleBlockUser(user._id)}
                        className={`transition-colors ${
                          user.blocked 
                            ? 'text-red-600 hover:text-red-800'
                            : 'text-green-600 hover:text-green-800'
                        }`}
                        title={user.blocked ? 'Unblock User' : 'Block User'}
                      >
                        {user.blocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <LockOpen className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleViewDetails(user._id)}
                        className="ml-3 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)} of {totalUsers} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-end pointer-events-none">
          <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-gray-200 p-6 relative pointer-events-auto animate-slide-in-right">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowDetailsModal(false)}
            >
              <span className="text-2xl">&times;</span>
            </button>
            {detailsLoading ? (
              <div className="flex justify-center items-center h-40">
                <BeatLoader color="#2563eb" size={20} />
              </div>
            ) : userDetails ? (
              <div>
                <h2 className="text-xl font-bold mb-2">{userDetails.user.name}</h2>
                <p className="text-gray-600 mb-2">Email: {userDetails.user.email}</p>
                <p className="text-gray-600 mb-2">Phone: {userDetails.user.phone || 'N/A'}</p>
                <p className="text-gray-600 mb-4">Role: {userDetails.user.role}</p>
                <h3 className="text-lg font-semibold mb-2">Enrolled Courses</h3>
                {userDetails.courses.length === 0 ? (
                  <p className="text-gray-500">No enrolled courses.</p>
                ) : (
                  <ul className="space-y-2">
                    {userDetails.courses.map((course: any) => (
                      <li key={course.id} className="border rounded p-3">
                        <div className="font-medium">{course.title}</div>
                        {course.modules && course.modules.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {course.modules.map((mod: any) => (
                              <li key={mod._id}>
                                <div className="flex items-center">
                                  <span className="font-semibold">{mod.title}:</span>
                                  {mod.lectures.every((lec: any) => course.lecturesCompleted.includes(lec._id)) ? (
                                    <span className="ml-2 text-green-600">✔️ Completed</span>
                                  ) : (
                                    <span className="ml-2 text-gray-400">In Progress</span>
                                  )}
                                </div>
                                <ul className="ml-4 mt-1">
                                  {mod.lectures.map((lec: any) => (
                                    <li key={lec._id} className="flex items-center text-sm">
                                      <span>{lec.title}:</span>
                                      {course.lecturesCompleted.includes(lec._id) ? (
                                        <span className="ml-2 text-green-600">✔️</span>
                                      ) : (
                                        <span className="ml-2 text-gray-400">❌</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-gray-500 mt-1">No modules found.</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">No details available.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers

