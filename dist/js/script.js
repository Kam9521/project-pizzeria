
"use strict";
import Booking from "./components/Booking.js";
import { templates } from "./templates.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import { select, settings, classNames } from "./settings.js";
import AmountWidget from "./components/AmountWidget.js";
import CartProduct from "./components/CartProduct.js";
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  // Main app object
  const app = {
    // Load data source
    initData: function () {
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + "/" + settings.db.products;

      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(function (parsedResponse) {
          thisApp.data.products = parsedResponse;

          thisApp.initMenu();
        });
    },

    // Create product instances
    initMenu: function () {
      const thisApp = this;

      for (let productId in thisApp.data.products) {
        const productData = thisApp.data.products[productId];

        new Product(productData.id, productData);
      }
    },
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    // App initialization
    init: function () {
      const thisApp = this;

      thisApp.initData();
      thisApp.initCart();
      this.initBooking();
    },
    initBooking: function () {
      const thisApp = this;

      // Find booking widget wrapper
      const bookingContainer = document.querySelector(
        select.containerOf.booking,
      );

      // Init booking component
      thisApp.booking = new Booking(bookingContainer);
    },
  };

  // Start app
  app.init();
  
}

