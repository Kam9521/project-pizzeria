// Selectors used across the app
export const select = {
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
 // App settings
  export const settings = {
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
   // CSS class names used in JS
  export const classNames = {
    menuProduct: {
      wrapperActive: "active", // active product class
      imageVisible: "active",
    },
    cart: {
      wrapperActive: "active",
    },
  };
