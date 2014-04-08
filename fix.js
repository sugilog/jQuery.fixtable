( function() {
  var fix, frame, defaultConfig;

  defaultConfig = {
    width: 500,
    height: 300,
    scrollThreshold: 3
  };

  frame = {
    original: undefined,
    separated: {},
    scales: {
      columns: [],
    },
    lastScroll: {
      x: 0,
      y: 0
    },
    config: {},
    init: function( original, config ) {
      this.config = config;

      this.original = jQuery( original );
      this.initScale();

      this.separated.head = this.original.find( "thead" );
      this.separated.body = this.original.find( "tbody" );
      this.separated.foot = this.original.find( "tfoot" );
    },
    initScale: function() {
      this.scales.columns =
        this.original
          .find( "tr" ).eq( 0 )
          .find( "td, th" )
          .map( function() {
            return jQuery( this ).width();
          }).toArray();
    },
    base: function() {
      var wrapper = jQuery( "<div>" );

      wrapper.css( {
        width:     this.config.width,
        height:    this.config.height,
        position:  "relative",
        overflow:  "hidden",
      });

      wrapper
        .append( this.body() )
        .append( this.foot() )
        .append( this.head() )

      this.original.replaceWith( wrapper );
    },
    head: function() {
      var wrapper = jQuery( "<div>" );

      wrapper
        .addClass( "fixHead" )
        .css( {
          zIndex:   10,
          position: "absolute",
          top:   0,
          left:  0,
          // right: 0,
          height: jQuery( this.separated.head ).height(),
          width:  this.original.width()
        })
        .append(
          jQuery( "<table>" ).append( this.colgroup() ).append( this.separated.head )
        );

      return wrapper;
    },
    body: function() {
      var wrapper = jQuery( "<div>" );

      wrapper
        .addClass( "fixBody" )
        .css( {
          zIndex:   1,
          overflow: "scroll",
          position: "absolute",
          top:    jQuery( this.separated.head ).height(),
          left:   0,
          right:  0,
          height: this.config.height - ( jQuery( this.separated.head ).height() + jQuery( this.separated.foot ).height() ),
          // width:  this.original.width()
        })
        .append(
          jQuery( "<table>" ).css( { width: this.original.width() } ).append( this.colgroup() ).append( this.separated.body )
        );

      return wrapper;
    },
    foot: function() {
      var wrapper = jQuery( "<div>" );

      wrapper
        .addClass( "fixFoot" )
        .css( {
          zIndex:   10,
          position: "absolute",
          top:    ( this.config.height - jQuery( this.separated.foot ).height() ),
          left:   0,
          // right:  0,
          height: jQuery( this.separated.foot ).height(),
          width:  this.original.width()
        })
        .append(
          jQuery( "<table>" ).append( this.colgroup() ).append( this.separated.foot )
        );

      return wrapper;
    },
    colgroup: function() {
      return jQuery( "<colgroup>" ).append(
        jQuery.map( this.scales.columns, function( width ) {
          return jQuery( "<col>" ).prop( { span: 1 } ).css( { width: width } );
        })
      );
    },
    sync: function() {
      var self = this;

      jQuery( "div.fixBody" ).on( "scroll", function( event ) {
        // jQuery.scrollTop and scrollLeft
        var x = jQuery( this ).scrollLeft();

        if ( Math.abs( x - self.lastScroll.x ) > self.config.scrollThreshold ) {
          self.lastScroll.x = x

          jQuery( "div.fixHead, div.fixFoot" ).css( {
            left: -1 * x
          });
        }
      });
    }
  };

  fix = function fix( options ) {
    var config;

    config = jQuery.extend( {}, defaultConfig, options );

    frame.init( this, config );
    frame.base();
    frame.sync();
  };

  jQuery.fn.fix = fix;
})();
