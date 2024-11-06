// app/types/api.ts
export interface Project {
    id: number;
    title: string;
    description: string;
    is_published: boolean;
    participant_scoring: string;
    username: string;
    instructions: string;
    initial_clue: string;
    homescreen_display: string;
    participant_count?: number;
  }
  
  export interface Location {
    id: number;
    project_id: number;
    location_name: string;
    location_trigger: string;
    location_position: string;
    score_points: number;
    clue: string;
    location_content: string;
  }
  
  export interface TrackingRecord {
    id: number;
    project_id: number;
    location_id: number;
    points: number;
    username: string;
    participant_username: string;
  }