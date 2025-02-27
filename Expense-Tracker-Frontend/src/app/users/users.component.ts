import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '@shared';
import { HeaderUserComponent } from '../shared/header-user/header-user.component';

@Component({
  selector: 'app-users',
  imports: [RouterOutlet, HeaderUserComponent, FooterComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

}
