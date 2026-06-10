import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { SpiceLevel } from '../../../models/enums';

@Component({
  selector: 'app-spice-icon',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './spice-icon.component.html',
  styleUrl: './spice-icon.component.css'
})
export class SpiceIconComponent {
  @Input({ required: true }) level: SpiceLevel = SpiceLevel.NONE;
  @Input() size = 16;

  get peppers(): number[] {
    const countMap: Record<SpiceLevel, number> = {
      [SpiceLevel.NONE]: 0,
      [SpiceLevel.MILD]: 1,
      [SpiceLevel.MEDIUM]: 2,
      [SpiceLevel.HOT]: 3
    };
    return Array.from({ length: countMap[this.level] }, (_, index) => index);
  }
}
