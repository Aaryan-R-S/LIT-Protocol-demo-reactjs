import React from "react";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {
    LitAccessControlConditionResource,
    LitAbility,
    LitActionResource,
} from "@lit-protocol/auth-helpers";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { ethers } from "ethers";
import {SiweMessage} from "siwe";

export function CapacityCredits() {
    const run = async () => {
        const walletWithCapacityCredit = new ethers.Wallet(
            process.env.REACT_APP_PRIVATE_KEY
        );
        console.log(walletWithCapacityCredit)
        const litNodeClient = new LitJsSdk.LitNodeClient({
            litNetwork: "cayenne",
            debug: true,
        });

        await litNodeClient.connect();

        let nonce = litNodeClient.getLatestBlockhash();

        console.log(nonce)

        /**
         * When the getSessionSigs function is called, it will generate a session key
         * and sign it using a callback function. The authNeededCallback parameter
         * in this function is optional. If you don't pass this callback,
         * then the user will be prompted to authenticate with their wallet.
         */
        const authNeededCallback = async ({
            chain,
            resources,
            expiration,
            uri,
        }) => {
            const domain = "localhost:3000";
            const message = new SiweMessage({
                domain,
                address: walletWithCapacityCredit.address,
                statement: "Sign a session key to use with Lit Protocol",
                uri,
                version: "1",
                chainId: "1",
                expirationTime: expiration,
                resources,
                nonce,
            });
            const toSign = message.prepareMessage();
            const signature = await walletWithCapacityCredit.signMessage(toSign);

            const authSig = {
                sig: signature,
                derivedVia: "web3.eth.personal.sign",
                signedMessage: toSign,
                address: walletWithCapacityCredit.address,
            };

            return authSig;
        };
        console.log("ok")

        // Create an access control condition resource
        const litResource = new LitAccessControlConditionResource(
            'hashedEncryptedSymmetricKeyString'
        );

        const sessionSigs = await litNodeClient.getSessionSigs({
            chain: "ethereum",
            resourceAbilityRequests: [
                {
                    resource: litResource,
                    ability: LitAbility.AccessControlConditionDecryption,
                },
            ],
            authNeededCallback,
        });
        console.log(sessionSigs);
        // LitJsSdk.disconnectWeb3();
    };

    run();

    return <div>CapacityCredits</div>;
}
