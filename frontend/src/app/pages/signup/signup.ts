import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="card auth-card">
        <h2 class="auth-title">Create your account!</h2>
        <p class="auth-subtitle">
          Join your organization’s leave management system to apply for leave and track your requests easily.
        </p>

        <div *ngIf="successMessage()" class="alert alert-success">
          {{ successMessage() }}
        </div>
        <div *ngIf="errorMessage()" class="alert alert-error">
          {{ errorMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input
              type="text"
              name="fullName"
              [(ngModel)]="fullName"
              class="form-control"
              placeholder="e.g. Jane Doe"
            />
            <div *ngIf="fullNameError()" class="validation-error">
              {{ fullNameError() }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              class="form-control"
              placeholder="e.g. jane@company.com"
            />
            <div *ngIf="emailError()" class="validation-error">
              {{ emailError() }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              type="password"
              name="password"
              [(ngModel)]="password"
              class="form-control"
              placeholder="Enter password"
            />
            <div *ngIf="passwordError()" class="validation-error">
              {{ passwordError() }}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              [(ngModel)]="confirmPassword"
              class="form-control"
              placeholder="Confirm password"
            />
            <div *ngIf="confirmPasswordError()" class="validation-error">
              {{ confirmPasswordError() }}
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            {{ loading() ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Log In</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px 20px;
    }
    .auth-card {
      max-width: 480px;
      width: 100%;
      padding: 40px 36px;
    }
    .auth-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary-text);
      margin-bottom: 8px;
      text-align: center;
    }
    .auth-subtitle {
      font-size: 0.95rem;
      color: var(--secondary-text);
      line-height: 1.5;
      text-align: center;
      margin-bottom: 28px;
    }
    .btn-block {
      width: 100%;
      margin-top: 10px;
      padding: 12px;
      font-size: 1rem;
    }
    .auth-footer {
      margin-top: 24px;
      text-align: center;
      font-size: 0.9rem;
      color: var(--secondary-text);
    }
  `]
})
export class SignupComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';

  fullNameError = signal<string>('');
  emailError = signal<string>('');
  passwordError = signal<string>('');
  confirmPasswordError = signal<string>('');

  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  loading = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  validate(): boolean {
    let valid = true;
    this.fullNameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.confirmPasswordError.set('');
    this.errorMessage.set('');

    if (!this.fullName.trim()) {
      this.fullNameError.set('Please enter your full name.');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email.trim() || !emailRegex.test(this.email.trim())) {
      this.emailError.set('Please enter a valid email address.');
      valid = false;
    }

    if (!this.password) {
      this.passwordError.set('Please enter a password.');
      valid = false;
    }

    if (this.password && this.confirmPassword !== this.password) {
      this.confirmPasswordError.set('Passwords do not match.');
      valid = false;
    }

    return valid;
  }

  onSubmit() {
    if (!this.validate()) {
      return;
    }

    this.loading.set(true);
    this.authService.signUp(this.fullName, this.email, this.password, this.confirmPassword).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMessage.set(res.message || 'Your account has been created successfully. Welcome to your Employee Dashboard!');
        setTimeout(() => {
          this.router.navigate(['/employee/dashboard']);
        }, 1000);
      },
      error: (err) => {
        this.loading.set(false);
        const backendMsg = err.error?.message;
        if (backendMsg === 'An account with this email address already exists.') {
          this.emailError.set('An account with this email address already exists.');
        } else if (backendMsg === 'Passwords do not match.') {
          this.confirmPasswordError.set('Passwords do not match.');
        } else {
          this.errorMessage.set(backendMsg || 'Unable to create your account. Please try again.');
        }
      }
    });
  }
}
