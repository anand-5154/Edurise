import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../services/apiService';
import { successToast, errorToast } from '../../components/Toast';
import BeatLoader from "react-spinners/BeatLoader";

interface Category {
  _id: string;
  name: string;
}

interface LectureInput {
  title: string;
  videoUrl: string;
  description: string;
}

interface ModuleInput {
  title: string;
  description: string;
  lectures: LectureInput[];
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
  modules?: ModuleInput[];
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
  const [modules, setModules] = useState<ModuleInput[]>([
    { title: '', description: '', lectures: [{ title: '', videoUrl: '', description: '' }] }
  ]);
  const [uploading, setUploading] = useState({ thumbnail: false, demoVideo: false, modules: [] as boolean[][] });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/users/categories');
        setCategories(response.data as Category[]);
      } catch (error) {
        errorToast('Failed to fetch categories');
      }
    };

    const fetchCourse = async () => {
      try {
        const response = await axiosInstance.get(`/instructors/courses/${courseId}`);
        const courseData = response.data as Course;
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
        setModules(courseData.modules && courseData.modules.length > 0 ? courseData.modules : [{ title: '', description: '', lectures: [{ title: '', videoUrl: '', description: '' }] }]);
      } catch (error: any) {
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Module handlers
  const handleModuleChange = (index: number, field: string, value: string) => {
    setModules(prev => prev.map((mod, i) => i === index ? { ...mod, [field]: value } : mod));
  };
  const addModule = () => setModules(prev => [...prev, { title: '', description: '', lectures: [{ title: '', videoUrl: '', description: '' }] }]);
  const removeModule = (index: number) => setModules(prev => prev.filter((_, i) => i !== index));

  // Lecture handlers for a module
  const handleLectureChange = (moduleIdx: number, lectureIdx: number, field: string, value: string) => {
    setModules(prev => prev.map((mod, i) =>
      i === moduleIdx
        ? { ...mod, lectures: mod.lectures.map((lec, j) => j === lectureIdx ? { ...lec, [field]: value } : lec) }
        : mod
    ));
  };
  const addLecture = (moduleIdx: number) => setModules(prev => prev.map((mod, i) =>
    i === moduleIdx ? { ...mod, lectures: [...mod.lectures, { title: '', videoUrl: '', description: '' }] } : mod
  ));
  const removeLecture = (moduleIdx: number, lectureIdx: number) => setModules(prev => prev.map((mod, i) =>
    i === moduleIdx ? { ...mod, lectures: mod.lectures.filter((_, j) => j !== lectureIdx) } : mod
  ));

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
    
    modules.forEach((mod, modIdx) => {
      if (!mod.title.trim()) newErrors[`moduleTitle${modIdx}`] = 'Module title is required';
      mod.lectures.forEach((lec, lecIdx) => {
        if (!lec.title.trim()) newErrors[`lectureTitle${modIdx}-${lecIdx}`] = 'Lecture title is required';
        if (!lec.videoUrl.trim()) newErrors[`lectureUrl${modIdx}-${lecIdx}`] = 'Lecture video URL is required';
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, thumbnail: true }));
    const url = await uploadMediaToServer(file);
    setUploading(prev => ({ ...prev, thumbnail: false }));
    if (url) setFormData(prev => ({ ...prev, thumbnail: url }));
  };
  const handleDemoVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, demoVideo: true }));
    const url = await uploadMediaToServer(file);
    setUploading(prev => ({ ...prev, demoVideo: false }));
    if (url) setFormData(prev => ({ ...prev, demoVideo: url }));
  };
  const handleModuleVideoChange = async (moduleIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => {
      const arr = [...prev.modules];
      arr[moduleIdx] = [...prev.modules[moduleIdx]]; // Deep copy
      return { ...prev, modules: arr };
    });
    const url = await uploadMediaToServer(file);
    setUploading(prev => {
      const arr = [...prev.modules];
      arr[moduleIdx] = [...prev.modules[moduleIdx]]; // Deep copy
      return { ...prev, modules: arr };
    });
    if (url) setModules(prev => prev.map((mod, i) =>
      i === moduleIdx ? { ...mod, lectures: mod.lectures.map((lec, j) => j === 0 ? { ...lec, videoUrl: url } : lec) } : mod
    ));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }
      
      const response = await axiosInstance.put(`/instructors/courses/${courseId}`, {
        ...formData,
        modules
      });
      
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Modules</label>
            {modules.map((mod, modIdx) => (
              <div key={modIdx} className="mb-4 p-4 border rounded bg-gray-50">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder={`Module ${modIdx + 1} Title`}
                    value={mod.title}
                    onChange={e => handleModuleChange(modIdx, 'title', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                  />
                  {errors[`moduleTitle${modIdx}`] && <p className="text-sm text-red-600">{errors[`moduleTitle${modIdx}`]}</p>}
                </div>
                <div className="mb-2">
                  <textarea
                    placeholder="Module Description"
                    value={mod.description}
                    onChange={e => handleModuleChange(modIdx, 'description', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                    rows={2}
                  />
                  {errors[`moduleDescription${modIdx}`] && <p className="text-sm text-red-600">{errors[`moduleDescription${modIdx}`]}</p>}
                </div>
                <div className="mb-2">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={e => handleModuleVideoChange(modIdx, e)}
                    className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                  />
                  {uploading.modules[modIdx] && <p className="text-sm text-gray-500">Uploading...</p>}
                  {mod.lectures[0]?.videoUrl && <video src={mod.lectures[0].videoUrl} controls className="mt-2 h-20 rounded" />}
                  {errors[`moduleUrl${modIdx}`] && <p className="text-sm text-red-600">{errors[`moduleUrl${modIdx}`]}</p>}
                </div>
                {modules.length > 1 && (
                  <button type="button" onClick={() => removeModule(modIdx)} className="text-red-500 text-xs">Remove Module</button>
                )}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lectures</label>
                  {mod.lectures.map((lec, lecIdx) => (
                    <div key={lecIdx} className="mb-4 p-4 border rounded bg-gray-100">
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder={`Lecture ${lecIdx + 1} Title`}
                          value={lec.title}
                          onChange={e => handleLectureChange(modIdx, lecIdx, 'title', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                        />
                        {errors[`lectureTitle${modIdx}-${lecIdx}`] && <p className="text-sm text-red-600">{errors[`lectureTitle${modIdx}-${lecIdx}`]}</p>}
                      </div>
                      <div className="mb-2">
                        <textarea
                          placeholder="Lecture Description"
                          value={lec.description}
                          onChange={e => handleLectureChange(modIdx, lecIdx, 'description', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                          rows={2}
                        />
                        {errors[`lectureDescription${modIdx}-${lecIdx}`] && <p className="text-sm text-red-600">{errors[`lectureDescription${modIdx}-${lecIdx}`]}</p>}
                      </div>
                      <div className="mb-2">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={e => handleLectureVideoChange(modIdx, lecIdx, e)}
                          className="block w-full border border-gray-300 rounded-md py-2 px-3 mb-1"
                        />
                        {uploading.modules[modIdx] && <p className="text-sm text-gray-500">Uploading...</p>}
                        {lec.videoUrl && <video src={lec.videoUrl} controls className="mt-2 h-20 rounded" />}
                        {errors[`lectureUrl${modIdx}-${lecIdx}`] && <p className="text-sm text-red-600">{errors[`lectureUrl${modIdx}-${lecIdx}`]}</p>}
                      </div>
                      {mod.lectures.length > 1 && (
                        <button type="button" onClick={() => removeLecture(modIdx, lecIdx)} className="text-red-500 text-xs">Remove Lecture</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addLecture(modIdx)} className="text-blue-600 text-sm font-medium">+ Add Lecture</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addModule} className="text-blue-600 text-sm font-medium">+ Add Module</button>
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