/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import BalloonEditorBase from '@ckeditor/ckeditor5-editor-balloon/src/ballooneditor';
import InlineEditorBase from '@ckeditor/ckeditor5-editor-inline/src/inlineeditor';
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import UploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter';
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import PictureEditing from '@ckeditor/ckeditor5-image/src/pictureediting';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TextTransformation from '@ckeditor/ckeditor5-typing/src/texttransformation';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';

// New plugins
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import HtmlEmbed from '@ckeditor/ckeditor5-html-embed/src/htmlembed';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';

import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters';
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows.js';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import SpecialCharactersLatin from '@ckeditor/ckeditor5-special-characters/src/specialcharacterslatin.js';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js';

import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties';

import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';

import HorizontalLine from '@ckeditor/ckeditor5-horizontal-line/src/horizontalline';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';

import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';
import FontSize from '@ckeditor/ckeditor5-font/src/fontsize';
import FontColor from '@ckeditor/ckeditor5-font/src/fontcolor';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';

import AutoImage from '@ckeditor/ckeditor5-image/src/autoimage';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert';
import LinkImage from '@ckeditor/ckeditor5-link/src/linkimage';

import ListProperties from '@ckeditor/ckeditor5-list/src/listproperties';

import ExportPdf from '@ckeditor/ckeditor5-export-pdf/src/exportpdf';
import ExportWord from '@ckeditor/ckeditor5-export-word/src/exportword';
import ImportWord from '@ckeditor/ckeditor5-import-word/src/importword';
// import WProofreader from '@webspellchecker/wproofreader-ckeditor5/src/wproofreader';
import FindAndReplace from '@ckeditor/ckeditor5-find-and-replace/src/findandreplace';
import SelectAll from '@ckeditor/ckeditor5-select-all/src/selectall';

import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

//
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';

//
import MediaLibrary from '../plugins/media-library';

import sanitize from 'sanitize-html';

class ClassicEditor extends ClassicEditorBase {}
class BalloonEditor extends BalloonEditorBase {}
class DecoupledEditor extends DecoupledEditorBase {}
class InlineEditor extends InlineEditorBase {}

//
import BlockToolbar from '@ckeditor/ckeditor5-ui/src/toolbar/block/blocktoolbar';
import '../theme/theme.css';

// Plugins to include in the build.
const builtinPlugins = [
	Essentials,
	UploadAdapter,
	Autoformat,
	Bold,
	Italic,
	BlockQuote,
	CloudServices,
	EasyImage,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	IndentBlock,
	Link,
	List,
	MediaEmbed,
	Paragraph,
	PasteFromOffice,
	PictureEditing,
	Table,
	TableToolbar,
	TextTransformation,
	Mention,
	//
	Undo,
	//
	SourceEditing,
	HtmlEmbed,
	WordCount,
	Autosave,
	Alignment,
	CodeBlock,
	SpecialCharacters,
	SpecialCharactersArrows,
	SpecialCharactersCurrency,
	SpecialCharactersEssentials,
	SpecialCharactersLatin,
	SpecialCharactersText,
	TableProperties,
	TableCellProperties,
	//
	Strikethrough,
	Underline,
	Code,
	Subscript,
	Superscript,
	RemoveFormat,
	HorizontalLine,
	PageBreak,
	//
	Highlight,
	FontSize,
	FontColor,
	FontBackgroundColor,
	FontFamily,
	//
	AutoImage,
	ImageInsert,
	LinkImage,
	//
	ListProperties,
	//
	ExportPdf,
	ExportWord,
	ImportWord,
	// WProofreader,
	FindAndReplace,
	SelectAll,
	//
	Clipboard,
	MediaLibrary,
	CKFinder
];

