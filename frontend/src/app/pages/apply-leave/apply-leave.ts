import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="apply-container">
      <div class="card form-card">
        <h2 class="form-title">Plan your time off</h2>
        <p class="form-subtitle">
          Enter your leave details and submit your request for review.
        </p>

        <div *ngIf="successMessage()" class="alert alert-success">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="alert alert-error">
          {{ errorMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label class="form-label">Employee Name</label>
            <input
              type="text"
              [value]="authService.getUserName()"
              class="form-control"
              readonly
            />
          </div>

          <div class="form-group">
            <label class="form-label">Leave Type</label>
            <select
              name="leaveType"
              [(ngModel)]="leaveType"
              class="form-control"
            >
              <option value="" disabled selected>Select Leave Type</option>
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
            <div *ngIf="leaveTypeError()" class="validation-error">
              {{ leaveTypeError() }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              [(ngModel)]="startDate"
              class="form-control"
            />
            <div *ngIf="startDateError()" class="validation-error">
              {{ startDateError() }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              [(ngModel)]="endDate"
              class="form-control"
            />
            <div *ngIf="endDateError()" class="validation-error">
              {{ endDateError() }}
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              {{ loading() ? 'Submitting...' : 'Submit Request' }}
            </button>
            <a routerLink="/employee/dashboard" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .apply-container {
      max-width: 620px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .form-card {
      padding: 36px;
    }
    .form-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--primary-text);
      margin-bottom: 6px;
    }
    .form-subtitle {
      font-size: 0.98rem;
      color: var(--secondary-text);
      margin-bottom: 28px;
    }
    .form-actions {
      display: flex;
      gap: 14px;
      margin-top: 28px;
    }
  `]
})
export class ApplyLeaveComponent {
  leaveType = '';
  startDate = '';
  endDate = '';

  leaveTypeError = signal<string>('');
  startDateError = signal<string>('');
  endDateError = signal<string>('');

  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  loading = signal<boolean>(false);

  constructor(
    public authService: AuthService,
    private leaveService: LeaveService,
    private router: Router
  ) {}

  validate(): boolean {
    let valid = true;
    this.leaveTypeError.set('');
    this.startDateError.set('');
    this.endDateError.set('');
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.leaveType) {
      this.leaveTypeError.set('Please select a leave type.');
      valid = false;
    }

    if (!this.startDate) {
      this.startDateError.set('Please select a start date.');
      valid = false;
    }

    if (!this.endDate) {
      this.endDateError.set('Please select an end date.');
      valid = false;
    }

    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.endDateError.set('The end date must be on or after the start date.');
      valid = false;
    }

    return valid;
  }

  onSubmit() {
    if (!this.validate()) {
      return;
    }

    this.loading.set(true);
    this.leaveService.apply({
      leaveType: this.leaveType,
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set('Your leave request has been submitted. Its status is Pending.');
        setTimeout(() => {
          this.router.navigate(['/employee/my-requests']);
        }, 1200);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message;
        if (msg === 'The end date must be on or after the start date.') {
          this.endDateError.set(msg);
        } else {
          this.errorMessage.set(msg || 'Unable to submit leave request. Please try again.');
        }
      }
    });
  }
}
