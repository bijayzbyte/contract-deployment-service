import { Body, Controller, Get, Post } from '@nestjs/common';
import { DeployContractService } from './deploy-contract.service';
import { ContractPropDto } from './dto/contract.dto';

@Controller()
export class DeployContractController {
  constructor(private readonly deployContractService: DeployContractService) {}

  @Post('deployContract')
  deploy(@Body() contractPropDto: ContractPropDto) {
    return this.deployContractService.deployContract(contractPropDto.contractAddress, contractPropDto.transactionObject, contractPropDto.abi, contractPropDto.parameters, contractPropDto.signature);
  }
}
