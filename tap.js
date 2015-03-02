

/*
 * @author HT de Beer H.T.de.Beer@gmail.com
 * @version 0.0
 *
 */

/*
 * @class tap
 *
 * A tap
 */
var tap = function( cnfg ) {
    var that,
        config = cnfg || {
            id: '',
            x: 0,
            y: 0,
            style: {
                stroke: 'black',
                'stroke-width': 0.5,
                fill: 'none',
                'pointer-events': 'none'
            }
        },
        background, label, glasspane,
        width = 33,
        height = 28;

        var createTapPath = function( x, y ) {
            var d = 'M ' + x + ' ' + (y + 27.5);
            d += ' V ' + (y + 20);
            d += ' A ' + 10 + ' ' + 10 + ' 90 0 1 '
                    + (x+10) + ' '+ (y+10);
            d += ' L ' + (x+20) + ' ' + (y+10);
            d += ' V ' + (y+5);
            d += ' H ' + (x+12.5);
            d += ' A ' + (1.25) + ' ' + (1.25) + ' 90 0 1 '
                    + (x+12.5) + ' ' + (y+2.25);
            d += ' H ' + (x+21.5);
            d += ' A ' + (1.25) + ' ' + (1.25) + ' 180 0 1 '
                    + (x+23.75) + ' ' + (y+2.25);
            d += ' H ' + (x+32.5);
            d += ' A ' + (1.25) + ' ' + (1.25) + ' 90 0 1 '
                    + (x+32.5) + ' ' + (y+5);
            d += ' H ' + (x+25);
            d += ' V ' + (y+10);
            d += ' H ' + (x+40);
            d += ' V ' + (y+5);
            d += ' A ' + (2.5) + ' ' + (2.5) + ' 90 0 1 '
                    + (x+42.5) + ' ' + (y+2.5);
            d += ' V ' + (y+27.5);
            d += ' A ' + (2.5) + ' ' + (2.5) + ' 90 0 1 '
                    + (x+40) + ' ' + (y+25);
            d += ' V ' + (y+20);
            d += ' H ' + (x+12.5);
            d += ' A ' + (2.5) + ' ' + (2.5) + ' 90 0 0 '
                    + (x+10) + ' ' + (y+22.5);
            d += ' V ' + (y+27.5);
            d += ' Z ';

            return d;
        };

    /*
     * @private
     *
     * Create this tap
     */
    var create = function() {
        background = path({
            id: config.id + ':background',
            d: createTapPath( config.x, config.y ),
            style: {
                stroke: config.style.stroke || 'black',
                'stroke-width': config.style['stroke-width'] || 0.5,
                fill: config.style.fill || 'white',
                'pointer-events': 'none'
            }
        });


        label = text({
            id: config.id + ':label',
            x: config.x + 14,
            y: config.y + 17,
            string: '999 ml',
            style: {
                'font-family': 'Verdana, Helvetica, sans-serif',
                'font-size': '5pt',
                fill: 'black',
                stroke: 'none',
                'pointer-events': 'none'
            }
        });

        glasspane = path({
            id: config.id + ':glasspane',
            d: createTapPath( config.x, config.y ),
            style: {
                stroke: config.style.stroke || 'none',
                fill: 'white',
                opacity: 0
            }
        });

        return group({
            id: config.id
        }).add([background, label, glasspane]).onTop( glasspane );
    };

    /*
     * setText of label inside tap
     *
     * @param str
     *
     * @return this
     */
    var setText = function( str ) {
        label.addStyle({
            x: config.x + 14 + (label.getWidth()/6)*(6 - str.length)
            })
        label.setText( str );
        return this;
    };

    var getHeight = function() {
        return height;
    };

    var getWidth = function() {
        return width;
    }

    that = create();
    that.setText = setText;
    that.getHeight = getHeight;
    that.getWidth = getWidth;
    return that;
};