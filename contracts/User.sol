pragma solidity ^0.5.0;

interface User {
    // User registeration
    function register() external returns(uint256);
    // Check user information
    function checkId(uint256) external view returns(address) ;
    // Check user existence
    function doesExist(address) external view returns(bool);
    // Receive authenticity report
    function reportAuthenticity(uint256, bool) external;
    // Force the user to exit
    function forceExit(uint256) external;
    // User self exit
    function selfExit(uint256) external;
}