import { Component, input, output } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  readonly title = input<string>('Atreyu · biblioteca');
  readonly burgerToggle = output<void>();
}
