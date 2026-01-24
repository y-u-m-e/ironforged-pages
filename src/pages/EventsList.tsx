/**
 * Events List - Show all tile events
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.emuy.gg';

interface TileEvent {
  id: number;
  name: string;
  description?: string;
  is_active: number;
  tile_count: number;
  participant_count: number;
}

export default function EventsList() {
  const { isEventsAdmin } = useAuth();
  const [events, setEvents] = useState<TileEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/events`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
    setLoading(false);
  };

  const activeEvents = events.filter(e => e.is_active);
  const pastEvents = events.filter(e => !e.is_active);

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400">Loading events...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-forge-400">Tile Events</h1>
        {isEventsAdmin && (
          <Link
            to="/admin"
            className="px-4 py-2 bg-forge-600 text-white rounded-lg hover:bg-forge-700"
          >
            Manage Events
          </Link>
        )}
      </div>

      {activeEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-green-400 mb-4">🟢 Active Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEvents.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block p-6 bg-gray-800 rounded-lg border border-green-600/50 hover:border-green-500 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{event.name}</h3>
                {event.description && (
                  <p className="text-gray-400 text-sm mb-4">{event.description}</p>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{event.tile_count} tiles</span>
                  <span>{event.participant_count} participants</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-500 mb-4">⚫ Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map(event => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block p-6 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors opacity-75"
              >
                <h3 className="text-lg font-semibold text-gray-300 mb-2">{event.name}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{event.tile_count} tiles</span>
                  <span>{event.participant_count} participants</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400">No events yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

