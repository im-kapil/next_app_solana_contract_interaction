"use client"; // This is a client component 👈🏽
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
<><><><><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /></><link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" /></><link
    rel="stylesheet"
    href="https://fonts.googleapis.com/icon?family=Material+Icons" /></><meta name="viewport" content="initial-scale=1, width=device-width" /></>


import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount
} from "@solana/spl-token";

import {
  Keypair,
  Transaction,
  Connection,
  PublicKey,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { PhantomProvider } from './interface';
import { useState } from 'react';
import { Button } from '@mui/material';

export default  function main() { 
  /**
    * @description gets Phantom provider, if it exists
  */
  const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
      // @ts-ignore
      const provider = window.solana as any;
      if (provider.isPhantom) return provider as PhantomProvider;
    }
  };


  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
  const [walletAddress, setWalletAddress] = useState<any>(undefined);
  // const { publicKey, sendTransaction, signTransaction } = useWallet();

  const connectWallet = async () => {
    const provider = getProvider();
    if (provider) { 
      setProvider(provider);
      try {
        const connStatus = await provider.connect();
        const pubKey = connStatus?.publicKey.toString()
        setWalletAddress(pubKey);
      } catch(error) {
        console.error("Error connecting to wallet:", error);
      }
    }
    else {
      console.warn("Phantom wallet provider not found.");
      setProvider(undefined);
    }
  }

  const disconnectWallet = async () => {
    provider?.disconnect();
    setProvider(undefined);
    setWalletAddress(undefined);
  }

  const tokenTransfer = async () => {
    const TOKEN_DECIMAL = 9;
    const USDCAddress = '41fMjoW1G7uYUE5283cMmGVPMat2yx4EmEMZEVaTFUhm'

    const connection = new Connection(
      'https://solana-devnet.g.alchemy.com/v2/2Om9vVrMNswSL0zrm_xLCUnLqJbqKYtW',
       "confirmed"
   );
   
   const recipient = 'CnJwPXgr8LkywNbYiRBPpd9ZPsooawcyh98CAKw1KSPK';

   const senderTokenAccountAddress = await getAssociatedTokenAddress(
    new PublicKey(USDCAddress),
    new PublicKey(walletAddress)
   )
   console.log("senderTokenAccountAddress::::", senderTokenAccountAddress.toString());

   const recipientTokenAccountAddress = await getAssociatedTokenAddress(
    new PublicKey(USDCAddress),
    new PublicKey(recipient)
    )
    console.log("RecepientTokenAccountAddress:::", recipientTokenAccountAddress.toString());

    const instruction = createTransferCheckedInstruction(
      senderTokenAccountAddress,
      new PublicKey(USDCAddress),
      recipientTokenAccountAddress,
      new PublicKey(walletAddress),
      1 ** 9,
      TOKEN_DECIMAL, // Replace with the decimals of the token
    );
    console.log("instruction:::", instruction);

    const transaction = new Transaction().add(instruction);

    const txHash = await provider.SignAndSendTransaction(transaction);
    // const transactionSignature3 = await sendAndConfirmTransaction(
    //   connection,
    //   transaction,
    //   [provider] // signer
    // );
  }



  return (

    <div className="App">
      <header className="App-header">
          {/* Display wallet address if available */}
          {walletAddress ? (<p>Connected Wallet Address: {walletAddress}</p>) : <p>Currently not connected</p> }
        </header>
        {/* Display token instruction data to UI */}
      <Button variant="outlined"  onClick={connectWallet}>Connect Wallet</Button> <br></br>
      <Button variant="outlined"  onClick={disconnectWallet}>Disconnect Wallet</Button>
      <Button variant="outlined"  onClick={tokenTransfer} disabled={!provider || !walletAddress}>Transfer One token</Button> <br></br>
    </div>
  )
}