import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import styles from "./User.module.css";
import { toast, Toaster } from "react-hot-toast"; // Import toast and Toaster

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

interface Errors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
}

const User = () => {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and register
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirmPassword

  const toggleForm = () => {
    setIsLogin((prevState) => !prevState);
    setErrors({});
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let validationErrors: Errors = {};

    // Common validation for both login and register
    if (!formData.email) {
      validationErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      validationErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      validationErrors.password = "Password is required";
    }

    // Validation for registration
    if (!isLogin) {
      if (!formData.username) {
        validationErrors.username = "Username is required";
      }

      if (!formData.confirmPassword) {
        validationErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = "Passwords do not match";
      }
    }

    // If no errors, submit the form (or handle it)
    if (Object.keys(validationErrors).length === 0) {
      console.log("Form submitted:", formData);

      // Show success toast based on login or register
      if (isLogin) {
        toast.success("Logged in successfully!");
      } else {
        toast.success("Registered successfully!");
      }

      // Reset form fields after submission
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
      });
      setErrors({});
    } else {
      setErrors(validationErrors);
    }
  };

  // Toggle Password Visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prevState) => !prevState);
  };

  return (
    <div className="rounded-bl-[10px] rounded-br-[10px]">
      <div className="container pt-[90px] pb-[30px]">
        {/* Toaster for showing notifications */}
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

        <div className={styles.userForm}>
          <form
            className={`${styles.wrap} ${
              isLogin ? styles.loginForm : styles.registerForm
            }`}
            onSubmit={handleSubmit}
          >
            <h3>{isLogin ? "Existing member" : "Register New Account"}</h3>
            <h6>{isLogin ? "Welcome Back!" : "Join Us!"}</h6>

            {/* Email Field */}
            <div className={styles.inputContainer}>
              <div className={styles.inputIcon}>
                <img src="/icons/sms.svg" alt="Icon" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Enter Email"
                className={styles.customInput}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className={styles.error}>{errors.email}</p>}
            <div className={styles.underline}></div>

            {/* Password Field */}
            <div className={styles.inputContainer}>
              <div className={styles.inputIcon}>
                <img src="/icons/lock.svg" alt="Icon" />
              </div>
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                name="password"
                placeholder="Enter Password"
                className={styles.customInput}
                value={formData.password}
                onChange={handleChange}
              />
              <div
                className={styles.inputIcon}
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={showPassword ? "/icons/eyeOff.svg" : "/icons/eye.svg"}
                  alt="Toggle Password"
                />
              </div>
            </div>
            {errors.password && (
              <p className={styles.error}>{errors.password}</p>
            )}
            <div className={styles.underline}></div>

            {/* Conditionally render Username and Confirm Password for Register */}
            {!isLogin && (
              <>
                {/* Username Field */}
                <div className={styles.inputContainer}>
                  <div className={styles.inputIcon}>
                    <img src="/icons/user.svg" alt="Icon" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter Username"
                    className={styles.customInput}
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                {errors.username && (
                  <p className={styles.error}>{errors.username}</p>
                )}
                <div className={styles.underline}></div>

                {/* Confirm Password Field */}
                <div className={styles.inputContainer}>
                  <div className={styles.inputIcon}>
                    <img src="/icons/lock.svg" alt="Icon" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"} // Toggle for confirmPassword
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className={styles.customInput}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <div
                    className={styles.inputIcon}
                    onClick={toggleConfirmPasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={
                        showConfirmPassword
                          ? "/icons/eyeOff.svg"
                          : "/icons/eye.svg"
                      }
                      alt="Toggle Confirm Password"
                    />
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className={styles.error}>{errors.confirmPassword}</p>
                )}
                <div className={styles.underline}></div>
              </>
            )}

            {/* Submit Button */}
            <button type="submit" className={styles.submitButton}>
              {isLogin ? "Login" : "Register"}
              <Image
                src="/icons/rightArrow.svg"
                alt="Arrow Icon"
                width={24}
                height={24}
              />
            </button>

            {/* Toggle between Login and Register */}
            <p className={styles.info}>
              {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
              <span onClick={toggleForm} className={styles.toggleText}>
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
