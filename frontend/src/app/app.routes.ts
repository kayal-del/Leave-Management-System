import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import { EmployeeDashboardComponent } from './pages/employee-dashboard/employee-dashboard';
import { ApplyLeaveComponent } from './pages/apply-leave/apply-leave';
import { MyRequestsComponent } from './pages/my-requests/my-requests';
import { EditLeaveComponent } from './pages/edit-leave/edit-leave';
import { ManagerDashboardComponent } from './pages/manager-dashboard/manager-dashboard';
import { LeaveDetailsComponent } from './pages/leave-details/leave-details';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { ManageUsersComponent } from './pages/manage-users/manage-users';
import { AllLeaveRequestsComponent } from './pages/all-leave-requests/all-leave-requests';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Employee routes
  {
    path: 'employee/dashboard',
    component: EmployeeDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Employee' }
  },
  {
    path: 'employee/apply',
    component: ApplyLeaveComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Employee' }
  },
  {
    path: 'employee/my-requests',
    component: MyRequestsComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Employee' }
  },
  {
    path: 'employee/edit/:id',
    component: EditLeaveComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Employee' }
  },

  // Manager routes
  {
    path: 'manager/dashboard',
    component: ManagerDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Manager' }
  },
  {
    path: 'manager/request/:id',
    component: LeaveDetailsComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Manager' }
  },

  // Admin routes
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'admin/users',
    component: ManageUsersComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'admin/all-requests',
    component: AllLeaveRequestsComponent,
    canActivate: [authGuard, roleGuard],
    data: { role: 'Admin' }
  },

  { path: '**', redirectTo: '' }
];
