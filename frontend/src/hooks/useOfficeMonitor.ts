import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import type { EnergyResponse, OfficeSummaryDto } from '../services/types';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'error';

export function useOfficeMonitor() {
  const queryClient = useQueryClient();
  const [connection, setConnection] = useState<ConnectionStatus>('connecting');

  const summary = useQuery<OfficeSummaryDto>({
    queryKey: ['summary'],
    queryFn: api.summary,
    refetchInterval: 15000, // safety net if a socket event is missed
  });

  const energy = useQuery<EnergyResponse>({
    queryKey: ['energy'],
    queryFn: api.energy,
    refetchInterval: 20000,
  });

  useEffect(() => {
    const socket = getSocket();

    const onSummary = (data: OfficeSummaryDto) =>
      queryClient.setQueryData(['summary'], data);
    const refetchEnergy = () => queryClient.invalidateQueries({ queryKey: ['energy'] });
    const refetchAll = () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['energy'] });
    };

    socket.on('connect', () => {
      setConnection('connected');
      refetchAll(); // refetch on (re)connect so we never show stale data
    });
    socket.on('disconnect', () => setConnection('reconnecting'));
    socket.io.on('reconnect_attempt', () => setConnection('reconnecting'));
    socket.io.on('error', () => setConnection('error'));

    socket.on('office:summary.updated', onSummary);
    socket.on('energy:sample.created', refetchEnergy);
    socket.on('alert:created', () =>
      queryClient.invalidateQueries({ queryKey: ['summary'] }),
    );
    socket.on('alert:resolved', () =>
      queryClient.invalidateQueries({ queryKey: ['summary'] }),
    );

    if (socket.connected) setConnection('connected');

    return () => {
      socket.off('office:summary.updated', onSummary);
      socket.off('energy:sample.created', refetchEnergy);
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [queryClient]);

  return { summary, energy, connection };
}
