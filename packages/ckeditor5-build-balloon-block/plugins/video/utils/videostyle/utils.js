/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videostyle/utils
 */

import { icons } from 'ckeditor5/src/core';
import { logWarning } from 'ckeditor5/src/utils';

const {
	objectFullWidth,
	objectInline,
	objectLeft,	objectRight, objectCenter,
	objectBlockLeft, objectBlockRight
} = icons;

/**
 * Default video style options provided by the plugin that can be referred in the {@link module:video/video~VideoConfig#styles}
 * configuration.
 *
 * There are available 5 styles focused on formatting:
 *
 * * **`'alignLeft'`** aligns the inline or block video to the left and wraps it with the text using the `video-style-align-left` class,
 * * **`'alignRight'`** aligns the inline or block video to the right and wraps it with the text using the `video-style-align-right` class,
 * * **`'alignCenter'`** centers the block video using the `video-style-align-center` class,
 * * **`'alignBlockLeft'`** aligns the block video to the left using the `video-style-block-align-left` class,
 * * **`'alignBlockRight'`** aligns the block video to the right using the `video-style-block-align-right` class,
 *
 * and 3 semantic styles:
 *
 * * **`'inline'`** is an inline video without any CSS class,
 * * **`'block'`** is a block video without any CSS class,
 * * **`'side'`** is a block video styled with the `video-style-side` CSS class.
 *
 * @readonly
 * @type {Object.<String,module:video/videostyle~VideoStyleOptionDefinition>}
 */
const DEFAULT_OPTIONS = {
	// This style represents an video placed in the line of text.
	get inline() {
		return {
			name: 'inline',
			title: 'In line',
			icon: objectInline,
			modelElements: [ 'videoInline' ],
			isDefault: true
		};
	},

	// This style represents an video aligned to the left and wrapped with text.
	get alignLeft() {
		return {
			name: 'alignLeft',
			title: 'Left aligned video',
			icon: objectLeft,
			modelElements: [ 'videoBlock', 'videoInline' ],
			className: 'video-style-align-left'
		};
	},

	// This style represents an video aligned to the left.
	get alignBlockLeft() {
		return {
			name: 'alignBlockLeft',
			title: 'Left aligned video',
			icon: objectBlockLeft,
			modelElements: [ 'videoBlock' ],
			className: 'video-style-block-align-left'
		};
	},

	// This style represents a centered video.
	get alignCenter() {
		return {
			name: 'alignCenter',
			title: 'Centered video',
			icon: objectCenter,
			modelElements: [ 'videoBlock' ],
			className: 'video-style-align-center'
		};
	},

	// This style represents an video aligned to the right and wrapped with text.
	get alignRight() {
		return {
			name: 'alignRight',
			title: 'Right aligned video',
			icon: objectRight,
			modelElements: [ 'videoBlock', 'videoInline' ],
			className: 'video-style-align-right'
		};
	},

	// This style represents an video aligned to the right.
	get alignBlockRight() {
		return {
			name: 'alignBlockRight',
			title: 'Right aligned video',
			icon: objectBlockRight,
			modelElements: [ 'videoBlock' ],
			className: 'video-style-block-align-right'
		};
	},

	// This option is equal to the situation when no style is applied.
	get block() {
		return {
			name: 'block',
			title: 'Centered video',
			icon: objectCenter,
			modelElements: [ 'videoBlock' ],
			isDefault: true
		};
	},

	// This represents a side video.
	get side() {
		return {
			name: 'side',
			title: 'Side video',
			icon: objectRight,
			modelElements: [ 'videoBlock' ],
			className: 'video-style-side'
		};
	}
};

/**
 * Default video style icons provided by the plugin that can be referred in the {@link module:video/video~VideoConfig#styles}
 * configuration.
 *
 * See {@link module:video/videostyle~VideoStyleOptionDefinition#icon} to learn more.
 *
 * There are 7 default icons available: `'full'`, `'left'`, `'inlineLeft'`, `'center'`, `'right'`, `'inlineRight'`, and `'inline'`.
 *
 * @readonly
 * @type {Object.<String,String>}
 */
const DEFAULT_ICONS = {
	full: objectFullWidth,
	left: objectBlockLeft,
	right: objectBlockRight,
	center: objectCenter,
	inlineLeft: objectLeft,
	inlineRight: objectRight,
	inline: objectInline
};

