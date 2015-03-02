// From:
// http://lists.w3.org/Archives/Public/public-webapps/2010OctDec/0035.html
//
if (!MouseEvent.prototype.getCoordsAt) {
  MouseEvent.prototype.getCoordsAt = function(element) {
    //Opera doesn't like this:
    //if (!(element instanceof SVGElement))
    //  throw 'MouseEvent.getCoordsAt not implemented for non-SVG elements';

    var SVGNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(SVGNS, 'svg');
    var pt = svg.createSVGPoint();
    pt.x = this.clientX;
    pt.y = this.clientY;
    return pt.matrixTransform(element.getScreenCTM().inverse());
  }
}

//from
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/
// indexOf
if (!Array.prototype.indexOf)
{
  Array.prototype.indexOf = function(searchElement /*, fromIndex */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (len === 0)
      return -1;

    var n = 0;
    if (arguments.length > 0)
    {
      n = Number(arguments[1]);
      if (n !== n) // shortcut for verifying if it's NaN
        n = 0;
      else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
        n = (n > 0 || -1) * Math.floor(Math.abs(n));
    }

    if (n >= len)
      return -1;

    var k = n >= 0
          ? n
          : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++)
    {
      if (k in t && t[k] === searchElement)
        return k;
    }
    return -1;
  };
}

//from
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/
// forEach
if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
        fun.call(thisp, t[i], i, t);
    }
  };
}


/*
 * Access to parents methods as specified in hte Good PArts Book
 *
Object.super = function(name) {
	var that = this,
		method = that[name];
	return function() {
		return method.apply( that, arguments );
	};
};

*/

var svgns = 'http://www.w3.org/2000/svg';

var shape = function( svgname, config ) {
	var that,
		id = config.id,
		style = {},
		element = null;

	var createElement = function() {
		var el = document.createElementNS( svgns, svgname );
		el.setAttributeNS( null, 'id', id );
		return el;
	};

	var addStyle = function( new_style ) {
		for (st in new_style) {
			style.st = new_style[st];
			element.setAttributeNS( null, st, new_style[st] );
		};
		return this;
	};

	var removeStyle = function( old_style ) {
		for (var i = 0; i < old_style.length; i++) {
			st = old_style[i];
			//if (st in style) {
				delete style.st;
				element.removeAttributeNS( null, st );
			//};
		};
		return this;
	};

	var startListeningTo = function( eventname, handler ) {
		element.addEventListener( eventname, handler, false);
		return this;
	};

	var stopListeningTo = function( eventname, handler ) {
		element.removeEventListener( eventname, handler, false );
		return this;
	};

	var visible = function( bool ) {
		if (bool) {
		 addStyle({
			display: 'block'
		  });
		// removeStyle(['display']);
		} else {
		  addStyle({
			display: 'none'
		  });
		};
		return this;
	}

	element = createElement();
	addStyle( config.style );

	that = {};

	that.addStyle = addStyle;
	that.removeStyle = removeStyle;
	that.startListeningTo = startListeningTo;
	that.stopListeningTo = stopListeningTo;
	that.element = element;
	that.visible = visible;

	return that;
};

//var svgdoc = document.getElementById("elt").getSVGDocument();

var rect = function( config ) {
	var that,
		x = config.x || 0,
		y = config.y || 0,
		width = config.width || 0,
		height = config.height || 0;

	that = shape( 'rect', config );
	that.element.setAttributeNS( null, 'x', x );
	that.element.setAttributeNS( null, 'y', y );
	that.element.setAttributeNS( null, 'width', width );
	that.element.setAttributeNS( null, 'height', height );

	return that;
};

var circle = function( config ) {
	var that,
		x = config.x || 0,
		y = config.y || 0,
		r = config.r || 0;

	that = shape( 'circle', config );
	that.element.setAttributeNS( null, 'cx', x );
	that.element.setAttributeNS( null, 'cy', y );
	that.element.setAttributeNS( null, 'r', r );
	return that;
};

