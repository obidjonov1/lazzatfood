"use strict";

// Cart
let cartIcon = document.querySelector("#cart-icon");
let cart = document.querySelector(".order-cart");
let closeCart = document.querySelector("#close-cart");

// Open cart
cartIcon.onclick = () => {
  // cart.classList.add("active");
  console.log("object");
};

// Close cart
closeCart.onclick = () => {
  cart.classList.remove("active");
};

// Cart working Js
if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

// Making Function
function ready() {
  var removeCartButtons = document.getElementsByClassName("trash");
  console.log(removeCartButtons);
  for (var i = 0; i < removeCartButtons.length; i++) {
    var button = removeCartButtons[i];
    button.addEventListener("click", removeCartItem);
  }
  // Quantity changes
  var quantityInputs = document.getElementsByClassName("cart-quantity");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }
  // Add To Cart
  var addCart = document.getElementsByClassName("qoshish");
  for (var i = 0; i < addCart.length; i++) {
    var button = addCart[i];
    button.addEventListener("click", addCartClicked);
    // console.log(addCart);
  }
  // Buy button work
  document
    .getElementsByClassName("btn-buy")[0]
    .addEventListener("click", buyButtonClicked);
}
// Buy button
function buyButtonClicked() {
  alert("Buyurtmangiz joylandi");
  var cartContent = document.getElementsByClassName("cart-content")[0];
  while (cartContent.hasChildNodes()) {
    cartContent.removeChild(cartContent.firstChild);
  }
  updateTotal();
}

// remove item from cart
function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.remove();
  updateTotal();
}

// Quantity changes
function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateTotal();
}
// add to cart
function addCartClicked(event) {
  var button = event.target;
  var shopProducts = button.parentElement;
  var title = shopProducts.getElementsByClassName("product-title")[0].innerText;
  var price = shopProducts.getElementsByClassName("price")[0].innerText;
  var productImg = shopProducts.getElementsByClassName("rasim")[0].src;
  addProductToCart(title, price, productImg);
  updateTotal();
}
function addProductToCart(title, price, productImg) {
  var cartShopBox = document.createElement("div");
  cartShopBox.classList.add("cart-box");
  var cartItems = document.getElementsByClassName("cart-content")[0];
  var cartItemsNames = cartItems.getElementsByClassName("cart-product__title");
  for (var i = 0; i < cartItemsNames.length; i++) {
    if (cartItemsNames[i].innerText == title) {
      alert("Mahsulot savatchaga allaqachon qo'shilgan");
      return;
    }
  }
  var cartBoxContent = `
                    <img src="${productImg}" class="cart-img">
                    <div class="detail-box">
                        <div class="cart-product__title">${title}</div>
                        <strong class="cart-price">${price}</strong>
                        <input type="number" value="1" class="cart-quantity">
                    </div>
                    <img src="./assets/images/icons/trash.svg" class="trash">`;
  cartShopBox.innerHTML = cartBoxContent;
  cartItems.append(cartShopBox);
  cartShopBox
    .getElementsByClassName("trash")[0]
    .addEventListener("click", removeCartItem);
  cartShopBox
    .getElementsByClassName("cart-quantity")[0]
    .addEventListener("change", quantityChanged);
}

// Update Total
function updateTotal() {
  var cartContent = document.getElementsByClassName("cart-content")[0];
  var cartBoxes = cartContent.getElementsByClassName("cart-box");
  var total = 0;
  for (var i = 0; i < cartBoxes.length; i++) {
    var cartBox = cartBoxes[i];
    var priceElement = cartBox.getElementsByClassName("cart-price")[0];
    var quantityElement = cartBox.getElementsByClassName("cart-quantity")[0];
    var price = parseFloat(priceElement.innerText.replace("$", ""));
    var quantity = quantityElement.value;
    total = total + price * quantity;
  }
  //  If price Contain some Cents Value
  total = Math.round(total * 100) / 100;

  document.getElementsByClassName("total-price")[0].innerText = "$" + total;
}

