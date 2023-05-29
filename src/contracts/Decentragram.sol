// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Decentragram {
  string public name="Decentragram";

  // store image
  uint public imageCount=0;
  mapping(uint=>Image) public images;

  struct Image{
    uint id;
    string hash;
    string description;
    uint tipAmount;
    address payable author;
  }

  event ImageCreated(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );

   event ImageTipped(
    uint id,
    string hash,
    string description,
    uint tipAmount,
    address payable author
  );


  // create image
  function uploadImage(string memory _imgHash, string memory _imgdescription) public{
    // Make sure the img hash is exist
    require(bytes(_imgHash).length>0);

    // make sure img description is exist
    require(bytes(_imgdescription).length>0);

    // make sure uploader address exist
    require(msg.sender!=payable(0x0));

    // increament img id
    imageCount++;

    // add img to contract
    images[imageCount]=Image(imageCount,_imgHash,_imgdescription,0,payable(msg.sender));

    // Trigger an event
    emit ImageCreated(imageCount,_imgHash,_imgdescription,0, payable(msg.sender));

  }

  // tipAmount
  function tipImageOwner(uint _id) public payable{
    // make sure id is  valid
    require(_id>0 && _id<=imageCount);
    // Fetch the image
    Image memory _image=images[_id];

    // Fetch author
    address payable _author=_image.author;

    // pay the author by sending them ether
    payable(_author).transfer(msg.value);

    // Increment the tip amount
    _image.tipAmount=_image.tipAmount + msg.value;

    // update the image
    images[_id]=_image;

    // Trigger an event
    emit ImageTipped(_id, _image.hash, _image.description,_image.tipAmount, _author);
  }
}