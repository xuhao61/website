/**
 * UpSolution Widget: g-alert
 */
(function ($) {
	"use strict";

	$.fn.gAlert = function(){
		return this.each(function(){
			var $this = $(this),
				$closer = $this.find('.g-alert-close');
			$closer.click(function(){
				$this.animate({height: 0, margin: 0}, 400, function(){
					$this.css('display', 'none');
					$us.canvas.$container.trigger('contentChange');
				});
			});
		});
	};

	$(function(){
		$('.g-alert').gAlert();
	});
})(jQuery);


/**
 * UpSolution Widget: w-lang
 */
(function($){
	"use strict";

	$.fn.wLang = function(){
		return this.each(function(){
			var $this = $(this),
				langList = $this.find('.w-lang-list'),
				currentLang = $this.find('.w-lang-current');
			if ($this.mod('layout') == 'dropdown'){
				var closeListEvent = function(e){
					if ($this.has(e.target).length === 0){
						langList.slideUp(200, function(){
							$this.removeClass('active');
						});
						$us.canvas.$window.off('mouseup touchstart mousewheel DOMMouseScroll touchstart', closeListEvent);
					}
				};
				langList.slideUp(0);
				currentLang.click(function() {
					$this.addClass('active');
					langList.slideDown(200);
					$us.canvas.$window.on('mouseup touchstart mousewheel DOMMouseScroll touchstart', closeListEvent);
				});
			}
		});
	};

	$(function(){
		$('.w-lang').wLang();
	});
})(jQuery);


/**
 * UpSolution Widget: w-search
 */
(function ($) {
	"use strict";

	$.fn.wSearch = function () {

		return this.each(function(){
			var $this = $(this),
				searchForm = $this.find('.w-search-form'),
				searchShow = $this.find('.w-search-show'),
				searchClose = $this.find('.w-search-close'),
				searchInput = searchForm.find('.w-search-input input'),
				searchOverlay = $this.find('.w-search-form-overlay'),
				$window = $(window),
				searchOverlayInitRadius = 25,
				$body = document.body || document.documentElement,
				$bodyStyle = $body.style,
				showHideTimer = null,
				searchHide = function(){
					searchForm.css({
						'-webkit-transition': 'opacity 0.4s',
						transition: 'opacity 0.4s'
					});
					window.setTimeout(function(){
						searchOverlay
							.removeClass('overlay-on')
							.addClass('overlay-out')
							.css({
								"-webkit-transform": "scale(0.1)",
								"transform": "scale(0.1)"
							});
						searchForm.css('opacity', 0);
						clearTimeout(showHideTimer);
						showHideTimer = window.setTimeout(function(){
							searchForm.css('display', 'none');
							searchOverlay.css('display', 'none');
						}, 700);
					}, 25);
				};

			// Handling virtual keyboards at touch devices
			if ( ! jQuery('html').hasClass('no-touch')){
				searchInput
					.on('focus', function(){
						// Transforming hex to rgba
						var originalColor = searchOverlay.css('background-color'),
							overlayOpacity = searchOverlay.css('opacity'),
							matches;
						// RGB Format
						if (matches = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(originalColor)){
							searchForm.css('background-color', "rgba("+parseInt(matches[1])+","+parseInt(matches[2])+","+parseInt(matches[3])+", "+overlayOpacity+")");
						}
						// Hex format
						else if (matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})$/.exec(originalColor)){
							searchForm.css('background-color', "rgba("+parseInt(matches[1], 16)+","+parseInt(matches[2], 16)+","+parseInt(matches[3], 16)+", "+overlayOpacity+")");
						}
						// Fault tolerance
						else {
							searchForm.css('background-color', originalColor);
						}
						searchOverlay.addClass('mobilefocus');
					})
					.on('blur', function(){
						searchOverlay.removeClass('mobilefocus');
						searchForm.css('background-color', 'transparent');
					});
			}

			searchShow.click(function(){
				var searchPos = searchShow.offset(),
					searchWidth = searchShow.width(),
					searchHeight = searchShow.height();
				// Preserving scroll position
				searchPos.top -= $window.scrollTop();
				searchPos.left -= $window.scrollLeft();
				var overlayX = searchPos.left+searchWidth/2,
					overlayY = searchPos.top+searchHeight/2,
					winWidth = $us.canvas.winWidth,
					winHeight = $us.canvas.winHeight,
					// Counting distance to the nearest screen corner
					overlayRadius = Math.sqrt(Math.pow(Math.max(winWidth - overlayX, overlayX), 2) + Math.pow(Math.max(winHeight - overlayY, overlayY), 2)),
					overlayScale = (overlayRadius+15)/searchOverlayInitRadius;

				searchOverlay.css({
					width: searchOverlayInitRadius*2,
					height: searchOverlayInitRadius*2,
					left: overlayX,
					top: overlayY,
					"margin-left": -searchOverlayInitRadius,
					"margin-top": -searchOverlayInitRadius
				});
				searchOverlay
					.removeClass('overlay-out')
					.show();
				searchForm.css({
					opacity: 0,
					display: 'block',
					'-webkit-transition': 'opacity 0.4s 0.3s',
					transition: 'opacity 0.4s 0.3s'
				});
				window.setTimeout(function(){
					searchOverlay
						.addClass('overlay-on')
						.css({
							"-webkit-transform": "scale(" + overlayScale + ")",
							"transform": "scale(" + overlayScale + ")"
						});
					searchForm.css('opacity', 1);
					clearInterval(showHideTimer);
					showHideTimer = window.setTimeout(function() {
						searchInput.focus();
					}, 700);
				}, 25);
			});

			searchInput.keyup(function(e) {
				if (e.keyCode == 27) searchHide();
			});

			searchClose.click(searchHide);
		});
	};

	$(function(){
		jQuery('.l-header .w-search').wSearch();
	});
})(jQuery);


