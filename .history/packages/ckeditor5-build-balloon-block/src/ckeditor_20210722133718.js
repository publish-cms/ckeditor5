/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
// // Add new
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
// import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
// The editor creator to use.
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HeadingButtonsUI from '@ckeditor/ckeditor5-heading/src/headingbuttonsui';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
// eslint-disable-next-line ckeditor5-rules/no-relative-imports
// import Emoji from '../../ckeditor5-emoji/src/emoji';
// eslint-disable-next-line ckeditor5-rules/no-relative-imports
// import InsertTOC from '../../ckeditor5-toc/src/toc';
import ImageResizeEditing from '@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting';
import ImageResizeHandles from '@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ParagraphButtonUI from '@ckeditor/ckeditor5-paragraph/src/paragraphbuttonui';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows.js';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import SpecialCharactersLatin from '@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin.js';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
// import Markdown from '@ckeditor/ckeditor5-markdown-gfm';
import sanitize from 'sanitize-html';
import '../theme/theme.css';

// export default

// export default
class ClassicEditor extends ClassicEditorBase {}

// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	// CKFinder,
	Heading,
	HeadingButtonsUI,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	ParagraphButtonUI,
	PasteFromOffice,
	Table,
	TableToolbar,
	TextTransformation,
	UploadAdapter,
	ImageResizeEditing
ImageResizeHandles
	// LetterCase,
	// Underline,
	// Mention
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'bold',
			'italic',
			'underline',
			'paragraph',
			'heading3',
			'bulletedList',
			'numberedList'
		]
	},
	heading: {
		options: [
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph'
			},
			{
				model: 'heading2',
				view: 'h2',
				title: 'Heading 2',
				class: 'ck-heading_heading2'
			},
			{
				model: 'heading3',
				view: 'h3',
				title: 'Heading 3',
				class: 'ck-heading_heading3'
			},
			{
				model: 'heading4',
				view: 'h4',
				title: 'Heading 4',
				class: 'ck-heading_heading4'
			}
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

class BalloonEditor extends BalloonEditorBase {}

// Plugins to include in the build.
BalloonEditor.builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	BlockToolbar,
	Bold,
	Italic,
	BlockQuote,
	// CKFinder,
	EasyImage,
	Heading,
	HeadingButtonsUI,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	ParagraphButtonUI,
	PasteFromOffice,
	Table,
	TableToolbar,
	Underline,
	WordCount,
	Autosave,
	Alignment,
	TextTransformation,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersText,
	TableProperties,
	TableCellProperties,
	HtmlEmbed,
	CloudServices,
	// Markdown,
	Mention
	// Emoji,
	// InsertTOC
];

// Editor configuration.
BalloonEditor.defaultConfig = {
	blockToolbar: [
		'heading2',
		'heading3',
		'heading4',
		'|',
		'bulletedList',
		'numberedList',
		'|',
		'outdent',
		'indent',
		'|',
		'uploadImage',
		'blockQuote',
		'mediaEmbed',
		'|',
		'specialCharacters',
		'htmlEmbed'
	],
	heading: {
		options: [
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph'
			},
			{
				model: 'heading2',
				view: 'h2',
				title: 'Heading 2',
				class: 'ck-heading_heading2'
			},
			{
				model: 'heading3',
				view: 'h3',
				title: 'Heading 3',
				class: 'ck-heading_heading3'
			},
			{
				model: 'heading4',
				view: 'h4',
				title: 'Heading 4',
				class: 'ck-heading_heading4'
			}
		]
	},
	toolbar: {
		items: [
			'paragraph',
			'heading2',
			'heading3',
			'heading4',
			'|',
			'bold',
			'italic',
			'underline',
			'link',
			'|',
			'alignment'
		]
	},
	image: {
		toolbar: [
			'imageStyle:full',
			'imageStyle:alignLeft',
			'imageStyle:wide',
			'imageStyle:fullOver',
			'|',
			'imageTextAlternative'
		],
		styles: [ 'full', 'alignLeft', 'wide', 'fullOver' ]
	},
	link: {
		protocol: 'http://',
		decorators: [
			{
				mode: 'manual',
				label: 'Open in a new tab',
				defaultValue: true,
				attributes: {
					target: '_blank'
				}
			},
			{
				mode: 'manual',
				defaultValue: false,
				label: 'NoFollow',
				attributes: {
					rel: 'nofollow noopener noreferrer'
				}
			}
		]
	},
	// image: {
	// 	toolbar: [
	// 		'imageStyle:side',
	// 		'imageStyle:full',
	// 		'imageStyle:alignLeft',
	// 		'imageStyle:alignCenter',
	// 		'|',
	// 		'imageTextAlternative'
	// 	],
	// 	styles: [ 'side', 'full', 'alignLeft', 'alignCenter' ]
	// },
	// ckfinder: {
	// 	// Open the file manager in the pop-up window.
	// 	openerMethod: 'popup'
	// },
	htmlEmbed: {
		showPreviews: true,
		sanitizeHtml( inputHtml ) {
			// Strip unsafe elements and attributes, e.g.:
			// the `<script>` elements and `on*` attributes.
			const outputHtml = sanitize( inputHtml );

			return {
				html: outputHtml
				// true or false depending on whether the sanitizer stripped anything.
			};
		}
	},
	mention: {
		feeds: [
			{
				marker: '@',
				feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ],
				minimumCharacters: 1
			}
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	autosave: {
		save() {
			// The saveData() function must return a promise
			// which should be resolved when the data is successfully saved.
			// return saveData(editor.getData());
		}
	},
	mediaEmbed: {
		extraProviders: [
			{
				name: 'tiktok',
				url: /^https?:\/\/www.?tiktok\.com\/(@.*)\/video\/([0-9]*)\/?/,
				html: match => {
					// eslint-disable-next-line max-len
					return `<blockquote class="tiktok-embed" cite="${ match[ 0 ] }" data-video-id="${ match[ 2 ] }" style="max-width: 605px;min-width: 325px;" > <section> <a target="_blank" title="${ match[ 1 ] }" href="https://www.tiktok.com/${ match[ 1 ] }">${ match[ 1 ] }</a> </section> </blockquote> <script async src="https://www.tiktok.com/embed.js"></script>`;
				}
			}
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'vi'
};

export default { BalloonEditor, ClassicEditor };
