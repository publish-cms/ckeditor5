/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videostyle/videostyleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import VideoStyleCommand from './videostylecommand';
import VideoUtils from '../videoutils';
import utils from './utils';
import { viewToModelStyleAttribute, modelToViewStyleAttribute } from './converters';

/**
 * The video style engine plugin. It sets the default configuration, creates converters and registers
 * {@link module:video/videostyle/videostylecommand~VideoStyleCommand VideoStyleCommand}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoStyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoStyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoUtils ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const { normalizeStyles, getDefaultStylesConfiguration } = utils;
		const editor = this.editor;
		const isBlockPluginLoaded = editor.plugins.has( 'VideoBlockEditing' );
		const isInlinePluginLoaded = editor.plugins.has( 'VideoInlineEditing' );

		editor.config.define( 'video.styles', getDefaultStylesConfiguration( isBlockPluginLoaded, isInlinePluginLoaded ) );

		/**
		 * It contains a list of the normalized and validated style options.
		 *
		 * * Each option contains a complete icon markup.
		 * * The style options not supported by any of the loaded video editing plugins (
		 * {@link module:video/video/videoinlineediting~VideoInlineEditing `VideoInlineEditing`} or
		 * {@link module:video/video/videoblockediting~VideoBlockEditing `VideoBlockEditing`}) are filtered out.
		 *
		 * @protected
		 * @readonly
		 * @type {module:video/videostyle~VideoStyleConfig}
		 */
		this.normalizedStyles = normalizeStyles( {
			configuredStyles: editor.config.get( 'video.styles' ),
			isBlockPluginLoaded,
			isInlinePluginLoaded
		} );

		this._setupConversion( isBlockPluginLoaded, isInlinePluginLoaded );
		this._setupPostFixer();

		// Register videoStyle command.
		editor.commands.add( 'videoStyle', new VideoStyleCommand( editor, this.normalizedStyles ) );
	}

	/**
	 * Sets the editor conversion taking the presence of
	 * {@link module:video/video/videoinlineediting~VideoInlineEditing `VideoInlineEditing`}
	 * and {@link module:video/video/videoblockediting~VideoBlockEditing `VideoBlockEditing`} plugins into consideration.
	 *
	 * @private
	 * @param {Boolean} isBlockPluginLoaded
	 * @param {Boolean} isInlinePluginLoaded
	 */
	_setupConversion( isBlockPluginLoaded, isInlinePluginLoaded ) {
		const editor = this.editor;
		const schema = editor.model.schema;

		const modelToViewConverter = modelToViewStyleAttribute( this.normalizedStyles );
		const viewToModelConverter = viewToModelStyleAttribute( this.normalizedStyles );

		editor.editing.downcastDispatcher.on( 'attribute:videoStyle', modelToViewConverter );
		editor.data.downcastDispatcher.on( 'attribute:videoStyle', modelToViewConverter );

		// Allow videoStyle attribute in video and videoInline.
		// We could call it 'style' but https://github.com/ckeditor/ckeditor5-engine/issues/559.
		if ( isBlockPluginLoaded ) {
			schema.extend( 'videoBlock', { allowAttributes: 'videoStyle' } );

			// Converter for figure element from view to model.
			editor.data.upcastDispatcher.on( 'element:figure', viewToModelConverter, { priority: 'low' } );
		}

		if ( isInlinePluginLoaded ) {
			schema.extend( 'videoInline', { allowAttributes: 'videoStyle' } );

			// Converter for the video element from view to model.
			editor.data.upcastDispatcher.on( 'element:video', viewToModelConverter, { priority: 'low' } );
		}
	}

	/**
	 * Registers a post-fixer that will make sure that the style attribute value is correct for a specific video type (block vs inline).
	 *
	 * @private
	 */
	_setupPostFixer() {
		const editor = this.editor;
		const document = editor.model.document;

		const videoUtils = editor.plugins.get( VideoUtils );
		const stylesMap = new Map( this.normalizedStyles.map( style => [ style.name, style ] ) );

		// Make sure that style attribute is valid for the video type.
		document.registerPostFixer( writer => {
			let changed = false;

			for ( const change of document.differ.getChanges() ) {
				if ( change.type == 'insert' || change.type == 'attribute' && change.attributeKey == 'videoStyle' ) {
					let element = change.type == 'insert' ? change.position.nodeAfter : change.range.start.nodeAfter;

					if ( element && element.is( 'element', 'paragraph' ) && element.childCount > 0 ) {
						element = element.getChild( 0 );
					}

					if ( !videoUtils.isVideo( element ) ) {
						continue;
					}

					const videoStyle = element.getAttribute( 'videoStyle' );

					if ( !videoStyle ) {
						continue;
					}

					const videoStyleDefinition = stylesMap.get( videoStyle );

					if ( !videoStyleDefinition || !videoStyleDefinition.modelElements.includes( element.name ) ) {
						writer.removeAttribute( 'videoStyle', element );
						changed = true;
					}
				}
			}

			return changed;
		} );
	}
}
