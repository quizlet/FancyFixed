/**
 * Set up a div to act like "position: fixed;" but moves to the top of the screen 
 * as the user scrolls down.
 * 
 * Just call FancyFixed.init('myDiv')
 * or FancyFixed.init('myDiv', true') if the element couldContainFlash content.
 *
 * IMPORTANT! If couldContainFlash = true then you should always set
 * theEl to be "position: absolute", and theEl's parent to be "position: relative"!
 */
var FancyFixed = (function() {

	// There are two main ways we could achieve this effect via CSS:
	// 		"position: absolute; top: (0|Y)px"	-- here known as "top"
	// 		"position: (static|fixed)"			-- here known as "fixed"
	//
	// The "fixed" method feels much nicer and is less distracting and
	// works in all browsers. The only problem is that in Firefox (only) if there's Flash
	// in the element (like an ad) and you change its position (between fixed/static)
	// the Flash completely reloads, due to 10 year old bug:
	// 		https://bugzilla.mozilla.org/show_bug.cgi?id=90268
	//
	// Therefore we just use the "top" method for Firefox if we set couldContainFlash
	
	var curPosition = 'static',
		didScroll = false,
		posY, el, elParentY, elParentBottom;
	
	var handleScroll_top = function() {		
		var scrollY = Math.max(0, window.getScroll().y - elParentY);

		// TODO: handle element scrolling past bottom
		// (this is done in the fixed case but not the couldContainFlash case)

		// set the "top" property to scrollY, but use animation
		new Fx.Tween(el, {
			'duration': 80,
			'property': 'top',
			'link': 'cancel'	// cancel other in progress animations on el
		}).start(scrollY);
	};
	
	var setupScroll_top = function() {
		window.addEvent('scroll', function() {
		    didScroll = true;
		});

		setInterval(function() {
		    if (didScroll) {
		        didScroll = false;
		        handleScroll_top();
		    }
		}, 300);
	};
	
	var handleScroll_fixed = function() {
		var scrollY = window.getScroll().y,
			height = el.offsetHeight;
			bottomOfEl = scrollY+height;
		
		if (curPosition === 'fixed' && scrollY <= posY) {
			curPosition = 'static';
			el.setStyle('position', curPosition);
		
		} else if (curPosition === 'fixed' && bottomOfEl >= elParentBottom) {
			curPosition = 'absolute';
			el.setStyle('position', curPosition).setStyle('top', elParentBottom-height);
			
		} else if ((curPosition === 'static' && scrollY > posY) || (curPosition === 'absolute' && bottomOfEl < elParentBottom)) {			
			curPosition = 'fixed';
			el.setStyles({
				'top': 0,
				'position': curPosition
			});
		}
	};
	
	return {
	
		init: function(theEl, couldContainFlash) {
			el = $(theEl);
			elParentY = el.getParent().getPosition().y;
			// hack for now: 
			// TODO: remove requirement for wrapper element. we're currently using 
			// parent's parent to look for necessary height
			elParentBottom = el.getParent().getParent().getCoordinates().bottom;
			posY = el.getPosition().y;
			
			if (Browser.firefox && couldContainFlash) {
				el.setStyle('position', 'absolute');
				setupScroll_top();
			} else {
				// TODO: use mootools 1.3.1 event throttling
				window.addEvent('scroll', handleScroll_fixed);
			}
		}
	}
})();
