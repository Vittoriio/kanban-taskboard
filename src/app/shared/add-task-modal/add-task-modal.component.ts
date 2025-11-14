import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Task } from '../../core/models/task';

@Component({
  selector: 'app-add-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-task-modal.component.html',
  styleUrl: './add-task-modal.component.scss'
})
export class AddTaskModalComponent {
  @Input() visible = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() create = new EventEmitter<Task>();
  form: any;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      status: ['Planned' as Task['status'], Validators.required],
      priority: ['High'],
      date: ['', Validators.required],
      description: ['']
    });
  }

  get today(): string {
    const t = new Date();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${t.getFullYear()}-${m}-${d}`;
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { title, status, priority, date } = this.form.getRawValue();
    const start = new Date(date);
    const now = new Date(this.today);
    if (start < now) {
      this.form.get('date')?.setErrors({ past: true });
      return;
    }
    const description = this.form.get('description')?.value ?? '';
    this.create.emit({ id: '', title, status, priority: priority as Task['priority'], date, description });
  }
}