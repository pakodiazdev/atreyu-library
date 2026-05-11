import { Component, input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  /** Título que se muestra en la barra superior */
  readonly title = input<string>('Atreyu · biblioteca');
}
