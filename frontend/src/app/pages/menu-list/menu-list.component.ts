import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { CategoryBadgeComponent } from '../../components/common/category-badge/category-badge.component';
import { ConfirmDialogComponent } from '../../components/common/confirm-dialog/confirm-dialog.component';
import { MenuItemCardComponent } from '../../components/common/menu-item-card/menu-item-card.component';
import { Category } from '../../models/category.model';
import { MenuItem } from '../../models/menu-item.model';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { SpiceLevelPipe } from '../../pipes/spice-level.pipe';
import { MenuService } from '../../services/menu.service';

type ViewMode = 'table' | 'cards';
type PriceSort = 'none' | 'asc' | 'desc';

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    FormsModule,
    RouterLink,
    CategoryBadgeComponent,
    ConfirmDialogComponent,
    MenuItemCardComponent,
    CurrencyPipe,
    SpiceLevelPipe
  ],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.css'
})
export class MenuListComponent {
  readonly viewModel$ = combineLatest([
    this.menuService.items$,
    this.menuService.categories$
  ]).pipe(
    map(([items, categories]) => ({ items, categories }))
  );
  viewMode: ViewMode = 'cards';
  priceSort: PriceSort = 'none';
  searchTerm = '';
  categoryFilter = '';
  deleteCandidate: MenuItem | null = null;

  constructor(private readonly menuService: MenuService) {}

  filteredItems(items: MenuItem[]): MenuItem[] {
    const normalized = this.searchTerm.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const categoryMatches = !this.categoryFilter || item.categoryId === this.categoryFilter;
      const searchMatches = !normalized || item.name.toLowerCase().includes(normalized) || item.description.toLowerCase().includes(normalized);
      return categoryMatches && searchMatches;
    });
    if (this.priceSort === 'asc') {
      return [...filtered].sort((left, right) => left.price - right.price);
    }
    if (this.priceSort === 'desc') {
      return [...filtered].sort((left, right) => right.price - left.price);
    }
    return filtered;
  }

  categoryFor(id: string, categories: Category[]): Category | null {
    return categories.find((category) => category.id === id) ?? null;
  }

  confirmDelete(): void {
    if (this.deleteCandidate) {
      this.menuService.deleteItem(this.deleteCandidate.id);
      this.deleteCandidate = null;
    }
  }

  trackByItem(_index: number, item: MenuItem): string {
    return item.id;
  }

  trackBySpecId(_index: number, spec: { id: string }): string {
    return spec.id;
  }
}
