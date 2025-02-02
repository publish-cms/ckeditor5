/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videotextalternative/videotextalternativecommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The video text alternative command. It is used to change the `alt` attribute of `<videoBlock>` and `<videoInline>` model elements.
 *
 * @extends module:core/command~Command
 */
export default class VideoTextAlternativeCommand extends Command {
	/**
	 * The command value: `false` if there is no `alt` attribute, otherwise the value of the `alt` attribute.
	 *
	 * @readonly
	 * @observable
	 * @member {String|Boolean} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const element = videoUtils.getClosestSelectedVideoElement( this.editor.model.document.selection );

		this.isEnabled = !!element;

		if ( this.isEnabled && element.hasAttribute( 'alt' ) ) {
			this.value = element.getAttribute( 'alt' );
		} else {
			this.value = false;
		}
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options
	 * @param {String} options.newValue The new value of the `alt` attribute to set.
	 */
	execute( options ) {
		const editor = this.editor;
		const videoUtils = editor.plugins.get( 'VideoUtils' );
		const model = editor.model;
		const videoElement = videoUtils.getClosestSelectedVideoElement( model.document.selection );

		model.change( writer => {
			writer.setAttribute( 'alt', options.newValue, videoElement );
		} );
	}
}
