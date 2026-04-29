"use strict";
import { select } from "./settings.js";
// Compile Handlebars template
export const templates = {
  menuProduct: Handlebars.compile(
    document.querySelector(select.templateOf.menuProduct).innerHTML,
  ),
  cartProduct: Handlebars.compile(
    document.querySelector(select.templateOf.cartProduct).innerHTML,
  ),
  bookingWidget: Handlebars.compile(
    document.querySelector(select.templateOf.bookingWidget).innerHTML,
  ),
};
