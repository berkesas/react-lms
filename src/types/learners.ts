import { BaseMetadata } from './common';

/**
 * Learner-related types
 */

export interface LearnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  enrolledCourses?: string[];
  completedCourses?: string[];
  skills?: string[];
  achievements?: Achievement[];
  progress?: LearnerProgress;
  metadata?: BaseMetadata;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  earnedAt: string;
  category?: string;
}

export interface LearnerProgress {
  overallProgress: number; // 0-100
  coursesInProgress: number;
  coursesCompleted: number;
  totalPoints: number;
  streak?: number; // days
  lastActiveAt?: string;
}

export interface LearnerListItem {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  progress?: number;
  status?: 'active' | 'inactive' | 'completed';
  enrolledAt?: string;
  lastActiveAt?: string;
}

export interface LearnerFilterOptions {
  search?: string;
  status?: 'active' | 'inactive' | 'completed' | 'all';
  sortBy?: 'name' | 'progress' | 'enrolledAt' | 'lastActive';
  sortOrder?: 'asc' | 'desc';
}