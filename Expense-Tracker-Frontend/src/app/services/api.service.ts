import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, inject, Injectable, Optional, REQUEST } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '@env';
import { AlertService } from '@services';
import { FormArray, FormGroup } from '@angular/forms';
import { isArray, isEmpty } from 'underscore';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly alert = inject(AlertService);
  private readonly http = inject(HttpClient);

  private readonly BASE_API_ENDPOINT:string = environment.BASE_API_ENDPOINT;

  constructor() {

  }
  private errHandler(error: any) {
    return throwError(() => new Error(error.error.message, { cause: error.error }));
  }
  // GET METHOD HTTP REQUEST
  public get(url:string) {
    return this.http.get(`${this.BASE_API_ENDPOINT}/${url}`).pipe(catchError(this.errHandler));
  }

  public post(url:string, data: any) {
    return this.http.post(`${this.BASE_API_ENDPOINT}/${url}`, data).pipe(catchError(this.errHandler));
  }
  public put(url:string, data: any) {
    return this.http.put(`${this.BASE_API_ENDPOINT}/${url}`, data).pipe(catchError(this.errHandler));
  }

  public delete(url:string) {
    return this.http.delete(`${this.BASE_API_ENDPOINT}/${url}`).pipe(catchError(this.errHandler));
  }

}
