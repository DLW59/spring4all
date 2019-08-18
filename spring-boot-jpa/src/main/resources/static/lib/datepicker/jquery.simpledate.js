/**
 * 简易时间选择插件 UI
 * Copyright (c) 2012 Asiainfo-Linkage UED 
 */
;(function( $ ){
	
	$.vgopdate = $.vgopdate || {};
	
	$.extend( $.vgopdate, {
		_prev: function( e ){
			e.stopPropagation();
			e.preventDefault();
			
			var back = $( e.currentTarget );

			var list = back.parents( '.year' ).children( '.list' );
			
			var arr = list.data( 'current' );
			var opts = e.data.elem.data( 'setting' );
			var start = arr[0] - opts.length;
			
			var end = arr[0] - 1;
			
			list.data( 'current', [start, end] );
			
			if( start <= opts.start ) {
				back.unbind( 'click' ).addClass( 'end' );
			} else {
				back.siblings( '.end' ).bind( 'click',{elem:e.data.elem,_callback:e.data._callback}, $.vgopdate._next ).removeClass( 'end' );
			}
			
			$.vgopdate._list.apply( e.data.elem, [list, start, end, opts, e.data._callback]);
		},
		_next: function( e ){
			e.stopPropagation();
			e.preventDefault();
			
			var next = $( e.currentTarget );

			var list = next.parents( '.year' ).children( '.list' );
			
			var arr = list.data( 'current' );
			var opts = e.data.elem.data( 'setting' );
			
			var start = arr[1] + 1;
			
			var end = arr[1] + opts.length;
			
			list.data( 'current', [start, end] );
			
			if( end >= opts.end ) {
				next.unbind( 'click' ).addClass( 'end' );
			} else {
				next.siblings( '.end' ).bind( 'click',{elem:e.data.elem,_callback:e.data._callback}, $.vgopdate._prev ).removeClass( 'end' );
			}
			
			$.vgopdate._list.apply( e.data.elem, [list,start, end, opts, e.data._callback]);
		},
		_list: function( list, start, end, opts, _callback ){
			list.empty();
			
			var c = this.data( 'c' );
			
			var size = 0;
			for(var i = start; i <= end,size < opts.length; i++,size++){
				var year = $( '<a></a>' )
					.attr( 'href', '#' )
					.attr( 'hideFocus','hideFocus' )
					.data( 'value', i )
					.text( i );
				if( i == c.year ) {
					year.addClass( 'on' ).bind( 'click',{elem:this}, _callback );
				} else if ( i < opts.start || i > opts.end ) {
					year.addClass( 'disabled' );
				} else {
					year.bind( 'click',{elem:this}, _callback );
				}
				year.appendTo( list );
			}
		},
		_setcacheyear: function( e  ){
			e.stopPropagation();
			e.preventDefault();
			
			var elem = e.data.elem;
			var year = $( e.currentTarget );
			
			var set = elem.data( 'setting' );
			set.date.year = parseInt(year.text(),10);
			
			elem.data( 'setting', set );
			
			year.addClass( 'on' ).siblings( '.on' ).removeClass( 'on' );
		},
		_setcachemonth: function( e ){
			e.stopPropagation();
			e.preventDefault();
			
			var elem = e.data.elem;
			var month = $( e.currentTarget );
			
			var set = elem.data( 'setting' );
			set.date.month = parseInt( month.data( 'value' ),10);
			
			elem.data( 'setting', set );
			
			month.addClass( 'on' ).siblings( '.on' ).removeClass( 'on' );
		},
		_selected: function( e ){
			e.stopPropagation();
			e.preventDefault();
			
			var elem = e.data.self;
			var year = $( e.currentTarget );
			
			var set = elem.data( 'setting' );
			//set.current = parseInt(year.text(),10);
			
			$.vgopdate._setValue.call( elem, set );
			
			year.parents( '.ym' ).remove();
			
			elem.trigger( 'selected', set.date );
		},
		_setYear: function( e ){
			e.stopPropagation();
			e.preventDefault();
			
			var elem = e.data.elem;
			
			var set = elem.data( 'setting' );
			
			var y = $( this );
			
			set.date.year = parseInt(y.data( 'value' ),10);
			
			if( elem.is( 'input' ) ) {
				elem.val( set.date.year );
			} else {
				elem.text( set.date.year );
			}
			
			elem.data( 'c',{year:set.date.year, month:set.date.month} );
			
			elem.data( 'setting', set );
			elem.trigger( 'selected', set.date );
			
			y.parents( '.year' ).remove();
		},
		_setValue: function( opts ){
			this.data( 'c',{year:opts.date.year, month:opts.date.month}  );
			
			var m = opts.date.month;
			
			m = m < 10 ? '0' + m : '' + m;
			
			if( this.is( 'input' ) ) {
				this.val( opts.date.year + '-' + m );
			} else {
				this.text( opts.date.year + '-' + m );
			}
			
			this.data( 'setting', opts );
		},
		_year: function( opts, _callback ){
			var self = this;
			var years = $( '<div></div>' )
				.addClass( 'year' );
			
			var list = $( '<div></div>' ).addClass( 'list' ).addClass( 'clearfix' );
			var page = $( '<div></div>' ).addClass( 'page' ).addClass( 'clearfix' );
			
			var start = parseInt(String( opts.date.year ).substring( 0, 3 ),10) * 10;
			
			var end = start + opts.length - 1;
			
			$.vgopdate._list.apply( self, [list, start, end, opts, _callback] );
			var prev = $( '<span></span>' ).addClass( 'fl' ).append(
				$( '<a></a>' )
				.attr( 'href','#' )
				.addClass( 'left' )
				.attr( 'hideFocus','hideFocus' )
			).bind( 'click',{elem:self,_callback:_callback}, $.vgopdate._prev )
			.appendTo( page );
			
			var next = $( '<span></span>' ).addClass( 'fr' ).append(
				$( '<a></a>' )
				.attr( 'href','#' )
				.addClass( 'right' )
				.attr( 'hideFocus','hideFocus' )
			).bind( 'click',{elem:self,_callback:_callback}, $.vgopdate._next )
			.appendTo( page );
			
			if( start <= opts.start ) {
				prev.unbind( 'click' ).addClass( 'end' );
			}
			
			if( end >= opts.end ) {
				next.unbind( 'click' ).addClass( 'end' );
			}
			
			return years.append( list.data( 'current', [start,end] ) ).append( page );
		},
		_month: function( opts, _callback ){
			var self = this;
			
			var c = self.data( 'c' );
			var month = $( '<div></div>' )
				.addClass( 'month' );
			var list = $( '<div></div>' )
				.addClass( 'list' );
			for(var i = 1; i <= 12; i++){
				var m = $( '<a></a>' )
					.attr( 'href', '#' )
					.attr( 'hideFocus','hideFocus' )
					.text( i + opts.month )
					.data( 'value', i )
					.bind( 'click',{elem:self}, $.vgopdate._setcachemonth )
					.bind( 'click',{self:this}, $.vgopdate._selected );

				if( c.month == i ) { m.addClass( 'on' ); }
				m.appendTo( list );
			}
			return month.append( list );
		},
		_button: function( opts, _callback ){
			var foot = $( '<div></div>' ).addClass( 'foot' );
			
			$( '<a></a>' ).addClass( 'abtn' )
				.attr( 'href', '#' )
				.text( '取消' )
				.bind( 'click', function(e){
					var t = $( this );
					if( t.parents( '.year' ).size() > 0 ) {
						t.parents( '.year' ).remove();
					} else {
						t.parents( '.ym' ).remove();
					}
					
				}).appendTo( foot );
			
			var span = $( '<span></span>' ).addClass( 'mp' ).addClass( 'fr' );
			
			$( '<a></a>' )
				.addClass( 'btn' )
				.addClass( 'btn-submit' )
				.attr( 'href', '#' )
				.append( $( '<span></span>' ).text( '确定' ) )
				.bind( 'click', {elem: this},  _callback )
				.appendTo( span );
				
			return foot.append( span );
		},
		_create: function( opts ){
			var self = this;
			
			var offset = self.offset();
			
			var year = $.vgopdate._year.call( self, opts, opts.vm ? $.vgopdate._setcacheyear : $.vgopdate._setYear );
			
			var fd = (! opts.vm) ? year : $( '<div></div>' )
				.addClass( 'ym' )
				.addClass( 'clearfix' )
				.append( year );
			
			fd.css( opts.style )
				.css( 'position', 'absolute' )
				.offset({
					left: (offset.left + opts.leftPlus),
					top: (offset.top + self.height() + opts.topPlus)
				}).bind( 'mouseleave', function( e ){
					clearTimeout( this.out );
					/*this.out = setTimeout(function(){
						$( e.currentTarget ).remove();
					}, 1000);*/
				}).bind( 'mouseenter',function( e ){
					clearTimeout( this.out );
				});
			
			if( opts.vm ) {
				fd.append( $.vgopdate._month.call( self, opts, $.vgopdate._setcachemonth ) );
				//fd.append( $.vgopdate._button.call( self, opts, $.vgopdate._selected ) );
			}
			
			fd.appendTo( 'body' );
			$('body').on('click.ym', function(){
				if($('.ym').length>0){
					fd.remove();
				}
				$('body').off('click.ym');
			});
			
			var dom = fd.get( 0 );
			/*dom.out = setTimeout(function(){
				fd.remove();
			}, 1000);*/
		}
	});

	$.fn.extend({
		simpledate: function(){
			
			var self = this;
			
			var setting = {
				start: 1975,
				end:2099,
				vm: true,
				month:'月',
				date: {},
				length: 10,
				topPlus: 5,
				leftPlus: 0,
				style:{'z-index':10003}
			};
			
			//当前年月
			var current = null;
			if(self.val().length>0){
				var _val = self.val();
				setting.date={year:parseInt(_val.substring(0,4)),month:parseInt(_val.substring(5,7),10)}
				self.data( 'c',  setting.date);
			}else if( ! (current = self.data( 'c' )) ) {
				var date = new Date();
				setting.date.year = date.getFullYear();
				setting.date.month = date.getMonth() + 1;
				
				self.data( 'c', setting.date );
			}
			//覆盖默认设置
			if( typeof arguments[0] === 'object' ) {
				$.extend( setting, arguments[0] );
			} else {
				var set = self.data( 'setting' );
				if( set ) {
					$.extend( setting, set );
				}
			}
			self.data( 'setting', setting );
			
			self.unbind( 'click' ).bind( 'click', function( e ){
				e.stopPropagation();
				$('.ym').remove();
				$('.selectDivContainer').hide();//TODO 隐藏地域控件
				var self_ = $( e.currentTarget );
				var set = self.data( 'setting' );
				
				$.vgopdate._create.apply( self_, [set] );
			});
			
//			if( setting.vm == 'Y' ) {
//				if( self.is( 'input' ) ) {
//					self.val( setting.date.year );
//				} else {
//					self.text( setting.date.year );
//				}
//			} else {
//				$.vgopdate._setValue.call( self, setting );
//			}
			
			return self;
		}
	});
	
})( jQuery );