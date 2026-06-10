import { Routes } from '@angular/router';
import { FullscreenPreviewComponent } from './components/preview/fullscreen-preview/fullscreen-preview.component';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';
import { CategoryManagementComponent } from './pages/category-management/category-management.component';
import { DesignerComponent } from './pages/designer/designer.component';
import { ItemManagementComponent } from './pages/item-management/item-management.component';
import { MenuListComponent } from './pages/menu-list/menu-list.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { TemplateGalleryComponent } from './pages/template-gallery/template-gallery.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'designer' },
  { path: 'designer', component: DesignerComponent },
  { path: 'menu', component: MenuListComponent },
  { path: 'items/new', component: ItemManagementComponent, canDeactivate: [unsavedChangesGuard] },
  { path: 'items/:id', component: ItemManagementComponent, canDeactivate: [unsavedChangesGuard] },
  { path: 'categories', component: CategoryManagementComponent },
  { path: 'templates', component: TemplateGalleryComponent },
  { path: 'preview', component: FullscreenPreviewComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'designer' }
];
