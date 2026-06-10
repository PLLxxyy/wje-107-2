import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { ExportService } from '../../../services/export.service';
import { MenuService } from '../../../services/menu.service';
import { TemplateService } from '../../../services/template.service';
import { PrintPreviewComponent } from '../print-preview/print-preview.component';

@Component({
  selector: 'app-fullscreen-preview',
  standalone: true,
  imports: [AsyncPipe, NgClass, NgIf, RouterLink, PrintPreviewComponent],
  templateUrl: './fullscreen-preview.component.html',
  styleUrl: './fullscreen-preview.component.css'
})
export class FullscreenPreviewComponent {
  @ViewChild('previewHost') previewHost?: ElementRef<HTMLElement>;
  readonly viewModel$ = combineLatest([this.templateService.currentLayout$, this.menuService.items$]).pipe(
    map(([layout, items]) => ({ layout, items }))
  );
  zoom = 0.72;
  darkDesk = false;

  constructor(
    private readonly templateService: TemplateService,
    private readonly menuService: MenuService,
    private readonly exportService: ExportService
  ) {}

  setZoom(value: number): void {
    this.zoom = Math.min(1.4, Math.max(0.4, value));
  }

  async exportPng(): Promise<void> {
    const element = this.previewHost?.nativeElement.querySelector('#print-export-area');
    if (element instanceof HTMLElement) {
      await this.exportService.exportElement(element);
    }
  }

  print(): void {
    window.print();
  }
}