/**
 * Default drop-downs provided by the plugin that can be referred in the {@link module:video/video~VideoConfig#toolbar}
 * configuration. The drop-downs are containers for the {@link module:video/videostyle~VideoStyleConfig#options video style options}.
 *
 * If both of the `VideoEditing` plugins are loaded, there are 2 predefined drop-downs available:
 *
 * * **`'videoStyle:wrapText'`**, which contains the `alignLeft` and `alignRight` options, that is,
 * those that wraps the text around the video,
 * * **`'videoStyle:breakText'`**, which contains the `alignBlockLeft`, `alignCenter` and `alignBlockRight` options, that is,
 * those that breaks the text around the video.
 *
 * @readonly
 * @type {Array.<module:video/videostyle/videostyleui~VideoStyleDropdownDefinition>}
 */
const DEFAULT_DROPDOWN_DEFINITIONS = [ {
	name: 'videoStyle:wrapText',
	title: 'Wrap text',
	defaultItem: 'videoStyle:alignLeft',
	items: [ 'videoStyle:alignLeft', 'videoStyle:alignRight' ]
}, {
	name: 'videoStyle:breakText',
	title: 'Break text',
	defaultItem: 'videoStyle:block',
	items: [ 'videoStyle:alignBlockLeft', 'videoStyle:block', 'videoStyle:alignBlockRight' ]
} ];

/**
 * Returns a list of the normalized and validated video style options.
 *
 * @protected
 * @param {Object} config
 * @param {Boolean} config.isInlinePluginLoaded
 * Determines whether the {@link module:video/video/videoblockediting~VideoBlockEditing `VideoBlockEditing`} plugin has been loaded.
 * @param {Boolean} config.isBlockPluginLoaded
 * Determines whether the {@link module:video/video/videoinlineediting~VideoInlineEditing `VideoInlineEditing`} plugin has been loaded.
 * @param {module:video/videostyle~VideoStyleConfig} config.configuredStyles
 * The video styles configuration provided in the video styles {@link module:video/video~VideoConfig#styles configuration}
 * as a default or custom value.
 * @returns {module:video/videostyle~VideoStyleConfig}
 * * Each of options contains a complete icon markup.
 * * The video style options not supported by any of the loaded plugins are filtered out.
 */
function normalizeStyles( config ) {
	const configuredStyles = config.configuredStyles.options || [];

	const styles = configuredStyles
		.map( arrangement => normalizeDefinition( arrangement ) )
		.filter( arrangement => isValidOption( arrangement, config ) );

	return styles;
}

/**
 * Returns the default video styles configuration depending on the loaded video editing plugins.
 * @protected
 *
 * @param {Boolean} isInlinePluginLoaded
 * Determines whether the {@link module:video/video/videoblockediting~VideoBlockEditing `VideoBlockEditing`} plugin has been loaded.
 *
 * @param {Boolean} isBlockPluginLoaded
 * Determines whether the {@link module:video/video/videoinlineediting~VideoInlineEditing `VideoInlineEditing`} plugin has been loaded.
 *
 * @returns {Object<String,Array>}
 * It returns an object with the lists of the video style options and groups defined as strings related to the
 * {@link module:video/videostyle/utils~DEFAULT_OPTIONS default options}
 */
function getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) {
	if ( isBlockPluginLoaded && isInlinePluginLoaded ) {
		return {
			options: [
				'inline', 'alignLeft', 'alignRight',
				'alignCenter', 'alignBlockLeft', 'alignBlockRight',
				'block', 'side'
			]
		};
	} else if ( isBlockPluginLoaded ) {
		return {
			options: [ 'block', 'side' ]
		};
	} else if ( isInlinePluginLoaded ) {
		return {
			options: [ 'inline', 'alignLeft', 'alignRight' ]
		};
	}

	return {};
}

/**
 * Returns a list of the available predefined drop-downs' definitions depending on the loaded video editing plugins.
 * @protected
 *
 * @param {module:core/plugincollection~PluginCollection} pluginCollection
 * @returns {Array.<module:video/videostyle/videostyleui~VideoStyleDropdownDefinition>}
 */
function getDefaultDropdownDefinitions( pluginCollection ) {
	if ( pluginCollection.has( 'VideoBlockEditing' ) && pluginCollection.has( 'VideoInlineEditing' ) ) {
		return [ ...DEFAULT_DROPDOWN_DEFINITIONS ];
	} else {
		return [];
	}
}

