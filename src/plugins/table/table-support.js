/**
 * @fileOverview Contains the table helper functions.
 * @author  David Neilsen <david@panmedia.co.nz>
 * @author  Michael Robinson <michael@panmedia.co.nz>
 * @author Melissa Richards <melissa@panmedia.co.nz>
 */

var tableSupportDragging = false,
    tableSupportStartCell = null;

/**
 * @class The supporting table class.
 * @constructor
 * @augments RaptorPlugin
 *
 * @todo type and desc for name
 * @param {type} name
 * @param {Object} overrides Options hash.
 */
function TableSupport(name, overrides) {
    RaptorPlugin.call(this, name || 'tableSupport', overrides);
}

TableSupport.prototype = Object.create(RaptorPlugin.prototype);

/**
 * Initialize the table support class.
 */
TableSupport.prototype.init = function() {
    this.raptor.bind('selectionCustomise', this.selectionCustomise.bind(this));
    this.raptor.getElement()
        .on('mousedown', 'tbody td', this.cellMouseDown.bind(this))
        .on('mouseover', 'tbody td', this.cellMouseOver.bind(this))
        .mouseup(this.cellMouseUp.bind(this));
};

/**
 * @todo i think this has something to do with the cell selection but i'm not sure
 * @returns {Array}
 */
TableSupport.prototype.selectionCustomise = function() {
    var ranges = [],
        range;
    $('.' + this.options.baseClass + '-cell-selected').each(function() {
        range = rangy.createRange();
        range.selectNodeContents(this);
        ranges.push(range);
    });
    return ranges;
};

/**
 * Event handler for mouse down.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseDown = function(event) {
    if (this.raptor.isEditing()) {
        tableSupportStartCell = tableGetCellIndex(event.target);
        if (tableSupportStartCell !== null) {
            tableSupportDragging = true;
            $(event.target).closest('table').addClass(this.options.baseClass + '-selected');
        }
    }
};

/**
 * Event handler for mouse up.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseUp = function(event) {
    tableSupportDragging = false;
    var cell = $(event.target).closest('td'),
        deselect = false;
    if (cell.length > 0) {
        var index = tableGetCellIndex(cell.get(0));
        if (index === null ||
                (index.x == tableSupportStartCell.x &&
                index.y == tableSupportStartCell.y)) {
            deselect = true;
        }
    } else {
        deselect = true;
    }
    if (deselect) {
        $('.' + this.options.baseClass + '-selected').removeClass(this.options.baseClass + '-selected');
        $('.' + this.options.baseClass + '-cell-selected').removeClass(this.options.baseClass + '-cell-selected');
    }
};

/**
 * Event handler for mouse hover.
 *
 * @param event The mouse event to trigger the function.
 */
TableSupport.prototype.cellMouseOver = function(event) {
    if (tableSupportDragging) {
        var cells = tableCellsInRange($(event.target).closest('table').get(0), tableSupportStartCell, tableGetCellIndex(event.target));
        $('.' + this.options.baseClass + '-cell-selected').removeClass(this.options.baseClass + '-cell-selected');
        $(cells).addClass(this.options.baseClass + '-cell-selected');
        rangy.getSelection().removeAllRanges();
    }
};

Raptor.registerPlugin(new TableSupport());
