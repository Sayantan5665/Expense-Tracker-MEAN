import { Routes } from '@angular/router';
import { LoginAuthGuard, NonLoginAuthGuard } from '@guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/pages.component').then((c) => c.PagesComponent),
    children: [
      // { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '', loadComponent: () => import('./pages/home/home.component').then((c) => c.HomeComponent) },
      { path: 'about', loadComponent: () => import('./pages/about/about.component').then((c) => c.AboutComponent) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then((c) => c.ContactComponent) },
    ]
  },
  {
    path: '',
    loadComponent: () => import('./users/users.component').then((c) => c.UsersComponent),
    canActivate: [LoginAuthGuard],
    children: [
      { path: 'profile', loadComponent: () => import('./users/profile/profile.component').then((c) => c.ProfileComponent) },
      { path: 'dashboard', loadComponent: () => import('./users/dashboard/dashboard.component').then((c) => c.DashboardComponent) },
    ]
  },
  {
    path: '',
    loadComponent: () => import('./auth/auth.component').then((c) => c.AuthComponent),
    canActivate: [NonLoginAuthGuard],
    children: [
      { path: 'login', loadComponent: () => import('./auth/login/login.component').then((c) => c.LoginComponent) },
      { path: 'register', loadComponent: () => import('./auth/register/register.component').then((c) => c.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./auth/forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent) }
    ]
  },
  { path: '**', redirectTo: '/', pathMatch: 'full' },
];
