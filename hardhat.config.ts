import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.18",
            },
        ],
    },
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545",
        },
        hardhat: {
            forking: {
                url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
                blockNumber: 16863267,
            },
        },
        mainnet: {
            url: "https://rabbit.dev/http",
            accounts: {
                mnemonic: process.env.JOINT_WALLET_SEED_PHRASE,
            },
        },
    },
};

export default config;
