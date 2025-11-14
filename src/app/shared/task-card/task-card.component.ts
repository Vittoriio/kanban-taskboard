import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Task } from '../../core/models/task';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
  animations: [
    trigger('cardAnim', [
      transition(':enter', [
        style({ transform: 'translateY(8px) scale(0.98)' }),
        animate('150ms ease-out', style({ transform: 'none' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ transform: 'translateY(8px) scale(0.98)' }))
      ])
    ])
  ]
})
export class TaskCardComponent {
  @Input() task!: Task;
  descVisible = false;
  @Output() open = new EventEmitter<Task>();
  toggleDescription() { this.descVisible = !this.descVisible; }

  // Drag handled by CDK in parent; no native DnD here
}