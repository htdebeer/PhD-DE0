
/*
 * @author HT de Beer H.T.de.Beer@gmail.com
 * @version 0.0
 *
 * This file contains a hierarchy of different kinds of buttons. Starting with
 * a simple click button and a toggle button. A button can contain an image
 * and/or a text. Its width can be set or computed.
 */

/*
 * @class button
 */
var button = function( cnfg ) {
    var that,
        padding = 2,
        config = cnfg || {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            compute_width: true,
            label: null,
            image: null,
            click: null,
            id: '',
            style: {
                background_color: 'gold',
                stroke: 'black',
                'font-family': 'Verdana, Helvetica, sans-serif'
            }
        },
        icon_width = 0,
        icon_height = 0,
        label_height = 0,
        label_width = 0,
        background, icon, label, glasspane;

        /*
         * @private
         *
         */
        var create = function() {
            var btn;

            if (config.icon) {
                icon = image({
                    id: config.id + ':icon',
                    x: config.x + padding,
                    y: config.y + padding,
                    width: config.icon.width,
                    height: config.icon.height,
                    url: config.icon.url,
                    style: config.icon.style
                });
                icon.addStyle({'pointer-events': 'none'});
                icon_height = config.icon.height;
                icon_width = config.icon.width;
            };
            if (config.label) {
                label = text( {
                    id: config.id + ':label',
                    x: config.x + padding + icon_width + padding,
                    y: config.y + padding,
                    string: config.label.string,
                    style: {
                        'font-family': config.label.style['font-family']
                            || 'Verdana, sans-serif',
                        'font-size': config.label.style['font-size']
                            || '5pt',
                        'font-weight': config.label.style['font-weight']
                            || 'normal',
                        fill: config.label.style.fill || 'black',
                        stroke: 'none'
                     }
                });
                label.addStyle({'pointer-events': 'none'})
                label_width = label.getWidth();
                label_height = label.getHeight();
            };
            config.width = padding + icon_width + padding
                + label_width + padding;
            config.height = Math.max( icon_height, label_height )
                + 2*padding;
            if (config.label) {
                label.addStyle( {
                    y: config.y + (config.height/2) + padding*0.677
                });
            };

            background = rect( {
                id: config.id + ':background',
                x: config.x,
                y: config.y,
                width: config.width,
                height: config.height,
                style: {
                    stroke: config.style.stroke || 'black',
                    fill: config.style.fill || 'gold',
                    opacity: config.style.opacity || 1,
                    'stroke-width': 0.5,
                    'pointer-events': 'none'
                }
            });
            glasspane = rect( {
                id: config.id + ':glasspane',
                x: config.x,
                y: config.y,
                width: config.width,
                height: config.height,
                style: {
                    fill: 'white',
                    opacity: 0,
                    stroke: 'none'
                }
            });
            glasspane.startListeningTo( 'mouseover', highlight);
            glasspane.startListeningTo( 'mouseout', unhighlight);
            glasspane.startListeningTo( 'mousedown', activate);
            glasspane.startListeningTo( 'mouseup', deactivate);

            btn = group( {
                id: config.id,
                style: config.style
            }).add([background]);
            if (config.icon) {
                btn.add([ icon ]);
            };
            if (config.label) {
                btn.add([label]);
            };
            btn.add([glasspane]).onTop(glasspane);
            return btn;
        };

        var click = function( fn ) {
            glasspane.startListeningTo( 'mouseup', fn);
        };

        /*
         * @private
         *
         * When on this button is clicked it looks activated; mousedown
         * handler.
         */
        var activate = function() {
            background.addStyle({
                fill: config.style.activate_fill || 'yellow'
            });
        };

        /*
         * @private
         *
         * After clicking, the botton looks the same as before: mouseup
         * handler.
         */
        var deactivate = function() {
            background.addStyle({
                fill: config.style.fill
            });
        };

        /*
         * @private
         *
         * When on the mouse cursor is over this button, and it is enables,
         * it will highlight; mouseover handler.
         */
        var highlight = function() {
            background.addStyle({
                'stroke-width': 0.75
            });
        };

        /*
         * @private
         *
         * Mousecursor out of this button: normal; mouseout handler.
         */
        var unhighlight = function() {
            deactivate();
            background.addStyle({
                'stroke-width': 0.5
            });
        };


        var getHeight = function() {
            return config.height;
        };

        var getWidth = function() {
            return config.width;
        };

        var move = function( x, y){
            config.x = x;
            config.y = y;
            if (config.icon) {
                icon.addStyle({
                    x: x + padding,
                    y: y + padding
                });
            };
            if (config.label) {
                label.addStyle({
                    x: x + padding + icon_width + padding,
                    y: y + (config.height/2) + padding*0.677
                });
            };
            background.addStyle({
               x: x,
               y: y
            });
            glasspane.addStyle({
               x: x,
               y: y
            });
            return this;
        };

        var enable = function() {
            glasspane.addStyle({
                'pointer-events': 'visible',
                fill: 'white',
                opacity: 0
            });

        };

        var disable = function() {
            glasspane.addStyle({
                'pointer-events': 'none',
                fill: 'gray',
                opacity: 0.75
            });
        };


        that = create();
        that.click = click;
        that.getWidth = getWidth;
        that.getHeight = getHeight;
        that.move = move;
        that.enable = enable;
        that.disable = disable;
        return that;
};

