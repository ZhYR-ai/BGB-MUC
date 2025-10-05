import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { 
  CalendarIcon, 
  UsersIcon, 
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { GET_PUBLIC_EVENTS } from '../lib/graphql/queries';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const EventsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  
  const { data, loading, error } = useQuery(GET_PUBLIC_EVENTS, {
    // Trigger a background refetch so newly created events appear instantly.
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
  });

  const events = data?.publicEvents || [];
  
  // Get unique games for filter
  const allGames = events.reduce((games: string[], event: any) => {
    if (event.games) {
      games.push(...event.games);
    }
    return games;
  }, []);
  const uniqueGames = Array.from(new Set(allGames)).sort();

  // Filter events
  const filteredEvents = events.filter((event: any) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = !selectedGame || (event.games && event.games.includes(selectedGame));
    return matchesSearch && matchesGame;
  });

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <div className="text-center py-12 text-red-600">Error loading events</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gaming Events</h1>
          <p className="text-gray-600 mt-2">
            Discover and join gaming events in your community
          </p>
        </div>
        
        {isAuthenticated && (
          <Link to="/create-event" className="btn-primary">
            Create Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div className="md:w-64">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                <option value="">All Games</option>
                {uniqueGames.map((game) => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event: any) => (
            <div key={event.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {event.description}
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{format(new Date(event.eventDate), 'MMM dd, yyyy • h:mm a')}</span>
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
                  <div className="flex items-center space-x-2">
                    <span>👤</span>
                    <span>by {event.owner.firstName} {event.owner.lastName}</span>
                  </div>
                </div>

                {event.games && event.games.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {event.games.slice(0, 3).map((game: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
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
                  className="block w-full text-center btn-outline"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedGame 
              ? "Try adjusting your search criteria" 
              : "No events are currently available"
            }
          </p>
          {isAuthenticated && (
            <Link to="/create-event" className="btn-primary">
              Create the First Event
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
