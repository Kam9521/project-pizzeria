/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  // Selectors used across the app
  const select = {
    templateOf: {
      menuProduct: "#template-menu-product", // Handlebars template for product
    },
    containerOf: {
      menu: "#product-list", // container for menu products
      cart: "#cart", // container for cart
    },
    all: {
      menuProducts: "#product-list > .product",
      menuProductsActive: "#product-list > .product.active", // currently active product
      formInputs: "input, select", // all form inputs
    },
    menuProduct: {
      clickable: ".product__header", // element to trigger accordion
      form: ".product__order", // form with options
      priceElem: ".product__total-price .price", // price display element
      imageWrapper: ".product__images",
      amountWidget: ".widget-amount",
      cartButton: '[href="#add-to-cart"]', // "Add to cart" button
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  // CSS class names used in JS
  const classNames = {
    menuProduct: {
      wrapperActive: "active", // active product class
      imageVisible: "active",
    },
  };

  // App settings
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  // Compile Handlebars template
  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML,
    ),
  };

  // Product class - represents single product instance
  class Product {
    constructor(id, data) {
      const thisProduct = this;

      // Save product id and data
      thisProduct.id = id;
      thisProduct.data = data;

      // Render product in menu
      thisProduct.renderInMenu();

      // Cache DOM elements
      thisProduct.getElements();

      // Initialize behaviors
      thisProduct.initAccordion();
      thisProduct.initOrderForm();

      // Calculate initial price
      thisProduct.processOrder();

      console.log("new Product:", thisProduct);
    }

    // Render product HTML and add it to the DOM
    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);

      console.log("generatedHTML:", generatedHTML);
    }

    // Accordion logic (open/close product)
    initAccordion() {
      const thisProduct = this;

      thisProduct.accordionTrigger.addEventListener("click", function (event) {
        event.preventDefault();

        // Find currently active product
        const activeProduct = document.querySelector(
          select.all.menuProductsActive,
        );

        // Close other product if open
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        // Toggle current product
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive,
        );
      });
    }

    // Initialize form events (change, submit, click)
    initOrderForm() {
      const thisProduct = this;

      // Prevent default submit and recalculate price
      thisProduct.form.addEventListener("submit", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      // Recalculate price on input change
      for (let input of thisProduct.formInputs) {
        input.addEventListener("change", function () {
          thisProduct.processOrder();
        });
      }

      // Prevent link behavior and recalculate price
      thisProduct.cartButton.addEventListener("click", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    // Calculate product price based on selected options
    processOrder() {
      const thisProduct = this;

      // Convert form inputs into JS object
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log("formData", formData);

      // Start from base price
      let price = thisProduct.data.price;

      // Loop through all params (categories)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        // Loop through options in each category
        for (let optionId in param.options) {
          const option = param.options[optionId];

          // Check if option is selected
          const isSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          // Add price if selected and not default
          if (isSelected && !option.default) {
            price += option.price;
          }

          // Subtract price if not selected but default
          if (!isSelected && option.default) {
            price -= option.price;
          }

          console.log(optionId, option);
        }
      }

      // Update price in UI
      thisProduct.priceElem.innerHTML = price;
    }

    // Cache DOM elements for faster access
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable,
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form,
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs,
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton,
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem,
      );
    }
  }

  // Main app object
  const app = {
    // Load data source
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

    // Create product instances
    initMenu: function () {
      const thisApp = this;
      console.log("thisApp.data:", thisApp.data);

      for (let productId in thisApp.data.products) {
        const productData = thisApp.data.products[productId];

        new Product(productId, productData);
      }
    },

    // App initialization
    init: function () {
      const thisApp = this;

      console.log("*** App starting ***");
      console.log("thisApp:", thisApp);
      console.log("classNames:", classNames);
      console.log("settings:", settings);
      console.log("templates:", templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  // Start app
  app.init();
}
