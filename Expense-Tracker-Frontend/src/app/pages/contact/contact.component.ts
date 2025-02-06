import { Component, effect, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiService } from '@services';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private readonly api = inject(ApiService);

  // protected abcd = rxResource({
  //   loader: () => {
  //     return this.api.get('');
  //   },
  // });

  // constructor() {
  //   effect(() => {
  //     console.log('abcd - v: ', this.abcd.value());
  //     console.log('abcd - e: ', this.abcd.error());
  //   });
  // }
}
