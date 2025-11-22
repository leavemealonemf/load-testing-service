import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsAdapter, ItemsRepository } from './providers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from 'lib/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item])
  ],
  providers: [
    ItemsService,
    {
      provide: ItemsRepository,
      useClass: ItemsAdapter,
    }
  ],
  exports: [ItemsService],
})
export class ItemsModule {}
