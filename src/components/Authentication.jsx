import React from "react";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {
    LitAccessControlConditionResource,
    LitAbility,
} from "@lit-protocol/auth-helpers";
import { ethers } from "ethers";
import {SiweMessage} from "siwe";

export function Authentication() {
    const run = async () => {
        // 1 - https://developer.litprotocol.com/v3/sdk/installation/#sdk-installed-for-client-side-usage
        // Instantiate a LitNodeClient
        const client = new LitJsSdk.LitNodeClient({
            litNetwork: "cayenne",
            debug: true,
        });
        await client.connect();

        // 2 - https://developer.litprotocol.com/v3/sdk/authentication/auth-sig#obtaining-an-authsig-in-the-browser
        let authSig = await LitJsSdk.checkAndSignAuthMessage({
            chain: "ethereum",
            nonce: client.getLatestBlockhash(),
        });
        console.log(authSig);

        // 3 - https://developer.litprotocol.com/v3/sdk/authentication/session-sigs/get-session-sigs
        // Create an access control condition resource
        const litResource = new LitAccessControlConditionResource(
            "someResource"
        );

        const sessionSigs = await client.getSessionSigs({
            chain: "ethereum",
            resourceAbilityRequests: [
                {
                    resource: litResource,
                    ability: LitAbility.AccessControlConditionDecryption,
                },
            ],
            authSig,
        });
        console.log(sessionSigs);

        // 4 - https://developer.litprotocol.com/v3/sdk/authentication/session-sigs/usage#making-encryption-requests
        var unifiedAccessControlConditions = [
            {
                conditionType: "evmBasic",
                contractAddress: "",
                standardContractType: "",
                chain: "ethereum",
                method: "eth_getBalance",
                parameters: [":userAddress", "latest"],
                returnValueTest: {
                    comparator: ">=",
                    // value: "10000000000000",
                    value: "0",
                },
            },
        ];
        const chain = "ethereum";

        // encrypt
        const { ciphertext, dataToEncryptHash } =
            await LitJsSdk.zipAndEncryptString(
                {
                    unifiedAccessControlConditions,
                    chain,
                    sessionSigs,
                    dataToEncrypt: "this is a secret message",
                },
                client
            );
        console.log(ciphertext, dataToEncryptHash);

        /**
         * When the getSessionSigs function is called, it will generate a session key
         * and sign it using a callback function. The authNeededCallback parameter
         * in this function is optional. If you don't pass this callback,
         * then the user will be prompted to authenticate with their wallet.
         */
        const walletWithCapacityCredit = new ethers.Wallet(
            process.env.REACT_APP_PRIVATE_KEY
        );

        let nonce = client.getLatestBlockhash();

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
            const signature = await walletWithCapacityCredit.signMessage(
                toSign
            );

            const authSig = {
                sig: signature,
                derivedVia: "web3.eth.personal.sign",
                signedMessage: toSign,
                address: walletWithCapacityCredit.address,
            };

            return authSig;
        };

        const newSessionSigs = await client.getSessionSigs({
            chain: "ethereum",
            resourceAbilityRequests: [
                // {
                //     resource: litResource,
                //     ability: LitAbility.AccessControlConditionDecryption,
                // },
            ],
            authNeededCallback,
        });
        // // const newSessionSigs = await client.getSessionSigs({
        // //     chain: "ethereum",
        // //     resourceAbilityRequests: [
        // //         {
        // //             resource: litResource,
        // //             ability: LitAbility.AccessControlConditionDecryption,
        // //         },
        // //     ],
        // //     authSig,
        // // });
        // // console.log(newSessionSigs);

        const decryptedFiles = await LitJsSdk.decryptToZip(
            {
                unifiedAccessControlConditions,
                chain,
                sessionSigs: newSessionSigs,
                // authSig,
                ciphertext,
                dataToEncryptHash,
            },
            client
        );
        const decryptedString = await decryptedFiles["string.txt"].async(
            "text"
        );
        console.log("decrypted string", decryptedString);

        // LitJsSdk.disconnectWeb3();
    };

    run();

    return <div>Auth</div>;
}
