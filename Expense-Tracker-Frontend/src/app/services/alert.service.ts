import { Injectable } from '@angular/core';
import { alertType } from '@types';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  public toast(msg:string, type:alertType, timer?:number) {
    return Swal.fire({
      toast: true,
      title: msg,
      icon: type,
      position: 'top-end',
      showConfirmButton: false,
      showCloseButton: true,
      timer: timer ? timer : 3000,
      timerProgressBar: true,
      didOpen: (toast:any) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    })
  }

  /**
   *
   * @param title can be a string or html in string format [`<strong>HTML <u>example</u></strong>`]
   * @param msg can be a string or html in string format [`<strong>HTML <u>example</u></strong>`]
   * @param type will set modal type(icon) ['success' | 'warning' | 'error' | 'info' | 'question']
   * @param showCloseButton will take boolean value and show close button at top right of modal
   * @param showCancelButton will take boolean value and show cancel button
   * @param confirmButtonText set text to confirm button, can be a string or html in string format. default is 'Confirm'
   * @param cancelButtonText set text to Cancel button, can be a string or html in string format. default is 'Cancel'
   */
  public alertModal(title:string='', msg:string='', type:alertType, showCloseButton:boolean=true, showCancelButton:boolean=true, confirmButtonText:string='Confirm', cancelButtonText:string='Cancel') {
    return Swal.fire({
      title: title,
      icon: type,
      html: msg,
      showCloseButton: showCloseButton,
      showCancelButton: showCancelButton,
      focusConfirm: false,
      confirmButtonText: confirmButtonText, //`<i class="fa fa-thumbs-up"></i> Great!`,
      confirmButtonAriaLabel: "Confirm",
      cancelButtonText: cancelButtonText, //`<i class="fa fa-thumbs-down"></i>`,
      cancelButtonAriaLabel: "Cancel"
    });
  }
}
