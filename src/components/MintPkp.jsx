import { ProviderType, AuthMethodType, AuthMethodScope } from '@lit-protocol/constants';
import { LitAuthClient, isSignInRedirect } from '@lit-protocol/lit-auth-client';
import { checkAndSignAuthMessage } from '@lit-protocol/lit-node-client';
import { useEffect } from 'react';
// import * as stytch from "stytch";

export function MintPkp() {
  // const STYTCH_PROJECT_ID = process.env.REACT_APP_STYTCH_PROJECT_ID;
  // const STYTCH_SECRET = process.env.REACT_APP_STYTCH_SECRET;
  
  // if (!STYTCH_PROJECT_ID || !STYTCH_SECRET) {
  //   throw Error("Could not find stytch project secret or id in enviorment");
  // }

  const relayApiKey = '<Your Lit Relay Server API Key>'; // Get one by filling this form: https://forms.gle/RNZYtGYTY9BcD9MEA
  const redirectUri = 'http://localhost:3000';

  // After the user signs in with their Google account they will be redirected to the `redirectUri` and we're handling the authentication and redirect logic below
  useEffect(() => {
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey,
      },
    });
    litAuthClient.initProvider(ProviderType.Google, {
      redirectUri,
    });

    (async () => {
      // Checks if app has been redirected from Lit login server: https://js-sdk.litprotocol.com/functions/lit_auth_client_src.isSignInRedirect.html
      if (isSignInRedirect(redirectUri)) {
        const provider = litAuthClient.getProvider(
          ProviderType.Google,
        );

        // Get auth method object that has the OAuth token from redirect callback
        const authMethod = await provider.authenticate();
        console.log(authMethod);

        // const client = new stytch.Client({
        //   project_id: STYTCH_PROJECT_ID,
        //   secret: STYTCH_SECRET,
        // });
        
        
        // const stytchResponse = await client.otps.email.loginOrCreate({
        //   email: "ars@litprotocol.com",
        // });
        
        // const otpResponse = ""
        
        // const authResponse = await client.otps.authenticate({
        //   method_id: stytchResponse.email_id,
        //   code: otpResponse,
        //   session_duration_minutes: 60 * 24 * 7,
        // });
        
        // let sessionResp = await client.sessions.get({
        //   user_id: authResponse.user_id,
        // });
        
        // const sessionStatus = await client.sessions.authenticate({
        //   session_token: authResponse.session_token,
        // });

        // const session = litAuthClient.initProvider(
        //   ProviderType.StytchEmailFactorOtp,
        //   {
        //     userId: sessionStatus.session.user_id,
        //     appId: STYTCH_PROJECT_ID,
        //   }
        // );
        // const authMethod2 = await session.authenticate({
        //   accessToken: sessionStatus.session_jwt,
        // });

        const authSig = await checkAndSignAuthMessage({ chain: 'ethereum' });
        const authMethod2 = {
          authMethodType: AuthMethodType.EthWallet,
          accessToken: JSON.stringify(authSig),
        };

        // Mint PKP using both Auth Methods
        let res = await litAuthClient.mintPKPWithAuthMethods(
          [authMethod, authMethod2],   // Auth Methods
          {
            pkpPermissionScopes: [[1], [1]],  // PKP Permission Scopes
            sendPkpToitself: true,   // whether to send PKP to itself or not
            addPkpEthAddressAsPermittedAddress: true,  // whether to add PKP eth address as permitted address or not
          }
        );

        if (typeof res != 'object') {
          console.error('Minting failed');
          return;
        }

        console.log('Minting successful', res);
        // return res;
        
        const options = {
          permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]], // Learn more about the scopes here: https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes
        };
        const mintTx = await provider.mintPKPThroughRelayer(
          authMethod,
          options
        );
        console.log(mintTx);

        const pkps = await provider.fetchPKPsThroughRelayer(authMethod);
        console.log(pkps);

        const sessionSigs = await provider.getSessionSigs({
          authMethod,
          sessionSigsParams: {
            chain: 'ethereum',
            resourceAbilityRequests: [ // You may add the resources associated with the sessionSig as capabilities here: https://developer.litprotocol.com/v3/sdk/authentication/session-sigs/intro/#signed-message
              // {
              //   resource: litResource,
              //   ability: LitAbility.AccessControlConditionDecryption
              // }
            ],
          },
          pkpPublicKey: pkps[0].publicKey, // Note, an AuthMethod can own more than one PKP
        });
        console.log(sessionSigs);

        const litActionCode = `
          const go = async () => {
            console.log(Lit.Auth);
            const sigShare = await Lit.Actions.signEcdsa({ toSign, publicKey, sigName });
          };
          go();
        `;

        const signatures = await provider.litNodeClient.executeJs({
          code: litActionCode,
          sessionSigs,
          authMethods: [authMethod],
          jsParams: {
            toSign: [84, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105, 115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121, 116, 101, 115],
            publicKey: pkps[0].publicKey,
            sigName: "sig1",
          },
        });

        console.log("signatures: ", signatures);
      }
    })();
  }, []);

  // This will direct the user to the Lit Server Login page where the user will be prompted to signin with their Google Account
  const authenticateWithGoogleJWT = async () => {
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey,
      },
    });
    litAuthClient.initProvider(ProviderType.Google, {
      redirectUri,
    });

    // Begin login flow with Google
    (async () => {
      const provider = litAuthClient.getProvider(
        ProviderType.Google
      );
      await provider.signIn();
    })();
  }

  return (
    <>
      <button onClick={authenticateWithGoogleJWT}>
      {/* <button> */}
        Mint with Google JWT
      </button>
    </>
  );
}