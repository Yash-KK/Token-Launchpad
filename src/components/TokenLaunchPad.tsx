import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  TYPE_SIZE,
  LENGTH_SIZE,
  getMintLen,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useState } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";

const TokenLaunchPad = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [formData, setFormData] = useState({
    tokenName: "",
    symbol: "",
    decimals: 0,
    initialSupply: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  async function customCreateMint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!wallet.publicKey) {
      toast.error("Connect your wallet first!");
      return;
    }

    setLoading(true);

    try {
      const mintKeypair = Keypair.generate();
      const metadata = {
        mint: mintKeypair.publicKey,
        name: formData.tokenName,
        symbol: formData.symbol,
        uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
        additionalMetadata: [],
      };

      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      );

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          mintKeypair.publicKey,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          formData.decimals,
          wallet.publicKey,
          null,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: mintKeypair.publicKey,
          metadata: mintKeypair.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          mintAuthority: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        })
      );

      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
      transaction.partialSign(mintKeypair);

      await wallet.sendTransaction(transaction, connection);
      toast.success("Token metadata initialized successfully!");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const associatedToken = getAssociatedTokenAddressSync(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const transaction2 = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction2, connection);
      toast.success("Associated token account created!");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const transaction3 = new Transaction().add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedToken,
          wallet.publicKey,
          formData.initialSupply * LAMPORTS_PER_SOL,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      await wallet.sendTransaction(transaction3, connection);
      toast.success("Token minted successfully! 🎉");
    } catch (error) {
      console.error("Token creation failed:", error);
      toast.error("Failed to create token. Try again!");
    } finally {
      setLoading(false);
    }
    setFormData({
      tokenName: "",
      symbol: "",
      decimals: 0,
      initialSupply: 0,
    });
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-12">
      <Toaster />

      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex justify-between w-full max-w-4xl mb-12"
      >
        <WalletMultiButton className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition" />
        <WalletDisconnectButton className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition" />
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-gray-900/80 rounded-3xl shadow-2xl p-16 max-w-4xl w-full border border-gray-800 backdrop-blur-md hover:shadow-purple-500/30 transition-all duration-500"
      >
        <h2 className="text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-500 text-transparent bg-clip-text">
          🚀 Token LaunchPad
        </h2>

        <form onSubmit={customCreateMint} className="grid gap-8">
          <div className="flex flex-col">
            <label htmlFor="tokenName" className="text-lg mb-2 font-semibold">
              Token Name
            </label>
            <motion.input
              id="tokenName"
              type="text"
              name="tokenName"
              value={formData.tokenName}
              onChange={handleChange}
              placeholder="Enter token name"
              className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="symbol" className="text-lg mb-2 font-semibold">
              Symbol
            </label>
            <motion.input
              id="symbol"
              type="text"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="Enter token symbol"
              className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="decimals" className="text-lg mb-2 font-semibold">
              Decimals
            </label>
            <motion.input
              id="decimals"
              type="number"
              name="decimals"
              value={formData.decimals}
              onChange={handleChange}
              placeholder="Enter decimals (e.g., 9)"
              className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="initialSupply"
              className="text-lg mb-2 font-semibold"
            >
              Initial Supply
            </label>
            <motion.input
              id="initialSupply"
              type="number"
              name="initialSupply"
              value={formData.initialSupply}
              onChange={handleChange}
              placeholder="Enter initial supply"
              className="w-full bg-gray-800 border border-gray-700 text-white p-4 rounded-lg focus:ring-2 focus:ring-purple-500 transition"
              whileHover={{ scale: 1.05 }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`mt-12 w-full ${
              loading ? "bg-gray-700" : "bg-purple-500"
            } font-bold py-4 rounded-xl transition`}
          >
            {loading ? "🚀 Creating..." : "🚀 Launch Token"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default TokenLaunchPad;
