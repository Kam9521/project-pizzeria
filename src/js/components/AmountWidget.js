"use strict";

import BaseWidget from "./BaseWidget.js";
import { select, settings } from "../settings.js";

// Class responsible for handling amount widget
class AmountWidget extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );

    thisWidget.value =
      thisWidget.dom.input.value || settings.amountWidget.defaultValue;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener("change", function () {
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener("click", function (event) {
      event.preventDefault();
      thisWidget.value = thisWidget.value - 1;
    });

    thisWidget.dom.linkIncrease.addEventListener("click", function (event) {
      event.preventDefault();
      thisWidget.value = thisWidget.value + 1;
    });
  }
}

export default AmountWidget;
