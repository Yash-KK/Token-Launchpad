import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

import TokenLaunchPad from "./components/TokenLaunchPad";

function App() {
  const endpoint =
    "https://solana-devnet.g.alchemy.com/v2/RbXNp8zKVUbiRmAUWxyq8vUDlBh659Jl";

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <TokenLaunchPad />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
