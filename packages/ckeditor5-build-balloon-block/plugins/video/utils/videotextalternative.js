/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videotextalternative
 */

import { Plugin } from 'ckeditor5/src/core';
import VideoTextAlternativeEditing from './videotextalternative/videotextalternativeediting';
import VideoTextAlternativeUI from './videotextalternative/videotextalternativeui';

/**
 * The video text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/videos/videos-styles video styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:video/videotextalternative/videotextalternativeediting~VideoTextAlternativeEditing}
 * and {@link module:video/videotextalternative/videotextalternativeui~VideoTextAlternativeUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoTextAlternative extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoTextAlternativeEditing, VideoTextAlternativeUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoTextAlternative';
	}
}
