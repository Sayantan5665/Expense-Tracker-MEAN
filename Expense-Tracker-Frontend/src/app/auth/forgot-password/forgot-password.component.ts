import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertService, ApiService } from '@services';
import { PasswordMatchValidator } from '@utils';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, MatProgressSpinner],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  protected form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,4}$/)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*())]{6,}/)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*())]{6,}/)]),
  }, [PasswordMatchValidator('password', 'confirmPassword')]);
  protected tooglePassword = signal<'text' | 'password'>('password');
  protected toogleConfirmPassword = signal<'text' | 'password'>('password');
  protected loading = signal<boolean>(false);

  protected submit(form: FormGroup): void {
    if (form.valid) {
      const data = form.value;
      this.resetPassword(data);
    } else {
      form.markAllAsTouched();

      /**Scroll to the first invalid field */
      let _form = document.getElementById('forgot-password-form');
      if (_form) {
        let firstInvalidControl = _form.getElementsByClassName('ng-invalid')[0];
        firstInvalidControl?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  private resetPassword(data: any): void {
    this.loading.set(true);
    data.email = data.email.toLowerCase();
    this.api.post('api/user/forgot-password', data).subscribe({
      next: (res:any) => {
        this.loading.set(false);
        this.alert.toast('Password reset link has been sent to your email.', 'success');
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.loading.set(false);
        console.error("error: ", error);
        this.alert.toast(error.message || 'Something went wrong!', 'error');
      },
    })
  }
}
