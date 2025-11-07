import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Star, Users, Clock, BookOpen } from "lucide-react";
import Navbar from "../../components/Navbar";
import type { Course } from "../../types/user.types";
import { getCoursesS, getCategory } from "../../services/user.services";
import { USER_ROUTES } from "../../constants/routes.constants";
import Pagination from "../../components/Pagination";

type DebounceState = { search: string; minPrice: number; maxPrice: number };

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const pageParam = Number.parseInt(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 2;
  const [total, setTotal] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [debounce, setDebounce] = useState<DebounceState>({ search: "", minPrice: 0, maxPrice: 10000 });
  const [sortBy, setSortBy] = useState<string>("title");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounce({ search: searchTerm, minPrice: priceRange[0], maxPrice: priceRange[1] });
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm, priceRange]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await getCoursesS(
          currentPage,
          itemsPerPage,
          debounce.search,
          selectedCategory,
          debounce.minPrice,
          debounce.maxPrice
        );
        const data = res?.data || {};
        setCourses(Array.isArray(data.courses) ? data.courses : []);
        setTotalPages(typeof data.totalPages === "number" ? data.totalPages : 1);
        setTotal(typeof data.total === "number" ? data.total : 0);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [currentPage, itemsPerPage, debounce, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategory();
        setCategories(Array.isArray(res?.data) ? (res.data as string[]) : []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const p = Number.parseInt(searchParams.get("page") || "1");
    setCurrentPage(Number.isNaN(p) ? 1 : p);
  }, [searchParams]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  const sortedCourses = useMemo(() => {
    const list = [...courses];
    if (sortBy === "title") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    else if (sortBy === "price") list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === "rating") list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return list;
  }, [courses, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
        <Navbar />
        <div className="pt-32 max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-800)]">
      <Navbar />
      <div className="pt-6 pb-8 max-w-6xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="h1 soft-in">Explore Courses</h1>
            <p className="text-[color:var(--text-600)] text-sm">{total} courses available</p>
          </div>
          <button onClick={() => setShowFilters((v) => !v)} className="sm:hidden btn btn-ghost mt-4 sm:mt-0">
            <Filter className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className={`md:w-1/3 ${showFilters ? "" : "hidden md:block"}`}>
            <div className="card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" /> Search
                  </span>
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  placeholder="Title or instructor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  className="w-full"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">
                  Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceRange[0]}
                    min={0}
                    max={priceRange[1]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPriceRange([Number(e.target.value), priceRange[1]])
                    }
                  />
                  <input
                    type="number"
                    value={priceRange[1]}
                    min={priceRange[0]}
                    max={100000}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPriceRange([priceRange[0], Number(e.target.value)])
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                  className="w-full"
                >
                  <option value="title">Title</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          <div className="md:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sortedCourses.map((course) => (
              <Link
                key={course._id}
                to={`${USER_ROUTES.COURSES}/${course._id}`}
                className="card p-5 hover:shadow-2 soft-in"
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover radius-md"
                  style={{ borderRadius: "12px" }}
                />
                <h3 className="mt-3 font-semibold text-[color:var(--text-900)] line-clamp-2">{course.title}</h3>
                <p className="mt-1 text-sm text-[color:var(--text-600)] line-clamp-2">{course.description}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-[color:var(--text-600)]">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4" /> {course.rating ?? "N/A"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-4 w-4" /> {course.enrolled ?? 0}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {course.duration ?? "—"}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-semibold">₹{course.price}</span>
                  <span className="badge">
                    <BookOpen className="h-3 w-3" /> {course.category || "Course"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default Courses;
