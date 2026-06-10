import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-grid-overlay',
  standalone: true,
  templateUrl: './grid-overlay.component.html',
  styleUrl: './grid-overlay.component.css'
})
export class GridOverlayComponent {
  @Input() visible = true;
}
