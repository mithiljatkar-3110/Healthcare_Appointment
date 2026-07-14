import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import api from '../api/api';

const readAdminStats = () => {
  try {
    return JSON.parse(localStorage.getItem('adminStats') || '{}');
  } catch {
    return {};
  }
};

const writeAdminStats = (stats) => {
  localStorage.setItem('adminStats', JSON.stringify(stats));
};

function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      const persistedStats = readAdminStats();
      const nextStats = {
        ...persistedStats,
        totalPatients: (persistedStats.totalPatients || 0) + 1,
      };
      writeAdminStats(nextStats);

      toast.success('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-slate-900 px-8 py-10 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Patient Registration</p>
            <h1 className="mt-3 text-3xl font-semibold">Create your account</h1>
            <p className="mt-4 text-base text-slate-300">
              Register as a patient to book appointments and access your care journey.
            </p>
          </div>

          <div className="px-8 py-10 sm:px-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900">Register</h2>
              <p className="mt-2 text-sm text-slate-600">Fill in your details to get started.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="name">
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your full name"
                    {...register('name', { required: 'Full name is required' })}
                  />
                </div>
                {errors.name ? <p className="mt-2 text-sm text-red-600">{errors.name.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email ? <p className="mt-2 text-sm text-red-600">{errors.email.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Create a password"
                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Password must be at least 8 characters' } })}
                  />
                </div>
                {errors.password ? <p className="mt-2 text-sm text-red-600">{errors.password.message}</p> : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Repeat your password"
                    {...register('confirmPassword', { required: 'Please confirm your password', validate: (value) => value === password || 'Passwords do not match' })}
                  />
                </div>
                {errors.confirmPassword ? <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSubmitting ? 'Creating account...' : 'Register'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
