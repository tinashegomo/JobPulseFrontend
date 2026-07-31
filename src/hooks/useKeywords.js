import { useGetKeywords, useCreateKeyword, useDeleteKeyword } from './useJobPulseHooks';

export const useKeywords = () => {
  const { data: keywords = [], isLoading: loading } = useGetKeywords();
  const createKeyword = useCreateKeyword();
  const deleteKeyword = useDeleteKeyword();

  const save = async (keyword) => {
    if (!keyword.trim()) return;
    createKeyword.mutate(keyword.trim());
  };

  const remove = async (keywordId) => {
    deleteKeyword.mutate(keywordId);
  };

  return { keywords, loading, save, remove };
};
