import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { DragData } from '../../../models/drag-state.model';
import { Category } from '../../../models/category.model';
import { MenuItem } from '../../../models/menu-item.model';
import { MenuItemCardComponent } from '../../common/menu-item-card/menu-item-card.component';

@Component({
  selector: 'app-item-panel',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, DraggableDirective, MenuItemCardComponent],
  templateUrl: './item-panel.component.html',
  styleUrl: './item-panel.component.css'
})
export class ItemPanelComponent {
  @Input({ required: true }) items: MenuItem[] = [];
  @Input({ required: true }) categories: Category[] = [];
  @Input() selectedCategoryId = '';
  searchTerm = '';

  get filteredItems(): MenuItem[] {
    const normalized = this.searchTerm.trim().toLowerCase();
    return this.items.filter((item) => {
      const matchesCategory = !this.selectedCategoryId || item.categoryId === this.selectedCategoryId;
      const matchesSearch = !normalized || item.name.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized);
      return matchesCategory && matchesSearch;
    });
  }

  dragDataFor(item: MenuItem): DragData {
    return {
      source: 'library',
      menuItemId: item.id
    };
  }

  trackByItem(_index: number, item: MenuItem): string {
    return item.id;
  }
}
