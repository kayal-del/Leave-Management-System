import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { DashboardSummary } from '../../models/leave.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1 class="page-title">Manage users and leave records</h1>
        <p class="subtitle-text">
          Manage employee and manager accounts, assign roles, and view leave requests across organization.
        </p>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Requests</div>
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

      <!-- Admin Actions -->
      <div class="actions-panel">
        <a routerLink="/admin/users" class="btn btn-primary btn-lg">Manage Users</a>
        <a routerLink="/admin/all-requests" class="btn btn-secondary btn-lg">View All Leave Requests</a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1000px;
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
    .actions-panel {
      display: flex;
      gap: 18px;
      flex-wrap: wrap;
    }
    .btn-lg {
      padding: 14px 28px;
      font-size: 1rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  summary = signal<DashboardSummary>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getSummary().subscribe({
      next: (res) => {
        if (res.data) this.summary.set(res.data);
      }
    });
  }
}
