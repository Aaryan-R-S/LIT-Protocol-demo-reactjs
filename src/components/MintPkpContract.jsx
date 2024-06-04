import { AuthMethodType } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import { checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

export function MintPkpContract() {
    (async()=>{
        const provider = new ethers.providers.JsonRpcProvider("https://chain-rpc.litprotocol.com/http");
        const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);

        const address = wallet.address;
        const balance = await provider.getBalance(address)
        console.log("Address: ", address);
        console.log("Balance: ", ethers.utils.formatEther(balance));

        const contractClient = new LitContracts({
            signer: wallet,    // Your ethers wallet
            network: 'habanero',
          });
          
        await contractClient.connect();
        
        const authSig = await checkAndSignAuthMessage({ chain: 'ethereum' });
        const authMethodWallet = {
            authMethodType: 1, // Adjust based on the auth method
            accessToken: JSON.stringify(authSig),  // Use authSig obtained from the controller wallet
          };

          const authIdWallet = await LitAuthClient.getAuthIdByAuthMethod(authMethodWallet);
          console.log("Auth ID Wallet: ", authIdWallet);
          const authIdAction = contractClient.utils.getBytesFromMultihash('QtQqY1CHCXJnxRrRe2Ge9CSHwdcy');
          console.log("Auth ID Action: ", authIdAction);

          // Get the mint cost
const mintCost = await contractClient.pkpNftContract.read.mintCost();
console.log("Mint Cost: ", mintCost.toString());

// Mint PKP using both Auth Methods
const mintTx = await contractClient.pkpHelperContract.write.mintNextAndAddAuthMethods(
  2, // key type
  [AuthMethodType.EthWallet, AuthMethodType.LitAction], // Specify the auth method types
  [authIdWallet, authIdAction],  // Specify the auth method IDs
  ['0x', '0x'], // Specify the auth method public keys
  [[1], [1]], // Specify the auth method scopes
  true,  // Whether to add PKP eth address as permitted address or not
  true, // Whether to send PKP to itself or not
  { value: mintCost }
);

// Wait for the transaction to be mined
const mintTxReceipt = await mintTx.wait();
console.log("Mint Transaction Receipt: ", mintTxReceipt);

// Get the tokenId of the minted PKP
const tokenId = mintTxReceipt.events[0].topics[1];
console.log("Token ID: ", tokenId);
    })()
    // run();
    return (
        <div>
            <h1>Mint PKP Contract</h1>
        </div>
    )
}