import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '@env';
import { AlertService } from '@services';

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
    // return throwError(() => new Error(error.error.message, { cause: error.error }));
    return throwError(() => error || "Server Error!");
  }

  // GET METHOD HTTP REQUEST
  public get(url:string) {
    return this.http.get(`${this.BASE_API_ENDPOINT}/${url}`).pipe(catchError(this.errHandler));
  }

  public post(url:string, data: any) {
    console.log("url: ", `${this.BASE_API_ENDPOINT}/${url}`);
    console.log("data: ", data);
    return this.http.post(`${this.BASE_API_ENDPOINT}/${url}`, data).pipe(catchError(this.errHandler));
  }
  public put(url:string, data: any) {
    return this.http.put(`${this.BASE_API_ENDPOINT}/${url}`, data).pipe(catchError(this.errHandler));
  }

  public delete(url:string) {
    return this.http.delete(`${this.BASE_API_ENDPOINT}/${url}`).pipe(catchError(this.errHandler));
  }

}
