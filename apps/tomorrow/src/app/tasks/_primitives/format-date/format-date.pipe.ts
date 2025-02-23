import { inject, Pipe, PipeTransform } from '@angular/core';
import { format, isToday, isTomorrow } from 'date-fns';

import { Settings } from '@tmrw/data-access';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  private readonly settings = inject(Settings);

  transform(date: Date, alwaysUseFullFormat = false): string {
    const formattedTime = `, ${format(date, this.settings.dateFnsTimeFormat())}`;
    const dateOnly = this.settings.timeSpecificity() === 'never';
    if (!alwaysUseFullFormat) {
      if (isToday(date)) {
        return 'Today' + (dateOnly ? '' : formattedTime);
      }
      if (isTomorrow(date)) {
        return 'Tomorrow' + (dateOnly ? '' : formattedTime);
      }
    }
    return `${format(date, 'EEE, d MMM')}` + (dateOnly ? '' : formattedTime);
  }
}
