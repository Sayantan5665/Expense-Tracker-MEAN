import { afterNextRender, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertService, ApiService, EventService, StorageService } from '@services';
import { ILogin } from '@types';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatProgressSpinner],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  protected form: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,4}$/)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*())]{6,}/)]),
    rememberMe: new FormControl(true)
  });
  protected tooglePassword = signal<'text' | 'password'>('password');
  protected loading = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      this.getCredentials();
    });
  }

  private getCredentials(): void {
    const credentials = this.storage.getCredential();
    credentials && this.form.patchValue(credentials);
  }

  protected submit(form: FormGroup): void {
    if (form.valid) {
      const data: ILogin = form.value;
      this.login(data);
    } else {
      form.markAllAsTouched();

      /**Scroll to the first invalid field */
      let _form = document.getElementById('login-form');
      if (_form) {
        let firstInvalidControl = _form.getElementsByClassName('ng-invalid')[0];
        firstInvalidControl?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  private login(data: ILogin): void {
    this.loading.set(true);
    data.email = data.email.toLowerCase();
    this.api.post('api/user/login', data).subscribe({
      next: (res:any) => {
        this.loading.set(false);
        // console.log("res: ", res);
        if (res.status === 200) {
          this.setDataAfterLogin(res.data);
          data.rememberMe ? this.saveCredential({ email: data.email, password: data.password, rememberMe: true }) : this.storage.clearCredential();
          this.alert.toast('Logged in successfully', 'success');
          this.router.navigate(['/dashboard']);
        } else {
          this.alert.toast(res.message || 'Failed to login', 'warning');
        }
      },
      error: (error: any) => {
        this.loading.set(false);
        console.error("error: ", error);
        this.alert.toast(error.error.message || 'Invalid email or password', 'error');
      }
    });
  }

  private setDataAfterLogin(res: any): void {
    this.storage.setUser({ token: res.token });
    this.event.isLoggedin.set(true);
    this.event.userDetails.set(res);
  }

  private saveCredential(payload: { email: string, password: string, rememberMe: boolean }): void {
    this.storage.setCredential(payload);
  }
}
