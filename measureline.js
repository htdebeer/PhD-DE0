/*
 * measureline.js : create movable measure lines to construct
 * measure beakers.
 *
 * @author HT de Beer H.T.de.Beer@gmail.com
 * @version 0.2
 *
 */


/*
 * @class measureline
 *
 * A simple measureline consisting of a background, a label and a line. The
 * measureline is movable and highlights when the cursor
 * is on top of it. Measureline can be put in a measureline box
 * @see measurelineBox.
 */

/*
 * @constructor
 *
 * @param cnfg Configuration data, containing x, y, padding, extra_line,
 * style, and id. Width and height are optional and will be computed
 * afterwards. The style object
 * contains information on the font and colors.
 *
 * The padding is the amount of white space surrounding the text and the
 * extra_line is the lenght of the line added to the line below the text.
 *
 * @param mlbx The measurelineBox this measureline is part of.
 *
 * @return A new measureLine
 */
var measureline = function( cnfg, mlbx ) {
    var that,
	index_in_group = 0,
	mlbox = mlbx || null,
	dragged = false,
	offset = {
	    x: 0,
	    y: 0
	},
	config = cnfg || {
	    x: 0,
	    y: 0,
	    height: 0,
	    widht: 0,
        padding: 1,
        extra_line: 5,
	    label: '',
	    id: ''
	},
    background, line, label, glasspane;

    /*
     * @private
     *
     * computeLinePath computes a path string of the line of this measureline.
     *
     * @param x the x coordinate
     * @param y the y coordinate
     * @param width the width of the line
     *
     * @return a path string describing a line starting at (x,y) and
     * width
     */
    var computeLinePath = function( x, y, width ) {
        return ' M ' + x + ' ' + y + ' H ' + (x+width);
    };

    /*
     * @private
     *
     * Creates a bare measureline: a SVG group containing the background,
     * label, line, and the glasspane.
     */
    var create = function() {
        var charw = 3,
            charh = 10;
        label = text({
            x: config.x + config.padding,
            y: config.y + config.padding,
            string: config.label,
            id: config.id + ':label',
            style: {
        	'font-size': '3pt',
        	'font-family': '\'Verdana\', \'Tahoma\', \'Helvetica\', sans-serif',
        	'pointer-events': 'none'
            }
        });
        // Determine the dimensions of the text and set up the surrounding
        // box and line.
        config.height = label.getHeight() + 2*config.padding;
        config.width = label.getWidth() + 2*config.padding
            + config.extra_line;

        label.addStyle( {
            y: config.y + (config.height/2) + config.padding
        });


        background = rect({
            x: config.x,
            y: config.y,
            height: config.height,
            width: config.width,
            id: config.id + ':background',
            style: {
                stroke: 'none',
                fill: 'white',
                opacity: 0,
                'pointer-events': 'none'
            }
        });
        line = path({
            id: config.id + ':line',
            d: computeLinePath( config.x, config.y+config.height/1.2, config.width),
            style: {
                stroke: 'black',
                'pointer-events': 'none',
                'stroke-width': 0.45
            }
        });

        glasspane = rect({
            x: config.x,
            y: config.y,
            height: config.height,
            width: config.width,
            id: config.id + ':glasspane',
            style: {
                stroke: 'none',
                fill: 'white',
                opacity: 0
            }
        });

        if (cnfg.cannot_move) {
        } else {
            glasspane.startListeningTo( 'mouseover', enableMakeMovable )
            glasspane.startListeningTo( 'mouseout', disableMakeMovable );
        };

        return group( config)
            .add( [background, line, label, glasspane] )
            .onTop( glasspane );
    };

    /*
     * setPoint places this measureline with the end of the line on (x,y).
     *
     * @param x
     * @param y
     */
    var setPoint = function( x, y ) {
        config.x = x-config.width;
        config.y = y-config.height/1.2;
        update();
    };

    /*
     * @private
     *
     * update moves the measureline to the new position
     */
    var update = function() {
        background.addStyle( {
            x: config.x,
            y: config.y
        } );
        label.addStyle( {
            x: config.x + config.padding,
            y: config.y + (config.height/2) + config.padding
        } );
        line.addStyle( {
            d: computeLinePath( config.x, config.y+config.height/1.2, config.width)
        } );
        glasspane.addStyle( {
            x: config.x,
            y: config.y
        } );
    };

    /*
     * @private
     *
     * move is a eventhandler handling mousemovements if this measureline is
     * draggable.
     *
     * @param evt Mousemove event
     */
    var move = function( evt ) {
        var coords;
        if (dragged) {
            coords = evt.getCoordsAt( glasspane.element );
            config.x = coords.x + offset.x;
            config.y = coords.y + offset.y;
            update();
        };
    };

    /*
     * @private
     *
     * drop is an eventhandler handling the up mouseevents if this measureline
     * is draggable.
     *
     * @param evt Mouseup event
     */
    var drop = function( evt ) {
        if (dragged) {
            if (mlbox !== null) {
                // Enable all other measurelines in this measurelines' box to
                // react to mouseover events
            	mlbox.healDeaf();
            };
            dragged = false;
            glasspane.element.ownerDocument.documentElement
                .removeEventListener( 'mousemove', move, false );
            glasspane.stopListeningTo( 'mouseup', drop );
        };
    };

    /*
     * @private
     *
     * makeMovable is an eventhandler handling the mouseover events if this
     * measureline is not already be draggable.
     *
     * @param evt MouseOver event
     */
    var makeMovable = function( evt ) {
        var coords = evt.getCoordsAt( glasspane.element ),
            gbb = glasspane.element.getBBox();

        if (!dragged) {
            if (mlbox!==null) {
                // Disable all other measurelines in this measurelines' box to
                // react to mouseover events and put this one on top
            	mlbox.onTop( that );
            	mlbox.makeDeaf( that );
            };
            dragged = true;
            offset.x = gbb.x - coords.x;
            offset.y = gbb.y - coords.y;
            glasspane.element.ownerDocument.documentElement
                .addEventListener( 'mousemove', move, false );
            glasspane.startListeningTo( 'mouseup', drop );
        };
    };

    /*
     * @private
     *
     * enableMakeMovable enables this measureline to listen to mousedown
     * events and highlights this measureline.
     */
    var enableMakeMovable = function() {
        glasspane.startListeningTo( 'mousedown', makeMovable );
        background.addStyle( {
            fill: 'yellow',
            stroke: 'black',
            'stroke-dasharray': '1,1',
            'stroke-width': 0.2,
            opacity: 0.3
        } );
        glasspane.addStyle( {
            cursor: 'move'
        });
    };

    /*
     * @private
     *
     * disableMakeMovable disables this measureline to listen to mousedown
     * events and unhighlights this measureline.
     */
    var disableMakeMovable = function() {
        glasspane.stopListeningTo( 'mousedown', makeMovable );
        background.addStyle( {
            fill: 'white',
            stroke: 'none',
            'stroke-dasharray': 'none',
            opacity: 0
        } );
        glasspane.addStyle( {
            cursor: 'default'
        });
    };


    var configure = function( cnfg ) {
        var prop;
        for (prop in cnfg) {
            if (typeof cnfg[prop] !== 'function') {
        	config[prop] = cnfg[prop];
            }
        }
        update();
        return this;
    };

    var getWidth = function() {
        return config.width;
    };

    var getHeight = function() {
        return config.height;
    };

    that = create();
    that.configure = configure;
    that.setPoint = setPoint;
    that.getWidth = getWidth;
    that.getHeight = getHeight;
    return that;

};




