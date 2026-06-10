import { CanDeactivateFn } from '@angular/router';

export interface UnsavedChangesAware {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<UnsavedChangesAware> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }
  return window.confirm('当前表单还有未保存内容，确定离开吗？');
};