// Normalizes an video style option or group provided in the {@link module:video/video~VideoConfig#styles}
// and returns it in a {@link module:video/videostyle~VideoStyleOptionDefinition}/
//
// @param {Object|String} definition
//
// @returns {module:video/videostyle~VideoStyleOptionDefinition}}
function normalizeDefinition( definition ) {
	if ( typeof definition === 'string' ) {
		// Just the name of the style has been passed, but none of the defaults.
		if ( !DEFAULT_OPTIONS[ definition ] ) {
			// Normalize the style anyway to prevent errors.
			definition = { name: definition };
		}
		// Just the name of the style has been passed and it's one of the defaults, just use it.
		// Clone the style to avoid overriding defaults.
		else {
			definition = { ...DEFAULT_OPTIONS[ definition ] };
		}
	} else {
		// If an object style has been passed and if the name matches one of the defaults,
		// extend it with defaults – the user wants to customize a default style.
		// Note: Don't override the user–defined style object, clone it instead.
		definition = extendStyle( DEFAULT_OPTIONS[ definition.name ], definition );
	}

	// If an icon is defined as a string and correspond with a name
	// in default icons, use the default icon provided by the plugin.
	if ( typeof definition.icon === 'string' ) {
		definition.icon = DEFAULT_ICONS[ definition.icon ] || definition.icon;
	}

	return definition;
}

// Checks if the video style option is valid:
// * if it has the modelElements fields defined and filled,
// * if the defined modelElements are supported by any of the loaded video editing plugins.
// It also displays a console warning these conditions are not met.
//
// @param {module:video/videostyle~VideoStyleOptionDefinition} video style option
// @param {Object.<String,Boolean>} { isBlockPluginLoaded, isInlinePluginLoaded }
//
// @returns Boolean
function isValidOption( option, { isBlockPluginLoaded, isInlinePluginLoaded } ) {
	const { modelElements, name } = option;

	if ( !modelElements || !modelElements.length || !name ) {
		warnInvalidStyle( { style: option } );

		return false;
	} else {
		const supportedElements = [ isBlockPluginLoaded ? 'videoBlock' : null, isInlinePluginLoaded ? 'videoInline' : null ];

		// Check if the option is supported by any of the loaded plugins.
		if ( !modelElements.some( elementName => supportedElements.includes( elementName ) ) ) {
			/**
			 * In order to work correctly, each video style {@link module:video/videostyle~VideoStyleOptionDefinition option}
			 * requires specific model elements (also: types of videos) to be supported by the editor.
			 *
			 * Model element names to which the video style option can be applied are defined in the
			 * {@link module:video/videostyle~VideoStyleOptionDefinition#modelElements} property of the style option
			 * definition.
			 *
			 * Explore the warning in the console to find out precisely which option is not supported and which editor plugins
			 * are missing. Make sure these plugins are loaded in your editor to get this video style option working.
			 *
			 * @error video-style-missing-dependency
			 * @param {String} [option] The name of the unsupported option.
			 * @param {String} [missingPlugins] The names of the plugins one of which has to be loaded for the particular option.
			 */
			logWarning( 'video-style-missing-dependency', {
				style: option,
				missingPlugins: modelElements.map( name => name === 'videoBlock' ? 'VideoBlockEditing' : 'VideoInlineEditing' )
			} );

			return false;
		}
	}

	return true;
}

// Extends the default style with a style provided by the developer.
// Note: Don't override the custom–defined style object, clone it instead.
//
// @param {module:video/videostyle~VideoStyleOptionDefinition} source
// @param {Object} style
//
// @returns {module:video/videostyle~VideoStyleOptionDefinition}
function extendStyle( source, style ) {
	const extendedStyle = { ...style };

	for ( const prop in source ) {
		if ( !Object.prototype.hasOwnProperty.call( style, prop ) ) {
			extendedStyle[ prop ] = source[ prop ];
		}
	}

	return extendedStyle;
}

// Displays a console warning with the 'video-style-configuration-definition-invalid' error.
// @param {Object} info
function warnInvalidStyle( info ) {
	/**
	 * The video style definition provided in the configuration is invalid.
	 *
	 * Please make sure the definition implements properly one of the following:
	 *
	 * * {@link module:video/videostyle~VideoStyleOptionDefinition video style option definition},
	 * * {@link module:video/videostyle/videostyleui~VideoStyleDropdownDefinition video style dropdown definition}
	 *
	 * @error video-style-configuration-definition-invalid
	 * @param {String} [dropdown] The name of the invalid drop-down
	 * @param {String} [style] The name of the invalid video style option
	 */
	logWarning( 'video-style-configuration-definition-invalid', info );
}

export default {
	normalizeStyles,
	getDefaultStylesConfiguration,
	getDefaultDropdownDefinitions,
	warnInvalidStyle,
	DEFAULT_OPTIONS,
	DEFAULT_ICONS,
	DEFAULT_DROPDOWN_DEFINITIONS
};
