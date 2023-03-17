/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video/videotypecommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The video type command. It changes the type of a selected video, depending on the configuration.
 *
 * @extends module:core/command~Command
 */
export default class VideoTypeCommand extends Command {
	/**
	 * @inheritDoc
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {'videoBlock'|'videoInline'} modelElementName Model element name the command converts to.
	 */
	constructor( editor, modelElementName ) {
		super( editor );

		/**
		 * Model element name the command converts to.
		 *
		 * @readonly
		 * @private
		 * @member {'videoBlock'|'videoInline'}
		 */
		this._modelElementName = modelElementName;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const element = videoUtils.getClosestSelectedVideoElement( this.editor.model.document.selection );

		if ( this._modelElementName === 'videoBlock' ) {
			this.isEnabled = videoUtils.isInlineVideo( element );
		} else {
			this.isEnabled = videoUtils.isBlockVideo( element );
		}
	}

	/**
	 * Executes the command and changes the type of a selected video.
	 *
	 * @fires execute
	 * @returns {Object|null} An object containing references to old and new model video elements
	 * (for before and after the change) so external integrations can hook into the decorated
	 * `execute` event and handle this change. `null` if the type change failed.
	 */
	execute() {
		const editor = this.editor;
		const model = this.editor.model;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const oldElement = videoUtils.getClosestSelectedVideoElement( model.document.selection );
		const attributes = Object.fromEntries( oldElement.getAttributes() );

		// Don't change video type if "src" is missing (a broken video), unless there's "uploadId" set.
		// This state may happen during video upload (before it finishes) and it should be possible to change type
		// of the video in the meantime.
		if ( !attributes.src && !attributes.uploadId ) {
			return null;
		}

		return model.change( writer => {
			// Get all markers that contain the old video element.
			const markers = Array.from( model.markers )
				.filter( marker => marker.getRange().containsItem( oldElement ) );

			const newElement = videoUtils.insertVideo( attributes, model.createSelection( oldElement, 'on' ), this._modelElementName );

			if ( !newElement ) {
				return null;
			}

			const newElementRange = writer.createRangeOn( newElement );

			// Expand the previously intersecting markers' ranges to include the new video element.
			for ( const marker of markers ) {
				const markerRange = marker.getRange();

				// Join the survived part of the old marker range with the new element range
				// (loosely because there could be some new paragraph or the existing one might got split).
				const range = markerRange.root.rootName != '$graveyard' ?
					markerRange.getJoined( newElementRange, true ) : newElementRange;

				writer.updateMarker( marker, { range } );
			}

			return {
				oldElement,
				newElement
			};
		} );
	}
}
