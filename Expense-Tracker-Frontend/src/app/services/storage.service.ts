import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import * as CryptoTS from 'crypto-ts';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly cookie = inject(CookieService);

  USER = {
    KEY: 'expense_tracker_user',
    PASSWORD: '!##47344*()?:}950sdfgsd%es12323?UERSklso'
  };
  TEMP = {
    KEY: 'expense_tracker_temp',
    PASSWORD: '9d485!##64564*()?:}34YYIU!@00adsf@£sxfcdf'
  };
  REMEMBER = {
    KEY: 'expense_tracker_remember',
    PASSWORD: '!##54674*()?:}9504783ilyas%:fg23?REMEkmbr'
  };


  /*** ENCRYPT THE DATA */
  encription(data: any, secret: string):string {
    return CryptoTS.AES.encrypt(JSON.stringify(data), secret).toString();
  }

  /*** DECRYPT THE ENCRYPTED DATA */
  decription(data: any, secret: string) {
    const bytes = CryptoTS.AES.decrypt(data.toString(), secret);
    return JSON.parse(bytes.toString(CryptoTS.enc.Utf8));
  }




  /*** SAVE USER DATA IN COOKIES WHEN LOGIN THE USER */
  async setUser(data: any) {
    return this.cookie.set(this.USER.KEY, this.encription(data, this.USER.PASSWORD).toString(), 7, '/', '', false, 'Strict');
  }

  /*** GET SAVED USER DATA FROM COOKIES */
  getUser() {
    const DATA = this.cookie.get(this.USER.KEY) ? this.cookie.get(this.USER.KEY) : undefined;
    if (DATA) {
      return this.decription(DATA, this.USER.PASSWORD);
    } else {
      return undefined;
    }
  }

  /*** CLEAR USER COOKIES DATA WHEN LOGOUT THE USER */
  clearUser() {
    this.cookie.delete(this.USER.KEY, '/');
    this.cookie.delete(this.USER.KEY, '/user');
    this.cookie.delete(this.USER.KEY, '/user/*');
  }

  /*** GET USER COOKIES DATA BY KEY NAME */
  getUserDataField(type: string) {
    const user = this.getUser();
    if (user && user[type]) {
      return user[type];
    } else {
      return undefined;
    }
  }




  /*** SAVE REMEMBER ME OPTION IF EXIST */
  setCredential(data: any) {
    return this.cookie.set(this.REMEMBER.KEY, this.encription(data, this.REMEMBER.PASSWORD).toString(), 365, '/');
  }

  /*** GET SAVED REMEMBER ME OPTION IF EXIST */
  getCredential() {
    const DATA = this.cookie.get(this.REMEMBER.KEY) ? this.cookie.get(this.REMEMBER.KEY) : undefined;
    if (DATA) {
      return this.decription(DATA, this.REMEMBER.PASSWORD);
    } else {
      return false;
    }
  }

  /*** DELETE SAVED REMEMBER ME OPTION */
  clearCredential() {
    this.cookie.delete(this.REMEMBER.KEY, '/');
  }





  /*** SAVE TEMP DATA WHEN REQUIRED */
  setTempData(key:string, data: any) {
    return this.cookie.set(key, this.encription(data, this.TEMP.PASSWORD).toString());
  }

  /*** GET SAVED TEMP DATA */
  getTempData(key:string) {
    const DATA = this.cookie.get(key) ? this.cookie.get(key) : undefined;
    if (DATA) {
      return this.decription(DATA, this.TEMP.PASSWORD);
    } else {
      return false;
    }
  }

  /*** DELETE TEMP DATA IF EXIST */
  clearTempData(key:string) {
    return this.cookie.delete(key);
  }




  /*** DETECT USER'S TOEKN IS AVAIABLE OR NOT */
  isAuthenticate(): boolean {
    return this.getUserDataField('token') !== undefined;
  }
}
