import { effect, inject, Injectable, PLATFORM_ID, signal, untracked } from '@angular/core';
import { StorageService } from '@services';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { IUser } from '@types';

interface IProgress {
  value: string | number;
  text: 'Downloading' | 'Uploading' | 'Completed';
  path?: any;
  req?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  public isLoggedin = signal<boolean>(this.storage.isAuthenticate());
  public userDetails = signal<IUser | null>(this.storage.getUser());
  public pageLoad = signal<boolean>(false);
  public subscriptions = signal<{ [key: string]: Subscription }>({});

  constructor() {
    const router = toSignal(inject(Router).events);
    const platformId = inject(PLATFORM_ID)

    effect(() => {
      const _router = router();
      untracked(() => {
        if (_router instanceof NavigationStart && isPlatformBrowser(platformId)) this.pageLoad.set(false);
        if (_router instanceof NavigationEnd && isPlatformBrowser(platformId)) this.pageLoad.set(true);
      })
    });
  }

  public logout() {
    this.storage.clearUser();
    this.isLoggedin.set(false);
    this.userDetails.set(null);
    this.router.navigate(['/login']);
  }
}
