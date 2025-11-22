import { Global, Module } from '@nestjs/common';
import { ItemsModule } from 'lib/items';

@Global()
@Module({
    imports: [ItemsModule],
    exports: [ItemsModule],
})
export class DomainsModule {}
