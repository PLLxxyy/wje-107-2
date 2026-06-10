import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { MenuCanvasComponent } from '../../components/canvas/menu-canvas/menu-canvas.component';
import { CategoryPanelComponent } from '../../components/sidebar/category-panel/category-panel.component';
import { ItemPanelComponent } from '../../components/sidebar/item-panel/item-panel.component';
import { PropertyPanelComponent } from '../../components/sidebar/property-panel/property-panel.component';
import { TemplateType } from '../../models/enums';
import { LayoutItem, LayoutStyle, MenuLayout } from '../../models/menu-layout.model';
import { MenuItem } from '../../models/menu-item.model';
import { ExportService } from '../../services/export.service';
import { MenuService } from '../../services/menu.service';
import { TemplateService } from '../../services/template.service';
import { UndoRedoService } from '../../services/undo-redo.service';

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgIf,
    FormsModule,
    RouterLink,
    MenuCanvasComponent,
    CategoryPanelComponent,
    ItemPanelComponent,
    PropertyPanelComponent
  ],
  templateUrl: './designer.component.html',
  styleUrl: './designer.component.css'
})
export class DesignerComponent implements OnInit {
  readonly templates = this.templateService.templates;
  readonly viewModel$ = combineLatest([
    this.templateService.currentLayout$,
    this.menuService.items$,
    this.menuService.categories$,
    this.menuService.categoryCounts$,
    this.undoRedo.availability$
  ]).pipe(
    map(([layout, items, categories, counts, history]) => ({ layout, items, categories, counts, history }))
  );
  selectedCategoryId = '';
  selectedItemId = '';
  zoom = 0.78;
  panX = 0;
  panY = 0;
  showGrid = true;
  saveNotice = '';

  constructor(
    private readonly templateService: TemplateService,
    private readonly menuService: MenuService,
    private readonly undoRedo: UndoRedoService,
    private readonly exportService: ExportService
  ) {}

  ngOnInit(): void {
    if (this.templateService.snapshot().items.length === 0) {
      this.templateService.applyTemplate(TemplateType.CLASSIC, this.menuService.snapshotItems());
    }
    this.undoRedo.initialize(this.templateService.snapshot());
  }

  selectedItem(layout: MenuLayout): LayoutItem | null {
    return layout.items.find((item) => item.id === this.selectedItemId) ?? null;
  }

  selectedMenuItem(layout: MenuLayout, items: MenuItem[]): MenuItem | null {
    const layoutItem = this.selectedItem(layout);
    if (!layoutItem) {
      return null;
    }
    return items.find((item) => item.id === layoutItem.menuItemId) ?? null;
  }

  updateSelectedItem(patch: Partial<LayoutItem>): void {
    if (!this.selectedItemId) {
      return;
    }
    this.templateService.updateLayoutItem(this.selectedItemId, patch);
    this.recordSnapshot();
  }

  updateStyle(style: LayoutStyle): void {
    this.templateService.updateStyle(style);
    this.recordSnapshot();
  }

  removeSelectedItem(id: string): void {
    this.templateService.deleteLayoutItem(id);
    this.selectedItemId = '';
    this.recordSnapshot();
  }

  applyTemplate(value: TemplateType | string): void {
    const type = value as TemplateType;
    this.templateService.applyTemplate(type, this.menuService.snapshotItems());
    this.selectedItemId = '';
    this.recordSnapshot();
  }

  undo(layout: MenuLayout): void {
    const previous = this.undoRedo.undo(layout);
    if (previous) {
      this.templateService.saveLayout(previous);
      this.selectedItemId = '';
    }
  }

  redo(layout: MenuLayout): void {
    const next = this.undoRedo.redo(layout);
    if (next) {
      this.templateService.saveLayout(next);
      this.selectedItemId = '';
    }
  }

  setZoom(value: number): void {
    this.zoom = Math.min(1.35, Math.max(0.45, value));
  }

  movePan(x: number, y: number): void {
    this.panX += x;
    this.panY += y;
  }

  saveLayout(): void {
    this.templateService.saveLayout(this.templateService.snapshot());
    this.saveNotice = '已保存到浏览器本地';
    window.setTimeout(() => {
      this.saveNotice = '';
    }, 1600);
  }

  async exportPng(): Promise<void> {
    const element = document.getElementById('menu-export-area');
    if (element instanceof HTMLElement) {
      await this.exportService.exportElement(element);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') {
      return;
    }
    event.preventDefault();
    const current = this.templateService.snapshot();
    if (event.shiftKey) {
      this.redo(current);
    } else {
      this.undo(current);
    }
  }

  private recordSnapshot(): void {
    this.undoRedo.record(this.templateService.snapshot());
  }
}
