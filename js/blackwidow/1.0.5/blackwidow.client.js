/*************************************

    BlackWidow is a command-based interface for a social network.
    Copyright © 2012 Bilawal Hameed, Alejandro Sauze Saucedo, Charlie Brensinger, Anton Smyrnov, Sari Ghamloush

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*************************************/

/* This declares the global BW object. If initiated in the BW.init() then it will also load in the window.bw for global accessibility. */
var BW = {

	/* BW.version shows the internal version to support future compatibility */
	version: '1.0.5',
	
	/* This is if you wish to change the text of certain displays into another language or in a different form.
		% has been configured in certain text items that processes specific data. See the area they're used to change them. */
	text: {
		username: 'guest: ', // This is the username displayed beside every console entry
		no_jquery: "Sorry, Black Widow " + this.version + " requires jQuery to run.", // jQuery.js is not loaded
		no_base64: "Sorry, Black Widow " + this.version + " requires jQuery.Base64.js to run.", // jQuery.base64.js is not loaded
		no_browser: "Sorry, Black Widow " + this.version + " requires jQuery.browser.js to run.", // jQuery.browser.js is not loaded
		no_konami: "Sorry, Black Widow " + this.version + " requires jQuery.konami.js to run.", // jQuery.konami.js not loaded
		xml_invalid: "The XML file for BlackWidow you tried to request is not in a supported format.", // Configuration.xml unreadable
		xml_newer: "Sorry, your XML configuration is too new for usage in Black Widow " + this.version, // Configuration.xml is too new
		xml_outdated: "Sorry, your XML config version is too old on BW version of Black Widow.", // Configuration.xml is too old
		no_help: "There is no help available on the command '%'", // No help text could be found for "help …" command
		help_prepend: "HELP: ", // This is shown before every 'help …' statement
		console_error_debug: "An internal error occurred: %", // The console entry isn't valid, and we are in debug mode
		console_error: "Sorry, an error occurred while trying to process your command. Try again later." // Just like above, with debug off
	},
	
	/* This is configured to the webpage and what tags are needed. If you wish to change these, please select the appropriate selector. */
	elements: {
		sticky: '#%-indicator',
		console_screen: '#screen',
		display: '#display',
		console_entry: '#inputline',
		console_prompt: '#prompt',
		console_left_command: '#lcommand',
		console_right_command: '#rcommand',
		console_cursor: '#cursor',
		console_loading: '#spinner',
		command: '.command',
		bottom_line: '#bottomline'
	},
	
	/* Internal metadata needed to run the engine. These values are default and will be overwritten. */
	metadata: {
	
		/* BW.metadata.endpoint is any prepended URL used for the API endpoint to connect to the backend */
		endpoint: 'api.php?1.0',
		
		/* BW.metadata.xml_file is where the actual XML file will be located for the system configuration */
		xml_file: 'xml/configuration.xml',
		
		/* BW.metadata.config is where the configuration for the terminal lies. Each config item is self-explanatory. */
		config: {
			debug: false, // This is if you want the app to show debugging information
			UNDEF: "undefined", // This is used to check against undefined elements in JavaScript
			scrollStep: 20,
			scrollSpeed: 100,
			bg_color: '#000',
			fg_color: '#FFF',
			cursor_blink_time: 700,
			cursor_style:	 'block',
			spinnerCharacters: ['[   ]','[.  ]','[.. ]','[...]'],
			spinnerSpeed: 250,
			typingSpeed: 50,
			popupTemplate: '<html><body>%content%</body></html>'
		},
		
		/* These are only used once the script is running, so please, do not touch them unless you know exactly what your doing. */
		aliases: {}, pages: {}, help: {}, lastCommand: '',
		
		/* This is the metadata for the Terminal. These do not need editing and are only used to process the terminal. Do NOT edit. */
		terminalconfig: {
			buffer: '', 	// This contains what the user inputs in the web console
			pos: 0, 	// This is what the person is highlighting in the console
			history: [], 	// This is an array that stores previous console commands
			historyPos: 0, // This is if they enter up or down that it allows them to feed through past console commands
			promptActive: true, 	// This is if the console entry is currently available for entry
			cursorBlinkState: true,	// This is if the blinking in the console is currently running
			_cursorBlinkTimeout: null,	// This is what runs the timer to power the blinking
			spinnerIndex: 0,	// This is if the loading spinner is active, and if so, which console entry
			_spinnerTimeout: null,	// This is what runs the timer to power the loading [.], [..], […]
		}
		
	},
	
	/* BW function returns an array of contributors of Black Widow in chronological order */
	authors: function(){
		return [	"Bilawal Hameed", // A cool lead developer who brought this project to fruition
					"Alejandro Sauze Saucedo", // The marketer and developer in the team
					"Charlie Brensinger", // The third developer, he's amazingly cool
					"Anton Smyrnov", // The developer who writes more code than he speaks
					"Sari Ghamloush" ]; // The coder who loves hacky related stuff
	},
	
	/* BW.functions contains all basic generic functions for the system */
	functions: {
		
		/* BW.functions.ltrim strips whitespace on the front of a string */
		ltrim: function(value) {
			return value.replace(/\s*((\S+\s*)*)/, '$1') || '';
		},
		
		/* BW.functions.format formats the text like 'Hello World' to 'hello_world' */
		format: function(text) {
			return text.replace(/_/g, '_')
							.replace(/ /g, '_')
							.replace(/:/g, '_')
							.replace(/\\/g, '_')
							.replace(/\//g, '_')
							.replace(/[^a-zA-Z0-9\-]+/g, '')
							.replace(/-{2,}/g, '_')
							.toLowerCase();
		},
		
		/* BW.function.error is used to colour the output in red to represent error */
		error: function(text) { return $("<p>").addClass('error').text(text); },
		
		/* BW.functions.rtrim strips whitespace on the back of a string */
		rtrim: function(value) {
			return value.replace(/((\s*\S+)*)\s*/, '$1') || '';
		},
		
		/* BW.functions.entities encodes the string to avoid HTML complications */
		htmlentities: function(value) {
			// This sets the regex for parsing the HTML
			value = value.replace(/&/g, '&amp;');
			value = value.replace(/</g, '&lt;');
			value = value.replace(/>/g, '&gt;');
			value = value.replace(/ /g, '&nbsp;');
			
			// This performs a simple check to see if it's Internet Explorer
			if(/msie/i.test(navigator.userAgent))
				value = value.replace('\n', '&nbsp;<br />');
			else
				value = value.replace(/\x0D/g, '&nbsp;<br />');
			
			// Return a value if there's one, if not, just an empty string
			return value || '';
		},
		
		/* BW.functions.unsetEngine clears the engine and optionally displays a notice */
		unsetEngine: function(notice){ BW = {}; if(notice) { alert(notice); } return false; },
		
		/* BW.functions.sticky supports all the sticky commands for the console */
		sticky: {
			
			/* This stores whether Ctrl, Alt or Scroll are active in the console */
			keys: {
				ctrl: false,
				alt: false,
				scroll: false
			},
		
			/* This changes the active state of BW.functions.sticky.keys to a fixed value */
			set: function(key, state) {
				BW.functions.sticky.keys[key] = state;
				$(BW.elements['sticky'].replace('%', key)).toggle(BW.functions.sticky.keys[key]);
			},
		
			/* This changes the active state of BW.functions.sticky.keys to the opposite value */
			toggle: function(key) {
				BW.functions.sticky.set(key, !BW.functions.sticky.keys[key]);
			},
		
			/* This changes the active state of BW.functions.sticky.keys to false */
			reset: function(key) {
				BW.functions.sticky.set(key, false);
			},
		
			/* This changes the active state of all BW.functions.sticky.keys to false */
			resetAll: function(key) {
				$.each(BW.functions.sticky.keys, $.proxy(function(name, value) {
					BW.functions.sticky.reset(name);
				}, BW));
			}
			
			/* End BW.functions.sticky */
		}
	
	},
	
	/* BW.init is used to configure the library to custom needs */
	init: function(array) {
	
		/* As Black Widow is jQuery 1.7.2 dependant, we need to check, and if it doesn't exist, accordingly disable the engine. */
		if(typeof jQuery == BW.metadata.config.UNDEF) {
			BW.functions.unsetEngine(BW.text['no_jquery']);
			return;
		}
		
		/* Black Widow requires Base64, Browser, Hotkeys and Konami dependencies to run. */
		if(typeof jQuery.base64 == BW.metadata.config.UNDEF) {
			BW.functions.unsetEngine(BW.text['no_base64']);
			return;
		}
		
		if(typeof jQuery.browserTest == BW.metadata.config.UNDEF) {
			BW.functions.unsetEngine(BW.text['no_browser']);
			return;
		}
		
		if(typeof jQuery.fn.konami == BW.metadata.config.UNDEF) {
			BW.functions.unsetEngine(BW.text['no_konami']);
			return;
		}
		
		/* End Dependency Check */
	
		if(typeof array !== BW.metadata.config.UNDEF) {
			/* By default, Black Widow will store the entire library in the document window.bw. */
			if( typeof array.disableHeaderObject == "boolean" && array.disableHeaderObject == TRUE ) {
				window.bw = BW;
			}
		
			/* BW is if the API endpoint for the website is different from the local directory. */
			if( typeof array.url !== BW.metadata.config.UNDEF && array.url !== "" ) {
				BW.metadata.endpoint = array.url;
			}
			
			/* BW is the XML file address that contains all the configuration for the engine (aliases, etc). */
			if( typeof array.xmlurl !== BW.metadata.config.UNDEF && array.xmlurl !== "") {
				BW.metadata.xml_file = array.xmlurl;
			}
		}
		
		/* Let's add a .outerHTML() function to jQuery that we'll need if .html() doesn't fit our needs. */
		/* Pre-alpha notice: This may be removed in future versions. Please do not rely on this yet. */
		$.fn.outerHTML = function() {
			return $('<div>').append( this.eq(0).clone()).html().replace("<html>", "").replace("</html>", "");
        };
		
		/* Now we need to load the .terminal() system */
		BW.terminal.importData();
		BW.terminal.run();
		/* End BW.init */
	},
	
	/***** START TERMINAL *****/
	terminal: {
	
		/* BW.terminal.output is the equivalent of BW. This may be needed for code clarity */
		/* Pre-alpha notice: The may be removed in future versions. Please do not rely on this yet. */
		output: BW,
		
		/* BW.terminal.importData gets the configuration.xml and imports it accordingly. */
		importData: function() {
			
			/* This is the data we will send to $.ajax() - See http://api.jquery.com/jQuery.ajax/ */
			this.data = {
				type: 'GET', // We want a HTTP GET request
				url: BW.metadata.xml_file, // This pulls up the XML configuration file we'll now attempt to pull up
				dataType: 'xml', // It's xml, of course!
				success: function(xml) {
				
					/* Create a variable that finds the blackwidow object */
					$object = $(xml).find('blackwidow');
					
					// If there's no XML pulled up, it's clearly invalid.
					if($object.length == 0) {
						return BW.functions.unsetEngine(BW.text['xml_invalid']);
					}
					
					// Black Widow will almost be guaranteed to not support future major versions, so let's warn them.
					if(Math.floor($object.find('version').text()) > Math.floor(BW.version)) {
						return BW.functions.unsetEngine(BW.text['xml_newer']);
					}
					
					// And, just like this (though in the future we may add backwards support)
					if(Math.floor($object.find('version').text()) < Math.floor(BW.version)) {
						return BW.functions.unsetEngine(BW.text['xml_outdated']);
					}
					
					// BW processes the aliases in the XML file
					$object.find('aliases item').each(function(obj){
						var name = $(this).find('name').text(); // Let's pull up the name
						var redirect = $(this).find('redirect').text(); // Let's pull up the direct
						BW.metadata.aliases[name] = redirect; // Store it in script memory
					});
					
					// BW processes the built in pages in the XML file
					$object.find('pages item').each(function(obj){
						var name = $(this).find('name').text(); // Let's pull up the name
						BW.metadata.pages[name] = {
							output: $(this).find('html').outerHTML(), // The html
							title: $(this).find('title').text(), // The title
							width: $(this).find('width').text() || 600, // The width if one's in XML, if not, then 600 by default
							height: $(this).find('height').text() || 200, // The height if one's in XML, if not, then 200 by default
							type: $(this).find('type').text() || 'internal' // The type of page it is, internal, external or external_popup
						};
					});
					
					// BW processes any commands or tags that 
					$object.find('welcome item').each(function(obj){
						if($(this).children().size() > 0) {
							$(this).children().each(function(){
								BW.terminal.runText($(this).text(), $(this).get(0).tagName);
							});
						} else {
							BW.terminal.runCommand($(this).text());
						}
					});
					
					/* BW processes the help tags in the XML file */
					$object.find('help item').each(function(obj){
						var name = $(this).find('name').text(); // Let's pull up the name
						var text = $(this).find('text').text(); // Let's pull up the text
						BW.metadata.help[name] = text; //Store it in memory
					});
					
					/* This processes the HTML popup template
						%title% represents the <title> element entered in the XML configuration file
						%content% is what content will be displayed */
					if($object.find('pages global template').outerHTML().length > 0) {
						// We need to remove the <template> as it's part of the XML spec for Black Widow
						// As .outerHTML() removes <html> we need to add them back in now.
						BW.metadata.config.popupTemplate = "<html>" + $object.find('pages global template').outerHTML().replace("<template>", "").replace("</template>", "") + "</html>";
					}
					
				}
			};
			
			/* Now let's just run the request.. and expect for the best (not really!) */
			$.ajax(this.data);
			
			// we're done for pulling up the xml!
		},
		
		// BW.terminal.process processes the user's input accordingly
		process: function( terminal, command ) {
			// terminal is the object of the request
			// command is the raw txt of what the user input
			try {
				// Split the command by a space
				var cmd_args = command.split(' ');
				
				// Let's get the name of the command, i.e. cmd_args[0]
				var cmd_name = cmd_args.shift();
				cmd_args.unshift(terminal);
			
				// This checks if there's an alias, and if there, deal with accordingly.
				if( BW.metadata.aliases.hasOwnProperty(cmd_name) ) {
					cmd_name = BW.metadata.aliases[cmd_name];
				}
				
				// We need to check for special statements, such as help, clear, etc and process them before sending to server
				if(cmd_name == 'clear') {
					// Okay, let's clear the history. Take note the redirect will also be sent here, so we're killing two birds with one stone!
					BW.terminal.clear();
				} else if(cmd_name == 'help' && typeof cmd_args[1] !== BW.metadata.config.UNDEF) {
					// Alright, let's store in cmd_help what the user wants help with
					var cmd_help = cmd_args[1];
					
					// Does it exist?
					if(BW.metadata.help[cmd_help]) {
						// It definitely does.. let's show it to the user!
						BW.terminal.print( BW.text['help_prepend'] + BW.metadata.help[cmd_help]);
					} else {
						// It doesn't, so let's throw an error.
						BW.terminal.print(BW.functions.error(BW.text['no_help'].replace('%', cmd_help)));
					}
		
				} else if( BW.metadata.pages.hasOwnProperty(cmd_name) ) {
					// Okay, to get here, there must be a page configured.
					var tmp = BW.metadata.pages[cmd_name]['output']; // The HTML
					var type = BW.metadata.pages[cmd_name]['type'] || 'internal'; // The type of page it is (internal, external, external_popup)
					
					// So, it's an external, or external_popup? Let's go here.
					if(type == 'external' || type == 'external_popup') {
					
						// Let's parse the HTML by replacing %title% and %content% respectively with their values
						var final = BW.metadata.config.popupTemplate
										.replace('%title%', BW.metadata.pages[cmd_name]['title'])
										.replace('%content%', tmp);
						
						
						// If it's an external request, let's go here
						if(type == 'external') {
							// This will be printed in an iframe in the console
							BW.terminal.print(
								$("<iframe></iframe>").attr('width', BW.metadata.pages[cmd_name]['width'])
																	  .attr('height', BW.metadata.pages[cmd_name]['height'])
																	  .attr('frameborder', 0)
																	  .attr('src', 'data:text/html;base64,' + $.base64.encode(final))
							);
						
						} else if(type == 'external_popup') {
							// Alright, it's not an 'external', so is it a 'external_popup'?
							// This will be a proper popup using a real browser window
							window.open('data:text/html;base64,' + $.base64.encode(final),
												 'blackwidow_' + BW.functions.format(BW.metadata.pages[cmd_name]['title']),
												 'toolbar=0, menubar=0, location=no, scrollbars=1, resizable=1, status=0')
										.resizeTo(BW.metadata.pages[cmd_name]['width'], BW.metadata.pages[cmd_name]['height']);
						}
											
					} else {
						
						// If not, let's just display it in the console in a cool way that supports HTML
						$("<div>").html(tmp).children().each(function(){
							BW.terminal.print($($(this).outerHTML()));
						});
						
					}
					
				} else {
				
					// If not, let's send it to the browser and it may be able to offer something else! ;)
					var ajax_data = {
						url: BW.metadata.endpoint, // The URL endpoint of where to send the request
						cache: false, // No no, we don't ever want to cache this!
						dataType: 'html', // It's definitely html
						headers: {
							'X_BW_COMMAND': command, // This sends by a header the command
							'X_BW_TIMESTAMP': Math.round((new Date()).getTime() / 1000), // This sends the timestamp
							'X_BW_VERSION': BW.version // Send over the version of the BW JavaScript too!
						},
						success: function(data) {
							// Once it's successful, let's print it to the browser
							try {
								$("<div>").html(tmp).children().each(function(){
									BW.terminal.print($($(this).outerHTML()));
								});
							} catch(e) {
								BW.terminal.print(data);
							}
						},
						error: function(data) {
							BW.terminal.print(BW.functions.error(BW.text['console_error']));
						}
					};
					
					// Let's actually run the request! Gawd.
					$.ajax(ajax_data);
				}
				
				// Alright, we'll store it in the lastCommand variable in case any developers wish to use it ;)
				BW.metadata.lastCommand = command;
			
			} catch(e) {
				// Alright, to get here, an error's definitely occurred
				var text_select = (BW.metadata.config.debug == true) ? 'console_error_debug' : 'console_error';
				
				// Print text to the console (it differs depending on if debug mode is enabled)
				BW.terminal.print($('<p>').addClass('error').text(BW.text['console_error_debug'].replace('%', e)));
				
				// Set the loader element off
				BW.terminal.setWorking(false);
			}
			
			/* End BW.terminal.process */
		},
		
		// BW.terminal.isActive checks if the console is currently on for input, and if so, then continue
		isActive: function(func) {
			return function(){
				if(BW.metadata.terminalconfig.promptActive) { func.apply(BW, arguments); }
			};
		},
		
		// BW.terminal.setCursorState changes whether you can enter into the console
		setCursorState: function(state, fromTimeout) {
			// Let's change the cursor blink state!
			BW.metadata.terminalconfig.cursorBlinkState = state;
			
			// Is the console available for text entry?
			if (BW.metadata.config.cursor_style == 'block') {
				if (state) {
					// Turn it off
					$(BW.elements['console_cursor']).css({
						color: BW.metadata.config.bg_color,
						backgroundColor: BW.metadata.config.fg_color
					});
				} else {
					// Turn it on
					$(BW.elements['console_cursor']).css({
						color: BW.metadata.config.fg_color,
						background: 'none'
					});
				}
			} else {
				// If it doesn't exist then let's go here
				if (state) {
					$(BW.elements['console_cursor']).css('textDecoration', 'underline');
				} else {
					$(BW.elements['console_cursor']).css('textDecoration', 'none');
				}
			}
		
			// Let's schedule the next blink for the console cursor
			if (!fromTimeout && BW.metadata.terminalconfig._cursorBlinkTimeout) {
			
				// Clear the timeout object firstly
				window.clearTimeout(BW.metadata.terminalconfig._cursorBlinkTimeout);
				
				// We don't want it to start again, so clear the variable too!
				BW.metadata.terminalconfig._cursorBlinkTimeout = null;
			}
			
			//  Create a new cursor blink object, or rewrite over the old one to either be black or grey on its blinking state.
			BW.metadata.terminalconfig._cursorBlinkTimeout = window.setTimeout($.proxy(function() {
				BW.terminal.setCursorState(!BW.metadata.terminalconfig.cursorBlinkState, true);
			},BW), BW.metadata.config.cursor_blink_time);
		},
		
		// BW.terminal.updateInputDisplay update the input display
		updateInputDisplay: function() {
			var left = '',
				  underCursor = ' ',
				  right = '';

			// If they are going into a non-existent boundary, bring them back!
			if(BW.pos < 0) {
				BW.metadata.terminalconfig.pos = 0;
			}
			
			// Same as above but for the opposite attempt
			if(BW.metadata.terminalconfig.pos > BW.metadata.terminalconfig.buffer.length) {
				BW.metadata.terminalconfig.pos = BW.metadata.terminalconfig.buffer.length;
			}
			
			// To get here, they will be in the right boundary, so let's do some processing!
			// This checks what text is left from their position in the text
			if(BW.metadata.terminalconfig.pos > 0) {
				left = BW.metadata.terminalconfig.buffer.substr(0, BW.pos);
			}
			
			// This checks what letter the user is over in the console
			if(BW.metadata.terminalconfig.pos < BW.metadata.terminalconfig.buffer.length) {
				underCursor = BW.metadata.terminalconfig.buffer.substr(BW.metadata.terminalconfig.pos, 1);
			}
		
			// This checks what text is right from their position in the text
			if(BW.metadata.terminalconfig.buffer.length - BW.metadata.terminalconfig.pos > 1) {
				right = BW.metadata.terminalconfig.buffer.substr(BW.metadata.terminalconfig.pos + 1, BW.metadata.terminalconfig.buffer.length - BW.metadata.terminalconfig.pos - 1);
			}

			// This changes the console text accordingly to process the request
			$(BW.elements['console_left_command']).text(left);
			$(BW.elements['console_cursor']).text(underCursor);
			
			if(underCursor == ' ') {
				$(BW.elements['console_cursor']).html('&nbsp;');
			}
			
			$(BW.elements['console_right_command']).text(right);
			$(BW.elements['console_prompt']).text(BW.text.username);
			return;
		},
	
		// BW.terminal.clearInputBuffer clears the input buffer accordingly
		clearInputBuffer: function() {
			BW.metadata.terminalconfig.buffer = '';
			BW.metadata.terminalconfig.pos = 0;
			BW.terminal.updateInputDisplay();
		},
	
		// BW.terminal.clear clears the entire history of the buffer
		clear: function() {
			$(BW.elements['display']).html('');
		},
	
		// BW.terminal.addCharacters processes a request to insert a character into the console
		addCharacter: function(character) {
			// Let's find out where the character should go
			var left = BW.metadata.terminalconfig.buffer.substr(0, BW.metadata.terminalconfig.pos);
			var right = BW.metadata.terminalconfig.buffer.substr(BW.metadata.terminalconfig.pos, BW.metadata.terminalconfig.buffer.length - BW.metadata.terminalconfig.pos);
			
			// And now put it in!
			BW.metadata.terminalconfig.buffer = left + character + right;
			BW.metadata.terminalconfig.pos++;
			BW.terminal.updateInputDisplay();
			BW.terminal.setCursorState(true);
		},
	
		// BW.terminal.deleteCharacter
		deleteCharacter: function(forward) {
			var offset = forward ? 1 : 0;
			
			// Let's check the position of where to delete a character, and delete it accordingly!
			if(BW.metadata.terminalconfig.pos >= (1 - offset)) {
				var left = BW.metadata.terminalconfig.buffer.substr(0, BW.metadata.terminalconfig.pos - 1 + offset);
				var right = BW.metadata.terminalconfig.buffer.substr(BW.metadata.terminalconfig.pos + offset, BW.metadata.terminalconfig.buffer.length - BW.metadata.terminalconfig.pos - offset);
				BW.metadata.terminalconfig.buffer = left + right;
				BW.metadata.terminalconfig.pos -= 1 - offset;
				BW.terminal.updateInputDisplay();
			}
		
			BW.terminal.setCursorState(true);
		},
	
		// BW.terminal.deleteWord deletes an entire word (Ctrl+W in the console)
		deleteWord: function() {
			if(BW.metadata.terminalconfig.pos > 0) {
				var ncp = BW.metadata.terminalconfig.pos;
				
				while (ncp > 0 && BW.metadata.terminalconfig.buffer.charAt(ncp) !== ' ') {
					ncp--;
				}
				
				left = BW.metadata.terminalconfig.buffer.substr(0, ncp - 1);
				right = BW.metadata.terminalconfig.buffer.substr(ncp, BW.metadata.terminalconfig.buffer.length - BW.metadata.terminalconfig.pos);
				BW.metadata.terminalconfig.buffer = left + right;
				BW.metadata.terminalconfig.pos = ncp;
				BW.terminal.updateInputDisplay();
			}
			
			BW.terminal.setCursorState(true);
		},
	
		// BW.terminal.moveCursor moves the cursor up a certain value from its current position
		moveCursor: function(val) {
			BW.terminal.setPos(BW.metadata.terminalconfig.pos + val);
		},
	
		// BW.terminal.setPos sets the cursor in a fixed position
		setPos: function(pos) {
			if ((pos >= 0) && (pos <= BW.metadata.terminalconfig.buffer.length)) {
				BW.metadata.terminalconfig.pos = pos;
				BW.terminal.updateInputDisplay();
			}
			
			BW.terminal.setCursorState(true);
		},
	
		// BW.terminal.moveHistory allows the user to move through BW.metadata.config.history command history
		moveHistory: function(val) {
			var newpos = BW.metadata.terminalconfig.historyPos + val;
		
			if ((newpos >= 0) && (newpos <= BW.metadata.terminalconfig.history.length)) {
				if (newpos == BW.metadata.terminalconfig.history.length) {
					BW.terminal.clearInputBuffer();
				} else {
					BW.metadata.terminalconfig.buffer = BW.metadata.terminalconfig.history[newpos];
				}
			
				BW.metadata.terminalconfig.pos = BW.metadata.terminalconfig.buffer.length;
				BW.metadata.terminalconfig.historyPos = newpos;
				BW.terminal.updateInputDisplay();
				BW.terminal.jumpToBottom();
			}
			
			BW.terminal.setCursorState(true);
		},
	
		// BW.terminal.addHistory adds a new command to the BW.metadata.config.history array
		addHistory: function(cmd) {
			BW.metadata.terminalconfig.historyPos = BW.metadata.terminalconfig.history.push(cmd);
		},
		
		// BW.terminal.jumpToBottom allows the user to navigate to the bottom should the screen reach this area
		jumpToBottom: function() {
			$(BW.elements['console_screen']).animate({scrollTop: $(BW.elements['console_screen']).height()}, BW.metadata.config.scrollSpeed, 'linear');
		},

		// BW.terminal.jumpToTop performs the opposite to the BW.terminal.jumpToBottom by going to the top
		jumpToTop: function() {
			$(BW.elements['console_screen']).animate({scrollTop: 0}, BW.metadata.config.scrollSpeed, 'linear');
		},
	
		// BW.terminal.scrollPage allows scrolling through the command display
		scrollPage: function(num) {
			$(BW.elements['console_screen']).animate({
				scrollTop: $(BW.elements['console_screen']).scrollTop() + num * ($(BW.elements['console_screen']).height() * .75)
			}, BW.metadata.config.scrollSpeed, 'linear');
		},

		// BW.terminal.scrollLine allows scrolling through to a certain line
		scrollLine: function(num) {
			$(BW.elements['console_screen']).scrollTop($(BW.elements['console_screen']).scrollTop() + num * BW.metadata.config.scrollStep);
		},
		
		// BW.terminal.print inserts a new command into the screen
		print: function(text) {
			if (!text) {
				$(BW.elements['display']).append($('<div>'));
			} else if( text instanceof jQuery ) {
				$(BW.elements['display']).append(text);
			} else {
				var av = Array.prototype.slice.call(arguments, 0);
				$(BW.elements['display']).append($('<p>').text(av.join(' ')));
			}
			
			// This jumps to the bottom of the screen
			BW.terminal.jumpToBottom();
			return $(BW.elements['display']).find('p:last-child');
		},
		
		// BW.terminal.processInputBuffer processes the input and displays it in the console
		processInputBuffer: function(cmd) {
			// Write the text to the Terminal
			BW.terminal.print($('<p>').addClass('command').text(BW.text.username + BW.metadata.terminalconfig.buffer));
			var cmd = $.trim(BW.metadata.terminalconfig.buffer);
			
			// Clear the input text for the console
			BW.terminal.clearInputBuffer();
			
			// If there's nothing there, we can't really go any further.
			if (cmd.length == 0) {
				return false;
			}
			
			// Add the command to the BW.metadata.config.history
			BW.terminal.addHistory(cmd);
			return BW.terminal.process(BW, cmd);
		},
	
		// BW.terminal.setPromptActive enables the console entry box to be enabled
		setPromptActive: function(active) {
			BW.metadata.terminalconfig.promptActive = active;
			$(BW.elements['console_entry']).toggle(BW.metadata.terminalconfig.promptActive);
		},
	
		// BW.terminal.setWorking changes the loading command
		setWorking: function(working) {
			// Do you want to turn the worker on, and is it not already on?
			if (working && !BW.metadata.terminalconfig._spinnerTimeout) {
				// If all is good, let's add the console loader display i.e. [.]
				$(BW.elements['display'] + ' ' + BW.elements['command'] + ':last-child').add(BW.elements['bottom_line'])
																															   .first()
																															   .append($(BW.elements['console_loading']));
				
				// Let's set the interval to change [.] to [..] and […] and back again respectively									   
				BW.metadata.terminalconfig._spinnerTimeout = window.setInterval($.proxy(function() {
					
					// Has someone turned it off? If so, close the spinner immediately.
					if (!$(BW.elements['console_loading']).is(':visible')) {
						$(BW.elements['console_loading']).fadeIn();
					}
					
					// Let's configure the spinnerIndex value
					BW.metadata.terminalconfig.spinnerIndex = (BW.metadata.terminalconfig.spinnerIndex + 1) % BW.metadata.config.spinnerCharacters.length;
					
					// If this is good, then change the [.] to [..] or […] whichever is needed
					$(BW.elements['console_loading'])
						.text(BW.metadata.config.spinnerCharacters[BW.metadata.terminalconfig.spinnerIndex]);
				},BW), BW.metadata.config.spinnerSpeed);
				
				// While it's loading, user's cannot put other commands
				BW.terminal.setPromptActive(false);
				$(BW.elements['console_screen']).triggerHandler('cli-busy');
				
			} else if (!working && BW._spinnerTimeout) {
				
				// Let's turn off the console loader
				clearInterval(BW.metadata.terminalconfig._spinnerTimeout);
				BW.metadata.terminalconfig._spinnerTimeout = null;
				
				// Fade out the console loader and let the user put text back in
				$(BW.elements['console_loading']).fadeOut();
				BW.terminal.setPromptActive(true);
				$(BW.elements['console_screen']).triggerHandler('cli-ready');
			}
		},
		
		// BW.terminal.runCommand is if a command wishes to be placed using the 'entry' effect
		runCommand: function(text) {
			var index = 0, mine = false;
		
			// Turn off the console entry.
			BW.metadata.terminalconfig.promptActive = false;
			
			// Create the interval to do the 'entry' effect
			var interval = window.setInterval($.proxy(function typeCharacter() {
				if (index < text.length) {
					// If it hasn't fully been written, then carry on.
					BW.terminal.addCharacter(text.charAt(index));
					index += 1;
				} else {
					// It has been completed, let's configure everything back again.
					clearInterval(interval);
					BW.metadata.terminalconfig.promptActive = true;
					BW.terminal.processInputBuffer();
				}
			}, BW), BW.metadata.config.typingSpeed);
		},
		
		// BW.terminal.runText is if a console entry wishes to be placed using the 'entry' effect
		runText: function(text, htmltag) {
			var index = 0, obj;
			var rand = Math.round(Math.random() * 10000);
			tag = "<" + htmltag + ">";
			var obj = htmltag + "#" + rand;
			
			// Turn off the console entry.
			BW.metadata.terminalconfig.promptActive = false;
			BW.terminal.print($(tag).attr('id', rand).text(text.substr(0, 1)));
			index = 1;
						
			// Create the interval to do the 'entry' effect
			var interval = window.setInterval($.proxy(function typeCharacter() {
				if (index < text.length) {
					// If it hasn't fully been written, then carry on.
					$(obj).append(text.charAt(index));
					index += 1;
				} else {
					// It has been completed, let's configure everything back again.
					clearInterval(interval);
					$(obj).removeAttr('id');
					BW.metadata.terminalconfig.promptActive = true;
				}
			}, BW), BW.metadata.config.typingSpeed / (1 + (text.length * 0.01)));
		},
		
		// BW.terminal.run is used to initiate the Terminal side of the Black Widow engine
		run: function() {
		
			// Let's make the commands work to control the command
			$(document)
				.keypress($.proxy(BW.terminal.isActive(function(e) {	
					if (e.which >= 32 && e.which <= 126) {   
						var character = String.fromCharCode(e.which);
						var letter = character.toLowerCase();
					} else {
						return;
					}
				
					if ($.browser.opera && !(/[\w\s]/.test(character))) {
						return; // sigh.
					}
				
					// Support sticky characters
					if (BW.functions.sticky.keys.ctrl) {
						if (letter == 'w') {
							// Delete the last word
							BW.terminal.deleteWord();
						} else if (letter == 'h') {
							// Delete the last character
							BW.terminal.deleteCharacter(false);
						} else if (letter == 'l') {
							// Clear the console
							BW.terminal.clear();
						} else if (letter == 'a') {
							// Go to the beginning
							BW.terminal.setPos(0);
						} else if (letter == 'e') {
							// Go to the end of the string
							BW.terminal.setPos(BW.buffer.length);
						} else if (letter == 'd') {
							// Logout
							BW.terminal.runCommand('logout');
						}
					} else {
						// Else, just add the character!
						if (character) {
							BW.terminal.addCharacter(character);
							e.preventDefault();
						}
					}
				}), BW))
			
				
				// And all the rest of the controls!
				.bind('keydown', 'return', BW.terminal.isActive(function(e) { BW.terminal.processInputBuffer(); }))
				.bind('keydown', 'backspace', BW.terminal.isActive(function(e) { e.preventDefault(); BW.terminal.deleteCharacter(e.shiftKey); }))
				.bind('keydown', 'del', BW.terminal.isActive(function(e) { BW.terminal.deleteCharacter(true); }))
				.bind('keydown', 'left', BW.terminal.isActive(function(e) { BW.terminal.moveCursor(-1); }))
				.bind('keydown', 'right', BW.terminal.isActive(function(e) { BW.terminal.moveCursor(1); }))
				.bind('keydown', 'up', BW.terminal.isActive(function(e) {
					// This configures the up command history controls
					e.preventDefault();
					if (e.shiftKey || BW.functions.sticky.keys.scroll) {
						BW.terminal.scrollLine(-1);
					} else if (e.ctrlKey || BW.functions.sticky.keys.ctrl) {
						BW.terminal.scrollPage(-1);
					} else {
						BW.terminal.moveHistory(-1);
					}
				}))
				.bind('keydown', 'down', BW.terminal.isActive(function(e) {
					// This configures the down command history controls
					e.preventDefault();
					if (e.shiftKey || BW.functions.sticky.keys.scroll) {
						BW.terminal.scrollLine(1);
					} else if (e.ctrlKey || BW.functions.sticky.keys.ctrl) {
						BW.terminal.scrollPage(1);
					} else {
						BW.terminal.moveHistory(1);
					}
				}))
				.bind('keydown', 'pageup', BW.terminal.isActive(function(e) { BW.terminal.scrollPage(-1); }))
				.bind('keydown', 'pagedown', BW.terminal.isActive(function(e) { BW.terminal.scrollPage(1); }))
				.bind('keydown', 'home', BW.terminal.isActive(function(e) {
					e.preventDefault();
					if (e.ctrlKey || BW.functions.sticky.keys.ctrl) {
						BW.terminal.jumpToTop();
					} else {
						BW.terminal.setPos(0);
					}
				}))
				.bind('keydown', 'end', BW.terminal.isActive(function(e) {
					e.preventDefault();
					if (e.ctrlKey || BW.functions.sticky.keys.ctrl) {
						BW.terminal.jumpToBottom();
					} else {
						BW.terminal.setPos(BW.metadata.terminalconfig.buffer.length);
					}
				}))
				.bind('keydown', 'tab', function(e) {
					e.preventDefault();
				})
				.keyup(function(e) {
					var keyName = $.hotkeys.specialKeys[e.which];
					if (keyName in {'ctrl':true, 'alt':true, 'scroll':true}) {
						BW.functions.sticky.toggle(keyName);
					} else if (!(keyName in {'left':true, 'right':true, 'up':true, 'down':true})) {
						BW.functions.sticky.resetAll();
					}
				});
		
			// If the window is resized, make the console adapt to it!
			$(window).resize(function(e) { $(BW.elements['console_screen']).scrollTop($(BW.elements['console_screen']).height()); });

			// Initiate the engine and let them use it!
			BW.terminal.setCursorState(true);
			BW.terminal.setWorking(false);
			$(BW.elements['console_prompt']).html(BW.text.username);
			$(BW.elements['console_screen']).hide().fadeIn('fast', function() {
				$(BW.elements['console_screen']).triggerHandler('cli-load');
			});
		/* End BW.terminal.init */
		}
		
	}
	/***** END TERMINAL *****/
	
};