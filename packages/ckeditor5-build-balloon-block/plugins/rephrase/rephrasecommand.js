/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module rephrase/rephrasecommand
 */

import { Command } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';

/**
 * The rephrase command.
 * @extends module:core/command~Command
 */
export default class RephraseCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 */

	// eslint-disable-next-line no-useless-constructor
	constructor( editor, config ) {
		super( editor );
		this.config = config;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		// Check whether any of the position's ancestors is a list item.
		const editor = this.editor;
		const model = editor.model;

		const block = first( model.document.selection.getSelectedBlocks() );

		if ( !block || !model.schema.checkAttribute( block, 'rephraseLibrary' ) ) {
			this.isEnabled = false;
			this.onError( 'Please select a block with rephraseLibrary attribute' );
			return;
		}

		this.isEnabled = true;
	}

	/**
	 * @inheritDoc
	 */
	execute( options = {} ) {
		if ( !this.isEnabled ) {
			this.onError( 'Rephrase is disable' );
			return;
		}
		updateNewContent( this.editor, options, this.config );
	}

	onError( text ) {
		if ( this.config.onError ) {
			this.config.onError( text );
		}
	}
}

// Returns blocks from selection that should have blockIndent selection set.
//
// @param {module:engine/model/model~model} model A model.
function getBlocksToChange( model ) {
	const selection = model.document.selection;
	const schema = model.schema;
	const blocksInSelection = Array.from( selection.getSelectedBlocks() );

	return blocksInSelection.filter( block => schema.checkAttribute( block, 'rephraseLibrary' ) );
}

// callAPI( htmlSelection )
async function updateNewContent( editor, options, config ) {
	const onError = text => {
		if ( config.onError ) {
			config.onError( text );
		}
	};
	let blockSelection = false;
	let htmlSelection = ( options.htmlSelection ) ? options.htmlSelection : '';
	const model = editor.model;
	const data = editor.data;
	const doc = model.document;
	const selection = doc.selection;

	if ( !htmlSelection ) {
		htmlSelection = data.stringify( model.getSelectedContent( selection ) );
	}
	const blocksToChange = getBlocksToChange( model );
	if ( !htmlSelection ) {
		// get content from the block
		blocksToChange.forEach( block => {
			htmlSelection += data.stringify( block );
		} );
		blockSelection = true;
	}

	if ( !htmlSelection ) {
		onError( 'Please select a block with rephraseLibrary attribute' );
		return;
	}

	if ( !config.getRephrase ) {
		onError( 'Please provide a getRephrase function' );
		return;
	}

	const editorId = editor.sourceElement.id;
	editor.enableReadOnlyMode( editorId );
	// set loading
	if ( config.onLoading ) {
		config.onLoading( true );
	}

	let content = await config.getRephrase( htmlSelection );
	editor.disableReadOnlyMode( editorId );
	if ( !content ) {
		onError( 'Rephrase returned no content' );
		return;
	}
	// update selection with rephrase library
	if ( !blockSelection ) {
		const range = selection.getFirstRange();
		model.change( writer => {
			writer.remove( range );
		} );
		const viewFragment = data.processor.toView( content );
		const modelFragment = data.toModel( viewFragment );
		model.insertContent( modelFragment );
	} else {
		model.change( writer => {
			blocksToChange.forEach( block => {
				writer.remove( block );
			} );
		} );
		content = '<p></p>' + content + '<p></p>';
		const viewFragment = data.processor.toView( content );
		const modelFragment = data.toModel( viewFragment );
		model.insertContent( modelFragment );
	}

	// remove loading
	if ( config.onLoading ) {
		config.onLoading( false );
	}
}
