import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card p-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600">{user.email}</p>
            {user.isAdmin && (
              <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                Administrator
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <CalendarIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{user.hostedEventsCount}</p>
          <p className="text-gray-600">Events Hosted</p>
        </div>
        
        <div className="card p-6 text-center">
          <TagIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{user.tags?.length || 0}</p>
          <p className="text-gray-600">Tags</p>
        </div>
        
        <div className="card p-6 text-center">
          <UserIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">Member</p>
          <p className="text-gray-600">Since {new Date(user.createdAt).getFullYear()}</p>
        </div>
      </div>

      {/* Tags */}
      {user.tags && user.tags.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Tags</h2>
          <div className="flex flex-wrap gap-2">
            {user.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
