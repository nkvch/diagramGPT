import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DataStoreService {
  private readonly dataStore = {};

  create(textualData: string): string {
    const uniqueId = uuidv4();
    this.dataStore[uniqueId] = textualData;
    return uniqueId;
  }

  read(id: string): string {
    return this.dataStore[id];
  }
}
