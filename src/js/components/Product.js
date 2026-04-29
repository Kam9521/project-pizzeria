"use strict";
import { templates } from "../templates.js";
import AmountWidget from "./AmountWidget.js";
import { select, settings, classNames } from "../settings.js";
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
      thisProduct.addToCart();
    });
  }
  addToCart() {
    const thisProduct = this;

    // Dispatch custom event with prepared cart product data
    const event = new CustomEvent("add-to-cart", {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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
          "." + paramId + "-" + optionId,
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
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper,
    );
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget,
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
export default Product;
