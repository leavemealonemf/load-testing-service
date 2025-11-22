import { Module, OnModuleInit } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { TypeOrmModule } from './typeorm/typeorm.module';
import { ConfigModule } from '@nestjs/config';
import path from 'path';
import { SharedModule } from 'lib/shared';
import { DomainsModule } from './domains/domains.module';
import { SeederModule, SeederService } from './typeorm/seeds';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(process.cwd(), ".env"),
    }),
    ApiModule, 
    TypeOrmModule,
    SharedModule,
    DomainsModule,
    SeederModule,
  ],
})

export class AppModule implements OnModuleInit {
  constructor(
    private readonly seeder: SeederService,
  ) {}

  async onModuleInit() {
    await this.seeder.seed();
  }
}
