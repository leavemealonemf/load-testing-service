import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ItemsService } from 'lib/items';
import { QueryItemsDto } from 'lib/shared/dto';

@Controller('items')
export class ItemsController {
    constructor(
        private readonly itemsService: ItemsService,
    ) {}

    @Get()
    getAll(@Query() query: QueryItemsDto) {
        return this.itemsService.findAll(query);
    }
}
