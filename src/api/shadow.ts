import { ShadowFile, ShdwDrive } from "@shadow-drive/sdk"
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SECRET, SHADOW_DIRECTORY } from "../config/constants";
import * as anchor from "@project-serum/anchor";

// Using maininet for image uploads even when testing
// TODO Expiriment with Shadow on Devnet
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
const acctPubKey = new PublicKey(SHADOW_DIRECTORY);
const keypair = Keypair.fromSecretKey(new Uint8Array(SECRET));
const wallet = new anchor.Wallet(keypair);

interface Args {
    fileName: string;
    image: Buffer;
}

export async function uploadImage({ fileName, image }: Args): Promise<string> {
    const drive = await new ShdwDrive(connection, wallet).init();
    // UPLOAD IMAGE
    const fileToUpload: ShadowFile = {
        name: fileName,
        file: image
    };
    const uri = (await drive.uploadFile(acctPubKey, fileToUpload)).finalized_locations[0];
    return uri;
}
