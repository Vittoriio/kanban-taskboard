import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { map, startWith, combineLatest, Observable } from 'rxjs';
import { Task, TaskStatus } from '../../core/models/task';
import { TaskService } from '../../core/services/task.service';
import { TaskCardComponent } from '../../shared/task-card/task-card.component';
import { AddTaskModalComponent } from '../../shared/add-task-modal/add-task-modal.component';
import { InviteBarComponent } from '../../shared/invite-bar/invite-bar.component';
import { TaskDetailsModalComponent } from '../../shared/task-details-modal/task-details-modal.component';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TaskCardComponent, AddTaskModalComponent, InviteBarComponent, TaskDetailsModalComponent, DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  showAdd = false;
  editing: Task | null = null;
  filter: any;
  readonly filtered$: Observable<Task[]>;
  showFilters = false;
  showSort = false;

  constructor(private fb: FormBuilder, private tasks: TaskService) {
    this.filter = this.fb.nonNullable.group({ search: [''], priority: ['All'], date: [''], sort: ['Default'] });
    type FilterValue = { search: string; priority: string; date: string; sort: string };
    this.filtered$ = combineLatest([
      this.tasks.tasks$,
      (this.filter.valueChanges as Observable<FilterValue>).pipe(
        startWith(this.filter.getRawValue() as FilterValue)
      )
    ]).pipe(
      map(([tasks, f]) => {
        const term = (f.search ?? '').toLowerCase();
        const priority = f.priority ?? 'All';
        const date = f.date ?? '';
        const filtered = tasks.filter((t: Task) => {
          const matchesTerm = !term || t.title.toLowerCase().includes(term);
          const matchesPriority = priority === 'All' || (t.priority ?? 'None') === priority;
          const matchesDate = !date || t.date === date;
          return matchesTerm && matchesPriority && matchesDate;
        });
        const sort = f.sort ?? 'Default';
        const dateVal = (t: Task) => new Date(t.date ?? '').getTime() || 0;
        const prio = (t: Task) => ({ High: 3, Medium: 2, Low: 1, None: 0 }[t.priority ?? 'None']);
        if (sort === 'Title A-Z') filtered.sort((a,b)=>a.title.localeCompare(b.title));
        if (sort === 'Priority') filtered.sort((a,b)=> prio(b) - prio(a));
        if (sort === 'Date Newest') filtered.sort((a,b)=> dateVal(b)-dateVal(a));
        if (sort === 'Date Oldest') filtered.sort((a,b)=> dateVal(a)-dateVal(b));
        return filtered;
      })
    );

  }

  openAdd() { this.showAdd = true; }
  closeAdd() { this.showAdd = false; }
  toggleFilters() { this.showFilters = !this.showFilters; if (this.showFilters) this.showSort = false; }
  toggleSort() { this.showSort = !this.showSort; if (this.showSort) this.showFilters = false; }

  createTask(task: Task) {
    this.tasks.addTask(task);
    this.closeAdd();
  }

  openDetails(task: Task) { this.editing = task; }
  closeDetails() { this.editing = null; }
  saveDetails(task: Task) { this.tasks.updateTask(task.id, task); this.closeDetails(); }
  deleteTask(id: string) { this.tasks.deleteTask(id); this.closeDetails(); }

  byStatus(status: TaskStatus, list: Task[]): Task[] {
    const items = list.filter(t => t.status === status);
    const sort = this.filter?.controls?.sort?.value ?? 'Default';
    const dateVal = (t: Task) => new Date(t.date ?? '').getTime() || 0;
    const prio = (t: Task) => ({ High: 3, Medium: 2, Low: 1, None: 0 }[t.priority ?? 'None']);
    if (sort === 'Title A-Z') return items.sort((a,b)=>a.title.localeCompare(b.title));
    if (sort === 'Priority') return items.sort((a,b)=> prio(b) - prio(a));
    if (sort === 'Date Newest') return items.sort((a,b)=> dateVal(b)-dateVal(a));
    if (sort === 'Date Oldest') return items.sort((a,b)=> dateVal(a)-dateVal(b));
    return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  onDropList(status: TaskStatus, event: CdkDragDrop<Task[]>) {
    const dragged: Task = event.item.data as Task;
    const targetList = event.container.data as Task[];
    const beforeTask = targetList[event.currentIndex];
    const beforeId = beforeTask ? beforeTask.id : null;
    this.tasks.reorderTask(dragged.id, status, beforeId);
  }
}