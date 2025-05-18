import { Pipe, PipeTransform } from '@angular/core';
import { TuiContext } from '@taiga-ui/cdk';

@Pipe({
  name: 'formatDuration',
})
export class FormatDurationPipe implements PipeTransform {
  transform(minutes: number): string {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }
}

export const durationLabelContext = ({
  $implicit,
}: TuiContext<number>): string => {
  const pipe = new FormatDurationPipe();
  const minutes = $implicit;
  return pipe.transform(minutes);
};
