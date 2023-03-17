/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videotoolbar
 */

import { Plugin } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import VideoUtils from './utils/videoutils';
import { isObject } from 'lodash-es';

/**
 * The video toolbar plugin. It creates and manages the video toolbar (the toolbar displayed when an video is selected).
 *
 * For an overview, check the {@glink features/videos/videos-overview#video-contextual-toolbar video contextual toolbar} documentation.
 *
 * Instances of toolbar components (e.g. buttons) are created using the editor's
 * {@link module:ui/componentfactory~ComponentFactory component factory}
 * based on the {@link module:video/video~VideoConfig#toolbar `video.toolbar` configuration option}.
 *
 * The toolbar uses the {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ WidgetToolbarRepository, VideoUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoToolbar';
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );
		const videoUtils = editor.plugins.get( 'VideoUtils' );

		widgetToolbarRepository.register( 'video', {
			ariaLabel: t( 'Video toolbar' ),
			items: normalizeDeclarativeConfig( editor.config.get( 'video.toolbar' ) || [] ),
			getRelatedElement: selection => videoUtils.getClosestSelectedVideoWidget( selection )
		} );
	}
}

/**
 * Items to be placed in the video toolbar.
 * This option is used by the {@link module:video/videotoolbar~VideoToolbar} feature.
 *
 * Assuming that you use the following features:
 *
 * * {@link module:video/videostyle~VideoStyle} (with a default configuration),
 * * {@link module:video/videotextalternative~VideoTextAlternative},
 * * {@link module:video/videocaption~VideoCaption},
 *
 * the following toolbar items will be available in {@link module:ui/componentfactory~ComponentFactory}:
 * * `'videoTextAlternative'`,
 * * `'toggleVideoCaption'`,
 * * {@link module:video/video~VideoConfig#styles buttons provided by the `VideoStyle` plugin},
 * * {@link module:video/videostyle/utils~DEFAULT_DROPDOWN_DEFINITIONS drop-downs provided by the `VideoStyle` plugin},
 *
 * so you can configure the toolbar like this:
 *
 *		const videoConfig = {
 *			toolbar: [
 *	 			'videoStyle:inline', 'videoStyle:wrapText', 'videoStyle:breakText', '|',
 *				'toggleVideoCaption', 'videoTextAlternative'
 *			]
 *		};
 *
 * Besides that, the `VideoStyle` plugin allows to define a
 * {@link module:video/videostyle/videostyleui~VideoStyleDropdownDefinition custom drop-down} while configuring the toolbar.
 *
 * The same items can also be used in the {@link module:core/editor/editorconfig~EditorConfig#toolbar main editor toolbar}.
 *
 * Read more about configuring toolbar in {@link module:core/editor/editorconfig~EditorConfig#toolbar}.
 *
 * @member {Array.<String>} module:video/video~VideoConfig#toolbar
 */

// Convert the dropdown definitions to their keys registered in the ComponentFactory.
// The registration precess should be handled by the plugin which handles the UI of a particular feature.
//
// @param {Array.<String|module:video/videostyle/videostyleui~VideoStyleDropdownDefinition>} config
//
// @returns {Array.<String>}
function normalizeDeclarativeConfig( config ) {
	return config.map( item => isObject( item ) ? item.name : item );
}
