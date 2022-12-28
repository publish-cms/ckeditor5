/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable no-undef */

import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Plugin } from 'ckeditor5/src/core';
import browseFilesIcon from './theme/browse-files.svg';

export default class MediaLibrary extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MediaLibrary';
	}

	/**
	 * @inheritDoc
	 */
	// static get requires() {
	// 	return ['insertImage'];
	// }

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		const t = editor.t;
		const config = editor.config.get( 'mediaLibrary' ) || {};
		let onOpen = () => {};
		if ( typeof config.onOpen === 'function' ) {
			onOpen = config.onOpen;
		}

		if ( typeof config.onError === 'function' ) {
			this.onError = config.onError;
		}

		editor.commands.add( 'mediaLibrary', {
			// eslint-disable-next-line no-unused-vars
			execute: ( options = {} ) => {
				// open media library
				onOpen();
				this.isEnabled = true;
				this.startListening();
			},
			refresh: () => {
				const command = editor.commands.get( 'mediaLibrary' );
				command.isEnabled = this._checkEnabled();
			}
		} );

		editor.ui.componentFactory.add( 'MediaLibrary', locale => {
			const button = new ButtonView( locale );
			button.set( {
				label: t( 'Insert image or file' ),
				icon: browseFilesIcon,
				tooltip: true
			} );

			// Callback executed once the image is clicked.
			button.on( 'execute', () => {
				editor.execute( 'mediaLibrary' );
				editor.editing.view.focus();
			} );

			return button;
		} );

		this.handleSelect = this.handleSelect.bind( this );
		this.handleSelect = this.handleSelect.bind( this );
		this.stopListening = this.stopListening.bind( this );
		this.startListening = this.startListening.bind( this );
		this.onError = this.onError.bind( this );
		this.onClose = this.onClose.bind( this );
	}

	stopListening() {
		window.removeEventListener(
			'ck:mediaLibrary:chooseImage',
			this.handleSelect
		);
		window.removeEventListener( 'ck:mediaLibrary:onClose', this.onClose );
	}

	startListening() {
		window.addEventListener( 'ck:mediaLibrary:chooseImage', this.handleSelect );
		window.addEventListener( 'ck:mediaLibrary:onClose', this.onClose );
	}

	_checkEnabled() {
		const imageCommand = this.editor.commands.get( 'insertImage' );
		if ( !imageCommand.isEnabled ) {
			return false;
		}
		return true;
	}

	handleSelect( event ) {
		event.preventDefault();
		this.stopListening();
		const { imageFallbackUrl, imageSources, imageTextAlternative, id } =
			event.detail;
		if ( !imageFallbackUrl ) {
			this.onError( new Error( 'No imageFallbackUrl' ) );
		}
		this.editor.execute( 'insertImage', {
			source: {
				src: imageFallbackUrl,
				sources: imageSources,
				alt: imageTextAlternative
			},
			dataId: id
		} );
	}

	onError() {
		// eslint-disable-next-line no-undef
		console.error( 'No onError callback provided' );
	}

	onClose() {
		this.stopListening();
	}

	destroy() {
		this.stopListening();
		super.destroy();
	}
}
