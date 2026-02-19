const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NuvyraHubMarketplace", function () {
  async function deploy() {
    const [owner, creator, buyer, fee] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("NuvyraHubMarketplace");
    const market = await Factory.deploy(owner.address, fee.address);
    await market.waitForDeployment();
    return { market, owner, creator, buyer, fee };
  }

  it("lists a model and mints license on acquire", async function () {
    const { market, creator, buyer, fee } = await deploy();
    const price = ethers.parseEther("0.48");

    await expect(
      market
        .connect(creator)
        .listModel("visionforge-pro", "ipfs://meta", price, 500),
    )
      .to.emit(market, "ModelListed")
      .withArgs(1n, creator.address, "visionforge-pro", price, "ipfs://meta");

    const tokenId = await market.getTokenIdBySlug("visionforge-pro");
    expect(tokenId).to.equal(1n);

    const feeBefore = await ethers.provider.getBalance(fee.address);
    const creatorBefore = await ethers.provider.getBalance(creator.address);

    await expect(market.connect(buyer).acquireLicense(tokenId, { value: price }))
      .to.emit(market, "LicenseAcquired");

    expect(await market.balanceOf(buyer.address, tokenId)).to.equal(1n);
    expect(await market.hasLicense(tokenId, buyer.address)).to.equal(true);

    const feeAfter = await ethers.provider.getBalance(fee.address);
    const creatorAfter = await ethers.provider.getBalance(creator.address);
    const expectedFee = (price * 250n) / 10_000n;
    expect(feeAfter - feeBefore).to.equal(expectedFee);
    expect(creatorAfter - creatorBefore).to.equal(price - expectedFee);
  });

  it("rejects incorrect payment and duplicate license", async function () {
    const { market, creator, buyer } = await deploy();
    const price = ethers.parseEther("0.1");
    await market.connect(creator).listModel("m1", "ipfs://m1", price, 0);
    await expect(
      market.connect(buyer).acquireLicense(1, { value: ethers.parseEther("0.05") }),
    ).to.be.revertedWithCustomError(market, "IncorrectPayment");

    await market.connect(buyer).acquireLicense(1, { value: price });
    await expect(
      market.connect(buyer).acquireLicense(1, { value: price }),
    ).to.be.revertedWithCustomError(market, "AlreadyLicensed");
  });
});
