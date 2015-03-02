// assuming shapes.js is loaded
// also: ruler.js and measureline.js

var flask = function( cnfg ) {
    var that,
        config = cnfg || {
            x: 0,
            y: 0,
            top_width: 0,
            bottom_width: 0,
            height: 0,
            id: '',
            style: {

            }
        },
        height,
        alpha,
        top_r,
        bottom_r,
        middle,
        tan_alpha,
        h_step = 0.01,
        step_factor = 100,
        current_volume = 0,
        current_height = 0,
        current_time = 0,
        max_volume,
        max_height,
        top_skip = cnfg.top_skip || 5,
        points = {},
        graph = cnfg.graph,
        timegraph = cnfg.timegraph;

    config.stream = cnfg.stream || {
        x: 0,
        y: 0,
        width: 10,
        sep: 0
    };

    var setGraph = function( name, g ) {
        config[name] = g;
        if(name==='timegraph') {
            timegraph = g;
        } else if (name==='graph') {
            graph = g;
        };
        return this;
    };

    var alpha = function( ) {
        if (top_r > bottom_r ) {
            tan_alpha = config.height / ( top_r - bottom_r );
            //tan_alpha = Math.tan( alpha );
        } else if (top_r < bottom_r) {
            tan_alpha = config.height / ( bottom_r - top_r );
            //tan_alpha = Math.tan( alpha );
        };

    };

    var r = function( h ) {
        var rh;
        if (top_r < bottom_r) {
            rh = ((height - h) / tan_alpha) + top_r;
        } else if ( top_r > bottom_r ) {
            rh = (h / tan_alpha) + bottom_r;
        } else {
            // flask with straight sides: r is constant
            rh = top_r;
        };
        return rh/10;
    };

    var computeMax = function() {
        var vol = 0,
            h = 0,
            floored_vol = 0,
            floored_h = 0;
        // find volume at max_height
        while (h < config.height - top_skip ) {
            h += h_step;
            vol += Math.PI * Math.pow( r(h), 2 ) * h_step;
        };

        // find rounded volume under max_height and adapt max_height
        // accordingly
        while (Math.floor(vol/10)%10 != 0) {
           h -= h_step;
           vol -= Math.PI * Math.pow( r(h), 2 ) * h_step;
        };
        max_height = h;
        max_volume = Math.floor(vol/10);
    }

    var addSome = function( vol ) {
        var filling_vol = current_volume;
        // assuming current_height and current_volume are correct
        while (filling_vol < Math.floor(current_volume + vol*10)) {
            // current_volume grows: update height and corresponding volume
            current_height += h_step;
            filling_vol += Math.PI * Math.pow( r(current_height), 2 )
                * h_step;
        };// filling_vol is about vol

        if ( current_height <= config.height - config.top_skip ) {
            cover.addStyle({
                height: config.height - current_height
            });
            stream.addStyle({
                height: config.stream.sep + config.height - current_height -0.5
            })
        };

        current_time += 20;
        if (graph) {
            graph.addTo( current_volume, -current_height );
        };
        if(timegraph) {
            timegraph.addTo( current_time/100, -current_height );
        };
        current_volume = filling_vol;
    };

    var init = function() {
        height = config.height;
        top_r = config.top / 2;
        bottom_r = config.bottom / 2;
        middle = config.x + Math.max( config.top, config.bottom ) / 2;
        points = {
            topleft: {
                x: middle - top_r,
                y: config.y
            },
            topright: {
                x: middle + top_r,
                y: config.y
            },
            bottomleft: {
                x: middle - bottom_r,
                y: config.y + config.height
            },
            bottomright: {
                x: middle + bottom_r,
                y: config.y + config.height
            }
        };
        alpha();
        current_height = 0;
        current_volume = 0;
        current_time = 0;
        computeMax();
    };

    var computePath = function( close ) {
        var d = '';
        d = d + 'M ' + points.topleft.x + ' ' + points.topleft.y;
        d = d + ' L ' + points.bottomleft.x + ' ' + points.bottomleft.y;
        d = d + ' L ' + points.bottomright.x + ' ' + points.bottomright.y;
        d = d + ' L ' + points.topright.x + ' ' + points.topright.y;
        if (close) {
            d = d + ' Z';
        };
        return d;
    };


    var empty = function() {
        current_height = 0;
        current_volume = 0;
        current_time = 0;
        cover.addStyle({
            height: height - current_height
        });
        graph.clear();
        timegraph.clear();
    };

    var fill, cover, border, max_line, glasspane, stream, streamcover, rulerlns;
    create = function() {
        init();
        fill = path({
            d: computePath( true ),
            id: config.id + ':fill',
            style: {
                fill: config.style['water-color'] || 'blue' ,
                opacity: 0.5,
                stroke: 'none'
            }
        });
        cover = rect( {
            x: config.x -0.5,
            y: config.y-0.5,
            width: Math.max( config.top, config.bottom )+1,
            height: config.height + 1,
            id: config.id + ':cover',
            style: {
                fill: 'white',
                opacity: 1,
                stroke: 'none'
            }
        });
        border = path({
            d: computePath( false ),
            id: config.id + ':border',
            style: {
                fill: 'none',
                stroke: 'black'
            }
        });

        stream = rect({
            x: config.stream.x + 0.5,
            y: config.stream.y ,
            width: config.stream.width-0.5,
            height: config.height + config.stream.sep,
            id: config.id + ':stream',
            style: {
                fill: config.style['water-color'] || 'blue',
                opacity: 0.25,
                stroke: 'none'
            }
        });

        max_line = measureline( {
            x: points.topright.x - 18,
            y: config.y + (config.height - max_height),
            width: 22,
            height: 10,
            padding: 1,
            extra_line: 5,
            label: '' + max_volume + ' ml',
            id: config.id + ':maxlabel',
            cannot_move: true
        });

        if (top_r > bottom_r ) {
            max_line.setPoint( points.topright.x - ( r( max_height )),
                          config.y + (config.height- max_height));
        } else if (top_r < bottom_r ) {
            max_line.setPoint( points.topright.x + r( max_height ),
                          config.y + (config.height- max_height));
        } else {
            max_line.setPoint( points.topright.x,
                          config.y + (config.height- max_height));
        }
        glasspane = rect( {
            x: config.x,
            y: config.y,
            width: Math.max( config.top, config.bottom ),
            height: config.height,
            id: config.id + ':glasspane',
            style: {
                fill: 'white',
                opacity: 0,
                stroke: 'none'
            }
        });

        var gr = group( {id: config.id});
        
        if (cnfg.rulerlines) {
            rulerlns = cnfg.rulerlines;
            gr.add( [fill, cover, stream, rulerlns, border, max_line, glasspane ] ).onTop( glasspane );
        } else {
            gr.add( [fill, cover, stream, border, max_line, glasspane ] ).onTop( glasspane );            
        }

        return gr;
    };

    var is_empty = function() {
        return (current_volume == 0);
    };
    var is_full = function() {
        return (current_volume/10 >= max_volume);
    };

    var getWidth = function() {
        return Math.max(config.top, config.bottom);
    };

    var getHeight = function() {
        return config.height;
    };

    var getMax = function() {
        return max_volume;
    };
    
    var getMaxHeight = function() {
        return max_height;
    };


    var disableStream = function() {
        stream.visible(false);
        return this;
    };

    var enableStream = function() {
        stream.visible(true);
        return this;
    }

    that = create();
    that.addSome = addSome;
    that.empty = empty;
    that.is_empty = is_empty;
    that.is_full = is_full;
    that.setGraph = setGraph;
    that.getWidth = getWidth;
    that.getHeight = getHeight;
    that.getMax = getMax;
    that.getMaxHeight = getMaxHeight;
    that.disableStream = disableStream;
    that.enableStream = enableStream;
    return that;
};

