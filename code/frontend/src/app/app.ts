import { Component } from '@angular/core';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [AppLayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
