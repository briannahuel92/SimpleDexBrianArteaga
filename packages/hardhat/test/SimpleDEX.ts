import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";
  
  describe("SimpleDEX", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployDefaultFixture() 
    {
      // Contracts are deployed using the first signer/account by default
      const [owner, otherAccount] = await hre.ethers.getSigners();
  
      const TokenA = await hre.ethers.getContractFactory("TokenA");
      const tokenA = await TokenA.deploy(owner);
  
      const TokenB = await hre.ethers.getContractFactory("TokenB");
      const tokenB = await TokenB.deploy(owner);

      const SimpleDEX = await hre.ethers.getContractFactory("SimpleDEX");
      const simpleDEX = await SimpleDEX.connect(owner).deploy(tokenA,tokenB);

      return { simpleDEX, tokenA, tokenB , owner, otherAccount };
    }

    describe("Deployment", function ()
    {
      it("Should be the token A liquidity pool in zero", async function () 
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);
  
        expect(await tokenA.balanceOf(simpleDEX)).to.equal(0);
      });
  
      it("Should be the token B liquidity pool in zero", async function () 
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);
  
        expect(await tokenB.balanceOf(simpleDEX)).to.equal(0);
      });
    });

    describe("addLiquidity", function () 
    {
      it("Should be revert if is not the owner who call this function", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await expect(simpleDEX.connect(otherAccount).addLiquidity(1000,1000)).to.be.revertedWithCustomError(simpleDEX,"OwnableUnauthorizedAccount");
      });

      it("Should be revert if the owner didn't approve the necesary amount of token A", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        tokenA.connect(owner).approve(simpleDEX,500);
        tokenB.connect(owner).approve(simpleDEX,1500);
        
        await expect(simpleDEX.connect(owner).addLiquidity(1000,1000)).to.be.revertedWith("El contrato no tiene permitido transferirse a si mismo esa cantidad de token A");
      });

      it("Should be revert if the owner didn't approve the necesary amount of token B", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1500);
        await tokenB.connect(owner).approve(simpleDEX,600);

        await expect(simpleDEX.connect(owner).addLiquidity(1000,1000)).to.be.revertedWith("El contrato no tiene permitido transferirse a si mismo esa cantidad de token B");
      });

      it("The contract's tokens A and B balances have to equal to the liquidity added for token A and B", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        await simpleDEX.connect(owner).addLiquidity(1000,1000)
        
        expect (await tokenA.balanceOf(simpleDEX)).to.equal(1000);
        expect (await tokenB.balanceOf(simpleDEX)).to.equal(1000);
      });

      it("Should emit event LiquidityAdded", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await expect (simpleDEX.connect(owner).addLiquidity(1000,1000)).to.emit(simpleDEX,"LiquidityAdded").withArgs(owner.address, 1000, 1000);

      });
    });

    describe("removeLiquidity", function ()
    {
      it("Should be revert if is not the owner who call this function", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await expect(simpleDEX.connect(otherAccount).removeLiquidity(1000,1000)).to.be.revertedWithCustomError(simpleDEX,"OwnableUnauthorizedAccount");
      });

      it("Should be revert if the owner remove a amount of token A higher than the amount he added", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await expect(simpleDEX.connect(owner).removeLiquidity(1000,0)).to.be.revertedWith("No se puede quitar una cantidad de Token A mayor al total disponible");
      });

      it("Should be revert if the owner remove a amount of token B higher than the amount he added", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

         await expect(simpleDEX.connect(owner).removeLiquidity(0,1000)).to.be.revertedWith("No se puede quitar una cantidad de Token B mayor al total disponible");
      });

      it("Should remove the amount of both tokens", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);
  
        await simpleDEX.connect(owner).removeLiquidity(700,1000);
  
             
        expect (await tokenA.balanceOf(simpleDEX)).to.equal(300);
        expect (await tokenB.balanceOf(simpleDEX)).to.equal(0);
      });

      it("Should emit event LiquidityRemoved", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);
        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);
  
        await expect(simpleDEX.connect(owner).removeLiquidity(1000,1000)).to.emit(simpleDEX,"LiquidityRemoved").withArgs(owner.address, 1000, 1000);

      });
    });
    

    describe("swapAforB", function ()
    {
      it("Should be revert if there aren't tokens in the pool liquidity", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);

        await expect(simpleDEX.connect(owner).swapAforB(1000)).to.be.revertedWith("No hay tokens en el pool de liquidez");

      });

      it("Should be revert if the caller of this function didn't approve the amount of token A to be exchanged", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);

        await tokenA.connect(owner).approve(simpleDEX,1000);

        await expect(simpleDEX.connect(owner).swapAforB(1300)).to.be.revertedWith("El contrato no tiene permitido transferirse a si mismo esa cantidad de token A");

      });

      it("Should made the exchange if the caller had approve the amount of token A to be exchanged", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);

        await tokenA.connect(owner).approve(simpleDEX,1000);

        let balanceCallerTkA = await tokenA.balanceOf(owner);
        let balanceContractTkA  = await tokenA.balanceOf(simpleDEX);
        let balanceCallerTkB = await tokenB.balanceOf(owner);
        let balanceContractTkB  = await tokenB.balanceOf(simpleDEX);

        await simpleDEX.connect(owner).swapAforB(1000);

        let balanceCallerTkBnew = (await tokenB.balanceOf(owner)) - balanceCallerTkB;

        expect(await tokenA.balanceOf(owner)).to.equal(balanceCallerTkA - 1000n);
        expect(await tokenA.balanceOf(simpleDEX)).to.equal(balanceContractTkA + 1000n);
        expect(await tokenB.balanceOf(owner)).to.equal(balanceCallerTkB + balanceCallerTkBnew);
        expect(await tokenB.balanceOf(simpleDEX)).to.equal(balanceContractTkB - balanceCallerTkBnew);
      });

      it("Should emit event SwappedAforB", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);
        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);

        await tokenA.connect(owner).approve(simpleDEX,1000);

        await expect (simpleDEX.connect(owner).swapAforB(1000)).to.emit(simpleDEX,"SwappedAforB");

      });

    });
    
    describe("swapBforA", function ()
    {

      it("Should be revert if there aren't tokens in the pool liquidity", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);

        await expect(simpleDEX.connect(owner).swapBforA(1000)).to.be.revertedWith("No hay tokens en el pool de liquidez");

      });

      it("Should be revert if the caller of this function didn't approve the amount of token B to be exchanged", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        
        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);
        
        await tokenB.connect(owner).approve(simpleDEX,1000);

        await expect(simpleDEX.connect(owner).swapBforA(1300)).to.be.revertedWith("El contrato no tiene permitido transferirse a si mismo esa cantidad de token B");

      });



      it("Should made the exchange if the caller had approve the amount of token B to be exchanged", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);

        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);

        await tokenB.connect(owner).approve(simpleDEX,1000);

        let balanceCallerTkA = await tokenA.balanceOf(owner);
        let balanceContractTkA  = await tokenA.balanceOf(simpleDEX);
        let balanceCallerTkB = await tokenB.balanceOf(owner);
        let balanceContractTkB  = await tokenB.balanceOf(simpleDEX);

        await simpleDEX.connect(owner).swapBforA(1000);

        let balanceCallerTkAnew = (await tokenA.balanceOf(owner)) - balanceCallerTkA;

        expect(await tokenB.balanceOf(owner)).to.equal(balanceCallerTkB - 1000n);
        expect(await tokenB.balanceOf(simpleDEX)).to.equal(balanceContractTkB + 1000n);
        expect(await tokenA.balanceOf(owner)).to.equal(balanceCallerTkA + balanceCallerTkAnew);
        expect(await tokenA.balanceOf(simpleDEX)).to.equal(balanceContractTkA - balanceCallerTkAnew);
      });

      it("Should emit event SwappedBforA", async function ()
      {
        const { simpleDEX, tokenA, tokenB , owner, otherAccount } = await loadFixture(deployDefaultFixture);
        await tokenA.connect(owner).approve(simpleDEX,1000);
        await tokenB.connect(owner).approve(simpleDEX,1000);
        
        await simpleDEX.connect(owner).addLiquidity(1000,1000);

        await tokenB.connect(owner).approve(simpleDEX,1000);

        await expect (simpleDEX.connect(owner).swapBforA(1000)).to.emit(simpleDEX,"SwappedBforA");

      });

    });


  });
