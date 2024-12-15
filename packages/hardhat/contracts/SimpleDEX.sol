//SPDX-License-Identifier: MIT

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol


// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

pragma solidity ^0.8.22;

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)


/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol


// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)



/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
//SPDX-License-Identifier MIT
// File: contracts/SimpleDEX.sol

import "hardhat/console.sol";

contract SimpleDEX is Ownable{
    IERC20 tokenA;
    IERC20 tokenB;

    uint256 totalAmountTokenA;
    uint256 totalAmountTokenB;

    event LiquidityAdded (address liquidityProvider, uint256 amountTokenA, uint256 amountTokenB);
    event LiquidityRemoved (address liquidityProvider, uint256 amountTokenA, uint256 amountTokenB);
    event SwappedAforB (address trader, uint256 amountTokenA, uint256 amountTokenB);
    event SwappedBforA (address trader, uint256 amountTokenB, uint256 amountTokenA);

    constructor (address _tokenA, address _tokenB) Ownable(msg.sender){
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);

        totalAmountTokenA = 0;
        totalAmountTokenB = 0;
    }

    modifier poolLiquidityHasTokens ()
    {
        require (totalAmountTokenA > 0 && totalAmountTokenB > 0, "No hay tokens en el pool de liquidez");
        _;
    }

    function swapAforB(uint256 amountAIn) public poolLiquidityHasTokens{

        require (amountAIn <= tokenA.allowance(msg.sender,address(this)), "El contrato no tiene permitido transferirse a si mismo esa cantidad de token A");

        uint256 amountBOut = totalAmountTokenB - ((totalAmountTokenA * totalAmountTokenB) / (totalAmountTokenA + amountAIn));

        //Actualizo los totales del pool de liquidez
        totalAmountTokenA += amountAIn;
        totalAmountTokenB -= amountBOut;

        require(tokenA.transferFrom(msg.sender, address(this), amountAIn), "Error al transferir tokens A");
        require(tokenB.transfer(msg.sender, amountBOut), "Error al transferir tokens B");

        emit SwappedAforB(msg.sender, amountAIn, amountBOut);
    }

    function swapBforA(uint256 amountBIn) public poolLiquidityHasTokens{

        require(amountBIn <= tokenB.allowance(msg.sender,address(this)), "El contrato no tiene permitido transferirse a si mismo esa cantidad de token B");

        uint256 amountAOut = totalAmountTokenA - (totalAmountTokenA * totalAmountTokenB) / (totalAmountTokenB + amountBIn);

        //Actualizo los totales del pool de liquidez
        totalAmountTokenA -= amountAOut;
        totalAmountTokenB += amountBIn;
        
        require(tokenB.transferFrom(msg.sender, address(this), amountBIn), "Error al transferir tokens B");
        require(tokenA.transfer(msg.sender, amountAOut), "Error al transferir tokens A");

        emit SwappedBforA(msg.sender, amountBIn, amountAOut);
    }

    function getPrice(address _token) public poolLiquidityHasTokens view returns (uint256) {
        require (_token == address(tokenA) || _token == address(tokenB), "Address del token no valido");

        if (_token == address(tokenA))
        {
            return totalAmountTokenB * 10e18/ totalAmountTokenA;
        }
        else
        {
            return totalAmountTokenA * 10e18/ totalAmountTokenB;
        }

    }
    
    function addLiquidity (uint256 amountA, uint256 amountB) external onlyOwner{

        //Verifico que el contrato tenga permitido transferirse a si mismo el monto.
        require(amountA <= tokenA.allowance(msg.sender,address(this)), "El contrato no tiene permitido transferirse a si mismo esa cantidad de token A");
        require(amountB <= tokenB.allowance(msg.sender,address(this)), "El contrato no tiene permitido transferirse a si mismo esa cantidad de token B");

        //Actualizo los totales del pool de liquidez
        totalAmountTokenA += amountA;
        totalAmountTokenB += amountB;

        //Transferencia de tokens del proveedor de liquidez al contrato
        require(tokenA.transferFrom(msg.sender, address(this), amountA), "Error al agregar token A al pool de liquidez");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "Error al agregar token B al pool de liquidez");

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) external onlyOwner{
        require( amountA <= totalAmountTokenA , "No se puede quitar una cantidad de Token A mayor al total disponible");
        require( amountB <= totalAmountTokenB, "No se puede quitar una cantidad de Token B mayor al total disponible");
        
        //Actualizo los totales del pool de liquidez
        totalAmountTokenA -= amountA;
        totalAmountTokenB -= amountB;

        //Transferencia de tokens del contrato al proveedor de liquidez   
        if (amountA > 0)
        {
            require(tokenA.transfer(msg.sender, amountA), "Error al agregar token A al pool de liquidez");
        }
        
        if (amountB > 0)
        {
            require(tokenB.transfer(msg.sender, amountB), "Error al agregar token B al pool de liquidez");
        }
        

        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

}