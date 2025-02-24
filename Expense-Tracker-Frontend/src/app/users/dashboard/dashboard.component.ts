import { DatePipe, DOCUMENT, NgOptimizedImage, NgStyle } from '@angular/common';
import { afterNextRender, Component, computed, effect, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AlertService, ApiService, EventService } from '@services';
import {RoundProgressComponent} from 'angular-svg-round-progressbar';

@Component({
  selector: 'app-dashboard',
  imports: [NgOptimizedImage, DatePipe, NgStyle, MatIcon, RoundProgressComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);
  private readonly document = inject(DOCUMENT);

  protected readonly userDetails = computed(() => this.event.userDetails());
  protected monthDetails = signal<{ today: Date, daysGoneInPercent: number, weekdaysRemaining: number, weekendsRemaining: number }>(
    {
      today: new Date(),
      daysGoneInPercent: 0,
      weekdaysRemaining: 0,
      weekendsRemaining: 0
    }
  );

  constructor() {
    effect(() => { console.log("Dashboard: user -> ", this.userDetails()); });
    this.calculate();
    afterNextRender(() => {
      this.halfCircularProgressBar();
    });
  }

  progress = 70; // Percentage of completion (e.g., 70%)
  progressDegree = 0;

  ngOnInit(): void {
    this.progressDegree = (this.progress / 100) * 180;
  }

  /** Calculate the days gone, weekdays remaining, and weekends remaining */
  protected calculate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const daysGone = today.getDate();

    const remainingDays = totalDaysInMonth - daysGone;

    // Calculate remaining weekdays and weekends
    let weekdaysRemaining = 0;
    let weekendsRemaining = 0;

    for (let i = 0; i < remainingDays; i++) {
      const day = (today.getDay() + i) % 7;
      (day === 0 || day === 6) ? weekendsRemaining++ : weekdaysRemaining++;
    }

    this.monthDetails.update((values) => ({
      ...values,
      daysGoneInPercent: Math.round((daysGone / totalDaysInMonth) * 100),
      weekendsRemaining,
      weekdaysRemaining,
    }));
  }


  protected greetings() {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning!';
    if (hours < 18) return 'Good afternoon!';
    return 'Good evening!';
  }

  halfCircularProgressBar(precent:number = 10) {
    var bar = this.document.querySelector('.bar');
    console.log("bar: ", bar);
    if (bar) {
      let start = 0;
      const duration = 3000;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        if (bar instanceof HTMLElement) {
          bar.style.transform = "rotate(" + (45 + (progress * precent * 1.8)) + "deg)"; // 100%=180° so: ° = % * 1.8
          // 45 is to add the needed rotation to have the green borders at the bottom
        }
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }
}
