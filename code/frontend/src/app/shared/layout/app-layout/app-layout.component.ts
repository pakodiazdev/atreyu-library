import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { AppHeaderComponent } from '../app-header/app-header.component';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [RouterOutlet, AppSidebarComponent, AppHeaderComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {}
