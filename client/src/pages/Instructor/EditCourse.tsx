import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import { successToast, errorToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";

interface Category {
  _id: string;
  name: string;
}

interface Course {
  title: string;
  description: string;
  price: number;
  category: string;
  level: string;
  duration: number;
  thumbnail: string;
  demoVideo: string;
}

const EditCourse: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<Course>({
    title: '',
    description: '',
    price: 0,
    category: '',
    level: 'beginner',
    duration: 0,
    thumbnail: '',
    demoVideo: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/users/categories');
        console.log('Categories response:', response.data);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        errorToast('Failed to fetch categories');
      }
    };

    const fetchCourse = async () => {
      try {
        console.log('Fetching course with ID:', courseId);
        const response = await axiosInstance.get(`/instructors/courses/${courseId}`);
        console.log('Course response:', response.data);
        const courseData = response.data;
        setFormData({
          title: courseData.title || '',
          description: courseData.description || '',
          price: courseData.price || 0,
          category: courseData.category || '',
          level: courseData.level || 'beginner',
          duration: courseData.duration || 0,
          thumbnail: courseData.thumbnail || '',
          demoVideo: courseData.demoVideo || ''
        });
      } catch (error: any) {
        console.error('Error fetching course:', error.response || error);
        errorToast(error.response?.data?.message || 'Failed to fetch course details');
        navigate('/instructors/courses');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategories();
    fetchCourse();
  }, [courseId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user makes changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || formData.price < 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "Duration must be a positive number";
    }
    if (!formData.thumbnail.trim()) newErrors.thumbnail = "Thumbnail URL is required";
    if (!formData.demoVideo.trim()) newErrors.demoVideo = "Demo video URL is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }
      
      const response = await axiosInstance.put(`/instructors/courses/${courseId}`, formData);
      
      if (response && response.status === 200) {
        successToast("Course updated successfully");
        navigate('/instructors/courses');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update course. Please try again.';
      errorToast(errorMessage);
      console.error("Course update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-screen">
        <BeatLoader color="#7e22ce" size={30} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Edit Course</h2>
          <p className="mt-2 text-sm text-gray-600">Update your course details</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Course Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Introduction to Web Development"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Course Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe what students will learn in this course..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price (USD)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="99.99"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration (hours)
              </label>
              <input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="10"
              />
              {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
              Thumbnail URL
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="text"
              value={formData.thumbnail}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://example.com/thumbnail.jpg"
            />
            {errors.thumbnail && <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>}
          </div>

          <div>
            <label htmlFor="demoVideo" className="block text-sm font-medium text-gray-700">
              Demo Video URL
            </label>
            <input
              id="demoVideo"
              name="demoVideo"
              type="url"
              value={formData.demoVideo}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://res.cloudinary.com/your-cloud/video/upload/your-video"
            />
            {errors.demoVideo && <p className="mt-1 text-sm text-red-600">{errors.demoVideo}</p>}
            <p className="mt-1 text-sm text-gray-500">Upload your demo video to Cloudinary and paste the URL here</p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/instructors/courses')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <BeatLoader color="#ffffff" size={8} />
              ) : (
                'Update Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse; 