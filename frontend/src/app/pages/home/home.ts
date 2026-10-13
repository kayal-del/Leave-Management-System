import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <div class="hero-card">
        <div class="pill-badge">𐙚 Online Leave Portal</div>
        <h1 class="hero-title">Request leave. Track updates. Stay informed.</h1>
        <p class="hero-subtitle">
          Manage your leave requests in one place. Apply for leave, check your request status, and update your pending requests with ease.
        </p>
        <div class="hero-actions">
          <a routerLink="/login" class="btn btn-primary btn-lg">Log In</a>
          <a routerLink="/signup" class="btn btn-secondary btn-lg">Sign Up</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .hero-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-divider);
      border-radius: var(--radius-xl);
      padding: 60px 48px;
      max-width: 720px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-md);
      position: relative;
    }
    .pill-badge {
      display: inline-block;
      padding: 6px 16px;
      background-color: #FFF;
      color: var(--primary-accent);
      border: 1px solid var(--border-divider);
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--primary-text);
      line-height: 1.25;
      margin-bottom: 18px;
    }
    .hero-subtitle {
      font-size: 1.12rem;
      color: var(--secondary-text);
      line-height: 1.6;
      margin-bottom: 36px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 18px;
      flex-wrap: wrap;
    }
    .btn-lg {
      padding: 14px 34px;
      font-size: 1.05rem;
      border-radius: var(--radius-md);
    }
  `]
})
export class HomeComponent {}
