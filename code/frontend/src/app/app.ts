import { Component, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SplashComponent } from './core/splash/splash.component';
import { environment } from '../environments/environment';

const BASE_TITLE = 'Atreyu Library';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [AppLayoutComponent, SplashComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly backendReady = signal(false);

  constructor() {
    const title = inject(Title);
    const badge = environment.envBadge;
    title.setTitle(badge ? `${badge} ${BASE_TITLE}` : BASE_TITLE);
  }

  protected onSplashDone(): void {
    this.backendReady.set(true);
  }
}
