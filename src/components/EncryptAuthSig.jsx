import * as LitJsSdk from "@lit-protocol/lit-node-client";
  
export function EncryptAuthSig() {

    const run = async () => {
        
        const client = new LitJsSdk.LitNodeClient({
            litNetwork: "cayenne",
        });
        const chain = "ethereum";
        const accessControlConditions = [
            {
              contractAddress: "",
              standardContractType: "",
              chain: "ethereum",
              method: "eth_getBalance",
              parameters: [":userAddress", "latest"],
              returnValueTest: {
                comparator: ">=",
                value: "000000000000", // 0.000001 ETH
              },
            },
        ];
        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: "ethereum" });
        console.log(authSig);
        class Lit {
            litNodeClient
            constructor(client){
                this.litNodeClient = client;
            }
            async connect() {
              await client.connect()
              this.litNodeClient = client
            }
            async encrypt(message) {
                if (!this.litNodeClient) {
                  await this.connect()
                }
              
                const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
                const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
                  {
                    accessControlConditions,
                    authSig,
                    chain: 'ethereum',
                    dataToEncrypt: 'this is a secret message',
                  },
                  this.litNodeClient,
                );
              
                return {
                  ciphertext,
                  dataToEncryptHash,
                };
            }
            async decrypt(ciphertext, dataToEncryptHash, accessControlConditions) {
              if (!this.litNodeClient) {
                await this.connect()
              }
            
              const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: 'ethereum' })
              const decryptedString = LitJsSdk.decryptToString(
                {
                  accessControlConditions,
                  ciphertext,
                  dataToEncryptHash,
                  authSig,
                  chain: 'ethereum',
                },
                this.litNodeClient,
              );
              return { decryptedString }
            }
          //   async encrypt1(){
          //     const file = new File(["Encrypt & store on IPFS seamlessly with Lit 😎"], "filename.txt", {type: "text/plain"});
          //     const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })

          //     const ipfsCid = await encryptToIpfs({
          //       authSig,
          //       accessControlConditions,
          //       chain,
          //       string: "Encrypt & store on IPFS seamlessly with Lit 😎",
          //       file, // If you want to encrypt a file instead of a string
          //       litNodeClient: this.litNodeClient,
          //       infuraId: process.env.REACT_APP_INFURA_ID,
          //       infuraSecretKey: process.env.REACT_APP_INFURA_SECRET_KEY,
          //     });
          //     return ipfsCid;
          //   }
          //   async decrypt1(ipfsCid) {
          //     const decryptedString = await LitJsSdk.decryptFromIpfs({
          //       authSig,
          //       ipfsCid, // This is returned from the above encryption
          //       litNodeClient: this.litNodeClient,
          //     });
          //     return decryptedString;
          // }
        }
        let myLit = new Lit(client)
        await myLit.connect()

        const {    ciphertext,
            dataToEncryptHash} = await myLit.encrypt()
            console.log(ciphertext, dataToEncryptHash);
        myLit.decrypt(ciphertext,
            dataToEncryptHash, accessControlConditions).then((data)=>{
                console.log(data)
            })


    }
    run();
    return <div>Encrypt</div>;
}