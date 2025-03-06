import { CdkMenuModule } from '@angular/cdk/menu';
import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, HostListener, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { EventService } from '@services';
import { CalculatorComponent } from 'src/app/modals/calculator/calculator.component';
import { StatementViewExportDialog } from 'src/app/modals/statement-view-export/statement-view-export.component';

@Component({
  selector: 'app-header-user',
  imports: [RouterLink, CdkMenuModule],
  templateUrl: './header-user.component.html',
  styleUrl: './header-user.component.scss'
})
export class HeaderUserComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);
  protected readonly event = inject(EventService);

  protected isScrolled = signal<boolean>(false);
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

  ngOnInit(): void {
    // Check initial scroll position
    this.checkScroll();
  }

  @HostListener('window:scroll', [])
  checkScroll() {
    // You can adjust this value based on when you want the header to change
    const scrollPosition = window.scrollY || this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    this.isScrolled.set(scrollPosition > 25);
  }

  protected openCalculator(button: HTMLElement) {
    this.dialog.open(CalculatorComponent, {
      panelClass: 'calculator-panel',
      data: {
        element: button,
      }
    });
  }

  protected openViewStatement():void {
    this.dialog.open(StatementViewExportDialog, {
      panelClass: 'get-statement-panel',
      data: {}
    });
  }

  protected logout() {
    this.event.logout();
  }
}
