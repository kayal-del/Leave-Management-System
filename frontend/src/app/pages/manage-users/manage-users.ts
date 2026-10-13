import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1 class="page-title">Keep your user records up to date</h1>
          <p class="page-subtitle">Add users, assign roles, or remove accounts.</p>
        </div>
        <button (click)="openAddModal()" class="btn btn-primary">Add User</button>
      </div>

      <div *ngIf="successMessage()" class="alert alert-success">
        {{ successMessage() }}
      </div>
      <div *ngIf="errorMessage()" class="alert alert-error">
        {{ errorMessage() }}
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users()">
              <td><strong>{{ user.userId }}</strong></td>
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>
                <span class="role-badge" [ngClass]="'role-' + user.role.toLowerCase()">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="status-indicator" [class.active]="user.activeStatus" [class.inactive]="!user.activeStatus">
                  {{ user.activeStatus ? 'Active' : 'Deactivated' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button (click)="openEditModal(user)" class="btn btn-secondary btn-xs">Edit</button>
                  <button
                    *ngIf="user.activeStatus"
                    (click)="openRemoveConfirm(user)"
                    class="btn btn-danger btn-xs"
                  >
                    Remove
                  </button>
                  <button
                    *ngIf="!user.activeStatus"
                    (click)="reactivateUser(user)"
                    class="btn btn-primary btn-xs"
                    style="background-color: #2e7d32; border-color: #2e7d32;"
                  >
                    Reactivate
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add / Edit User Modal -->
      <div *ngIf="showModal()" class="modal-backdrop">
        <div class="modal-content user-modal">
          <h3 class="modal-title">{{ isEditing() ? 'Edit User' : 'Add User' }}</h3>

          <form (ngSubmit)="onSaveUser()" novalidate>
            <div class="form-group">
              <label class="form-label">Name</label>
              <input
                type="text"
                name="name"
                [(ngModel)]="name"
                class="form-control"
                placeholder="Enter full name"
              />
              <div *ngIf="nameError()" class="validation-error">
                {{ nameError() }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                [(ngModel)]="email"
                class="form-control"
                placeholder="Enter email address"
              />
              <div *ngIf="emailError()" class="validation-error">
                {{ emailError() }}
              </div>
            </div>

            <div class="form-group" *ngIf="!isEditing()">
              <label class="form-label">Password</label>
              <input
                type="password"
                name="password"
                [(ngModel)]="password"
                class="form-control"
                placeholder="Temporary password"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Role</label>
              <select
                name="role"
                [(ngModel)]="role"
                class="form-control"
              >
                <option value="" disabled>Please select a role</option>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <div *ngIf="roleError()" class="validation-error">
                {{ roleError() }}
              </div>
            </div>

            <div class="form-group" *ngIf="isEditing()">
              <label class="form-label">Status</label>
              <select
                name="activeStatus"
                [(ngModel)]="activeStatus"
                class="form-control"
              >
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Deactivated</option>
              </select>
            </div>

            <div class="modal-actions" style="margin-top: 24px;">
              <button type="button" (click)="closeModal()" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save User' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Remove User Confirmation Modal -->
      <div *ngIf="userToRemove()" class="modal-backdrop">
        <div class="modal-content">
          <h3 class="modal-title">Remove user account?</h3>
          <p class="modal-text">
            Are you sure you want to remove <strong>{{ userToRemove()?.name }}</strong>?
            Historical leave records will be preserved.
          </p>
          <div class="modal-actions">
            <button (click)="cancelRemove()" class="btn btn-secondary">Cancel</button>
            <button (click)="confirmRemove()" class="btn btn-danger">Remove</button>
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
    }
    .btn-xs {
      padding: 5px 12px;
      font-size: 0.8rem;
    }
    .btn-xs:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .role-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .role-employee { background: #e3f2fd; color: #1565c0; }
    .role-manager { background: #f3e5f5; color: #7b1fa2; }
    .role-admin { background: #ffebee; color: #c62828; }

    .status-indicator {
      font-size: 0.82rem;
      font-weight: 600;
    }
    .status-indicator.active { color: #2e7d32; }
    .status-indicator.inactive { color: #c62828; }

    .user-modal {
      max-width: 500px;
    }
    .modal-title {
      font-size: 1.35rem;
      color: var(--primary-text);
      margin-bottom: 20px;
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
  `]
})
export class ManageUsersComponent implements OnInit {
  users = signal<User[]>([]);
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingUserId = signal<string>('');
  userToRemove = signal<User | null>(null);

  name = '';
  email = '';
  password = '';
  role: UserRole = 'Employee';
  activeStatus: boolean = true;

  nameError = signal<string>('');
  emailError = signal<string>('');
  roleError = signal<string>('');

  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  saving = signal<boolean>(false);

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.data) this.users.set(res.data);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load users.');
      }
    });
  }

  openAddModal() {
    this.isEditing.set(false);
    this.editingUserId.set('');
    this.name = '';
    this.email = '';
    this.password = '';
    this.role = 'Employee';
    this.activeStatus = true;
    this.clearErrors();
    this.showModal.set(true);
  }

  openEditModal(user: User) {
    this.isEditing.set(true);
    this.editingUserId.set(user.userId);
    this.name = user.name;
    this.email = user.email;
    this.role = user.role;
    this.activeStatus = user.activeStatus;
    this.clearErrors();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  clearErrors() {
    this.nameError.set('');
    this.emailError.set('');
    this.roleError.set('');
  }

  validate(): boolean {
    let valid = true;
    this.clearErrors();

    if (!this.name.trim()) {
      this.nameError.set('Please enter a valid name.');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email.trim() || !emailRegex.test(this.email.trim())) {
      this.emailError.set('Please enter a valid email address.');
      valid = false;
    }

    if (!this.role) {
      this.roleError.set('Please select a role.');
      valid = false;
    }

    return valid;
  }

  onSaveUser() {
    if (!this.validate()) return;

    this.saving.set(true);
    if (this.isEditing()) {
      this.adminService.updateUser(this.editingUserId(), {
        name: this.name,
        email: this.email,
        role: this.role,
        activeStatus: this.activeStatus
      }).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.showModal.set(false);
          this.successMessage.set('User details saved successfully.');
          this.loadUsers();
          setTimeout(() => this.successMessage.set(''), 4000);
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err.error?.message;
          if (msg === 'This email address is already registered.') {
            this.emailError.set(msg);
          } else {
            this.errorMessage.set(msg || 'Failed to save user details.');
          }
        }
      });
    } else {
      this.adminService.createUser({
        name: this.name,
        email: this.email,
        password: this.password,
        role: this.role
      }).subscribe({
        next: (res) => {
          this.saving.set(false);
          this.showModal.set(false);
          this.successMessage.set('User details saved successfully.');
          this.loadUsers();
          setTimeout(() => this.successMessage.set(''), 4000);
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err.error?.message;
          if (msg === 'This email address is already registered.') {
            this.emailError.set(msg);
          } else {
            this.errorMessage.set(msg || 'Failed to save user details.');
          }
        }
      });
    }
  }

  openRemoveConfirm(user: User) {
    this.userToRemove.set(user);
  }

  cancelRemove() {
    this.userToRemove.set(null);
  }

  confirmRemove() {
    const user = this.userToRemove();
    if (!user) return;

    this.adminService.removeUser(user.userId).subscribe({
      next: () => {
        this.userToRemove.set(null);
        this.successMessage.set('User removed successfully.');
        this.loadUsers();
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.userToRemove.set(null);
        this.errorMessage.set(err.error?.message || 'Failed to remove user.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
    });
  }

  reactivateUser(user: User) {
    this.adminService.updateUser(user.userId, {
      name: user.name,
      email: user.email,
      role: user.role,
      activeStatus: true
    }).subscribe({
      next: () => {
        this.successMessage.set(`Account for ${user.name} has been reactivated successfully.`);
        this.loadUsers();
        setTimeout(() => this.successMessage.set(''), 4000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to reactivate user.');
        setTimeout(() => this.errorMessage.set(''), 4000);
      }
    });
  }
}

