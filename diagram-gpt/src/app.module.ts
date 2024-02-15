import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataStoreService } from './services/data-store/data-store.service';
import { MermaidService } from './services/mermaid/mermaid.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, DataStoreService, MermaidService],
})
export class AppModule {}
