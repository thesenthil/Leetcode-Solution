import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { signupUser, clearError } from '../../features/auth/authSlice';

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user, token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (user && token) navigate('/feed');
  }, [user, token, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(signupUser(data));
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <h1 className="auth-card__logo">in</h1>
        <h2 className="auth-card__title">Make the most of your professional life</h2>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                placeholder="First name"
                {...register('firstName', { required: 'First name is required' })}
              />
              {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                placeholder="Last name"
                {...register('lastName', { required: 'Last name is required' })}
              />
              {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
              })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create password (6+ characters)"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters' }
              })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <p className="auth-card__legal">
            By clicking Agree & Join, you agree to the LinkedIn Clone User Agreement.
          </p>

          <button type="submit" className="btn btn--primary btn--full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Agree & Join'}
          </button>
        </form>

        <p className="auth-card__footer">
          Already on LinkedIn Clone? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
