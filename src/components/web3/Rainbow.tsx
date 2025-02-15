import React from 'react';

import {
  createAuthenticationAdapter,
  darkTheme,
  getDefaultConfig,
  type AuthenticationStatus,
  ConnectButton,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createSiweMessage } from 'viem/siwe';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

import { web3LoggedIn, authenticated, availables } from '@stores/account';
import { AccountAPI, AuthAPI } from '@service/routes';

import '@rainbow-me/rainbowkit/styles.css';

const Web3Provider = ({ linking, children }) => {
  let AUTHENTICATION_STATUS: AuthenticationStatus = 'unauthenticated';

  const authAPI = new AuthAPI(import.meta.env.PUBLIC_BACKEND);
  const accountAPI = new AccountAPI(import.meta.env.PUBLIC_BACKEND);

  const config = getDefaultConfig({
    appName: 'Degenerous DAO',
    appIcon: 'https://media.degenerousdao.com/assets/logo.png',
    appUrl: 'https://degenerousdao.com',
    projectId: '0b8a3fac6220753a719b9aeceb8f19fb',
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: false, // If your dApp uses server side rendering (SSR)
  });

  const authenticationAdapter = createAuthenticationAdapter({
    getNonce: async () => {
      const { data, error } = await authAPI.web3Getnonce();

      if (!data) {
        console.error('Failed to fetch nonce:', error);
        throw new Error('Failed to fetch nonce');
      }

      AUTHENTICATION_STATUS = 'loading';

      return data.nonce;
    },

    createMessage: ({ nonce, address, chainId }) => {
      console.log(
        `Creating message with nonce: ${nonce} and address: ${address} for chain: ${chainId}`,
      );

      if (!nonce || !address || !chainId) {
        console.error('Missing required parameters for createSiweMessage:', {
          nonce,
          address,
          chainId,
        });
        throw new Error('Missing parameters for creating the message');
      }

      try {
        return createSiweMessage({
          nonce,
          address,
          chainId,
          statement:
            "Sign this message to prove you're a Potential NFT holder. It will not cause a blockchain transaction, nor any gas fees.",
          domain: window.location.host,
          uri: window.location.origin,
          version: '1',
        });
      } catch (error) {
        console.error('Error creating SIWE message:', error);
        throw error;
      }
    },

    verify: async ({ message, signature }) => {
      const { data, error } = await authAPI.web3WalletSignin({
        message,
        signature,
      });

      if (!data) {
        console.error('Failed to verify signature:', error);
        AUTHENTICATION_STATUS = 'unauthenticated';
        return false;
      }

      web3LoggedIn.set(true);
      authenticated.set({ user: data.user, loggedIn: true });

      AUTHENTICATION_STATUS = 'authenticated';

      return true;
    },

    signOut: async () => {
      const { data, error } = await accountAPI.logout();

      if (!data) {
        console.error('Failed to sign out:', error);
        return;
      }

      web3LoggedIn.set(false);
      authenticated.set({ user: null, loggedIn: false });

      AUTHENTICATION_STATUS = 'unauthenticated';
    },
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={AUTHENTICATION_STATUS}
        >
          <RainbowKitProvider
            coolMode
            modalSize="wide"
            theme={darkTheme({
              accentColor: 'rgb(51, 226, 230)',
              accentColorForeground: 'rgb(51, 226, 230)',
              borderRadius: 'large',
              fontStack: 'rounded',
              overlayBlur: 'large',
            })}
          >
            {children}
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

// export const App = () => {
//   return (
//     <Web3Provider>
//       <ConnectButton
//         label="with Wallet Connect"
//         showBalance={false}
//         accountStatus={{
//           smallScreen: 'avatar',
//           largeScreen: 'full',
//         }}
//       />
//     </Web3Provider>
//   );
// };

const YourApp = (linking: boolean, title: string) => {
  return (
    <Web3Provider linking={linking}>
      <ConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          openConnectModal,
          authenticationStatus,
          mounted,
        }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready &&
            account &&
            chain &&
            (!authenticationStatus || authenticationStatus === 'authenticated');
          // changing button width
          let autoWidth: any = undefined;
          if (title !== 'with Web3 wallet') autoWidth = { width: 'auto' };
          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <button
                      className="sign-button"
                      style={autoWidth}
                      onClick={openConnectModal}
                      type="button"
                    >
                      <img
                        className="sign-icon"
                        src="/icons/wallet.png"
                        alt="Google"
                      />
                      <p className="sign-lable">{title}</p>
                    </button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button onClick={openChainModal} type="button">
                      Wrong network
                    </button>
                  );
                }
                return (
                  <div>
                    <button onClick={openChainModal} type="button">
                      {chain.hasIcon && (
                        <div>
                          {chain.iconUrl && (
                            <img
                              alt={chain.name ?? 'Chain icon'}
                              src={chain.iconUrl}
                            />
                          )}
                        </div>
                      )}
                      {chain.name}
                    </button>
                    <button onClick={openAccountModal} type="button">
                      {account.displayName}
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </Web3Provider>
  );
};

export default YourApp;
