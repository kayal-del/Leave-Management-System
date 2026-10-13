import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';

@Component({
  selector: 'app-edit-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="edit-container">
      <div class="card form-card">
        <h2 class="form-title">Update your leave details</h2>
        <p class="form-subtitle">
          Make changes to your pending request and save your updates.
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
              [value]="employeeName"
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
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Maternity Leave">Maternity Leave</option>
              <option value="Paternity Leave">Paternity Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              [(ngModel)]="startDate"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label class="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              [(ngModel)]="endDate"
              class="form-control"
            />
            <div *ngIf="dateError()" class="validation-error">
              {{ dateError() }}
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="loading()">
              {{ loading() ? 'Saving Changes...' : 'Save Changes' }}
            </button>
            <a routerLink="/employee/my-requests" class="btn btn-secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .edit-container {
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
export class EditLeaveComponent implements OnInit {
  requestId = '';
  employeeName = '';
  leaveType = '';
  startDate = '';
  endDate = '';

  dateError = signal<string>('');
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  loading = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    if (this.requestId) {
      this.loadRequest();
    }
  }

  loadRequest() {
    this.leaveService.getRequestDetails(this.requestId).subscribe({
      next: (res) => {
        if (res.data) {
          if (res.data.status !== 'Pending') {
            this.errorMessage.set('Only pending leave requests can be edited.');
            setTimeout(() => this.router.navigate(['/employee/my-requests']), 2000);
            return;
          }
          this.employeeName = res.data.employeeName;
          this.leaveType = res.data.leaveType;
          this.startDate = res.data.startDate;
          this.endDate = res.data.endDate;
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Could not load leave request.');
      }
    });
  }

  validate(): boolean {
    this.dateError.set('');
    this.errorMessage.set('');

    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.dateError.set('The end date must be on or after the start date.');
      return false;
    }
    return true;
  }

  onSubmit() {
    if (!this.validate()) {
      return;
    }

    this.loading.set(true);
    this.leaveService.update(this.requestId, {
      leaveType: this.leaveType,
      startDate: this.startDate,
      endDate: this.endDate
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set('Your leave request has been updated.');
        setTimeout(() => {
          this.router.navigate(['/employee/my-requests']);
        }, 1200);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err.error?.message;
        if (msg === 'The end date must be on or after the start date.') {
          this.dateError.set(msg);
        } else {
          this.errorMessage.set(msg || 'Failed to update leave request.');
        }
      }
    });
  }
}
