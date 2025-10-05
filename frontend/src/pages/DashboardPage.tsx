import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { 
  CalendarIcon, 
  UsersIcon, 
  PlusIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { GET_MY_EVENTS, GET_MY_PARTICIPATING_EVENTS, GET_PUBLIC_EVENTS } from '../lib/graphql/queries';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';
import { DELETE_EVENT } from '../lib/graphql/mutations';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const { data: myEventsData, loading: myEventsLoading } = useQuery(GET_MY_EVENTS);
  const { data: participatingData, loading: participatingLoading } = useQuery(GET_MY_PARTICIPATING_EVENTS);

  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleteEventMutation] = useMutation(DELETE_EVENT, {
    refetchQueries: [
      { query: GET_MY_EVENTS },
      { query: GET_PUBLIC_EVENTS },
      { query: GET_MY_PARTICIPATING_EVENTS },
    ],
    awaitRefetchQueries: true,
  });

  const myEvents = myEventsData?.myEvents || [];
  const participatingEvents = participatingData?.myParticipatingEvents || [];

  const loading = myEventsLoading || participatingLoading;

  const handleDeleteEvent = async (eventId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;

    try {
      setDeletingEventId(eventId);
      await deleteEventMutation({ variables: { id: eventId } });
      toast.success('Event deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete event';
      toast.error(message);
    } finally {
      setDeletingEventId(null);
    }
  };

  if (loading) return <LoadingSpinner className="py-12" />;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-primary-100 mb-6">
          Here's what's happening with your gaming events
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold">{myEvents.length}</p>
                <p className="text-sm text-primary-100">Events Hosted</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <UsersIcon className="h-8 w-8" />
              <div>
                <p className="text-2xl font-bold">{participatingEvents.length}</p>
                <p className="text-sm text-primary-100">Events Joined</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 flex items-center justify-center">
                🏷️
              </div>
              <div>
                <p className="text-2xl font-bold">{user?.tags?.length || 0}</p>
                <p className="text-sm text-primary-100">Tags</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/create-event" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <PlusIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Event</h3>
              <p className="text-sm text-gray-600">Start a new gaming session</p>
            </div>
          </div>
        </Link>
        
        <Link to="/events" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Browse Events</h3>
              <p className="text-sm text-gray-600">Find events to join</p>
            </div>
          </div>
        </Link>
        
        <Link to="/profile" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Profile</h3>
              <p className="text-sm text-gray-600">Manage your profile</p>
            </div>
          </div>
        </Link>
      </div>

      {/* My Events */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
          <Link to="/create-event" className="btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </div>
        
        {myEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myEvents.map((event: any) => (
              <div key={event.id} className="card p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{format(new Date(event.eventDate), 'MMM dd, yyyy • h:mm a')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UsersIcon className="w-4 h-4" />
                      <span>
                        {event.participantCount}
                        {event.maxParticipants && ` / ${event.maxParticipants}`} participants
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        event.isPublic 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {event.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>

                  <Link 
                    to={`/events/${event.id}`}
                    className="block w-full text-center btn-outline"
                  >
                    View Details
                  </Link>
                  <div className="flex gap-2">
                    <Link 
                      to={`/events/${event.id}/edit`}
                      className="btn-primary flex-1 text-center"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="btn-danger flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={deletingEventId === event.id}
                    >
                      {deletingEventId === event.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-500 mb-6">Create your first event to get started</p>
            <Link to="/create-event" className="btn-primary">
              Create Event
            </Link>
          </div>
        )}
      </div>

      {/* Participating Events */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Events I'm Attending</h2>
        
        {participatingEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {participatingEvents.map((event: any) => (
              <div key={event.id} className="card p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      by {event.owner.firstName} {event.owner.lastName}
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="w-4 h-4" />
                      <span>{format(new Date(event.eventDate), 'MMM dd, yyyy • h:mm a')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.games && event.games.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {event.games.slice(0, 2).map((game: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
                        >
                          {game}
                        </span>
                      ))}
                      {event.games.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{event.games.length - 2}
                        </span>
                      )}
                    </div>
                  )}

                  <Link 
                    to={`/events/${event.id}`}
                    className="block w-full text-center btn-outline"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events joined yet</h3>
            <p className="text-gray-500 mb-6">Browse events to find ones you'd like to join</p>
            <Link to="/events" className="btn-primary">
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
