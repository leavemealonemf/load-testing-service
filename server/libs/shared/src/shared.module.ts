import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExeptionFilter } from './filters';

@Module({
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalExeptionFilter,
        }
    ]
})
export class SharedModule {}
