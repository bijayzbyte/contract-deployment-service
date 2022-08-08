import { Module } from '@nestjs/common';
import { DeployContractController } from './deploy-contract.controller';
import { DeployContractService } from './deploy-contract.service';

@Module({
  imports: [],
  controllers: [DeployContractController],
  providers: [DeployContractService],
})
export class DeployContractModule {}