var path = function( config ) {
	var that,
		d = config.d || '';

	that = shape( 'path', config );
	that.element.setAttributeNS( null, 'd', d );
	return that;
};

var line = function( config ) {
	var that,
	  x = config.x || 0,
	  y = config.y || 0,
	  width = config.width || 0;
	  
	that = shape( 'line', config );
	that.element.setAttributeNS( null, 'x1', x );
	that.element.setAttributeNS( null, 'y1', y );
	that.element.setAttributeNS( null, 'x2', x + width );
	that.element.setAttributeNS( null, 'y2', y );
	return that;
};

var cursor = function( config ) {
    var that,
        path = config.path || '',
        x = config.x || 0,
        y = config.y || 0,
        xlinkns = 'http://www.w3.org/1999/xlink';

        that = shape( 'cursor', config );
        that.element.setAttributeNS( null, 'x', x);
        that.element.setAttributeNS( null, 'y', y);
        that.element.setAttributeNS( xlinkns, 'href', path );
        return that;
};

var image = function( config ) {
	var that,
		x = config.x || 0,
		y = config.y || 0,
		width = config.width || 0,
		height = config.height || 0,
		url = config.url || '',
        xlinkns = 'http://www.w3.org/1999/xlink';

		var getHeight = function() {
			return height;
		};

		var getWidth = function() {
			return width;
		};

		that = shape( 'image', config );
		that.element.setAttributeNS( null, 'x', x);
		that.element.setAttributeNS( null, 'y', y);
		that.element.setAttributeNS( null, 'width', width);
		that.element.setAttributeNS( null, 'height', height);
		that.element.setAttributeNS( xlinkns, 'href', url);

		that.element.ownerDocument.documentElement
			.appendChild(that.element);
		height = that.element.getBBox().height;
		width = that.element.getBBox().width;
		that.element.ownerDocument.documentElement
			.removeChild(that.element);
		that.getHeight = getHeight;
		that.getWidth = getWidth;
		return that;
}

var text = function( config ) {
	var that,
		x = config.x || 0,
		y = config.y || 0,
        width = 0,
        height = 0,
		string = config.string || '',
		stringnode;

	var setText = function( string ) {
		string = string || '';
		stringnode.nodeValue = string;
		return this;
	};

	var getText = function() {
		return string;
	};

    var getWidth = function() {
        return width;
    };

    var getHeight = function() {
        return height;
    };

	that = shape( 'text', config );
	that.element.setAttributeNS( null, 'x', x );
	that.element.setAttributeNS( null, 'y', y );
	stringnode = document.createTextNode( string );
	that.element.appendChild( stringnode );
    that.element.ownerDocument.documentElement.appendChild(that.element);
    height = that.element.getBBox().height;
    width = that.element.getBBox().width;
    that.element.ownerDocument.documentElement.removeChild(that.element);

	that.setText = setText;
	that.getText = getText;
    that.getWidth = getWidth;
    that.getHeight = getHeight;
	return that;
};

var html = function( config ) {
    var that,
	body,
	attr,
	x = config.x || 0,
	y = config.y || 0,
	width = config.width || 0,
	height = config.height || 0,
	style = config.style || {},
	xhtmlns = 'http://www.w3.org/1999/xhtml';

    var setHTML = function( htmltext ) {
	body.innerHTML = htmltext;
	return this;
    };

    that = shape( 'foreignObject', config );
    that.element.setAttributeNS( null, 'x', x );
    that.element.setAttributeNS( null, 'y', y );
    that.element.setAttributeNS( null, 'width', width );
    that.element.setAttributeNS( null, 'height', height );
    body = document.createElementNS( xhtmlns, 'body' );
    body.setAttribute( 'xmlns', xhtmlns );
    that.element.appendChild( body );
    setHTML( config.html );
    that.setHTML = setHTML;
    return that
};

