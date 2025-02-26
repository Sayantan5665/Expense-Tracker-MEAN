import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {  } from '@shared';
import { HeaderPagesComponent } from '../shared/header-pages/header-pages.component';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, HeaderPagesComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

}
