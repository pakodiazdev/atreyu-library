import { Component, signal } from '@angular/core';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SplashComponent } from './core/splash/splash.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [AppLayoutComponent, SplashComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly backendReady = signal(false);

  protected onSplashDone(): void {
    this.backendReady.set(true);
  }
}
