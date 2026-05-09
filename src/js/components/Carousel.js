"use strict";

class Carousel {
  constructor(element) {
    const thisCarousel = this;

    thisCarousel.dom = {};
    thisCarousel.dom.wrapper = element;
    thisCarousel.dom.slides = element.querySelectorAll(".quote");
    thisCarousel.currentSlide = 0;

    thisCarousel.initCarousel();
  }

  initCarousel() {
    const thisCarousel = this;

    setInterval(function () {
      thisCarousel.dom.slides[thisCarousel.currentSlide].classList.remove(
        "active"
      );

      thisCarousel.currentSlide++;

      if (thisCarousel.currentSlide >= thisCarousel.dom.slides.length) {
        thisCarousel.currentSlide = 0;
      }

      thisCarousel.dom.slides[thisCarousel.currentSlide].classList.add(
        "active"
      );
    }, 3000);
  }
}

export default Carousel;
