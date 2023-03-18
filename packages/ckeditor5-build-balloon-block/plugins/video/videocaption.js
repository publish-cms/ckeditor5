/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videocaption
 */

import { Plugin } from 'ckeditor5/src/core';
import VideoCaptionEditing from './utils/videocaption/videocaptionediting';
import VideoCaptionUI from './utils/videocaption/videocaptionui';

import './theme/videocaption.css';

/**
 * The video caption plugin.
 *
 * For a detailed overview, check the {@glink features/videos/videos-captions video caption} documentation.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoCaption extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoCaptionEditing, VideoCaptionUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoCaption';
	}
}
