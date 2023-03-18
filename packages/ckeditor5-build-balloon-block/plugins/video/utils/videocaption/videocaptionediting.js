/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videocaption/videocaptionediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { Element, enablePlaceholder } from 'ckeditor5/src/engine';
import { toWidgetEditable } from 'ckeditor5/src/widget';

import ToggleVideoCaptionCommand from './togglevideocaptioncommand';

import VideoUtils from '../videoutils';
import VideoCaptionUtils from './videocaptionutils';

/**
 * The video caption engine plugin. It is responsible for:
 *
 * * registering converters for the caption element,
 * * registering converters for the caption model attribute,
 * * registering the {@link module:video/videocaption/togglevideocaptioncommand~ToggleVideoCaptionCommand `toggleVideoCaption`} command.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoCaptionEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoUtils, VideoCaptionUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoCaptionEditing';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A map that keeps saved JSONified video captions and video model elements they are
		 * associated with.
		 *
		 * To learn more about this system, see {@link #_saveCaption}.
		 *
		 * @member {WeakMap.<module:engine/model/element~Element,Object>}
		 */
		this._savedCaptionsMap = new WeakMap();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Schema configuration.
		if ( !schema.isRegistered( 'caption' ) ) {
			schema.register( 'caption', {
				allowIn: 'videoBlock',
				allowContentOf: '$block',
				isLimit: true
			} );
		} else {
			schema.extend( 'caption', {
				allowIn: 'videoBlock'
			} );
		}

		editor.commands.add( 'toggleVideoCaption', new ToggleVideoCaptionCommand( this.editor ) );

		this._setupConversion();
		this._setupVideoTypeCommandsIntegration();
		this._registerCaptionReconversion();
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * video captions.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const view = editor.editing.view;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const videoCaptionUtils = editor.plugins.get( 'VideoCaptionUtils' );
		const t = editor.t;

		// View -> model converter for the data pipeline.
		editor.conversion.for( 'upcast' ).elementToElement( {
			view: element => videoCaptionUtils.matchVideoCaptionViewElement( element ),
			model: 'caption'
		} );

		// Model -> view converter for the data pipeline.
		editor.conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !videoUtils.isBlockVideo( modelElement.parent ) ) {
					return null;
				}

				return writer.createContainerElement( 'figcaption' );
			}
		} );

		// Model -> view converter for the editing pipeline.
		editor.conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'caption',
			view: ( modelElement, { writer } ) => {
				if ( !videoUtils.isBlockVideo( modelElement.parent ) ) {
					return null;
				}

				const figcaptionElement = writer.createEditableElement( 'figcaption' );
				writer.setCustomProperty( 'videoCaption', true, figcaptionElement );

				enablePlaceholder( {
					view,
					element: figcaptionElement,
					text: t( 'Enter video caption' ),
					keepOnFocus: true
				} );

				const videoAlt = modelElement.parent.getAttribute( 'alt' );
				const label = videoAlt ? t( 'Caption for video: %0', [ videoAlt ] ) : t( 'Caption for the video' );

				return toWidgetEditable( figcaptionElement, writer, { label } );
			}
		} );
	}

	/**
	 * Integrates with {@link module:video/video/videotypecommand~VideoTypeCommand video type commands}
	 * to make sure the caption is preserved when the type of an video changes so it can be restored
	 * in the future if the user decides they want their caption back.
	 *
	 * @private
	 */
	_setupVideoTypeCommandsIntegration() {
		const editor = this.editor;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const videoCaptionUtils = editor.plugins.get( 'VideoCaptionUtils' );
		const videoTypeInlineCommand = editor.commands.get( 'videoTypeInline' );
		const videoTypeBlockCommand = editor.commands.get( 'videoTypeBlock' );

		const handleVideoTypeChange = evt => {
			// The video type command execution can be unsuccessful.
			if ( !evt.return ) {
				return;
			}

			const { oldElement, newElement } = evt.return;

			/* istanbul ignore if: paranoid check */
			if ( !oldElement ) {
				return;
			}

			if ( videoUtils.isBlockVideo( oldElement ) ) {
				const oldCaptionElement = videoCaptionUtils.getCaptionFromVideoModelElement( oldElement );

				// If the old element was a captioned block video (the caption was visible),
				// simply save it so it can be restored.
				if ( oldCaptionElement ) {
					this._saveCaption( newElement, oldCaptionElement );

					return;
				}
			}

			const savedOldElementCaption = this._getSavedCaption( oldElement );

			// If either:
			//
			// * the block video didn't have a visible caption,
			// * the block video caption was hidden (and already saved),
			// * the inline video was passed
			//
			// just try to "pass" the saved caption from the old video to the new video
			// so it can be retrieved in the future if the user wants it back.
			if ( savedOldElementCaption ) {
				// Note: Since we're writing to a WeakMap, we don't bother with removing the
				// [ oldElement, savedOldElementCaption ] pair from it.
				this._saveCaption( newElement, savedOldElementCaption );
			}
		};

		// Presence of the commands depends on the Video(Inline|Block)Editing plugins loaded in the editor.
		if ( videoTypeInlineCommand ) {
			this.listenTo( videoTypeInlineCommand, 'execute', handleVideoTypeChange, { priority: 'low' } );
		}

		if ( videoTypeBlockCommand ) {
			this.listenTo( videoTypeBlockCommand, 'execute', handleVideoTypeChange, { priority: 'low' } );
		}
	}

	/**
	 * Returns the saved {@link module:engine/model/element~Element#toJSON JSONified} caption
	 * of an video model element.
	 *
	 * See {@link #_saveCaption}.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} videoModelElement The model element the
	 * caption should be returned for.
	 * @returns {module:engine/model/element~Element|null} The model caption element or `null` if there is none.
	 */
	_getSavedCaption( videoModelElement ) {
		const jsonObject = this._savedCaptionsMap.get( videoModelElement );

		return jsonObject ? Element.fromJSON( jsonObject ) : null;
	}

	/**
	 * Saves a {@link module:engine/model/element~Element#toJSON JSONified} caption for
	 * an video element to allow restoring it in the future.
	 *
	 * A caption is saved every time it gets hidden and/or the type of an video changes. The
	 * user should be able to restore it on demand.
	 *
	 * **Note**: The caption cannot be stored in the video model element attribute because,
	 * for instance, when the model state propagates to collaborators, the attribute would get
	 * lost (mainly because it does not convert to anything when the caption is hidden) and
	 * the states of collaborators' models would de-synchronize causing numerous issues.
	 *
	 * See {@link #_getSavedCaption}.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} videoModelElement The model element the
	 * caption is saved for.
	 * @param {module:engine/model/element~Element} caption The caption model element to be saved.
	 */
	_saveCaption( videoModelElement, caption ) {
		this._savedCaptionsMap.set( videoModelElement, caption.toJSON() );
	}

	/**
	 * Reconverts video caption when video alt attribute changes.
	 * The change of alt attribute is reflected in caption's aria-label attribute.
	 *
	 * @private
	 */
	_registerCaptionReconversion() {
		const editor = this.editor;
		const model = editor.model;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const videoCaptionUtils = editor.plugins.get( 'VideoCaptionUtils' );

		model.document.on( 'change:data', () => {
			const changes = model.document.differ.getChanges();

			for ( const change of changes ) {
				if ( change.attributeKey !== 'alt' ) {
					continue;
				}

				const video = change.range.start.nodeAfter;

				if ( videoUtils.isBlockVideo( video ) ) {
					const caption = videoCaptionUtils.getCaptionFromVideoModelElement( video );

					if ( !caption ) {
						return;
					}

					editor.editing.reconvertItem( caption );
				}
			}
		} );
	}
}
