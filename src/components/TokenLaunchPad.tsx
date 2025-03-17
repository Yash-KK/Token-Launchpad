import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  createInitializeMint2Instruction,
} from "@solana/spl-token";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";

const TokenLaunchPad = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const customCreateMint = async () => {
    if (!publicKey) {
      console.log("connect to wallet");
      return;
    }
    const decimals = 9; // SHOULD BE A FIELD IN THE FORM
    const mintAuthority = publicKey;
    const freezeAuthority = null;
    const keyPair = Keypair.generate(); // this is the keypair for the token's mint-address
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey, // one of the account's on the wallet's public key
        newAccountPubkey: keyPair.publicKey, // public key of the new token mint addressAS5pgF1gCcx6fWZ4G42S154K4oJcmsGihujRSB8Kr93Y
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),

      createInitializeMint2Instruction(
        keyPair.publicKey,
        decimals,
        mintAuthority,
        freezeAuthority
      )
    );
    transaction.feePayer = publicKey;
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.partialSign(keyPair);
    await sendTransaction(transaction, connection);
    console.log(`Token mint created at ${keyPair.publicKey.toBase58()}`);
  };

  return (
    <div className="bg-gray-500 h-screen">
      <div className="flex justify-between p-3">
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>

      <div className="p-20">
        <section className="bg-white dark:bg-gray-900">
          <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Solana Token LaunchPad
            </h2>
            <form onSubmit={customCreateMint}>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Token Name
                  </label>
                  <input
                    type="text"
                    name="brand"
                    id="brand"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="solflow koin"
                  />
                </div>
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Symbol
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="SF"
                  />
                </div>
                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Image URL
                  </label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Initial Supply
                  </label>
                  <input
                    type="number"
                    name="item-weight"
                    id="item-weight"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="100"
                  />
                </div>
              </div>
              {publicKey ? (
                <>
                  <button
                    type="submit"
                    // onClick={handleCreateMint}
                    className="inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-center text-white border bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                  >
                    Create Token
                  </button>
                </>
              ) : (
                <>
                  <div className="px-5 py-2.5 mt-4 sm:mt-6">
                    <WalletMultiButton />
                  </div>
                </>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TokenLaunchPad;
