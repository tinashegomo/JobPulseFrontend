import axios from "axios";
import { getStoredToken, isTokenExpired, removeToken } from "../utils/tokenUtils";

export const API = axios.create({
    baseURL: "https://jobpulsebackend.onrender.com/api"
});

API.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    if (isTokenExpired(token)) {
      removeToken();
      return config;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      removeToken();
      window.location.href = "/login";
    }
    throw error;
  }
);

/* AUTH APIs */

export const registerUser = async (RegisterRequest) => {
    const response = await API.post("/auth/register", RegisterRequest);
    return response.data;
};

export const loginUser = async (LoginRequest) => {
    const response = await API.post("/auth/login", LoginRequest);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await API.get("/auth/me");
    return response.data;
};

export const refreshToken = async () => {
    const response = await API.post("/auth/refresh");
    return response.data;
};

/* ALERT APIs */

export const createAlert = async (AlertRequest) => {
    const response = await API.post("/alerts", AlertRequest);
    return response.data;
};

export const getAlerts = async () => {
    const response = await API.get("/alerts");
    return response.data;
};

export const getAlertById = async (id) => {
    const response = await API.get(`/alerts/${id}`);
    return response.data;
};

export const updateAlert = async (id, AlertRequest) => {
    const response = await API.put(`/alerts/${id}`, AlertRequest);
    return response.data;
};

export const deleteAlert = async (id) => {
    await API.delete(`/alerts/${id}`);
};

/* RESUME PROFILE APIs */

export const createOrUpdateProfile = async (ResumeProfileRequest) => {
    const response = await API.post("/resume-profiles", ResumeProfileRequest);
    return response.data;
};

export const getMyProfile = async () => {
    const response = await API.get("/resume-profiles/me");
    return response.data;
};

export const deleteProfile = async () => {
    await API.delete("/resume-profiles/me");
};

/* API KEY APIs */

export const saveApiKey = async (ApiKeyRequest) => {
    const response = await API.post("/api-keys", ApiKeyRequest);
    return response.data;
};

export const getApiKeys = async () => {
    const response = await API.get("/api-keys");
    return response.data;
};

export const deleteApiKey = async (id) => {
    await API.delete(`/api-keys/${id}`);
};

/* JOB APIs */

export const getAllJobs = async () => {
    const response = await API.get("/jobs");
    return response.data;
};

export const getJobById = async (id) => {
    const response = await API.get(`/jobs/${id}`);
    return response.data;
};

/* USER JOB APIs */

export const getMyJobs = async () => {
    const response = await API.get("/user-jobs/me");
    return response.data;
};

export const getUnnotifiedJobs = async () => {
    const response = await API.get("/user-jobs/me/unnotified");
    return response.data;
};

export const markJobSeen = async (userJobId) => {
    await API.patch(`/user-jobs/${userJobId}/seen`);
};

export const markJobUnseen = async (userJobId) => {
    await API.patch(`/user-jobs/${userJobId}/unseen`);
};

export const hideJob = async (userJobId) => {
    await API.patch(`/user-jobs/${userJobId}/hide`);
};

export const deleteAllMyJobs = async () => {
    await API.delete("/user-jobs/me");
};

/* KEYWORD APIs */

export const getKeywords = async () => {
    const response = await API.get("/keywords");
    return response.data;
};

export const createKeyword = async (keyword) => {
    const response = await API.post("/keywords", { keyword });
    return response.data;
};

export const deleteKeyword = async (id) => {
    await API.delete(`/keywords/${id}`);
};
