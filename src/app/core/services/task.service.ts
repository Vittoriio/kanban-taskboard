import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, TaskStatus } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksSubject = new BehaviorSubject<Task[]>([
    {
      id: 't1',
      title: 'UI/UX Design in the age of AI',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      status: 'Planned',
      priority: 'High',
      date: '2025-12-02',
      comments: 11,
      assignees: ['Anna', 'Mark', 'Kai']
    },
    {
      id: 't2',
      title: 'Responsive Website Design for 23 more clients',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      status: 'Planned',
      priority: 'Low',
      date: '2025-12-02',
      comments: 32,
      assignees: ['Sam', 'Lee']
    },
    {
      id: 't3',
      title: 'Landing page for Azunyan senpai',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      status: 'Planned',
      priority: 'Low',
      date: '2025-12-02',
      comments: 5,
      assignees: ['Tom']
    },
    {
      id: 't4',
      title: 'User flow confirmation for finance app',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      status: 'Pending',
      priority: 'High',
      date: '2025-12-05',
      comments: 8,
      assignees: ['Kate']
    },
    {
      id: 't5',
      title: 'Healthcare app wireframe flow',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      status: 'Pending',
      priority: 'High',
      date: '2025-12-06',
      comments: 221,
      assignees: ['Anna', 'Mark', 'Kai']
    },
    {
      id: 't6',
      title: 'UI/UX Design in the age of AI',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      status: 'Completed',
      priority: 'High',
      date: '2025-12-08',
      comments: 108000,
      assignees: ['Team']
    },
    {
      id: 't7',
      title: 'UI/UX Design in the age of AI',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      status: 'Completed',
      priority: 'Low',
      date: '2025-12-07',
      comments: 17,
      assignees: ['Al']
    }
  ]);

  readonly tasks$ = this.tasksSubject.asObservable();
  private readonly storageKey = 'kanban_tasks_v1';

  addTask(task: Task) {
    const tasks = this.tasksSubject.getValue();
    const order = this.nextOrder(task.status, tasks);
    this.tasksSubject.next([{ ...task, id: crypto.randomUUID(), order }, ...tasks]);
  }

  updateTask(id: string, partial: Partial<Task>) {
    const tasks = this.tasksSubject.getValue().map(t => (t.id === id ? { ...t, ...partial } : t));
    this.tasksSubject.next(tasks);
  }

  setStatus(id: string, status: Task['status']) {
    this.updateTask(id, { status });
  }

  reorderTask(dragId: string, status: TaskStatus, beforeId: string | null) {
    const tasks = this.tasksSubject.getValue();
    const dragged = tasks.find(t => t.id === dragId);
    if (!dragged) return;
    const previousStatus = dragged.status;
    const moved = tasks.map(t => (t.id === dragId ? { ...t, status } : t));

    const target = moved
      .filter(t => t.status === status && t.id !== dragId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const insertIndex = beforeId ? target.findIndex(t => t.id === beforeId) : target.length;
    target.splice(insertIndex, 0, { ...dragged, status });

    const nextOrderTarget: Record<string, number> = {};
    target.forEach((t, i) => (nextOrderTarget[t.id] = i));

    const source = moved
      .filter(t => t.status === previousStatus && t.id !== dragId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const nextOrderSource: Record<string, number> = {};
    source.forEach((t, i) => (nextOrderSource[t.id] = i));

    const final = moved.map(t => {
      if (t.status === status) return { ...t, order: nextOrderTarget[t.id] ?? t.order ?? 0 };
      if (t.status === previousStatus) return { ...t, order: nextOrderSource[t.id] ?? t.order ?? 0 };
      return t;
    });
    this.tasksSubject.next(final);
  }

  private nextOrder(status: TaskStatus, tasks: Task[]) {
    const col = tasks.filter(t => t.status === status);
    return col.length;
  }

  constructor() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(this.storageKey) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Task[];
        this.tasksSubject.next(parsed);
      } catch {}
    } else {
    const seeded = this.tasksSubject.getValue();
    const counters: Record<TaskStatus, number> = { 'Planned': 0, 'Pending': 0, 'Completed': 0 };
      const withOrder = seeded.map(t => ({ ...t, order: counters[t.status]++ }));
      this.tasksSubject.next(withOrder);
    }
    this.tasks$.subscribe(list => {
      try {
        if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, JSON.stringify(list));
      } catch {}
    });
  }

  deleteTask(id: string) {
    const tasks = this.tasksSubject.getValue().filter(t => t.id !== id);
    this.tasksSubject.next(tasks);
  }
}