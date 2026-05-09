"use strict";

import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";
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

    // Find amount widget wrappers
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount,
    );

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount,
    );

    // Find date and hour picker wrappers
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper,
    );

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper,
    );
  }

  initWidgets() {
    const thisBooking = this;

    // Initialize people amount widget
    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount,
    );

    thisBooking.dom.peopleAmount.addEventListener("updated", function () {
      // People amount changed
    });

    // Initialize hours amount widget
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount,
    );

    thisBooking.dom.hoursAmount.addEventListener("updated", function () {
      // Hours amount changed
    });

    // Initialize date picker widget
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    // Initialize hour picker widget
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  }
}

export default Booking;
