/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video/videoblockediting
 */

import { Plugin } from 'ckeditor5/src/core';
import { ClipboardPipeline } from 'ckeditor5/src/clipboard';
import { UpcastWriter } from 'ckeditor5/src/engine';

import {
	downcastVideoAttribute,
	upcastVideoFigure
} from './converters';

import VideoEditing from './videoediting';
import VideoTypeCommand from './videotypecommand';
import VideoUtils from './videoutils';
import {
	getVideoViewElementMatcher,
	createBlockVideoViewElement,
	determineVideoTypeForInsertionAtSelection
} from './utils';

/**
 * The video block plugin.
 *
 * It registers:
 *
 * * `<videoBlock>` as a block element in the document schema, and allows `alt`, `src` , `autoplay`, `controls`, `loop`,
 * * `muted`, `poster`, `preload` attributes.
 * * converters for editing and data pipelines.,
 * * {@link module:video/video/videotypecommand~VideoTypeCommand `'videoTypeBlock'`} command that converts inline videos into
 * block videos.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoBlockEditing extends Plugin {
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
		return 'VideoBlockEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const schema = editor.model.schema;

		// Converters 'alt', `autoplay`, `controls`, `loop`, `muted`, `poster`, `preload` are added in 'VideoEditing' plugin.
		schema.register( 'videoBlock', {
			inheritAllFrom: '$blockObject',
			allowAttributes: [ 'alt', 'src', 'autoplay', 'controls', 'loop', 'muted', 'poster', 'preload' ]
		} );

		this._setupConversion();

		if ( editor.plugins.has( 'VideoInlineEditing' ) ) {
			editor.commands.add( 'videoTypeBlock', new VideoTypeCommand( this.editor, 'videoBlock' ) );

			this._setupClipboardIntegration();
		}
	}

	/**
	 * Configures conversion pipelines to support upcasting and downcasting
	 * block videos (block video widgets) and their attributes.
	 *
	 * @private
	 */
	_setupConversion() {
		const editor = this.editor;
		const t = editor.t;
		const conversion = editor.conversion;
		const videoUtils = editor.plugins.get( 'VideoUtils' );

		conversion.for( 'dataDowncast' )
			.elementToStructure( {
				model: 'videoBlock',
				view: ( modelElement, { writer } ) => createBlockVideoViewElement( writer )
			} );

		conversion.for( 'editingDowncast' )
			.elementToStructure( {
				model: 'videoBlock',
				view: ( modelElement, { writer } ) => videoUtils.toVideoWidget(
					createBlockVideoViewElement( writer ), writer, t( 'video widget' )
				)
			} );

		conversion.for( 'downcast' )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'src' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'alt' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'autoplay' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'controls' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'loop' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'muted' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'poster' ) )
			.add( downcastVideoAttribute( videoUtils, 'videoBlock', 'preload' ) );

		// More video related upcasts are in 'VideoEditing' plugin.
		conversion.for( 'upcast' )
			.elementToElement( {
				view: getVideoViewElementMatcher( editor, 'videoBlock' ),
				model: ( viewVideo, { writer } ) => writer.createElement(
					'videoBlock',
					viewVideo.hasAttribute( 'src' ) ? { src: viewVideo.getAttribute( 'src' ) } : null
				)
			} )
			.add( upcastVideoFigure( videoUtils ) );
	}

	/**
	 * Integrates the plugin with the clipboard pipeline.
	 *
	 * Idea is that the feature should recognize the user's intent when an **inline** video is
	 * pasted or dropped. If such an video is pasted/dropped:
	 *
	 * * into an empty block (e.g. an empty paragraph),
	 * * on another object (e.g. some block widget).
	 *
	 * it gets converted into a block video on the fly. We assume this is the user's intent
	 * if they decided to put their video there.
	 *
	 * See the `VideoInlineEditing` for the similar integration that works in the opposite direction.
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

			// Make sure only <video> elements are dropped or pasted. Otherwise, if there some other HTML
			// mixed up, this should be handled as a regular paste.
			if ( !docFragmentChildren.every( videoUtils.isInlineVideoView ) ) {
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

			// Convert inline videos into block videos only when the currently selected block is empty
			// (e.g. an empty paragraph) or some object is selected (to replace it).
			if ( determineVideoTypeForInsertionAtSelection( model.schema, selection ) === 'videoBlock' ) {
				const writer = new UpcastWriter( editingView.document );

				// Wrap <video ... /> -> <figure class="video"><video .../></figure>
				const blockViewVideos = docFragmentChildren.map(
					inlineViewVideo => writer.createElement( 'figure', { class: 'video' }, inlineViewVideo )
				);

				data.content = writer.createDocumentFragment( blockViewVideos );
			}
		} );
	}
}
