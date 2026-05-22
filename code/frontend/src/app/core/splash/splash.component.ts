import { Component, OnDestroy, OnInit, inject, output, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, catchError, of, switchMap, timer } from 'rxjs';

export type SplashState = 'checking' | 'timeout' | 'ready' | 'error';

@Component({
  standalone: true,
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss',
})
export class SplashComponent implements OnInit, OnDestroy {
  readonly checkState = signal<SplashState>('checking');
  readonly departing = signal(false);
  readonly done = output<void>();

  private readonly http = inject(HttpClient);
  private pollingSubscription?: Subscription;
  private attempts = 0;
  private readonly TIMEOUT_ATTEMPTS = 5;
  private readonly MAX_ATTEMPTS = 20;

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }

  retry(): void {
    this.attempts = 0;
    this.checkState.set('checking');
    this.departing.set(false);
    this.startPolling();
  }

  private startPolling(): void {
    this.pollingSubscription?.unsubscribe();

    this.pollingSubscription = timer(0, 3000)
      .pipe(switchMap(() => this.http.get('/health').pipe(catchError(() => of(null)))))
      .subscribe((result) => {
        this.attempts++;

        if (result !== null) {
          this.pollingSubscription?.unsubscribe();
          this.checkState.set('ready');
          this.departing.set(true);
          setTimeout(() => this.done.emit(), 500);
          return;
        }

        if (this.attempts >= this.MAX_ATTEMPTS) {
          this.pollingSubscription?.unsubscribe();
          this.checkState.set('error');
        } else if (this.attempts >= this.TIMEOUT_ATTEMPTS && this.checkState() === 'checking') {
          this.checkState.set('timeout');
        }
      });
  }
}
