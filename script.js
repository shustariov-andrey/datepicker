/**
 * Created by andreyshustariov on 5/23/14.
 */

function DatePicker(elementId, date) {
   this._element = document.getElementById(elementId);
   this._isVisible = false;
   this._cache = {
      dateElements : []
   };
   this._initialize();
   this._setupHandlers();

   date = date || new Date();

   this._openMonth(date);
   this.setSelectedDate(date);
}

DatePicker.prototype.setSelectedDate = function(date) {
   this._selectedDate = date;
   console.log('New date', this._selectedDate);
   this._markSelected();
};

DatePicker.prototype.show = function() {
   this._isVisible = true;
   this._element.style.display = 'block !important';
};

DatePicker.prototype.hide = function() {
   this._isVisible = false;
   this._element.style.display = 'hide !important';
};

DatePicker.prototype.isVisible = function() {
   return this._isVisible;
};

DatePicker.prototype._openMonth = function(date) {
   var shouldUpdateDates = false;
   if (!this._activeMonth || (this._activeMonth.getMonth() !== date.getMonth())) {
      shouldUpdateDates = true;
   }

   this._activeMonth = date;

   if (shouldUpdateDates) {
      this._updateDates();
      this._updateMonthPager();
      this._markSelected();
   }
};

DatePicker.prototype._setupHandlers = function() {
   this._element.addEventListener('click', function(event) {
      if (event.target.classList.contains('day') &&
         event.target.parentElement.classList.contains('dates') &&
         !event.target.classList.contains('blocked')) {

         var date = parseInt(event.target.dataset.date, 10);
         this.setSelectedDate(new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth(), date));
      } else if (event.target.classList.contains('month-name') && event.target.parentElement.classList.contains('prev-month')) {
         this._openMonth(new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth(), 0));
      } else if (event.target.classList.contains('month-name') && event.target.parentElement.classList.contains('next-month')) {
         this._openMonth(new Date(this._activeMonth.getFullYear(), this._activeMonth.getMonth() + 2, 0));
      }
   }.bind(this), false);
};

DatePicker.prototype._updateDates = function() {
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
         this._cache.dateElements[j].dataset.date = new Date(firstDay.getFullYear(), firstDay.getMonth(), ++lastDayNumber).getDate();
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

DatePicker.prototype._markToday = function() {
   var currentDay = new Date();

   for (var i = 0; i < this._cache.dateElements.length; ++i) {
      if (parseInt(this._cache.dateElements[i].innerText, 10) === currentDay.getDate() &&
         this._activeMonth.getMonth() === currentDay.getMonth() &&
         this._activeMonth.getFullYear() === currentDay.getFullYear() &&
         !this._cache.dateElements[i].classList.contains('blocked')) {
         this._cache.dateElements[i].classList.add('current-day');
      } else {
         this._cache.dateElements[i].classList.remove('current-day');
      }
   }
};

DatePicker.prototype._markSelected = function() {
   for (var i = 0; i < this._cache.dateElements.length; ++i) {
      if (this._selectedDate && !this._cache.dateElements[i].classList.contains('blocked') &&
         parseInt(this._cache.dateElements[i].innerText, 10) === this._selectedDate.getDate() &&
         this._activeMonth.getMonth() === this._selectedDate.getMonth() &&
         this._activeMonth.getFullYear() === this._selectedDate.getFullYear()
      ) {
         this._cache.dateElements[i].classList.add('selected');
      } else {
         this._cache.dateElements[i].classList.remove('selected');
      }
   }
};

DatePicker.prototype._initialize = function() {
   var datePickerContainer = document.createElement('div');

   datePickerContainer.appendChild(this._createMonthPager());
   datePickerContainer.appendChild(this._createWeekLabels());
   datePickerContainer.appendChild(this._createDates());

   datePickerContainer.classList.add('date-picker');

   this.hide();

   this._element.appendChild(datePickerContainer);
};

DatePicker.prototype._createMonthPager = function() {
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

DatePicker.prototype._createWeekLabels = function() {
   var weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

   var weekLabelsContainer = document.createElement('div');
   weekLabelsContainer.classList.add('week');
   weekLabelsContainer.classList.add('label');
   var weekDayElementPrototype = document.createElement('div');
   weekDayElementPrototype.classList.add('day');

   weekDays.forEach(function(item) {
      var element = weekDayElementPrototype.cloneNode(true);
      element.innerText = item;
      weekLabelsContainer.appendChild(element);
   });

   return weekLabelsContainer;
};

DatePicker.prototype._createDates = function() {
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

   for(i = 0; i < weeksNumber; ++i) {
      var weekElement = weekElementPrototype.cloneNode(true);
      for (var j = 0; j < weekElement.childNodes.length; ++j) {
         this._cache.dateElements.push(weekElement.childNodes[j]);
      }
      documentFragment.appendChild(weekElement);
   }
   return documentFragment;
};