/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/videocaption/videocaptionui
 */

import { Plugin, icons } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import VideoCaptionUtils from './videocaptionutils';

/**
 * The video caption UI plugin. It introduces the `'toggleVideoCaption'` UI button.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoCaptionUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ VideoCaptionUtils ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'VideoCaptionUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const videoCaptionUtils = editor.plugins.get( 'VideoCaptionUtils' );
		const t = editor.t;

		editor.ui.componentFactory.add( 'toggleVideoCaption', locale => {
			const command = editor.commands.get( 'toggleVideoCaption' );
			const view = new ButtonView( locale );

			view.set( {
				icon: icons.caption,
				tooltip: true,
				isToggleable: true
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );
			view.bind( 'label' ).to( command, 'value', value => value ? t( 'Toggle caption off' ) : t( 'Toggle caption on' ) );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'toggleVideoCaption', { focusCaptionOnShow: true } );

				// Scroll to the selection and highlight the caption if the caption showed up.
				const modelCaptionElement = videoCaptionUtils.getCaptionFromModelSelection( editor.model.document.selection );

				if ( modelCaptionElement ) {
					const figcaptionElement = editor.editing.mapper.toViewElement( modelCaptionElement );

					editingView.scrollToTheSelection();

					editingView.change( writer => {
						writer.addClass( 'video__caption_highlighted', figcaptionElement );
					} );
				}

				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
