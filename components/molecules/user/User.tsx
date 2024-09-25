import { useState, ChangeEvent, FormEvent } from "react";
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast'; // Import toast and Toaster
import styles from './User.module.scss';

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
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirmPassword

  const toggleForm = () => {
    setIsLogin((prevState) => !prevState);
    setErrors({});
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
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
      validationErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      validationErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      validationErrors.password = 'Password is required';
    }

    // Validation for registration
    if (!isLogin) {
      if (!formData.username) {
        validationErrors.username = 'Username is required';
      }

      if (!formData.confirmPassword) {
        validationErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = 'Passwords do not match';
      }
    }

    // If no errors, submit the form (or handle it)
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted:', formData);

      // Show success toast based on login or register
      if (isLogin) {
        toast.success('Logged in successfully!');
      } else {
        toast.success('Registered successfully!');
      }

      // Reset form fields after submission
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
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
    <div className='rounded-bl-[10px] rounded-br-[10px]'>
      <div className='container pt-[90px] pb-[30px]'>
        {/* Toaster for showing notifications */}
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
            className={`max-w-[400px] w-full h-auto ${
              isLogin ? styles.loginForm : styles.registerForm
            }`}
            onSubmit={handleSubmit}
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
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className='text-red-2 text-[1rem] tracking-[0.02rem] mb-[4px]'>
                {errors.email}
              </p>
            )}
            <div className='border-b-2 border-white-1 pb-[15px]'>&nbsp;</div>

            {/* Password Field */}
            <div className='flex item-center pb-[10px]'>
              <div className='mr-[10px] flex item-center'>
                <img src='/icons/lock.svg' alt='Icon' width={20} height={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'} // Toggle between text and password
                name='password'
                placeholder='Enter Password'
                className='bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium'
                value={formData.password}
                onChange={handleChange}
              />
              <div
                className='mr-[10px]'
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
            <div className='border-b-2 border-white-1 pb-[15px]'>&nbsp;</div>

            {/* Conditionally render Username and Confirm Password for Register */}
            {!isLogin && (
              <>
                {/* Username Field */}
                <div className='pb-[10px]'>
                  <div className='mr-[10px]'>
                    <Image
                      src='/icons/user.svg'
                      alt='Icon'
                      width={20}
                      height={20}
                    />
                  </div>
                  <input
                    type='text'
                    name='username'
                    placeholder='Enter Username'
                    className='bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium'
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                {errors.username && (
                  <p className='text-red-2 text-[1rem] tracking-[0.02rem] mb-[4px]'>
                    {errors.username}
                  </p>
                )}
                <div className='border-b-2 border-white-1 pb-[15px]'>
                  &nbsp;
                </div>

                {/* Confirm Password Field */}
                <div className='pb-[10px]'>
                  <div className='mr-[10px]'>
                    <Image
                      src='/icons/lock.svg'
                      alt='Icon'
                      width={20}
                      height={20}
                    />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} // Toggle for confirmPassword
                    name='confirmPassword'
                    placeholder='Confirm Password'
                    className='bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <div
                    className='mr-[10px]'
                    onClick={toggleConfirmPasswordVisibility}
                    style={{ cursor: 'pointer' }}
                  >
                    <Image
                      src={
                        showConfirmPassword
                          ? '/icons/eyeOff.svg'
                          : '/icons/eye.svg'
                      }
                      alt='Toggle Confirm Password'
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className='text-red-2 text-[1rem] tracking-[0.02rem] mb-[4px]'>
                    {errors.confirmPassword}
                  </p>
                )}
                <div className='border-b-2 border-white-1 pb-[15px]'>
                  &nbsp;
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              className={`${styles.submitButton} bg-white-1 text-black-1 border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] hover:bg-white-3 focus:outline-none`}
            >
              {isLogin ? 'Login' : 'Register'}
              <Image
                src='/icons/rightArrow.svg'
                alt='Arrow Icon'
                width={24}
                height={24}
              />
            </button>

            {/* Toggle between Login and Register */}
            <p className='text-[1.2rem] font-medium leading-[21px] text-left'>
              {isLogin ? 'Don’t have an account?' : 'Already have an account?'}{' '}
              <span
                onClick={toggleForm}
                className='text-[1.2rem] font-bold leading-[21px] text-left tracking-[0.02rem] cursor-pointer'
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
