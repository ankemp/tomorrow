import { inject, Pipe, PipeTransform } from '@angular/core';
import { format, isToday, isTomorrow } from 'date-fns';

import { Settings } from '@tmrw/data-access';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  private readonly settings = inject(Settings);

  transform(date: Date): string {
    if (isToday(date)) {
      return format(date, this.settings.dateFnsTimeFormat());
    }
    if (isTomorrow(date)) {
      return `Tomorrow, ${format(date, this.settings.dateFnsTimeFormat())}`;
    }
    return `${format(date, 'EEE, d MMM')}, ${format(date, this.settings.dateFnsTimeFormat())}`;
  }
}
