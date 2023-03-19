# Solana Compressed NFTs Receipts
This is a simple example of how to generate a compressed NFT receipt using [CrossMint](./src/api/crossmint.ts) and [ShadowDrive](./src/api//shadow.ts).
We also include an [example implementation](./src/examples/solana-pay/) to integration with Solana Pay 

Note: this is working, but still in progress...use at your own risk. 
I probably won't be actively maintaining this--just wanted to proove the concept.
Feel free to contribute!

## Local Deployment
- Clone this repo
- Run `yarn` or `npm install`
- Update constants: 
    - Rename `example.ts` to `constants.ts`
    - Update `constants.ts` with your own values (see comments in file)
    - *Note You'll need a crossmint account and a shadow drive (Create a Shadow drive wallet w/ some storage (configure and run `createShdw.ts`)).
- Run `ts-node src/app`

Example output: [https://www.crossmint.com/tokens/sol:C4Uh1SaegzihN99VZqzBUrXmFrx5Ug97QhdG5rKs7WQ2](https://www.crossmint.com/tokens/sol:C4Uh1SaegzihN99VZqzBUrXmFrx5Ug97QhdG5rKs7WQ2)