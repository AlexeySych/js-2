//HELPER FUNCTIONS

function capitalize(string) {
    var letters = string.toLowerCase().split('');
    letters[0] = letters[0].toUpperCase();
    return letters.join('');
}

function justify(string, length) {
    return string + Array.apply(null, Array(length - string.length))
                         .map(function() {return ' '})
                         .join('');
}





// ERROR MESSAGES

var ERROR_UNKNOWN_MENU_ITEM = 'There\'s no such item on the menu.';
var ERROR_CLOSED_ORDER = 'The order was closed. You can\'t edit it anymore.';
var ERROR_UNKNOWN_PORTION = 'Undefined portion size';





/**
 * Class representing a basic menu item.
 * @constructor
 * @param {{title: string, price: number, calories: number}} params - Object containing title, price and calories of the item.
 */

function MenuItem(params) {
  this.title = params.title;
  this.price = params.price;
  this.calories = params.calories;
}

MenuItem.prototype.toString = function() {
    return this.title;
}





/**
 * Class representing a drink.
 * @constructor
 * @extends MenuItem
 * @param {string} type - Type of a drink
 */

function Drink(type) {
    if (!Drink.hasOwnProperty(type.toUpperCase())) {
        throw new Error(ERROR_UNKNOWN_MENU_ITEM);
    }

    MenuItem.call(this, Drink[type.toUpperCase()]);
}

Drink.COLA = {title: 'Cola', price: 50, calories: 40};
Drink.COFFEE = {title: 'Coffee', price: 80, calories: 20};

Drink.prototype = Object.create(MenuItem.prototype);
Drink.prototype.constructor = Drink;





/**
 * Class representing a salad.
 * @constructor
 * @extends MenuItem
 * @param {string} type - Type of a salad 
 * @param {number} portion - Portion size in gramms
 */

function Salad(type, portion) {
    if (!Salad.hasOwnProperty(type.toUpperCase())) {
        throw new Error(ERROR_UNKNOWN_MENU_ITEM);
    }
    if (!portion) {
        throw new Error(ERROR_UNKNOWN_PORTION);
    }

    MenuItem.call(this, Salad[type.toUpperCase()]);
    this.portion = portion;
}

Salad.CAESAR = {title: 'Caesar', price: 100, calories: 20};
Salad.OLIVIER = {title: 'Olivier', price: 50, calories: 80};

Salad.prototype = Object.create(MenuItem.prototype);
Salad.prototype.constructor = Salad;

/**
 * @returns {number} Returns the total price of the portion
 */
Salad.prototype.calculatePrice = function() {
    return this.price * this.portion / 100;
}

/**
 * @returns {number} Returns the total calories of the portion
 */
Salad.prototype.calculateCalories = function() {
    return this.calories * this.portion / 100;
}

Salad.prototype.toString = function() {
    return this.title + ' salad';
}





/**
 * Class representing a hamburger.
 * @extends MenuItem
 * @param {string} size - Size of a hamburger 
 * @param {string} stuffing - Stuffing of a hamburger
 */

function Hamburger(size, stuffing) {
    if (!Hamburger.hasOwnProperty(size.toUpperCase() || 'STUFFING_' + stuffing.toUpperCase())) {
        throw new Error(ERROR_UNKNOWN_MENU_ITEM);
    }

    MenuItem.call(this, Hamburger[size.toUpperCase()]);
    this.title = 'Hamburger';
    this.size = capitalize(size);
    this.stuffing = new MenuItem(Hamburger['STUFFING_' + stuffing.toUpperCase()]);
  }

Hamburger.BIG = {price: 100, calories: 40};
Hamburger.SMALL = {price: 50, calories: 20};
Hamburger.STUFFING_CHEESE = {title: 'Cheese', price: 10, calories: 20};
Hamburger.STUFFING_SALAD = {title: 'Salad', price: 20, calories: 5};
Hamburger.STUFFING_POTATO = {title: 'Potato', price: 15, calories: 10};

Hamburger.prototype = Object.create(MenuItem.prototype);
Hamburger.prototype.constructor = Hamburger;

/**
 * @returns {string} Returns the size of the hamburger
 */
