'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchFilterProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  filters?: {
    label: string;
    value: string;
    active: boolean;
  }[];
  onFilterToggle?: (value: string) => void;
}

export function SearchFilter({ 
  placeholder = 'Search...', 
  onSearch,
  filters = [],
  onFilterToggle 
}: SearchFilterProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  const activeFiltersCount = filters.filter(f => f.active).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {filters.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            {activeFiltersCount > 0 && (
              <Badge variant="success" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-border bg-card">
          {filters.map((filter) => (
            <Badge
              key={filter.value}
              variant={filter.active ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onFilterToggle?.(filter.value)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

