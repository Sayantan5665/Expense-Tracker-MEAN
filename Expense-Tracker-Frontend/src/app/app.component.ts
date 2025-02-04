import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterOutlet } from '@angular/router';
import { ApiService, EventService } from '@services';
import { of } from 'rxjs';
import { CalculatorComponent } from './modals/calculator/calculator.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly event = inject(EventService);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);

  protected pageLoad = computed(() => this.event.pageLoad());
  protected isLoggedin = computed(() => this.event.isLoggedin());
  private routerEvent = toSignal(this.router.events);
  private userDetails = rxResource({
    request: (this.isLoggedin, this.routerEvent),
    loader: () => {
      return this.isLoggedin() ? this.api.get(`api/user/fetch/profile`) : of(false);
    },
  });

  constructor() {
    effect(() => {
      const userDetails = this.userDetails;
      if (userDetails.error()) {
        setTimeout(() => {
          this.event.logout()
        }, 900);
      }
      if (userDetails.value()) {
        const details: any = userDetails.value();
        if (details) {
          setTimeout(() => {
            (details?.data ? this.event.userDetails.set(details.data) : this.event.logout());
          }, 800);
        }
      }
    })
  }

  openCalculator(button: HTMLElement) {
    this.dialog.open(CalculatorComponent, {
      panelClass: 'calculator-panel',
      data: {
        element: button,
      }
    });
  }
}
