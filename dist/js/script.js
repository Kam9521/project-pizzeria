 'use strict';
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  // Selectors used across the app
  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
      cartProduct: "#template-cart-product", // Handlebars template for product
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
    cart: {
      toggleTrigger: ".cart__summary",
      productList: ".cart__order-summary",
      form: ".cart__order",
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: ".widget-amount",
      price: ".cart__product-price",
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    widgets: {
      amount: {
        input: "input.amount",
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
    cart: {
      wrapperActive: "active",
    },
  };

  // App settings
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: "//localhost:3131",
      products: "products",
      orders: "orders",
    },
  };

  // Compile Handlebars template
  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
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

      
    }

    // Render product HTML and add it to the DOM
    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);

      
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
        thisProduct.addToCart();
      });
    }
    addToCart() {
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }
    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price =
        thisProduct.priceSingle * thisProduct.amountWidget.value;
      productSummary.params = thisProduct.prepareCartProductParams();

      return productSummary;
    }
    prepareCartProductParams() {
      const thisProduct = this;
      const params = {};
      const formData = utils.serializeFormToObject(thisProduct.form);

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        params[paramId] = {
          label: param.label,
          options: {},
        };

        for (let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }

      return params;
    }

    // Calculate product price based on selected options
    processOrder() {
      const thisProduct = this;

      // Convert form inputs into JS object
      const formData = utils.serializeFormToObject(thisProduct.form);
      

      // Start from base price
      let price = thisProduct.data.price;

      // Loop through all params (categories)
      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        

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

          
        }
      }
      thisProduct.priceSingle = price;
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
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(
        select.cart.phone,
      );
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
      const thisCart = this;

      // remove element from DOM
      cartProduct.dom.wrapper.remove();

      // find index in array
      const index = thisCart.products.indexOf(cartProduct);

      // remove from array
      thisCart.products.splice(index, 1);

      // update totals
      thisCart.update();
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

  // Class responsible for handling amount widget (input + buttons)
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      
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
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
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

      const event = new CustomEvent("updated", {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }
    
  }
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent("remove", {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    // Cache DOM elements for cart product
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget =
        thisCartProduct.dom.wrapper.querySelector(
          select.cartProduct.amountWidget,
        );
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.price,
      );
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.edit,
      );
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
        select.cartProduct.remove,
      );
    }
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(
        thisCartProduct.dom.amountWidget,
      );

      thisCartProduct.dom.amountWidget.addEventListener("updated", function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price =
          thisCartProduct.amount * thisCartProduct.priceSingle;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener("click", function (event) {
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener("click", function (event) {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
    getData() {
      const thisCartProduct = this;

      return {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      };
    }
  }

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
    },
  };

  // Start app
  app.init();
}
