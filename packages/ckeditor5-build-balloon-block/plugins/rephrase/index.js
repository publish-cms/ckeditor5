/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable no-undef */
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { Plugin } from 'ckeditor5/src/core';
import rephraseIcon from './rephrase.svg';
import RephraseCommand from './rephrasecommand';

// css
// import './rephrase.css';
const activeElements = [
	'paragraph',
	'heading1',
	'heading2',
	'heading3',
	'heading4',
	'heading5',
	'heading6',
	'bulletedList',
	'numberedList',
	'listItem'
];

export default class RephraseLibrary extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'RephraseLibrary';
	}

	/**
	 * @inheritDoc
	 */

	init() {
		const editor = this.editor;
		// const model = editor.model;
		const t = editor.t;

		const config = editor.config.get( 'rephraseLibrary' ) || {};

		const configActiveElements = config.activeElements || activeElements;

		editor.ui.componentFactory.add( 'rephraseLibrary', locale => {
			const command = editor.commands.get( 'rephraseLibrary' );
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Rephrase' ),
				icon: rephraseIcon,
				tooltip: true,
				class: 'ck-button-rephrase'
			} );

			view.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			this.listenTo( view, 'execute', () => {
				editor.execute( 'rephraseLibrary' );
				editor.editing.view.focus();
			} );

			return view;
		} );

		editor.commands.add( 'rephraseLibrary', new RephraseCommand( editor, config ) );

		const schema = editor.model.schema;

		configActiveElements.forEach( elementName => {
			if ( schema.isRegistered( elementName ) ) {
				schema.extend( elementName, { allowAttributes: 'rephraseLibrary' } );
			}
		} );

		schema.setAttributeProperties( 'rephraseLibrary', { isFormatting: true } );

		// schema.extend( '$text', { allowAttributes: 'rephraseLibrary' } );
		// schema.extend( '$block', { allowAttributes: 'rephraseLibrary' } );
	}

	onError() {
		// eslint-disable-next-line no-undef
		console.error( 'No onError callback provided' );
	}
}

