(function($) {
	jQuery(document).ready( function() {


		// Similar to `wpautop()` in formatting.php
		function autop( text ) {
			var preserve_linebreaks = false,
				preserve_br = false,
				blocklist = 'table|thead|tfoot|caption|col|colgroup|tbody|tr|td|th|div|dl|dd|dt|ul|ol|li|pre' +
					'|form|map|area|blockquote|address|math|style|p|h[1-6]|hr|fieldset|legend|section' +
					'|article|aside|hgroup|header|footer|nav|figure|figcaption|details|menu|summary';

			// Normalize line breaks
			text = text.replace( /\r\n|\r/g, '\n' );

			if ( text.indexOf( '\n' ) === -1 ) {
				return text;
			}

			if ( text.indexOf( '<object' ) !== -1 ) {
				text = text.replace( /<object[\s\S]+?<\/object>/g, function( a ) {
					return a.replace( /\n+/g, '' );
				});
			}

			text = text.replace( /<[^<>]+>/g, function( a ) {
				return a.replace( /[\n\t ]+/g, ' ' );
			});

			// Protect pre|script tags
			if ( text.indexOf( '<pre' ) !== -1 || text.indexOf( '<script' ) !== -1 ) {
				preserve_linebreaks = true;
				text = text.replace( /<(pre|script)[^>]*>[\s\S]*?<\/\1>/g, function( a ) {
					return a.replace( /\n/g, '<wp-line-break>' );
				});
			}

			// keep <br> tags inside captions and convert line breaks
			if ( text.indexOf( '[caption' ) !== -1 ) {
				preserve_br = true;
				text = text.replace( /\[caption[\s\S]+?\[\/caption\]/g, function( a ) {
					// keep existing <br>
					a = a.replace( /<br([^>]*)>/g, '<wp-temp-br$1>' );
					// no line breaks inside HTML tags
					a = a.replace( /<[^<>]+>/g, function( b ) {
						return b.replace( /[\n\t ]+/, ' ' );
					});
					// convert remaining line breaks to <br>
					return a.replace( /\s*\n\s*/g, '<wp-temp-br />' );
				});
			}

			text = text + '\n\n';
			text = text.replace( /<br \/>\s*<br \/>/gi, '\n\n' );
			text = text.replace( new RegExp( '(<(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '\n$1' );
			text = text.replace( new RegExp( '(</(?:' + blocklist + ')>)', 'gi' ), '$1\n\n' );
			text = text.replace( /<hr( [^>]*)?>/gi, '<hr$1>\n\n' ); // hr is self closing block element
			text = text.replace( /\s*<option/gi, '<option' ); // No <p> or <br> around <option>
			text = text.replace( /<\/option>\s*/gi, '</option>' );
			text = text.replace( /\n\s*\n+/g, '\n\n' );
			text = text.replace( /([\s\S]+?)\n\n/g, '<p>$1</p>\n' );
			text = text.replace( /<p>\s*?<\/p>/gi, '');
			text = text.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );
			text = text.replace( /<p>(<li.+?)<\/p>/gi, '$1');
			text = text.replace( /<p>\s*<blockquote([^>]*)>/gi, '<blockquote$1><p>');
			text = text.replace( /<\/blockquote>\s*<\/p>/gi, '</p></blockquote>');
			text = text.replace( new RegExp( '<p>\\s*(</?(?:' + blocklist + ')(?: [^>]*)?>)', 'gi' ), '$1' );
			text = text.replace( new RegExp( '(</?(?:' + blocklist + ')(?: [^>]*)?>)\\s*</p>', 'gi' ), '$1' );

			// Remove redundant spaces and line breaks after existing <br /> tags
			text = text.replace( /(<br[^>]*>)\s*\n/gi, '$1' );

			// Create <br /> from the remaining line breaks
			text = text.replace( /\s*\n/g, '<br />\n');

			text = text.replace( new RegExp( '(</?(?:' + blocklist + ')[^>]*>)\\s*<br />', 'gi' ), '$1' );
			text = text.replace( /<br \/>(\s*<\/?(?:p|li|div|dl|dd|dt|th|pre|td|ul|ol)>)/gi, '$1' );
			text = text.replace( /(?:<p>|<br ?\/?>)*\s*\[caption([^\[]+)\[\/caption\]\s*(?:<\/p>|<br ?\/?>)*/gi, '[caption$1[/caption]' );

			text = text.replace( /(<(?:div|th|td|form|fieldset|dd)[^>]*>)(.*?)<\/p>/g, function( a, b, c ) {
				if ( c.match( /<p( [^>]*)?>/ ) ) {
					return a;
				}

				return b + '<p>' + c + '</p>';
			});

			// put back the line breaks in pre|script
			if ( preserve_linebreaks ) {
				text = text.replace( /<wp-line-break>/g, '\n' );
			}

			if ( preserve_br ) {
				text = text.replace( /<wp-temp-br([^>]*)>/g, '<br$1>' );
			}

			return text;
		}

		diffData.forEach( function( diff ) {

			var container = document.getElementById( diff.containerId );

			var dmp = new diff_match_patch();
			var textDiff = dmp.diff_main( diff.versions[0].content, diff.versions[1].content );

			dmp.diff_cleanupEfficiency( 6 );

			// var myDiff = $;(
				// $( diff.versions[0].content ),
				// $( diff.versions[1].content )
			// );

			console.log( textDiff );

			// document.getElementById( diff.containerId ).innerHTML = dmp.diff_prettyHtml( textDiff );

			var text = '';

			textDiff.forEach( function( part ) {
				if ( -1 === part[0] ) {
					text += '<del class="Diff-Removed">' + part[1] + '</del>';
				} else if ( 1 === part[0] ) {
					text += '<ins class="Diff-Added">' + part[1] + '</ins>';
				} else {
					text += '<span class="Diff-Text">' + part[1] + '</span>';
				}
			} )

			console.log( text );
			$(container).html( autop( text ) );

		} );


	} );
}(jQuery));