/* W-Tabs */
(function ($) {
	"use strict";

	$.fn.wTabs = function () {

		return this.each(function () {
			var tabs = $(this),
				itemsList = tabs.find('.w-tabs-list'),
				items = tabs.find('.w-tabs-item'),
				sections = tabs.find('.w-tabs-section'),
				resizeTimer = null,
				itemsWidths = [],
				running = false,
				firstActiveItem = tabs.find('.w-tabs-item.active').first(),
				firstActiveSection = tabs.find('.w-tabs-section.active').first(),
				activeIndex = null,
				lineCSS = '',
				tabsID = tabs.attr('id'),
				measureWidths = function(){
					// We hide active line temporarily to count tab sizes properly
					tabs.addClass('measure');
					itemsWidths = [];
					items.each(function(){
						itemsWidths.push($(this).outerWidth(true));
					});
					tabs.removeClass('measure');
				};

			if (itemsList.length) {
				var itemsCount = itemsList.find('.w-tabs-item').length;
				if (itemsCount) {
					itemsList.addClass('items_'+itemsCount);
				}
			}

			if ( ! tabs.hasClass('layout_accordion')) {
				if ( ! firstActiveSection.length) {
					firstActiveItem = tabs.find('.w-tabs-item').first();
					firstActiveSection = tabs.find('.w-tabs-section').first();
				}

				tabs.find('.w-tabs-item.active').removeClass('active');
				tabs.find('.w-tabs-section.active').removeClass('active');

				firstActiveItem.addClass('active');
				firstActiveSection.addClass('active');

				lineCSS = '<style>';

				if ($('body').hasClass('rtl')) {
					for (var i = 1; i < itemsCount; i++) {
						var shift = (itemsCount - i) * 100;
						lineCSS += ' #'+tabsID+' .w-tabs-list .w-tabs-item:nth-child('+i+').active ~ .w-tabs-item:last-child::before {'+
						'-webkit-transform: translate3d('+shift+'%,0,0);'+
						'transform: translate3d('+shift+'%,0,0); }';
					}
				} else {
					for (var i = 1; i < itemsCount; i++) {
						var shift = (itemsCount - i) * 100;
						lineCSS += ' #'+tabsID+' .w-tabs-list .w-tabs-item:nth-child('+i+').active ~ .w-tabs-item:last-child::before {'+
						'-webkit-transform: translate3d(-'+shift+'%,0,0);'+
						'transform: translate3d(-'+shift+'%,0,0); }';
					}
				}


				lineCSS += '</style>';

				tabs.append(lineCSS);


			} else {
				$(sections).each(function(sectionIndex, section) {
					if ($(section).hasClass('active')) {
						activeIndex = sectionIndex;
					}
				});
			}

			measureWidths();

			function tabs_resize(){
				if (tabs.hasClass('layout_accordion') && ! tabs.data('accordionLayoutDynamic')) return;
				if ( ! tabs.hasClass('layout_accordion')) measureWidths();
				var maxTabWidth = Math.floor(tabs.width() / itemsWidths.length),
					overflown = false;
				for (var i = 0; i < itemsWidths.length; i++){
					if (itemsWidths[i] >= maxTabWidth) overflown = true;
				}

				tabs.data('accordionLayoutDynamic', overflown);
				tabs.toggleClass('layout_accordion', overflown);
			}

			tabs_resize();

			$(window).resize(function(){
				window.clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(function(){
					tabs_resize();
				}, 50);

			});

			sections.each(function(index){
				var item = $(items[index]),
					section = $(sections[index]),
					section_title = section.find('.w-tabs-section-header'),
					section_content = section.find('.w-tabs-section-content');

				if (section.hasClass('active')) {
					section_content.slideDown();
				}

				section_title.click(function(){
					var currentHeight = 0;

					if (tabs.hasClass('type_toggle')) {
						if ( ! running) {
							if (section.hasClass('active')) {
								running = true;
								if (item) {
									item.removeClass('active');
								}
								section_content.slideUp(null, function(){
									section.removeClass('active');
									running = false;
									$us.canvas.$container.trigger('contentChange');
								});
							} else {
								running = true;
								if (item) {
									item.addClass('active');
								}
								section_content.slideDown(null, function(){
									section.addClass('active');
									running = false;
									section.find('.w-map').each(function(map){
										var mapObj = jQuery(this).data('gMap.reference'),
											center = mapObj.getCenter();

										google.maps.event.trigger(jQuery(this)[0], 'resize');
										if (jQuery(this).data('gMap.infoWindows').length) {
											jQuery(this).data('gMap.infoWindows')[0].open(mapObj, jQuery(this).data('gMap.overlays')[0]);
										}
										mapObj.setCenter(center);
									});

//									section.find(".fotorama").fotorama();

									$us.canvas.$container.trigger('contentChange');
								});
							}
						}


					} else if (( ! section.hasClass('active')) && ( ! running)) {
						running = true;
						items.each(function(){
							if ($(this).hasClass('active')) {
								$(this).removeClass('active');
							}
						});

						if (item) {
							item.addClass('active');
						}

						sections.each(function(){
							if ($(this).hasClass('active')) {
								currentHeight = $(this).find('.w-tabs-section-content').height();
								if ( ! tabs.hasClass('layout_accordion')) {
									tabs.css({'height': tabs.height(), 'overflow': 'hidden'});
									setTimeout(function(){ tabs.css({'height': '', 'overflow': ''}); }, 300);
								}
								$(this).find('.w-tabs-section-content').slideUp();
							}
						});



						section_content.slideDown(null, function(){
							sections.each(function(){
								if ($(this).hasClass('active')) {
									$(this).removeClass('active');
								}
							});
							section.addClass('active');
							activeIndex = index;

							if (tabs.hasClass('layout_accordion') && $us.canvas.winWidth < 768) {
								jQuery("html, body").animate({
									scrollTop: section.offset().top-(jQuery('.l-header').height())+"px"
								}, {
									duration: 1200,
									easing: "easeInOutQuint"
								});
							}

							running = false;
							section.find('.w-map').each(function(map){
								var mapObj = jQuery(this).data('gMap.reference'),
									center = mapObj.getCenter();

								google.maps.event.trigger(jQuery(this)[0], 'resize');
								if (jQuery(this).data('gMap.infoWindows').length) {
									jQuery(this).data('gMap.infoWindows')[0].open(mapObj, jQuery(this).data('gMap.overlays')[0]);
								}
								mapObj.setCenter(center);
							});

//							section.find(".fotorama").fotorama();

							$(window).resize();
						});
					}

				});

				if (item){
					item.click(function(){
						section_title.click();
					});
				}
			});

		});
	};

	$(function(){
		jQuery('.w-tabs').wTabs();
	});
})(jQuery);


