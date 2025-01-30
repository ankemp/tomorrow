import { BaseItem } from '@signaldb/core/Collection';

export interface BaseModel extends BaseItem<string> {
  id: string;
}