var shapeList = function( svgname, config ) {
	var elements = [];

	var add = function( shapes ) {
		for (var i = 0; i < shapes.length; i++ ) {
			elements.push( shapes[i] );
			this.element.appendChild( shapes[i].element );
		};
		return this;
	};

	var remove = function( shapes ) {
		for (var i = 0; i < shapes.length; i++ ) {
			var index = elements.indexOf( shapes[i] );
			if (index >= 0 ) {
				elements.splice( index, 1 );
				this.element.removeChild( shapes[i].element );
			};
		};
		return this;
	};

	var onTop = function( shape ) {
		var index = elements.indexOf( shape );
		if (index >= 0 ) {
			// put on top: remove and add last
			this.element.removeChild( shape.element );
			this.element.appendChild( shape.element );
		};
		return this;
	};

	var deepAddStyle = function( style ) {
		for (var i = 0; i < elements.length; i++) {
			elements[i].addStyle( style );
		};
		return this;
	};

	var deepRemoveStyle = function( style ) {
		for (var i = 0; i < elements.length; i++) {
			elements[i].removeStyle( style );
		};
		return this;
	};

	var clear = function() {
		while (elements.length > 0) {
			elt = elements.pop();
			this.element.removeChild( elt.element );
		};
		return this;
	};

	var foreach = function( f ) {
		elements.forEach( f );
		return this;
	};

	var makeDeaf = function( except ) {
	    var	i;
	    for (i = 0; i < elements.length; i++) {
		if ( elements[i] !== except ) {
		    elements[i].addStyle( {'pointer-events': 'none' } );
		};
	    };
	    return this;
	};

	var healDeaf = function() {
	    var	i;
	    for (i = 0; i < elements.length; i++) {
		elements[i].addStyle( {'pointer-events': 'default' } );
	    };
	    return this;
	};

	// implement get function using css / xpath
	var get = function() {};

    var last = function() {
        if (elements.length > 0) {
            return elements[elements.lenght - 1];
        } else {
            return false;
        }
    }

	var that = shape( svgname, config );
	that.add = add;
	that.remove = remove;
	that.onTop = onTop;
	that.deepAddStyle = deepAddStyle;
	that.deepRemoveStyle = deepRemoveStyle;
	that.clear = clear;
	that.foreach = foreach;
	that.makeDeaf = makeDeaf;
	that.healDeaf = healDeaf;
    that.last = last;
	return that;
}

var group = function( config ) {
	var that = shapeList( 'g', config );
	return that;
}

/*
 * Textbox
 */
var htmlbox = function( cnfg ) {
    var that,
	x_margin = cnfg.x_margin || 5,
	y_margin = cnfg.y_margin || 5,
	config = cnfg || {
	    x: 0,
	    y: 0,
	    width: 0,
	    height: 0,
	    id: '',
	    html: '',
	    style: {}
	};

    var setHTML = function( text ) {
	config.html = text;
	//content.setText( text );
	return this;
    };

    var getText = function() {
	return content.getText();
    };

    var getHeight = function() {
	return config.height;
    };


    var computeHeight = function() {
	return config.height;
    };


    var background, content, glasspane;
    var create = function() {

	background = rect({
	    x: config.x,
	    y: config.y,
	    width: config.width,
	    height: computeHeight(),
	    id: config.id + ':background',
	    style: {
		fill: config.style['background']
	    }
	});
	content = html({
	    x: config.x + x_margin,
	    y: config.y + y_margin,
	    width: config.width,
	    height: config.height,
	    html: config.html,
	    id: config.id + ':content',
	    style: {
	    }
	});
	glasspane = rect({
	    x: config.x,
	    y: config.y,
	    width: config.width,
	    height: computeHeight(),
	    id: config.id + ':background',
	    style: {
		stroke: 'none',
		fill: 'white',
		opacity: 0
	    }
	})

	return group( { id: config.id } )
	    .add( [ background, content, glasspane] ).onTop( glasspane );
    };

    var update = function() {
    }

    that = create();

    that.getText = getText;
    that.setHTML = setHTML;
    that.getHeight = getHeight;

    return that;
};
