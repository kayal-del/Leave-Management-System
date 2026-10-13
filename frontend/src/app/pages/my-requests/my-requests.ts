import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeaveService } from '../../services/leave.service';
import { LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Track your leave requests</h1>
          <p class="page-subtitle">
            View your leave history and latest status. Can edit/delete pending only.
          </p>
        </div>
        <a routerLink="/employee/apply" class="btn btn-primary">Apply for Leave</a>
      </div>

      <!-- Feedback notifications -->
      <div *ngIf="successMessage()" class="alert alert-success">
        {{ successMessage() }}
      </div>
      <div *ngIf="errorMessage()" class="alert alert-error">
        {{ errorMessage() }}
      </div>

      <!-- Requests Table -->
      <div *ngIf="requests().length > 0; else emptyState" class="table-container">
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Employee Name</th>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let req of requests()">
              <td><strong>{{ req.requestId }}</strong></td>
              <td>{{ req.employeeName }}</td>
              <td>{{ req.leaveType }}</td>
              <td>{{ req.startDate }}</td>
              <td>{{ req.endDate }}</td>
              <td>
                <span [ngClass]="getStatusBadgeClass(req.status)">
                  {{ req.status }}
                </span>
                <div class="status-explanation">
                  {{ getStatusExplanation(req.status) }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button (click)="viewDetails(req)" class="btn btn-outline btn-xs">View Details</button>
                  <ng-container *ngIf="req.status === 'Pending'">
                    <a [routerLink]="['/employee/edit', req.requestId]" class="btn btn-secondary btn-xs">Edit</a>
                    <button (click)="openDeleteConfirmation(req)" class="btn btn-danger btn-xs">Delete</button>
                  </ng-container>
                  <ng-container *ngIf="req.status !== 'Pending'">
                    <button class="btn btn-secondary btn-xs" disabled title="Only pending requests can be modified">Edit</button>
                    <button class="btn btn-secondary btn-xs" disabled title="Only pending requests can be modified">Delete</button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyState>
        <div class="card empty-state">
          <p class="empty-state-title">You haven’t submitted any leave requests yet.</p>
          <p style="margin-bottom: 20px;">Get started by submitting your first time off request.</p>
          <a routerLink="/employee/apply" class="btn btn-primary">Apply for Leave</a>
        </div>
      </ng-template>

      <!-- View Details Modal -->
      <div *ngIf="selectedRequest()" class="modal-backdrop">
        <div class="modal-content">
          <h3 class="modal-title">Leave Request Details</h3>
          <div class="details-list">
            <div class="detail-item">
              <span class="detail-label">Request ID:</span>
              <span class="detail-val"><strong>{{ selectedRequest()?.requestId }}</strong></span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Employee Name:</span>
              <span class="detail-val">{{ selectedRequest()?.employeeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Leave Type:</span>
              <span class="detail-val">{{ selectedRequest()?.leaveType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Start Date:</span>
              <span class="detail-val">{{ selectedRequest()?.startDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">End Date:</span>
              <span class="detail-val">{{ selectedRequest()?.endDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <span class="detail-val">
                <span [ngClass]="getStatusBadgeClass(selectedRequest()!.status)">
                  {{ selectedRequest()?.status }}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status Details:</span>
              <span class="detail-val">{{ getStatusExplanation(selectedRequest()!.status) }}</span>
            </div>
          </div>
          <div class="modal-actions" style="margin-top: 24px;">
            <button (click)="closeDetails()" class="btn btn-primary">Close</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal per Phase 4.3 -->
      <div *ngIf="requestToDelete()" class="modal-backdrop">
        <div class="modal-content">
          <h3 class="modal-title">Delete this leave request?</h3>
          <p class="modal-text">This action cannot be undone.</p>
          <div class="modal-actions">
            <button (click)="cancelDelete()" class="btn btn-secondary">Keep Request</button>
            <button (click)="confirmDelete()" class="btn btn-danger">Delete Request</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary-text);
      margin-bottom: 6px;
    }
    .page-subtitle {
      font-size: 0.98rem;
      color: var(--secondary-text);
    }
    .action-buttons {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    .btn-xs {
      padding: 5px 10px;
      font-size: 0.8rem;
      border-radius: var(--radius-sm);
    }
    .btn-xs:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .status-explanation {
      font-size: 0.76rem;
      color: var(--secondary-text);
      margin-top: 3px;
    }
    .modal-title {
      font-size: 1.3rem;
      color: var(--primary-text);
      margin-bottom: 8px;
    }
    .modal-text {
      color: var(--secondary-text);
      margin-bottom: 24px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .details-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 14px;
    }
    .detail-item {
      display: flex;
      justify-content: space-between;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border-divider);
      font-size: 0.92rem;
    }
    .detail-label {
      color: var(--secondary-text);
      font-weight: 600;
    }
    .detail-val {
      color: var(--primary-text);
    }
  `]
})
export class MyRequestsComponent implements OnInit {
  requests = signal<LeaveRequest[]>([]);
  selectedRequest = signal<LeaveRequest | null>(null);
  requestToDelete = signal<LeaveRequest | null>(null);

  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  constructor(private leaveService: LeaveService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.leaveService.getMyRequests().subscribe({
      next: (res) => {
        if (res.data) {
          this.requests.set(res.data);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load leave requests.');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'Pending') return 'badge badge-pending';
    if (status === 'Approved') return 'badge badge-approved';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge';
  }

  getStatusExplanation(status: string): string {
    if (status === 'Pending') return 'Waiting for manager review.';
    if (status === 'Approved') return 'Your leave request has been approved.';
    if (status === 'Rejected') return 'Your leave request has been rejected.';
    return '';
  }

  viewDetails(req: LeaveRequest) {
    this.selectedRequest.set(req);
  }

  closeDetails() {
    this.selectedRequest.set(null);
  }

  openDeleteConfirmation(req: LeaveRequest) {
    this.requestToDelete.set(req);
  }

  cancelDelete() {
    this.requestToDelete.set(null);
  }

  confirmDelete() {
    const req = this.requestToDelete();
    if (!req) return;

    this.leaveService.delete(req.requestId).subscribe({
      next: (res) => {
        this.requestToDelete.set(null);
        this.successMessage.set('Your leave request has been deleted.');
        this.loadRequests();
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.requestToDelete.set(null);
        this.errorMessage.set(err.error?.message || 'Failed to delete leave request.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
    });
  }
}
