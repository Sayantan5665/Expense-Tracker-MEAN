import { CurrencyPipe, DatePipe, DOCUMENT, NgOptimizedImage, NgStyle } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { AlertService, ApiService, EventService } from '@services';
import { RoundProgressComponent } from 'angular-svg-round-progressbar';
import { MAT_SELECT_CONFIG, MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import Splide from '@splidejs/splide';
import { Grid } from '@splidejs/splide-extension-grid';

@Component({
  selector: 'app-dashboard',
  imports: [NgOptimizedImage, DatePipe, NgStyle, MatIcon, RoundProgressComponent, MatSelectModule, FormsModule, CurrencyPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: [
    {
      provide: MAT_SELECT_CONFIG,
      useValue: { overlayPanelClass: 'dashboardSelectOptions' }
    }
  ],
})
export class DashboardComponent implements OnInit {
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
  protected readonly months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  protected selectedMonth = signal<{ current: number, selected: number, rangeStart: Date | string, rangeEnd: Date | string }>(
    {
      current: (new Date).getMonth(),
      selected: (new Date).getMonth(),
      rangeStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      rangeEnd: new Date()
    }
  );
  protected chart!: Chart;
  private doughnutData = signal<any>({});
  protected splide:any;

  protected expenseDetailsWithReport: any = rxResource({
    request: () => ({ selectedMonth: this.selectedMonth() }),
    loader: (e) => {
      const selectedMonth = e.request.selectedMonth;
      return this.api.get(`api/expense/fetch-by-filter-with-report?startDate=${selectedMonth.rangeStart}&endDate=${selectedMonth.rangeEnd}`);
    },
  });
  protected expenseDetailsCategoryWise: any = rxResource({
    request: () => ({ selectedMonth: this.selectedMonth() }),
    loader: (e) => {
      const selectedMonth = e.request.selectedMonth;
      return this.api.get(`api/expense/fetch-by-category-wise?type=${'cash-out'}&startDate=${selectedMonth.rangeStart}&endDate=${selectedMonth.rangeEnd}`);
    },
  });

  constructor() {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
    this.calculateMonthDetails();
    effect(() => {
      const error: any = this.expenseDetailsWithReport.error();
      if (error) {
        this.alert.toast(error.message, 'error');
      }
    });
    effect(() => {
      const value: any = this.expenseDetailsCategoryWise.value();
      const error: any = this.expenseDetailsCategoryWise.error();
      if (value) {
        console.log("expenseDetailsCategoryWise value: ", value);
        const data = value.data;
        if (data.length) {
          const chartContainer = this.document.getElementById('chartContainer');
          if (chartContainer) {
            // check if a cavas with id 'doughnutCanvas' exists inside the chartContainer. If not then create one
            if (!this.document.getElementById('doughnutCanvas')) {
              const canvas = this.document.createElement('canvas');
              canvas.id = 'doughnutCanvas';
              chartContainer.appendChild(canvas);
            }
            // Remove the message if it exists
            const msg = this.document.getElementById('emptyDoughnutMsg');
            if (msg) {
              chartContainer.removeChild(msg);
            }
          }

          this.doughnutData.set({
            labels: data.map((item: any) => item?.category?.name || ''),
            datasets: [{
              data: data.map((item: any) => item?.totalAmount || 0),
              backgroundColor: data.map((item: any) => item.category.color.hexCode),
              hoverOffset: 4
            }],
          });
          this.doughnutChartInit();
        } else {
          // Check if a chart instance already exists
          if (this.chart) {
            this.chart.destroy(); // Destroy the existing chart
          }
          // Add a message if no data is available
          const chartContainer = this.document.getElementById('chartContainer');
          if (chartContainer) {
            const msg = this.document.createElement('p');
            msg.id = 'emptyDoughnutMsg';
            msg.innerHTML = 'No data available';
            chartContainer.innerHTML = '';
            chartContainer.appendChild(msg);
          }
        }

        // Initialize Splide for category
        this.splideInit();
      }
      if (error) {
        this.alert.toast(error.message, 'error');
      }
    });
  }

  ngOnInit(): void { }

  /** Calculate the days gone, weekdays remaining, and weekends remaining */
  protected calculateMonthDetails() {
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

  protected onMonthChange(event: any) {
    const month = this.months[event]
    const _selectedMonth = this.selectedMonth();
    if (_selectedMonth.current === event) {
      this.selectedMonth.update((values) => ({ ...values, selected: event, rangeStart: new Date(new Date().getFullYear(), event, 1), rangeEnd: (new Date()) }));
    } else {
      this.selectedMonth.update((values) => ({ ...values, selected: event, rangeStart: new Date(new Date().getFullYear(), event, 1), rangeEnd: new Date((new Date).getFullYear(), event + 1, 0) }));
    }
  }

  private doughnutChartInit() {
    // Check if a chart instance already exists
    if (this.chart) {
      this.chart.destroy(); // Destroy the existing chart
    }

    // Create a new chart instance
    this.chart = new Chart('doughnutCanvas', {
      type: 'doughnut',
      data: this.doughnutData(),
      options: {
        //   animation: true, // Disable animations
        //   responsive: true, // Make the chart responsive
        plugins: {
          legend: {
            // position: 'bottom',
            display: false,
          },
          //     tooltip: {
          //       callbacks: {
          //         label: (context: any) => {
          //           const label = context.label || '';
          //           const value = context.raw || 0;
          //           return `${label}: ${value}`;
          //         },
          //       },
          //     }
        }
      },
    })
  }

  private splideInit() {
    const config:any = {
      perMove: 1,
      arrows: true,
      grid: {
        rows: 2,
        cols: 10,
        gap : {
          row: '5px',
          col: '5px',
        },
      },
      breakpoints: {
        2000: {
          grid: {
            rows: 2,
            cols: 9,
          },
        },
        1650: {
          grid: {
            rows: 2,
            cols: 8,
          },
        },
        1450: {
          grid: {
            rows: 2,
            cols: 7,
          },
        },
        1250: {
          grid: {
            rows: 2,
            cols: 6,
          },
        },
        1050: {
          grid: {
            rows: 2,
            cols: 5,
          },
        },
        900: {
          grid: {
            rows: 2,
            cols: 4,
          },
        },
        480: {
          grid: {
            rows: 2,
            cols: 3,
          },
        },
        380: {
          grid: {
            rows: 2,
            cols: 2,
          },
        },
        300: {
          grid: false,
        },
      },
    }
    this.splide = new Splide('#splide', config);
    this.splide.mount({ Grid });
  }
}
