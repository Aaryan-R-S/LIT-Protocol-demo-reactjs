import React, { useEffect } from 'react';
// import './App.css';
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from 'ethers';
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { checkAndSignAuthMessage, LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';


export function Sample() {

  async function initializeLitContracts() {

    // 1. Create a wallet
    const provider = new ethers.providers.Web3Provider( window.ethereum, "any" );
    const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
    console.log('address:', wallet.address)
    console.log('mnemonic:', wallet.mnemonic)
    // console.log('privateKey:', wallet.privateKey)

    // 2. Connect to lit node client
    const litNodeClient = new LitNodeClient({ litNetwork: 'cayenne' });
    await litNodeClient.connect();


    // 3. Connect to contract client (contract client mints PKP)
    const contractClient = new LitContracts({
      signer: wallet,
    });
    await contractClient.connect();


    // 4. Get nonce & subsequent mint cost
    const nonce = litNodeClient.getLatestBlockhash();
    const mintCost = await contractClient.pkpNftContract.read.mintCost(); 
    console.log("Got mintcost: "+mintCost);


    // 5. Get signature of the wallet (should be the same address as the signer in the contract client)
    const authSig = await checkAndSignAuthMessage({
      chain: "ethereum",
      nonce,
    });
    
    console.log("authSig received: "+JSON.stringify(authSig));

    // 6. Setting up auth method -> sign of the wallet
    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: JSON.stringify(authSig),
    };


    const mintInfo = await contractClient.mintWithAuth({
      authMethod,
      scopes: [
        AuthMethodScope.NoPermissions,
        AuthMethodScope.SignAnything,
        AuthMethodScope.PersonalSign,
      ],
    });

    const authId = await LitAuthClient.getAuthIdByAuthMethod(authMethod);
    const scopes = await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      mintInfo.pkp.tokenId,
      AuthMethodType.EthWallet,
      authId,
      3
    );

    const signAnythingScope = scopes[1];
    const personalSignScope = scopes[2];
    console.log(signAnythingScope + "---" + personalSignScope);

    const walletPKPInfo = {
      tokenId: mintInfo.pkp.tokenId,
      publicKey: `0x${mintInfo.pkp.publicKey}`,
      ethAddress: mintInfo.pkp.ethAddress,
    };
  
    console.log('WalletPKPInfo', walletPKPInfo);

    const litActionCode = `
        const go = async () => {
        // The params toSign, publicKey, sigName are passed from the jsParams fields and are available here
        // const sigShare = await Lit.Actions.signEcda({ toSign, publicKey, sigName });
        };

        go();
    `;

    const signatures =
     await litNodeClient.executeJs({
      code: litActionCode,
      authSig,
      jsParams: {
        toSign: [84, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105, 115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121, 116, 101, 115],
        publicKey: mintInfo.pkp.publicKey,
        sigName: "sig1",
      },
    });

    console.log("signatures: ", signatures);

  }
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={initializeLitContracts}>Initialize</button>
      </header>
    </div>
  );
}

