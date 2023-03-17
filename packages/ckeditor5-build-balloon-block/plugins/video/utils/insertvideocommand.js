/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';
import { logWarning, toArray } from 'ckeditor5/src/utils';

/**
 * @module video/video/insertvideocommand
 */

/**
 * Insert video command.
 *
 * The command is registered by the {@link module:video/video/videoediting~VideoEditing} plugin as `insertVideo`
 * and it is also available via aliased `videoInsert` name.
 *
 * In order to insert an video at the current selection position
 * (according to the {@link module:widget/utils~findOptimalInsertionRange} algorithm),
 * execute the command and specify the video source:
 *
 *		editor.execute( 'insertVideo', { source: 'http://url.to.the/video' } );
 *
 * It is also possible to insert multiple videos at once:
 *
 *		editor.execute( 'insertVideo', {
 *			source:  [
 *				'path/to/video.jpg',
 *				'path/to/other-video.jpg'
 *			]
 *		} );
 *
 * If you want to take the full control over the process, you can specify individual model attributes:
 *
 *		editor.execute( 'insertVideo', {
 *			source:  [
 *				{ src: 'path/to/video.jpg', alt: 'First alt text' },
 *				{ src: 'path/to/other-video.jpg', alt: 'Second alt text', customAttribute: 'My attribute value' }
 *			]
 *		} );
 *
 * @extends module:core/command~Command
 */
export default class InsertVideoCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		const configVideoInsertType = editor.config.get( 'video.insert.type' );

		if ( !editor.plugins.has( 'VideoBlockEditing' ) ) {
			if ( configVideoInsertType === 'block' ) {
				/**
				 * The {@link module:video/videoblock~VideoBlock} plugin must be enabled to allow inserting block videos. See
				 * {@link module:video/videoinsert~VideoInsertConfig#type} to learn more.
				 *
				 * @error video-block-plugin-required
				 */
				logWarning( 'video-block-plugin-required' );
			}
		}

		if ( !editor.plugins.has( 'VideoInlineEditing' ) ) {
			if ( configVideoInsertType === 'inline' ) {
				/**
				 * The {@link module:video/videoinline~VideoInline} plugin must be enabled to allow inserting inline videos. See
				 * {@link module:video/videoinsert~VideoInsertConfig#type} to learn more.
				 *
				 * @error video-inline-plugin-required
				 */
				logWarning( 'video-inline-plugin-required' );
			}
		}
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this.editor.plugins.get( 'VideoUtils' ).isVideoAllowed();
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options Options for the executed command.
	 * @param {String|Array.<String>|Array.<Object>} options.source The video source or an array of video sources to insert.
	 * See the documentation of the command to learn more about accepted formats.
	 */
	execute( options ) {
		const sourceDefinitions = toArray( options.source );
		const selection = this.editor.model.document.selection;
		const videoUtils = this.editor.plugins.get( 'VideoUtils' );

		// In case of multiple videos, each video (starting from the 2nd) will be inserted at a position that
		// follows the previous one. That will move the selection and, to stay on the safe side and make sure
		// all videos inherit the same selection attributes, they are collected beforehand.
		//
		// Applying these attributes ensures, for instance, that inserting an (inline) video into a link does
		// not split that link but preserves its continuity.
		//
		// Note: Selection attributes that do not make sense for videos will be filtered out by insertVideo() anyway.
		const selectionAttributes = Object.fromEntries( selection.getAttributes() );

		sourceDefinitions.forEach( ( sourceDefinition, index ) => {
			const selectedElement = selection.getSelectedElement();

			if ( typeof sourceDefinition === 'string' ) {
				sourceDefinition = { src: sourceDefinition };
			}

			// Inserting of an inline video replace the selected element and make a selection on the inserted video.
			// Therefore inserting multiple inline videos requires creating position after each element.
			if ( index && selectedElement && videoUtils.isVideo( selectedElement ) ) {
				const position = this.editor.model.createPositionAfter( selectedElement );

				videoUtils.insertVideo( { ...sourceDefinition, ...selectionAttributes }, position );
			} else {
				videoUtils.insertVideo( { ...sourceDefinition, ...selectionAttributes } );
			}
		} );
	}
}