/*
 * @class toggleButton
 */
var toggleButton = function( cnfg ) {
    var that,
        padding = 2,
        config = cnfg || {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            compute_width: true,
            label: null,
            image: null,
            click: null,
            id: '',
            style: {
                background_color: 'gold',
                stroke: 'black',
                'font-family': 'Verdana, Helvetica, sans-serif'
            }
        },
        toggled = false,
        toggle_fn = null,
        icon_width = 0,
        icon_height = 0,
        label_height = 0,
        label_width = 0,
        background, icon, label, glasspane;

        /*
         * @private
         *
         */
        var create = function() {
            var btn;


            if (config.icon) {
                icon = image({
                    id: config.id + ':icon',
                    x: config.x + padding,
                    y: config.y + padding,
                    width: config.icon.width,
                    height: config.icon.height,
                    url: config.icon.url,
                    style: config.icon.style
                });
                icon.addStyle({'pointer-events': 'none'});
                icon_height = config.icon.height;
                icon_width = config.icon.width;
            };
            if (config.label) {
                label = text( {
                    id: config.id + ':label',
                    x: config.x + padding + icon_width + padding,
                    y: config.y + padding,
                    string: config.label.string,
                    style: {
                        'font-family': config.label.style['font-family']
                            || 'Verdana, sans-serif',
                        'font-size': config.label.style['font-size']
                            || '5pt',
                        'font-weight': config.label.style['font-weight']
                            || 'normal',
                        fill: config.label.style.fill || 'black',
                        stroke: 'none'
                     }
                });
                label.addStyle({'pointer-events': 'none'})
                label_width = label.getWidth();
                label_height = label.getHeight();
            };
            config.width = padding + icon_width + padding
                + label_width + padding;
            config.height = Math.max( icon_height, label_height )
                + 2*padding;
            if (config.label) {
                label.addStyle( {
                    y: config.y + (config.height/2) + padding*0.677
                });
            };

            background = rect( {
                id: config.id + ':background',
                x: config.x,
                y: config.y,
                width: config.width,
                height: config.height,
                style: {
                    stroke: config.style.stroke || 'black',
                    fill: config.style.fill || 'gold',
                    opacity: 1,
                    'stroke-width': 0.5,
                    'pointer-events': 'none'
                }
            });
            glasspane = rect( {
                id: config.id + ':glasspane',
                x: config.x,
                y: config.y,
                width: config.width,
                height: config.height,
                style: {
                    fill: 'white',
                    opacity: 0,
                    stroke: 'none'
                }
            });
            glasspane.startListeningTo( 'mouseover', highlight);
            glasspane.startListeningTo( 'mouseout', unhighlight);
            glasspane.startListeningTo( 'mouseup', toggle);
            //glasspane.startListeningTo( 'mouseup', deactivate);

            btn = group( {
                id: config.id,
                style: config.style
            }).add([background]);
            if (config.icon) {
                btn.add([ icon ]);
            };
            if (config.label) {
                btn.add([label]);
            };
            btn.add([glasspane]).onTop(glasspane);
            if (config.toggled) {
                toggle();
            };
            return btn;
        };

        var setToggle = function( b ) {
            if (b) {
                glasspane.addStyle({
                    'pointer-events': 'none'
                });
            } else {
                glasspane.addStyle({
                    'pointer-events': 'default'
                });
            };
        }

        var onToggle = function( toggled_fn, detoggled_fn ) {
            glasspane.startListeningTo( 'mouseup', function() {
                if (toggled) {
                    toggled_fn.call();
                } else {
                    if (detoggled_fn) {
                        detoggled_fn.call();
                    }
                }
            });
        };

        /*
         * @private
         *
         * When on this button is clicked it looks activated; mousedown
         * handler.
         */
        var toggle = function() {
            if (toggled) {
                toggled = false;
                background.addStyle({
                    fill: config.style.fill || 'white',
                    opacity: 1,
                    stroke: config.style.stroke || 'silver'
                })
            } else {
                toggled = true;
                background.addStyle({
                    fill: 'gold',
                    opacity: 0.5,
                    stroke: 'black'
                })
            };
        };

        /*
         * @private
         *
         * After clicking, the botton looks the same as before: mouseup
         * handler.
         */
        var deactivate = function() {
            background.addStyle({
                fill: config.style.fill
            });
        };

        /*
         * @private
         *
         * When on the mouse cursor is over this button, and it is enables,
         * it will highlight; mouseover handler.
         */
        var highlight = function() {
            background.addStyle({
                'stroke-width': 0.75
            });
        };

        /*
         * @private
         *
         * Mousecursor out of this button: normal; mouseout handler.
         */
        var unhighlight = function() {
            background.addStyle({
                'stroke-width': 0.5
            });
        };

        var isToggled = function() {
            return toggled;
        };

        var getHeight = function() {
            return config.height;
        };

        var enable = function() {
            glasspane.addStyle({
                'pointer-events': 'visible',
                fill: 'white',
                opacity: 0
            });

        };

        var disable = function() {
            glasspane.addStyle({
                'pointer-events': 'none',
                fill: 'gray',
                opacity: 0.75
            });
        };
        var getWidth = function() {
            return config.width;
        };

        var move = function( x, y){
            config.x = x;
            config.y = y;
            if (config.icon) {
                icon.addStyle({
                    x: x + padding,
                    y: y + padding
                });
            };
            if (config.label) {
                label.addStyle({
                    x: x + padding + icon_width + padding,
                    y: y + (config.height/2) + padding*0.677
                });
            };
            background.addStyle({
               x: x,
               y: y
            });
            glasspane.addStyle({
               x: x,
               y: y
            });
            return this;
        };

        that = create();
        that.getWidth = getWidth;
        that.getHeight = getHeight;
        that.isToggled = isToggled;
        that.onToggle = onToggle;
        that.setToggle = setToggle;
        that.toggle = toggle;
        that.disable = disable;
        that.enable = enable;
        that.move = move;
        return that;
};

/*
 * @class
 *
 * buttonBox is a container of buttons with a background and a couple of
 * buttons.
 */
var buttonBox = function( cnfg ) {
    var that,
        config = cnfg || {
            padding: 2
        },
        current_x = config.padding,
        background, buttons;

    config.padding = config.padding || 1;

    var create = function() {
        background = rect({
           x: config.x,
           y: config.y,
           width: config.padding,
           height: config.padding,
           id: config.id + ':background',
           style: {
                fill: config.style.fill || 'white',
                stroke: config.style.stroke || 'black'
           }
        });
        buttons = group({
           id: config.id + ':buttons'
        });

        return group({
            id: config.id
        }).add([background, buttons]);
    };

    /*
     * push a button onto the end of the buttonbox
     *
     * @param button
     *
     * @result this buttonbox
     */
    var pushButton = function( button ) {
        current_x += button.getWidth() + config.padding;
        buttons.add([button.move( current_x, config.y
                                + config.padding )]);
        config.width = config.width + config.padding + button.getWidth();
        config.height = Math.max( config.height, button.getHeight())
            + config.padding*2;
        background.addStyle({
            width: config.width,
            height: config.height
        });
        return this;
    }

    that = create();
    that.pushButton = pushButton;
    return that;
};