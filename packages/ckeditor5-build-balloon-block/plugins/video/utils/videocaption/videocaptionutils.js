/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videocaptionutils/utils
 */

import { Plugin } from 'ckeditor5/src/core';

import VideoUtils from '../videoutils';

/**
 * The video caption utilities plugin.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoCaptionUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoCaptionUtils';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoUtils ];
	}

	/**
	 * Returns the caption model element from a given video element. Returns `null` if no caption is found.
	 *
	 * @param {module:engine/model/element~Element} videoModelElement
	 * @returns {module:engine/model/element~Element|null}
	 */
	getCaptionFromVideoModelElement( videoModelElement ) {
		for ( const node of videoModelElement.getChildren() ) {
			if ( !!node && node.is( 'element', 'caption' ) ) {
				return node;
			}
		}

		return null;
	}

	/**
	 * Returns the caption model element for a model selection. Returns `null` if the selection has no caption element ancestor.
	 *
	 * @param {module:engine/model/selection~Selection} selection
	 * @returns {module:engine/model/element~Element|null}
	 */
	getCaptionFromModelSelection( selection ) {
		const videoUtils = this.editor.plugins.get( 'VideoUtils' );
		const captionElement = selection.getFirstPosition().findAncestor( 'caption' );

		if ( !captionElement ) {
			return null;
		}

		if ( videoUtils.isBlockVideo( captionElement.parent ) ) {
			return captionElement;
		}

		return null;
	}

	/**
	 * {@link module:engine/view/matcher~Matcher} pattern. Checks if a given element is a `<figcaption>` element that is placed
	 * inside the video `<figure>` element.
	 *
	 * @param {module:engine/view/element~Element} element
	 * @returns {Object|null} Returns the object accepted by {@link module:engine/view/matcher~Matcher} or `null` if the element
	 * cannot be matched.
	 */
	matchVideoCaptionViewElement( element ) {
		const videoUtils = this.editor.plugins.get( 'VideoUtils' );

		// Convert only captions for videos.
		if ( element.name == 'figcaption' && videoUtils.isBlockVideoView( element.parent ) ) {
			return { name: true };
		}

		return null;
	}
}
