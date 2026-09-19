// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgriculturalSupplyChain {
    struct Product {
        uint256 id;
        string name;
        string cropType;
        string farmer;
        string origin;
        uint256 createdAt;
        bool exists;
    }

    struct Movement {
        string stage;
        string person;
        string location;
        uint256 timestamp;
    }

    uint256 private nextProductId = 1;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Movement[]) private productHistory;

    event ProductCreated(uint256 indexed productId, string name, string farmer);
    event ProductMoved(uint256 indexed productId, string stage, string person, string location);

    function createProduct(
        string memory _name,
        string memory _cropType,
        string memory _farmer,
        string memory _origin
    ) public returns (uint256) {
        uint256 productId = nextProductId;

        products[productId] = Product({
            id: productId,
            name: _name,
            cropType: _cropType,
            farmer: _farmer,
            origin: _origin,
            createdAt: block.timestamp,
            exists: true
        });

        productHistory[productId].push(
            Movement("Farm", _farmer, _origin, block.timestamp)
        );

        emit ProductCreated(productId, _name, _farmer);
        nextProductId++;
        return productId;
    }

    function addMovement(
        uint256 _productId,
        string memory _stage,
        string memory _person,
        string memory _location
    ) public {
        require(products[_productId].exists, "Product does not exist");

        productHistory[_productId].push(
            Movement(_stage, _person, _location, block.timestamp)
        );

        emit ProductMoved(_productId, _stage, _person, _location);
    }

    function getProduct(uint256 _productId)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        require(products[_productId].exists, "Product does not exist");
        Product memory p = products[_productId];

        return (p.id, p.name, p.cropType, p.farmer, p.origin, p.createdAt);
    }

    function getHistoryLength(uint256 _productId) public view returns (uint256) {
        return productHistory[_productId].length;
    }

    function getMovement(uint256 _productId, uint256 _index)
        public
        view
        returns (string memory, string memory, string memory, uint256)
    {
        Movement memory m = productHistory[_productId][_index];
        return (m.stage, m.person, m.location, m.timestamp);
    }
}
