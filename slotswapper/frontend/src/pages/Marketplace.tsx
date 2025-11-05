import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ArrowLeftRight, Clock, User } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  owner_id: number;
}

export default function Marketplace() {
  const queryClient = useQueryClient();
  const [selectedSlots, setSelectedSlots] = useState<Record<number, number>>({});

  const { data: swappableSlots = [], isLoading: loadingSlots } = useQuery<Event[]>({
    queryKey: ['swappable-slots'],
    queryFn: async () => {
      const { data } = await api.get('/swap/swappable-slots');
      return data;
    },
  });

  const { data: myEvents = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data } = await api.get('/events');
      return data;
    },
  });

  const mySwappableSlots = myEvents.filter((e) => e.status === 'SWAPPABLE');

  const requestSwap = async (theirSlotId: number) => {
    const mySlotId = selectedSlots[theirSlotId];
    if (!mySlotId) {
      alert('Please select one of your swappable slots to offer');
      return;
    }

    try {
      await api.post('/swap/swap-request', {
        mySlotId,
        theirSlotId,
      });
      queryClient.invalidateQueries({ queryKey: ['swappable-slots'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      alert('Swap request sent successfully!');
      setSelectedSlots((prev) => {
        const newState = { ...prev };
        delete newState[theirSlotId];
        return newState;
      });
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to send swap request');
    }
  };

  if (loadingSlots) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse and request swaps with other users' available slots
        </p>
      </div>

      {mySwappableSlots.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            You need at least one swappable slot to request swaps. Go to your Dashboard to make a slot swappable.
          </p>
        </div>
      )}

      {swappableSlots.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No slots available</h3>
          <p className="text-slate-600">
            There are currently no swappable slots from other users
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {swappableSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Available from another user</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{slot.title}</h3>
                  <div className="flex items-center text-sm text-slate-600 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(slot.start_time).toLocaleString()} →{' '}
                    {new Date(slot.end_time).toLocaleString()}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Offer one of your swappable slots:
                  </label>
                  <div className="flex items-center space-x-3">
                    <select
                      value={selectedSlots[slot.id] || ''}
                      onChange={(e) =>
                        setSelectedSlots({
                          ...selectedSlots,
                          [slot.id]: Number(e.target.value),
                        })
                      }
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={mySwappableSlots.length === 0}
                    >
                      <option value="">Select a slot...</option>
                      {mySwappableSlots.map((mySlot) => (
                        <option key={mySlot.id} value={mySlot.id}>
                          {mySlot.title} ({new Date(mySlot.start_time).toLocaleString()})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => requestSwap(slot.id)}
                      disabled={!selectedSlots[slot.id] || mySwappableSlots.length === 0}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeftRight className="w-4 h-4 mr-2" />
                      Request Swap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
