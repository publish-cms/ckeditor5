/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videoblock
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import VideoTextAlternative from './videotextalternative';
import VideoBlockEditing from './videoblockediting';

import '../theme/video.css';

/**
 * The video block plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * {@link module:video/video/videoblockediting~VideoBlockEditing},
 * * {@link module:video/videotextalternative~VideoTextAlternative}.
 *
 * Usually, it is used in conjunction with other plugins from this package. See the {@glink api/video package page}
 * for more information.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoBlockEditing, Widget, VideoTextAlternative ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoBlock';
	}
}

