import { Pipe, PipeTransform } from '@angular/core';
import { SpiceLevel } from '../models/enums';

@Pipe({
  name: 'spiceLevel',
  standalone: true
})
export class SpiceLevelPipe implements PipeTransform {
  transform(value: SpiceLevel): string {
    const labels: Record<SpiceLevel, string> = {
      [SpiceLevel.NONE]: '不辣',
      [SpiceLevel.MILD]: '微辣',
      [SpiceLevel.MEDIUM]: '中辣',
      [SpiceLevel.HOT]: '特辣'
    };
    return labels[value];
  }
}
