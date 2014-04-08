( function() {
  var fix, frame, defaultConfig;

  defaultConfig = {
    width: 500,
    height: 300,
  };

  frame = {
    original: undefined,
    separated: {},
    scales: {
      columns: [],
    },
    config: {},
    init: function( original, config ) {
      this.original = jQuery( original );
      this.initScale();

      this.separated.head = this.original.find( "thead" );
      this.separated.body = this.original.find( "tbody" );
      this.separated.foot = this.original.find( "tfoot" );

      this.config = config;
    },
    initScale: function() {
      var columns,
          sum = 0;

      columns
        = this.original
          .find( "tr" ).eq( 0 )
          .find( "td, th" )
          .map( function() {
            var width = jQuery( this ).width();
            sum += width;
            return width;
          });

      this.scales.columns =  columns.map( function( _, width ) {
        console.log( width, sum );
        return ( 100 * width / sum ) + "%";
      }).toArray();
    },
    base: function() {
      var wrapper = jQuery( "<div>" );

      wrapper.css( {
        width:     this.config.width,
        height:    this.config.height,
        position: "relative"
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
        .css( {
          zIndex:   10,
          position: "absolute",
          top:   0,
          left:  0,
          right: 0,
          height: jQuery( this.separated.head ).height()
        })
        .append(
          jQuery( "<table>" ).append( this.colgroup() ).append( this.separated.head )
        );

      return wrapper;
    },
    body: function() {
      var wrapper = jQuery( "<div>" );

      wrapper
        .css( {
          zIndex:   1,
          overflow: "scroll",
          position: "absolute",
          top:    jQuery( this.separated.head ).height(),
          left:   0,
          right:  0,
          height: this.config.height - ( jQuery( this.separated.head ).height() + jQuery( this.separated.foot ).height() )
        })
        .append(
          jQuery( "<table>" ).append( this.colgroup() ).append( this.separated.body )
        );

      return wrapper;
    },
    foot: function() {
      var wrapper = jQuery( "<div>" );

      wrapper
        .css( {
          zIndex:   10,
          position: "absolute",
          top:    ( this.config.height - jQuery( this.separated.foot ).height() ),
          left:   0,
          right:  0,
          height: jQuery( this.separated.foot ).height()
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
    }
  };

  fix = function fix( options ) {
    var config;

    config = jQuery.extend( {}, defaultConfig, options );

    frame.init( this, config );
    frame.base();
  };

  jQuery.fn.fix = fix;
})();
