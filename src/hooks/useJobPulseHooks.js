import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  getMyProfile,
  createOrUpdateProfile,
  deleteProfile,
  getApiKeys,
  saveApiKey,
  deleteApiKey,
  getAllJobs,
  getMyJobs,
  getUnnotifiedJobs,
  markJobSeen,
  markJobUnseen,
  hideJob,
  deleteAllMyJobs,
  getKeywords,
  createKeyword,
  deleteKeyword,
} from "../api/JobPulseAPI";

const sortByRecent = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

/* ALERT HOOKS */

export function useGetAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    select: (data) => [...data].sort(sortByRecent),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlert,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateAlert(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
  });
}

/* RESUME PROFILE HOOKS */

export function useGetMyProfile() {
  return useQuery({
    queryKey: ["resumeProfile"],
    queryFn: getMyProfile,
  });
}

export function useCreateOrUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrUpdateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumeProfile"] }),
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["resumeProfile"] }),
  });
}

/* API KEY HOOKS */

export function useGetApiKeys() {
  return useQuery({
    queryKey: ["apiKeys"],
    queryFn: getApiKeys,
  });
}

export function useSaveApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiKeys"] }),
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["apiKeys"] }),
  });
}

/* JOB HOOKS */

export function useGetAllJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: getAllJobs,
    select: (data) => [...data].sort(sortByRecent),
  });
}

export function useGetMyJobs() {
  return useQuery({
    queryKey: ["userJobs"],
    queryFn: getMyJobs,
    select: (data) => [...data].sort((a, b) => (b.score || 0) - (a.score || 0)),
  });
}

export function useGetUnnotifiedJobs() {
  return useQuery({
    queryKey: ["unnotifiedJobs"],
    queryFn: getUnnotifiedJobs,
  });
}

/* USER JOB MUTATION HOOKS */

export function useMarkJobSeen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markJobSeen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userJobs"] }),
  });
}

export function useMarkJobUnseen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markJobUnseen,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userJobs"] }),
  });
}

export function useHideJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hideJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userJobs"] }),
  });
}

export function useDeleteAllMyJobs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllMyJobs,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userJobs"] }),
  });
}

/* KEYWORD HOOKS */

export function useGetKeywords() {
  return useQuery({
    queryKey: ["keywords"],
    queryFn: getKeywords,
  });
}

export function useCreateKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKeyword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["keywords"] }),
  });
}

export function useDeleteKeyword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteKeyword,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["keywords"] }),
  });
}
