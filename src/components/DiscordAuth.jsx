import { LitAuthClient, isSignInRedirect } from '@lit-protocol/lit-auth-client';
import { checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';
import { ProviderType } from '@lit-protocol/constants';
import { useEffect } from 'react';

export function DiscordAuth() {
  useEffect(() => {
    const redirectUri = 'http://localhost:3000';
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: '<Your Lit Relay Server API Key>',
      },
    });
    // litAuthClient.initProvider(ProviderType.Google, {
    litAuthClient.initProvider(ProviderType.Discord, {
      redirectUri,
    });

    (async () => {
      if (isSignInRedirect(redirectUri)) {
        const provider = litAuthClient.getProvider(
          // ProviderType.Google,
          ProviderType.Discord,
        );

        // Get auth method object that has the OAuth token from redirect callback
        const authMethod = await provider.authenticate();
        console.log(authMethod);

        const pkps = await provider.fetchPKPsThroughRelayer(authMethod);
        console.log(pkps);

        // const sessionSigs = await provider.getSessionSigs({
        //   authMethod,
        //   sessionSigsParams: {
        //     chain: 'ethereum',
        //     resourceAbilityRequests: [],
        //   },
        //   pkpPublicKey: pkps[0].publicKey,
        // });
        // console.log(sessionSigs);

        // const litActionCode = `
        //   (async () => {
        //     const toContract = "0x004B14279f1840A20E36B7b1b7EdD7dDEA780c10";
        //     const abi = [{"inputs":[{"internalType":"string","name":"initialIpfsCid","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"ipfsCid","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newIpfsCid","type":"string"}],"name":"updateIpfsCid","outputs":[],"stateMutability":"nonpayable","type":"function"}];
        //     const contract = new ethers.Contract(toContract, abi);
        //     const rawTxn = await contract.populateTransaction.ipfsCid();
        //     const txn = ethers.utils.serializeTransaction(rawTxn);
        //     const chain = "goerli";
        
        //     const res = await Lit.Actions.callContract({
        //       chain,
        //       txn
        //     });
        
        //     const decodedResult = contract.interface.decodeFunctionResult("ipfsCid", res)[0].toString();
        //     const _ = await Lit.Actions.call({ ipfsId: decodedResult, params });
        // })();
        // `;

        await litAuthClient.litNodeClient.connect();
        const signatures = await provider.litNodeClient.executeJs({
          // code: litActionCode,
          ipfsId: 'QmRv5JAxLbJ4vRnQtQqY1CHCXJnxRRe2Ge9CSHwdcySZKr',
          // sessionSigs,
          authSig: await checkAndSignAuthMessage({ chain: 'ethereum', nonce: litAuthClient.litNodeClient.getLatestBlockhash() }),
          authMethods: [authMethod],
          jsParams: {
            params: {
              toSign: [85, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105, 115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121, 116, 101, 115],
              publicKey: pkps[0].publicKey,
              sigName: 'sig1',
            },
          },
        });

        console.log('signatures: ', signatures);
      }
    })();
  }, []);

  const authWithGoogle = async () => {
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: '<Your Lit Relay Server API Key>',
      },
    });
    // litAuthClient.initProvider(ProviderType.Google, {
    litAuthClient.initProvider(ProviderType.Discord, {
      redirectUri: 'http://localhost:3000',
    });
    // Begin login flow with Google
    (async () => {
      const provider = litAuthClient.getProvider(
        // ProviderType.Google
        ProviderType.Discord
      );
      await provider.signIn();
    })();
  }

  return (
    <div className='App'>
      {/* <button onClick={authWithGoogle}>Auth With Google</button> */}
      <button onClick={authWithGoogle}>Auth With Discord</button>
    </div>
  );
}