/* W-Timeline */
(function ($) {
	"use strict";

	$.fn.wTimeline = function () {

		return this.each(function () {
			var timeline = $(this),
				items = timeline.find('.w-timeline-item'),
				itemsCount = items.length,
				sections = timeline.find('.w-timeline-section'),
				running = false,
				sectionsWrapper = timeline.find('.w-timeline-sections'),
				sumWidth = 0,
				sectionsContainer = $('<div></div>', {id: 'section_container'}).css({position: 'relative'}),
				resizeTimer = null,
				sectionsPadding = $(sections[0]).innerWidth() - $(sections[0]).width(),
				activeIndex = 0,
				sectionsContainerPresent,
				firstActiveItem = timeline.find('.w-timeline-item.active').first(),
				firstActiveSection = timeline.find('.w-timeline-section.active').first();

			if ( ! firstActiveItem.length) {
				firstActiveItem = timeline.find('.w-timeline-item').first();
				firstActiveSection = timeline.find('.w-timeline-section').first();
			}

			timeline.find('.w-timeline-item.active').removeClass('active');
			timeline.find('.w-timeline-section.active').removeClass('active');

			firstActiveItem.addClass('active');
			firstActiveSection.addClass('active');

			$(sections).each(function(sectionIndex, section) {
				if ($(section).hasClass('active')) {
					activeIndex = sectionIndex;
				}
			});

			$(sections).css({display: 'block'});
			$(sectionsWrapper).css({position: 'relative'});

			function timeline_resize(){
				sectionsWrapper.css({width: timeline.innerWidth()-sectionsWrapper.css('border-left-width')-sectionsWrapper.css('border-right-width')+'px'});
				$(sections).css({width: sectionsWrapper.innerWidth()-sectionsPadding+'px'});

				if ($us.canvas.winWidth < 768 && $us.canvas.responsive) {
					timeline.addClass('type_vertical');
					if (sectionsContainerPresent === true || sectionsContainerPresent === undefined ){
						sectionsWrapper.css({ height: 'auto', overflow: 'visible'});
						$(sections).css({float: 'none'});
						$(sections).each(function(sectionIndex, section) {
							var section_content = $(section).find('.w-timeline-section-content');
							if (!$(section).hasClass('active')) {
								section_content.css('display', 'none');
							}
							sectionsWrapper.append(section);
						});
						sectionsContainer.remove();
						sectionsContainerPresent = false;
					}
				} else {
					timeline.removeClass('type_vertical');
					sectionsWrapper.css({ height: $(sections[activeIndex]).outerHeight()+'px', overflow: 'hidden'});
					sumWidth = sections.length*(sectionsWrapper.innerWidth());


					if (sectionsContainerPresent === false || sectionsContainerPresent === undefined){
						sectionsContainer = $('<div></div>', {id: 'section_container'}).css({position: 'relative'});
						$(sections).css({float: 'left'});
						$(sections).each(function(sectionIndex, section) {
							var section_content = $(section).find('.w-timeline-section-content');
							section_content.css({'display': 'block', 'height': 'auto'});
							sectionsContainer.append(section);
						});

						sectionsWrapper.append(sectionsContainer);
						sectionsContainerPresent = true;
					}

					if ($('body').hasClass('rtl')) {
						var rightPos = -(itemsCount-activeIndex-1)*(sectionsWrapper.innerWidth());
						sectionsContainer.css({width: sumWidth+'px', height: $(sections[activeIndex]).outerHeight()+'px', right: rightPos});
					} else {
						var leftPos = -activeIndex*(sectionsWrapper.innerWidth());
						sectionsContainer.css({width: sumWidth+'px', height: $(sections[activeIndex]).outerHeight()+'px', left: leftPos});
					}
				}
			}

			timeline_resize();

			$(window).resize(function(){
				window.clearTimeout(resizeTimer);
				resizeTimer = window.setTimeout(function(){
					timeline_resize();
				}, 50);

			});

			sections.each(function(index, element){
				var section = $(element),
					item = $(items[index]),
					section_title = section.find('.w-timeline-section-title'),
					section_content = section.find('.w-timeline-section-content');

				if(item.length)
				{
					item.click(function(){
						if (( ! section.hasClass('active')) && ( ! running)) {
							running = true;
							items.each(function(){
								if ($(this).hasClass('active')) {
									$(this).removeClass('active');
								}
							});
							if (item.length) {
								item.addClass('active');
							}

							sectionsWrapper.animate({height: section.outerHeight()}, 300);
							var animateOptions = {};
							animateOptions['left'] = -index*(sectionsWrapper.innerWidth());
							if ($('body').hasClass('rtl')) {
								animateOptions['right'] = -(itemsCount-index-1)*(sectionsWrapper.innerWidth());
							}
							sectionsContainer.animate(animateOptions, 300, function(){
								sections.each(function(){
									if ($(this).hasClass('active')) {
										$(this).removeClass('active');
									}
								});
								section.addClass('active');
								activeIndex = index;
								running = false;
							});

						}
					});
				}

				if(section_title.length)
				{
					section_title.click(function() {
						if (( ! section.hasClass('active')) && ( ! running)) {
							running = true;
							var currentHeight, newHeight;
							items.each(function(){
								if ($(this).hasClass('active')) {
									$(this).removeClass('active');
								}
							});
							if (item.length) {
								item.addClass('active');
							}

							sections.each(function(){
								if ($(this).hasClass('active')) {
									currentHeight = $(this).find('.w-timeline-section-content').height();
									$(this).find('.w-timeline-section-content').slideUp();
								}
							});

							newHeight = section_content.height();

							section_content.slideDown(null, function(){
								sections.each(function(){
									if ($(this).hasClass('active')) {
										$(this).removeClass('active');
									}
								});
								section.addClass('active');
								activeIndex = index;

								jQuery("html, body").animate({
									scrollTop: section.offset().top-(jQuery('.l-header').height())+"px"
								}, {
									duration: 1200,
									easing: "easeInOutQuint"
								});

								running = false;
							});

						}
					});
				}


			});

		});
	};

	$(function(){
		jQuery('.w-timeline').wTimeline();
	});

})(jQuery);


