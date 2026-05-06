class BaseWidget {
  constructor(wrapper, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapper;

    thisWidget.correctValue = initialValue;

    
  }

  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    if (newValue !== thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

  renderValue() {}

  announce() {
    const thisWidget = this;

    const event = new CustomEvent("updated", {
      bubbles: true,
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }

  initActions() {}
}

export default BaseWidget;
