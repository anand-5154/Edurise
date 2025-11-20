import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addCourseToLearningPathS,
  createLearningPathS,
  deleteLearningPathS,
  getLearningPathCatalogS,
  getLearningPathsS,
  removeCourseFromLearningPathS,
  reorderLearningPathCoursesS,
  updateLearningPathS,
} from "../../services/user.services";
import Navbar from "../../components/Navbar";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  PencilLine,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  LearningPath,
  LearningPathCourseCatalogItem,
} from "../../types/learningPath.types";
import { USER_ROUTES } from "../../constants/routes.constants";

type CreateFormState = {
  title: string;
  description: string;
  targetDate: string;
};

const initialCreateForm: CreateFormState = {
  title: "",
  description: "",
  targetDate: "",
};

const formatDateForInput = (date?: string | null) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
};

const formatDateForDisplay = (date?: string | null) => {
  if (!date) return "No target date";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "No target date";
  return parsed.toLocaleDateString();
};

const extractErrorMessage = (err: unknown) => {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message as string;
  }
  return err instanceof Error ? err.message : "Something went wrong";
};

const LearningPaths = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [catalog, setCatalog] = useState<LearningPathCourseCatalogItem[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(
    initialCreateForm
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<CreateFormState>(initialCreateForm);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courseNote, setCourseNote] = useState<string>("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        setLoading(true);
        const res = await getLearningPathsS();
        setLearningPaths(res.data);
        if (!selectedPathId && res.data.length) {
          setSelectedPathId(res.data[0].id);
        }
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        const res = await getLearningPathCatalogS();
        setCatalog(res.data);
      } catch (err) {
        setCatalogError(extractErrorMessage(err));
      } finally {
        setCatalogLoading(false);
      }
    };

    fetchPaths();
    fetchCatalog();
  }, []);

  const selectedPath = useMemo(() => {
    if (!selectedPathId) return null;
    return learningPaths.find((path) => path.id === selectedPathId) ?? null;
  }, [learningPaths, selectedPathId]);

  useEffect(() => {
    if (selectedPath) {
      setEditForm({
        title: selectedPath.title,
        description: selectedPath.description ?? "",
        targetDate: formatDateForInput(selectedPath.targetDate),
      });
    } else {
      setEditForm(initialCreateForm);
    }
  }, [selectedPath]);

  const availableCourses = useMemo(() => {
    if (!selectedPath) return catalog;
    const selectedIds = new Set(
      selectedPath.courses.map((course) => course.courseId)
    );
    return catalog.filter((course) => !selectedIds.has(course.id));
  }, [catalog, selectedPath]);

  const updatePathInState = (next: LearningPath) => {
    setLearningPaths((prev) =>
      prev.map((path) => (path.id === next.id ? next : path))
    );
  };

  const handleCreatePath = async () => {
    setActionError(null);
    if (!createForm.title.trim()) {
      setActionError("Please provide a title for your learning path");
      return;
    }
    try {
      setCreating(true);
      const payload = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        targetDate: createForm.targetDate ? createForm.targetDate : null,
      };
      const res = await createLearningPathS(payload);
      setLearningPaths((prev) => [res.data, ...prev]);
      setSelectedPathId(res.data.id);
      setCreateForm(initialCreateForm);
      setShowCreateForm(false);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePath = async () => {
    if (!selectedPath) return;
    setActionError(null);
    if (!editForm.title.trim()) {
      setActionError("Title cannot be empty");
      return;
    }
    try {
      setUpdating(true);
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        targetDate: editForm.targetDate ? editForm.targetDate : null,
      };
      const res = await updateLearningPathS(selectedPath.id, payload);
      updatePathInState(res.data);
      setEditing(false);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePath = async (pathId: string) => {
    setActionError(null);
    try {
      setDeleting(true);
      await deleteLearningPathS(pathId);
      setLearningPaths((prev) => prev.filter((path) => path.id !== pathId));
      if (selectedPathId === pathId) {
        const remaining = learningPaths.filter((path) => path.id !== pathId);
        setSelectedPathId(remaining.length ? remaining[0].id : null);
      }
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleAddCourse = async () => {
    if (!selectedPath || !selectedCourseId) return;
    setActionError(null);
    try {
      setAddCourseLoading(true);
      const res = await addCourseToLearningPathS(
        selectedPath.id,
        selectedCourseId,
        courseNote.trim() || undefined
      );
      updatePathInState(res.data);
      setSelectedCourseId("");
      setCourseNote("");
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setAddCourseLoading(false);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!selectedPath) return;
    setActionError(null);
    try {
      const res = await removeCourseFromLearningPathS(selectedPath.id, courseId);
      updatePathInState(res.data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  const handleMoveCourse = async (
    courseId: string,
    direction: "up" | "down"
  ) => {
    if (!selectedPath) return;
    const index = selectedPath.courses.findIndex(
      (course) => course.courseId === courseId
    );
    if (index === -1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= selectedPath.courses.length) return;

    const reordered = [...selectedPath.courses];
    [reordered[index], reordered[swapIndex]] = [
      reordered[swapIndex],
      reordered[index],
    ];

    try {
      const res = await reorderLearningPathCoursesS(
        selectedPath.id,
        reordered.map((course) => course.courseId)
      );
      updatePathInState(res.data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="lg:w-1/3">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-slate-900">
                Learning Paths
              </h1>
              <button
                onClick={() => {
                  setShowCreateForm((prev) => !prev);
                  setActionError(null);
                }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition"
              >
                <Plus size={18} />
                New Path
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">
                  Create Learning Path
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={createForm.title}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g. Full Stack Mastery"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      value={createForm.description}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="What will this path help you achieve?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={createForm.targetDate}
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          targetDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <button
                    onClick={handleCreatePath}
                    disabled={creating}
                    className="w-full inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center text-slate-500">
                Loading your learning paths...
              </div>
            ) : learningPaths.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-slate-600">
                <p className="font-medium mb-2">No learning paths yet</p>
                <p className="text-sm">
                  Start by creating a new learning path to organize your courses
                  into a personalized journey.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {learningPaths.map((path) => (
                  <button
                    key={path.id}
                    onClick={() => {
                      setSelectedPathId(path.id);
                      setActionError(null);
                    }}
                    className={`w-full text-left bg-white border rounded-xl px-4 py-3 shadow-sm transition ${
                      selectedPathId === path.id
                        ? "border-blue-500 ring-2 ring-blue-100"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {path.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {path.courses.length} course
                          {path.courses.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <BookOpen className="text-blue-500" size={18} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="lg:flex-1">
            {selectedPath ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      {selectedPath.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Created on {formatDateForDisplay(selectedPath.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing((prev) => !prev)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition"
                    >
                      <PencilLine size={16} />
                      {editing ? "Cancel" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDeletePath(selectedPath.id)}
                      disabled={deleting}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>

                {editing ? (
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          Description
                        </label>
                        <textarea
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">
                          Target Date
                        </label>
                        <input
                          type="date"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.targetDate}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              targetDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleUpdatePath}
                      disabled={updating}
                      className="mt-4 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                ) : selectedPath.description ? (
                  <p className="text-slate-600 mb-4">{selectedPath.description}</p>
                ) : null}

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <Calendar size={16} />
                  <span>Target: {formatDateForDisplay(selectedPath.targetDate)}</span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Courses in this path
                      </h3>
                      <p className="text-sm text-slate-500">
                        Reorder courses to match your learning sequence.
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex flex-col gap-2">
                        <select
                          className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                          <option value="">Select a course</option>
                          {availableCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.title}
                              {course.price ? ` • ₹${course.price}` : ""}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          className="rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add a note (optional)"
                          value={courseNote}
                          onChange={(e) => setCourseNote(e.target.value)}
                        />
                        <button
                          onClick={handleAddCourse}
                          disabled={!selectedCourseId || addCourseLoading}
                          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition disabled:opacity-60"
                        >
                          {addCourseLoading ? "Adding..." : "Add Course"}
                        </button>
                        {catalogError && (
                          <p className="text-xs text-red-500">{catalogError}</p>
                        )}
                        {catalogLoading && (
                          <p className="text-xs text-slate-500">
                            Loading course catalog...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedPath.courses.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500">
                        No courses added yet. Use the selector above to add the
                        first course to this path.
                      </div>
                    ) : (
                      selectedPath.courses
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((course, index) => (
                          <div
                            key={course.courseId}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                          >
                            <div>
                              <Link
                                to={USER_ROUTES.COURSE_DETAIL(course.courseId)}
                                className="font-semibold text-slate-900 hover:text-blue-600 transition"
                              >
                                {course.courseTitle || "Course"}
                              </Link>
                              <p className="text-sm text-slate-500">
                                Added {formatDateForDisplay(course.addedAt)}
                              </p>
                              {course.note && (
                                <p className="text-sm text-blue-600 mt-1">
                                  Note: {course.note}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleMoveCourse(course.courseId, "up")}
                                  disabled={index === 0}
                                  className="p-2 rounded-lg border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-40"
                                >
                                  <ChevronUp size={16} />
                                </button>
                                <button
                                  onClick={() => handleMoveCourse(course.courseId, "down")}
                                  disabled={index === selectedPath.courses.length - 1}
                                  className="p-2 rounded-lg border border-slate-200 hover:border-blue-500 hover:text-blue-600 transition disabled:opacity-40"
                                >
                                  <ChevronDown size={16} />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveCourse(course.courseId)}
                                className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {actionError && (
                  <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {actionError}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 text-center text-slate-500">
                Select a learning path or create a new one to get started.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;

