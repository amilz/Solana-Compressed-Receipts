import {ShdwDrive} from '@shadow-drive/sdk';
import {SOLANA_RPC, SECRET} from '../config/constants';
import {Keypair, Connection} from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";

const connection = new Connection(SOLANA_RPC, 'confirmed');

(async () => {
    // Make sure this wallet has sufficient SOL and SHDW for purchase
    const keypair = Keypair.fromSecretKey(new Uint8Array(SECRET));
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();

    const newAcct = await drive.createStorageAccount("RECEIPT_DEMO","1MB", "v2");
    console.log(newAcct)

  })();