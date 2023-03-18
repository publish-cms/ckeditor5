/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videostyle
 */

import { Plugin } from 'ckeditor5/src/core';
import VideoStyleEditing from './utils/videostyle/videostyleediting';
import VideoStyleUI from './utils/videostyle/videostyleui';

/**
 * The video style plugin.
 *
 * For a detailed overview of the video styles feature, check the {@glink features/videos/videos-styles documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:video/videostyle/videostyleediting~VideoStyleEditing},
 * * {@link module:video/videostyle/videostyleui~VideoStyleUI}
 *
 * It provides a default configuration, which can be extended or overwritten.
 * Read more about the {@link module:video/video~VideoConfig#styles video styles configuration}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoStyleEditing, VideoStyleUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoStyle';
	}
}

/**
 * The configuration for the {@link module:video/videostyle~VideoStyle} plugin that should be provided
 * while creating the editor instance.
 *
 * A detailed information about the default configuration and customization can be found in
 * {@link module:video/video~VideoConfig#styles `VideoConfig#styles`}.
 *
 * @interface VideoStyleConfig
 */

/**
 * A list of the video style options.
 *
 * @member {Array.<module:video/videostyle~VideoStyleOptionDefinition>} module:video/videostyle~VideoStyleConfig#options
 */

/**
 * The {@link module:video/videostyle `VideoStyle`} plugin requires a list of the
 * {@link module:video/videostyle~VideoStyleConfig#options video style options} to work properly.
 * The default configuration is provided (listed below) and can be customized while creating the editor instance.
 *
 * # **Command**
 *
 * The {@link module:video/videostyle/videostylecommand~VideoStyleCommand `videoStyleCommand`}
 * is configured based on the defined options,
 * so you can change the style of the selected video by executing the following command:
 *
 *		editor.execute( 'videoStyle' { value: 'alignLeft' } );
 *
 * # **Buttons**
 *
 * All of the video style options provided in the configuration are registered
 * in the {@link module:ui/componentfactory~ComponentFactory UI components factory} with the "videoStyle:" prefixes and can be used
 * in the {@link module:video/video~VideoConfig#toolbar video toolbar configuration}. The buttons available by default depending
 * on the loaded plugins are listed in the next section.
 *
 * Read more about styling videos in the {@glink features/videos/videos-styles Video styles guide}.
 *
 * # **Default options and buttons**
 *
 * If the custom configuration is not provided, the default configuration will be used depending on the loaded
 * video editing plugins.
 *
 * * If both {@link module:video/video/videoblockediting~VideoBlockEditing `VideoBlockEditing`} and
 * {@link module:video/video/videoinlineediting~VideoInlineEditing `VideoInlineEditing`} plugins are loaded
 * (which is usually the default editor configuration), the following options will be available for the toolbar
 * configuration. These options will be registered as the buttons with the "videoStyle:" prefixes.
 *
 *		const videoDefaultConfig = {
 *			styles: {
 *				options: [
 *					'inline', 'alignLeft', 'alignRight',
 *					'alignCenter', 'alignBlockLeft', 'alignBlockRight',
 *					'block', 'side'
 *				]
 *			}
 *		};
 *
 * * If only the {@link module:video/video/videoblockediting~VideoBlockEditing `VideoBlockEditing`} plugin is loaded,
 * the following buttons (options) and groups will be available for the toolbar configuration.
 * These options will be registered as the buttons with the "videoStyle:" prefixes.
 *
 *		const videoDefaultConfig = {
 *			styles: {
 *				options: [ 'block', 'side' ]
 *			}
 *		};
 *
 * * If only the {@link module:video/video/videoinlineediting~VideoInlineEditing `VideoInlineEditing`} plugin is loaded,
 * the following buttons (options) and groups will available for the toolbar configuration.
 * These options will be registered as the buttons with the "videoStyle:" prefixes.
 *
 *		const videoDefaultConfig = {
 *			styles: {
 *				options: [ 'inline', 'alignLeft', 'alignRight' ]
 *			}
 *		};
 *
 * Read more about the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options}.
 *
 * # **Custom configuration**
 *
 * The video styles configuration can be customized in several ways:
 *
 * * Any of the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options}
 * can be loaded by the reference to its name as follows:
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				video: {
 *					styles: {
 *						options: [ 'alignLeft', 'alignRight' ]
 *					}
 *				}
 *			} );
 *
 * * Each of the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default video style options} can be customized,
 * e.g. to change the `icon`, `title` or CSS `className` of the style. The feature also provides several
 * {@link module:video/videostyle/utils~DEFAULT_ICONS default icons} to choose from.
 *
 *		import customIcon from 'custom-icon.svg';
 *
 *		// ...
 *
 *		ClassicEditor.create( editorElement, { video:
 *			styles: {
 *				options: {
 *					// This will only customize the icon of the "block" style.
 *					// Note: 'right' is one of default icons provided by the feature.
 *					{
 *						name: 'block',
 *						icon: 'right'
 *					},
 *
 *					// This will customize the icon, title and CSS class of the default "side" style.
 *					{
 *						name: 'side',
 *						icon: customIcon,
 *						title: 'My side style',
 *						className: 'custom-side-video'
 *					}
 *				}
 *			}
 *		} );
 *
 * * If none of the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default video style options}
 * works for the integration, it is possible to define independent custom styles, too.
 *
 * See the documentation about the video style {@link module:video/videostyle~VideoStyleOptionDefinition options}
 * to define the custom video style configuration properly.
 *
 *		import redIcon from 'red-icon.svg';
 *		import blueIcon from 'blue-icon.svg';
 *
 *		// ...
 *
 *		ClassicEditor.create( editorElement, { video:
 *			styles: {
 *				// A list of completely custom styling options.
 *				options: [
 *					{
 *						name: 'regular',
 *						modelElements: [ 'videoBlock', 'videoInline' ],
 *						title: 'Regular video',
 *						icon: 'full',
 *						isDefault: true
 *					}, {
 *						name: 'blue',
 *						modelElements: [ 'videoInline' ],
 *						title: 'Blue video',
 *						icon: blueIcon,
 *						className: 'video-blue'
 *					}, {
 *						name: 'red',
 *						modelElements: [ 'videoBlock' ],
 *						title: 'Red video',
 *						icon: redIcon,
 *						className: 'video-red'
 *					}
 *				]
 *			}
 *		} );
 *
 * @member {module:video/videostyle~VideoStyleConfig} module:video/video~VideoConfig#styles
 */

