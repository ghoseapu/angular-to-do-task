import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../storage/storage.service';
import Fuse from 'fuse.js';

@Injectable({ providedIn: 'root' })
export class TasksService {
  tasks: Task[] = [];

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
  ) {}

  getTasksFromApi(): Observable<Task[]> {
    const endpointUrl = '/api/tasks';
    return this.http.get<Task[]>(endpointUrl);
  }

  async getTasksFromStorage(): Promise<void> {
    this.tasks = await this.storageService.getTasks();
    this.filterTask('isArchived');
  }

  filterTask(key: keyof Task): void {
    const today = new Date();
    switch (key) {
      case 'isArchived':
        this.tasks = this.tasks.filter((task) => !task.isArchived);
        break;
      case 'priority':
        // add filter for tasks with High Priority
        this.tasks = this.tasks.filter((task) => task.priority === TaskPriority.HIGH);
        break;
      case 'scheduledDate':
        // add fitler for tasks Due Today
        this.tasks = this.tasks.filter((task) => {
          const taskDate = new Date(task.scheduledDate);
          return (
            taskDate.getFullYear() === today.getFullYear() &&
            taskDate.getMonth() === today.getMonth() &&
            taskDate.getDate() === today.getDate()
          );
        });
        break;
      case 'completed':
        this.tasks = this.tasks.filter((task) => !task.completed);
    }
  }

  searchTask(search: string): void {
    if (search) {
      // filter tasks which title include search value
      // this.tasks = this.tasks.filter((task) =>
      //   task.title.toLowerCase().includes(search.toLowerCase())
      // );
      const options = {
        keys: ['title'],
        threshold: 0.3,  // Adjust sensitivity. Loosens the match requirement, allowing more fuzzy matches.
        // distance: 5,  // Adjust how close words need to be. Allows more character variations in the match.
        includeScore: true, // Ignores how far the match is in the string.
        // ignoreLocation: true, // Helps debug by checking match quality (you can log it if needed).
      };
      const fuse = new Fuse(this.tasks, options);
      this.tasks = fuse.search(search).map(result => result.item);
    } else {
      // reload all tasks from storage
      this.getTasksFromStorage();
    }
  }
}
