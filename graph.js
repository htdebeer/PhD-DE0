/*
 * @author HT de Beer H.T.de.Beer@gmail.com
 * @version 0.1
 *
 *
 */

/*
 * @class graphLine
 *
 * A drawn graph, the line part.
 *
 */
// assuming shapes are loaded

var graphLine = function( cnfg ) {
    var that,
        config = cnfg || {
            x: 0,
            y: 0,
            ox: 0,
            oy: 0,
            style: {
                stroke: 'black'
            },
			unit_x: 1,
			unit_y: 1
        },
        current_x = 0,
        current_y = 0,
		d = '';

    var addPoint = function( x, y) {
        var x1 = x - 1,
            x2 = x + 1,
            y1 = y - 1,
            y2 = y + 1;

        d = d + ' M ' + x1 + ' ' + y1;
        d = d + ' L ' + x2 + ' ' + y2;
        d = d + ' M ' + x1 + ' ' + y2;
        d = d + ' L ' + x2 + ' ' + y1;
        this.addStyle( {d: d});
        return this;
    };

    var lineTo = function( x, y ) {
        d = d + ' L ' + x + ' ' + y;
        this.addStyle( {d: d});
        return this;
    };

    var addTo = function( plusx, plusy ) {
        current_x = config.ox + (plusx/config.unit_x);
        current_y = config.oy + (plusy/config.unit_y);
        d = d + ' L ' + current_x + ' ' + current_y;
        this.addStyle( {d: d});
        return this;
    }

    var moveTo = function( x, y ) {
        d = d + ' M ' + x + ' ' + y;
        this.addStyle( {d: d});
        return this;
    };

    var clear = function() {
        d = 'M ' + config.ox + ' ' + config.oy;
        this.addStyle( {d: d});
        return this;
    }

    var d;
    var create = function() {
        d = 'M ' + config.ox + ' ' + config.oy;
        return path( {
            id: config.id,
            d: d,
            style: {
                stroke: config.style.stroke,
                'stroke-width': 0.5,
                fill: 'none'
            }
        })
    };
	
	var is_drawn = function() {
		return d !== 'M ' + config.ox + ' ' + config.oy;
	};

    that = create();
    that.lineTo = lineTo;
    that.moveTo = moveTo;
    that.clear = clear;
    that.addPoint = addPoint;
    that.addTo = addTo;
	that.is_drawn = is_drawn;
    return that;
};

/*
 * @class graphLine
 *
 * The whole graph including axes, raster, background and the lot.
 *
 */
var graphBox = function( cnfg ) {
    var that,
        config = cnfg || {
        },
        graphs;

    var addGraph = function( id, line ) {
        graphs[id] = line;
        this.add( [line] );
    };
    var removeGraph = function( id ) {
		var line = graphs[id];
        this.remove( [line] );
        delete graphs[id];
    };

    var getGraph = function( id ) {
        return graphs[id];
    }

    var create = function() {
        graphs = {};
        return group( {id: config.id });
    };

    that = create();
    that.addGraph = addGraph;
    that.removeGraph = removeGraph;
    that.getGraph = getGraph;
    return that;
};

