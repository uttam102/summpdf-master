import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFolders, getReviewQueue, getStudyStats } from '@/lib/study';

const StudyContext = createContext();

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

export const StudyProvider = ({ children, userId }) => {
  const [folders, setFolders] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [studyStats, setStudyStats] = useState({
    totalSummaries: 0,
    completedSummaries: 0,
    inProgressSummaries: 0,
    reviewingSummaries: 0,
    totalReviews: 0,
    avgProgress: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial study data
  useEffect(() => {
    if (!userId) return;

    loadStudyData();
  }, [userId]);

  const loadStudyData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [foldersData, queueData, statsData] = await Promise.all([
        getFolders(userId),
        getReviewQueue(userId, 10),
        getStudyStats(userId),
      ]);

      setFolders(foldersData);
      setReviewQueue(queueData.summaries || []);
      setStudyStats(statsData.stats || {
        totalSummaries: 0,
        completedSummaries: 0,
        inProgressSummaries: 0,
        reviewingSummaries: 0,
        totalReviews: 0,
        avgProgress: 0,
        currentStreak: 0,
      });
    } catch (err) {
      setError(err.message);
      console.error('Failed to load study data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refetchFolders = async () => {
    try {
      const foldersData = await getFolders(userId);
      setFolders(foldersData);
    } catch (err) {
      setError(err.message);
    }
  };

  const refetchReviewQueue = async () => {
    try {
      const queueData = await getReviewQueue(userId, 10);
      setReviewQueue(queueData.summaries || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const refetchStats = async () => {
    try {
      const statsData = await getStudyStats(userId);
      setStudyStats(statsData.stats || studyStats);
    } catch (err) {
      setError(err.message);
    }
  };

  const value = {
    folders,
    reviewQueue,
    studyStats,
    loading,
    error,
    refetchFolders,
    refetchReviewQueue,
    refetchStats,
    loadStudyData,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};
