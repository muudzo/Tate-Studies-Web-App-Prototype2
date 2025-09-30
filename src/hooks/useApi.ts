import { useState, useCallback } from 'react';
import apiService from '../services/api';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async (apiMethod: Function, ...args: any[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiMethod.apply(apiService, args);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAndProcess = useCallback(async (file: File, subject: string, userId?: string) => {
    return callApi(apiService.processFile, file, subject, userId);
  }, [callApi]);

  const getSummaries = useCallback(async (userId?: string) => {
    return callApi(apiService.getUserSummaries, userId);
  }, [callApi]);

  const getProgress = useCallback(async (userId?: string) => {
    return callApi(apiService.getUserProgress, userId);
  }, [callApi]);

  const updateSummary = useCallback(async (summaryId: string, updates: any) => {
    return callApi(apiService.updateSummary, summaryId, updates);
  }, [callApi]);

  const deleteSummary = useCallback(async (summaryId: string) => {
    return callApi(apiService.deleteSummary, summaryId);
  }, [callApi]);

  const generateMultipleChoice = useCallback(async (summaryId: string, numQuestions?: number) => {
    return callApi(apiService.generateMultipleChoice, summaryId, numQuestions);
  }, [callApi]);

  return {
    loading,
    error,
    uploadAndProcess,
    getSummaries,
    getProgress,
    updateSummary,
    deleteSummary,
    generateMultipleChoice,
    apiService
  };
}
