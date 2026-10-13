import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRole = route.data['role'] as UserRole;
  const currentRole = authService.getRole();

  if (expectedRole && currentRole === expectedRole) {
    return true;
  }

  // Redirect based on current role if accessing unauthorized route
  if (currentRole === 'Employee') {
    router.navigate(['/employee/dashboard']);
  } else if (currentRole === 'Manager') {
    router.navigate(['/manager/dashboard']);
  } else if (currentRole === 'Admin') {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
