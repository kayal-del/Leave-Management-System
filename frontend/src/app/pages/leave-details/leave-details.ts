import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ManagerService } from '../../services/manager.service';
import { LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-leave-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="details-container">
      <div class="card details-card" *ngIf="request(); else emptyOrLoading">
        <h2 class="card-title">Review leave details</h2>
        <p class="card-subtitle">
          Check employee’s name, leave type, and requested dates before decision.
        </p>

        <div *ngIf="successMessage()" class="alert alert-success">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="alert alert-error">
          {{ errorMessage() }}
        </div>

        <div class="details-grid">
          <div class="detail-row">
            <span class="detail-label">Request ID:</span>
            <span class="detail-value"><strong>{{ request()?.requestId }}</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Employee Name:</span>
            <span class="detail-value">{{ request()?.employeeName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Leave Type:</span>
            <span class="detail-value">{{ request()?.leaveType }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Start Date:</span>
            <span class="detail-value">{{ request()?.startDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">End Date:</span>
            <span class="detail-value">{{ request()?.endDate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Current Status:</span>
            <span class="detail-value">
              <span [ngClass]="getStatusBadgeClass(request()!.status)">
                {{ request()?.status }}
              </span>
            </span>
          </div>
        </div>

        <div class="action-buttons">
          <ng-container *ngIf="request()?.status === 'Pending'">
            <button
              (click)="decide('Approved')"
              class="btn btn-primary"
              [disabled]="processing()"
            >
              Approve
            </button>
            <button
              (click)="decide('Rejected')"
              class="btn btn-danger"
              [disabled]="processing()"
            >
              Reject
            </button>
          </ng-container>
          <a routerLink="/manager/dashboard" class="btn btn-secondary">
            Back to Requests
          </a>
        </div>
      </div>

      <ng-template #emptyOrLoading>
        <div class="card empty-state">
          <p class="empty-state-title">There are no pending requests to review.</p>
          <p style="margin-bottom: 20px;">The requested leave record is not found or has already been reviewed.</p>
          <a routerLink="/manager/dashboard" class="btn btn-secondary">Back to Requests</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .details-container {
      max-width: 680px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .details-card {
      padding: 36px;
    }
    .card-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--primary-text);
      margin-bottom: 6px;
    }
    .card-subtitle {
      font-size: 0.98rem;
      color: var(--secondary-text);
      margin-bottom: 28px;
    }
    .details-grid {
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 32px;
      background: #FFF;
      padding: 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-divider);
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-divider);
      font-size: 0.95rem;
    }
    .detail-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .detail-label {
      color: var(--secondary-text);
      font-weight: 600;
    }
    .detail-value {
      color: var(--primary-text);
    }
    .action-buttons {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }
  `]
})
export class LeaveDetailsComponent implements OnInit {
  requestId = '';
  request = signal<LeaveRequest | null>(null);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  processing = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private managerService: ManagerService
  ) {}

  ngOnInit() {
    this.requestId = this.route.snapshot.paramMap.get('id') || '';
    if (this.requestId) {
      this.loadRequest();
    }
  }

  loadRequest() {
    this.managerService.getRequestDetails(this.requestId).subscribe({
      next: (res) => {
        if (res.data) {
          this.request.set(res.data);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Could not load leave request details.');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'Pending') return 'badge badge-pending';
    if (status === 'Approved') return 'badge badge-approved';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge';
  }

  decide(decision: 'Approved' | 'Rejected') {
    this.processing.set(true);
    this.errorMessage.set('');
    this.managerService.submitDecision(this.requestId, decision).subscribe({
      next: (res) => {
        this.processing.set(false);
        const msg = decision === 'Approved'
          ? 'Leave request approved. The employee can now view the updated status.'
          : 'Leave request rejected. The employee can now view the updated status.';
        this.successMessage.set(msg);
        if (res.data) {
          this.request.set(res.data);
        }
      },
      error: (err) => {
        this.processing.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to submit decision.');
      }
    });
  }
}
