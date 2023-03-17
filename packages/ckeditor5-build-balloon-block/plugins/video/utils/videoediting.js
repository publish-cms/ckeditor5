/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video/videoediting
 */

import { Plugin } from 'ckeditor5/src/core';
import VideoLoadObserver from './videoloadobserver';
import InsertVideoCommand from './insertvideocommand';
import VideoUtils from './videoutils';

/**
 * The video engine plugin. This module loads common code shared between
 * {@link module:video/video/videoinlineediting~VideoInlineEditing} and
 * {@link module:video/video/videoblockediting~VideoBlockEditing} plugins.
 *
 * This plugin registers the {@link module:video/video/insertvideocommand~InsertVideoCommand 'insertVideo'} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoEditing extends Plugin {
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
		return 'VideoEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const conversion = editor.conversion;

		// See https://github.com/ckeditor/ckeditor5-video/issues/142.
		editor.editing.view.addObserver( VideoLoadObserver );

		conversion.for( 'upcast' )
			.attributeToAttribute( {
				view: {
					name: 'video',
					key: 'alt'
				},
				model: 'alt'
			} )
			.attributeToAttribute( {
				view: {
					name: 'video',
					key: 'autoplay'
				},
				model: 'autoplay'
			} )
			.attributeToAttribute( {
				view: {
					name: 'video',
					key: 'controls'
				},
				model: 'controls'
			} )
			.attributeToAttribute( {
				view: {
					name: 'video',
					key: 'loop'
				},
				model: 'loop'
			} )
			.attributeToAttribute( {
				view: {
					name: 'video',
					key: 'muted'
				},
				model: 'muted'
			} )
			.attributeToAttribute( {
				view: {
					name: 'video',
					key: 'poster'
				},
				model: 'poster'
			} )
			.attributeToAttribute( {
				view: {
					name: 'video',
					key: 'preload'
				},
				model: 'preload'
			} );
		const insertVideoCommand = new InsertVideoCommand( editor );

		// Register `insertVideo` command and add `videoInsert` command as an alias for backward compatibility.
		editor.commands.add( 'insertVideo', insertVideoCommand );
		editor.commands.add( 'videoInsert', insertVideoCommand );
	}
}
