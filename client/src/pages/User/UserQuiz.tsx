import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizS, makeCertificate, submitQuizS } from "../../services/user.services";
import html2canvas from "html2canvas";
import { useAuth } from "../../hooks/useAuth";
import image from "../../assets/certificate.png";
import { CheckCircle, XCircle, Award, Clock, BookOpen } from "lucide-react";

interface Option { text: string; isCorrect: boolean; }
interface Question { _id: string; questionText: string; type: string; options: Option[]; }
interface Quiz { _id: string; title: string; description: string; questions: Question[]; passPercentage: number; }

const UserQuizPage = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { authUser } = useAuth();
  const [result, setResult] = useState<{ score: number; percentage: number; passed: boolean; isCertificateIssued: boolean; } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!courseId) return;
      try {
        const res = await getQuizS(courseId);
        setQuiz(res.data.quiz);
      } catch {}
    };
    fetchQuiz();
  }, [courseId]);

  const generateCertificate = useCallback(async () => {
    if (!certificateRef.current || !quiz || !authUser?._id) return;
    const canvas = await html2canvas(certificateRef.current);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("userId", authUser._id!);
      formData.append("courseId", courseId!);
      formData.append("certificate", blob, "certificate.png");
      try {
        await makeCertificate(formData);
      } catch {}
    });
  }, [authUser?._id, courseId, quiz]);

  useEffect(() => {
    if (result?.passed) {
      const t = setTimeout(() => generateCertificate(), 100);
      return () => clearTimeout(t);
    }
  }, [result, generateCertificate]);

  const handleSelect = (questionId: string, optionText: string) => setAnswers((prev) => ({ ...prev, [questionId]: optionText }));

  const handleSubmit = async () => {
    if (!quiz) return;
    try {
      const res = await submitQuizS(quiz._id, courseId!, answers);
      const { score, percentage, passed, isCertificateIssued } = res.data;
      setResult({ score, percentage, passed, isCertificateIssued });
      setSubmitted(true);
      setShowModal(true);
    } catch {}
  };

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quiz?.questions.length || 0;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  if (!quiz) {
    return (
      <div className="theme-light min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="skeleton h-12 w-12 mx-auto mb-4 radius-full" />
          <p>Loading your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] text-[var(--text-800)] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[var(--primary-100)] rounded-xl grid place-items-center">
              <BookOpen className="w-6 h-6 text-[var(--primary-600)]" />
            </div>
            <div className="flex-1">
              <h1 className="h2">{quiz.title}</h1>
              <p className="text-[color:var(--text-600)]">{quiz.description}</p>
              <div className="flex items-center gap-6 mt-3 text-sm text-[color:var(--text-600)]">
                <div className="inline-flex items-center gap-2"><Clock className="w-4 h-4" /><span>{totalQuestions} Questions</span></div>
                <div className="inline-flex items-center gap-2"><Award className="w-4 h-4" /><span>Pass: {quiz.passPercentage}%</span></div>
              </div>
            </div>
          </div>
        </div>

        {!submitted && (
          <div className="card p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold">Progress</span>
              <span className="font-semibold" style={{ color: "var(--primary-600)" }}>{answeredQuestions} / {totalQuestions}</span>
            </div>
            <div className="w-full bg-[var(--bg-muted)] h-2 radius-full overflow-hidden">
              <div className="h-full radius-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--primary-600), var(--primary-500))" }} />
            </div>
          </div>
        )}

        {!submitted ? (
          <div className="space-y-6 mb-8">
            {quiz.questions.map((q, idx) => {
              const picked = answers[q._id];
              return (
                <div key={q._id} className="card p-6 hover:shadow-2 soft-in" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 bg-[var(--primary-100)] rounded-xl grid place-items-center font-bold text-[var(--primary-700)]">{idx + 1}</div>
                    <p className="text-base font-semibold flex-1">{q.questionText}</p>
                  </div>
                  <div className="grid gap-3 pl-14">
                    {q.options.map((opt) => {
                      const selected = picked === opt.text;
                      return (
                        <button
                          key={opt.text}
                          onClick={() => handleSelect(q._id, opt.text)}
                          className={`text-left px-4 py-3 radius-md ring-1 transition-all ${selected ? "bg-[var(--primary-50)] ring-[var(--primary-200)]" : "ring-[var(--stroke-200)] hover:bg-[var(--bg-soft)]"}`}
                        >
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              onClick={handleSubmit}
              disabled={answeredQuestions < totalQuestions}
              className={`w-full btn ${answeredQuestions < totalQuestions ? "btn-ghost" : "btn-primary"}`}
            >
              {answeredQuestions < totalQuestions ? `Answer ${totalQuestions - answeredQuestions} more` : "Submit Quiz"}
            </button>
          </div>
        ) : null}

        {showModal && result && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
            <div className="card p-8 max-w-md w-full text-center">
              <div className="mb-6">
                {result.passed ? (
                  <div className="w-16 h-16 bg-green-500/10 text-green-600 rounded-full grid place-items-center mx-auto">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-500/10 text-red-600 rounded-full grid place-items-center mx-auto">
                    <XCircle className="w-9 h-9" />
                  </div>
                )}
              </div>
              <h3 className="h3">{result.passed ? "Congratulations!" : "Good Attempt"}</h3>
              <div className="mt-3">
                <div className="text-4xl font-bold" style={{ color: "var(--primary-600)" }}>{result.percentage}%</div>
                <p className="text-[color:var(--text-600)]">Score: {result.score} / {quiz.questions.length}</p>
              </div>
              <div className="mt-4">
                {result.passed ? (
                  <div className="alert alert-success">You passed the quiz! Check the Certificates section in your profile.</div>
                ) : (
                  <div className="alert alert-warning">You need {quiz.passPercentage}% to pass. You can try again later.</div>
                )}
              </div>
              <button onClick={() => { setShowModal(false); navigate(`/users/courses/${courseId}`); }} className="btn btn-primary w-full mt-4">Close</button>
            </div>
          </div>
        )}

        {result?.passed && (
          <div
            ref={certificateRef}
            className="w-[800px] h-[600px] p-8 bg-white text-black"
            style={{ backgroundImage: `url(${image})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", position: "absolute", left: "-9999px" }}
          >
            <p className="text-center text-xl mb-4 absolute top-72 left-0 right-0"><strong>{authUser?.name}</strong></p>
            <p className="text-center mb-4 absolute top-80 left-0 right-0 text-xs">has successfully completed the course named <strong>{quiz.title}</strong></p>
            <p className="text-center absolute top-90 left-0 right-0">Date: {new Date().toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserQuizPage;
