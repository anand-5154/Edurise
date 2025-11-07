import React, { useCallback, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, Users, Clock, BookOpen, User, X, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { loadRazorpayScript } from "../../utils/loadRazorpay";
import { errorToast, successToast } from "../../components/Toast";
import type { CourseViewType } from "../../types/user.types";
import {
  cancelOrderS,
  CreateOrderS,
  fetchProgress,
  getInstructor,
  getReviewsS,
  getSpecificCourseS,
  getUserCourseOrderS,
  postReviewS,
  RetryPaymentS,
  verifyResS,
} from "../../services/user.services";
import type { Review } from "../../types/review.types";
import { USER_ROUTES } from "../../constants/routes.constants";
import type { IInstructorProfile } from "../../types/instructor.types";
import Navbar from "../../components/Navbar";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseViewType | null>(null);
  const [openModules, setOpenModules] = useState<number[]>([]);
  const [openChapters, setOpenChapters] = useState<string[]>([]);
  const instructorId = course?.instructor?._id;
  const [instructor, setInstructor] = useState<IInstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState({ rating: 0, text: "" });
  const [isCompleted, setIsCompleted] = useState<boolean>();
  const [previousOrder, setPreviousOrder] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "curriculum" | "instructor" | "reviews">("overview");

  const toggleModule = (index: number) => {
    setOpenModules((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const toggleChapter = (moduleIndex: number, chapterIndex: number) => {
    const key = `${moduleIndex}-${chapterIndex}`;
    setOpenChapters((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  useEffect(() => {
    const fetchIsCourseCompleted = async () => {
      if (!courseId) return;
      const res = await fetchProgress(courseId);
      setIsCompleted(res.data);
    };
    fetchIsCourseCompleted();
  }, [courseId]);

  const handlePayment = async () => {
    if (!course?._id) return;
    
    // Validate Razorpay key is configured
    const razorpayKey = import.meta.env.VITE_RAZORPAY_ID;
    if (!razorpayKey) {
      errorToast("Razorpay configuration error: VITE_RAZORPAY_ID is missing. Please configure it in your .env file.");
      return;
    }
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      errorToast("Razorpay SDK failed to load.");
      return;
    }
    try {
      const { data: order } = await CreateOrderS(course._id);
      const options: any = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: course.title,
        description: course.description,
        order_id: order.razorpayOrderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await verifyResS({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          if (verifyRes.data.success) {
            successToast("Payment Successful! You are enrolled.");
            setIsEnrolled(true);
          } else {
            errorToast("Payment verification failed.");
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await cancelOrderS(order._id!);
              errorToast("Payment cancelled by user.");
              await fetchCourse();
            } catch {}
          },
        },
      };
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err: unknown) {
      // prefer server-provided message when available
      const message = (err as any)?.response?.data?.message || "Course is purchased or payment in progress";
      errorToast(message);
    }
  };

  const handleRetryPayment = async (orderId: string) => {
    if (!course) return;
    
    // Validate Razorpay key is configured
    const razorpayKey = import.meta.env.VITE_RAZORPAY_ID;
    if (!razorpayKey) {
      errorToast("Razorpay configuration error: VITE_RAZORPAY_ID is missing. Please configure it in your .env file.");
      return;
    }
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      errorToast("Razorpay SDK failed to load.");
      return;
    }
    try {
      const { data: order } = await RetryPaymentS(orderId);
      const options: any = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: course.title,
        description: course.description,
        order_id: order.razorpayOrderId,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyRes = await verifyResS({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.data.success) {
              successToast("Payment Successful! You are enrolled.");
              setIsEnrolled(true);
            } else {
              errorToast("Payment verification failed.");
            }
          } catch {
            errorToast("Something went wrong verifying payment.");
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await cancelOrderS(order._id);
              errorToast("Retry payment cancelled by user.");
              await fetchCourse();
            } catch {}
          },
        },
      };
      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || "Unable to retry payment. Please try again later.";
      errorToast(message);
    }
  };

  const fetchReviews = async () => {
    try {
      if (!courseId) return;
      const res = await getReviewsS(courseId);
      setReviews(res.data.reviews || []);
    } catch {}
  };

  const handleSubmitReview = async () => {
    if (!userReview.rating || !userReview.text) return errorToast("Please fill in the fields");
    if (!courseId) return;
    try {
      await postReviewS(courseId, userReview);
      successToast("Review Submitted");
      setUserReview({ rating: 0, text: "" });
      fetchReviews();
    } catch {
      errorToast("Already reviewed the course");
    }
  };

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await getSpecificCourseS(courseId);
      setCourse(res.data.course);
      setIsEnrolled(res.data.isEnrolled);
  const orderRes = await getUserCourseOrderS(courseId);
  const order = orderRes.data.order;
  // if there's an existing order in 'failed' or 'created' state, surface it so user can retry
  if (orderRes.data.hasOrder && (order?.status === "failed" || order?.status === "created")) setPreviousOrder(order._id);
      const resReviews = await getReviewsS(courseId);
      setReviews(resReviews.data.reviews || []);
    } catch {
      setError("Failed to load course details");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const fetchInstructor = async () => {
    try {
      if (!instructorId) return;
      const res = await getInstructor(instructorId);
      setInstructor(res.data);
    } catch {}
  };

  const totalLessons =
    course?.modules?.reduce(
      (acc, module) =>
        acc +
        (module.chapters?.reduce((chapterAcc, chapter) => chapterAcc + (chapter.lessons?.length || 0), 0) || 0),
      0
    ) ?? 0;

  const totalDuration =
    course?.modules?.reduce(
      (moduleTotal, module) =>
        moduleTotal +
        (module.chapters?.reduce(
          (chapterTotal, chapter) =>
            chapterTotal +
            (chapter.lessons?.reduce((lecSum, lecture) => {
              const minutes = parseInt((lecture as any).duration) || 0;
              return lecSum + minutes;
            }, 0) || 0),
          0
        ) || 0),
      0
    ) || 0;

  const firstLectureVideo =
    course?.modules?.[0]?.chapters?.[0]?.lessons?.find((lec) => lec.type === "video")?.url ||
    course?.modules?.[0]?.chapters?.[0]?.lessons?.[0]?.url;

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-800">
        <Navbar />
        <div className="animate-pulse">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-2 text-lg font-bold text-slate-800">Course not found</h3>
          <p className="mt-1 text-sm text-slate-600">{error || "The course you're looking for doesn't exist."}</p>
          <Link
            to={USER_ROUTES.COURSES}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:scale-105 transition-all duration-300"
          >
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const enrolledCount: number = (() => {
    const v = (course as any).enrolled ?? (course as any).studentsCount ?? 0;
    return typeof v === "number" ? v : parseInt(String(v)) || 0;
  })();

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Header Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {course.category && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                    {course.category}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                {course.title}
              </h1>
              <p className="text-slate-700 mb-6">{course.description}</p>
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  <span className="font-semibold text-slate-900">{course.rating ?? "N/A"}</span>
                  <span className="ml-1">rating</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-slate-700" />
                  <span>{enrolledCount} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-slate-700" />
                  <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m total</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1 text-slate-700" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>
            </div>

            {/* Video Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
              {firstLectureVideo ? (
                <video controls className="w-full h-56 sm:h-72 object-cover" src={firstLectureVideo} />
              ) : (
                <p className="p-4 text-center text-slate-600">No lecture video available</p>
              )}
            </div>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6 text-slate-700">
                  {["overview", "curriculum", "instructor", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as typeof activeTab)}
                      className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                        activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent hover:text-slate-900"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-6">
                {/* Overview */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {course.description && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-slate-900">About this course</h3>
                        <p className="text-slate-700 leading-relaxed">{course.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Curriculum */}
                {activeTab === "curriculum" && (
                  <div>
                    <h3 className="text-lg text-slate-900 font-semibold mb-6">Course Curriculum</h3>
                    {course.modules?.map((module, moduleIndex) => (
                      <div key={module._id} className="border rounded-lg mb-4 border-gray-200 bg-white">
                        <button
                          onClick={() => toggleModule(moduleIndex)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <Layers className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-semibold text-slate-900 text-lg">
                                Module {moduleIndex + 1}: {module.title}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">{module.description}</p>
                            </div>
                          </div>
                          {openModules.includes(moduleIndex) ? (
                            <ChevronDown className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          )}
                        </button>

                        {openModules.includes(moduleIndex) && (
                          <div className="px-4 pb-4 pt-2">
                            {module.chapters?.map((chapter, chapterIndex) => (
                              <div key={chapter._id} className="border rounded-lg mb-2 border-gray-200 bg-white">
                                <button
                                  onClick={() => toggleChapter(moduleIndex, chapterIndex)}
                                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                                >
                                  <div>
                                    <h5 className="font-medium text-slate-900">
                                      Chapter {chapterIndex + 1}: {chapter.title}
                                    </h5>
                                    <p className="text-xs text-slate-600 mt-1">{chapter.description}</p>
                                  </div>
                                  {openChapters.includes(`${moduleIndex}-${chapterIndex}`) ? (
                                    <ChevronDown className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                  )}
                                </button>

                                {openChapters.includes(`${moduleIndex}-${chapterIndex}`) && (
                                  <ul className="px-6 pb-4 space-y-2">
                                    {chapter.lessons.map((lecture) => (
                                      <li
                                        key={lecture._id}
                                        className="text-slate-700 text-sm flex flex-col bg-gray-50 p-3 rounded border border-gray-200"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                                            <span className="font-medium text-slate-900">{lecture.title}</span>
                                          </div>
                                          <span className="text-xs text-slate-600 ml-2">{lecture.duration} min</span>
                                        </div>
                                        <p className="ml-6 text-slate-600 text-xs mt-1">{lecture.description}</p>
                                        <span className="ml-6 text-xs text-blue-700 mt-1">Type: {lecture.type}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Instructor */}
                {activeTab === "instructor" && (
                  <div>
                    <h3 className="text-lg text-slate-900 font-semibold mb-6">About the Instructor</h3>
                    {course.instructor ? (
                      <div className="flex items-start space-x-4">
                        <button
                          onClick={() => {
                            if (course.instructor?._id) {
                              fetchInstructor();
                              setIsInstructorModalOpen(true);
                            }
                          }}
                          className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center hover:scale-105 transition border border-blue-100"
                        >
                          <User className="h-8 w-8 text-blue-600" />
                        </button>
                        <div>
                          <h4 className="font-semibold text-slate-900">{course.instructor?.name}</h4>
                          <p className="text-slate-700 mt-2">Experienced instructor with expertise in {course.category || "this field"}.</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-600">Instructor information not available.</p>
                    )}
                  </div>
                )}

                {/* Reviews */}
                {activeTab === "reviews" && (
                  <div>
                    <h3 className="text-lg text-slate-900 font-semibold mb-6">Ratings & Reviews</h3>
                    {isCompleted && (
                      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-slate-900 font-semibold mb-4">Write a Review</h4>
                        <div className="mb-4">
                          <label className="block mb-2 text-slate-900 font-medium">Your Rating:</label>
                          <div className="flex space-x-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={`rating-${star}`}
                                onClick={() => setUserReview({ ...userReview, rating: star })}
                                className={`h-6 w-6 cursor-pointer ${
                                  userReview.rating >= star ? "text-yellow-500 fill-current" : "text-slate-400 hover:text-yellow-400"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <textarea
                            placeholder="Write your review..."
                            value={userReview.text}
                            onChange={(e) => setUserReview({ ...userReview, text: e.target.value })}
                            className="w-full p-3 border border-gray-300 bg-white text-slate-900 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                          />
                        </div>
                        <button
                          onClick={handleSubmitReview}
                          className="bg-blue-600 text-white py-2 px-6 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200"
                        >
                          Submit Review
                        </button>
                      </div>
                    )}
                    <div className="space-y-4">
                      {reviews.length > 0 ? (
                        reviews
                          .filter((review) => review.isHidden == false)
                          .map((review) => (
                            <div key={review._id} className="border-t border-gray-200 pt-4">
                              <div className="flex items-center mb-2">
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${review.rating >= star ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                                <span className="ml-2 text-sm text-slate-700">By {review.user?.name || "Anonymous"}</span>
                              </div>
                              <p className="text-slate-800 leading-relaxed">{review.text}</p>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8">
                          <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-slate-600">No reviews yet.</p>
                          <p className="text-slate-500 text-sm mt-2">Be the first to review this course!</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="text-center text-slate-900 mb-6">
                <div className="text-3xl font-bold text-slate-900 mb-2">₹{course.price}</div>
              </div>

              {isEnrolled ? (
                <button
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-full font-semibold cursor-pointer mb-4 hover:bg-green-700 transition-all duration-200"
                  onClick={() => navigate(USER_ROUTES.COURSE_VIEW(course._id))}
                >
                  Continue to Course
                </button>
              ) : previousOrder ? (
                <button
                  onClick={() => handleRetryPayment(previousOrder)}
                  className="w-full bg-amber-500 text-white py-3 px-4 rounded-full font-semibold hover:bg-amber-600 transition-all duration-200 mb-4"
                >
                  Retry Payment
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-full font-semibold hover:bg-blue-700 transition-all duration-200 mb-4"
                >
                  Enroll Now
                </button>
              )}

              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">Total Duration:</span>
                  <span className="font-medium text-slate-900">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Lessons:</span>
                  <span className="font-medium text-slate-900">{totalLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">Access:</span>
                  <span className="font-medium text-slate-900">Lifetime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Modal */}
        {isInstructorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-11/12 max-w-md p-6 relative border border-gray-200">
              <button
                onClick={() => setIsInstructorModalOpen(false)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                {instructor?.profilePicture ? (
                  <img src={instructor.profilePicture} alt="Instructor Profile" className="w-24 h-24 rounded-full object-cover mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-slate-500 mb-4">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <h2 className="text-2xl font-bold text-slate-900">{instructor?.name}</h2>
                <p className="text-slate-500 text-sm mb-1">@{instructor?.username}</p>
                <p className="text-slate-800 font-medium mb-2">{instructor?.title}</p>
                <div className="text-sm text-slate-700 space-y-1">
                  <p>🎓 <span className="font-semibold">Education:</span> {instructor?.education}</p>
                  <p>🧑‍💼 <span className="font-semibold">Experience:</span> {instructor?.yearsOfExperience} years</p>
                  <p>📞 <span className="font-semibold">Phone:</span> {instructor?.phone}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
