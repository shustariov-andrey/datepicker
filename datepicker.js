/**
 * Created by andreyshustariov on 5/23/14.
 */

/*global Hammer: true*/

(function() {
   'use strict';

   /**
    *
    * @param {function} handlerTrigger function that binds datepicker's click handler to any other
    * (i. e. Hammer tap)
    *
    * @constructor
    */
   function DatePicker(handlerTrigger) {
      this._containerElement = document.getElementsByTagName('body')[0];

      this._isVisible = false;
      this._cache = {
         dateElements : []
      };

      this.onNewDateSelectedHandlers = [];

      this._initialize();
      this._setupHandlers(handlerTrigger);
   }

   DatePicker.prototype.addOnNewDateSelectedHandlers = function(handler) {
      this.onNewDateSelectedHandlers.push(handler);
   };

   DatePicker.prototype.removeOnNewDateSelectedHandler = function(handler) {
      for (var i = 0; i < this.onNewDateSelectedHandlers.length; ++i) {
         if (this.onNewDateSelectedHandlers[i] === handler) {
            this.onNewDateSelectedHandlers.splice(i, 1);
            break;
         }
      }
   };

   DatePicker.prototype._onNewDateSelected = function (date) {
      var fullDate = new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth(), date);
      for (var i = 0; i < this.onNewDateSelectedHandlers.length; ++i) {
         this.onNewDateSelectedHandlers[i](fullDate, this._originElement);
      }
   };

   DatePicker.prototype._setSelectedDate = function (date) {
      this._selectedDate = date;
      this._markSelected();
   };

   DatePicker.prototype.show = function (date, originElement) {
      this._openMonth(date);
      this._setSelectedDate(date, true);
      this._isVisible = true;
      this._originElement = originElement;
      this._cache.datePicker.style.display = 'block';
   };

   DatePicker.prototype.hide = function () {
      this._isVisible = false;
      this._cache.datePicker.style.display = 'none';
   };

   /**
    *
    * @returns {boolean} true if element is visible, false otherwise
    */
   DatePicker.prototype.isVisible = function () {
      return this._isVisible;
   };

   /**
    * Completely removes element from DOM
    */
   DatePicker.prototype.destroy = function () {
      this._containerElement.removeChild(this._cache.datePicker);
   };

   DatePicker.prototype._openMonth = function (date) {
      date = date || new Date();
      var shouldUpdateDates = false;
      if (!this._activeMonth || (this._activeMonth.getMonth() !== date.getMonth() || this._activeMonth.getFullYear() !== date.getFullYear())) {
         shouldUpdateDates = true;
      }

      this._activeMonth = date;

      if (shouldUpdateDates) {
         this._updateDates();
         this._updateMonthPager();
         this._markSelected();
      }
   };

   DatePicker.prototype._setupHandlers = function (handlerTrigger) {

      function handler(event) {
         if (event.target.classList.contains('day') &&
            event.target.parentElement.classList.contains('dates') && !event.target.classList.contains('blocked')) {

            var date = parseInt(event.target.dataset.date, 10);
            this._onNewDateSelected(date);
         } else if (event.target.classList.contains('month-name') && event.target.parentElement.classList.contains('prev-month')) {
            this._openMonth(new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth(), 0));
         } else if (event.target.classList.contains('month-name') && event.target.parentElement.classList.contains('next-month')) {
            this._openMonth(new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth() + 2, 0));
         }
      }

      if (handlerTrigger) {
         handlerTrigger(this._cache.datePicker, handler.bind(this));
      } else {
         this._cache.datePicker.addEventListener('click', handler.bind(this), false);
      }
   };

   DatePicker.prototype._updateDates = function () {
      var firstDay = new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth(), 1);
      var firstDayNumber = firstDay.getDay() - 1;
      var lastDay = new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth() + 1, 0);
      var daysInMonth = lastDay.getDate(), currentDate = 0, lastDayNumber = 0;

      for (var j = 0; j < this._cache.dateElements.length; ++j) {
         if (firstDayNumber > 0) {
            this._cache.dateElements[j].innerText = new Date(firstDay.getFullYear(), firstDay.getMonth(), -firstDayNumber + 1).getDate();
            this._cache.dateElements[j].classList.add('blocked');
            this._cache.dateElements[j].dataset.date = new Date(firstDay.getFullYear(), firstDay.getMonth(), -firstDayNumber + 1).getDate();
            --firstDayNumber;
         } else if (currentDate < daysInMonth) {
            this._cache.dateElements[j].innerText = ++currentDate;
            this._cache.dateElements[j].dataset.date = currentDate;
            this._cache.dateElements[j].classList.remove('blocked');
         } else {
            this._cache.dateElements[j].innerText = new Date(firstDay.getFullYear(), firstDay.getMonth(), ++lastDayNumber).getDate();
            this._cache.dateElements[j].classList.add('blocked');
            this._cache.dateElements[j].dataset.date = new Date(firstDay.getFullYear(), firstDay.getMonth(), lastDayNumber).getDate();
         }

      }
      this._markToday();
   };

   DatePicker.prototype._updateMonthPager = function () {
      var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "June",
         "July", "August", "Sep", "Oct", "Nov", "Dec" ];

      var prevMonth = new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth(), 0);
      var nextMonth = new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth() + 2, 0);

      this._cache.prevMonth.innerText = monthNames[prevMonth.getMonth()] + ', ' + prevMonth.getFullYear();
      this._cache.currentMonth.innerText = monthNames[this._activeMonth.getMonth()] + ', ' + this._activeMonth.getFullYear();
      this._cache.nextMonth.innerText = monthNames[nextMonth.getMonth()] + ', ' + nextMonth.getFullYear();
   };

   DatePicker.prototype._markToday = function () {
      var currentDay = new Date();

      for (var i = 0; i < this._cache.dateElements.length; ++i) {
         if (parseInt(this._cache.dateElements[i].innerText, 10) === currentDay.getDate() &&
            this._activeMonth.getMonth() === currentDay.getMonth() &&
            this._activeMonth.getFullYear() === currentDay.getFullYear() && !this._cache.dateElements[i].classList.contains('blocked')) {
            this._cache.dateElements[i].classList.add('current-day');
         } else {
            this._cache.dateElements[i].classList.remove('current-day');
         }
      }
   };

   DatePicker.prototype._markSelected = function () {
      if (this._cache.selectedElement) {
         this._cache.selectedElement.classList.remove('selected');
      }
      for (var i = 0; i < this._cache.dateElements.length; ++i) {
         if (this._selectedDate && !this._cache.dateElements[i].classList.contains('blocked') &&
            parseInt(this._cache.dateElements[i].innerText, 10) === this._selectedDate.getDate() &&
            this._activeMonth.getMonth() === this._selectedDate.getMonth() &&
            this._activeMonth.getFullYear() === this._selectedDate.getFullYear()
            ) {
            this._cache.dateElements[i].classList.add('selected');
            this._cache.selectedElement = this._cache.dateElements[i];
         }
      }
   };

   DatePicker.prototype._initialize = function () {
      var datePickerContainer = document.createElement('div');

      datePickerContainer.appendChild(this._createMonthPager());
      datePickerContainer.appendChild(this._createWeekLabels());
      datePickerContainer.appendChild(this._createDates());

      datePickerContainer.classList.add('date-picker');

      this._cache.datePicker = datePickerContainer;

      this.hide();

      this._containerElement.appendChild(datePickerContainer);
   };

   DatePicker.prototype._createMonthPager = function () {
      var monthPager = document.createElement('div');
      monthPager.classList.add('month-pager');

      var prevMonth = document.createElement('div');
      prevMonth.classList.add('prev-month');

      var prevMonthName = document.createElement('a');
      prevMonthName.classList.add('month-name');

      var nextMonth = document.createElement('div');
      nextMonth.classList.add('next-month');

      var nextMonthName = prevMonthName.cloneNode(true);

      prevMonth.appendChild(prevMonthName);
      nextMonth.appendChild(nextMonthName);

      var currentMonth = document.createElement('div');
      currentMonth.classList.add('current-month');

      this._cache.prevMonth = prevMonthName;
      this._cache.nextMonth = nextMonthName;
      this._cache.currentMonth = currentMonth;


      monthPager.appendChild(prevMonth);
      monthPager.appendChild(currentMonth);
      monthPager.appendChild(nextMonth);
      return monthPager;
   };

   DatePicker.prototype._createWeekLabels = function () {
      var weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      var weekLabelsContainer = document.createElement('div');
      weekLabelsContainer.classList.add('week');
      weekLabelsContainer.classList.add('label');
      var weekDayElementPrototype = document.createElement('div');
      weekDayElementPrototype.classList.add('day');

      weekDays.forEach(function (item) {
         var element = weekDayElementPrototype.cloneNode(true);
         element.innerText = item;
         weekLabelsContainer.appendChild(element);
      });

      return weekLabelsContainer;
   };

   DatePicker.prototype._createDates = function () {
      var weekLength = 7, weeksNumber = 5;

      var weekElementPrototype = document.createElement('div');
      weekElementPrototype.classList.add('week');
      weekElementPrototype.classList.add('dates');
      var dayElementPrototype = document.createElement('a');
      dayElementPrototype.classList.add('day');
      for (var i = 0; i < weekLength; ++i) {
         weekElementPrototype.appendChild(dayElementPrototype.cloneNode(true));
      }

      var documentFragment = document.createDocumentFragment();

      for (i = 0; i < weeksNumber; ++i) {
         var weekElement = weekElementPrototype.cloneNode(true);
         for (var j = 0; j < weekElement.childNodes.length; ++j) {
            this._cache.dateElements.push(weekElement.childNodes[j]);
         }
         documentFragment.appendChild(weekElement);
      }
      return documentFragment;
   };

   window.DatePicker = DatePicker;

}());