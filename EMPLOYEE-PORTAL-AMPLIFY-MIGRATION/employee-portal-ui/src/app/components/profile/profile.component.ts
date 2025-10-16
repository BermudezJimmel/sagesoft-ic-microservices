import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EmployeeService, Employee } from '../../services/employee.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  saving = false;
  message = '';
  currentUser: any;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private employeeService: EmployeeService,
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      phone: [''],
      startDate: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.employeeService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue(profile);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.saving = true;
    this.message = '';

    const profileData = this.profileForm.value;

    this.employeeService.updateProfile(profileData).subscribe({
      next: (updatedProfile) => {
        this.message = 'Profile updated successfully!';
        this.saving = false;
        
        // Update current user data
        const updatedUser = { ...this.currentUser, ...updatedProfile };
        this.authService.setCurrentUser(updatedUser);
        this.currentUser = updatedUser;
      },
      error: (error) => {
        this.message = 'Error updating profile. Please try again.';
        this.saving = false;
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
