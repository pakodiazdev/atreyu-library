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
import { cva } from 'class-variance-authority';
import { cn } from '../ui.utils';

/** Fuente única de verdad para la duración de la transición del drawer (ms). */
const DRAWER_TRANSITION_MS = 350;

const panelVariants = cva(
  [
    'relative flex flex-col h-full bg-papel shadow-2xl overflow-hidden',
    'transition-transform ease-in-out',
    // Responsivo: ancho completo en móvil, se adapta desde 30% en pantallas grandes
    'w-full sm:w-4/5 md:w-3/5 lg:w-[38%] lg:min-w-[30vw]',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'sm:!w-[min(80%,360px)]',
        md: '',
        lg: 'lg:!w-[55%]',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

@Component({
  standalone: true,
  selector: 'ui-drawer',
  templateUrl: './ui-drawer.component.html',
})
export class UiDrawerComponent implements OnDestroy {
  readonly isOpen = input(false);
  readonly title = input<string | undefined>(undefined);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  @Output() readonly closed = new EventEmitter<void>();

  protected readonly isVisible = signal(false);
  protected readonly isAnimatingIn = signal(false);
  protected readonly drawerTransitionMs = DRAWER_TRANSITION_MS;

  private closeTimeout?: ReturnType<typeof setTimeout>;
  private rafId?: ReturnType<typeof requestAnimationFrame>;
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const open = this.isOpen();
      untracked(() => {
        if (open) {
          clearTimeout(this.closeTimeout);
          // 1. Montar el elemento con translate-x-full (isAnimatingIn=false)
          this.isVisible.set(true);
          this.document.body.style.overflow = 'hidden';
          // 2. Siguiente frame: activar la transición CSS hacia translate-x-0
          cancelAnimationFrame(this.rafId!);
          this.rafId = requestAnimationFrame(() => {
            this.isAnimatingIn.set(true);
          });
        } else if (this.isVisible()) {
          // Solo iniciar secuencia de salida si el drawer estaba visible
          // 1. Iniciar animación de salida (translate-x-full)
          cancelAnimationFrame(this.rafId!);
          this.isAnimatingIn.set(false);
          // 2. Restaurar scroll y eliminar del DOM al terminar la transición
          this.closeTimeout = setTimeout(() => {
            this.document.body.style.overflow = '';
            this.isVisible.set(false);
          }, DRAWER_TRANSITION_MS + 10);
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

  protected panelClass(): string {
    return cn(
      panelVariants({ size: this.size() }),
      this.isAnimatingIn() ? 'translate-x-0' : 'translate-x-full'
    );
  }

  close(): void {
    this.closed.emit();
  }
}
