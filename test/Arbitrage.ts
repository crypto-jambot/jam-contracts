// import chai, { expect } from "chai";
// import { solidity } from "ethereum-waffle";
// import { ethers } from "hardhat";
// import { Arbitrage } from "../typechain-types";
// import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
// import { BigNumber, Signer } from "ethers";
// import { abi as erc20ABI } from "@uniswap/v2-periphery/build/IERC20.json";
// import { abi as v2RouterABI } from "@uniswap/v2-periphery/build/IUniswapV2Router02.json";
//
// chai.use(solidity);
//
// describe("Arbitrage", async function () {
//     // tokens
//     const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
//     const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
//     const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
//     const RC = "0xF6ee08FA550E1cb08C0821a4DA8CEa57b8909D2e";
//     const TSUKA = "0xc5fB36dd2fb59d3B98dEfF88425a3F425Ee469eD";
//     const WAIT = "0x2559813BBb508C4C79e9CCCE4703Bcb1f149EDd7";
//     const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
//
//     const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
//
//     // pools
//     const WETH_TO_USDC_POOL = "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc";
//     const USDC_TO_TSUKA_POOL = "0x67CeA36eEB36Ace126A3Ca6E21405258130CF33C";
//     const TSUKA_TO_WAIT_POOL = "0x9632CeeF486Ffa5e851fB5b9b87F1CED99adD663";
//     const WAIT_TO_WETH_POOL = "0x6028eB8ADdA090cdf08Fb5DFBE873081fD736867";
//     const DAI_TO_RC_POOL = "0x93867b0b56D0275cFfd0464869a8949CcAaA9c2C";
//     const RC_TO_WETH_POOL = "0x0E8A299e74E7875f1e27Ef1cF382bb3E73316CAA";
//     const USDC_TO_DAI_POOL = "0xAaF5110db6e744ff70fB339DE037B990A20bdace";
//
//     // test trade 1 - root from WETH
//     const tokenPath1 = [WETH, USDC, TSUKA, WAIT];
//     const poolPath1 = [
//         WETH_TO_USDC_POOL,
//         USDC_TO_TSUKA_POOL,
//         TSUKA_TO_WAIT_POOL,
//         WAIT_TO_WETH_POOL,
//     ];
//     const tradeAmount1 = BigNumber.from("169485573416347419");
//
//     // test trade 2 - root from DAI
//     const tokenPath2 = [DAI, RC, WETH, USDC];
//     const poolPath2 = [
//         DAI_TO_RC_POOL,
//         RC_TO_WETH_POOL,
//         WETH_TO_USDC_POOL,
//         USDC_TO_DAI_POOL,
//     ];
//     const tradeAmount2 = BigNumber.from("41790193251426839347");
//
//     // test trade 3 - root fronm USDC
//     const tokenPath3 = [USDC, TSUKA, WAIT, WETH];
//     const poolPath3 = [
//         USDC_TO_TSUKA_POOL,
//         TSUKA_TO_WAIT_POOL,
//         WAIT_TO_WETH_POOL,
//         WETH_TO_USDC_POOL,
//     ];
//     const tradeAmount3 = BigNumber.from("307161656");
//
//     async function deployArbitrageFixture() {
//         const [deployer, owner1, owner2, address3] = await ethers.getSigners();
//         const Arbitrage = await ethers.getContractFactory("Arbitrage");
//         const arbitrage = await Arbitrage.deploy(
//             owner1.address,
//             owner2.address,
//             25
//         );
//         await arbitrage.deployed();
//         const authorizedContractDeployer = await arbitrage.connect(deployer);
//         const authorizedContract1 = await arbitrage.connect(owner1);
//         const authorizedContract2 = await arbitrage.connect(owner2);
//         const unauthorizedContract = await arbitrage.connect(address3);
//         return {
//             authorizedContractDeployer,
//             authorizedContract1,
//             authorizedContract2,
//             unauthorizedContract,
//             deployer,
//             owner1,
//             owner2,
//             address3,
//         };
//     }
//
//     describe("Deployer Permissions", async function () {
//         it("Should set the right deployer", async function () {
//             const { authorizedContractDeployer, deployer } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             const deployerAddress = await authorizedContractDeployer.deployer();
//             expect(deployerAddress).to.equal(deployer.address);
//         });
//
//         it("Should only let the deployer withdraw", async function () {
//             const { unauthorizedContract } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             await expect(unauthorizedContract.withdraw()).to.be.revertedWith(
//                 /^ONLY DEPLOYER CAN CALL.*/
//             );
//         });
//
//         it("Should only let the deployer withdraw tokens", async function () {
//             const { unauthorizedContract } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             await expect(
//                 unauthorizedContract.withdrawTokens(WETH)
//             ).to.be.revertedWith(/^ONLY DEPLOYER CAN CALL.*/);
//         });
//
//         it("Should finalize the deployer's cut", async function () {
//             const { authorizedContractDeployer } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             await authorizedContractDeployer.finalizeDeployerCut();
//             const isDeployerCutFinalized =
//                 await authorizedContractDeployer.deployerCutFinalized();
//             expect(isDeployerCutFinalized).to.be.equal(true);
//         });
//
//         it("Should prevent the deployer's cut being changed after it has been finalized", async function () {
//             const { authorizedContractDeployer } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             await authorizedContractDeployer.finalizeDeployerCut();
//             await expect(
//                 authorizedContractDeployer.setDeployerCut(50)
//             ).to.be.revertedWith(/^DEPLOYER CUT IS FINALIZED.*/);
//         });
//     });
//
//     describe("Owner Permissions", async function () {
//         it("Should set the right owners", async function () {
//             const { authorizedContract1, authorizedContract2, owner1, owner2 } =
//                 await loadFixture(deployArbitrageFixture);
//             const owner1Address = await authorizedContract1.owner1();
//             const owner2Address = await authorizedContract2.owner2();
//             expect(owner1Address).to.equal(owner1.address);
//             expect(owner2Address).to.equal(owner2.address);
//         });
//
//         it("Should only let the owners set their new ownership", async function () {
//             const { unauthorizedContract, address3 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             await expect(
//                 unauthorizedContract.setOwner1(address3.address)
//             ).to.be.revertedWith(/^ONLY OWNER1 CAN CALL.*/);
//             await expect(
//                 unauthorizedContract.setOwner2(address3.address)
//             ).to.be.revertedWith(/^ONLY OWNER2 CAN CALL.*/);
//         });
//
//         it("Should allow the owners to set their new ownership", async function () {
//             const {
//                 authorizedContract1,
//                 authorizedContract2,
//                 owner1,
//                 owner2,
//                 address3,
//             } = await loadFixture(deployArbitrageFixture);
//             await authorizedContract1.setOwner1(address3.address);
//             await authorizedContract2.setOwner2(address3.address);
//             expect(await authorizedContract1.owner1()).to.be.equal(
//                 address3.address
//             );
//             expect(await authorizedContract2.owner2()).to.be.equal(
//                 address3.address
//             );
//         });
//     });
//
//     describe("DYDX pool Permissions", async function () {
//         it("Should only let the DYDX solo margin contract execute the call function", async function () {
//             const { authorizedContract1, owner1 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             const ONE = BigNumber.from("0");
//             const info = { owner: authorizedContract1.address, number: ONE };
//             const data = ethers.utils.defaultAbiCoder.encode(
//                 ["address[]", "address[]", "uint256", "uint256"],
//                 [tokenPath1, poolPath1, tradeAmount1, ONE]
//             );
//             await expect(
//                 authorizedContract1.callFunction(owner1.address, info, data)
//             ).to.be.revertedWith(
//                 /^FlashLoan: could be called by DyDx solo margin only.*/
//             );
//         });
//
//         it("Should only allow flash loans with WETH, DAI, or USDC", async function () {
//             const { authorizedContract1 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             await expect(() =>
//                 authorizedContract1.executeTrade(
//                     [WBTC],
//                     poolPath1,
//                     tradeAmount1
//                 )
//             ).to.be.revertedWith(/^FlashLoan: Unsupported token.*/);
//         });
//     });
//
//     describe("Arbitrage Trading", async function () {
//         it("Should extract out value in WETH given the tokenPath, poolPath, and tradeAmount", async function () {
//             const { authorizedContract1, owner1 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             const wethContract = new ethers.Contract(WETH, erc20ABI, owner1);
//             await expect(() =>
//                 authorizedContract1.executeTrade(
//                     tokenPath1,
//                     poolPath1,
//                     tradeAmount1
//                 )
//             ).to.changeTokenBalance(
//                 wethContract,
//                 authorizedContract1,
//                 BigNumber.from("1359875966304688")
//             );
//         });
//
//         it("Should extract out value in DAI given the tokenPath, poolPath, and tradeAmount", async function () {
//             const { authorizedContract1, owner1 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             const daiContract = new ethers.Contract(DAI, erc20ABI, owner1);
//             await expect(() =>
//                 authorizedContract1.executeTrade(
//                     tokenPath2,
//                     poolPath2,
//                     tradeAmount2
//                 )
//             ).to.changeTokenBalance(
//                 daiContract,
//                 authorizedContract1,
//                 BigNumber.from("3398124985348826222")
//             );
//         });
//
//         it("Should extract out value in USDC given the tokenPath, poolPath, and tradeAmount", async function () {
//             const { authorizedContract1, owner1 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             const usdcContract = new ethers.Contract(USDC, erc20ABI, owner1);
//             await expect(() =>
//                 authorizedContract1.executeTrade(
//                     tokenPath3,
//                     poolPath3,
//                     tradeAmount3
//                 )
//             ).to.changeTokenBalance(
//                 usdcContract,
//                 authorizedContract1,
//                 BigNumber.from("2464525")
//             );
//         });
//     });
//
//     describe("Deposit and Withdrawals", async function () {
//         it("Should be able to receive ether", async function () {
//             const { authorizedContract1, owner1 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             await expect(() =>
//                 depositEther(owner1, authorizedContract1, BigNumber.from(1000))
//             ).to.changeEtherBalances(
//                 [owner1, authorizedContract1],
//                 [-1000, 1000]
//             );
//         });
//
//         it("Should let deployer withdraw ether and send equal shares to the owners", async function () {
//             const {
//                 authorizedContractDeployer,
//                 deployer,
//                 owner1,
//                 owner2,
//                 address3,
//             } = await loadFixture(deployArbitrageFixture);
//             await depositEther(
//                 address3,
//                 authorizedContractDeployer,
//                 BigNumber.from(1000)
//             );
//             await expect(() =>
//                 authorizedContractDeployer.withdraw()
//             ).to.changeEtherBalances(
//                 [deployer, owner1, owner2, authorizedContractDeployer],
//                 [250, 375, 375, -1000]
//             );
//         });
//
//         it("Should leave 1 wei inside contract if an odd balance is present after subtracting deployers cut upon withdrawal", async function () {
//             const {
//                 authorizedContractDeployer,
//                 deployer,
//                 owner1,
//                 owner2,
//                 address3,
//             } = await loadFixture(deployArbitrageFixture);
//             await depositEther(
//                 address3,
//                 authorizedContractDeployer,
//                 BigNumber.from(1001)
//             );
//             await expect(() =>
//                 authorizedContractDeployer.withdraw()
//             ).to.changeEtherBalances(
//                 [deployer, owner1, owner2, authorizedContractDeployer],
//                 [250, 375, 375, -1000]
//             );
//             const remaining = await ethers.provider.getBalance(
//                 authorizedContractDeployer.address
//             );
//             expect(remaining).to.be.equal(1);
//         });
//
//         it("Should let deployer withdraw any erc20 token and send equal shares to the owners", async function () {
//             const {
//                 authorizedContractDeployer,
//                 deployer,
//                 owner1,
//                 owner2,
//                 address3,
//             } = await loadFixture(deployArbitrageFixture);
//             await swapETHForExactERC20(address3, DAI, BigNumber.from(1000));
//             const daiContract = new ethers.Contract(DAI, erc20ABI, address3);
//             await daiContract.transfer(
//                 authorizedContractDeployer.address,
//                 1000
//             );
//             await expect(() =>
//                 authorizedContractDeployer.withdrawTokens(DAI)
//             ).to.changeTokenBalances(
//                 daiContract,
//                 [deployer, owner1, owner2, authorizedContractDeployer],
//                 [250, 375, 375, -1000]
//             );
//         });
//
//         it("Should leave 1 wei of token inside the contract if an odd balance is present after subtracting deployers cut upon withdrawal", async function () {
//             const {
//                 authorizedContractDeployer,
//                 deployer,
//                 owner1,
//                 owner2,
//                 address3,
//             } = await loadFixture(deployArbitrageFixture);
//             await swapETHForExactERC20(address3, DAI, BigNumber.from(1001));
//             const daiContract = new ethers.Contract(DAI, erc20ABI, address3);
//             await daiContract.transfer(
//                 authorizedContractDeployer.address,
//                 1001
//             );
//             await expect(() =>
//                 authorizedContractDeployer.withdrawTokens(DAI)
//             ).to.changeTokenBalances(
//                 daiContract,
//                 [deployer, owner1, owner2, authorizedContractDeployer],
//                 [250, 375, 375, -1000]
//             );
//             const remaining = await daiContract.balanceOf(
//                 authorizedContractDeployer.address
//             );
//             expect(remaining).to.be.equal(1);
//         });
//     });
//
//     describe("Events", async function () {
//         it("Should emit an Arb event when an arbitrage transaction successfully executes", async function () {
//             const { authorizedContract1, owner1 } = await loadFixture(
//                 deployArbitrageFixture
//             );
//             const wethContract = new ethers.Contract(WETH, erc20ABI, owner1);
//             await expect(() =>
//                 authorizedContract1.executeTrade(
//                     tokenPath1,
//                     poolPath1,
//                     tradeAmount1
//                 )
//             )
//                 .to.emit(authorizedContract1, "Arb")
//                 .withNamedArgs({
//                     tokenPath: tokenPath1,
//                     poolPath: poolPath1,
//                     amounts: [
//                         BigNumber.from("169485573416347419"),
//                         BigNumber.from("307165910"),
//                         BigNumber.from("3532887179602"),
//                         BigNumber.from("747605011060"),
//                         BigNumber.from("170845449382652109"),
//                     ],
//                 });
//         });
//     });
//
//     async function depositEther(
//         wallet: Signer,
//         arbitrage: Arbitrage,
//         amount: BigNumber
//     ) {
//         return new Promise(async (resolve, reject) => {
//             try {
//                 const result = await wallet.sendTransaction({
//                     to: arbitrage.address,
//                     value: amount,
//                 });
//                 resolve(result);
//             } catch (err) {
//                 reject(err);
//             }
//         });
//     }
//
//     async function swapETHForExactERC20(
//         wallet: Signer,
//         token: string,
//         amountOut: BigNumber
//     ) {
//         const router = new ethers.Contract(
//             UNISWAP_V2_ROUTER,
//             v2RouterABI,
//             wallet
//         );
//         return new Promise(async (resolve, reject) => {
//             try {
//                 const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
//                 const result = await router.swapETHForExactTokens(
//                     amountOut,
//                     [WETH, token],
//                     wallet.getAddress(),
//                     deadline,
//                     { value: BigNumber.from("1000000000000000000") }
//                 );
//                 resolve(result);
//             } catch (err) {
//                 reject(err);
//             }
//         });
//     }
// });
