/*
 * @author HT de Beer H.T.de.Beer@gmail.com
 * @version 0.1
 *
 *
 */

/*
 * @class flaskfiller
 *
 * A simulation of filling a glass with water; with movable measuring
 * lines and a graphing tool.
 *
 */
var flaskfiller = function( cnfg ) {
    var that,
        config = cnfg || {},
        state = {
            time: 0,
            vol: 0,
            filling: false,
	    water_speed: cnfg.configuration.water_speed || 5
        },
	time_interval = 50,
	water_add = state.water_speed / time_interval,
        start_button, pause_button, again_button,
        mlb_button, graph_button, time_button,
        vtap, vruler, vflask, vtime,
        vmlbox, vgraph, vtimegraph, vrulerlines;

    config.x = cnfg.x || 0;
    config.y = cnfg.y || 0;
    config.flask = cnfg.flask || {
        type: 'default',
        top: 40,
        bottom: 40,
        height: 80,
        foot: false
    };
    config.configuration = cnfg.configuration || {
        measurelines: false,
        graph: false,
        time: false
    };

    /*
     * @private
     *
     * Create this flaskfiller instance
     */
    var create = function() {
        var seperator = 2;
        start_button = button({
                id: 'startbtn',
                x: config.x + seperator,
                y: config.y + seperator,
                icon: {
                    width: 8,
                    height: 8,
                    url: 'images/media-playback-start.png'
                },
                label: {
                    string: 'start',
                    style: {
                        'font-style:': '5pt',
                        'font-family': 'Verdana, Helvetica, sans-serif'
                    }
                },
                style: {
                    fill: 'white',
                    stroke: 'silver'
                }
            });
        pause_button = button({
                id: 'pausebtn',
                x: config.x + seperator
                    + start_button.getWidth() + seperator,
                y: config.y + seperator,
                icon: {
                    width: 8,
                    height: 8,
                    url: 'images/media-playback-pause.png'
                },
                label: {
                    string: 'pause',
                    style: {
                        'font-style:': '5pt',
                        'font-family': 'Verdana, Helvetica, sans-serif'
                    }
                },
                style: {
                    fill: 'white',
                    stroke: 'silver'
                }
            });
        again_button = button({
                id: 'againbtn',
                x: config.x + seperator
                    + start_button.getWidth() + seperator
                    + pause_button.getWidth() + seperator,
                y: config.y + seperator,
                icon: {
                    width: 8,
                    height: 8,
                    url: 'images/media-skip-backward-7.png'
                },
                label: {
                    string: 'leegmaken',
                    style: {
                        'font-style:': '5pt',
                        'font-family': 'Verdana, Helvetica, sans-serif'
                    }
                },
                style: {
                    fill: 'white',
                    stroke: 'silver'
                }
            });
        mlb_button = toggleButton({
                id: 'mlbbtn',
                toggled: false,
                x: config.x + seperator
                    + start_button.getWidth() + seperator
                    + pause_button.getWidth() + seperator
                    + 3*seperator
                    + again_button.getWidth() + seperator,
                y: config.y + seperator,
                icon: {
                    width: 8,
                    height: 8,
                    url: 'images/align-vertical-center-2.png'
                },
                label: false,
                style: {
                    fill: 'white',
                    stroke: 'silver'
                }
            });
        time_button = toggleButton({
                id: 'timebtn',
                toggled: false,
                x: config.x + seperator
                    + start_button.getWidth() + seperator
                    + pause_button.getWidth() + seperator
                    + 3*seperator
                    + mlb_button.getWidth() + seperator
                    + again_button.getWidth() + seperator,
                y: config.y + seperator,
                icon: {
                    width: 8,
                    height: 8,
                    url: 'images/clock-add.png'
                },
                label: false,
                style: {
                    fill: 'white',
                    stroke: 'silver'
                }
            });
        graph_button = toggleButton({
                id: 'graphbtn',
                toggled: false,
                x: config.x + seperator
                    + start_button.getWidth() + seperator
                    + pause_button.getWidth() + seperator
                    + 3*seperator
                    + mlb_button.getWidth() + seperator
                    + time_button.getWidth() + seperator
                    + again_button.getWidth() + seperator,
                y: config.y + seperator,
                icon: {
                    width: 8,
                    height: 8,
                    url: 'images/chart-curve-edit.png'
                },
                label: false,
                style: {
                    fill: 'white',
                    stroke: 'silver'
                }
            });

        var rulerwidth = 20,
            rulersep = 10,
            tapsep = 10,
            mlsep = 20,
            graphsep = 50, // was 65
            buttonssep = 10,
            timesep = 7;

        vtap = tap({
            id: 'tap',
            x: config.x+rulerwidth+rulersep + seperator
                + Math.max( config.flask.top, config.flask.bottom ) / 2
                - 5,
            y: config.y + buttonssep + start_button.getHeight(),
            style: {
                fill: 'white',
                stroke: 'black'
            }
            });

		vrulerlines = rulerLines({
			id: 'rulerlines',
			x: config.x + rulerwidth + rulersep/2,
			y: config.y + buttonssep + start_button.getHeight()
				+ vtap.getHeight() + tapsep,
			width: 0
		});
		
        vruler = ruler({
            id: 'ruler',
                x: config.x + seperator,
                y: config.y + buttonssep + start_button.getHeight()
                    + vtap.getHeight() + tapsep,
                width: rulerwidth,
                height: config.flask.height*1.1,
				rulerlines: vrulerlines
            });
		
		
        if (config.flask.type === 'default') {
            vflask = flask({
                id: 'flask',
                x: config.x + rulerwidth + rulersep + seperator,
                y: config.y + buttonssep + start_button.getHeight()
                        + vtap.getHeight() + tapsep + config.flask.height*0.1,
                height: config.flask.height,
                top: config.flask.top,
                bottom: config.flask.bottom,
                max: 50,
                top_skip: config.flask.top_skip || 5,
                stream: {
                    x: config.x+rulerwidth+rulersep + seperator
                        + Math.max( config.flask.top, config.flask.bottom ) / 2
                        - 5,
                    y: config.y + buttonssep + start_button.getHeight()
                        + vtap.getHeight(),
                    width: 10,
                    sep: tapsep + config.flask.height*0.1
                },
                style: {
                    'water-color': 'rgb(100,149,237)'
                },
				rulerlines: vrulerlines
                //graph: vgraph.getAutoGraph(),
                //timegraph: vtimegraph.getAutoGraph()
                });
        } else if (config.flask.type === 'erlenmeyer') {
            vflask = erlenmeyer({
                id: 'flask',
                x: config.x + rulerwidth + rulersep + seperator,
                y: config.y + buttonssep + start_button.getHeight()
                        + vtap.getHeight() + tapsep + config.flask.height*0.1,
                height: config.flask.height,
                top: config.flask.top,
                bottom: config.flask.bottom,
                max: 50,
                top_skip: config.flask.top_skip || 7,
                stream: {
                    x: config.x+rulerwidth+rulersep + seperator
                        + Math.max( config.flask.top, config.flask.bottom ) / 2
                        - 5,
                    y: config.y + buttonssep + start_button.getHeight()
                        + vtap.getHeight(),
                    width: 10,
                    sep: tapsep + config.flask.height*0.1
                },
                style: {
                    'water-color': 'rgb(100,149,237)'
                },
				rulerlines: vrulerlines
                //graph: vgraph.getAutoGraph(),
                //timegraph: vtimegraph.getAutoGraph()
                });
        } else if (config.flask.type === 'bowl') {
            vflask = bowl({
                id: 'flask',
                x: config.x + rulerwidth + rulersep + seperator,
                y: config.y + buttonssep + start_button.getHeight()
                        + vtap.getHeight() + tapsep + config.flask.height*0.1,
                height: config.flask.height,
                top: config.flask.top,
                bottom: config.flask.bottom,
                max: 50,
                top_skip: config.flask.top_skip || 7,
                stream: {
                    x: config.x+rulerwidth+rulersep + seperator
                        + Math.max( config.flask.top, config.flask.bottom ) / 2
                        - 5,
                    y: config.y + buttonssep + start_button.getHeight()
                        + vtap.getHeight(),
                    width: 10,
                    sep: tapsep + config.flask.height*0.1
                },
                style: {
                    'water-color': 'rgb(100,149,237)'
                },
				rulerlines: vrulerlines
                //graph: vgraph.getAutoGraph(),
                //timegraph: vtimegraph.getAutoGraph()
                });
        };
        vflask.disableStream();

		
        vrulerlines.setWidth( vflask.getWidth() + rulersep*1.5 );
		vruler.setLineWidth( vflask.getWidth() + rulersep*1.5 );
		
		var graphwidth = config.configuration.graph.width || 180;
        var graphunit = Math.ceil(vflask.getMax()*1.1/graphwidth/10);
        if (vflask.getMax() < 150 ) {
            while (graphunit % 10 != 0) {
                graphunit++;
            };
        } else if (vflask.getMax() < 300) {
            while (graphunit % 15 != 0) {
                graphunit++;
            };
        } else if (vflask.getMax() < 400) {
            while (graphunit % 25 != 0) {
                graphunit++;
            };
        } else if (vflask.getMax() < 500) {
            while (graphunit % 50 != 0) {
                graphunit++;
            };
        } else if (vflask.getMax() < 1000) {
            while (graphunit % 75 != 0) {
                graphunit++;
            };
		} else if (vflask.getMax() > 1000) {
			while (graphunit % 125 != 0)
			{
				graphunit++;
			};
        } else {
            while (graphunit % 25 != 0) {
                graphunit++;
            };
        };
        vgraph = graphBase({
                id: 'graph',
                x: config.x + seperator + rulersep + seperator
                    + vflask.getWidth()
                    + graphsep,
                y: config.y + buttonssep + start_button.getHeight()
                    + vtap.getHeight() + tapsep,
                width: graphwidth,
                height: config.flask.height*1.1 + 10,
                x_axis: {
                    height: 10,
                    label: 'hoeveelheid water in het glas (ml)',
                    step: 20,
                    unit: graphunit,
					max: vflask.getMax()
                },
                y_axis: {
                    width: 10,
                    label: 'hoogte van het water (cm)',
                    step: 1,
                    unit: 1,
					max: vflask.getMaxHeight()
                },
                style: {
					scale: config.configuration.graph.scale || 'default'
				}
            });
        //var timeunit = (vflask.getMax()/cnfg.configuration.water_speed)*1.2/graphwidth/10 +1;
		var timemax = vflask.getMax() / cnfg.configuration.water_speed;
        if (timemax < graphwidth ) {
			timeunit = 1;
        } else if (timemax < 1.5 * graphwidth) {
			timeunit = 2
        } else if (timemax < 3 * graphwidth ) {
            timeunit = 4;
        } else if (timemax < 5 * graphwidth ) {
            timeunit = 6;
        } else if (timemax < 10 * graphwidth ) {
            timeunit = 10;
        } else {
			timeunit = 5;
		};

        vtimegraph = graphBase({
                id: 'timegraph',
                x: config.x + seperator + rulersep + seperator
                    + Math.max( config.flask.top, config.flask.bottom )
                    + graphsep,
                y: config.y + buttonssep + start_button.getHeight()
                    + vtap.getHeight() + tapsep,
                width: graphwidth,
                height: config.flask.height*1.1 + 10,
                x_axis: {
                    height: 10,
                    label: 'verstreken tijd (seconden)',
                    step: 1,
                    unit: Math.floor( timeunit ) + 1,
					max: vflask.getMax()/cnfg.configuration.water_speed
                },
                y_axis: {
                    width: 10,
                    label: 'hoogte van het water (cm)',
                    step: 1,
                    unit: 1,
					max: vflask.getMaxHeight()
                },
                style: {
					scale: config.configuration.graph.scale || 'default'
				}
            });
        vflask.setGraph( 'timegraph', vtimegraph.getAutoGraph());
        vflask.setGraph( 'graph', vgraph.getAutoGraph());

        var mlstep = (vflask.getMax() > 100)?20:10;
        vmlbox = measurelineBox({
            id: 'measurelinesbox',
            x: config.x + seperator,
            y: config.y + buttonssep + start_button.getHeight()
                    + vtap.getHeight() + tapsep + config.flask.height
                    + mlsep,
            'line-width': 150,
            cols: 5,
			// MAGIC NUMBER <-- what does it mean?
			// 5: four measure lines
			// 4: five measure lines
			// 2: a lot of measure lines
            step: graphunit*4,
            sep: 3,
            margin: 2,
            max: vflask.getMax()-1,
            style: {
                fill: 'gold'
            }
        });

        vtime = text({
            id: 'time',
            x: config.x + seperator + rulersep + seperator
                    + Math.max( config.flask.top, config.flask.bottom )
                    + graphsep - 2*timesep,
            y: config.y + buttonssep + start_button.getHeight()
                    + tapsep + timesep,
            string: '12.0 seconden',
            style: {
                'font-family': 'Verdana, Helvetiva, sans-serif',
                'font-size': '5pt',
                fill: 'black',
                stroke: 'none',
                'pointer-events': 'none'
            }
        });


        pause_button.disable();
        again_button.disable();
        start_button.enable();
        start_button.click(
            function() {
                if (!state.filling) {
                    state.filling = true;
                    start_button.disable();
                    pause_button.enable();
                    again_button.enable();
                    vflask.enableStream();
                    setTimeout( fill, 20, water_add);

                };
            }
        );
        pause_button.click(
            function() {
                if (state.filling) {
                    state.filling = false;
                    start_button.enable();
                    pause_button.disable();
                    vflask.disableStream();
                };
            }
        );
        again_button.click(
            function() {
                state.filling = false;
                start_button.enable();
                again_button.disable();
                pause_button.disable();
                vflask.disableStream();
                state.time = 0;
                state.vol = 0;
                vflask.empty();
                vtap.setText( '0 ml' );
                vtime.setText( '0 seconden' );
            }
        );

        vmlbox.visible( false );
        mlb_button.setToggle(false);
        mlb_button.onToggle(
            function() {
                vmlbox.visible(true);
                },
            function() {
                vmlbox.visible(false);
            }
        );

        vgraph.visible( false );
        graph_button.setToggle(false);
        graph_button.onToggle(
            function() {
                if (time_button.isToggled()) {
                    vtimegraph.visible(true);
                } else {
                    vgraph.visible(true);
                };
            },
            function() {
                if (time_button.isToggled()) {
                    vtimegraph.visible( false );
                } else {
                    vgraph.visible(false);
                };
            }
        );

        vtime.visible( false );
        vtimegraph.visible( false );
        time_button.setToggle(false);
        time_button.onToggle(
            function() {
                vtime.visible(true);
                if (graph_button.isToggled()) {
                    vtimegraph.visible(true);
                    vgraph.visible(false);
                }
            },
            function() {
                vtime.visible(false);
                if (graph_button.isToggled()) {
                    vtimegraph.visible(false);
                    vgraph.visible(true);
                }

            }
        );

        vtap.setText( '0 ml' );
        vtime.setText( '0 seconden' );
		
		// what elements are available?
		if (!cnfg.configuration.measurelines) {
			mlb_button.visible(false);
			vmlbox.visible(false);
		};
		if (!cnfg.configuration.graph) {
			graph_button.visible(false);
			vgraph.visible(false);
			vtimegraph.visible(false);
		};
		

        return group({
            id: 'flaskfiller'
        }).add([
            start_button, pause_button, again_button, mlb_button,
            time_button,
            graph_button, vtap, vflask, vruler,
            vmlbox, vgraph, vtimegraph, vtime
        ]);
    };

    var fill = function( add ) {
        state.time += 1000/time_interval;
        if (!vflask.is_full() && state.filling) {
            state.vol += add;
            vtap.setText( (state.vol).toFixed(1) + ' ml');
            vtime.setText( (state.time/1000).toFixed(1) + ' seconden');
            vflask.addSome( add );
            setTimeout( fill, 1000/time_interval, water_add );
        } else if (vflask.is_full()) {
            // Stop filling; only action is to restart the simulation
            state.filling = false;
            start_button.disable();
            pause_button.disable();
            again_button.enable();
            vflask.disableStream();
        };
    };

    that = create();
    that.fill = fill;
    return that;
};
