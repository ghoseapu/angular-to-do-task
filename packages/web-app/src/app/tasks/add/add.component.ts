import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskPriority } from '@take-home/shared';
import { StorageService } from '../../storage/storage.service';
import { faker } from '@faker-js/faker';

@Component({
    selector: 'take-home-add-component',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    standalone: false
})
export class AddComponent {
  // today's date
  minDate: Date = new Date();
  // date 7 days from now
  maxDate: Date = new Date(new Date().getTime() + 6 * 24 * 60 * 60 * 1000);

  protected addTaskForm: FormGroup = new FormGroup({
    title: new FormControl(null, {
      // add validators for required and min length 10
      validators: [Validators.required, Validators.minLength(10)],
    }),
    description: new FormControl(null),
    priority: new FormControl(
      { value: TaskPriority.MEDIUM, disabled: false },
      {
        validators: Validators.required,
      },
    ),
    // allow users to set scheduledDate
    scheduledDate: new FormControl(new Date(), {
      validators: [Validators.required],
    }),
  });
  protected priorities = Object.values(TaskPriority);

  constructor(private storageService: StorageService, private router: Router) {}

  async onSubmit() {
    const newTask: Task = {
      ...this.addTaskForm.getRawValue(),
      uuid: faker.string.uuid(),
      isArchived: false,
    };

    // save updated task to storage
    await this.storageService.addTaskItem(newTask);
    // navigate to home page
    this.router.navigate(['/home']);
  }

  onCancel(): void {
    // navigate to home page
    this.router.navigate(['/home']);
  }

}
