// assuming shapes.js is loaded


var ruler = function( cnfg ) {
	var that,
		config = cnfg || {
			x: 0,
			y: 0,
			height: 0,
			width: 50,
			id: ''			
		},
		line_width = cnfg.width || 50;	
	
	var createTickPath = function( width, stp, skp, style ) {
		var step = stp || 1,
			y0 = config.y + config.height - step,
			tickwidth = width || 1,
			skip = skp || [],
			xstart = config.x + config.width - tickwidth,
			d = "M " + config.x + " " + y0,
			i,
			j;
			
		tickwidth = config.x + config.width;
		
		for ( i = y0; i > config.y; i = i - step ) {
			for ( j = 0; j < skip.length; j++ ) {
				if (i % skip[j] === 0) {
					break;
				}
			}
		    d = d + " M " + xstart + " " + i + " H " + tickwidth;
		}
		
		return d;
	};
		
	var createTicks = function(tickwidth, step, skip, style ) {
		return path( {
			d: createTickPath( tickwidth, step, skip, style ),
			id: config.id + ':' + step,
			style: style
		});
	};
	
	var createNumberLabel = function( x, y, nr, style ) {
		var x = x || 0,
			y = y || 0,
			nr = nr || 0,
			style =  style || { 'font-size': '5pt'};

		return text( {
			id: config.id + ':label:' + nr,
			x: x,
			y: y,
			string: '' + nr,
			style: style
	    });
	};
	
	var createNumberLabels = function() {
		var i,
			nr = 0,
			y0 = config.y + config.height,
			x_string = config.x + config.width - 10,
			labels = [],
			labelgroup;
		
		
	    for (i = y0; i > config.y; i = i - 10 ) {
			labels.push(
				createNumberLabel( 
							(nr < 10)? x_string: x_string-3, 
							(nr === 0)? i-1: i+1
							,	nr, { 
						'font-size': '3pt',
						'font-family': '\'Verdana\', \'Tahoma\', \'Helvetica\', sans-serif',
						'font-weight': 'bolder'
						})
				);
			nr++;
	    };
		
		return labels;
	};
	
	var updateLinePath = function( line_y, lw) {
		var end = config.x + lw,
		    x = config.x;
		// in rounded corners, the line is smaller
		if (line_y > config.y + config.height - 3) {
		    x = config.x + 3;
		} else if (line_y > config.y + config.height - 2) {
		    x = config.x + 5;
		} else if (line_y < config.y + 3) {
		    x = config.x - 3;
		} else if (line_y > config.Y + 2) {
		    x = config.x - 5;
		};
		return 'M ' + config.x + ' ' + line_y + ' H ' + end;
	};
	
	var addLine = function( evt ) {
		if (config.rulerlines) {
			var y = evt.getCoordsAt(line.element).y;
			config.rulerlines.addLine( y );
		};
	};
	
	var moveLine = function(evt) {
		var y = evt.getCoordsAt(line.element).y;
		line.addStyle( {
			d: updateLinePath(y, line_width)
		});
	};
	
	var addMovingLine = function() {
		
		glasspane.startListeningTo( 'mousemove', moveLine );
		glasspane.addStyle( {fill: 'yellow', opacity: 0.2} );
	};
	
	var removeMovingLine = function() {
		line.addStyle( {
			d: updateLinePath(0, 0)
		});
		glasspane.stopListeningTo( 'mousemove', moveLine );
		glasspane.addStyle( {fill: 'white', opacity: 0} );
	};
	
	var base, mmticks, halfticks, cmticks, nrlabels, unitlabel, glasspane,
		line;
	var create = function() {
		var rulergroup;
		
		base = rect( {
			x: config.x,
			y: config.y,
			height: config.height,
			width: config.width,
			id: config.id + ':base',
			style: {
				stroke: 'black',
				'stroke-width': 0.5,
				fill: 'none',
				rx: 1,
				ry: 1
				}
			});
		mmticks = createTicks( 2.5, 1, [5, 10], {
				stroke: 'black',
				'stroke-width': 0.2,
				fill: 'none'
			});
		halfticks = createTicks( 4, 5, [10], {
				stroke: 'black',
				'stroke-width': 0.5,
				fill: 'none'
			});
		cmticks = createTicks( 6.5, 10, [], {
				stroke: 'black',
				'stroke-width': 0.8,
				fill: 'none'
			});
		nrlabels = group( 
			{id: config.id + ':labels'}
			).add( createNumberLabels() );
		unitlabel = text( {
			id: config.id + ':unit',
			x: config.x + 1,
			y: config.y + 4,
			string: 'cm',
			style: {
				'font-size': '3pt',
				'font-family': '\'Verdana\', \'Tahoma\', \'Helvetica\', sans-serif',
				'font-weight': 'bolder'
			}
		});
		line = path( {
			id: config.id + ':line',
			d: updateLinePath(0,0),
			style: {
				stroke: 'red',
				'stroke-width': '0.5px',
				opacity: 0.75
				}
		});
		glasspane = rect( {
			x: config.x,
			y: config.y,
			height: config.height,
			width: config.width,
			id: config.id + ':glasspane',
			style: {
				stroke: 'none',
				fill: 'white',
				opacity: 0,
				rx: 1,
				ry: 1
				}
			});
		glasspane.startListeningTo( 'mouseover', addMovingLine );
		glasspane.startListeningTo( 'mouseout', removeMovingLine );
		glasspane.startListeningTo( 'mouseup', addLine );
		rulergroup = group( config );
		rulergroup.add( [base, mmticks, halfticks, cmticks,
					nrlabels, unitlabel, line, glasspane] );
		rulergroup.onTop( glasspane );
		return rulergroup;
	};
	
	var update = function() {
		base.addStyle( {
			x: config.x,
			y: config.y,
			width: config.width,
			height: config.height
		} );
		mmticks.addStyle(
			{ 
				d: createTickPath( 2.5, 1, [5, 10], {
				stroke: 'black',
				'stroke-width': 0.2,
				fill: 'none'
				})
			} );
		halfticks.addStyle(
			{ 
				d: createTickPath( 4, 5, [10], {
				stroke: 'black',
				'stroke-width': 0.5,
				fill: 'none'
				})
			} );
		cmticks.addStyle(
			{ 
				d: createTickPath( 6.5, 10, [], {
				stroke: 'black',
				'stroke-width': 0.8,
				fill: 'none'
				})
			} );
	
		nrlabels.clear().add( createNumberLabels() );
		unitlabel.addStyle(
			{
				x: config.x + 1,
				y: config.y + 4
			});
		glasspane.addStyle( {
			x: config.x,
			y: config.y,
			width: config.width,
			height: config.height
		} );
		
		return this;
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
	
	var setLineWidth = function( w ) {
		line_width = cnfg.width + w;
		return this;
	};
	
	that = create();	
	that.configure = configure;
	that.setLineWidth = setLineWidth;
	return that;
};


/*
 * @class clickLine
 *
 * A line that gets an red cross at its end to remove it.
 *
 */
var clickLine = function( cnfg ) {
	var that,
		config = cnfg || {
			x:0,
			y:0,
			width:0,
			style: {}
		},
		line_height = 0.5,
		lines = null,
		ln, cross, glasspane;

    var crossPath = function( x, y) {
        var x1 = x - 1,
            x2 = x + 1,
            y1 = y - 1,
            y2 = y + 1,
			d;

        d = 'M ' + x1 + ' ' + y1;
        d = d + ' L ' + x2 + ' ' + y2;
        d = d + ' M ' + x1 + ' ' + y2;
        d = d + ' L ' + x2 + ' ' + y1;
        return d;
    };
	
	var displayCross = function(evt) {
		cross.visible(true);
		glasspane.startListeningTo( 'mouseup', hide );
		glasspane.startListeningTo( 'mouseout', nocross);
	};
	
	var nocross = function( evt ) {
		cross.visible(false);
		glasspane.stopListeningTo( 'mouseup', hide);
		glasspane.stopListeningTo( 'mouseout', nocross);
	};
	
	var hide = function( evt ) {
		var group = glasspane.element.parentNode;
		var linesbox = group.parentNode;
		group.removeChild( glasspane.element );
		group.removeChild( ln.element );
		group.removeChild( cross.element );
		linesbox.removeChild( group );
		lines.removeLine( config.y );
	};
	
	var activate = function() {
		ln.visible(true);		
		glasspane.startListeningTo( 'mouseover', displayCross );
	};
	
	var deactivate = function() {
		hide();
	};
	
	var create = function() {
		ln = line( {
			id: config.id + ':line',
			x: config.x,
			y: config.y,
			width: config.width,
			style: {
				'stroke-width': line_height,
				stroke: 'gray',
				'stroke-dasharray': '1 3',
				'stroke-opacity': 0.85
			}	
		});
		cross = path({
			id: config.id + ':cross',
			d: crossPath( config.x-1, config.y ),
			style: {
				'stroke-width': 0.5,
				stroke: 'tomato'
			}
		});
		cross.visible(false);
		glasspane = rect({
			id: config.id + ':glasspane',
			x: config.x,
			y: config.y - line_height,
			width: config.width,
			height: 2*line_height,
			style: {
				fill: 'white',
				opacity: 0,
				'pointer-events': 'all'
			}
		});
		glasspane.startListeningTo( 'mouseover', displayCross );
		lines = config.linebox;
		
		return group({
			id: config.id
		}).add([ln,cross,glasspane]).onTop(glasspane);
	};
	
	that = create();
	that.activate = activate;
	that.deactivate = deactivate;
	return that;
	
};

/*
 * @class rulerLines
 *
 * After clicking on the ruler, a horizontal line is drawn at the height of
 * the click on the ruler. Clicking again on one of those lines will undraw
 * the line again.
 *
 */

var rulerLines = function( cnfg ) {
    var that,
        config = cnfg || {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            style: {
                
            }
        },
        lines = [],
		linesbox;
        
    var create = function() {
        linesbox = group({
			id: config.id
		});
		
		return linesbox;
    };
	
	var addLine =  function( yy ) {
		var y = Math.floor(yy);
		if (!lines[y]) {
			var ln =  clickLine( {
				id: config.id + ':' + y,
				x: config.x,
				y: y,
				width: config.width,
				linebox: this
			});
			lines[y] = ln;
			linesbox.add( [ln] );
		} else {
			// exists; if not visible: make it visible
			lines[y].activate();
		};
		return this;
	};
	
	var removeLine = function( yy ) {
		var y = Math.floor(yy);
		if (lines[y]) {
			delete lines[y];
		};
		return this;
	};
	
	var setWidth = function( w ){
		config.width = w;
		
	};
	
	that = create();
	that.addLine = addLine;
	that.removeLine = removeLine;
	that.setWidth = setWidth;
	return that;
};