// Erlenmeyer flask: special version of flask

var erlenmeyer = function( cnfg ) {
    var that,
        config = cnfg || {
            x: 0,
            y: 0,
            top_width: 0,
            bottom_width: 0,
            height: 0,
            id: '',
            style: {

            }
        },
        height,
        alpha,
        top_r,
        bottom_r,
        middle,
        tan_alpha,
        h_step = 0.01,
        step_factor = 100,
        current_volume = 0,
        current_height = 0,
        current_time = 0,
        max_volume,
        max_height,
        top_skip = cnfg.top_skip || 5,
        points = {},
        graph = cnfg.graph,
        timegraph = cnfg.timegraph;

    config.stream = cnfg.stream || {
        x: 0,
        y: 0,
        width: 10,
        sep: 0
    };

    var setGraph = function( name, g ) {
        config[name] = g;
        if(name==='timegraph') {
            timegraph = g;
        } else if (name==='graph') {
            graph = g;
        };
        return this;
    };

    var r = function( h ) {
        var rh;
        if (h<=12.5) {
            // tan alpha = 12.5 / 12.5  = 1
            // bottom_r = 30
            rh = (h / 1) + 30;
        } else if (h<=105) {
            // tan alpha = 27.5 / 92.5
            // bottom_r = 42.5, top = 15
            
            rh = ((105 - h ) / (92.5/27.5)) + 15;
            
        } else {
            // h <= 140
            // hals_r = 15
            rh = 15;
        };
        return rh/10;
    };

    var computeMax = function() {
        var vol = 0,
            h = 0,
            floored_vol = 0,
            floored_h = 0;
        // find volume at max_height
        while (h < config.height - top_skip ) {
            h += h_step;
            vol += Math.PI * Math.pow( r(h), 2 ) * h_step;
        };

        // find rounded volume under max_height and adapt max_height
        // accordingly
        while (Math.floor(vol/10)%10 != 0) {
           h -= h_step;
           vol -= Math.PI * Math.pow( r(h), 2 ) * h_step;
        };
        max_height = h;
        max_volume = Math.floor(vol/10);
    }

    var addSome = function( vol ) {
        var filling_vol = current_volume;
        // assuming current_height and current_volume are correct
        while (filling_vol < Math.floor(current_volume + vol*10)) {
            // current_volume grows: update height and corresponding volume
            current_height += h_step;
            filling_vol += Math.PI * Math.pow( r(current_height), 2 )
                * h_step;
        };// filling_vol is about vol

        if ( current_height <= config.height - config.top_skip ) {
            cover.addStyle({
                height: config.height - current_height
            });
            stream.addStyle({
                height: config.stream.sep + config.height - current_height
            })
        };

        current_time += 20;
        if (graph) {
            graph.addTo( current_volume, -current_height );
        };
        if(timegraph) {
            timegraph.addTo( current_time/100, -current_height );
        };
        current_volume = filling_vol;
    };

    var init = function() {
        height = 140;
        top_r = 15;
        bottom_r = 42.5;
        middle = config.x + 42.5;
        points = {
            topleft: {
                x: middle - top_r,
                y: config.y
            },
            topright: {
                x: middle + top_r,
                y: config.y
            },
            bottomleft: {
                x: middle - bottom_r,
                y: config.y + config.height
            },
            bottomright: {
                x: middle + bottom_r,
                y: config.y + config.height
            }
        };
        current_height = 0;
        current_volume = 0;
        current_time = 0;
        computeMax();
    };

    var computePath = function( close ) {
        var d = '';
        d = d + 'M ' + (config.x + 27.5) + ' ' + (config.y + 0);
        d = d + 'V ' + (config.y + 35);
        d = d + 'L ' + (config.x + 1.3) + ' ' + (config.y + 124.5);
        d = d + ' C ' + (config.x - 2.5) + ' ' + (config.y + 135)
            + ' ' + (config.x -1.2) + ' ' + (config.y + 139)
            + ' ' + (config.x + 12.5) + ' ' + (config.y + 140);
        d = d + ' H ' + (config.x + 60);
        d = d + ' C ' + (config.x + 87.5) + ' ' + (config.y + 139)
            + ' ' + (config.x + 86.2) + ' ' + (config.y + 135)
            + ' ' + (config.x + 83.7) + ' ' + (config.y + 124.5);
        d = d + ' L ' + (config.x + 57.5) + ' ' + (config.y + 35);
        d = d + ' V ' + (config.y + 0);
        
        if (close) {
            d = d + ' Z';
        };
        return d;
    };


    var empty = function() {
        current_height = 0;
        current_volume = 0;
        current_time = 0;
        cover.addStyle({
            height: height - current_height
        });
        graph.clear();
        timegraph.clear();
    };

    var fill, cover, border, max_line, glasspane, stream, streamcover, rulerlns;
    create = function() {
        init();
        fill = path({
            d: computePath( true ),
            id: config.id + ':fill',
            style: {
                fill: config.style['water-color'] || 'blue' ,
                opacity: 0.5,
                stroke: 'none'
            }
        });
        cover = rect( {
            x: config.x,
            y: config.y,
            width: 85,
            height: height,
            id: config.id + ':cover',
            style: {
                fill: 'white',
                opacity: 1,
                stroke: 'none'
            }
        });
        border = path({
            d: computePath( false ),
            id: config.id + ':border',
            style: {
                fill: 'none',
                stroke: 'black'
            }
        });

        stream = rect({
            x: config.stream.x + 0.5,
            y: config.stream.y ,
            width: config.stream.width-0.5,
            height: config.height + config.stream.sep,
            id: config.id + ':stream',
            style: {
                fill: config.style['water-color'] || 'blue',
                opacity: 0.25,
                stroke: 'none'
            }
        });

        max_line = measureline( {
            x: points.topright.x - 18,
            y: config.y + (height - max_height),
            width: 22,
            height: 10,
            padding: 1,
            extra_line: 5,
            label: '' + max_volume + ' ml',
            id: config.id + ':maxlabel',
            cannot_move: true
        });

        max_line.setPoint( points.topright.x,
                          config.y + (config.height - max_height)+1.5);
        glasspane = rect( {
            x: config.x,
            y: config.y,
            width: 85,
            height: height,
            id: config.id + ':glasspane',
            style: {
                fill: 'white',
                opacity: 0,
                stroke: 'none'
            }
        });
        
        var gr = group( {id: config.id});
        
        if (cnfg.rulerlines) {
            rulerlns = cnfg.rulerlines;
            gr.add( [fill, cover, stream, rulerlns, border, max_line, glasspane ] ).onTop( glasspane );
        } else {
            gr.add( [fill, cover, stream, border, max_line, glasspane ] ).onTop( glasspane );            
        }

        return gr;
    };

    var is_empty = function() {
        return (current_volume == 0);
    };
    var is_full = function() {
        return (current_volume/10 >= max_volume);
    };

    var getWidth = function() {
        return 85;
    };

    var getHeight = function() {
        return height;
    };

    var getMax = function() {
        return max_volume;
    };
    
    var getMaxHeight = function() {
        return max_height;
    };

    var disableStream = function() {
        stream.visible(false);
        return this;
    };

    var enableStream = function() {
        stream.visible(true);
        return this;
    };

    that = create();
    that.addSome = addSome;
    that.empty = empty;
    that.is_empty = is_empty;
    that.is_full = is_full;
    that.setGraph = setGraph;
    that.getWidth = getWidth;
    that.getHeight = getHeight;
    that.getMax = getMax;
    that.getMaxHeight = getMaxHeight;
    that.disableStream = disableStream;
    that.enableStream = enableStream;
    return that;
};

