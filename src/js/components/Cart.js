"use strict";

import CartProduct from "./CartProduct.js";
import { select, settings, classNames } from "../settings.js";
// Class responsible for handling cart logic
class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger,
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList,
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelectorAll(
      ".cart__order-price-sum",
    )[1];

    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelectorAll(
      ".cart__order-price-sum",
    )[0];

    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      ".cart__order-price-sum",
    )[2];

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      ".cart__total-number",
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address,
    );
  }
  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener("click", function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener("updated", function () {
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener("remove", function (event) {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener("submit", function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    // Create new cart product instance and save it in cart products array
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update() {
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;

    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let product of thisCart.products) {
      totalNumber += product.amount;
      subtotalPrice += product.price;
    }
    thisCart.totalNumber = totalNumber;
    thisCart.subtotalPrice = subtotalPrice;

    if (totalNumber === 0) {
      thisCart.totalPrice = 0;
    } else {
      thisCart.totalPrice = subtotalPrice + deliveryFee;
    }

    thisCart.dom.deliveryFee.innerHTML = totalNumber > 0 ? deliveryFee : 0;

    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

    thisCart.dom.totalNumber.innerHTML = totalNumber;
  }
  remove(cartProduct) {
    cartProduct.dom.wrapper.remove();

    const index = this.products.indexOf(cartProduct);

    if (index !== -1) {
      this.products.splice(index, 1);
    }

    this.update();
  }
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + "/" + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: settings.cart.defaultDeliveryFee,
      products: [],
    };

    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }
}
export default Cart;
