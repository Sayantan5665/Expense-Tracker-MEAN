import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@shared';
import { HeaderPagesComponent } from '../shared/header-pages/header-pages.component';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet, HeaderPagesComponent, FooterComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent {

}
