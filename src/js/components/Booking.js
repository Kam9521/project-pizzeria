"use strict";

import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";
import { select, settings, classNames } from "../settings.js";
import { templates } from "../templates.js";
import utils from "../functions.js";

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.initTables();
    thisBooking.getData();
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
      select.booking.peopleAmount
    );

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );

    // Find date and hour picker wrappers
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );

    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(
      select.booking.form
    );
  }

  initWidgets() {
    const thisBooking = this;

    // Initialize people amount widget
    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );

    thisBooking.dom.peopleAmount.addEventListener("updated", function () {
      // People amount changed
    });

    // Initialize hours amount widget
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );

    thisBooking.dom.hoursAmount.addEventListener("updated", function () {
      // Hours amount changed
    });

    // Initialize date picker widget
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

    // Initialize hour picker widget
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    // Update tables when date changes
    thisBooking.dom.datePicker.addEventListener("updated", function () {
      thisBooking.updateDOM();
    });

    // Update tables when hour changes
    thisBooking.dom.hourPicker.addEventListener("updated", function () {
      thisBooking.updateDOM();
    });
  }
  initTables() {
    const thisBooking = this;

    thisBooking.dom.wrapper
      .querySelector(select.booking.tables)
      .parentNode.addEventListener("click", function (event) {
        const clickedElement = event.target;

        if (
          clickedElement.classList.contains("table") &&
          !clickedElement.classList.contains(classNames.booking.tableBooked)
        ) {
          const tableId = parseInt(
            clickedElement.getAttribute(settings.booking.tableIdAttribute)
          );

          if (thisBooking.selectedTable === tableId) {
            thisBooking.selectedTable = null;
            clickedElement.classList.remove(classNames.booking.tableSelected);
          } else {
            for (let table of thisBooking.dom.tables) {
              table.classList.remove(classNames.booking.tableSelected);
            }

            thisBooking.selectedTable = tableId;
            clickedElement.classList.add(classNames.booking.tableSelected);
          }
        }
      });

    thisBooking.dom.form.addEventListener("submit", function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  getData() {
    const thisBooking = this;

    const startDate = utils.dateToStr(new Date());
    const endDate = utils.dateToStr(
      utils.addDays(new Date(), settings.datePicker.maxDaysInFuture)
    );

    const url =
      settings.db.url +
      "/" +
      settings.db.bookings +
      "?" +
      settings.db.dateStartParamKey +
      "=" +
      startDate +
      "&" +
      settings.db.dateEndParamKey +
      "=" +
      endDate;

    const eventsUrl =
      settings.db.url +
      "/" +
      settings.db.events +
      "?" +
      settings.db.dateStartParamKey +
      "=" +
      startDate +
      "&" +
      settings.db.dateEndParamKey +
      "=" +
      endDate +
      "&" +
      settings.db.notRepeatParam;

    Promise.all([fetch(url), fetch(eventsUrl)])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsResponse = allResponses[1];

        return Promise.all([bookingsResponse.json(), eventsResponse.json()]);
      })
      .then(function ([bookings, events]) {
        console.log("BOOKINGS:", bookings);
        console.log("EVENTS:", events);

        thisBooking.parseData(bookings, events);
      });
  }
  parseData(bookings, events) {
    const thisBooking = this;

    thisBooking.booked = {};

    // bookings
    for (let item of bookings) {
      thisBooking.makeBooked(
        item.date,
        utils.hourToNumber(item.hour),
        item.duration,
        item.table
      );
    }

    // events (non-repeating)
    for (let item of events) {
      thisBooking.makeBooked(
        item.date,
        utils.hourToNumber(item.hour),
        item.duration,
        item.table
      );
    }

    console.log("BOOKED STRUCTURE:", thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (!thisBooking.booked[date]) {
      thisBooking.booked[date] = {};
    }

    for (let hourBlock = hour; hourBlock < hour + duration; hourBlock++) {
      const hourStr = utils.numberToHour(hourBlock);

      if (!thisBooking.booked[date][hourStr]) {
        thisBooking.booked[date][hourStr] = [];
      }

      thisBooking.booked[date][hourStr].push(table);
    }
  }
  updateDOM() {
    const thisBooking = this;

    const selectedDate = thisBooking.datePicker.value;
    const selectedHour = thisBooking.hourPicker.value;

    for (let table of thisBooking.dom.tables) {
      const tableId = table.getAttribute(settings.booking.tableIdAttribute);

      table.classList.remove(classNames.booking.tableBooked);

      if (
        thisBooking.booked[selectedDate] &&
        thisBooking.booked[selectedDate][selectedHour] &&
        thisBooking.booked[selectedDate][selectedHour].includes(
          parseInt(tableId)
        )
      ) {
        table.classList.add(classNames.booking.tableBooked);
      }
    }
  }
  sendBooking() {
    const thisBooking = this;

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.form.querySelector('[name="phone"]').value,
      address: thisBooking.dom.form.querySelector('[name="address"]').value,
    };

    // get starters (checkboxes)
    const startersInputs = thisBooking.dom.form.querySelectorAll(
      '[name="starter"]:checked'
    );

    for (let input of startersInputs) {
      payload.starters.push(input.value);
    }

    fetch(settings.db.url + "/" + settings.db.bookings, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    }).then(function () {
      // update local data (no refresh needed)
      thisBooking.makeBooked(
        payload.date,
        utils.hourToNumber(payload.hour),
        payload.duration,
        payload.table
      );

      thisBooking.updateDOM();
    });

    console.log("SEND BOOKING:", payload);
  }
}

export default Booking;
