import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { fetchJson } from 'ethers/lib/utils';

let wallet: ethers.Wallet, provider: ethers.providers.Provider;
let chainInfo = {
  url: 'https://api.avax-test.network/ext/bc/C/rpc',
  Id: 43113
}

async function connectEthers() {
	
	var urlInfo = {
		url: chainInfo.url
	};
	
	provider = new ethers.providers.JsonRpcProvider(urlInfo, chainInfo.Id);

	wallet = new ethers.Wallet("ad14b8d28e242fed91ab673e4c4f28677e048b47f1fa8d5856bd97264e22e99b", provider);

}

connectEthers();

async function getBytecode(contractHash) {

	const request = {
    method: "eth_getCode",
    params: [contractHash, "latest"],
    id: "1",
    jsonrpc: "2.0"
  };
	const connection = {
		url: chainInfo.url
	};

	let { result } = await fetchJson(connection.url,JSON.stringify(request));
	return result;

}

async function transactionFee(transactionHash) {
  let tnxReceipt =  await provider.getTransactionReceipt(transactionHash);
  let gasUsed = parseInt(tnxReceipt.gasUsed._hex, 16);
  let gasPrice = parseInt(tnxReceipt.effectiveGasPrice._hex, 16);
  return  gasUsed * gasPrice;
}

@Injectable()
export class DeployContractService {

  //@ts-ignore
  async deployContract(contractAddress: any, txObj: any, abi: any, args: any, signedTx:any): string {
    
    const parsedTx = ethers.utils.parseTransaction(signedTx);
    const userPublicKey = "0x4aAA22A438ad51E79FB427B039b922464F820E76";

    if(parsedTx.from === userPublicKey) {
      try {
        //get transactionFee
        let tnxFee = await transactionFee("0x0072b270d5182618273721b8714c32c6da3568c8a11cbcdec0c583a7ac005803");
        
        let amount = tnxFee
        //send token from user to zbyte account
        let zbyteAddress = "0xC949B8F4AA84c7D46291BCa89e087C32124c1b74";
        let tx = {
          to: zbyteAddress,
          value: amount
        }

        await wallet.sendTransaction(tx).then((txObj) => {
          console.log("transferred ", amount, " tokens from user to zbyte account");
        })

        // get abi using contract hash
        const byteCode = await getBytecode(contractAddress);
        
        // deploy contract
        let contractFactory = new ethers.ContractFactory(abi, byteCode);
        let unsignedTxObject = await contractFactory.getDeployTransaction();
    
        unsignedTxObject["chainId"] = chainInfo.Id;
        unsignedTxObject["gasLimit"] = '800000';
        unsignedTxObject["type"] = 2;
        unsignedTxObject["value"] = ethers.BigNumber.from("0");
        unsignedTxObject["nonce"] = await provider.getTransactionCount(wallet.address);
        
        let gasData = await provider.getFeeData();
        unsignedTxObject["maxFeePerGas"] = gasData["maxFeePerGas"];
        unsignedTxObject["maxPriorityFeePerGas"] = gasData["maxPriorityFeePerGas"];
    
        let signedTxObject = await wallet.signTransaction(unsignedTxObject);
        let txResponse = await provider.sendTransaction(signedTxObject);
        let txReciept = await (txResponse).wait(1);

        console.log(txResponse, txReciept);
        return txResponse.hash;
      } catch(err) {
        return "could not deploy, error: \n" + err;
      }
    } else {
      return "signature did not match";
    }          
  }
}
