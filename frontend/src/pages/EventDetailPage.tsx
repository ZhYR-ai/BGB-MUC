import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_EVENT } from '../lib/graphql/queries';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: { id },
    skip: !id
  });

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <div className="text-center py-12 text-red-600">Error loading event</div>;
  if (!data?.event) return <div className="text-center py-12">Event not found</div>;

  const event = data.event;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="card p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.name}</h1>
        <p className="text-gray-600 mb-6">{event.description}</p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Date:</strong> {new Date(event.eventDate).toLocaleDateString()}</p>
              <p><strong>Location:</strong> {event.location || 'Online'}</p>
              <p><strong>Participants:</strong> {event.participantCount}{event.maxParticipants && ` / ${event.maxParticipants}`}</p>
              <p><strong>Status:</strong> {event.isPublic ? 'Public' : 'Private'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Host</h3>
            <p className="text-sm text-gray-600">
              {event.owner.firstName} {event.owner.lastName}
            </p>
          </div>
        </div>

        {event.games && event.games.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Games</h3>
            <div className="flex flex-wrap gap-2">
              {event.games.map((game: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                >
                  {game}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;
