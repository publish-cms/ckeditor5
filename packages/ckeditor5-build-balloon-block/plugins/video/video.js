/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video
 */

import { Plugin } from 'ckeditor5/src/core';

import VideoBlock from './utils/videoblock';
import VideoInline from './utils/videoinline';

import './theme/video.css';

/**
 * The video plugin.
 *
 * For a detailed overview, check the {@glink features/videos/videos-overview video feature} documentation.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:video/videoblock~VideoBlock},
 * * {@link module:video/videoinline~VideoInline},
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/video package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Video extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoBlock, VideoInline ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Video';
	}
}

/**
 * The configuration of the video features. Used by the video features in the `@ckeditor/ckeditor5-video` package.
 *
 * Read more in {@link module:video/video~VideoConfig}.
 *
 * @member {module:video/video~VideoConfig} module:core/editor/editorconfig~EditorConfig#video
 */

/**
 * The configuration of the video features. Used by the video features in the `@ckeditor/ckeditor5-video` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				video: ... // Video feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface VideoConfig
 */
