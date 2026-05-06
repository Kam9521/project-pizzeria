import BaseWidget from '../components/BaseWidget.js';
import {select, settings} from '../settings.js';
import utils from "../functions.js";

class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin(){
    const thisWidget = this;
    // eslint-disable-next-line no-undef
$(thisWidget.dom.input).rangeslider({
  polyfill: false,
  onSlide: function(position, value) {
    thisWidget.value = value;
  },
});
  }

  parseValue(value){
    return utils.numberToHour(value);
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;
