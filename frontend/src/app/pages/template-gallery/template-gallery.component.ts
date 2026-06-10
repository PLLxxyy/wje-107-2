import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { TemplatePreviewComponent } from '../../components/common/template-preview/template-preview.component';
import { LayoutStyle, TemplateDefinition } from '../../models/menu-layout.model';
import { TemplateService } from '../../services/template.service';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-template-gallery',
  standalone: true,
  imports: [AsyncPipe, NgFor, NgIf, FormsModule, TemplatePreviewComponent],
  templateUrl: './template-gallery.component.html',
  styleUrl: './template-gallery.component.css'
})
export class TemplateGalleryComponent {
  readonly templates = this.templateService.templates;
  readonly viewModel$ = combineLatest([
    this.menuService.items$,
    this.templateService.currentLayout$
  ]).pipe(
    map(([items, layout]) => ({ items, layout }))
  );
  selectedTemplate = this.templates[0];
  styleDraft: LayoutStyle = structuredClone(this.templates[0].style);

  constructor(
    private readonly templateService: TemplateService,
    private readonly menuService: MenuService,
    private readonly router: Router
  ) {}

  selectTemplate(template: TemplateDefinition): void {
    this.selectedTemplate = template;
    this.styleDraft = structuredClone(template.style);
  }

  styleFor(template: TemplateDefinition): LayoutStyle {
    return template.type === this.selectedTemplate.type ? this.styleDraft : template.style;
  }

  applySelected(): void {
    const layout = this.templateService.applyTemplate(this.selectedTemplate.type, this.menuService.snapshotItems());
    this.templateService.updateStyle({
      ...this.styleDraft,
      id: layout.style.id
    });
    void this.router.navigate(['/designer']);
  }
}