// Editor configuration.
const defaultConfig = {
	image: {
		toolbar: [
			'imageStyle:inline',
			'imageStyle:block',
			'imageStyle:side',
			'|',
			'toggleImageCaption',
			'imageTextAlternative'
		]
	},
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
	},
	heading: {
		options: [
			{
				model: 'paragraph',
				title: 'Paragraph',
				class: 'ck-heading_paragraph'
			},
			{
				model: 'heading1',
				view: 'h1',
				title: 'Heading 1',
				class: 'ck-heading_heading1'
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
			},
			{
				model: 'heading5',
				view: 'h5',
				title: 'Heading 5',
				class: 'ck-heading_heading5'
			},
			{
				model: 'heading6',
				view: 'h6',
				title: 'Heading 6',
				class: 'ck-heading_heading6'
			}
		]
	},
	link: {
		decorators: [
			{
				mode: 'manual',
				label: 'Open in a new tab',
				defaultValue: true,
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			},
			{
				mode: 'manual',
				defaultValue: false,
				label: 'NoFollow',
				attributes: {
					rel: 'nofollow'
				}
			}
		]
	},
	htmlEmbed: {
		showPreviews: false,
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
	codeBlock: {
		languages: [
			{ language: 'css', label: 'CSS' },
			{ language: 'html', label: 'HTML' },
			{ language: 'javascript', label: 'JavaScript' },
			{ language: 'php', label: 'PHP' },
			{ language: 'python', label: 'Python' },
			{ language: 'ruby', label: 'Ruby' },
			{ language: 'typescript', label: 'TypeScript' },
			{ language: 'xml', label: 'XML' },
			{ language: 'yaml', label: 'YAML' },
			{ language: 'bash', label: 'Bash' },
			{ language: 'c', label: 'C' },
			{ language: 'cpp', label: 'C++' },
			{ language: 'csharp', label: 'C#' },
			{ language: 'java', label: 'Java' },
			{ language: 'kotlin', label: 'Kotlin' },
			{ language: 'swift', label: 'Swift' },
			{ language: 'go', label: 'Go' },
			{ language: 'rust', label: 'Rust' },
			{ language: 'sql', label: 'SQL' },
			{ language: 'json', label: 'JSON' },
			{ language: 'markdown', label: 'Markdown' },
			{ language: 'diff', label: 'Diff' },
			{ language: 'ini', label: 'INI' },
			{ language: 'makefile', label: 'Makefile' },
			{ language: 'nginx', label: 'Nginx' },
			{ language: 'powershell', label: 'PowerShell' },
			{ language: 'toml', label: 'TOML' },
			{ language: 'dockerfile', label: 'Dockerfile' },
			{ language: 'git', label: 'Git' },
			{ language: 'graphql', label: 'GraphQL' },
			{ language: 'less', label: 'Less' },
			{ language: 'scss', label: 'SCSS' },
			{ language: 'stylus', label: 'Stylus' },
			{ language: 'vue', label: 'Vue' }
		]
	},
	autosave: {
		save( editor ) {
			// eslint-disable-next-line no-undef
			console.log( 'save ~ editor', editor );
			// The saveData() function must return a promise
			// which should be resolved when the data is successfully saved.
			// return saveData( editor.getData() );
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
	// ckfinder: {
	// 	options: {
	// 		onInit: (editor) => {
	// 			console.log('editor', editor);
	// 			// The editor instance
	// 		},
	// 	},
	// },
	// wproofreader: {
	// 	serviceId: 'your-service-ID',
	// 	srcUrl: 'https://svc.webspellchecker.net/spellcheck31/wscbundle/wscbundle.js',
	// },
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en',
	mediaLibrary: {
		onClick: ( editor, media ) => {
			// eslint-disable-next-line no-undef
			console.log( 'media', media );
			// editor.execute('insertImage', { source: media.url });
		}
	}
};

const toolbar = {
	items: [
		'heading',
		'|',
		'bold',
		'italic',
		'underline',
		'strikethrough',
		'code',
		'subscript',
		'superscript',
		'removeFormat',
		'|',
		'undo',
		'redo',
		'|',
		'specialCharacters',
		'horizontalLine',
		'pageBreak',
		'|',
		'highlight',
		'fontSize',
		'fontColor',
		'fontBackgroundColor',
		'fontFamily',
		'|',
		'link',
		'blockQuote',
		'insertTable',
		'mediaLibrary',
		'uploadImage',
		'insertImage',
		'mediaEmbed',
		'codeBlock',
		'htmlEmbed',
		'|',
		'bulletedList',
		'numberedList',
		'|',
		'outdent',
		'indent',
		'alignment',
		'|',
		'exportPdf',
		'exportWord',
		'importWord',
		// 'wproofreader',
		'findAndReplace',
		'selectAll',
		'|',
		'sourceEditing'
	]
	// shouldNotGroupWhenFull: true,
};
const blockToolbar = [
	'heading',
	'|',
	'bulletedList',
	'numberedList',
	'|',
	'indent',
	'outdent',
	'|',
	'imageUpload',
	'mediaLibrary',
	'blockQuote',
	'insertTable',
	'mediaEmbed',
	'|',
	'specialCharacters',
	'htmlEmbed'
];

ClassicEditor.builtinPlugins = builtinPlugins;
ClassicEditor.defaultConfig = { ...defaultConfig, toolbar };

BalloonEditor.builtinPlugins = [ ...builtinPlugins, BlockToolbar ];
BalloonEditor.defaultConfig = { ...defaultConfig, blockToolbar };

DecoupledEditor.builtinPlugins = [ ...builtinPlugins ];
DecoupledEditor.defaultConfig = { ...defaultConfig, toolbar };

InlineEditor.builtinPlugins = [ ...builtinPlugins ];
InlineEditor.defaultConfig = { ...defaultConfig, toolbar };

const editor = {
	ClassicEditor,
	BalloonEditor,
	DecoupledEditor,
	InlineEditor
};

export default editor;
