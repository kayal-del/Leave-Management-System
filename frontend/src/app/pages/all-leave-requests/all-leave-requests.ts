import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { LeaveRequest } from '../../models/leave.model';

@Component({
  selector: 'app-all-leave-requests',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">All leave records in one place</h1>
          <p class="page-subtitle">View leave requests across org and current status.</p>
        </div>
      </div>

      <div *ngIf="errorMessage()" class="alert alert-error">
        {{ errorMessage() }}
      </div>

      <!-- All Requests Table -->
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
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyState>
        <div class="card empty-state">
          <p class="empty-state-title">No leave requests are available.</p>
          <p>There are no leave records found across the organization.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1100px;
      margin: 40px auto;
      padding: 0 20px;
    }
    .page-header {
      margin-bottom: 28px;
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
  `]
})
export class AllLeaveRequestsComponent implements OnInit {
  requests = signal<LeaveRequest[]>([]);
  errorMessage = signal<string>('');

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getAllLeaveRequests().subscribe({
      next: (res) => {
        if (res.data) this.requests.set(res.data);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to retrieve leave records.');
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
