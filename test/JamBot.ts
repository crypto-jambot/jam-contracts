import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, Signer } from "ethers";
import { abi as erc20ABI } from "@uniswap/v2-periphery/build/IERC20.json";
import { abi as v2RouterABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
import { JamBot } from "../typechain-types";

chai.use(solidity);

describe("JamBot", async function () {
    // tokens
    const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    // test trade 1 - root from WETH
    const target1 = "0x6028eB8ADdA090cdf08Fb5DFBE873081fD736867";
    const payload1 =
        "0x022c0d9f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016e492c7919a92200000000000000000000000052173b6ac069619c206b9a0e75609fc92860ab2a00000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000380000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a1af3bb298673f46cf1299efc7e73e7b2e2d20b80000000000000000000000009632ceef486ffa5e851fb5b9b87f1ced99add6630000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001c00000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000a1af3bb298673f46cf1299efc7e73e7b2e2d20b8000000000000000000000000000000000000000000000000016c4b90d1e817fe0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001eee08b0a550000000000000000000000009632ceef486ffa5e851fb5b9b87f1ced99add663000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f0000000000000000000000000000000000000000000000000000006905e2d03700000000000000000000000000000000000000000000000000000000000000000000000000000000000000006028eb8adda090cdf08fb5dfbe873081fd7368670000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    // test trade 2 - root from DAI
    const target2 = "0xAaF5110db6e744ff70fB339DE037B990A20bdace";
    const payload2 =
        "0x022c0d9f000000000000000000000000000000000000000000000002731d2804b451cfa3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052173b6ac069619c206b9a0e75609fc92860ab2a000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000040000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000093867b0b56d0275cffd0464869a8949ccaaa9c2c0000000000000000000000000e8a299e74e7875f1e27ef1cf382bb3e73316caa000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dc00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000044a9059cbb00000000000000000000000093867b0b56d0275cffd0464869a8949ccaaa9c2c00000000000000000000000000000000000000000000000243f4975926392b330000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d221ea0d8ecbc19f0000000000000000000000000e8a299e74e7875f1e27ef1cf382bb3e73316caa000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f000000000000000000000000000000000000000000000000005860f3b0f235f50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dc000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f0000000000000000000000000000000000000000000000000000000002aff1990000000000000000000000000000000000000000000000000000000000000000000000000000000000000000aaf5110db6e744ff70fb339de037b990a20bdace0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    // test trade 3 - root from USDC
    const target3 = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc";
    const payload3 =
        "0x022c0d9f0000000000000000000000000000000000000000000000000000000002b231c3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052173b6ac069619c206b9a0e75609fc92860ab2a000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000004000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000aaf5110db6e744ff70fb339de037b990a20bdace00000000000000000000000093867b0b56d0275cffd0464869a8949ccaaa9c2c0000000000000000000000000e8a299e74e7875f1e27ef1cf382bb3e73316caa00000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000aaf5110db6e744ff70fb339de037b990a20bdace00000000000000000000000000000000000000000000000000000000027e4ad50000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f00000000000000000000000000000000000000000000000246001825d58e1647000000000000000000000000000000000000000000000000000000000000000000000000000000000000000093867b0b56d0275cffd0464869a8949ccaaa9c2c000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003d572b8894ef867730000000000000000000000000e8a299e74e7875f1e27ef1cf382bb3e73316caa000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f0000000000000000000000000000000000000000000000000058aaf8695f32b20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dc0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    // test trade 4 - extra test with WETH as root
    const target4 = "0x332E37154D1F5b8487900D24e035e903988e1E0c";
    const payload4 =
        "0x022c0d9f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004e7aa213ffbe8200000000000000000000000052173b6ac069619c206b9a0e75609fc92860ab2a000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000004a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000004000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dc0000000000000000000000003041cbd36888becc7bbcbc0045e3b1f144466f5f000000000000000000000000853a43cc651e8b25e753eed19dde68c6a6cab25400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001e000000000000000000000000000000000000000000000000000000000000002c00000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000b4e16d0168e52d35cacd2c6185b44281ec28c9dc000000000000000000000000000000000000000000000000004502ca94eca7220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f0000000000000000000000000000000000000000000000000000000002192f2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003041cbd36888becc7bbcbc0045e3b1f144466f5f000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002174405000000000000000000000000853a43cc651e8b25e753eed19dde68c6a6cab254000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a4022c0d9f00000000000000000000000000000000000000000000000003e2275c3a05cf490000000000000000000000000000000000000000000000000000000000000000000000000000000000000000332e37154d1f5b8487900d24e035e903988e1e0c0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    async function deployJamBotFixture() {
        const [deployer, owner1, owner2, address3] = await ethers.getSigners();
        const JamBot = await ethers.getContractFactory("JamBot");
        const jambot = await JamBot.deploy(owner1.address, owner2.address, 25);
        await jambot.deployed();
        const authorizedContractDeployer = await jambot.connect(deployer);
        const authorizedContract1 = await jambot.connect(owner1);
        const authorizedContract2 = await jambot.connect(owner2);
        const unauthorizedContract = await jambot.connect(address3);
        return {
            authorizedContractDeployer,
            authorizedContract1,
            authorizedContract2,
            unauthorizedContract,
            deployer,
            owner1,
            owner2,
            address3,
        };
    }

    describe("Deployer Permissions", async function () {
        it("Should set the right deployer", async function () {
            const { authorizedContractDeployer, deployer } = await loadFixture(
                deployJamBotFixture
            );
            const deployerAddress = await authorizedContractDeployer.deployer();
            expect(deployerAddress).to.equal(deployer.address);
        });

        it("Should only let the deployer withdraw", async function () {
            const { unauthorizedContract } = await loadFixture(
                deployJamBotFixture
            );
            await expect(unauthorizedContract.withdraw()).to.be.revertedWith(
                /^ONLY DEPLOYER CAN CALL.*/
            );
        });

        it("Should only let the deployer withdraw tokens", async function () {
            const { unauthorizedContract } = await loadFixture(
                deployJamBotFixture
            );
            await expect(
                unauthorizedContract.withdrawTokens(WETH)
            ).to.be.revertedWith(/^ONLY DEPLOYER CAN CALL.*/);
        });

        it("Should only let the deployer execute trades", async function () {
            const { unauthorizedContract } = await loadFixture(
                deployJamBotFixture
            );
            await expect(
                unauthorizedContract.executeTrade(WETH, target1, payload1)
            ).to.be.revertedWith(/^ONLY DEPLOYER CAN CALL.*/);
        });

        it("Should finalize the deployer's cut", async function () {
            const { authorizedContractDeployer } = await loadFixture(
                deployJamBotFixture
            );
            await authorizedContractDeployer.finalizeDeployerCut();
            const isDeployerCutFinalized =
                await authorizedContractDeployer.deployerCutFinalized();
            expect(isDeployerCutFinalized).to.be.equal(true);
        });

        it("Should prevent the deployer's cut being changed after it has been finalized", async function () {
            const { authorizedContractDeployer } = await loadFixture(
                deployJamBotFixture
            );
            await authorizedContractDeployer.finalizeDeployerCut();
            await expect(
                authorizedContractDeployer.setDeployerCut(50)
            ).to.be.revertedWith(/^DEPLOYER CUT IS FINALIZED.*/);
        });
    });

    describe("Owner Permissions", async function () {
        it("Should set the right owners", async function () {
            const { authorizedContract1, authorizedContract2, owner1, owner2 } =
                await loadFixture(deployJamBotFixture);
            const owner1Address = await authorizedContract1.owner1();
            const owner2Address = await authorizedContract2.owner2();
            expect(owner1Address).to.equal(owner1.address);
            expect(owner2Address).to.equal(owner2.address);
        });

        it("Should only let the owners set their new ownership", async function () {
            const { unauthorizedContract, address3 } = await loadFixture(
                deployJamBotFixture
            );
            await expect(
                unauthorizedContract.setOwner1(address3.address)
            ).to.be.revertedWith(/^ONLY OWNER1 CAN CALL.*/);
            await expect(
                unauthorizedContract.setOwner2(address3.address)
            ).to.be.revertedWith(/^ONLY OWNER2 CAN CALL.*/);
        });

        it("Should allow the owners to set their new ownership", async function () {
            const {
                authorizedContract1,
                authorizedContract2,
                owner1,
                owner2,
                address3,
            } = await loadFixture(deployJamBotFixture);
            await authorizedContract1.setOwner1(address3.address);
            await authorizedContract2.setOwner2(address3.address);
            expect(await authorizedContract1.owner1()).to.be.equal(
                address3.address
            );
            expect(await authorizedContract2.owner2()).to.be.equal(
                address3.address
            );
        });
    });

    describe("UniswapV2Callee Permissions", async function () {
        it("Should not let the uniswapV2Call function be called if locked", async function () {
            const { authorizedContractDeployer, deployer } = await loadFixture(
                deployJamBotFixture
            );
            await expect(
                authorizedContractDeployer.uniswapV2Call(
                    deployer.address,
                    0,
                    0,
                    []
                )
            ).to.be.revertedWith(/^FUNCTION IS LOCKED.*/);
        });
    });

    describe("Arbitrage Trading", async function () {
        it("Should extract out value in WETH given the startToken, target, and payload", async function () {
            const { authorizedContractDeployer, deployer } = await loadFixture(
                deployJamBotFixture
            );
            const wethContract = new ethers.Contract(WETH, erc20ABI, deployer);
            await expect(() =>
                authorizedContractDeployer.executeTrade(WETH, target1, payload1)
            ).to.changeTokenBalance(
                wethContract,
                authorizedContractDeployer,
                BigNumber.from("560319943512356")
            );
        });

        it("Should extract out value in DAI given the startToken, target, and payload", async function () {
            const { authorizedContractDeployer, deployer } = await loadFixture(
                deployJamBotFixture
            );
            const daiContract = new ethers.Contract(DAI, erc20ABI, deployer);
            await expect(() =>
                authorizedContractDeployer.executeTrade(DAI, target2, payload2)
            ).to.changeTokenBalance(
                daiContract,
                authorizedContractDeployer,
                BigNumber.from("3398124985348826224")
            );
        });

        it("Should extract out value in USDC given the startToken, target, and payload", async function () {
            const { authorizedContractDeployer, deployer } = await loadFixture(
                deployJamBotFixture
            );
            const usdcContract = new ethers.Contract(USDC, erc20ABI, deployer);
            await expect(() =>
                authorizedContractDeployer.executeTrade(USDC, target3, payload3)
            ).to.changeTokenBalance(
                usdcContract,
                authorizedContractDeployer,
                BigNumber.from("3401454")
            );
        });

        it("Should extract out value in WETH given the startToken, target, and payload (extra test)", async function () {
            const { authorizedContractDeployer, deployer } = await loadFixture(
                deployJamBotFixture
            );
            const wethContract = new ethers.Contract(WETH, erc20ABI, deployer);
            await expect(() =>
                authorizedContractDeployer.executeTrade(WETH, target4, payload4)
            ).to.changeTokenBalance(
                wethContract,
                authorizedContractDeployer,
                BigNumber.from("2665042224027488")
            );
        });
    });

    describe("Deposit and Withdrawals", async function () {
        it("Should be able to receive ether", async function () {
            const { authorizedContract1, owner1 } = await loadFixture(
                deployJamBotFixture
            );
            await expect(() =>
                depositEther(owner1, authorizedContract1, BigNumber.from(1000))
            ).to.changeEtherBalances(
                [owner1, authorizedContract1],
                [-1000, 1000]
            );
        });

        it("Should let deployer withdraw ether and send equal shares to the owners", async function () {
            const {
                authorizedContractDeployer,
                deployer,
                owner1,
                owner2,
                address3,
            } = await loadFixture(deployJamBotFixture);
            await depositEther(
                address3,
                authorizedContractDeployer,
                BigNumber.from(1000)
            );
            await expect(() =>
                authorizedContractDeployer.withdraw()
            ).to.changeEtherBalances(
                [deployer, owner1, owner2, authorizedContractDeployer],
                [250, 375, 375, -1000]
            );
        });

        it("Should leave 1 wei inside contract if an odd balance is present after subtracting deployers cut upon withdrawal", async function () {
            const {
                authorizedContractDeployer,
                deployer,
                owner1,
                owner2,
                address3,
            } = await loadFixture(deployJamBotFixture);
            await depositEther(
                address3,
                authorizedContractDeployer,
                BigNumber.from(1001)
            );
            await expect(() =>
                authorizedContractDeployer.withdraw()
            ).to.changeEtherBalances(
                [deployer, owner1, owner2, authorizedContractDeployer],
                [250, 375, 375, -1000]
            );
            const remaining = await ethers.provider.getBalance(
                authorizedContractDeployer.address
            );
            expect(remaining).to.be.equal(1);
        });

        it("Should let deployer withdraw any erc20 token and send equal shares to the owners", async function () {
            const {
                authorizedContractDeployer,
                deployer,
                owner1,
                owner2,
                address3,
            } = await loadFixture(deployJamBotFixture);
            await swapETHForExactERC20(address3, DAI, BigNumber.from(1000));
            const daiContract = new ethers.Contract(DAI, erc20ABI, address3);
            await daiContract.transfer(
                authorizedContractDeployer.address,
                1000
            );
            await expect(() =>
                authorizedContractDeployer.withdrawTokens(DAI)
            ).to.changeTokenBalances(
                daiContract,
                [deployer, owner1, owner2, authorizedContractDeployer],
                [250, 375, 375, -1000]
            );
        });

        it("Should leave 1 wei of token inside the contract if an odd balance is present after subtracting deployers cut upon withdrawal", async function () {
            const {
                authorizedContractDeployer,
                deployer,
                owner1,
                owner2,
                address3,
            } = await loadFixture(deployJamBotFixture);
            await swapETHForExactERC20(address3, DAI, BigNumber.from(1001));
            const daiContract = new ethers.Contract(DAI, erc20ABI, address3);
            await daiContract.transfer(
                authorizedContractDeployer.address,
                1001
            );
            await expect(() =>
                authorizedContractDeployer.withdrawTokens(DAI)
            ).to.changeTokenBalances(
                daiContract,
                [deployer, owner1, owner2, authorizedContractDeployer],
                [250, 375, 375, -1000]
            );
            const remaining = await daiContract.balanceOf(
                authorizedContractDeployer.address
            );
            expect(remaining).to.be.equal(1);
        });
    });

    async function depositEther(
        wallet: Signer,
        jambot: JamBot,
        amount: BigNumber
    ) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await wallet.sendTransaction({
                    to: jambot.address,
                    value: amount,
                });
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }

    async function swapETHForExactERC20(
        wallet: Signer,
        token: string,
        amountOut: BigNumber
    ) {
        const router = new ethers.Contract(
            UNISWAP_V2_ROUTER,
            v2RouterABI,
            wallet
        );
        return new Promise(async (resolve, reject) => {
            try {
                const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
                const result = await router.swapETHForExactTokens(
                    amountOut,
                    [WETH, token],
                    wallet.getAddress(),
                    deadline,
                    { value: BigNumber.from("1000000000000000000") }
                );
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
});
