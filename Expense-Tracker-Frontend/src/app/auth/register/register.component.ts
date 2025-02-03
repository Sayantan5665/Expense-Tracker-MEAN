import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertService, ApiService } from '@services';
import { IRegister } from '@types';
import { PasswordMatchValidator } from '@utils';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatIcon, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly router = inject(Router);

  protected form: FormGroup = new FormGroup({
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,4}$/)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*())]{6,}/)]),
    confirm_password: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9!@#$%^&*())]{6,}/)]),
  },
    [PasswordMatchValidator('password', 'confirm_password')]
  );

  protected tooglePassword = signal<'text' | 'password'>('password');
  protected toogleConfirmPassword = signal<'text' | 'password'>('password');


  protected submit(form: FormGroup): void {
    if (form.valid) {
      const data: IRegister = form.value;
      this.register(data);
    } else {
      form.markAllAsTouched();

      /**Scroll to the first invalid field */
      let _form = document.getElementById('register-form');
      if (_form) {
        let firstInvalidControl = _form.getElementsByClassName('ng-invalid')[0];
        firstInvalidControl?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  private register(data: IRegister) {
    data.email = data.email.toLowerCase();
    this.api.post('', data).subscribe({
      next: (res) => {
        this.alert.toast("Registration successful! Please login.", 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error("err: ", err);
        this.alert.toast(err.message || "Something went wrong!", 'error');
      }
    });
  }
}
