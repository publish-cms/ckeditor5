/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/autovideo
 */

import { Plugin } from 'ckeditor5/src/core';
import { Clipboard } from 'ckeditor5/src/clipboard';
import { LivePosition, LiveRange } from 'ckeditor5/src/engine';
import { Undo } from 'ckeditor5/src/undo';
import { Delete } from 'ckeditor5/src/typing';
import { global } from 'ckeditor5/src/utils';

import VideoUtils from './utils/videoutils';

// Implements the pattern: http(s)://(www.)example.com/path/to/resource.ext?query=params&maybe=too.
const VIDEO_URL_REGEXP = new RegExp( String( /^(http(s)?:\/\/)?[\w-]+\.[\w.~:/[\]@!$&'()*+,;=%-]+/.source +
	/\.(mp4|webm|ogm|ogv|ogg|avi|mov|wmv|flv|mkv|m4p|3gp|m4v|MP4|WEBM|OGM|OGV|OGG|AVI|MOV|WMV|FLV|MKV|M4P|3GP|M4V)/.source +
	/(\?[\w.~:/[\]@!$&'()*+,;=%-]*)?/.source +
	/(#[\w.~:/[\]@!$&'()*+,;=%-]*)?$/.source ) );

/**
 * The auto-video plugin. It recognizes video links in the pasted content and embeds
 * them shortly after they are injected into the document.
 *
 * @extends module:core/plugin~Plugin
 */
export default class AutoVideo extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Clipboard, VideoUtils, Undo, Delete ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoVideo';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The paste–to–embed `setTimeout` ID. Stored as a property to allow
		 * cleaning of the timeout.
		 *
		 * @private
		 * @member {Number} #_timeoutId
		 */
		this._timeoutId = null;

		/**
		 * The position where the `<videoBlock>` element will be inserted after the timeout,
		 * determined each time a new content is pasted into the document.
		 *
		 * @private
		 * @member {module:engine/model/liveposition~LivePosition} #_positionToInsert
		 */
		this._positionToInsert = null;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const modelDocument = editor.model.document;

		// We need to listen on `Clipboard#inputTransformation` because we need to save positions of selection.
		// After pasting, the content between those positions will be checked for a URL that could be transformed
		// into an video.
		this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', () => {
			const firstRange = modelDocument.selection.getFirstRange();

			const leftLivePosition = LivePosition.fromPosition( firstRange.start );
			leftLivePosition.stickiness = 'toPrevious';

			const rightLivePosition = LivePosition.fromPosition( firstRange.end );
			rightLivePosition.stickiness = 'toNext';

			modelDocument.once( 'change:data', () => {
				this._embedVideoBetweenPositions( leftLivePosition, rightLivePosition );

				leftLivePosition.detach();
				rightLivePosition.detach();
			}, { priority: 'high' } );
		} );

		editor.commands.get( 'undo' ).on( 'execute', () => {
			if ( this._timeoutId ) {
				global.window.clearTimeout( this._timeoutId );
				this._positionToInsert.detach();

				this._timeoutId = null;
				this._positionToInsert = null;
			}
		}, { priority: 'high' } );
	}

	/**
	 * Analyzes the part of the document between provided positions in search for a URL representing an video.
	 * When the URL is found, it is automatically converted into an video.
	 *
	 * @protected
	 * @param {module:engine/model/liveposition~LivePosition} leftPosition Left position of the selection.
	 * @param {module:engine/model/liveposition~LivePosition} rightPosition Right position of the selection.
	 */
	_embedVideoBetweenPositions( leftPosition, rightPosition ) {
		const editor = this.editor;
		// TODO: Use a marker instead of LiveRange & LivePositions.
		const urlRange = new LiveRange( leftPosition, rightPosition );
		const walker = urlRange.getWalker( { ignoreElementEnd: true } );
		const selectionAttributes = Object.fromEntries( editor.model.document.selection.getAttributes() );
		const videoUtils = this.editor.plugins.get( 'VideoUtils' );

		let src = '';

		for ( const node of walker ) {
			if ( node.item.is( '$textProxy' ) ) {
				src += node.item.data;
			}
		}

		src = src.trim();

		// If the URL does not match the video URL regexp, let's skip that.
		if ( !src.match( VIDEO_URL_REGEXP ) ) {
			urlRange.detach();

			return;
		}

		// Position will not be available in the `setTimeout` function so let's clone it.
		this._positionToInsert = LivePosition.fromPosition( leftPosition );

		// This action mustn't be executed if undo was called between pasting and auto-embedding.
		this._timeoutId = global.window.setTimeout( () => {
			// Do nothing if video element cannot be inserted at the current position.
			// See https://github.com/ckeditor/ckeditor5/issues/2763.
			// Condition must be checked after timeout - pasting may take place on an element, replacing it. The final position matters.
			const videoCommand = editor.commands.get( 'insertVideo' );

			if ( !videoCommand.isEnabled ) {
				urlRange.detach();

				return;
			}

			editor.model.change( writer => {
				this._timeoutId = null;

				writer.remove( urlRange );
				urlRange.detach();

				let insertionPosition;

				// Check if the position where the element should be inserted is still valid.
				// Otherwise leave it as undefined to use the logic of insertVideo().
				if ( this._positionToInsert.root.rootName !== '$graveyard' ) {
					insertionPosition = this._positionToInsert.toPosition();
				}

				videoUtils.insertVideo( { ...selectionAttributes, src }, insertionPosition );

				this._positionToInsert.detach();
				this._positionToInsert = null;
			} );

			editor.plugins.get( 'Delete' ).requestUndoOnBackspace();
		}, 100 );
	}
}
