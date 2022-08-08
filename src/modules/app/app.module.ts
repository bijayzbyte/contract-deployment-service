import { Module } from '@nestjs/common';
import { DeployContractModule } from '../deploy-contract/deploy-contract.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [DeployContractModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
