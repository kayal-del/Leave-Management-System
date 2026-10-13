import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="card auth-card">
        <h2 class="auth-title">Welcome back!</h2>
        <p class="auth-subtitle">Log in to access your leave dashboard.</p>

        <div *ngIf="errorMessage()" class="alert alert-error">
          {{ errorMessage() }}
        </div>

        <form (ngSubmit)="onSubmit()" novalidate>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              [(ngModel)]="email"
              class="form-control"
              placeholder="e.g. user@company.com"
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
              placeholder="Enter your password"
            />
            <div *ngIf="passwordError()" class="validation-error">
              {{ passwordError() }}
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading()">
            {{ loading() ? 'Logging In...' : 'Log In' }}
          </button>
        </form>

        <div class="auth-footer">
          Don’t have an account? <a routerLink="/signup">Sign Up</a>
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
      max-width: 440px;
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
export class LoginComponent {
  email = '';
  password = '';

  emailError = signal<string>('');
  passwordError = signal<string>('');
  errorMessage = signal<string>('');
  loading = signal<boolean>(false);

  constructor(private authService: AuthService, private router: Router) {}

  validate(): boolean {
    let valid = true;
    this.emailError.set('');
    this.passwordError.set('');
    this.errorMessage.set('');

    if (!this.email.trim()) {
      this.emailError.set('Please enter a valid email address.');
      valid = false;
    }

    if (!this.password) {
      this.passwordError.set('Please enter a password.');
      valid = false;
    }

    return valid;
  }

  onSubmit() {
    if (!this.validate()) {
      return;
    }

    this.loading.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        const role = res.data?.role;
        if (role === 'Employee') {
          this.router.navigate(['/employee/dashboard']);
        } else if (role === 'Manager') {
          this.router.navigate(['/manager/dashboard']);
        } else if (role === 'Admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set('Incorrect email or password. Please try again.');
      }
    });
  }
}
