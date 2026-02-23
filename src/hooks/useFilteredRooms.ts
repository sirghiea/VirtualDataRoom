import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';

export function useFilteredRooms() {
  const { rooms } = useAppSelector((s) => s.dataRooms);
  const { homeSearchQuery, homeSortBy, homeSortDirection, homeFilter } =
    useAppSelector((s) => s.ui);

  return useMemo(() => {
    let filtered = [...rooms];

    // Search
    if (homeSearchQuery.trim()) {
      const q = homeSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((r) => r.name.toLowerCase().includes(q));
    }

    // Protection filter
    if (homeFilter === 'protected') {
      filtered = filtered.filter((r) => !!r.passwordHash);
    } else if (homeFilter === 'unprotected') {
      filtered = filtered.filter((r) => !r.passwordHash);
    }

    // Sort
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (homeSortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'created':
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
          cmp =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      return homeSortDirection === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [rooms, homeSearchQuery, homeSortBy, homeSortDirection, homeFilter]);
}
