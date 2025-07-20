import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import { successToast, errorToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";

interface Category {
  _id: string;
  name: string;
}

const CreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    level: 'beginner',
    duration: '',
    thumbnail: '',
    demoVideo: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lectures, setLectures] = useState([{ title: '', videoUrl: '', description: '' }]);
  const [uploading, setUploading] = useState({ thumbnail: false, demoVideo: false, lectures: [] as boolean[] });

  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/users/categories');
        setCategories(response.data);
      } catch (error) {
        errorToast('Failed to fetch categories');
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

  const handleLectureChange = (index: number, field: string, value: string) => {
    setLectures(prev => prev.map((lec, i) => i === index ? { ...lec, [field]: value } : lec));
  };

  const addLecture = () => setLectures(prev => [...prev, { title: '', videoUrl: '', description: '' }]);
  const removeLecture = (index: number) => setLectures(prev => prev.filter((_, i) => i !== index));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price.trim()) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Price must be a positive number";
    }
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.duration.trim()) {
      newErrors.duration = "Duration is required";
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = "Duration must be a positive number";
    }
    if (!formData.thumbnail.trim()) newErrors.thumbnail = "Thumbnail URL is required";
    if (!formData.demoVideo.trim()) newErrors.demoVideo = "Demo video URL is required";
    
    lectures.forEach((lec, idx) => {
      if (!lec.title.trim()) newErrors[`lectureTitle${idx}`] = 'Lecture title is required';
      if (!lec.videoUrl.trim()) newErrors[`lectureUrl${idx}`] = 'Lecture video URL is required';
      if (!lec.description.trim()) newErrors[`lectureDescription${idx}`] = 'Lecture description is required';
    });
    
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
      
      const response = await axiosInstance.post("/instructors/courses", {
        ...formData,
        price: Number(formData.price),
        duration: Number(formData.duration),
        lectures
      });
      
      if (response && response.status === 201) {
        successToast("Course created successfully");
        navigate('/instructors/dashboard');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create course. Please try again.';
      errorToast(errorMessage);
      console.error("Course creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadMediaToServer = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('media', file);
    try {
      const response = await axiosInstance.post('/instructors/upload-course-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.url;
    } catch (err) {
      errorToast('Failed to upload file');
      return null;
    }
  };

  // Thumbnail upload handler
  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, thumbnail: true }));
    const url = await uploadMediaToServer(file);
    setUploading(prev => ({ ...prev, thumbnail: false }));
    if (url) setFormData(prev => ({ ...prev, thumbnail: url }));
  };

  // Demo video upload handler
  const handleDemoVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, demoVideo: true }));
    const url = await uploadMediaToServer(file);
    setUploading(prev => ({ ...prev, demoVideo: false }));
    if (url) setFormData(prev => ({ ...prev, demoVideo: url }));
  };

  // Lecture video upload handler
  const handleLectureVideoChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => {
      const arr = [...prev.lectures];
      arr[index] = true;
      return { ...prev, lectures: arr };
    });
    const url = await uploadMediaToServer(file);
    setUploading(prev => {
      const arr = [...prev.lectures];
      arr[index] = false;
      return { ...prev, lectures: arr };
    });
    if (url) setLectures(prev => prev.map((lec, i) => i === index ? { ...lec, videoUrl: url } : lec));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Create New Course</h2>
          <p className="mt-2 text-sm text-gray-600">Fill in the details to create your course</p>
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
              Thumbnail
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {uploading.thumbnail && <p className="text-sm text-gray-500">Uploading...</p>}
            {formData.thumbnail && <img src={formData.thumbnail} alt="Thumbnail preview" className="mt-2 h-24 rounded" />}
            {errors.thumbnail && <p className="mt-1 text-sm text-red-600">{errors.thumbnail}</p>}
          </div>

          <div>
            <label htmlFor="demoVideo" className="block text-sm font-medium text-gray-700">
              Demo Video
            </label>
            <input
              id="demoVideo"
              name="demoVideo"
              type="file"
              accept="video/*"
              onChange={handleDemoVideoChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {uploading.demoVideo && <p className="text-sm text-gray-500">Uploading...</p>}
            {formData.demoVideo && <video src={formData.demoVideo} controls className="mt-2 h-24 rounded" />}
            {errors.demoVideo && <p className="mt-1 text-sm text-red-600">{errors.demoVideo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lectures</label>
            {lectures.map((lec, idx) => (
              <div key={idx} className="mb-4 p-4 border rounded bg-gray-50">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder={`Lecture ${idx + 1} Title`}
                    value={lec.title}
                    onChange={e => handleLectureChange(idx, 'title', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                  />
                  {errors[`lectureTitle${idx}`] && <p className="text-sm text-red-600">{errors[`lectureTitle${idx}`]}</p>}
                </div>
                <div className="mb-2">
                  <textarea
                    placeholder="Lecture Description"
                    value={lec.description}
                    onChange={e => handleLectureChange(idx, 'description', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                    rows={2}
                  />
                  {errors[`lectureDescription${idx}`] && <p className="text-sm text-red-600">{errors[`lectureDescription${idx}`]}</p>}
                </div>
                <div className="mb-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => handleLectureVideoChange(idx, e)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                  />
                  {uploading.lectures[idx] && <p className="text-sm text-gray-500">Uploading...</p>}
                  {lec.videoUrl && <video src={lec.videoUrl} controls className="mt-2 h-20 rounded" />}
                  {errors[`lectureUrl${idx}`] && <p className="text-sm text-red-600">{errors[`lectureUrl${idx}`]}</p>}
                </div>
                {lectures.length > 1 && (
                  <button type="button" onClick={() => removeLecture(idx)} className="text-red-500 text-xs">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLecture} className="text-blue-600 text-sm font-medium">+ Add Lecture</button>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Course..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse; 