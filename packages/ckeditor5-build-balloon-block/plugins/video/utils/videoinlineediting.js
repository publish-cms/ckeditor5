/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video/videoinlineediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { UpcastWriter } from 'ckeditor5/src/engine';

import {
	downcastVideoAttribute
} from './converters';

import VideoEditing from './videoediting';
import VideoTypeCommand from './videotypecommand';
import VideoUtils from './videoutils';
import {
	getVideoViewElementMatcher,
	createInlineVideoViewElement,
	determineVideoTypeForInsertionAtSelection
} from './utils';

/**
 * The video inline plugin.
 *
 * It registers:
 *
 * * `<videoInline>` as an inline element in the document schema, and allows `alt`, `src`, `autoplay`, `controls`, `loop`,
 * * `muted`, `poster`, `preload` attributes.
 * * {@link module:video/video/videotypecommand~VideoTypeCommand `'videoTypeInline'`} command that converts block videos into
 * inline videos.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoInlineEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoEditing, VideoUtils, ClipboardPipeline ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoInlineEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Converters 'alt', `autoplay`, `controls`, `loop`, `muted`, `poster`, `preload` are added in 'VideoEditing' plugin.
		schema.register( 'videoInline', {
			inheritAllFrom: '$inlineObject',
			allowAttributes: [ 'alt', 'src', 'autoplay', 'controls', 'loop', 'muted', 'poster', 'preload' ]
		} );

		// Disallow inline videos in captions (for now). This is the best spot to do that because
		// independent packages can introduce captions (VideoCaption, TableCaption, etc.) so better this
		// be future-proof.
		schema.addChildCheck( ( context, childDefinition ) => {
			if ( context.endsWith( 'caption' ) && childDefinition.name === 'videoInline' ) {
				return false;
			}
		} );

		this._setupConversion();

		if ( editor.plugins.has( 'VideoBlockEditing' ) ) {
			editor.commands.add( 'videoTypeInline', new VideoTypeCommand( this.editor, 'videoInline' ) );

			this._setupClipboardIntegration();
		}
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * inline videos (inline video widgets) and their attributes.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const t = editor.t;
		const conversion = editor.conversion;
		const videoUtils = editor.plugins.get( 'VideoUtils' );

		conversion.for( 'dataDowncast' )
			.elementToElement( {
				model: 'videoInline',
				view: ( modelElement, { writer } ) => writer.createEmptyElement( 'video' )
			} );

		conversion.for( 'editingDowncast' )
			.elementToStructure( {
				model: 'videoInline',
				view: ( modelElement, { writer } ) => videoUtils.toVideoWidget(
					createInlineVideoViewElement( writer ), writer, t( 'video widget' )
				)
			} );

		conversion.for( 'downcast' )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'src' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'alt' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'autoplay' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'controls' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'loop' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'muted' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'poster' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoInline', 'preload' ) );

		// More video related upcasts are in 'VideoEditing' plugin.
		conversion.for( 'upcast' )
			.elementToElement( {
				view: getVideoViewElementMatcher( editor, 'videoInline' ),
				model: ( viewVideo, { writer } ) => writer.createElement(
					'videoInline',
					viewVideo.hasAttribute( 'src' ) ? { src: viewVideo.getAttribute( 'src' ) } : null
				)
			} );
	}

	/**
	 * Integrates the plugin with the clipboard pipeline.
	 *
	 * Idea is that the feature should recognize the user's intent when an **block** video is
	 * pasted or dropped. If such an video is pasted/dropped into a non-empty block
	 * (e.g. a paragraph with some text) it gets converted into an inline video on the fly.
	 *
	 * We assume this is the user's intent if they decided to put their video there.
	 *
	 * **Note**: If a block video has a caption, it will not be converted to an inline video
	 * to avoid the confusion. Captions are added on purpose and they should never be lost
	 * in the clipboard pipeline.
	 *
	 * See the `VideoBlockEditing` for the similar integration that works in the opposite direction.
	 *
	 * @private
	 */
	_setupClipboardIntegration() {
		const editor = this.editor;
		const model = editor.model;
		const editingView = editor.editing.view;
		const videoUtils = editor.plugins.get( 'VideoUtils' );

		this.listenTo( editor.plugins.get( 'ClipboardPipeline' ), 'inputTransformation', ( evt, data ) => {
			const docFragmentChildren = Array.from( data.content.getChildren() );
			let modelRange;

			// Make sure only <figure class="video"></figure> elements are dropped or pasted. Otherwise, if there some other HTML
			// mixed up, this should be handled as a regular paste.
			if ( !docFragmentChildren.every( videoUtils.isBlockVideoView ) ) {
				return;
			}

			// When drag and dropping, data.targetRanges specifies where to drop because
			// this is usually a different place than the current model selection (the user
			// uses a drop marker to specify the drop location).
			if ( data.targetRanges ) {
				modelRange = editor.editing.mapper.toModelRange( data.targetRanges[ 0 ] );
			}
			// Pasting, however, always occurs at the current model selection.
			else {
				modelRange = model.document.selection.getFirstRange();
			}

			const selection = model.createSelection( modelRange );

			// Convert block videos into inline videos only when pasting or dropping into non-empty blocks
			// and when the block is not an object (e.g. pasting to replace another widget).
			if ( determineVideoTypeForInsertionAtSelection( model.schema, selection ) === 'videoInline' ) {
				const writer = new UpcastWriter( editingView.document );

				// Unwrap <figure class="video"><video .../></figure> -> <video ... />
				// but <figure class="video"><video .../><figcaption>...</figcaption></figure> -> stays the same
				const inlineViewVideos = docFragmentChildren.map( blockViewVideo => {
					// If there's just one child, it can be either <video /> or <a><video></a>.
					// If there are other children than <video>, this means that the block video
					// has a caption or some other features and this kind of video should be
					// pasted/dropped without modifications.
					if ( blockViewVideo.childCount === 1 ) {
						// Pass the attributes which are present only in the <figure> to the <video>
						// (e.g. the style="width:10%" attribute applied by the VideoResize plugin).
						Array.from( blockViewVideo.getAttributes() )
							.forEach( attribute => writer.setAttribute(
								...attribute,
								videoUtils.findViewVideoElement( blockViewVideo )
							) );

						return blockViewVideo.getChild( 0 );
					} else {
						return blockViewVideo;
					}
				} );

				data.content = writer.createDocumentFragment( inlineViewVideos );
			}
		} );
	}
}
