import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'lib/entities';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  private readonly TARGET_COUNT = 50000;
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async seed() {
    try {
      const count = await this.itemRepository.count();

      if (count >= this.TARGET_COUNT) {
        this.logger.log(
          `Database already seeded with ${count} items. Skipping...`,
        );
        return;
      }

      this.logger.log(
        `Starting database seeding. Current count: ${count}, Target: ${this.TARGET_COUNT}`,
      );

      const itemsToCreate = this.TARGET_COUNT - count;
      const batches = Math.ceil(itemsToCreate / this.BATCH_SIZE);

      for (let i = 0; i < batches; i++) {
        const batchSize =
          i === batches - 1
            ? itemsToCreate - i * this.BATCH_SIZE
            : this.BATCH_SIZE;

        const items = Array.from({ length: batchSize }, (_, index) => {
          const itemNumber = count + i * this.BATCH_SIZE + index + 1;
          return this.itemRepository.create({
            name: `Item ${itemNumber} - ${this.generateRandomName()}`,
          });
        });

        await this.itemRepository
          .createQueryBuilder()
          .insert()
          .into(Item)
          .values(items)
          .execute();

        this.logger.log(
          `Seeded batch ${i + 1}/${batches} (${(i + 1) * this.BATCH_SIZE} items)`,
        );
      }

      const finalCount = await this.itemRepository.count();
      this.logger.log(`✅ Database seeding completed! Total items: ${finalCount}`);
    } catch (error) {
      this.logger.error('Error seeding database:', error);
      throw error;
    }
  }

  async drop() {
    const res = await this.itemRepository.deleteAll()
        .catch((err) => {
            this.logger.error(err);
            throw new Error(err);
        });

    this.logger.log(`✅ Drop seed successfully! Affected: ${res.affected}`);
  }

  private generateRandomName(): string {
    const adjectives = [
      'Amazing',
      'Brilliant',
      'Creative',
      'Dynamic',
      'Elegant',
      'Fantastic',
      'Great',
      'Incredible',
    ];
    const nouns = [
      'Product',
      'Service',
      'Solution',
      'Tool',
      'Platform',
      'System',
      'Framework',
      'Application',
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adj} ${noun}`;
  }
}