Hamburger.prototype.getSize = function() {
    return this.size;
}

/**
 * @returns {string} Returns the title of the hamburger stuffing
 */
Hamburger.prototype.getStuffing = function() {
    return this.stuffing.title;
}

/**
 * @returns {number} Returns total price of the hamburger
 */
Hamburger.prototype.calculatePrice = function() {
    return this.price + this.stuffing.price;
}

/**
 * @returns {number} Returns total calories of the hamburger
 */
Hamburger.prototype.calculateCalories = function() {
    return this.calories + this.stuffing.calories;
}

Hamburger.prototype.toString = function() {
    return this.size + ' ' + this.title + ' w/ ' + this.stuffing.title;
}





/**
 * Class representing an order.
 * @constructor
 * @example
 * 
 *     var ord = new Order();
 *     ord.addItem(new Hamburger('Small', 'Salad'));
 *     ord.addItem(new Salad('Caesar', 250));
 *     ord.addItem(new Drink('Cola'));
 *     ord.calculatePrice(); //370
 *     ord.close();
 *     ord.addItem(new Drink('Coffee')); // Error: The order was closed. You can't edit it anymore.
 */

function Order() {
    Order.id = (Order.id || 0) + 1;
    this.id = Order.id;
    this.items = [];
    this.paid = false;
}

/**
 * @returns {string} Returns the list of order items
 */
Order.prototype.getItems = function() {
    return this.items.map(function(item, index) {
        return (index + 1) + ': ' + item;
    }).join('\n');
}

/**
 * @returns {string} Returns the list of order items with price and calories
 */
Order.prototype.getItemsWithPriceAndCalories = function() {
    return this.items.map( function(item, index) {
        return justify((index + 1) + ': ' + item.toString(), 40)
             + this.getItemPrice(item) + '₮ (' 
             + this.getItemCalories(item) + ' ccals)' 
    }, this).join('\n');
}

/**
 * @returns {number} Returns the total price of the order item
 */
Order.prototype.getItemPrice = function(item) {
    return item.calculatePrice ? item.calculatePrice() : item.price;
}

/**
 * @returns {number} Returns the total calories of the order item
 */
Order.prototype.getItemCalories = function(item) {
    return item.calculateCalories ? item.calculateCalories() : item.calories;
}

/**
 * Adds the item to the order
 */
Order.prototype.addItem = function(newItem) {
    if (this.paid) {
        throw new Error(ERROR_CLOSED_ORDER);
    }

    if (!(newItem instanceof MenuItem)) {
        throw new Error(ERROR_UNKNOWN_MENU_ITEM);
    }

    this.items.push(newItem);
}

/**
 * Removes the item from the order by given position number
 */
Order.prototype.removeItem = function(position) {
    if (this.paid) {
        throw new Error(ERROR_CLOSED_ORDER);
    }

    return this.items.splice(position - 1, 1);
}

/**
 * @returns {number} Returns the total price of the order
 */
Order.prototype.calculatePrice = function() {
    if (this.items.length === 0) {
        return 0;
    }

    return this.items.map(function(i) {
        return this.getItemPrice(i);
    }, this).reduce(function (acc, i) {
        return acc + i;
    })
}

/**
 * @returns {number} Returns the total calories of the order
 */
Order.prototype.calculateCalories = function() {
    if (this.items.length === 0) {
        return 0;
    }

    return this.items.map(function(i) {
        return this.getItemCalories(i);
    }, this).reduce(function (acc, i) {
        return acc + i;
    })
}

/**
 * Prevents the order from being edited
 */
Order.prototype.close = function() {
    Object.freeze(this.items);
    this.paid = true;
}

Order.prototype.toString = function() {
    var status = this.paid ? 'Paid' : 'Not Paid';

    return 'Order #' + this.id + '\n'
        +  status + '\n'
        +  '\n'
        +  this.getItemsWithPriceAndCalories() + '\n'
        +  '\n'
        +  'Total: \n'
        + 'Price: ' + this.calculatePrice() + '₮ \n'
        + 'Calories: ' + this.calculateCalories() + ' ccals'
}