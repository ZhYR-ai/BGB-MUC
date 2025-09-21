import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { 
  CalendarIcon, 
  UsersIcon, 
  TagIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';
import { GET_PUBLIC_EVENTS } from '../lib/graphql/queries';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useQuery(GET_PUBLIC_EVENTS);

  const upcomingEvents = data?.publicEvents?.slice(0, 3) || [];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Connect Through
            <span className="text-primary-600 block">Gaming Events</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover, create, and join gaming events in your community. 
            Connect with fellow gamers and build lasting friendships.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isAuthenticated ? (
            <>
              <Link to="/events" className="btn-primary text-lg px-8 py-3">
                Browse Events
              </Link>
              <Link to="/create-event" className="btn-outline text-lg px-8 py-3">
                Create Event
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Get Started
              </Link>
              <Link to="/events" className="btn-outline text-lg px-8 py-3">
                Browse Events
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <CalendarIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Event Management</h3>
          <p className="text-gray-600">
            Create and manage gaming events with ease. Set participant limits, 
            manage applications, and track RSVPs.
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <UsersIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Community Building</h3>
          <p className="text-gray-600">
            Connect with like-minded gamers, build your network, and 
            participate in discussions about your favorite games.
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
            <TagIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Smart Matching</h3>
          <p className="text-gray-600">
            Use tags to find events that match your interests and skill level. 
            Discover new games and gaming communities.
          </p>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
          <p className="text-gray-600">
            Join these exciting gaming events happening soon
          </p>
        </div>

        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Unable to load events at the moment.</p>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event: any) => (
              <div key={event.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(new Date(event.eventDate), 'MMM dd, yyyy')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="w-4 h-4" />
                      <span>
                        {event.participantCount}
                        {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                      </span>
                    </div>
                  </div>

                  {event.games && event.games.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.games.slice(0, 3).map((game: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {game}
                        </span>
                      ))}
                      {event.games.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{event.games.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <Link 
                    to={`/events/${event.id}`}
                    className="flex items-center justify-center space-x-2 btn-outline w-full"
                  >
                    <span>View Details</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No upcoming events at the moment.</p>
            {isAuthenticated && (
              <Link to="/create-event" className="btn-primary">
                Create the First Event
              </Link>
            )}
          </div>
        )}

        <div className="text-center">
          <Link 
            to="/events" 
            className="inline-flex items-center space-x-2 btn-outline"
          >
            <span>View All Events</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="bg-primary-50 rounded-2xl p-8 text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Ready to Join the Community?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sign up today and start connecting with gamers in your area. 
            Create events, join discussions, and build lasting friendships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Create Account
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
