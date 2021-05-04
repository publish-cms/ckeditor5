/* eslint-disable no-undef */
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
// import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
// import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
// import { downcastElementToElement, insertElement, remove } from '@ckeditor/ckeditor5-engine/src/conversion/downcasthelpers';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import UpcastWriter from '@ckeditor/ckeditor5-engine/src/view/upcastwriter';
import { debounce } from 'lodash';
// import {  } from './ui/';
import tocIcon from '../theme/icons/toc.svg';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';

const tocDiv = document.getElementById( 'toc' );

export default class TableOfContentsPlugin extends Plugin {
	/**
   * Return the name of the plugin
   * @return {String} The name of the plugin
   */
	static get pluginName() {
		return 'TableOfContentsPlugin';
	}

	/**
    * Return the editor conversion configuration for a given model like heading1
    * @param  {String} model   The name of the model
    * @return {Object}         The conversion config
    */
	static getEditorConversionConfig( model ) {
		return {
			model,
			view: {
				name: 'p',
				classes: `ck-toc-${ model }`
			}
		};
	}

	init() {
		const htmlDataProcessor = new HtmlDataProcessor();
		const writer = new UpcastWriter();

		const debouncedTocUpdate = debounce( () => {
			const tocView = getFilteredView( this.editor.editing.view.document.getRoot() );

			tocDiv.innerHTML = htmlDataProcessor.toData( tocView );
		}, 500 );

		// eslint-disable-next-line max-statements-per-line
		this.editor.editing.view.on( 'render', () => { debouncedTocUpdate(); }, { priority: 'low' } );

		// Filtering should be more sophisticated if we expect headings inside block quotes or other elements (not on the first level).
		function getFilteredView( viewRoot ) {
			const viewFragment = writer.createDocumentFragment();

			for ( const child of viewRoot.getChildren() ) {
				if ( /^h[1-6]$/.test( child.name ) ) {
					// Clone so the original `child` is not removed from `viewRoot` when appended to `viewFragment`.
					const clonedChild = writer.clone( child, true );

					writer.appendChild( clonedChild, viewFragment );
				}
			}

			return viewFragment;
		}

		const editor = this.editor;

		editor.ui.componentFactory.add( 'insertTOC', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: 'Insert table of content',
				icon: imageIcon,
				tooltip: true
			} );

			// Callback executed once the image is clicked.

			view.on( 'execute', () => {
				editor.model.change( writer => {
					const tocElement = writer.createElement( 'div', {
						class: 'toc'
					} );

					// Insert the image in the current selection location.
					editor.model.insertContent( tocElement, editor.model.document.selection );
				} );
			} );

			return view;
		} );
		// const editor = this.editor;

		// const tableOfContents = new EditingController( editor.model );
		// tableOfContents.view.attachDomRoot( document.getElementById( 'editor-toc' ) );

		// const dispatcher = tableOfContents.downcastDispatcher;
		// downcastElementToElement( TableOfContentsPlugin.getEditorConversionConfig( 'heading1' ) )( dispatcher );
		// downcastElementToElement( TableOfContentsPlugin.getEditorConversionConfig( 'heading2' ) )( dispatcher );
		// downcastElementToElement( TableOfContentsPlugin.getEditorConversionConfig( 'heading3' ) )( dispatcher );
		// downcastElementToElement( {
		// 	model: 'paragraph',
		// 	view: {
		// 		name: 'span',
		// 		styles: {
		// 			display: 'none'
		// 		}
		// 	}
		// } )( dispatcher );
	}
}
