import { Component } from '@angular/core';

import { Task } from '@take-home/shared';
import { take } from 'rxjs';
import { TasksService } from '../tasks.service';
import { Router } from '@angular/router';
import { StorageService } from '../../storage/storage.service';

@Component({
    selector: 'take-home-list-component',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    standalone: false
})
export class ListComponent {
  constructor(
    private storageService: StorageService,
    protected tasksService: TasksService,
    private router: Router,
  ) {
    this.getTaskList();
  }

  async onDoneTask(item: Task): Promise<void> {
    // mark as completed
    item.completed = true;
    // save updated task to storage
    await this.storageService.updateTaskItem(item);
  }

  async onDeleteTask(item: Task): Promise<void> {
    // mark as archived
    item.isArchived = true;
    // save updated task to storage
    await this.storageService.updateTaskItem(item);
    // refresh list without archived items
    this.getTaskList();
  }

  onAddTask(): void {
    // navigate to add task
    this.router.navigate(['/add']);
  }

  private getTaskList(): void {
    this.tasksService
      .getTasksFromApi()
      .pipe(take(1))
      .subscribe(async (tasks) => {
        tasks.forEach(async (task) => {
          await this.storageService.updateTaskItem(task);
        });
        await this.tasksService.getTasksFromStorage();
      });
  }

  today: Date = new Date();
  isDueToday(scheduledDate: string | Date): boolean {
    const taskDate = new Date(scheduledDate);
    const today = new Date(this.today.setHours(0, 0, 0, 0));
    const taskDay = new Date(taskDate.setHours(0, 0, 0, 0));
    return (
      taskDay.getTime() <= today.getTime()
    );
  }
}
