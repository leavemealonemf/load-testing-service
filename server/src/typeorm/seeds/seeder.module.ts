import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from 'lib/entities';
import { SeederService } from './seeder.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Item]),
    ],
    providers: [SeederService],
    exports: [SeederService],
})
export class SeederModule {}
