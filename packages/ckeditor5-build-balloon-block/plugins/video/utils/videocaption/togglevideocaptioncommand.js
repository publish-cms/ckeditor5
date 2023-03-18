/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videocaption/togglevideocaptioncommand
 */

import { Command } from 'ckeditor5/src/core';

import VideoBlockEditing from '../videoblockediting';

/**
 * The toggle video caption command.
 *
 * This command is registered by {@link module:video/videocaption/videocaptionediting~VideoCaptionEditing} as the
 * `'toggleVideoCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the video caption of a selected video (depending on whether the caption is present or not),
 * * removes the video caption if the selection is anchored in one.
 *
 *		// Toggle the presence of the caption.
 *		editor.execute( 'toggleVideoCaption' );
 *
 * **Note**: Upon executing this command, the selection will be set on the video if previously anchored in the caption element.
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 *		editor.execute( 'toggleVideoCaption', { focusCaptionOnShow: true } );
 *
 * @extends module:core/command~Command
 */
export default class ToggleVideoCaptionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;
		const videoCaptionUtils = editor.plugins.get( 'VideoCaptionUtils' );

		// Only block videos can get captions.
		if ( !editor.plugins.has( VideoBlockEditing ) ) {
			this.isEnabled = false;
			this.value = false;

			return;
		}

		const selection = editor.model.document.selection;
		const selectedElement = selection.getSelectedElement();

		if ( !selectedElement ) {
			const ancestorCaptionElement = videoCaptionUtils.getCaptionFromModelSelection( selection );

			this.isEnabled = !!ancestorCaptionElement;
			this.value = !!ancestorCaptionElement;

			return;
		}

		// Block videos support captions by default but the command should also be enabled for inline
		// videos because toggling the caption when one is selected should convert it into a block video.
		this.isEnabled = this.editor.plugins.get( 'VideoUtils' ).isVideo( selectedElement );

		if ( !this.isEnabled ) {
			this.value = false;
		} else {
			this.value = !!videoCaptionUtils.getCaptionFromVideoModelElement( selectedElement );
		}
	}

	/**
	 * Executes the command.
	 *
	 *		editor.execute( 'toggleVideoCaption' );
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.focusCaptionOnShow] When true and the caption shows up, the selection will be moved into it straight away.
	 * @fires execute
	 */
	execute( options = {} ) {
		const { focusCaptionOnShow } = options;

		this.editor.model.change( writer => {
			if ( this.value ) {
				this._hideVideoCaption( writer );
			} else {
				this._showVideoCaption( writer, focusCaptionOnShow );
			}
		} );
	}

	/**
	 * Shows the caption of the `<videoBlock>` or `<videoInline>`. Also:
	 *
	 * * it converts `<videoInline>` to `<videoBlock>` to show the caption,
	 * * it attempts to restore the caption content from the `VideoCaptionEditing` caption registry,
	 * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_showVideoCaption( writer, focusCaptionOnShow ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const videoCaptionEditing = this.editor.plugins.get( 'VideoCaptionEditing' );

		let selectedVideo = selection.getSelectedElement();

		const savedCaption = videoCaptionEditing._getSavedCaption( selectedVideo );

		// Convert videoInline -> video first.
		if ( this.editor.plugins.get( 'VideoUtils' ).isInlineVideo( selectedVideo ) ) {
			this.editor.execute( 'videoTypeBlock' );

			// Executing the command created a new model element. Let's pick it again.
			selectedVideo = selection.getSelectedElement();
		}

		// Try restoring the caption from the VideoCaptionEditing plugin storage.
		const newCaptionElement = savedCaption || writer.createElement( 'caption' );

		writer.append( newCaptionElement, selectedVideo );

		if ( focusCaptionOnShow ) {
			writer.setSelection( newCaptionElement, 'in' );
		}
	}

	/**
	 * Hides the caption of a selected video (or an video caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `VideoCaptionEditing` caption registry to make this
	 * a reversible action.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_hideVideoCaption( writer ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const videoCaptionEditing = editor.plugins.get( 'VideoCaptionEditing' );
		const videoCaptionUtils = editor.plugins.get( 'VideoCaptionUtils' );
		let selectedVideo = selection.getSelectedElement();
		let captionElement;

		if ( selectedVideo ) {
			captionElement = videoCaptionUtils.getCaptionFromVideoModelElement( selectedVideo );
		} else {
			captionElement = videoCaptionUtils.getCaptionFromModelSelection( selection );
			selectedVideo = captionElement.parent;
		}

		// Store the caption content so it can be restored quickly if the user changes their mind even if they toggle video<->videoInline.
		videoCaptionEditing._saveCaption( selectedVideo, captionElement );

		writer.setSelection( selectedVideo, 'on' );
		writer.remove( captionElement );
	}
}
