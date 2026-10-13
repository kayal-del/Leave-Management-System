import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="brand">
          <span class="brand-badge">𐙚</span>
          <span class="brand-text">Leave Management System</span>
        </a>

        <div class="nav-links">
          <ng-container *ngIf="authService.isLoggedIn(); else publicNav">
            <!-- Employee Links -->
            <ng-container *ngIf="authService.getRole() === 'Employee'">
              <a routerLink="/employee/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
              <a routerLink="/employee/apply" routerLinkActive="active" class="nav-link">Apply for Leave</a>
              <a routerLink="/employee/my-requests" routerLinkActive="active" class="nav-link">My Requests</a>
            </ng-container>

            <!-- Manager Links -->
            <ng-container *ngIf="authService.getRole() === 'Manager'">
              <a routerLink="/manager/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            </ng-container>

            <!-- Admin Links -->
            <ng-container *ngIf="authService.getRole() === 'Admin'">
              <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
              <a routerLink="/admin/users" routerLinkActive="active" class="nav-link">Manage Users</a>
              <a routerLink="/admin/all-requests" routerLinkActive="active" class="nav-link">All Leave Requests</a>
            </ng-container>

            <div class="user-menu">
              <span class="user-info">
                <strong>{{ authService.getUserName() }}</strong>
                <span class="role-pill">{{ authService.getRole() }}</span>
              </span>
              <button (click)="openLogoutModal()" class="btn btn-logout">Log Out</button>
            </div>
          </ng-container>

          <ng-template #publicNav>
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
            <a routerLink="/login" routerLinkActive="active" class="nav-link">Log In</a>
            <a routerLink="/signup" class="btn btn-primary btn-sm">Sign Up</a>
          </ng-template>
        </div>
      </div>
    </nav>

    <!-- Logout Confirmation Modal per Phase 7.2 -->
    <div *ngIf="showLogoutModal()" class="modal-backdrop">
      <div class="modal-content">
        <h3 class="modal-title">Log Out</h3>
        <p class="modal-text">Are you sure you want to log out?</p>
        <div *ngIf="logoutFeedback()" class="alert alert-success">{{ logoutFeedback() }}</div>
        <div class="modal-actions">
          <button (click)="cancelLogout()" class="btn btn-secondary">Cancel</button>
          <button (click)="confirmLogout()" class="btn btn-danger">Log Out</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .navbar {
      background-color: #FFFFFF;
      border-bottom: 1px solid var(--border-divider);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-sm);
    }
    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 14px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--primary-text);
      font-weight: 700;
      font-size: 1.15rem;
    }
    .brand-badge {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary-accent), var(--hover-accent));
      color: #FFF;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.45rem;
      line-height: 1;
      box-shadow: 0 4px 10px rgba(246, 130, 130, 0.35);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .nav-link {
      color: var(--primary-text);
      font-weight: 600;
      font-size: 0.92rem;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      transition: all 0.2s ease;
    }
    .nav-link:hover, .nav-link.active {
      color: var(--hover-accent);
      background-color: var(--bg-main);
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-left: 12px;
      padding-left: 14px;
      border-left: 1px solid var(--border-divider);
    }
    .user-info {
      display: flex;
      flex-direction: column;
      font-size: 0.85rem;
      text-align: right;
    }
    .role-pill {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--primary-accent);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .btn-logout {
      background-color: transparent;
      color: var(--primary-text);
      border: 1px solid var(--border-divider);
      padding: 6px 14px;
      font-size: 0.85rem;
    }
    .btn-logout:hover {
      background-color: var(--bg-main);
      color: var(--hover-accent);
      border-color: var(--primary-accent);
    }
    .btn-sm {
      padding: 6px 16px;
      font-size: 0.88rem;
    }
    .modal-title {
      font-size: 1.25rem;
      color: var(--primary-text);
      margin-bottom: 12px;
    }
    .modal-text {
      color: var(--secondary-text);
      font-size: 0.98rem;
      margin-bottom: 24px;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class NavbarComponent {
  showLogoutModal = signal<boolean>(false);
  logoutFeedback = signal<string>('');

  constructor(public authService: AuthService, private router: Router) {}

  openLogoutModal() {
    this.showLogoutModal.set(true);
    this.logoutFeedback.set('');
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  confirmLogout() {
    this.authService.logout().subscribe({
      next: (res) => {
        this.logoutFeedback.set(res.message || 'You have logged out successfully.');
        setTimeout(() => {
          this.showLogoutModal.set(false);
          this.router.navigate(['/']);
        }, 600);
      },
      error: () => {
        this.authService.clearSession();
        this.showLogoutModal.set(false);
        this.router.navigate(['/']);
      }
    });
  }
}
