import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { REQUEST_PASSWORD_RESET } from '../lib/graphql/mutations';
import { Link } from 'react-router-dom';

interface FormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [requestReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET, {
    onCompleted: () => {
      toast.success('If an account exists, a reset link was sent.');
    },
    onError: () => {
      // Show generic success to avoid enumeration differences
      toast.success('If an account exists, a reset link was sent.');
    }
  });

  const onSubmit = (data: FormData) => {
    requestReset({ variables: { email: data.email } });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email and we’ll send you a reset link.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                type="email"
                className="input-field mt-1"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Back to login</Link>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

