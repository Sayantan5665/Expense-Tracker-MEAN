import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {  } from '@shared';
import { HeaderPagesComponent } from '../shared/header-pages/header-pages.component';

@Component({
  selector: 'app-pages',
  imports: [RouterOutlet, HeaderPagesComponent],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.scss'
})
export class PagesComponent {

}
