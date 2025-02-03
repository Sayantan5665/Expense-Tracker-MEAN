import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '@services';

export const LoginAuthGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);
  if(storage.isAuthenticate()) {
    return storage.isAuthenticate();
  } else {
    inject(Router).navigate(['/login']);
    return false;
  }
};

export const NonLoginAuthGuard: CanActivateFn = (route, state) => {
  const storage = inject(StorageService);

  if(!storage.isAuthenticate()) {
    return true;
  } else {
    inject(Router).navigate(['/']);
    return false;
  }
};
