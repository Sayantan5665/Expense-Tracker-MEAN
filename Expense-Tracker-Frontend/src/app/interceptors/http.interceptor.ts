import { HttpInterceptorFn, type HttpHandlerFn, type HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '@services';

export const httpInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const storage = inject(StorageService);
  const token = storage.getUserDataField('token');
  let tokenizedReq = req.clone({
    headers: req.headers.set('x-access-token', token)
  });

  return next(tokenizedReq);
};
