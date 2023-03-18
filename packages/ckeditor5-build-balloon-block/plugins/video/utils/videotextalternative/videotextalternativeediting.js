/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videotextalternative/videotextalternativeediting
 */

import { Plugin } from 'ckeditor5/src/core';
import VideoTextAlternativeCommand from './videotextalternativecommand';
import VideoUtils from '../videoutils';

/**
 * The video text alternative editing plugin.
 *
 * Registers the `'videoTextAlternative'` command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoTextAlternativeEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoTextAlternativeEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.commands.add( 'videoTextAlternative', new VideoTextAlternativeCommand( this.editor ) );
	}
}