/*
 * @class
 *
 * Measure line is a container for measurelines. The size of this container
 * is calculated automatically givven the amount of measurelines, the number
 * of columns and the width of the largest measureline.
 *
 */
var measurelineBox = function( cnfg ) {
    var that,
	ml_width,
	ml_height,
	title_height = 8,
	config = cnfg || {
	    x: 0,
	    y: 0,
	    width: 0,
	    height: 0,
	    max: 0,
	    step: 0,
	    cols: 5,
        sep: 2,
        margin: 1,
	    title: '',
	    id: ''
	}, background, titlebox, title, mls;

    /*
     * @private
     *
     * Create this measureLine instance
     */
    var create = function() {
        var mlbox;

        mls = createMeasureLines();
        // once the measure lines are created, the width and height of one
        // measureline is known.

        background = rect( {
            x: config.x,
            y: config.y,
            width: computeWidth(),
            height: computeHeight(),
            id: config.id + ':background',
            style: {
            fill: 'white',
            stroke: 'black',
            'stroke-width': 0.3
            }
        } );

	titlebox = rect({
	    id: config.id + ':textbox',
	    x: config.x + 1,
	    y: config.y + 1,
	    width: computeWidth() - 2,
	    height: title_height,
	    style: {
	    }
	});
	title = text( {
	    string: 'Zet de maatstreepjes op het glas',
	    x: config.x + 3,
	    y: config.y + 7,
	    id: config.id + ':title',
	    style: {
		'font-family': '\'Verdana\', \'Tahoma\', \'Helvetica\', sans-serif',
		'font-size': '4pt',
		fill: 'black',
		'font-weight': 'normal'
	    }
	});


	mlbox = group( config );
	mlbox.add( [ background, titlebox, title, mls] );
	return mlbox;

    };

    var computeWidth = function() {
	return config.cols*(config.sep + ml_width) + 2*config.margin - config.sep;
    };

    var computeHeight = function() {
	return 2*config.margin + title_height + config.sep +
	    ( Math.ceil( (config.max / config.step) / config.cols ) *
	      ( config.sep + ml_height ) ) - config.sep;
    };

    var createMeasureLines = function() {
        var mlbox,
            mline,
            i,
            col = 1,
            x = config.x + config.margin,
            y = config.y + title_height + config.margin + config.sep;

        mlbox = group( { id: config.id + ':mlbox' });

        for (i = config.step; i <= config.max; i = i + config.step) {
            mline = measureline( {
                'x': x,
            	'y': y,
            	id: config.id + ':ml' + i,
                padding: 1,
                extra_line: 3,
            	label: ''+ i + ' ml',
            	style: {
            	    fill: 'black'
            	}
                }, mlbox)
            mlbox.add( [mline] );

            if (col < config.cols) {
                col++;
                x = x + mline.getWidth() + config.sep;
            } else {
                col = 1;
                x = config.x + config.margin;
                y = y + config.sep + mline.getHeight();
            };
        };
        ml_height = mline.getHeight();
        ml_width = mline.getWidth();
        return mlbox;
    };

    var update = function() {
    };

    that = create();

    return that;

};