/**
 * The video styling option definition descriptor.
 *
 * This definition should be implemented in the `Video` plugin {@link module:video/video~VideoConfig#styles configuration} for:
 *
 * * customizing one of the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options} by providing the proper name
 * of the default style and the properties that should be overridden,
 * * or defining a completely custom styling option by providing a custom name and implementing the following properties.
 *
 *		import fullSizeIcon from 'path/to/icon.svg';
 *
 *		const videoStyleOptionDefinition = {
 *			name: 'fullSize',
 *			icon: fullSizeIcon,
 *			title: 'Full size video',
 *			className: 'video-full-size',
 *			modelElements: [ 'videoBlock', 'videoInline' ]
 *		}
 *
 * The styling option will be registered as the button under the name `'videoStyle:{name}'` in the
 * {@link module:ui/componentfactory~ComponentFactory UI components factory} (this functionality is provided by the
 * {@link module:video/videostyle/videostyleui~VideoStyleUI} plugin).
 *
 * @property {String} name The unique name of the styling option. It will be used to:
 *
 * * refer to one of the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options} or define the custom style,
 * * store the chosen style in the model by setting the `videoStyle` attribute of the model video element,
 * * as a value of the {@link module:video/videostyle/videostylecommand~VideoStyleCommand#execute `videoStyle` command},
 * * when registering a button for the style in the following manner: (`'videoStyle:{name}'`).
 *
 * @property {Boolean} [isDefault] When set, the style will be used as the default one for the model elements
 * listed in the `modelElements` property. A default style does not apply any CSS class to the view element.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {String} icon One of the following to be used when creating the styles's button:
 *
 * * an SVG icon source (as an XML string),
 * * one of the keys in {@link module:video/videostyle/utils~DEFAULT_ICONS} to use one of default icons provided by the plugin.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {String} title The styles's title. Setting `title` to one of
 * {@link module:video/videostyle/videostyleui~VideoStyleUI#localizedDefaultStylesTitles}
 * will automatically translate it to the language of the editor.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {String} [className] The CSS class used to represent the style in the view.
 * It should be used only for the non-default styles.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @property {Array.<String>} modelElements The list of the names of the model elements that are supported by the style.
 * The possible values are:
 * * `[ 'videoBlock' ]` if the style can be applied to the video type introduced by the
 * {@link module:video/video/videoblockediting~VideoBlockEditing `VideoBlockEditing`} plugin,
 * * `[ 'videoInline' ]` if the style can be applied to the video type introduced by the
 * {@link module:video/video/videoinlineediting~VideoInlineEditing `VideoInlineEditing`} plugin,
 * * `[ 'videoInline', 'videoBlock' ]` if the style can be applied to both video types introduced by the plugins mentioned above.
 *
 * This property determines which model element names work with the style. If the model element name of the currently selected
 * video is different, upon executing the
 * {@link module:video/videostyle/videostylecommand~VideoStyleCommand#execute `videoStyle`} command the video type (model element name)
 * will automatically change.
 *
 * If this property is not defined, its value is inherited
 * from the {@link module:video/videostyle/utils~DEFAULT_OPTIONS default styling options} addressed in the name property.
 *
 * @typedef {Object} module:video/videostyle~VideoStyleOptionDefinition
 */