// Fixing contact form 7 semantics, when requested
jQuery('.wpcf7').each(function(){
	var $form = jQuery(this);

	// Removing excess wrappers
	$form.find('.w-form-field > .wpcf7-form-control-wrap > .wpcf7-form-control').each(function(){
		var $input = jQuery(this);
		if (($input.attr('type')||'').match(/^(text|email|url|tel|number|date|quiz|captcha)$/) || $input.is('textarea')){
			// Moving wrapper classes to .w-form-field, and removing the span wrapper
			var wrapperClasses = $input.parent().get(0).className;
			$input.unwrap();
			$input.parent().get(0).className += ' '+wrapperClasses;
		}
	});

	// Transforming submit button
	$form.find('.w-form-field > .wpcf7-submit').each(function(){
		var $input = jQuery(this),
			classes = $input.attr('class').split(' '),
			value = $input.attr('value') || '';
		$input.siblings('p').remove();
		if (jQuery.inArray('g-btn', classes) == -1){
			classes.push('g-btn');
		}
		var buttonHtml = '<button id="message_send" class="'+classes.join(' ')+'">' +
			'<div class="w-preloader type_2"></div>' +
			'<span class="g-btn-label">'+value+'</span>' +
			'<span class="ripple-container"></span>' +
			'</button>';
		$input.replaceWith(buttonHtml);
	});

	// Adjusting proper wrapper for select controller
	$form.find('.wpcf7-form-control-wrap > select').each(function(){
		var $select = jQuery(this);
		if ( ! $select.attr('multiple')) $select.parent().addClass('type_select');
	});
});