var graphBase = function( cnfg ) {
    var that,
        config = cnfg || {
			style: {
				scale: 'default'
			}
        },
        pen = false,
        drawing = false,
        drawing_enabled = false,
        usergraph,
        autograph,
        freehand_cursor,
		line_cursor,
		dot_cursor,
		tool = 'freehand',
		freehand_button,
		line_button,
		dot_button,
		answer_button,
		erase_button,
		start_point = null,
		last_point = {x:0, y:0},
		background, x_axis, y_axis, canvas, raster, line_line, graphs, glasspane;


    var draw = function( evt ) {
        var coords = evt.getCoordsAt( glasspane.element );
		if (tool === 'freehand' && drawing) {
			usergraph.lineTo( coords.x, coords.y );
		} else if (tool === 'line' && start_point!=null) {
			line_line.addStyle({
				d: ' M ' + start_point.x + ' ' + start_point.y
					+ ' L ' + coords.x + ' ' + coords.y
			});
		} else if (tool === 'dot') {
		};
		if (usergraph.is_drawn) {
			answer_button.enable();
		} else {
			answer_button.disable();
		}
    };



    var startDrawing = function( evt ) {
        var coords = evt.getCoordsAt( glasspane.element );
        pen = true;
        drawing = true;

		if (tool === 'line') {
			start_point = coords;
			last_point = coords;
		};

        glasspane.startListeningTo('mousemove', draw );
        glasspane.startListeningTo( 'mouseup', stopDrawing );
		glasspane.startListeningTo( 'mouseout', disableDrawing );
        usergraph.moveTo( coords.x, coords.y );
    };

    var stopDrawing = function( evt ) {
        pen = false;
        drawing = false;
		// FIX ME: when out of glasspane the coord will have an error.
		// BUt it has right functionality
		if (tool === 'line' && start_point) {
			var coords;
			//try {
				coords = evt.getCoordsAt( glasspane.element );
			//} catch (e) {
			//	coords = evt.getCoordsAt( document );
			//};
				usergraph.moveTo( start_point.x, start_point.y);
				usergraph.lineTo( coords.x, coords.y);
		} else if (tool === 'dot' && drawing_enabled) {
			var coords = evt.getCoordsAt( glasspane.element );
			usergraph.addPoint( coords.x, coords.y );
		};

		line_line.addStyle({
			d: 'M 0 0'
			});
		start_point = null;
		//glasspane.stopListeningTo( 'mouseout', disableDrawing );
        glasspane.stopListeningTo('mousemove', draw );
        glasspane.stopListeningTo( 'mouseup', stopDrawing );
		if (usergraph.is_drawn) {
			answer_button.enable();
		} else {
			answer_button.disable();
		}
    };

    var enableDrawing = function() {
        glasspane.startListeningTo( 'mousedown', startDrawing );
        drawing_enabled = true;
        canvas.addStyle({
            fill: 'yellow',
            opacity: 0.2
        });

    };

    var disableDrawing = function(evt) {
        var coords = evt.getCoordsAt( glasspane.element );
        drawing_enabled = false;
	drawing = false;
	if (tool === 'line' && start_point) {
		line_line.addStyle({
			d: ' M ' + start_point.x + ' ' + start_point.y
				+ ' L ' + coords.x + ' ' + coords.y
		});
	};

	
	glasspane.stopListeningTo( 'mousedown', startDrawing );

        canvas.addStyle({
            opacity: 1,
            fill: 'white',
            pointer: 'default'
        });
		
		
    };

	var createNumberLabel = function( x, y, nr, id, style ) {
		var x = x || 0,
			y = y || 0,
			nr = nr || 0,
			style =  style || { 'font-size': '5pt'};

		return text( {
			id: id + ':label:' + nr,
			x: x,
			y: y,
			string: '' + nr,
			style: style
	    });
	};

    var create_y_axis = function( cnfg ) {
        var ax,
            unit = cnfg.unit || 1,
            label = cnfg.label || 'cm',
            labeling = cnfg.labeling || 'sparse',
            axis,
            d,
            i,
            step = 10,
			label_step = cnfg.step || 1
            tickwidth = 3,
            xstart = cnfg.x - tickwidth;

        d = 'M ' + cnfg.x + ' ' + cnfg.y + 'V ' + (cnfg.y + cnfg.height);
		
		if (config.style.scale=='default') {
			// create a default axis: with ticks and labels in abundance
			for (i=cnfg.y + cnfg.height - step; i > cnfg.y; i = i - step) {
			    d = d + ' M ' + cnfg.x + ' '  + i + ' H ' +  (cnfg.x - tickwidth);
			};
		} else if (config.style.scale=='scarce') {
			// Create a axis with only the max value
			d = d + ' M ' + cnfg.x + ' ' + (cnfg.y + cnfg.height - (cnfg.max/cnfg.unit)*cnfg.step) + ' H ' + (cnfg.x - tickwidth);
		};

        axis = path( {
            id: cnfg.id + ':axis',
            d: d,
            style: {
                'stroke-width': 0.5,
                stroke: 'black'
            }
        })
        ax = group( { id: cnfg.id } );
        ax.add([axis]);

        var labels = [];
        var nr=0;
		var j = 0
        var x_string = cnfg.x - 10;
		
		if (config.style.scale=='default') {
			for (i = cnfg.y + cnfg.height; i > cnfg.y; i = i - 10) {
			    if (nr%label_step == 0 && nr != 0) {
			    labels.push(
					createNumberLabel(
								(nr < 10)? x_string: x_string-3,
								(nr === 0)? i-1: i+1
								,	nr, cnfg.id ,{
							'font-size': '3pt',
							'font-family': '\'Verdana\', \'Helvetica\', sans-serif'
							})
			    );
			    };
				nr = nr + unit;
			};
		} else if (config.style.scale=='scarce') {
			nr = ( cnfg.max/10).toPrecision(3);
			i = cnfg.y + cnfg.height - (cnfg.max/cnfg.unit)*cnfg.step;
			labels.push(
				createNumberLabel(
								(nr < 10)? x_string: x_string-3,
								(nr === 0)? i-1: i+1
								,	nr, cnfg.id ,{
							'font-size': '3pt',
							'font-family': '\'Verdana\', \'Helvetica\', sans-serif'
							}
				)
			);
		};

        var unitlabel = text({
            id: cnfg.id + ':unitlabel',
            x: cnfg.x - cnfg.height + config.x_axis.height + 10,
            y: cnfg.y - config.y_axis.width -7,
            string: cnfg.label,
            style: {
                'font-size': '4pt',
                'font-family': '\'Verdana\', \'Helvetica\', sans-serif'
            }
        }).addStyle( { 'transform':'rotate(-90, ' + cnfg.x + ' ' + cnfg.y + ')'});


        return ax.add(labels).add( [unitlabel] );
    };

    var createRaster = function( x, y, width, height, step) {
        var i, linepath;

        linepath = '';

        for (i = x; i < x + width; i = i + step) {
              linepath += 'M ' + i + ' ' + y + ' V ' + (y + height);
        };
        for (i = y+height; i > y; i = i - step) {
              linepath += 'M ' + x + ' ' + i + ' H ' + (x + width);
        };

        return path({
                id: config.id + ':raster',
                d: linepath,
                style: {
                    stroke: 'gray',
                    opacity: 0.3,
                    'stroke-width': 0.5
                }
            });
    };


    var create_x_axis = function( cnfg ) {
        var ax,
            unit = cnfg.unit || 1,
            label = cnfg.label || 'cm',
            labeling = cnfg.labeling || 'sparse',
            axis,
            d,
            i,
            step =  10,
			label_step = cnfg.step || 10,
            tickwidth = 3,
            ystart = cnfg.y + cnfg.height - tickwidth;

        d = 'M ' + cnfg.x + ' ' + cnfg.y + 'H ' + (cnfg.x + cnfg.width);

		if (config.style.scale=='default') {
			// create a default axis: with ticks and labels in abundance
			for (i=cnfg.x + step; i < cnfg.x + cnfg.width; i = i + step) {
			    d = d + ' M ' + i + ' '  + cnfg.y + ' V ' +  (cnfg.y + tickwidth);
			};
		} else if (config.style.scale=='scarce') {
			// Create a axis with only the max value
		    d = d + ' M ' + (cnfg.x + ((cnfg.max/unit) * step)) + ' '  + cnfg.y + ' V ' +  (cnfg.y + tickwidth);
		};

        axis = path( {
            id: cnfg.id + ':axis',
            d: d,
            style: {
                'stroke-width': 0.5,
                stroke: 'black'
            }
        })
        ax = group( { id: cnfg.id } );
        ax.add([axis]);

        var labels = [];
        var nr=0;
        var y_string = cnfg.y + 10;

		if (config.style.scale=='default') {
	        for (i = cnfg.x ; i < cnfg.x + cnfg.width; i = i + step) {
	            if (nr%label_step == 0 && nr != 0 ) {
					labels.push(
						createNumberLabel(
								(nr < 100)? ((nr<10)? i-1:i-2): i-5,
	                             y_string, nr, cnfg.id ,{
							'font-size': '3pt',
							'font-family': '\'Verdana\', \'Helvetica\', sans-serif'
							})
					);
	            };
				nr = nr + unit;
	        };
		} else if (config.style.scale=='scarce') {
			nr = cnfg.max;
			i = cnfg.x + (cnfg.max/unit)*step;
			labels.push(
				createNumberLabel(
						(nr < 100)? ((nr<10)? i-1:i-2): i-5,
	                           y_string, nr, cnfg.id ,{
					'font-size': '3pt',
					'font-family': '\'Verdana\', \'Helvetica\', sans-serif'
					})
			);
		};
        var unitlabel = text({
            id: cnfg.id + ':unitlabel',
            x: cnfg.x + 50,
            y: cnfg.y + 20,
            string: cnfg.label,
            style: {
                'font-size': '4pt',
                'font-family': '\'Verdana\', \'Helvetica\', sans-serif'
            }
        });

        return ax.add(labels).add( [unitlabel]);
    };

    var create = function() {
		var padding = 2;
        freehand_cursor = cursor({
                id: config.id + ':freehand_cursor',
                x: 0,
                y: 32,
            });
		freehand_button = toggleButton({
			id: config.id + ':freehand_button',
			x: config.x + config.y_axis.width + padding,
			y: config.y - 15,
			icon: {
				width: 6,
				height: 6,
				url: 'images/pencil.png'
			},
			label: false,
			style: {
				fill: 'white',
				stroke: 'silver'
			}
		});

		line_button = toggleButton({
			id: config.id + ':line_button',
			x: config.x + config.y_axis.width + padding
				+ freehand_button.getWidth() + padding,
			y: config.y - 15,
			icon: {
				width: 6,
				height: 6,
				url: 'images/draw-line-3.png'
			},
			label: false,
			style: {
				fill: 'white',
				stroke: 'silver'
			}
		});
		dot_button = toggleButton({
			id: config.id + ':dot_button',
			x: config.x + config.y_axis.width + padding
				+ freehand_button.getWidth() + padding
				+ line_button.getWidth() + padding,
			y: config.y - 15,
			icon: {
				width: 6,
				height: 6,
				url: 'images/draw-circle.png'
			},
			label: false,
			style: {
				fill: 'white',
				stroke: 'silver'
			}
		});
		erase_button = button({
			id: config.id + ':erase_button',
			x: config.x + config.y_axis.width + padding
				+ freehand_button.getWidth() + padding
				+ line_button.getWidth() + padding
				+ dot_button.getWidth() + 3*padding,
			y: config.y - 15,
			icon: {
				width: 6,
				height: 6,
				url: 'images/draw-eraser.png'
			},
			label: false,
			style: {
				fill: 'white',
				stroke: 'silver'
			}
		});

		answer_button = toggleButton({
			id: config.id + ':answer_button',
			x: config.x + config.y_axis.width + padding
				+ freehand_button.getWidth() + padding
				+ line_button.getWidth() + padding
				+ erase_button.getWidth() + 3*padding
				+ dot_button.getWidth() + 3*padding,
			y: config.y - 15,
			icon: {
				width: 6,
				height: 6,
				url: 'images/chart-curve-add.png'
			},
			label: false,
			style: {
				fill: 'white',
				stroke: 'silver'
			}
		});


		background = rect( {
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            id: config.id + ':background',
            style: {
                fill: 'white',
                opacity: 0.1,
                stroke: 'none'
            }
        } );
        // assen
        y_axis = create_y_axis({
            id: config.id + ':y-axis',
            x: config.x + config.y_axis.width,
            y: config.y,
            height: config.height - config.x_axis.height,
            label: config.y_axis.label,
			step: config.y_axis.step,
			unit: config.y_axis.unit,
			max: config.y_axis.max || 0,
            style: {

            }
        });
        x_axis = create_x_axis({
            id: config.id + ':x-axis',
            x: config.x + config.y_axis.width,
            y: config.y + config.height - config.x_axis.height,
            height: config.height - config.x_axis.height,
            width: config.width - config.y_axis.width,
            label: config.x_axis.label,
			step: config.x_axis.step,
			unit: config.x_axis.unit,
			max: config.x_axis.max || 0,
            style: {

            }
        });
        canvas = rect({
            x: config.x + config.y_axis.width,
            y: config.y,
            width: config.width - config.y_axis.width,
            height: config.height - config.x_axis.height,
            id: config.id + ':canvas',
            style: {
                fill: 'white',
                stroke: 'none'
            }
        });
        raster = createRaster( config.x + config.y_axis.width,
                              config.y,
                              config.width - config.y_axis.width,
                              config.height - config.x_axis.height,
                              10);
        graphs = graphBox( {id: config.id + ':graphs'} );
        usergraph = graphLine( {
                x: config.x,
                y: config.y,
                ox: config.x + config.y_axis.width,
                oy: config.y + config.height - config.x_axis.height,
                id: config.id + ':usergraph',
                style: {
                    stroke: 'black'
                }
            } );
        autograph = graphLine( {
                x: config.x,
                y: config.y,
                ox: config.x + config.y_axis.width,
                oy: config.y + config.height - config.x_axis.height,
                id: config.id + ':autograph',
				unit_x: config.x_axis.unit,
				unit_y: config.y_axis.unit,
                style: {
                    stroke: 'red'
                }
            } );


        graphs.addGraph( 'user', usergraph );
        graphs.addGraph( 'auto', autograph );

		line_line = path({
				id: config.id + ':lineline',
				d: 'M 0 0',
				style: {
					stroke: 'black',
					'stroke-width': 0.5,
					'dash-array': '1 2 1 1'
				}
			});

        glasspane = rect({
            x: config.x + config.y_axis.width,
            y: config.y,
            width: config.width - config.y_axis.width,
            height: config.height - config.x_axis.height,
            id: config.id + ':canvas',
            style: {
                fill: 'white',
                stroke: 'none',
                opacity: 0,
				'pointer-events': 'all'
            }
        });
        glasspane.startListeningTo( 'mouseover', enableDrawing );
        glasspane.startListeningTo( 'mouseout', disableDrawing );

		// configure the buttons

		autograph.addStyle( {display: 'none'});
		answer_button.onToggle(
			function() {
					autograph.addStyle( {display: 'visible'});
			},
			function() {
					autograph.addStyle( {display: 'none'});
				}
		);
		answer_button.disable();

		line_button.onToggle(
			function() {
				line_button.setToggle( true );
				freehand_button.setToggle( false );
				if (freehand_button.isToggled()) {
					freehand_button.toggle();
				};
				dot_button.setToggle( false );
				if (dot_button.isToggled()) {
					dot_button.toggle();
				};
				tool = 'line';
				glasspane.addStyle({
					'cursor': 'crosshair'
				});
			}
		);
		dot_button.onToggle(
			function() {
				dot_button.setToggle( true );
				freehand_button.setToggle( false );
				if (freehand_button.isToggled()) {
					freehand_button.toggle();
				};
				line_button.setToggle( false );
				if (line_button.isToggled()) {
					line_button.toggle();
				};
				tool = 'dot';
				glasspane.addStyle({
					'cursor': 'crosshair'
				});
			}
		);
		freehand_button.onToggle(
			function() {
				freehand_button.setToggle( true );
				dot_button.setToggle( false );
				if (dot_button.isToggled()) {
					dot_button.toggle();
				};
				line_button.setToggle( false );
				if (line_button.isToggled()) {
					line_button.toggle();
				};
				tool = 'freehand';
				glasspane.addStyle({
					'cursor': 'default'
				});
			}
		);
		// default
		freehand_button.toggle();
		freehand_button.setToggle( true );
		dot_button.setToggle( false );
		if (dot_button.isToggled()) {
				dot_button.toggle();
		};
		line_button.setToggle( false );
		if (line_button.isToggled()) {
			line_button.toggle();
		};


		erase_button.click(
			function() {
				graphs.removeGraph( 'user' );
				usergraph = graphLine( {
					x: config.x,
					y: config.y,
					ox: config.x + config.y_axis.width,
					oy: config.y + config.height - config.x_axis.height,
					id: config.id + ':usergraph',
					style: {
						stroke: 'black'
					}
	            } );;
				graphs.addGraph( 'user', usergraph );
				answer_button.disable();
			}
		);


        return group( config )
            .add( [freehand_cursor, freehand_button, line_button,
				   dot_button, erase_button, answer_button,
				   background, y_axis, x_axis, canvas, raster, graphs,
				   line_line, glasspane] )
            .onTop( glasspane );
    };

    var getAutoGraph = function() {
        return autograph;
    };

    that = create();
    that.getAutoGraph = getAutoGraph;
    return that;
};
