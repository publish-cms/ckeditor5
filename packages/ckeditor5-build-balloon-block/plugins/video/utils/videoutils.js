/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videoutils
 */

import { Plugin } from 'ckeditor5/src/core';
import { findOptimalInsertionRange, isWidget, toWidget } from 'ckeditor5/src/widget';
import { determineVideoTypeForInsertionAtSelection } from './utils';

/**
 * A set of helpers related to videos.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoUtils';
	}

	/**
	 * Checks if the provided model element is an `video` or `videoInline`.
	 *
	 * @param {module:engine/model/element~Element} modelElement
	 * @returns {Boolean}
	 */
	isVideo( modelElement ) {
		return this.isInlineVideo( modelElement ) || this.isBlockVideo( modelElement );
	}

	/**
	 * Checks if the provided view element represents an inline video.
	 *
	 * Also, see {@link module:video/videoutils~VideoUtils#isVideoWidget}.
	 *
	 * @param {module:engine/view/element~Element} element
	 * @returns {Boolean}
	 */
	isInlineVideoView( element ) {
		return !!element && element.is( 'element', 'video' );
	}

	/**
	 * Checks if the provided view element represents a block video.
	 *
	 * Also, see {@link module:video/videoutils~VideoUtils#isVideoWidget}.
	 *
	 * @param {module:engine/view/element~Element} element
	 * @returns {Boolean}
	 */
	isBlockVideoView( element ) {
		return !!element && element.is( 'element', 'figure' ) && element.hasClass( 'video' );
	}

	/**
	 * Handles inserting single file. This method unifies video insertion using {@link module:widget/utils~findOptimalInsertionRange}
	 * method.
	 *
	 *		const videoUtils = editor.plugins.get( 'VideoUtils' );
	 *
	 *		videoUtils.insertVideo( { src: 'path/to/video.jpg' } );
	 *
	 * @param {Object} [attributes={}] Attributes of the inserted video.
	 * This method filters out the attributes which are disallowed by the {@link module:engine/model/schema~Schema}.
	 * @param {module:engine/model/selection~Selectable} [selectable] Place to insert the video. If not specified,
	 * the {@link module:widget/utils~findOptimalInsertionRange} logic will be applied for the block videos
	 * and `model.document.selection` for the inline videos.
	 *
	 * **Note**: If `selectable` is passed, this helper will not be able to set selection attributes (such as `linkHref`)
	 * and apply them to the new video. In this case, make sure all selection attributes are passed in `attributes`.
	 *
	 * @param {'videoBlock'|'videoInline'} [videoType] Video type of inserted video. If not specified,
	 * it will be determined automatically depending of editor config or place of the insertion.
	 * @return {module:engine/view/element~Element|null} The inserted model video element.
	 */
	insertVideo( attributes = {}, selectable = null, videoType = null ) {
		const editor = this.editor;
		const model = editor.model;
		const selection = model.document.selection;

		videoType = determineVideoTypeForInsertion( editor, selectable || selection, videoType );

		// Mix declarative attributes with selection attributes because the new video should "inherit"
		// the latter for best UX. For instance, inline videos inserted into existing links
		// should not split them. To do that, they need to have "linkHref" inherited from the selection.
		attributes = {
			...Object.fromEntries( selection.getAttributes() ),
			...attributes
		};

		for ( const attributeName in attributes ) {
			if ( !model.schema.checkAttribute( videoType, attributeName ) ) {
				delete attributes[ attributeName ];
			}
		}

		return model.change( writer => {
			const videoElement = writer.createElement( videoType, attributes );

			model.insertObject( videoElement, selectable, null, {
				setSelection: 'on',
				// If we want to insert a block video (for whatever reason) then we don't want to split text blocks.
				// This applies only when we don't have the selectable specified (i.e., we insert multiple block videos at once).
				findOptimalPosition: !selectable && videoType != 'videoInline'
			} );

			// Inserting an video might've failed due to schema regulations.
			if ( videoElement.parent ) {
				return videoElement;
			}

			return null;
		} );
	}

	/**
	 * Returns an video widget editing view element if one is selected or is among the selection's ancestors.
	 *
	 * @protected
	 * @param {module:engine/view/selection~Selection|module:engine/view/documentselection~DocumentSelection} selection
	 * @returns {module:engine/view/element~Element|null}
	 */
	getClosestSelectedVideoWidget( selection ) {
		const selectionPosition = selection.getFirstPosition();

		if ( !selectionPosition ) {
			return null;
		}

		const viewElement = selection.getSelectedElement();

		if ( viewElement && this.isVideoWidget( viewElement ) ) {
			return viewElement;
		}

		let parent = selectionPosition.parent;

		while ( parent ) {
			if ( parent.is( 'element' ) && this.isVideoWidget( parent ) ) {
				return parent;
			}

			parent = parent.parent;
		}

		return null;
	}

	/**
	 * Returns a video model element if one is selected or is among the selection's ancestors.
	 *
	 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
	 * @returns {module:engine/model/element~Element|null}
	 */
	getClosestSelectedVideoElement( selection ) {
		const selectedElement = selection.getSelectedElement();

		return this.isVideo( selectedElement ) ? selectedElement : selection.getFirstPosition().findAncestor( 'videoBlock' );
	}

	/**
	 * Checks if video can be inserted at current model selection.
	 *
	 * @protected
	 * @returns {Boolean}
	 */
	isVideoAllowed() {
		const model = this.editor.model;
		const selection = model.document.selection;

		return isVideoAllowedInParent( this.editor, selection ) && isNotInsideVideo( selection );
	}

	/**
	 * Converts a given {@link module:engine/view/element~Element} to an video widget:
	 * * Adds a {@link module:engine/view/element~Element#_setCustomProperty custom property} allowing to recognize the video widget
	 * element.
	 * * Calls the {@link module:widget/utils~toWidget} function with the proper element's label creator.
	 *
	 * @protected
	 * @param {module:engine/view/element~Element} viewElement
	 * @param {module:engine/view/downcastwriter~DowncastWriter} writer An instance of the view writer.
	 * @param {String} label The element's label. It will be concatenated with the video `alt` attribute if one is present.
	 * @returns {module:engine/view/element~Element}
	 */
	toVideoWidget( viewElement, writer, label ) {
		writer.setCustomProperty( 'video', true, viewElement );

		const labelCreator = () => {
			const videoElement = this.findViewVideoElement( viewElement );
			const altText = videoElement.getAttribute( 'alt' );

			return altText ? `${ altText } ${ label }` : label;
		};

		return toWidget( viewElement, writer, { label: labelCreator } );
	}

	/**
	 * Checks if a given view element is an video widget.
	 *
	 * @protected
	 * @param {module:engine/view/element~Element} viewElement
	 * @returns {Boolean}
	 */
	isVideoWidget( viewElement ) {
		return !!viewElement.getCustomProperty( 'video' ) && isWidget( viewElement );
	}

	/**
	 * Checks if the provided model element is an `video`.
	 *
	 * @param {module:engine/model/element~Element} modelElement
	 * @returns {Boolean}
	 */
	isBlockVideo( modelElement ) {
		return !!modelElement && modelElement.is( 'element', 'videoBlock' );
	}

	/**
	 * Checks if the provided model element is an `videoInline`.
	 *
	 * @param {module:engine/model/element~Element} modelElement
	 * @returns {Boolean}
	 */
	isInlineVideo( modelElement ) {
		return !!modelElement && modelElement.is( 'element', 'videoInline' );
	}

	/**
	 * Get the view `<video>` from another view element, e.g. a widget (`<figure class="video">`), a link (`<a>`).
	 *
	 * The `<video>` can be located deep in other elements, so this helper performs a deep tree search.
	 *
	 * @param {module:engine/view/element~Element} figureView
	 * @returns {module:engine/view/element~Element}
	 */
	findViewVideoElement( figureView ) {
		if ( this.isInlineVideoView( figureView ) ) {
			return figureView;
		}

		const editingView = this.editor.editing.view;

		for ( const { item } of editingView.createRangeIn( figureView ) ) {
			if ( this.isInlineVideoView( item ) ) {
				return item;
			}
		}
	}
}

