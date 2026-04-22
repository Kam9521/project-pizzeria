 'use strict';
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
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
      document.querySelector(select.templateOf.menuProduct).innerHTML
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
      thisProduct.initAmountWidget();

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
          select.all.menuProductsActive
        );

        // Close other product if open
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        // Toggle current product
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
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
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          // Add price if selected and not default
          if (optionSelected && !option.default) {
            price += option.price;
          }

          // Subtract price if not selected but default
          if (!optionSelected && option.default) {
            price -= option.price;
          }
          // find matching image
          const optionImage = thisProduct.imageWrapper.querySelector(
            "." + paramId + "-" + optionId
          );

          // if image exists
          if (optionImage) {
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }

          console.log(optionId, option);
        }
      }
      price *= thisProduct.amountWidget.value;
      // Update price in UI
      thisProduct.priceElem.innerHTML = price;
    }

    // Cache DOM elements for faster access
    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener("updated", function () {
        thisProduct.processOrder();
      });
      
    }
    
  }
  
  // Class responsible for handling amount widget (input + buttons)
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      console.log("AmountWidget:", thisWidget, element);
      thisWidget.getElements(element);
      
      if (thisWidget.input.value) {
        thisWidget.setValue(thisWidget.input.value);
      } else {
        thisWidget.setValue(settings.amountWidget.defaultValue);
      }
      thisWidget.initActions();
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input,
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease,
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease,
      );
    }
    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      if (
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= settings.amountWidget.defaultMin &&
        newValue <= settings.amountWidget.defaultMax
      ) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }
    initActions() {
      const thisWidget = this;

      // change in input
      thisWidget.input.addEventListener("change", function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      // decrease
      thisWidget.linkDecrease.addEventListener("click", function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      // increase
      thisWidget.linkIncrease.addEventListener("click", function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;

      const event = new Event("updated");
      thisWidget.element.dispatchEvent(event);
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
