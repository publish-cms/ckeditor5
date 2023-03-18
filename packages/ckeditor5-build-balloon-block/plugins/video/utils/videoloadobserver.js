/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video/videoloadobserver
 */

import { Observer } from 'ckeditor5/src/engine';

/**
 * Observes all new videos added to the {@link module:engine/view/document~Document},
 * fires {@link module:engine/view/document~Document#event:videoLoaded} and
 * {@link module:engine/view/document~Document#event:layoutChanged} event every time when the new video
 * has been loaded.
 *
 * **Note:** This event is not fired for videos that has been added to the document and rendered as `complete` (already loaded).
 *
 * @extends module:engine/view/observer/observer~Observer
 */
export default class VideoLoadObserver extends Observer {
	/**
	 * @inheritDoc
	 */
	observe( domRoot ) {
		this.listenTo( domRoot, 'load', ( event, domEvent ) => {
			const domElement = domEvent.target;

			if ( this.checkShouldIgnoreEventFromTarget( domElement ) ) {
				return;
			}

			if ( domElement.tagName == 'VIDEO' ) {
				this._fireEvents( domEvent );
			}
			// Use capture phase for better performance (#4504).
		}, { useCapture: true } );
	}

	/**
	 * Fires {@link module:engine/view/document~Document#event:layoutChanged} and
	 * {@link module:engine/view/document~Document#event:videoLoaded}
	 * if observer {@link #isEnabled is enabled}.
	 *
	 * @protected
	 * @param {Event} domEvent The DOM event.
	 */
	_fireEvents( domEvent ) {
		if ( this.isEnabled ) {
			this.document.fire( 'layoutChanged' );
			this.document.fire( 'videoLoaded', domEvent );
		}
	}
}

/**
 * Fired when an <video/> DOM element has been loaded in the DOM root.
 *
 * Introduced by {@link module:video/video/videoloadobserver~VideoLoadObserver}.
 *
 * @see module:video/video/videoloadobserver~VideoLoadObserver
 * @event module:engine/view/document~Document#event:videoLoaded
 * @param {module:engine/view/observer/domeventdata~DomEventData} data Event data.
 */
