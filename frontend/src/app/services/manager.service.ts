import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
  DashboardSummary,
  LeaveDecisionRequest,
  LeaveRequest
} from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private readonly baseUrl = 'http://localhost:8080/api/manager/leave';

  constructor(private http: HttpClient) {}

  getTeamSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/summary`);
  }

  getTeamRequests(): Observable<ApiResponse<LeaveRequest[]>> {
    return this.http.get<ApiResponse<LeaveRequest[]>>(`${this.baseUrl}/requests`);
  }

  getRequestDetails(requestId: string): Observable<ApiResponse<LeaveRequest>> {
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${requestId}`);
  }

  submitDecision(requestId: string, decision: 'Approved' | 'Rejected'): Observable<ApiResponse<LeaveRequest>> {
    const payload: LeaveDecisionRequest = { decision };
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${requestId}/decision`, payload);
  }
}
