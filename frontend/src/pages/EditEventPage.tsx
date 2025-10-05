import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@apollo/client';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { GET_EVENT, GET_MY_EVENTS, GET_PUBLIC_EVENTS } from '../lib/graphql/queries';
import { UPDATE_EVENT } from '../lib/graphql/mutations';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EditEventFormData {
  name: string;
  description: string;
  location: string;
  maxParticipants: number | null;
  eventDate: string;
  isPublic: boolean;
}

const EditEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [games, setGames] = useState<string[]>([]);
  const [gameInput, setGameInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EditEventFormData>({
    defaultValues: {
      isPublic: true,
    },
  });

  const { data, loading, error } = useQuery(GET_EVENT, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'network-only',
  });

  const [updateEvent, { loading: saving }] = useMutation(UPDATE_EVENT, {
    refetchQueries: [
      { query: GET_EVENT, variables: { id } },
      { query: GET_MY_EVENTS },
      { query: GET_PUBLIC_EVENTS },
    ],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (data?.event) {
      const event = data.event;
      setValue('name', event.name);
      setValue('description', event.description || '');
      setValue('location', event.location || '');
      setValue('maxParticipants', event.maxParticipants ?? null);
      setValue('isPublic', event.isPublic);
      setValue('eventDate', format(new Date(event.eventDate), "yyyy-MM-dd'T'HH:mm"));
      setGames(event.games || []);
    }
  }, [data, setValue]);

  const addGame = () => {
    if (gameInput.trim() && !games.includes(gameInput.trim())) {
      setGames([...games, gameInput.trim()]);
      setGameInput('');
    }
  };

  const removeGame = (gameToRemove: string) => {
    setGames(games.filter(game => game !== gameToRemove));
  };

  const onSubmit = async (formData: EditEventFormData) => {
    if (!id) return;

    try {
      const maxParticipants = formData.maxParticipants ? formData.maxParticipants : null;

      await updateEvent({
        variables: {
          id,
          input: {
            name: formData.name,
            description: formData.description || null,
            location: formData.location || null,
            maxParticipants,
            eventDate: new Date(formData.eventDate).toISOString(),
            isPublic: formData.isPublic,
            games,
          },
        },
      });
      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (mutationError) {
      const message = mutationError instanceof Error ? mutationError.message : 'Failed to update event';
      toast.error(message);
    }
  };

  if (loading) return <LoadingSpinner className="py-12" />;
  if (error) return <div className="text-center py-12 text-red-600">Error loading event</div>;
  if (!data?.event) return <div className="text-center py-12">Event not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-2">
          Update the details of your event
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Event Name *
          </label>
          <input
            {...register('name', { required: 'Event name is required' })}
            type="text"
            className="input-field mt-1"
            placeholder="Enter event name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="input-field mt-1"
            placeholder="Describe your event..."
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            {...register('location')}
            type="text"
            className="input-field mt-1"
            placeholder="Enter location or 'Online'"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">
              Date & Time *
            </label>
            <input
              {...register('eventDate', { required: 'Event date is required' })}
              type="datetime-local"
              className="input-field mt-1"
            />
            {errors.eventDate && (
              <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700">
              Max Participants
            </label>
            <input
              {...register('maxParticipants', {
                min: { value: 1, message: 'Must be at least 1' },
                valueAsNumber: true,
              })}
              type="number"
              className="input-field mt-1"
              placeholder="No limit"
            />
            {errors.maxParticipants && (
              <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Games
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={gameInput}
              onChange={(e) => setGameInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGame())}
              className="input-field flex-1"
              placeholder="Add a game"
            />
            <button
              type="button"
              onClick={addGame}
              className="btn-outline flex items-center"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          {games.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {games.map((game, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full"
                >
                  {game}
                  <button
                    type="button"
                    onClick={() => removeGame(game)}
                    className="ml-2 text-primary-500 hover:text-primary-700"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center">
          <input
            {...register('isPublic')}
            type="checkbox"
            id="isPublic"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Make this event public (visible to all users)
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="btn-outline flex-1"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
