import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService, ApiService } from '@services';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);

  protected form: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,4}$/)]),
    message: new FormControl('', Validators.required),
  });

  constructor() { }

  submit(form: FormGroup) {
    console.log("form.valid: ", form.valid);
    if (form.valid) {
      const data:{ name: string, email: string, message: string } = form.value;
      this.sendRequest(data);
    } else {
      form.markAllAsTouched();

      /**Scroll to the first invalid field */
      let _form = document.getElementById('contact-form');
      if (_form) {
        let firstInvalidControl = _form.getElementsByClassName('ng-invalid')[0];
        firstInvalidControl?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  private sendRequest(data: { name: string, email: string, message: string }) {
    this.api.post('api/contact/send-request', data).subscribe({
      next: () => {
        this.alert.toast('We have got your message. We will reach you soon.', 'success');
        this.form.reset();
      },
      error: (error:any) => {
        console.log("error: ", error);
        this.alert.toast(error.message || 'Something went wrong!', 'error');
      }
    });
  }
}
