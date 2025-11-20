import { useContext, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import image from "../../assets/Edurise-logo.png";
import { errorToast, successToast } from "../../components/Toast";
import { userLoginS } from "../../services/user.services";
import { USER_ROUTES } from "../../constants/routes.constants";
import UserContext from "../../context/UserContext";
import type { AxiosError } from "axios";

export default function UserLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const usertoken = localStorage.getItem("usersToken");
  const { getUserProfile } = useContext(UserContext) ?? {};
  const navigate = useNavigate();

  useEffect(() => {
    if (usertoken) navigate("/home");
  }, [usertoken, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string().required("Email is required").email("Invalid email format").max(50, "Email cannot exceed 50 characters"),
    password: Yup.string().required("Password is required").min(8, "Password must be at least 8 characters").max(20, "Password cannot exceed 20 characters").matches(/[A-Z]/, "Must contain at least one uppercase letter").matches(/[a-z]/, "Must contain at least one lowercase letter").matches(/[0-9]/, "Must contain at least one number").matches(/[@$!%*?&]/, "Must contain at least one special character"),
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const response = await userLoginS(values.email, values.password);
      if (response && response.status === 200) {
        const token = response.data.token;
        const email = response.data.user?.email;
        localStorage.setItem("usersEmail", email);
        localStorage.setItem("usersToken", token);
        if (getUserProfile) await getUserProfile();
        successToast("User Logged in Successfully");
        setTimeout(() => navigate("/home"), 800);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      errorToast(error.response?.data?.message ?? "Something went wrong");
    }
  };

  return (
    <div className="theme-light min-h-screen bg-[var(--bg)] grid place-items-center p-6">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 gap-8 items-center">
        <div className="card p-8 text-center">
          <div className="mx-auto w-40">
            <img src={image} alt="EduRise" className="w-full" />
          </div>
          <h3 className="h3 mt-4">Welcome Back</h3>
          <p className="mt-1 text-[color:var(--text-600)]">Sign in to continue learning</p>
        </div>

        <div className="card p-8">
          <div className="text-center mb-4">
            <h2 className="h3">Sign In</h2>
            <p className="text-[color:var(--text-600)]">Enter your credentials</p>
          </div>

          <Formik initialValues={{ email: "", password: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, isValid, dirty }) => (
              <Form className="grid gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Email address</label>
                  <Field id="email" name="email" type="email" placeholder="you@example.com" />
                  <ErrorMessage name="email" component="p" className="text-sm text-red-600 mt-1" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[color:var(--text-600)] mb-1">Password</label>
                  <div className="relative">
                    <Field id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                    <button type="button" className="absolute inset-y-0 right-2 grid place-items-center px-2 text-[color:var(--text-500)]" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-sm text-red-600 mt-1" />
                </div>

                <div className="flex justify-end">
                  <Link to={USER_ROUTES.FORGOT_PASSWORD} className="text-sm text-[color:var(--primary-600)]">Forgot password?</Link>
                </div>

                <button type="submit" disabled={isSubmitting || !isValid || !dirty} className="btn btn-primary w-full">
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center text-sm">
            <span className="text-[color:var(--text-600)]">Don't have an account? </span>
            <Link to={USER_ROUTES.REGISTER} className="text-[color:var(--primary-600)]">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