// Zephyr special Material Design animations
jQuery(function($){
	"use strict";

	/**
	 * Material Design Ripples
	 */
	var $body = document.body || document.documentElement,
		$bodyStyle = $body.style,
		isTransitionsSupported = $bodyStyle.transition !== undefined || $bodyStyle.WebkitTransition !== undefined;
	var removeRipple = function($ripple) {
			$ripple.off();
			if (isTransitionsSupported) {
				$ripple.addClass("ripple-out");
			} else {
				$ripple.animate({
					"opacity": 0
				}, 100, function() {
					$ripple.trigger("transitionend");
				});
			}
			$ripple.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
				$ripple.remove();
			});
		};

	$.fn.mdRipple = function(){
		return this.each(function(){
			var $element = $(this),
				$container, containerOffset,
				startTimer = null;

			if ( ! $element.find(".ripple-container").length){
				$element.append('<span class="ripple-container"></span>');
			}

			$container = $element.find(".ripple-container");

			$element.on('mousedown touchstart', function(e){
				var offsetLeft, offsetTop, offsetRight,
					$ripple = $('<span class="ripple"></span>'),
					rippleSize = Math.max($element.outerWidth(), $element.outerHeight()) / Math.max(20, $ripple.outerWidth()) * 2.5;

				containerOffset = $container.offset();

				// get pointer position
				if ($('body').hasClass('rtl')) {
					if ( ! $.isMobile){
						offsetRight = containerOffset.left + $container.width() - e.pageX;
						offsetTop = e.pageY - containerOffset.top;
					} else {
						e = e.originalEvent;
						if (e.touches.length === 1) {
							offsetRight = containerOffset.left + $container.width() - e.touches[0].pageX;
							offsetTop = e.touches[0].pageY - containerOffset.top;
						} else {
							return;
						}
					}

					$ripple.css({right: offsetRight, top: offsetTop});
				} else {
					if ( ! $.isMobile){
						offsetLeft = e.pageX - containerOffset.left;
						offsetTop = e.pageY - containerOffset.top;
					} else {
						e = e.originalEvent;
						if (e.touches.length === 1) {
							offsetLeft = e.touches[0].pageX - containerOffset.left;
							offsetTop = e.touches[0].pageY - containerOffset.top;
						} else {
							return;
						}
					}

					$ripple.css({left: offsetLeft, top: offsetTop});
				}

				(function() { return window.getComputedStyle($ripple[0]).opacity; })();
				$container.append($ripple);

				startTimer = setTimeout(function(){
					$ripple.css({
						"-webkit-transform": "scale(" + rippleSize + ")",
						"transform": "scale(" + rippleSize + ")"
					});
					$ripple.addClass("ripple-on");
					$ripple.data("animating", "on");
					$ripple.data("mousedown", "on");
				}, 25);

				setTimeout(function() {
					$ripple.data("animating", "off");
					if ($ripple.data("mousedown") == "off") {
						removeRipple($ripple);
					}
				}, 700);

			});

			$element.on('mouseup mouseleave touchend', function(e){
				clearTimeout(startTimer);
				$element.find('.ripple').each(function(){
					var $ripple = $(this);
					$ripple.data("mousedown", "off");
					if ($ripple.data("animating") == "off"){
						removeRipple($ripple);
					}
				});

			});
		});
	};

	// Initialize MD Ripples
	jQuery('.g-btn, .l-header .w-nav-anchor, .w-portfolio-item-h, .w-tabs-item').mdRipple();


	/**
	 * Material Design Reveal Grid: Show grid items with hierarchical timing
	 */
	$.fn.revealGridMD = function(){
		var items = $(this),
			shown = false;
		if (items.length == 0) return;
		var countSz = function(){
			// The vector between the first item and max x/y
			var mx = 0,
				my = 0;
			// Retrieving items positions
			var sz = items.map(function(){
				var $this = jQuery(this),
					pos = $this.position();
				pos.width = $this.width();
				pos.height = $this.height();
				// Center point
				pos.cx = pos.left + parseInt(pos.width / 2);
				pos.cy = pos.top + parseInt(pos.height / 2);
				mx = Math.max(mx, pos.cx);
				my = Math.max(my, pos.cy);
				return pos;
			});
			var wx = mx - sz[0].cx,
				wy = my - sz[0].cy,
				wlen = Math.abs(wx * wx + wy * wy);
			// Counting projection lengths
			for (var i = 0; i < sz.length; i++) {
				// Counting vector to this item
				var vx = sz[i].cx - sz[0].cx,
					vy = sz[i].cy - sz[0].cy;
				sz[i].delta = (vx * wx + vy * wy) / wlen;
			}
			return sz;
		};
		var sz = countSz();
		items.css('opacity', 0).each(function(i, item){
			var $item = $(item);
			$item.performCSSTransition({
				opacity: 1
			}, 400, function(){
				$item.removeClass('animate_reveal');
			}, null, 750 * sz[i].delta);
		});
	};

	if ($.fn.waypoint) {
		$('.animate_revealgrid').each(function(){
			var $elm = $(this);
			new Waypoint({
				element: this,
				handler: function(){
					var $items = $elm.find('.animate_reveal');
					if ($us.canvas.$body.hasClass('disable_animation')) return $items.removeClass('animate_reveal');
					$items.revealGridMD();
					this.destroy();
				},
				offset : '85%'
			});
		});
	}
	else {
		// Fallback for waypoints script turned off
		$('.animate_revealgrid').removeClass('animate_revealgrid').find('animate_reveal').removeClass('animate_reveal');
	}
});

