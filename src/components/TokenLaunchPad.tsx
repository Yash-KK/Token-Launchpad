import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useState } from "react";

const TokenLaunchPad = () => {
  const [solBalance, setSolBalance] = useState<number>(0);
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const handleSetBalance = async () => {
    if (!publicKey) {
      console.log("public key required!");
      return;
    }
    const balance = await connection.getBalance(publicKey);
    setSolBalance(balance / LAMPORTS_PER_SOL);
  };
  return (
    <div className="bg-gray-500 h-screen">
      <div className="flex justify-between p-3">
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>

      {!publicKey ? (
        <div className="flex justify-center  text-2xl font-bold">
          Connect to your wallet
        </div>
      ) : (
        <>
          <div className="flex items-center">
            <button
              onClick={handleSetBalance}
              className="mx-3 cursor-pointer font-bold border rounded-sm bg-red-800 hover:bg-amber-900"
            >
              <div className="p-2">Display Balance</div>
            </button>

            <div>{solBalance} SOL</div>
          </div>
        </>
      )}
    </div>
  );
};

export default TokenLaunchPad;
