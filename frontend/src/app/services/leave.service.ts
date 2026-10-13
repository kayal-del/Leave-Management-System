import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';
import {
  DashboardSummary,
  LeaveApplicationRequest,
  LeaveRequest,
  LeaveUpdateRequest
} from '../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private readonly baseUrl = 'http://localhost:8080/api/employee/leave';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<ApiResponse<DashboardSummary>> {
    return this.http.get<ApiResponse<DashboardSummary>>(`${this.baseUrl}/summary`);
  }

  getMyRequests(): Observable<ApiResponse<LeaveRequest[]>> {
    return this.http.get<ApiResponse<LeaveRequest[]>>(`${this.baseUrl}/my-requests`);
  }

  apply(request: LeaveApplicationRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.baseUrl}/apply`, request);
  }

  getRequestDetails(requestId: string): Observable<ApiResponse<LeaveRequest>> {
    return this.http.get<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${requestId}`);
  }

  update(requestId: string, request: LeaveUpdateRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.put<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${requestId}`, request);
  }

  delete(requestId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${requestId}`);
  }
}
