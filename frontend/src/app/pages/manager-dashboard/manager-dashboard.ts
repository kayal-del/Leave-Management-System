import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManagerService } from '../../services/manager.service';
import { DashboardSummary, LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="page-title">Review your team’s leave requests</h1>
        <p class="subtitle-text">
          Check pending requests and keep your team informed by approving or rejecting them.
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Team Requests</div>
          <div class="summary-value">{{ summary().totalRequests }}</div>
        </div>
        <div class="summary-card card-pending">
          <div class="summary-label">Pending</div>
          <div class="summary-value">{{ summary().pendingRequests }}</div>
        </div>
        <div class="summary-card card-approved">
          <div class="summary-label">Approved</div>
          <div class="summary-value">{{ summary().approvedRequests }}</div>
        </div>
        <div class="summary-card card-rejected">
          <div class="summary-label">Rejected</div>
          <div class="summary-value">{{ summary().rejectedRequests }}</div>
        </div>
      </div>

      <div class="section-header" id="requests-section">
        <h2 class="section-title">Team Leave Requests</h2>
        <a href="#requests-section" class="btn btn-primary">Review Requests</a>
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
              <th>Action</th>
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
              </td>
              <td>
                <a [routerLink]="['/manager/request', req.requestId]" class="btn btn-outline btn-xs">
                  Review Details
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyState>
        <div class="card empty-state">
          <p class="empty-state-title">There are no pending requests to review.</p>
          <p>Your team members have not submitted any pending leave requests.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .dashboard-header {
      margin-bottom: 32px;
    }
    .page-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--primary-text);
      margin-bottom: 6px;
    }
    .subtitle-text {
      font-size: 1rem;
      color: var(--secondary-text);
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-divider);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
    }
    .summary-label {
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--secondary-text);
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .summary-value {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary-text);
    }
    .card-pending .summary-value { color: #b7791f; }
    .card-approved .summary-value { color: #2f855a; }
    .card-rejected .summary-value { color: #c53030; }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-text);
    }
    .btn-xs {
      padding: 6px 12px;
      font-size: 0.82rem;
    }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  summary = signal<DashboardSummary>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });
  requests = signal<LeaveRequest[]>([]);

  constructor(private managerService: ManagerService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.managerService.getTeamSummary().subscribe({
      next: (res) => {
        if (res.data) this.summary.set(res.data);
      }
    });

    this.managerService.getTeamRequests().subscribe({
      next: (res) => {
        if (res.data) this.requests.set(res.data);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    if (status === 'Pending') return 'badge badge-pending';
    if (status === 'Approved') return 'badge badge-approved';
    if (status === 'Rejected') return 'badge badge-rejected';
    return 'badge';
  }
}
