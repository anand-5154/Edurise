import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import { errorToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";
import { Search, Filter, ChevronDown } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

interface Category {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  instructor: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface CoursesResponse {
  courses: Course[];
  total: number;
  totalPages: number;
  currentPage: number;
}

const ITEMS_PER_PAGE = 9;

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchCourses();
  }, [currentPage, sortBy, sortOrder, debouncedSearchTerm, category, level, minPrice, maxPrice]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get<Category[]>('/users/categories');
      setCategories(response.data);
    } catch (error) {
      errorToast('Failed to fetch categories');
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const paramsObj: Record<string, string> = {
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        sort: sortBy,
        order: sortOrder,
        category,
        level,
      };
      if (debouncedSearchTerm) paramsObj.search = debouncedSearchTerm;
      if (minPrice) paramsObj.minPrice = minPrice;
      if (maxPrice) paramsObj.maxPrice = maxPrice;
      const params = new URLSearchParams(paramsObj);

      const response = await axiosInstance.get<CoursesResponse>(`/users/courses?${params}`);
      setCourses(response.data.courses);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      errorToast('Failed to fetch courses');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-20 flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto flex-1 px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Available Courses</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="md:w-72 w-full bg-white rounded-xl shadow-lg p-6 mb-6 md:mb-0 flex-shrink-0 border border-gray-200">
            <form onSubmit={handleSearch} className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Level */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-purple-600 text-white font-semibold py-2 rounded-md hover:bg-purple-700 transition">Apply Filters</button>
            </form>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Sort Section */}
            <div className="flex justify-end mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <button
                  onClick={() => handleSort('price')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortBy === 'price'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('createdAt')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortBy === 'createdAt'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Latest {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.length === 0 ? (
                <div className="col-span-3 text-center text-gray-500 py-12 text-lg">No courses found.</div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() => handleCourseClick(course._id)}
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative h-48">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {course.level}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-600">${course.price}</span>
                        <span className="text-sm text-gray-500">{course.duration}h</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        By {course.instructor.name}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Courses; 