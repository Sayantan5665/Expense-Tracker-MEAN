import { CdkMenuModule } from '@angular/cdk/menu';
import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { EventService } from '@services';
import { CalculatorComponent } from 'src/app/modals/calculator/calculator.component';

@Component({
  selector: 'app-header-user',
  imports: [RouterLink, CdkMenuModule],
  templateUrl: './header-user.component.html',
  styleUrl: './header-user.component.scss'
})
export class HeaderUserComponent {
  private readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);
  protected readonly event = inject(EventService);

  protected isMobileMenuOpen = signal<boolean>(false);
  protected isLoggedin = computed(() => this.event.isLoggedin());
  protected userdetails = computed(() => this.event.userDetails());

  constructor() {
    effect(() => {
      const _isMobileMenuOpen = this.isMobileMenuOpen();
      if (_isMobileMenuOpen) this.document.body.style.overflow = 'hidden';
      else this.document.body.style.overflow = 'auto';
    });
  }

  protected openCalculator(button: HTMLElement) {
    this.dialog.open(CalculatorComponent, {
      panelClass: 'calculator-panel',
      data: {
        element: button,
      }
    });
  }

  protected logout() {
    this.event.logout();
  }
}
