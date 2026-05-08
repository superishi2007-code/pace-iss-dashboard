import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Search, Calendar, User, ExternalLink, Filter } from 'lucide-react';

const SkeletonCard = () => (
  <div className="glass p-4 rounded-xl animate-pulse">
    <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
    <div className="flex justify-between">
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
    </div>
  </div>
);

const NewsDashboard = () => {
  const { newsData, fetchNews } = useDashboard();
  const { articles, loading, error } = newsData;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, source

  const filteredArticles = useMemo(() => {
    let result = articles.filter(article => 
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
    } else if (sortBy === 'source') {
      result.sort((a, b) => a.source.name.localeCompare(b.source.name));
    }

    return result;
  }, [articles, searchTerm, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchNews(searchTerm || 'technology');
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search news..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="pl-10 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="source">Source</option>
          </select>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 space-y-4 max-h-[800px]">
        {loading ? (
          Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : error ? (
          <div className="p-8 text-center glass rounded-xl">
            <p className="text-red-500 font-medium mb-2">Error loading news</p>
            <p className="text-sm text-slate-500">{error}</p>
            <button 
              onClick={() => fetchNews()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center glass rounded-xl text-slate-500">
            No articles found.
          </div>
        ) : (
          filteredArticles.map((article, i) => (
            <div key={i} className="glass group overflow-hidden rounded-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
              {article.urlToImage && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded tracking-wider">
                    {article.source.name}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight group-hover:text-blue-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {article.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <User size={12} />
                    <span className="truncate max-w-[100px]">{article.author || 'Anonymous'}</span>
                  </div>
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Read More <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsDashboard;
