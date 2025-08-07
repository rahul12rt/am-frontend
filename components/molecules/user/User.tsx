import {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useCallback,
} from 'react';
import Image from 'next/image';
import styles from './User.module.scss';
import { toast, Toaster } from 'react-hot-toast';

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

interface User {
  id: string;
  email: string;
  user_metadata?: any;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  requiresVerification?: boolean;
  error?: string;
  code?: string;
}

const User = ({ onClose }: UserProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // API base URL - update this to your backend URL
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Check if user is logged in by checking localStorage for session
  const checkAuthStatus = useCallback(() => {
    setAuthLoading(true);
    try {
      const userSession = localStorage.getItem('user_session');
      const userData = localStorage.getItem('user_data');

      if (userSession && userData) {
        const session = JSON.parse(userSession);
        const user = JSON.parse(userData);

        // Check if session is still valid
        if (session.expires_at && Date.now() < session.expires_at * 1000) {
          setUser(user);
        } else {
          // Session expired, clear storage
          localStorage.removeItem('user_session');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    }
    setAuthLoading(false);
  }, []);

  const toggleForm = () => {
    setIsLogin((prevState) => !prevState);
    setErrors({});
    setFormData({
      email: '',
      password: '',
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
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // Clear local storage
      localStorage.removeItem('user_session');
      localStorage.removeItem('user_data');

      // Update state
      setUser(null);
      setFormData({ email: '', password: '' });
      setIsLogin(true);

      toast.success('Signed out successfully!');
      onClose?.();
    } catch (error) {
      toast.error('An error occurred while signing out');
      console.error('Sign out error:', error);
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
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          metadata: isLogin
            ? undefined
            : { name: formData.email.split('@')[0] }, // Optional metadata for signup
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (data.code === 'USER_ALREADY_EXISTS') {
          toast.error(
            'An account with this email already exists. Please try logging in instead.'
          );
          setIsLogin(true); // Switch to login form
        } else if (data.code === 'INVALID_CREDENTIALS') {
          toast.error('Invalid email or password. Please try again.');
        } else if (data.code === 'EMAIL_NOT_CONFIRMED') {
          toast.error('Please verify your email before signing in.');
        } else {
          toast.error(data.error || 'An error occurred. Please try again.');
        }
        return;
      }

      if (data.success) {
        if (isLogin) {
          // Login successful
          if (data.user && data.session) {
            // Store user data and session in localStorage
            localStorage.setItem('user_data', JSON.stringify(data.user));
            localStorage.setItem('user_session', JSON.stringify(data.session));

            setUser(data.user);
            toast.success('Login successful!');
            onClose?.();
          }
        } else {
          // Signup successful
          if (data.requiresVerification) {
            toast.success(
              'Registration successful! Please check your email for verification.'
            );
            setIsLogin(true); // Switch to login form
            setFormData({ email: '', password: '' });
          } else if (data.user && data.session) {
            // User created and logged in
            localStorage.setItem('user_data', JSON.stringify(data.user));
            localStorage.setItem('user_session', JSON.stringify(data.session));

            setUser(data.user);
            toast.success('Account created and logged in successfully!');
            onClose?.();
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className='rounded-bl-[10px] rounded-br-[10px]'>
        <div className='container pt-[90px] pb-[30px]'>
          <div className='flex flex-col items-end'>
            <div className='max-w-[400px] w-full h-auto flex justify-center items-center py-[40px]'>
              <p className='text-white-1 text-[1.6rem]'>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated user interface
  if (user) {
    return (
      <div className='rounded-bl-[10px] rounded-br-[10px]'>
        <div className='container pt-[90px] pb-[30px]'>
          <Toaster
            position='top-right'
            reverseOrder={false}
            toastOptions={{
              style: {
                marginTop: '50px',
                fontSize: 12,
              },
            }}
          />

          <div className='flex flex-col items-end'>
            <div className={`max-w-[400px] w-full h-auto ${styles.loginForm}`}>
              <h3 className='text-[2.4rem] font-bold leading-[36px] pt-[20px]'>
                Welcome Back!
              </h3>
              <h6 className='text-[1.6rem] leading-[36px] pb-[20px]'>
                You&apos;re logged in
              </h6>

              {/* User Profile Info */}
              <div className='flex items-center pb-[10px] mb-[15px]'>
                <div className='mr-[10px] flex items-center'>
                  <Image
                    src='/icons/sms.svg'
                    alt='Icon'
                    width={20}
                    height={20}
                  />
                </div>
                <div className='flex-1'>
                  <p className='text-white-1 text-[1.6rem] font-medium'>
                    {user.email}
                  </p>
                  <p className='text-white-1 text-[1.2rem] opacity-70'>
                    Welcome back!
                  </p>
                </div>
              </div>
              <div className='border-b-2 border-white-1 mb-[15px]'></div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className={`${styles.submitButton} bg-red-500 hover:bg-red-600 text-white border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
                <Image
                  src='/icons/rightArrow.svg'
                  alt='Arrow Icon'
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
    <div className='rounded-bl-[10px] rounded-br-[10px]'>
      <div className='container pt-[90px] pb-[30px]'>
        <Toaster
          position='top-right'
          reverseOrder={false}
          toastOptions={{
            style: {
              marginTop: '50px',
              fontSize: 12,
            },
          }}
        />

        <div className='flex flex-col items-end'>
          <form
            onSubmit={handleSubmit}
            className={`max-w-[400px] w-full h-auto ${
              isLogin ? styles.loginForm : styles.registerForm
            }`}
          >
            <h3 className='text-[2.4rem] font-bold leading-[36px] pt-[20px]'>
              {isLogin ? 'Existing member' : 'Register New Account'}
            </h3>
            <h6 className='text-[1.6rem] leading-[36px] pb-[20px]'>
              {isLogin ? 'Welcome Back!' : 'Join Us!'}
            </h6>

            {/* Email Field */}
            <div className='flex item-center pb-[10px]'>
              <div className='mr-[10px] flex item-center'>
                <Image src='/icons/sms.svg' alt='Icon' width={20} height={20} />
              </div>
              <input
                type='email'
                name='email'
                placeholder='Enter Email'
                className='bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium'
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <p className='text-red-2 text-[1rem] tracking-[0.02rem] mb-[4px]'>
                {errors.email}
              </p>
            )}
            <div className='border-b-2 border-white-1 mb-[15px]'></div>

            {/* Password Field */}
            <div className='flex item-center pb-[10px]'>
              <div className='mr-[10px] flex item-center'>
                <Image
                  src='/icons/lock.svg'
                  alt='Icon'
                  width={20}
                  height={20}
                />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder='Enter Password'
                className='bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium'
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <div
                className='mr-[10px] flex items-center'
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer' }}
              >
                <Image
                  src={showPassword ? '/icons/eyeOff.svg' : '/icons/eye.svg'}
                  alt='Toggle Password'
                  width={20}
                  height={20}
                />
              </div>
            </div>
            {errors.password && (
              <p className='text-red-2 text-[1rem] tracking-[0.02rem] mb-[4px]'>
                {errors.password}
              </p>
            )}
            <div className='border-b-2 border-white-1 mb-[15px]'></div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading}
              className={`${styles.submitButton} bg-white-1 text-black-1 border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] hover:bg-white-3 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
              <Image
                src='/icons/rightArrow.svg'
                alt='Arrow Icon'
                width={24}
                height={24}
              />
            </button>

            {/* Toggle between Login and Register */}
            <p className='text-[1.2rem] font-medium leading-[21px] text-left'>
              {isLogin
                ? 'Don&apos;t have an account?'
                : 'Already have an account?'}{' '}
              <span
                onClick={toggleForm}
                className='text-[1.2rem] font-bold leading-[21px] text-left tracking-[0.02rem] cursor-pointer hover:underline'
              >
                {isLogin ? 'Register Now' : 'Login'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default User;
