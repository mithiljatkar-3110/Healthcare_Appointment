import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import DemoCredentials from '../components/DemoCredentials';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  {
    role: 'Admin',
    email: 'admin@clinic.com',
    password: 'admin123',
  },
  {
    role: 'Doctor',
    email: 'john@clinic.com',
    password: 'doctor123',
  },
  {
    role: 'Patient',
    email: 'alice@gmail.com',
    password: 'patient123',
  },
];

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      toast.success('Welcome back!');

      const role = result?.user?.role?.toUpperCase();
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'DOCTOR') {
        navigate('/doctor');
      } else if (role === 'PATIENT') {
        navigate('/patient/book');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const fillCredentials = (account) => {
    setValue('email', account.email);
    setValue('password', account.password);
    toast.success(`${account.role} credentials filled`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="grid lg:grid-cols-[1fr_0.9fr]">
          <div className="bg-slate-900 px-8 py-10 text-white sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Secure Access</p>
            <h1 className="mt-3 text-3xl font-semibold">Welcome back</h1>
            <p className="mt-4 text-base text-slate-300">
              Sign in to access your healthcare workspace, appointments, and follow-up tools.
            </p>

            <div className="mt-8 space-y-3">
              {demoAccounts.map((account) => (
                <DemoCredentials key={account.role} account={account} onFillCredentials={fillCredentials} />
              ))}
            </div>
          </div>

          <div className="px-8 py-10 sm:px-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900">Login to your account</h2>
              <p className="mt-2 text-sm text-slate-600">Use your registered email and password to continue.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                  />
                </div>
                {errors.password ? <p className="mt-2 text-sm text-red-600">{errors.password.message}</p> : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
