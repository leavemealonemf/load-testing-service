import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule as TypeOrmMo } from '@nestjs/typeorm';
import { Item } from 'lib/entities';

@Module({
    imports: [
        TypeOrmMo.forRootAsync({
            useFactory: async(config: ConfigService) => {
                const synchronize = (() => {
                    const env = config.get("ENV");
                    return env && env === "local" ? true : false;
                })()

                return {
                    type: 'postgres',
                    host: config.get("DB_HOST"),
                    port: config.get("DB_PORT"),
                    username: config.get("DB_USER"),
                    password: config.get("DB_PASSWORD"),
                    database: config.get("DB_NAME"),
                    entities: [Item],
                    synchronize: synchronize,
                }
            },
            inject: [ConfigService],
        }),
    ]
})
export class TypeOrmModule {}
