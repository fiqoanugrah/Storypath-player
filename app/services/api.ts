// app/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
});

export const getLocations = async (projectId: string | number) => {
  try {
    const response = await api.get(`/location?project_id=eq.${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }
};

export const getProject = async (projectId: string | number) => {
  try {
    const response = await api.get(`/project?id=eq.${projectId}`);
    return response.data[0];
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

export const addTracking = async (data: {
  project_id: number;
  location_id: number;
  points: number;
  participant_username: string;
}) => {
  try {
    const response = await api.post('/tracking', {
      ...data,
      username: 's4829897'
    });
    return response.data;
  } catch (error) {
    console.error('Error adding tracking:', error);
    throw error;
  }
};

export default api;