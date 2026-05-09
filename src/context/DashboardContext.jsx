import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [issData, setIssData] = useState({
    position: { lat: 0, lng: 0 },
    speed: 0,
    path: [],
    astronauts: [],
    loading: true
  });
  const [newsData, setNewsData] = useState({
    articles: [],
    loading: true,
    error: null,
    lastFetched: null
  });

  // Theme management
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  // Haversine formula to calculate distance between two points in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchISSData = useCallback(async () => {
    try {
      const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
      const { latitude, longitude, velocity } = response.data;
      const newPos = { lat: parseFloat(latitude), lng: parseFloat(longitude) };

      setIssData(prev => {
        const newPath = [...prev.path, newPos].slice(-15);
        return {
          ...prev,
          position: newPos,
          speed: velocity, // This API provides velocity directly in km/h
          path: newPath,
          loading: false
        };
      });
    } catch (error) {
      console.error('Error fetching ISS position:', error);
      toast.error('Failed to fetch ISS position');
    }
  }, []);

  const fetchAstronauts = async () => {
    try {
      const response = await axios.get('https://api.open-notify.org/astros.json');
      setIssData(prev => ({ ...prev, astronauts: response.data.people }));
    } catch (error) {
      console.error('Error fetching astronauts:', error);
    }
  };

  const fetchNews = useCallback(async (query = 'space OR iss') => {
    const cached = localStorage.getItem('news_cache');
    if (cached) {
      const { articles, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 15 * 60 * 1000) {
        setNewsData({ articles, loading: false, error: null, lastFetched: timestamp });
        return;
      }
    }

    try {
      setNewsData(prev => ({ ...prev, loading: true }));
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey || apiKey === 'your_news_api_key_here') {
        throw new Error('GNews API key is missing');
      }

      const response = await axios.get(`https://gnews.io/api/v4/search?q=${query}&token=${apiKey}&lang=en&max=10`);
      
      // Map GNews structure to our expected structure
      const articles = response.data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.image, // Map 'image' to 'urlToImage'
        publishedAt: article.publishedAt,
        source: article.source,
        author: null // GNews doesn't usually provide author in search
      }));

      const timestamp = Date.now();
      localStorage.setItem('news_cache', JSON.stringify({ articles, timestamp }));
      setNewsData({ articles, loading: false, error: null, lastFetched: timestamp });
    } catch (error) {
      console.error('Error fetching news:', error);
      setNewsData(prev => ({ ...prev, loading: false, error: error.message }));
      toast.error('Failed to fetch news. Check your API key.');
    }
  }, []);

  useEffect(() => {
    fetchISSData();
    fetchAstronauts();
    fetchNews();

    const issInterval = setInterval(fetchISSData, 15000);
    return () => clearInterval(issInterval);
  }, [fetchISSData, fetchNews]);

  const value = {
    theme,
    toggleTheme,
    issData,
    newsData,
    fetchNews
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};
