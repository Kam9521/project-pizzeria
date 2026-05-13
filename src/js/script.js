
"use strict";

import Booking from "./components/Booking.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";
import { select, settings, classNames } from "./settings.js";
import Carousel from "./components/Carousel.js";

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
        const menuContainer = document.querySelector(select.containerOf.menu);

        new Product(productData.id, productData, menuContainer);
      }
    },

    // Initialize cart
    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    // Initialize booking
    initBooking: function () {
      const thisApp = this;

      const bookingContainer = document.querySelector(
        select.containerOf.booking
      );

      thisApp.booking = new Booking(bookingContainer);
    },
    initCarousel: function () {
      const carouselElem = document.querySelector(".js-carousel");

      this.carousel = new Carousel(carouselElem);
    },

    // Initialize page navigation
    initPages: function () {
      const thisApp = this;

      const pagesContainer = document.querySelector(select.containerOf.pages);

      if (!pagesContainer) {
        return;
      }

      thisApp.pages = pagesContainer.children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);
      thisApp.pageLinks = document.querySelectorAll('a[href^="#"]');

      const activatePage = function (pageId) {
        for (let page of thisApp.pages) {
          page.classList.toggle(classNames.pages.active, page.id == pageId);
        }

        for (let link of thisApp.navLinks) {
          link.classList.toggle(
            classNames.nav.active,
            link.getAttribute("href") == "#" + pageId
          );
        }

        window.location.hash = "#" + pageId;
      };

      const idFromHash = window.location.hash.replace("#", "") || "home";

      activatePage(idFromHash);

      for (let link of thisApp.pageLinks) {
        link.addEventListener("click", function (event) {
          const clickedElement = this;
          const id = clickedElement.getAttribute("href").replace("#", "");

          if (document.getElementById(id)) {
            event.preventDefault();
            activatePage(id);
          }
        });
      }
    },

    // App initialization
    init: function () {
      const thisApp = this;

      thisApp.initData();
      thisApp.initCart();
      thisApp.initBooking();
      thisApp.initPages();
      thisApp.initCarousel();
    }
  };

  // Start app
  app.init();
}

