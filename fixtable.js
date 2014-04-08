( function() {
  var fixtable, frame, defaultConfig;

  defaultConfig = {
    width: 800,
    height: 300,
    scrollThreshold: 3,
    fixColumns: 0
  };

  frame = {
    original: undefined,
    separated: {},
    scales: {
      columns: [],
      border: {
        x: 0,
        y: 0,
      }
    },
    lastScroll: {
      x: 0,
      y: 0
    },
    config: {},
    init: function( original, config ) {
      var self = this;
      this.config = config;

      this.original = jQuery( original );
      this.initScale();

      this.separated.head = this.original.find( "thead" );
      this.separated.body = this.original.find( "tbody" );
      this.separated.foot = this.original.find( "tfoot" );

      jQuery.each( this.sliced( "left", "columns" ), function( _, _width ) {
        self.scales.border.x += _width;
      });
      self.scales.border.y = this.separated.head.height();
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
        .append( this.body( "right" ) )
        .append( this.body( "left" ) )
        .append( this.foot( "right" ) )
        .append( this.foot( "left" ) )
        .append( this.head( "right" ) )
        .append( this.head( "left" ) )

      this.original.replaceWith( wrapper );
    },
    head: function( type ) {
      var wrapper = jQuery( "<div>" );

      wrapper
        .addClass( type === "left" ? "fixHead" : "fixScrollHead" )
        .css( this.style( type, "head" ) )
        .append(
          jQuery( "<table>" ).append( this.colgroup( type ) ).append( this.sliced( type, "head" ) )
        );

      return wrapper;
    },
    body: function( type ) {
      var wrapper = jQuery( "<div>" );

      wrapper
        .addClass( type === "left" ? "fixScrollBody" : "fixBody" )
        .css( this.style( type, "div.body" ) )
        .append(
          jQuery( "<table>" )
            .css( this.style( type, "table.body" ) )
            // .css( { width: this.original.width() } )
            .append( this.colgroup( type ) ).append( this.sliced( type, "body" ) )
        );

      return wrapper;
    },
    foot: function( type ) {
      var wrapper = jQuery( "<div>" );

      wrapper
        .addClass( type === "left" ? "fixFoot" : "fixScrollFoot" )
        .css( this.style( type, "foot" ) )
        .append(
          jQuery( "<table>" ).append( this.colgroup( type ) ).append( this.sliced( type, "foot" ) )
        );

      return wrapper;
    },
    colgroup: function( type ) {
      var self = this;

      return jQuery( "<colgroup>" ).append(
        jQuery.map( this.sliced( type, "columns" ), function( width, idx ) {
          return jQuery( "<col>" ).prop( { span: 1 } ).css( { width: width } );
        })
      );
    },
    sync: function() {
      var self = this;

      jQuery( "div.fixBody" ).on( "scroll", function( event ) {
        // jQuery.scrollTop and scrollLeft
        var x = jQuery( this ).scrollLeft(),
            y = jQuery( this ).scrollTop();

        if ( Math.abs( x - self.lastScroll.x ) > self.config.scrollThreshold ) {
          self.lastScroll.x = x;

          jQuery( "div.fixScrollHead, div.fixScrollFoot" ).css( {
            left: -1 * x + self.scales.border.x
          });
        }

        if ( Math.abs( y - self.lastScroll.y ) > self.config.scrollThreshold ) {
          self.lastScroll.y = y;

          jQuery( "div.fixScrollBody" ).css( {
            top: -1 * y + self.scales.border.y
          });
        }
      });
    },
    sliced: function( type, targetType ) {
      var start = type === "left" ? 0 : this.config.fixColumns,
          end   = type === "left" ? this.config.fixColumns : undefined;

      switch ( targetType ) {
        case "head":
        case "body":
        case "foot":
          var rows,
              target = this.separated[ targetType ].clone();

          rows = target.find( "tr" ).map( function() {
            var row = jQuery( this ).clone();
            row.children().remove();
            return row.append(
              jQuery( this ).find( "th, td" ).slice( start, end )
            );
          });

          target.children().remove()

          rows.each( function() {
            target.append( this );
          });

          return target;
        case "columns":
          return this.scales.columns.slice( start, end )
      }
    },
    style: function( type, targetType ) {
      var left,
          width = 0, leftWidth = this.scales.border.x;

      jQuery.each( this.sliced( type, "columns" ), function( _, _width ) {
        width += _width;
      });

      left = type === "left" ? 0 : leftWidth;

      switch ( targetType ) {
        case "head":
          return {
            zIndex:   10,
            position: "absolute",
            top:      0,
            left:     left,
            height:   this.scales.border.y,
            width:    width,
            backgroundColor: "#ffffff"
          };
        case "div.body":
          return {
            zIndex:   1,
            overflow: type === "left" ? undefined : "scroll",
            position: "absolute",
            top:      this.scales.border.y,
            left:     left,
            right:    type === "left" ? ( this.config.width - leftWidth ) : 0,
            height:   this.config.height - ( this.separated.head.height() + this.separated.foot.height() ),
            backgroundColor: "#ffffff"
          };
        case "table.body":
          return {
            overflow: type === "left" ? "scroll" : undefined,
            width:  width,
            height: this.separated.body.height()
          };
        case "foot":
          return {
            zIndex:   10,
            position: "absolute",
            top:      ( this.config.height - this.separated.foot.height() ),
            left:     left,
            height:   this.separated.foot.height(),
            width:    width,
            backgroundColor: "#ffffff"
          };
      }
    }
  };

  fixtable = function fixtable( options ) {
    var config;

    config = jQuery.extend( {}, defaultConfig, options );

    frame.init( this, config );
    frame.base();
    frame.sync();
  };

  jQuery.fn.fixtable = fixtable;
})();
