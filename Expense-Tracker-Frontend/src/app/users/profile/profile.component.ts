import { Component, computed, inject } from '@angular/core';
import { EventService } from '@services';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  private readonly event = inject(EventService);
  protected userDetails = computed(() => this.event.userDetails());

  protected formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
}
