import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Item } from "lib/entities";
import { Repository } from "typeorm";
import { ItemsRepository } from "./items.repository";
import { IItem } from "../interfaces";
import { QueryItemsDto } from "lib/shared/dto";

@Injectable()
export class ItemsAdapter implements ItemsRepository {
    private readonly logger = new Logger(ItemsAdapter.name);

    constructor(
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>
    ) {}

    async findAll(dto: QueryItemsDto): Promise<IItem[]> {
        const items = this.itemsRepository
            .createQueryBuilder('items')
            .select(['items.id', 'items.name', 'items.createdAt'])
            .orderBy('items.id', 'ASC')
            .take(dto.limit)
            .skip(dto.offset)
        
        return items.getMany().catch((err) => {
            this.logger.error(err);
            throw new Error(err);
        })
    }
}