import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getProgressS,
  getSpecificCourseS,
  markLectureWatchedS,
} from "../../services/user.services";
import type { CourseViewType, Lecture } from "../../types/user.types";
import {
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Award,
  Clock,
  FileText,
  Layers,
} from "lucide-react";
import ReportForm from "../../components/ReportForm";
import Navbar from "../../components/Navbar";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { createApi } from "../../services/newApiService";

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseViewType | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lecture | null>(null);
  const [liveSession, setLiveSession] = useState<{
    sessionId: string;
    isLive: boolean;
  } | null>(null);

  const navigate = useNavigate();
  const [watchedLectures, setWatchedLectures] = useState<string[]>([]);
  const [isCertificateIssued, setIsCertificateIssued] = useState<boolean>(false);
  const [openModule, setOpenModule] = useState<number | null>(null);
  const [openChapter, setOpenChapter] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      const res = await getSpecificCourseS(courseId);
      const courseData = res.data.course;
      setCourse(courseData);

      const firstLesson = courseData.modules?.[0]?.chapters?.[0]?.lessons?.[0];
      if (firstLesson) setSelectedLesson(firstLesson);

      const progressRes = await getProgressS(courseId);
      setWatchedLectures(
        Array.isArray(progressRes.data.watchedLectures)
          ? progressRes.data.watchedLectures
          : []
      );
      setIsCertificateIssued(progressRes.data.isCertificateIssued || false);
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const fetchLive = async () => {
      if (!courseId) return;
      const api = createApi("user");
      try {
        const { data } = await api.get(`/users/course/live/${courseId}`);
        if (data && data.isLive) {
          setLiveSession({ sessionId: data._id, isLive: data.isLive });
        } else {
          setLiveSession(null);
        }
      } catch (err) {
        console.log("No live session", err);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 15000);
    return () => clearInterval(interval);
  }, [courseId]);

  if (!courseId) return null;

  const handleTimeUpdate = async (
    e: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = e.currentTarget;
    const percent = (video.currentTime / video.duration) * 100;

    if (
      percent > 90 &&
      selectedLesson &&
      !watchedLectures.includes(selectedLesson._id)
    ) {
      try {
        await markLectureWatchedS(courseId, selectedLesson._id);
        setWatchedLectures((prev) => [...prev, selectedLesson._id]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-gray-900">
        <BookOpen className="w-16 h-16 mb-4 animate-bounce text-blue-600" />
        <p className="mt-2 text-xl font-semibold text-gray-700">
          Loading your course...
        </p>
      </div>
    );
  }

  const allLessons = course.modules?.flatMap((m) => 
    m.chapters.flatMap((c) => c.lessons)
  ) || [];
  const progressPercent = Math.floor(
    (watchedLectures.length / (allLessons.length || 1)) * 100
  );

  return (
    <div className="min-h-full bg-white text-gray-900 relative overflow-hidden">
      <Navbar />

      <div className="flex h-[calc(100vh-5rem)]">
        <aside className="w-96 bg-gray-50 border-r border-gray-200 overflow-y-auto shadow-lg">
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {course.title}
              </h2>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Progress
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                <span className="flex items-center">
                  <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" />
                  {watchedLectures.length} of {allLessons.length} completed
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {course.modules?.map((module, moduleIndex) => (
              <div
                key={module._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all duration-300 shadow-sm"
              >
                <button
                  onClick={() =>
                    setOpenModule(
                      openModule === moduleIndex ? null : moduleIndex
                    )
                  }
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 block">
                        Module {moduleIndex + 1}: {module.title}
                      </span>
                      {module.description && (
                        <span className="text-xs text-gray-600 line-clamp-1">
                          {module.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {openModule === moduleIndex ? (
                    <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </button>

                {openModule === moduleIndex && (
                  <div className="px-3 pb-3 space-y-2 bg-gray-50">
                    {module.chapters.map((chapter, chapterIndex) => (
                      <div
                        key={chapter._id}
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() =>
                            setOpenChapter(
                              openChapter === chapter._id ? null : chapter._id
                            )
                          }
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                              {chapterIndex + 1}
                            </div>
                            <span className="font-semibold text-sm text-gray-900 line-clamp-1">
                              {chapter.title}
                            </span>
                          </div>
                          {openChapter === chapter._id ? (
                            <ChevronDown className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {openChapter === chapter._id && (
                          <div className="px-2 pb-2 space-y-1 bg-gray-50">
                            {chapter.lessons.map((lesson, lessonIndex) => {
                              const isCompleted = watchedLectures.includes(lesson._id);
                              const isActive = selectedLesson?._id === lesson._id;

                              return (
                                <div
                                  key={lesson._id}
                                  onClick={() => setSelectedLesson(lesson)}
                                  className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                                    isActive
                                      ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg scale-[1.02] text-white"
                                      : "hover:bg-gray-100 hover:translate-x-1"
                                  }`}
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <span
                                      className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded ${
                                        isActive
                                          ? "bg-white/20 text-white"
                                          : "bg-gray-200 text-gray-700"
                                      }`}
                                    >
                                      {lessonIndex + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <p
                                        className={`text-sm font-medium line-clamp-1 ${
                                          isActive ? "text-white" : "text-gray-900"
                                        }`}
                                      >
                                        {lesson.title}
                                      </p>
                                      {lesson.duration && (
                                        <p
                                          className={`text-xs mt-0.5 flex items-center ${
                                            isActive ? "text-blue-100" : "text-gray-600"
                                          }`}
                                        >
                                          <Clock className="w-3 h-3 mr-1" />
                                          {lesson.duration}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                    {lesson.type === "pdf" && (
                                      <FileText
                                        className={`w-4 h-4 ${
                                          isActive ? "text-white" : "text-blue-600"
                                        }`}
                                      />
                                    )}
                                    {isCompleted && (
                                      <CheckCircle
                                        className={`w-5 h-5 ${
                                          isActive ? "text-white" : "text-green-600"
                                        }`}
                                      />
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 mt-4">
            <ReportForm
              type="report"
              subject={`Issue with Course: ${course.title}`}
              targetId={course._id}
            />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-6xl mx-auto p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-4xl font-bold mb-3 text-gray-900">
                    {selectedLesson?.title || "Select a lesson to begin"}
                  </h3>
                  {selectedLesson?.duration && (
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-1.5" />
                        Duration: {selectedLesson.duration}
                      </span>
                      {selectedLesson.type && (
                        <span className="flex items-center text-sm">
                          <FileText className="w-4 h-4 mr-1.5" />
                          Type: {selectedLesson.type.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {liveSession?.isLive && (
                  <div className="relative flex-shrink-0 self-start">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg blur-sm opacity-50 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-red-600 to-pink-600 backdrop-blur-sm border border-red-400/50 rounded-lg shadow-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="relative">
                          <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
                          <div className="w-2 h-2 bg-white rounded-full relative"></div>
                        </div>
                        <span className="text-white font-bold text-xs uppercase tracking-wide">Instructor is Live Now</span>
                      </div>
                      <button
                        onClick={() => navigate(`/users/live/${liveSession.sessionId}`)}
                        className="w-full bg-white hover:bg-gray-50 text-red-600 font-semibold text-xs py-1.5 px-3 rounded transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                      >
                        <span>Join</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-300 shadow-xl">
                {selectedLesson ? (
                  selectedLesson.type === "video" && selectedLesson.url ? (
                    <video
                      src={selectedLesson.url}
                      controls
                      controlsList="nodownload"
                      className="w-full h-full"
                      onTimeUpdate={handleTimeUpdate}
                    />
                  ) : selectedLesson.type === "pdf" && selectedLesson.url ? (
                    <div style={{ height: "100%", minHeight: "500px" }}>
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                          fileUrl={selectedLesson.url}
                          onPageChange={(e) => {
                            const totalPages = e.doc.numPages;
                            const currentPage = e.currentPage;
                            const percent = (currentPage / totalPages) * 100;
                            if (
                              percent > 90 &&
                              selectedLesson._id &&
                              !watchedLectures.includes(selectedLesson._id)
                            ) {
                              markLectureWatchedS(courseId!, selectedLesson._id)
                                .then(() =>
                                  setWatchedLectures((prev) => [
                                    ...prev,
                                    selectedLesson._id,
                                  ])
                                )
                                .catch((err) => console.log(err));
                            }
                          }}
                        />
                      </Worker>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      <div className="text-center">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 text-lg">
                          Content not available
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <div className="text-center">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 text-lg">
                        Select a lesson to begin learning
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h4 className="text-xl font-bold text-gray-900">
                  Lesson Overview
                </h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-base">
                {selectedLesson?.description ||
                  "No description provided for this lesson."}
              </p>

              {progressPercent === 100 && (
                <div className="mt-8">
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0 md:space-x-6">
                      <div className="flex-shrink-0 p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className="text-xl font-bold text-green-700 mb-2">
                          Congratulations! You completed this course!
                        </h5>
                        <p className="text-gray-700 text-base leading-relaxed mb-4">
                          You've finished all lessons. Take the quiz below to
                          earn your certificate.
                        </p>

                        {!isCertificateIssued ? (
                          <button
                            onClick={() =>
                              navigate(`/users/quiz/${course._id}`)
                            }
                            className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:scale-105 transition-transform duration-300 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-cyan-500/30"
                          >
                            Take Quiz
                          </button>
                        ) : (
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-yellow-500/30 text-center">
                            🎉 You've earned your certificate!
                            <button
                              onClick={() => navigate("/users/profile")}
                              className="ml-2 underline font-bold"
                            >
                              Claim it on your Profile
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CoursePage