// Checks if video is allowed by schema in optimal insertion parent.
//
// @private
// @param {module:core/editor/editor~Editor} editor
// @param {module:engine/model/selection~Selection} selection
// @returns {Boolean}
function isVideoAllowedInParent( editor, selection ) {
	const videoType = determineVideoTypeForInsertion( editor, selection );

	if ( videoType == 'videoBlock' ) {
		const parent = getInsertVideoParent( selection, editor.model );

		if ( editor.model.schema.checkChild( parent, 'videoBlock' ) ) {
			return true;
		}
	} else if ( editor.model.schema.checkChild( selection.focus, 'videoInline' ) ) {
		return true;
	}

	return false;
}

// Checks if selection is not placed inside an video (e.g. its caption).
//
// @private
// @param {module:engine/model/selection~Selectable} selection
// @returns {Boolean}
function isNotInsideVideo( selection ) {
	return [ ...selection.focus.getAncestors() ].every( ancestor => !ancestor.is( 'element', 'videoBlock' ) );
}

// Returns a node that will be used to insert video with `model.insertContent`.
//
// @private
// @param {module:engine/model/selection~Selection} selection
// @param {module:engine/model/model~Model} model
// @returns {module:engine/model/element~Element}
function getInsertVideoParent( selection, model ) {
	const insertionRange = findOptimalInsertionRange( selection, model );
	const parent = insertionRange.start.parent;

	if ( parent.isEmpty && !parent.is( 'element', '$root' ) ) {
		return parent.parent;
	}

	return parent;
}

// Determine video element type name depending on editor config or place of insertion.
//
// @private
// @param {module:core/editor/editor~Editor} editor
// @param {module:engine/model/selection~Selectable} selectable
// @param {'videoBlock'|'videoInline'} [videoType] Video element type name. Used to force return of provided element name,
// but only if there is proper plugin enabled.
// @returns {'videoBlock'|'videoInline'} videoType
function determineVideoTypeForInsertion( editor, selectable, videoType ) {
	const schema = editor.model.schema;
	const configVideoInsertType = editor.config.get( 'video.insert.type' );

	if ( !editor.plugins.has( 'VideoBlockEditing' ) ) {
		return 'videoInline';
	}

	if ( !editor.plugins.has( 'VideoInlineEditing' ) ) {
		return 'videoBlock';
	}

	if ( videoType ) {
		return videoType;
	}

	if ( configVideoInsertType === 'inline' ) {
		return 'videoInline';
	}

	if ( configVideoInsertType === 'block' ) {
		return 'videoBlock';
	}

	// Try to replace the selected widget (e.g. another video).
	if ( selectable.is( 'selection' ) ) {
		return determineVideoTypeForInsertionAtSelection( schema, selectable );
	}

	return schema.checkChild( selectable, 'videoInline' ) ? 'videoInline' : 'videoBlock';
}
