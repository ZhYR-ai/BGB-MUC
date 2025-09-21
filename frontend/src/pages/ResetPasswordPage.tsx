import React, { useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { postJson } from '../lib/rest';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  password: string;
  confirm: string;
}

const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Missing reset token');
      return;
    }
    try {
      setLoading(true);
      const resp = await postJson<{ token: string; user: any }>(
        '/auth/reset-password',
        { token, newPassword: data.password }
      );
      login(resp.token, resp.user);
      toast.success('Password updated. You are now signed in.');
      navigate('/dashboard');
    } catch (e: any) {
      toast.error(e.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set a new password
          </h2>
          {!token && (
            <p className="mt-2 text-center text-sm text-red-600">Invalid or missing token.</p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New password</label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
                type="password"
                className="input-field mt-1"
                placeholder="Enter new password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                {...register('confirm', {
                  validate: (value) => value === watch('password') || 'Passwords do not match',
                })}
                type="password"
                className="input-field mt-1"
                placeholder="Confirm new password"
              />
              {errors.confirm && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Back to login</Link>
            <button type="submit" disabled={loading || !token} className="btn-primary">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
