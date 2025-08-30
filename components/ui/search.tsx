import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Search, Filter, X, Users, User, FileText, DollarSign, Calendar } from 'lucide-react';
import { databaseHelpers } from '../../lib/database';

export interface SearchResult {
  type: 'deceased' | 'contributor' | 'contribution' | 'expense';
  id: number;
  title: string;
  subtitle: string;
  details: string;
  icon: React.ReactNode;
  data: any;
}

interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
}

export function GlobalSearch({ onResultClick, placeholder = "Search deceased, contributors, contributions..." }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    deceased: true,
    contributors: true,
    contributions: true,
    expenses: true
  });

  useEffect(() => {
    if (query.trim().length >= 2) {
      performSearch();
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, filters]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const searchResults: SearchResult[] = [];
      const searchTerm = query.toLowerCase();

      // Search deceased
      if (filters.deceased) {
        const deceased = await databaseHelpers.getAllDeceased();
        deceased.forEach(deceased => {
          if (
            deceased.name.toLowerCase().includes(searchTerm) ||
            deceased.representativeName.toLowerCase().includes(searchTerm) ||
            deceased.representativePhone.includes(searchTerm)
          ) {
            searchResults.push({
              type: 'deceased',
              id: deceased.id!,
              title: deceased.name,
              subtitle: `Age: ${deceased.age} • ${deceased.gender}`,
              details: `Representative: ${deceased.representativeName} • Status: ${deceased.status}`,
              icon: <User className="h-4 w-4" />,
              data: deceased
            });
          }
        });
      }

      // Search contributors
      if (filters.contributors) {
        const contributors = await databaseHelpers.getAllContributors();
        contributors.forEach(contributor => {
          if (
            contributor.name.toLowerCase().includes(searchTerm) ||
            contributor.phone.includes(searchTerm) ||
            contributor.religion.toLowerCase().includes(searchTerm)
          ) {
            searchResults.push({
              type: 'contributor',
              id: contributor.id!,
              title: contributor.name,
              subtitle: `${contributor.religion} • ${contributor.phone}`,
              details: `Expected: ₵${contributor.expectedContribution.toLocaleString()}`,
              icon: <Users className="h-4 w-4" />,
              data: contributor
            });
          }
        });
      }

      // Search contributions
      if (filters.contributions) {
        const contributions = await databaseHelpers.getAllContributions();
        const deceased = await databaseHelpers.getAllDeceased();
        const contributors = await databaseHelpers.getAllContributors();

        contributions.forEach(contribution => {
          const deceasedName = deceased.find(d => d.id === contribution.deceasedId)?.name || 'Unknown';
          const contributorName = contributors.find(c => c.id === contribution.contributorId)?.name || 'Unknown';
          
          if (
            deceasedName.toLowerCase().includes(searchTerm) ||
            contributorName.toLowerCase().includes(searchTerm) ||
            contribution.notes?.toLowerCase().includes(searchTerm) ||
            contribution.amount.toString().includes(searchTerm)
          ) {
            searchResults.push({
              type: 'contribution',
              id: contribution.id!,
              title: `₵${contribution.amount.toLocaleString()}`,
              subtitle: `${contributorName} → ${deceasedName}`,
              details: `${new Date(contribution.date).toLocaleDateString()} • ${contribution.notes || 'No notes'}`,
              icon: <DollarSign className="h-4 w-4" />,
              data: contribution
            });
          }
        });
      }

      // Search expenses
      if (filters.expenses) {
        const expenses = await databaseHelpers.getAllExpenses();
        const deceased = await databaseHelpers.getAllDeceased();

        expenses.forEach(expense => {
          const deceasedName = deceased.find(d => d.id === expense.deceasedId)?.name || 'Unknown';
          
          if (
            expense.description.toLowerCase().includes(searchTerm) ||
            deceasedName.toLowerCase().includes(searchTerm) ||
            expense.amount.toString().includes(searchTerm)
          ) {
            searchResults.push({
              type: 'expense',
              id: expense.id!,
              title: expense.description,
              subtitle: `₵${expense.amount.toLocaleString()} • ${deceasedName}`,
              details: `${new Date(expense.date).toLocaleDateString()}`,
              icon: <FileText className="h-4 w-4" />,
              data: expense
            });
          }
        });
      }

      setResults(searchResults.slice(0, 10)); // Limit to 10 results
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    onResultClick?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deceased': return 'text-blue-600 bg-blue-50';
      case 'contributor': return 'text-green-600 bg-green-50';
      case 'contribution': return 'text-purple-600 bg-purple-50';
      case 'expense': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          variant={filters.deceased ? "default" : "outline"}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, deceased: !prev.deceased }))}
          className="text-xs"
        >
          <User className="h-3 w-3 mr-1" />
          Deceased
        </Button>
        <Button
          variant={filters.contributors ? "default" : "outline"}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, contributors: !prev.contributors }))}
          className="text-xs"
        >
          <Users className="h-3 w-3 mr-1" />
          Contributors
        </Button>
        <Button
          variant={filters.contributions ? "default" : "outline"}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, contributions: !prev.contributions }))}
          className="text-xs"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          Contributions
        </Button>
        <Button
          variant={filters.expenses ? "default" : "outline"}
          size="sm"
          onClick={() => setFilters(prev => ({ ...prev, expenses: !prev.expenses }))}
          className="text-xs"
        >
          <FileText className="h-3 w-3 mr-1" />
          Expenses
        </Button>
      </div>

      {/* Search Results */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Search Results ({results.length})</span>
              {isSearching && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />}
            </CardTitle>
            <CardDescription>
              Click on a result to view details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {isSearching ? 'Searching...' : 'No results found'}
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`p-2 rounded-full ${getTypeColor(result.type)}`}>
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{result.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.details}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!query && (
        <div className="mt-2 text-xs text-muted-foreground">
          💡 <strong>Search Tips:</strong> Type at least 2 characters to search. Use filters to narrow results by type.
        </div>
      )}
    </div>
  );
}
