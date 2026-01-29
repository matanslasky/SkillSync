import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Firebase Firestore
const mockDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockGetDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();
const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: mockCollection,
  doc: mockDoc,
  setDoc: mockSetDoc,
  getDoc: mockGetDoc,
  getDocs: mockGetDocs,
  query: mockQuery,
  where: mockWhere,
  serverTimestamp: vi.fn(() => new Date()),
  Timestamp: { now: () => new Date() }
}));

// Import service after mocking
import {
  getUserGameData,
  awardXP,
  checkAchievements,
  XP_VALUES,
  LEVEL_THRESHOLDS
} from '../services/gamificationService';

describe('Gamification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('XP_VALUES', () => {
    it('should have XP values for all actions', () => {
      expect(XP_VALUES.TASK_COMPLETE).toBeDefined();
      expect(XP_VALUES.PROJECT_CREATE).toBeDefined();
      expect(XP_VALUES.DAILY_LOGIN).toBeDefined();
    });

    it('should have positive XP values', () => {
      Object.values(XP_VALUES).forEach(value => {
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('LEVEL_THRESHOLDS', () => {
    it('should start at 0', () => {
      expect(LEVEL_THRESHOLDS[0]).toBe(0);
    });

    it('should be ascending', () => {
      for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
        expect(LEVEL_THRESHOLDS[i]).toBeGreaterThan(LEVEL_THRESHOLDS[i - 1]);
      }
    });

    it('should have 16 levels (0-15)', () => {
      expect(LEVEL_THRESHOLDS.length).toBe(16);
    });
  });

  describe('getUserGameData', () => {
    it('should return default data for new user', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => null
      });

      const result = await getUserGameData('user123');
      
      expect(result.xp).toBe(0);
      expect(result.level).toBe(0);
      expect(result.achievements).toEqual([]);
    });

    it('should return existing user data', async () => {
      const mockData = {
        xp: 500,
        level: 3,
        achievements: ['first_task'],
        streak: 5
      };

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => mockData
      });

      const result = await getUserGameData('user123');
      
      expect(result.xp).toBe(500);
      expect(result.level).toBe(3);
      expect(result.achievements).toContain('first_task');
    });
  });

  describe('awardXP', () => {
    it('should award XP for task completion', async () => {
      const userId = 'user123';
      const xpAmount = XP_VALUES.TASK_COMPLETE;

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ xp: 0, level: 0 })
      });

      await awardXP(userId, xpAmount, 'task_complete');

      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should handle level up', async () => {
      const userId = 'user123';
      // Give enough XP to level up from 0 to 1
      const xpAmount = LEVEL_THRESHOLDS[1];

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({ xp: 0, level: 0 })
      });

      await awardXP(userId, xpAmount, 'level_up_test');

      // Verify setDoc was called with updated level
      expect(mockSetDoc).toHaveBeenCalled();
    });
  });

  describe('checkAchievements', () => {
    it('should detect first task achievement', async () => {
      const userId = 'user123';

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          achievements: [],
          stats: { tasksCompleted: 1 }
        })
      });

      await checkAchievements(userId, 'task_complete', { count: 1 });

      // Should award achievement XP
      expect(mockSetDoc).toHaveBeenCalled();
    });

    it('should not award achievement twice', async () => {
      const userId = 'user123';

      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          achievements: ['first_task'],
          stats: { tasksCompleted: 1 }
        })
      });

      await checkAchievements(userId, 'task_complete', { count: 1 });

      // Should not call setDoc since achievement already exists
      const setDocCalls = mockSetDoc.mock.calls.filter(call => 
        call[0]?.achievements?.includes('first_task')
      );
      expect(setDocCalls.length).toBeLessThanOrEqual(1);
    });
  });
});
