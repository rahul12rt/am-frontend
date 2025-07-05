import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import styles from "./User.module.scss";
import { toast, Toaster } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/auth-helpers-nextjs";

interface FormData {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
}

interface UserProps {
  onClose?: () => void;
}

const User = ({ onClose }: UserProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const toggleForm = () => {
    setIsLogin((prevState) => !prevState);
    setErrors({});
    setFormData({
      email: "",
      password: "",
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Signed out successfully!");
        setUser(null);
        // Reset form data
        setFormData({ email: "", password: "" });
        setIsLogin(true);
      }
    } catch (error) {
      toast.error("An error occurred while signing out");
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Login user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Login successful!");
        }
      } else {
        // Register user
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success(
            "Registration successful! Please check your email for verification."
          );
          setIsLogin(true);
          setFormData({ email: "", password: "" });
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      setAuthLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user as User);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    };
    getUser();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className="rounded-bl-[10px] rounded-br-[10px]">
        <div className="container pt-[90px] pb-[30px]">
          <div className="flex flex-col items-end">
            <div className="max-w-[400px] w-full h-auto flex justify-center items-center py-[40px]">
              <p className="text-white-1 text-[1.6rem]">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated user interface
  if (user) {
    return (
      <div className="rounded-bl-[10px] rounded-br-[10px]">
        <div className="container pt-[90px] pb-[30px]">
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              style: {
                marginTop: "50px",
                fontSize: 12,
              },
            }}
          />

          <div className="flex flex-col items-end">
            <div className={`max-w-[400px] w-full h-auto ${styles.loginForm}`}>
              <h3 className="text-[2.4rem] font-bold leading-[36px] pt-[20px]">
                Welcome Back!
              </h3>
              <h6 className="text-[1.6rem] leading-[36px] pb-[20px]">
                You're logged in
              </h6>

              {/* User Profile Info */}
              <div className="flex items-center pb-[10px] mb-[15px]">
                <div className="mr-[10px] flex items-center">
                  <Image
                    src="/icons/sms.svg"
                    alt="Icon"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white-1 text-[1.6rem] font-medium">
                    {user.email}
                  </p>
                  <p className="text-white-1 text-[1.2rem] opacity-70">
                    {user.email_confirmed_at
                      ? "Email verified"
                      : "Email not verified"}
                  </p>
                </div>
              </div>
              <div className="border-b-2 border-white-1 mb-[15px]"></div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className={`${styles.submitButton} bg-red-500 hover:bg-red-600 text-white border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Signing out..." : "Sign Out"}
                <Image
                  src="/icons/rightArrow.svg"
                  alt="Arrow Icon"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login/register form for unauthenticated users
  return (
    <div className="rounded-bl-[10px] rounded-br-[10px]">
      <div className="container pt-[90px] pb-[30px]">
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              marginTop: "50px",
              fontSize: 12,
            },
          }}
        />

        <div className="flex flex-col items-end">
          <form
            onSubmit={handleSubmit}
            className={`max-w-[400px] w-full h-auto ${
              isLogin ? styles.loginForm : styles.registerForm
            }`}
          >
            <h3 className="text-[2.4rem] font-bold leading-[36px] pt-[20px]">
              {isLogin ? "Existing member" : "Register New Account"}
            </h3>
            <h6 className="text-[1.6rem] leading-[36px] pb-[20px]">
              {isLogin ? "Welcome Back!" : "Join Us!"}
            </h6>

            {/* Email Field */}
            <div className="flex item-center pb-[10px]">
              <div className="mr-[10px] flex item-center">
                <Image src="/icons/sms.svg" alt="Icon" width={20} height={20} />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                className="bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-red-2 text-[1rem] tracking-[0.02rem] mb-[4px]">
                {errors.email}
              </p>
            )}
            <div className="border-b-2 border-white-1 mb-[15px]"></div>

            {/* Password Field */}
            <div className="flex item-center pb-[10px]">
              <div className="mr-[10px] flex item-center">
                <Image
                  src="/icons/lock.svg"
                  alt="Icon"
                  width={20}
                  height={20}
                />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                className="bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <div
                className="mr-[10px] flex items-center"
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                <Image
                  src={showPassword ? "/icons/eyeOff.svg" : "/icons/eye.svg"}
                  alt="Toggle Password"
                  width={20}
                  height={20}
                />
              </div>
            </div>
            {errors.password && (
              <p className="text-red-2 text-[1rem] tracking-[0.02rem] mb-[4px]">
                {errors.password}
              </p>
            )}
            <div className="border-b-2 border-white-1 mb-[15px]"></div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitButton} bg-white-1 text-black-1 border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] hover:bg-white-3 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? "Loading..." : isLogin ? "Login" : "Register"}
              <Image
                src="/icons/rightArrow.svg"
                alt="Arrow Icon"
                width={24}
                height={24}
              />
            </button>

            {/* Toggle between Login and Register */}
            <p className="text-[1.2rem] font-medium leading-[21px] text-left">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span
                onClick={toggleForm}
                className="text-[1.2rem] font-bold leading-[21px] text-left tracking-[0.02rem] cursor-pointer hover:underline"
              >
                {isLogin ? "Register Now" : "Login"}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default User;
