'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

interface QuotationSearchProps {
  initialSearch: string;
  initialStatus: string;
}

export default function QuotationSearch({ initialSearch, initialStatus }: QuotationSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  const updateUrl = useCallback(
    (newSearch: string, newStatus: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newSearch) {
        params.set('q', newSearch);
      } else {
        params.delete('q');
      }

      if (newStatus && newStatus !== 'all') {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }

      startTransition(() => {
        router.push(`/panel/cotizaciones?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    updateUrl(value, initialStatus);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl(search, e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Buscar por código o cliente..."
          value={search}
          onChange={handleSearch}
          className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-colors"
        />
        {isPending && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Status Filter */}
      <select
        value={initialStatus || 'all'}
        onChange={handleStatusChange}
        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-colors bg-white min-w-[150px]"
      >
        <option value="all">Todos los estados</option>
        <option value="draft">Borradores</option>
        <option value="sent">Enviadas</option>
        <option value="approved">Aprobadas</option>
        <option value="rejected">Rechazadas</option>
      </select>
    </div>
  );
}
