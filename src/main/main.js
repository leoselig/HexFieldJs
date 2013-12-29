(function(exports) {

	var utils = {
		setupEnum: function(properties) {
			var enumObj = {};
			for(var i = 0; i < properties.length; i++) {
				enumObj[properties[i]] = {};
			}
			return enumObj;
		},

		clone: function(obj, value) {
			var mapping = {};
			for(var i in obj) {
				if(obj.hasOwnProperty(i)) {
					mapping[i] = value;
				}
			}
			return mapping;
		}
	};

	var Enum = function(properties) {

		/**
		 * @method at
		 * @param index {number}
		 * @returns {Object}
		 * @public
		 */
		this.at = function(index) {
			return this[properties[index]];
		};

		/**
		 * @method createSet
		 * @param value {Object}
		 * @returns {Object}
		 * @public
		 */
		this.createSet = function(value) {
			return createSetOn({}, value);
		};

		/**
		 * @method createSetOn
		 * @param obj {Object}
		 * @param [value] {Object}
		 * @returns {Object}
		 * @private
		 */
		var createSetOn = function(obj, value) {
			for(var i = 0; i < properties.length; i++) {
				obj[properties[i]] = value || {
					identifier: properties[i]
				};
			}
			return obj;
		};

		createSetOn(this);
	};

	/**
	 * @class Field
	 * @param width {number}
	 * @param height {number}
	 * @param [firstRowShiftedDown=false] {boolean}
	 * @constructor
	 */
	var Field = function(width, height, firstRowShiftedDown) {
		firstRowShiftedDown = !!firstRowShiftedDown;

		var hexagons = [],
			edges = [],
			corners = [],
			firstHexagon;

		/**
		 * @method edge
		 * @public
		 */
		this.hexagon = function(x, y) {

		};

		/**
		 * @method width
		 * @returns {number}
		 * @public
		 */
		this.width = function() {
			return width;
		};

		/**
		 * @method height
		 * @returns {number}
		 * @public
		 */
		this.height = function() {
			return height;
		};

		/**
		 * @method columnShiftedDown
		 * @param colIndex {number}
		 * @return {boolean}
		 * @public
		 */
		this.columnShiftedDown = function(colIndex) {
			return this.firstRowShiftedDown() ? (colIndex % 2 === 0) :
			       (colIndex % 2 === 1);
		};

		/**
		 * @method firstRowShiftedDown
		 * @return {boolean}
		 * @public
		 */
		this.firstRowShiftedDown = function() {
			return firstRowShiftedDown;
		};

		(function() {
			firstHexagon = new Hexagon(this, 0, 0);
			firstHexagon.setupField();
		}).call(this);
	}

	/**
	 * @class Hexagon
	 * @param field {Field}
	 * @param x {number}
	 * @param y {number}
	 * @constructor
	 */
	var Hexagon = function(field, x, y) {
		var edges = Edge.Direction.createSet(null);

		this.shiftedDown = function() {
			return field.columnShiftedDown(x);
		};

		/**
		 * @method hexagon
		 * @param direction {Edge.Direction}
		 * @param [newHexagon] {Hexagon}
		 * @returns {Hexagon}
		 * @chainable
		 * @public
		 */
		this.hexagon = function(direction, newHexagon) {
			// Decide if get or set call
			if(!(newHexagon instanceof Hexagon) && (newHexagon !== null)) {
				return this.edge(direction).hexagon(direction);
			}
			this.setNeighbor(direction, newHexagon);
			// New neighbor can be null
			if(newHexagon !== null) {
				newHexagon.setNeighbor(Edge.oppositeDirection(direction), this);
			}
			return this;
		};

		/**
		 * @method edge
		 * @param direction {Edge.Direction}
		 * @returns {Edge}
		 */
		this.edge = function(direction) {
			return edges[direction];
		};

		/**
		 * Mono-directionally sets the neighbor of this hexagon in the given direction
		 *
		 * @method setNeighbor
		 * @param direction {Edge.Direction}
		 * @param newHexagon {Hexagon}
		 * @chainable
		 */
		this.setNeighbor = function(direction, newHexagon) {
			if(edges[direction] === null) {
				edges[direction] = new Edge(field);
			}
			this.setupEdge(direction, newHexagon);
			edges[direction].hexagon(direction, newHexagon);
			return this;
		};

		/**
		 * @method setupEdge
		 * @param direction {Edge.Direction}
		 * @param hexagon {Hexagon}
		 * @returns {Edge}
		 */
		this.setupEdge = function(direction, hexagon) {
			var edge = hexagon.edge(Edge.oppositeDirection(direction)) ||
			           this.edge(direction) || new Edge(field);
			edge.setupHexagon(direction, hexagon);
			edge.setupHexagon(Edge.oppositeDirection(direction), this);
			return edge;
		};

		/**
		 * @method setupField
		 * @param [topRow] {Hexagon[]}
		 * @chainable
		 * @public
		 */
		this.setupField = function(topRow) {
			var ownRow = this.setupRowTail(topRow || [], []);
			var nextHexagon = new Hexagon(field, x, y + 1);
			nextHexagon.setupField(ownRow);
			return this;
		};

		/**
		 * @method setupRowTail
		 * @param topRow {Hexagon[]}
		 * @param rowHead {Hexagon[]}
		 * @return {Hexagon[]} the complete row
		 * @public
		 */
		this.setupRowTail = function(topRow, rowHead) {
			var shiftedDown = this.shiftedDown();
			var Direction = Edge.Direction;
			// Top neighbor
			this.hexagon(Direction.TOP, topRow[x] || null);
			// Left neighbor
			this.hexagon(shiftedDown ? Direction.TOP_LEFT :
			             Direction.BOTTOM_LEFT, rowHead[x - 1] || null);
			if(!shiftedDown) {
				// Set diagonal upper neighbors
				this.hexagon(Direction.TOP_LEFT, topRow[x - 1] || null);
				this.hexagon(Direction.TOP_RIGHT, topRow[x + 1] || null);
			}
			rowHead.push(this);
			if(x < field.width()) {
				var nextHexagon = new Hexagon(field, x + 1, y);
				nextHexagon.setupRowTail(topRow, rowHead);
			}
			return rowHead;
		};
	};

	var Edge = function(field) {
		var adjacentHexagons = Edge.Direction.createSet(null),
			corner1 = null,
			corner2 = null;

		/**
		 * @method hexagon
		 * @param direction {Edge.Direction}
		 * @returns {Hexagon}
		 * @public
		 */
		this.hexagon = function(direction) {
			return adjacentHexagons[direction];
		};

		/**
		 * @method hexagon
		 * @param direction {Edge.Direction}
		 * @param hexagon {Hexagon}
		 * @chainable
		 * @public
		 */
		this.setupHexagon = function(direction, hexagon) {
			adjacentHexagons[direction] = hexagon;
			return this;
		};

		/**
		 * @method
		 */
		this.setupCorners = function() {
			var firstDirection = Edge.Direction.at(0),
				currentDirection = firstDirection;
			do {
				var counterClockwiseEdges = this.connectedEdgesCounterClockwise(), clockwiseEdges = this.connectedEdgesClockwise;
				if(corner1 === null) {

				}
				else {

				}
				currentDirection = Edge.Direction.next(currentDirection);
			} while(currentDirection !== firstDirection);
		};

		/**
		 * @method orientation
		 * @return {string}
		 * @public
		 */
		this.orientation = function() {

		};
	};

	/**
	 * @method cornerDirectionsFor
	 * @param neighborDirection {Edge.Direction}
	 * @return {Corner.Direction[]}
	 * @public
	 * @static
	 */
	Hexagon.cornerDirectionsFor = function(neighborDirection) {
		var directions = [];
		switch(neighborDirection) {
		case Edge.Direction.TOP:
			return [Corner.Direction.TOP_LEFT, Corner.Direction.TOP_RIGHT];
		case Edge.Direction.TOP_RIGHT:
			return [Corner.Direction.TOP_RIGHT, Corner.Direction.RIGHT];
		case Edge.Direction.BOTTOM_RIGHT:
			return [Corner.Direction.RIGHT, Corner.Direction.BOTTOM_RIGHT];
		case Edge.Direction.BOTTOM:
			return [Corner.Direction.BOTTOM_RIGHT, Corner.Direction.BOTTOM_LEFT];
		case Edge.Direction.BOTTOM_LEFT:
			return [Corner.Direction.BOTTOM_LEFT, Corner.Direction.LEFT];
		case Edge.Direction.TOP_LEFT:
			return [Corner.Direction.LEFT, Corner.Direction.TOP_LEFT];
		default:
			return null;
		}
	};

	Edge.Direction = new Enum('TOP_LEFT', 'TOP', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM', 'BOTTOM_RIGHT');

	Edge.Direction.next = function(direction) {
		switch(direction) {
		case Edge.Direction.TOP_LEFT:
			return Edge.Direction.TOP;
		case Edge.Direction.TOP:
			return Edge.Direction.TOP_RIGHT;
		case Edge.Direction.TOP_RIGHT:
			return Edge.Direction.BOTTOM_RIGHT;
		case Edge.Direction.BOTTOM_RIGHT:
			return Edge.Direction.BOTTOM;
		case Edge.Direction.BOTTOM:
			return Edge.Direction.BOTTOM_LEFT;
		case Edge.Direction.BOTTOM_LEFT:
			return Edge.Direction.TOP_LEFT;
		default:
			return null;
		}
	};

	Edge.Orientation = new Enum('HORIZONTAL', 'DIAGONAL_POSITIVE', 'DIAGONAL_NEGATIVE');

	Edge.oppositeDirection = function(direction) {
		switch(direction) {
		case Edge.Direction.TOP_LEFT:
			return Edge.Direction.BOTTOM_RIGHT;
		case Edge.Direction.TOP:
			return Edge.Direction.BOTTOM;
		case Edge.Direction.TOP_RIGHT:
			return Edge.Direction.BOTTOM_LEFT;
		case Edge.Direction.BOTTOM_RIGHT:
			return Edge.Direction.TOP_LEFT;
		case Edge.Direction.BOTTOM:
			return Edge.Direction.TOP;
		case Edge.Direction.BOTTOM_LEFT:
			return Edge.Direction.TOP_RIGHT;
		default:
			return null;
		}
	};
	;

	var Corner = function(field, x, y) {

	};

	Corner.Direction = new Enum('TOP_LEFT', 'LEFT', 'BOTTOM_LEFT', 'TOP_RIGHT', 'RIGHT', 'BOTTOM_RIGHT');

	Corner.oppositeDirection = function(direction) {
		switch(direction) {
		case Edge.Direction.TOP_LEFT:
			return Edge.Direction.BOTTOM_RIGHT;
		case Edge.Direction.LEFT:
			return Edge.Direction.RIGHT;
		case Edge.Direction.TOP_RIGHT:
			return Edge.Direction.BOTTOM_LEFT;
		case Edge.Direction.BOTTOM_RIGHT:
			return Edge.Direction.TOP_LEFT;
		case Edge.Direction.RIGHT:
			return Edge.Direction.LEFT;
		case Edge.Direction.BOTTOM_LEFT:
			return Edge.Direction.TOP_RIGHT;
		default:
			return null;
		}
	};

})((module && module.exports) ? module.exports : window);