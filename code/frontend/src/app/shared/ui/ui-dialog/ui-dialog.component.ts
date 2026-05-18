import {
  Component,
  DOCUMENT,
  EventEmitter,
  HostListener,
  OnDestroy,
  Output,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';

const DIALOG_TRANSITION_MS = 200;

@Component({
  standalone: true,
  selector: 'ui-dialog',
  templateUrl: './ui-dialog.component.html',
})
export class UiDialogComponent implements OnDestroy {
  readonly isOpen = input(false);
  readonly title  = input<string | undefined>(undefined);
  @Output() readonly closed = new EventEmitter<void>();

  protected readonly isVisible     = signal(false);
  protected readonly isAnimatingIn = signal(false);
  protected readonly dialogTransitionMs = DIALOG_TRANSITION_MS;

  private closeTimeout?: ReturnType<typeof setTimeout>;
  private rafId?:        ReturnType<typeof requestAnimationFrame>;
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const open = this.isOpen();
      untracked(() => {
        if (open) {
          clearTimeout(this.closeTimeout);
          this.isVisible.set(true);
          this.document.body.style.overflow = 'hidden';
          cancelAnimationFrame(this.rafId!);
          this.rafId = requestAnimationFrame(() => {
            this.isAnimatingIn.set(true);
          });
        } else if (this.isVisible()) {
          cancelAnimationFrame(this.rafId!);
          this.isAnimatingIn.set(false);
          this.closeTimeout = setTimeout(() => {
            this.document.body.style.overflow = '';
            this.isVisible.set(false);
          }, DIALOG_TRANSITION_MS + 10);
        }
      });
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeTimeout);
    cancelAnimationFrame(this.rafId!);
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.close();
  }

  close(): void {
    this.closed.emit();
  }
}
