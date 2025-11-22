import { QueryItemsDto } from "lib/shared/dto";
import { IItem } from "../interfaces";

export abstract class ItemsRepository {
    abstract findAll(dto: QueryItemsDto): Promise<IItem[]>
}