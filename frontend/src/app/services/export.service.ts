import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  async exportElement(element: HTMLElement, prefix = '菜单'): Promise<void> {
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: false
    });
    const link = document.createElement('a');
    link.download = `${prefix}_${this.timestamp()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    link.remove();
  }

  private timestamp(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replaceAll('-', '');
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((value) => String(value).padStart(2, '0'))
      .join('');
    return `${date}_${time}`;
  }
}
