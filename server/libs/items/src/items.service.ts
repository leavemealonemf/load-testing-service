import { Injectable } from '@nestjs/common';
import { ItemsRepository } from './providers';
import { QueryItemsDto } from 'lib/shared/dto';

@Injectable()
export class ItemsService {
    constructor (
        private readonly itemsRepository: ItemsRepository,
    ) {}

    findAll(dto: QueryItemsDto) {
        return this.itemsRepository.findAll(dto);
    }
}
