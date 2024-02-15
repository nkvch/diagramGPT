import { Injectable } from '@nestjs/common';
import { DataStoreService } from './services/data-store/data-store.service';
import { Mermaid } from 'mermaid';
import { MermaidService } from './services/mermaid/mermaid.service';

export const importDynamic = new Function('modulePath', 'return import(modulePath)');

@Injectable()
export class AppService {
  constructor(
    private readonly dataStoreService: DataStoreService,
    private readonly mermaidService: MermaidService,
  ) {}

  createChartSession(data: string) {
    if (!data) {
      return { error: 'No data provided' };
    }

    const id = this.dataStoreService.create(data);

    return { url: `http://localhost:5173/edit/${id}` };
  }

  getMermaidCode(id: string) {
    return this.dataStoreService.read(id);
  }

  async getChartPNG(id: string): Promise<Buffer | { error: string }> {
    const mermaidCode = this.dataStoreService.read(id);

    if (!mermaidCode) {
      return { error: 'No mermaidCode found' };
    }

    const pngBuffer = await this.mermaidService.generateDiagramAsPNG(mermaidCode);

    return pngBuffer;
  }
}
