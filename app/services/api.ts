// app/services/api.ts
import axios from 'axios';

/**
 * Base URL and authentication configuration for the API
 */
const API_BASE_URL = 'https://0b5ff8b0.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4Mjk4OTcifQ.HzJAak5L7mp7DImPU8XEILtt_770CL-pA7H6yinT1d4';
export const USERNAME = 's4829897';

/**
 * Axios instance with preset configuration
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`
  }
});

/**
 * Error handler utility
 */
const handleError = (error: any, action: string) => {
  console.error(`Error ${action}:`, error.response?.data || error.message);
  throw error;
};

/**
 * API Functions for Projects
 */
export const projectsAPI = {
  // Get all published projects with participant counts
  getPublishedProjects: async () => {
    try {
      const projectsResponse = await api.get('/project?is_published=eq.true');
      return Promise.all(
        projectsResponse.data.map(async (project: any) => {
          const countResponse = await api.get(
            `/tracking?project_id=eq.${project.id}&select=participant_username`
          );
          const uniqueParticipants = new Set(
            countResponse.data.map((t: any) => t.participant_username)
          );
          return {
            ...project,
            participant_count: uniqueParticipants.size
          };
        })
      );
    } catch (error) {
      handleError(error, 'fetching published projects');
    }
  },

  // Get single project by ID
  getProject: async (id: string) => {
    try {
      const response = await api.get(`/project?id=eq.${id}`);
      return response.data[0];
    } catch (error) {
      handleError(error, 'fetching project');
    }
  }
};

/**
 * API Functions for Locations
 */
export const locationsAPI = {
  // Get locations for a project
  getProjectLocations: async (projectId: string) => {
    try {
      const response = await api.get(`/location?project_id=eq.${projectId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'fetching locations');
    }
  },

  // Get single location
  getLocation: async (id: string) => {
    try {
      const response = await api.get(`/location?id=eq.${id}`);
      return response.data[0];
    } catch (error) {
      handleError(error, 'fetching location');
    }
  }
};

/**
 * API Functions for Tracking
 */
export const trackingAPI = {
  // Add tracking record
  addTracking: async (data: {
    project_id: number;
    location_id: number;
    points: number;
    participant_username: string;
  }) => {
    try {
      const response = await api.post('/tracking', {
        ...data,
        username: USERNAME
      });
      return response.data;
    } catch (error) {
      handleError(error, 'adding tracking record');
    }
  },

  // Get tracking records for a project
  getProjectTracking: async (projectId: string) => {
    try {
      const response = await api.get(`/tracking?project_id=eq.${projectId}`);
      return response.data;
    } catch (error) {
      handleError(error, 'fetching project tracking');
    }
  }
};

export default api;