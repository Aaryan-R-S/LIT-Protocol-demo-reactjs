import { ethers } from "ethers";
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { AuthMethodScope, ProviderType } from '@lit-protocol/constants';
import { LitNodeClient } from "@lit-protocol/lit-node-client";

export function Main() {
    const mintPkp = async()=>{
        const rpc = "https://chain-rpc.litprotocol.com/http";
        // const provider = new ethers.JsonRpcProvider(rpc);
    
        // const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider)
        const provider = new ethers.providers.JsonRpcProvider(rpc);
        const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

        const address = wallet.address;
        const balance = await provider.getBalance(address)
        console.log("Address: ", address);
        console.log("Balance: ", ethers.utils.formatEther(balance));
    
        const litNodeClient = new LitNodeClient();
        await litNodeClient.connect();
    
        const litAuthClient = new LitAuthClient({litNodeClient, litRelayConfig: {
            relayApiKey: '<Your Lit Relay Server API Key>',
          },
        });
        const authProvider = litAuthClient.initProvider(ProviderType.EthWallet);

        let authMethod = await authProvider.authenticate({
            signMessage: (message) => {
                return wallet.signMessage(message);
            }
        });
        
        const options = {
            permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
        };
    
        const mintTx = await authProvider.mintPKPThroughRelayer(
            authMethod,
            options
        );
    
        console.log("Mint TX: ", mintTx);
    }


  return (
    <>
      <button onClick={mintPkp}>
      {/* <button> */}
        Mint PKP
      </button>
    </>
  );
}