// Bowl flask: special version of flask

var bowl = function( cnfg ) {
    var that,
        config = cnfg || {
            x: 0,
            y: 0,
            top_width: 10,
            bottom_width: 10,
            bottom: 10,
            height: 10,
            id: '',
            height: 150,
            style: {

            }
        },
        height = config.height,
        bowl_r = height/2,
        straight = config.bottom,
        width = straight + height,
        h_step = 0.01,
        step_factor = 100,
        current_volume = 0,
        current_height = 0,
        current_time = 0,
        max_volume,
        max_height,
        top_skip = cnfg.top_skip || 5,
        points = {},
        graph = cnfg.graph,
        timegraph = cnfg.timegraph;

    config.stream = cnfg.stream || {
        x: 0,
        y: 0,
        width: 10,
        sep: 0
    };

    var setGraph = function( name, g ) {
        config[name] = g;
        if(name==='timegraph') {
            timegraph = g;
        } else if (name==='graph') {
            graph = g;
        };
        return this;
    };

    var r = function( h ) {
        var rh;
        if (h<bowl_r) {
            rh = Math.sqrt(Math.pow(bowl_r,2) - Math.pow(bowl_r-h,2));
        } else if (h==bowl_r) {
            rh = bowl_r;
        } else {
            rh = Math.sqrt(Math.pow(bowl_r,2) - Math.pow(h-bowl_r,2));
        };
        return (rh+straight/2)/10;
    };

    var computeMax = function() {
        var vol = 0,
            h = 0,
            floored_vol = 0,
            floored_h = 0;
        // find volume at max_height
        while (h < config.height - top_skip ) {
            h += h_step;
            vol += ( (Math.PI * Math.pow( r(h), 2 ) ) )*  h_step;
        };

        // find rounded volume under max_height and adapt max_height
        // accordingly
        while (Math.floor(vol/10)%10 != 0) {
           h -= h_step;
           vol -= ((Math.PI * Math.pow( r(h), 2 ) ) )* h_step;
        };
        max_height = h;
        max_volume = Math.floor(vol/10);
    }

    var addSome = function( vol ) {
        var filling_vol = current_volume;
        // assuming current_height and current_volume are correct
        while (filling_vol < Math.floor(current_volume + vol*10)) {
            // current_volume grows: update height and corresponding volume
            current_height += h_step;
            filling_vol += Math.PI * Math.pow( r(current_height), 2 )
                * h_step;
        };// filling_vol is about vol

        if ( current_height <= config.height - config.top_skip ) {
            cover.addStyle({
                height: config.height - current_height
            });
            stream.addStyle({
                height: config.stream.sep + config.height - current_height
            })
        };

        current_time += 20;
        if (graph) {
            graph.addTo( current_volume, -current_height );
        };
        if(timegraph) {
            timegraph.addTo( current_time/100, -current_height );
        };
        current_volume = filling_vol;
    };

    var init = function() {
        top_r = straight/2;
        bottom_r = straight/2;
        middle = config.x + bowl_r + straight/2;
        points = {
            topleft: {
                x: middle - top_r,
                y: config.y
            },
            topright: {
                x: middle + top_r,
                y: config.y
            },
            bottomleft: {
                x: middle - bottom_r,
                y: config.y + config.height
            },
            bottomright: {
                x: middle + bottom_r,
                y: config.y + config.height
            }
        };
        current_height = 0;
        current_volume = 0;
        current_time = 0;
        computeMax();
    };

    var computePath = function( close ) {
        var d = '';
        d = d + ' M ' + (config.x + bowl_r + straight) + ' ' + (config.y + 0);
        d = d + ' A ' + bowl_r + ' ' + bowl_r + ' 0 0 1 ' +
            (config.x + bowl_r + straight) + ' ' + (config.y + height);
        d = d + ' L ' + (config.x + bowl_r) + ' ' + (config.y + height) ;
        d = d + ' A ' + bowl_r + ' ' + bowl_r + ' 0 0 1 ' +
            (config.x + bowl_r ) + ' ' + (config.y + 0);
        
        if (close) {
            d = d + ' Z';
        };
        return d;
    };


    var empty = function() {
        current_height = 0;
        current_volume = 0;
        current_time = 0;
        cover.addStyle({
            height: height - current_height
        });
        graph.clear();
        timegraph.clear();
    };

    var fill, cover, border, max_line, glasspane, stream, streamcover, rulerlns;
    create = function() {
        init();
        fill = path({
            d: computePath( true ),
            id: config.id + ':fill',
            style: {
                fill: config.style['water-color'] || 'blue' ,
                opacity: 0.5,
                stroke: 'none'
            }
        });
        cover = rect( {
            x: config.x,
            y: config.y,
            width: width,
            height: height,
            id: config.id + ':cover',
            style: {
                fill: 'white',
                opacity: 1,
                stroke: 'none'
            }
        });
        border = path({
            d: computePath( false ),
            id: config.id + ':border',
            style: {
                fill: 'none',
                stroke: 'black'
            }
        });

        stream = rect({
            x: config.stream.x + 0.5,
            y: config.stream.y ,
            width: config.stream.width-0.5,
            height: config.height + config.stream.sep,
            id: config.id + ':stream',
            style: {
                fill: config.style['water-color'] || 'blue',
                opacity: 0.25,
                stroke: 'none'
            }
        });

        max_line = measureline( {
            x: points.topright.x - 18,
            y: config.y + (height - max_height),
            width: 22,
            height: 10,
            padding: 1,
            extra_line: 5,
            label: '' + max_volume + ' ml',
            id: config.id + ':maxlabel',
            cannot_move: true
        });
        
        max_line.setPoint( points.topright.x,
                          config.y + (config.height - max_height));
        glasspane = rect( {
            x: config.x,
            y: config.y,
            width: width,
            height: height,
            id: config.id + ':glasspane',
            style: {
                fill: 'white',
                opacity: 0,
                stroke: 'none'
            }
        });
        
        var gr = group( {id: config.id});
        
        if (cnfg.rulerlines) {
            rulerlns = cnfg.rulerlines;
            gr.add( [fill, cover, stream, rulerlns, border, max_line, glasspane ] ).onTop( glasspane );
        } else {
            gr.add( [fill, cover, stream, border, max_line, glasspane ] ).onTop( glasspane );            
        }

        return gr;
    };

    var is_empty = function() {
        return (current_volume == 0);
    };
    var is_full = function() {
        return (current_volume/10 >= max_volume);
    };

    var getWidth = function() {
        return width;
    };

    var getHeight = function() {
        return height;
    };

    var getMax = function() {
        return max_volume;
    };
    
    var getMaxHeight = function() {
        return max_height;
    };

    var disableStream = function() {
        stream.visible(false);
        return this;
    };

    var enableStream = function() {
        stream.visible(true);
        return this;
    };

    that = create();
    that.addSome = addSome;
    that.empty = empty;
    that.is_empty = is_empty;
    that.is_full = is_full;
    that.setGraph = setGraph;
    that.getWidth = getWidth;
    that.getHeight = getHeight;
    that.getMax = getMax;
    that.getMaxHeight = getMaxHeight;
    that.disableStream = disableStream;
    that.enableStream = enableStream;
    return that;
};