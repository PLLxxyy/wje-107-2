import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MenuItem } from '../../../models/menu-item.model';
import { CurrencyPipe } from '../../../pipes/currency.pipe';
import { SpiceLevelPipe } from '../../../pipes/spice-level.pipe';
import { SpiceIconComponent } from '../spice-icon/spice-icon.component';

@Component({
  selector: 'app-menu-item-card',
  standalone: true,
  imports: [NgIf, CurrencyPipe, SpiceLevelPipe, SpiceIconComponent],
  templateUrl: './menu-item-card.component.html',
  styleUrl: './menu-item-card.component.css'
})
export class MenuItemCardComponent {
  @Input({ required: true }) menuItem!: MenuItem;
  @Input() compact = false;

  get imageIcon(): string {
    return this.menuItem.image.startsWith('icon:') ? this.menuItem.image.replace('icon:', '') : '🍽️';
  }

  get hasImage(): boolean {
    return this.menuItem.image.startsWith('data:image');
  }
}
