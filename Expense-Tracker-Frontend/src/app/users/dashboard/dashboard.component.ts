import { CurrencyPipe, DatePipe, DOCUMENT, NgClass, NgOptimizedImage, NgStyle } from '@angular/common';
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
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [NgOptimizedImage, DatePipe, NgStyle, MatIcon, RoundProgressComponent, MatSelectModule,
    FormsModule, CurrencyPipe, NgClass, NgStyle, RouterLink],
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
  __expenseCategoryWise = {
    docs: [
      {
        "_id": "67af3466ef2d50ecaf18b05d",
        "totalAmount": 1260,
        "category": {
          "_id": "67af3466ef2d50ecaf18b05d",
          "name": "Category-2(Hello!HowAreYou.)",
          "description": "Category-2 description",
          "color": {
            "_id": "67a4b823df6cedadaaaac3f3",
            "name": "DarkRed",
            "hexCode": "#8B0000"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c10493b",
        "totalAmount": 10600,
        "category": {
          "_id": "67a5b3488f61c4642c10493b",
          "name": "Category-1(Hello!HowAreYou.)",
          "description": "Category-1 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3c3",
            "name": "IndianRed",
            "hexCode": "#CD5C5C"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104940",
        "totalAmount": 8000,
        "category": {
          "_id": "67a5b3488f61c4642c104940",
          "name": "Category-3(Hello!HowAreYou.)",
          "description": "Category-3 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3c4",
            "name": "Crimson",
            "hexCode": "#DC143C"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104941",
        "totalAmount": 5400,
        "category": {
          "_id": "67a5b3488f61c4642c104941",
          "name": "Category-4(Hello!HowAreYou.)",
          "description": "Category-4 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3c5",
            "name": "FireBrick",
            "hexCode": "#B22222"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104942",
        "totalAmount": 9200,
        "category": {
          "_id": "67a5b3488f61c4642c104942",
          "name": "Category-5(Hello!HowAreYou.)",
          "description": "Category-5 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3c6",
            "name": "Salmon",
            "hexCode": "#FA8072"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104943",
        "totalAmount": 7000,
        "category": {
          "_id": "67a5b3488f61c4642c104943",
          "name": "Category-6(Hello!HowAreYou.)",
          "description": "Category-6 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3c7",
            "name": "Tomato",
            "hexCode": "#FF6347"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104944",
        "totalAmount": 3600,
        "category": {
          "_id": "67a5b3488f61c4642c104944",
          "name": "Category-7(Hello!HowAreYou.)",
          "description": "Category-7 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3c8",
            "name": "Coral",
            "hexCode": "#FF7F50"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104945",
        "totalAmount": 6400,
        "category": {
          "_id": "67a5b3488f61c4642c104945",
          "name": "Category-8(Hello!HowAreYou.)",
          "description": "Category-8 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3c9",
            "name": "OrangeRed",
            "hexCode": "#FF4500"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104946",
        "totalAmount": 5000,
        "category": {
          "_id": "67a5b3488f61c4642c104946",
          "name": "Category-9(Hello!HowAreYou.)",
          "description": "Category-9 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d0",
            "name": "Gold",
            "hexCode": "#FFD700"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104947",
        "totalAmount": 7200,
        "category": {
          "_id": "67a5b3488f61c4642c104947",
          "name": "Category-10(Hello!HowAreYou.)",
          "description": "Category-10 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d1",
            "name": "Yellow",
            "hexCode": "#FFFF00"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104948",
        "totalAmount": 4500,
        "category": {
          "_id": "67a5b3488f61c4642c104948",
          "name": "Category-11(Hello!HowAreYou.)",
          "description": "Category-11 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d2",
            "name": "Lime",
            "hexCode": "#00FF00"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104949",
        "totalAmount": 3800,
        "category": {
          "_id": "67a5b3488f61c4642c104949",
          "name": "Category-12(Hello!HowAreYou.)",
          "description": "Category-12 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d3",
            "name": "Green",
            "hexCode": "#008000"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104950",
        "totalAmount": 6200,
        "category": {
          "_id": "67a5b3488f61c4642c104950",
          "name": "Category-13(Hello!HowAreYou.)",
          "description": "Category-13 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d4",
            "name": "Teal",
            "hexCode": "#008080"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104951",
        "totalAmount": 7800,
        "category": {
          "_id": "67a5b3488f61c4642c104951",
          "name": "Category-14(Hello!HowAreYou.)",
          "description": "Category-14 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d5",
            "name": "Aqua",
            "hexCode": "#00FFFF"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104952",
        "totalAmount": 5400,
        "category": {
          "_id": "67a5b3488f61c4642c104952",
          "name": "Category-15(Hello!HowAreYou.)",
          "description": "Category-15 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d6",
            "name": "Navy",
            "hexCode": "#000080"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104953",
        "totalAmount": 8900,
        "category": {
          "_id": "67a5b3488f61c4642c104953",
          "name": "Category-16(Hello!HowAreYou.)",
          "description": "Category-16 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d7",
            "name": "Blue",
            "hexCode": "#0000FF"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104954",
        "totalAmount": 6700,
        "category": {
          "_id": "67a5b3488f61c4642c104954",
          "name": "Category-17(Hello!HowAreYou.)",
          "description": "Category-17 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d8",
            "name": "Purple",
            "hexCode": "#800080"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104955",
        "totalAmount": 4300,
        "category": {
          "_id": "67a5b3488f61c4642c104955",
          "name": "Category-18(Hello!HowAreYou.)",
          "description": "Category-18 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3d9",
            "name": "Fuchsia",
            "hexCode": "#FF00FF"
          }
        }
      },
      {
        "_id": "67a5b3488f61c4642c104956",
        "totalAmount": 5600,
        "category": {
          "_id": "67a5b3488f61c4642c104956",
          "name": "Category-19(Hello!HowAreYou.)",
          "description": "Category-19 description",
          "color": {
            "_id": "67a4b6c4df6cedadaaaac3e0",
            "name": "Pink",
            "hexCode": "#FFC0CB"
          }
        }
      }
    ]
  }


  private readonly api = inject(ApiService);
  private readonly alert = inject(AlertService);
  private readonly event = inject(EventService);
  private readonly document = inject(DOCUMENT);

  protected readonly userDetails = computed(() => this.event.userDetails());
  protected monthDetails = signal<{ today: Date, daysGoneInPercent: number, weekdaysRemaining: number, weekendsRemaining: number, totalRemainingDays:number }>(
    {
      today: new Date(),
      daysGoneInPercent: 0,
      weekdaysRemaining: 0,
      weekendsRemaining: 0,
      totalRemainingDays: 0
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
  protected splide: any;

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
      return this.api.get(`api/expense/fetch-by-category-wise?type=cash-out&startDate=${selectedMonth.rangeStart}&endDate=${selectedMonth.rangeEnd}`);
    },
  });
  private allTransactions: any = rxResource({
    loader: (e) => {
      return this.api.get(`api/expense/fetch/all?page=1&limit=6`);
    },
  });
  protected recentTransactions = signal<{ firstFive: Array<any>, totalLength: number }>({ firstFive: [], totalLength: 0 });


  constructor() {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);
    effect(() => {
      this.selectedMonth();
      this.calculateMonthDetails();
    });
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
        // console.log("expenseDetailsCategoryWise: ", value);
        const data = value.data.docs;
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
            msg.classList.add('text-gray-500');
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
    effect(() => {
      const value: any = this.allTransactions.value();
      const error: any = this.allTransactions.error();
      if (value) {
        // console.log("allTransactions: ", value);
        const data = value.data.docs;
        if (data.length) {
          this.recentTransactions.set({ firstFive: data.slice(0, 5), totalLength: data.length });
        } else {
          this.recentTransactions.set({ firstFive: [], totalLength: data.length });
        }
      }
      if (error) {
        this.alert.toast(error.message, 'error');
      }
    });
  }

  ngOnInit(): void { }

  private splideInit() {
    const config: any = {
      perMove: 1,
      gap: '5px',
      arrows: false,
      grid: {
        rows: 2,
        cols: 12,
        gap: {
          row: '5px',
          col: '5px',
        },
      },
      breakpoints: {
        2000: {
          grid: {
            rows: 2,
            cols: 11,
          },
        },
        1650: {
          grid: {
            rows: 2,
            cols: 9,
          },
        },
        1450: {
          grid: {
            rows: 2,
            cols: 8,
          },
        },
        1250: {
          grid: {
            rows: 2,
            cols: 7,
          },
        },
        1050: {
          grid: {
            rows: 2,
            cols: 6,
          },
        },
        900: {
          grid: {
            rows: 2,
            cols: 5,
          },
        },
        480: {
          grid: {
            rows: 2,
            cols: 4,
          },
        },
        380: {
          grid: {
            rows: 2,
            cols: 3,
          },
        },
        300: {
          grid: {
            rows: 1,
            cols: 1,
          },
        },
      },
    }
    this.splide = new Splide('#splide', config);
    this.splide.mount({ Grid });
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

  /** Calculate the days gone, weekdays remaining, and weekends remaining */
  protected calculateMonthDetails() {
    const selectedMonth = this.selectedMonth();
    const today = new Date();
    const year = today.getFullYear();
    const month = selectedMonth.selected; // Use the selected month instead of the current month

    // Calculate the total days in the selected month
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Determine the current day in the selected month
    let daysGone = today.getDate();
    if (month !== today.getMonth()) {
      // If the selected month is not the current month, assume all days are gone
      daysGone = totalDaysInMonth;
    }

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
      today: new Date(year, month, daysGone), // Update today's date to reflect the selected month
      daysGoneInPercent: Math.round((daysGone / totalDaysInMonth) * 100),
      weekendsRemaining,
      weekdaysRemaining,
      totalRemainingDays: remainingDays
    }));
  }

  protected greetings() {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning!';
    if (hours < 18) return 'Good afternoon!';
    return 'Good evening!';
  }

  protected onMonthChange(event: any) {
    const _selectedMonth = this.selectedMonth();
    if (_selectedMonth.current === event) {
      this.selectedMonth.update((values) => ({ ...values, selected: event, rangeStart: new Date(new Date().getFullYear(), event, 1), rangeEnd: (new Date()) }));
    } else {
      this.selectedMonth.update((values) => ({ ...values, selected: event, rangeStart: new Date(new Date().getFullYear(), event, 1), rangeEnd: new Date((new Date).getFullYear(), event + 1, 0) }));
    }
  }

}
