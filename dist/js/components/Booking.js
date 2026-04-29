"use strict";

import AmountWidget from "./AmountWidget.js";
import { select } from "../settings.js";
import { templates } from "../templates.js";

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }

  render(element) {
    const thisBooking = this;

    // Generate booking widget HTML
    const generatedHTML = templates.bookingWidget();

    // Save DOM references
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    // Render booking widget inside wrapper
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    // Find amount widgets
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount,
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount,
    );
  }

  initWidgets() {
    const thisBooking = this;

    // Init people amount widget
    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount,
    );
    thisBooking.dom.peopleAmount.addEventListener("updated", function () {
      // People amount changed
    });

    // Init hours amount widget
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount,
    );
    thisBooking.dom.hoursAmount.addEventListener("updated", function () {
      // Hours amount changed
    });
  }
}

export default Booking;
