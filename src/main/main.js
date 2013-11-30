(function(exports) {

	/**
	 * @class Field
	 * @param width {number}
	 * @param height {number}
	 * @param [firstRowShifted=false] {boolean}
	 * @constructor
	 */
	var Field = function(width, height, firstRowShifted) {
		firstRowShifted = !!firstRowShifted;

		var hexagons = [],
			edges = [],
			corners = [];

		/**
		 * @method edge
		 * @public
		 */
		this.hexagon = function(x, y) {

		}

		/**
		 * @method firstRowShifted
		 * @return {boolean}
		 * @public
		 */
		this.firstRowShifted = function() {
			return firstRowShifted;
		}
	}

	/**
	 * @class Hexagon
	 * @param field {Field}
	 * @param x {number}
	 * @param y {number}
	 * @constructor
	 */
	var Hexagon = function(field, x, y) {

	}

})((module && module.exports) ? module.exports : window);