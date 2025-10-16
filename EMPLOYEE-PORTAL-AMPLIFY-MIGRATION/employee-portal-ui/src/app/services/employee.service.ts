import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  startDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employee/profile`, {
      headers: this.getHeaders()
    });
  }

  updateProfile(employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employee/profile`, employee, {
      headers: this.getHeaders()
    });
  }

  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employee/list`, {
      headers: this.getHeaders()
    });
  }
}
