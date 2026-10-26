import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { TaskRepository } from '../../src/main/database/task-repository';
import * as dbModule from '../../src/main/database/db';
import fs from 'fs';
import path from 'path';

describe('Carry-Forward & Task Rollover Engine', () => {
  const testDbPath = path.join(process.cwd(), 'test-rollover.db');

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    dbModule.initDatabase(testDbPath);
  });

  afterEach(() => {
    dbModule.closeDatabase();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it('preserves historical scheduled_date while flagging overdue tasks as carried forward', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    // Create an unfinished task yesterday
    const pastTask = TaskRepository.createTask({
      title: 'Finish invoice review',
      scheduled_date: yesterday,
      priority: 'high',
      status: 'pending',
      carry_forward_policy: 'auto_carry'
    });

    // Create a task today
    const todayTask = TaskRepository.createTask({
      title: 'Deploy update',
      scheduled_date: today,
      priority: 'medium',
      status: 'pending',
      carry_forward_policy: 'auto_carry'
    });

    // Query today's working set
    const workingSet = TaskRepository.getTasksForDate(today);

    // Should include both the carried-forward past task and today's task
    const carried = workingSet.find(t => t.id === pastTask.id);
    expect(carried).toBeDefined();
    expect(carried?.isCarriedForward).toBe(true);
    expect(carried?.scheduled_date).toBe(yesterday); // MUST NOT MUTATE ORIGINAL DATE
    expect(carried?.overdueDays).toBeGreaterThanOrEqual(1);

    const normal = workingSet.find(t => t.id === todayTask.id);
    expect(normal).toBeDefined();
    expect(normal?.isCarriedForward).toBe(false);
  });

  it('does not carry forward completed tasks into today as overdue', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    TaskRepository.createTask({
      title: 'Completed research',
      scheduled_date: twoDaysAgo,
      priority: 'low',
      status: 'completed',
      carry_forward_policy: 'auto_carry'
    });

    const workingSet = TaskRepository.getTasksForDate(today);
    const completedPast = workingSet.find(t => t.title === 'Completed research');
    expect(completedPast).toBeUndefined();
  });

  it('correctly toggles completion and updates timestamp', () => {
    const today = new Date().toISOString().slice(0, 10);
    const task = TaskRepository.createTask({
      title: 'Toggle test',
      scheduled_date: today,
      priority: 'medium',
      status: 'pending'
    });

    const completed = TaskRepository.toggleTaskStatus(task.id);
    expect(completed.status).toBe('completed');
    expect(completed.completed_at).toBeDefined();

    const reopened = TaskRepository.toggleTaskStatus(task.id);
    expect(reopened.status).toBe('pending');
    expect(reopened.completed_at).toBeNull();
  });

  it('keeps carried-forward tasks in today\'s working set when completed today so productivity updates correctly', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);

    const pastTask = TaskRepository.createTask({
      title: 'Overdue task finished today',
      scheduled_date: yesterday,
      priority: 'high',
      status: 'pending',
      carry_forward_policy: 'auto_carry'
    });

    // Mark it completed today
    const completed = TaskRepository.toggleTaskStatus(pastTask.id);
    expect(completed.status).toBe('completed');
    expect(completed.completed_at).toContain(today);

    // Fetch today's tasks
    const workingSet = TaskRepository.getTasksForDate(today);
    const found = workingSet.find(t => t.id === pastTask.id);

    expect(found).toBeDefined();
    expect(found?.status).toBe('completed');
    expect(found?.isCarriedForward).toBe(true);
  });
});
