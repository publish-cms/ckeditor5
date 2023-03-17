/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videostyle/videostylecommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The video style command. It is used to apply {@link module:video/videostyle~VideoStyleConfig#options video style option}
 * to a selected video.
 *
 * **Note**: Executing this command may change the video model element if the desired style requires an video of a different
 * type. See {@link module:video/videostyle/videostylecommand~VideoStyleCommand#execute} to learn more.
 *
 * @extends module:core/command~Command
 */
export default class VideoStyleCommand extends Command {
	/**
	 * Creates an instance of the video style command. When executed, the command applies one of
	 * {@link module:video/videostyle~VideoStyleConfig#options style options} to the currently selected video.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {Array.<module:video/videostyle~VideoStyleOptionDefinition>} styles
	 * The style options that this command supports.
	 */
	constructor( editor, styles ) {
		super( editor );

		/**
		 * An object containing names of default style options for the inline and block videos.
		 * If there is no default style option for the given video type in the configuration,
		 * the name will be `false`.
		 *
		 * @private
		 * @type {Object.<String,module:video/videostyle~VideoStyleOptionDefinition#name>}
		 */
		this._defaultStyles = {
			videoBlock: false,
			videoInline: false
		};

		/**
		 * The styles handled by this command.
		 *
		 * @private
		 * @type {module:video/videostyle~VideoStyleConfig#options}
		 */
		this._styles = new Map( styles.map( style => {
			if ( style.isDefault ) {
				for ( const modelElementName of style.modelElements ) {
					this._defaultStyles[ modelElementName ] = style.name;
				}
			}

			return [ style.name, style ];
		} ) );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const element = videoUtils.getClosestSelectedVideoElement( this.editor.model.document.selection );

		this.isEnabled = !!element;

		if ( !this.isEnabled ) {
			this.value = false;
		} else if ( element.hasAttribute( 'videoStyle' ) ) {
			this.value = element.getAttribute( 'videoStyle' );
		} else {
			this.value = this._defaultStyles[ element.name ];
		}
	}

	/**
	 * Executes the command and applies the style to the currently selected video:
	 *
	 *		editor.execute( 'videoStyle', { value: 'side' } );
	 *
	 * **Note**: Executing this command may change the video model element if the desired style requires an video
	 * of a different type. Learn more about {@link module:video/videostyle~VideoStyleOptionDefinition#modelElements model element}
	 * configuration for the style option.
	 *
	 * @param {Object} options
	 * @param {module:video/videostyle~VideoStyleOptionDefinition#name} options.value The name of the style (as configured in
	 * {@link module:video/videostyle~VideoStyleConfig#options}).
	 * @fires execute
	 */
	execute( options = {} ) {
		const editor = this.editor;
		const model = editor.model;
		const videoUtils = editor.plugins.get( 'VideoUtils' );

		model.change( writer => {
			const requestedStyle = options.value;

			let videoElement = videoUtils.getClosestSelectedVideoElement( model.document.selection );

			// Change the video type if a style requires it.
			if ( requestedStyle && this.shouldConvertVideoType( requestedStyle, videoElement ) ) {
				this.editor.execute( videoUtils.isBlockVideo( videoElement ) ? 'videoTypeInline' : 'videoTypeBlock' );

				// Update the videoElement to the newly created video.
				videoElement = videoUtils.getClosestSelectedVideoElement( model.document.selection );
			}

			// Default style means that there is no `videoStyle` attribute in the model.
			// https://github.com/ckeditor/ckeditor5-video/issues/147
			if ( !requestedStyle || this._styles.get( requestedStyle ).isDefault ) {
				writer.removeAttribute( 'videoStyle', videoElement );
			} else {
				writer.setAttribute( 'videoStyle', requestedStyle, videoElement );
			}
		} );
	}

	/**
	 * Returns `true` if requested style change would trigger the video type change.
	 *
	 * @param {module:video/videostyle~VideoStyleOptionDefinition} requestedStyle The name of the style (as configured in
	 * {@link module:video/videostyle~VideoStyleConfig#options}).
	 * @param {module:engine/model/element~Element} videoElement The video model element.
	 * @returns {Boolean}
	 */
	shouldConvertVideoType( requestedStyle, videoElement ) {
		const supportedTypes = this._styles.get( requestedStyle ).modelElements;

		return !supportedTypes.includes( videoElement.name );
	}
}
