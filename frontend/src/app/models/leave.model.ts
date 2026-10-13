import { UserRole } from './user.model';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  requestId: string;
  employeeReference: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
  createdAt: string;
}

export interface DashboardSummary {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export interface LeaveApplicationRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
}

export interface LeaveUpdateRequest {
  leaveType: string;
  startDate: string;
  endDate: string;
}

export interface LeaveDecisionRequest {
  decision: 'Approved' | 'Rejected';
}

export interface UserCreateRequest {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface UserUpdateRequest {
  name: string;
  email: string;
  role: UserRole;
  activeStatus?: boolean;
}
