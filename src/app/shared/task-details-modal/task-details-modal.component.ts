import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Task, TaskPriority, TaskStatus } from '../../core/models/task';

@Component({
  selector: 'app-task-details-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-details-modal.component.html',
  styleUrl: './task-details-modal.component.scss'
})
export class TaskDetailsModalComponent {
  @Input() task: Task | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Task>();
  @Output() remove = new EventEmitter<string>();

  form: any;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['Planned' as TaskStatus, Validators.required],
      priority: ['High' as TaskPriority],
      date: ['', Validators.required]
    });
  }

  ngOnChanges() {
    if (this.task) {
      this.form.patchValue({
        title: this.task.title ?? '',
        description: this.task.description ?? '',
        status: this.task.status,
        priority: this.task.priority ?? 'Important',
        date: this.task.date ?? ''
      });
    }
  }

  submit() {
    if (!this.task) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const today = new Date();
    const dateVal = new Date(v.date);
    const min = new Date(today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0'));
    if (dateVal < min) { this.form.get('date')?.setErrors({ past: true }); return; }
    this.save.emit({ ...this.task, ...v });
  }

  delete() { if (this.task) this.remove.emit(this.task.id); }
}