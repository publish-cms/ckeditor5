/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video/utils
 */

import { first } from 'ckeditor5/src/utils';
import { BalloonPanelView } from 'ckeditor5/src/ui';

/**
 * Creates a view element representing the inline video.
 *
 *		<span class="video-inline"><video></video></span>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createInlineVideoViewElement( writer ) {
	return writer.createContainerElement( 'span', { class: 'video-inline' },
		writer.createEmptyElement( 'video' )
	);
}

/**
 * Creates a view element representing the block video.
 *
 *		<figure class="video"><video></video></figure>
 *
 * Note that `alt` and `src` attributes are converted separately, so they are not included.
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createBlockVideoViewElement( writer ) {
	return writer.createContainerElement( 'figure', { class: 'video' }, [
		writer.createEmptyElement( 'video' ),
		writer.createSlot()
	] );
}

/**
 * A function returning a `MatcherPattern` for a particular type of View videos.
 *
 * @protected
 * @param {module:core/editor/editor~Editor} editor
 * @param {'videoBlock'|'videoInline'} matchVideoType The type of created video.
 * @returns {module:engine/view/matcher~MatcherPattern}
 */
export function getVideoViewElementMatcher( editor, matchVideoType ) {
	const videoUtils = editor.plugins.get( 'VideoUtils' );
	const areBothVideoPluginsLoaded = editor.plugins.has( 'VideoInlineEditing' ) && editor.plugins.has( 'VideoBlockEditing' );

	return element => {
		// Check if the matched view element is an <video>.
		if ( !videoUtils.isInlineVideoView( element ) ) {
			return null;
		}

		// If just one of the plugins is loaded (block or inline), it will match all kinds of videos.
		if ( !areBothVideoPluginsLoaded ) {
			return getPositiveMatchPattern( element );
		}

		// The <video> can be standalone, wrapped in <figure>...</figure> (VideoBlock plugin) or
		// wrapped in <figure><a>...</a></figure> (LinkVideo plugin).
		const videoType = element.getStyle( 'display' ) == 'block' || element.findAncestor( videoUtils.isBlockVideoView ) ?
			'videoBlock' :
			'videoInline';

		if ( videoType !== matchVideoType ) {
			return null;
		}

		return getPositiveMatchPattern( element );
	};

	function getPositiveMatchPattern( element ) {
		const pattern = {
			name: true
		};

		// This will trigger src consumption (See https://github.com/ckeditor/ckeditor5/issues/11530).
		if ( element.hasAttribute( 'src' ) ) {
			pattern.attributes = [ 'src' ];
		}

		return pattern;
	}
}

/**
 * Considering the current model selection, it returns the name of the model video element
 * (`'videoBlock'` or `'videoInline'`) that will make most sense from the UX perspective if a new
 * video was inserted (also: uploaded, dropped, pasted) at that selection.
 *
 * The assumption is that inserting videos into empty blocks or on other block widgets should
 * produce block videos. Inline videos should be inserted in other cases, e.g. in paragraphs
 * that already contain some text.
 *
 * @protected
 * @param {module:engine/model/schema~Schema} schema
 * @param {module:engine/model/selection~Selection|module:engine/model/documentselection~DocumentSelection} selection
 * @returns {'videoBlock'|'videoInline'}
 */
export function determineVideoTypeForInsertionAtSelection( schema, selection ) {
	const firstBlock = first( selection.getSelectedBlocks() );

	// Insert a block video if the selection is not in/on block elements or it's on a block widget.
	if ( !firstBlock || schema.isObject( firstBlock ) ) {
		return 'videoBlock';
	}

	// A block video should also be inserted into an empty block element
	// (that is not an empty list item so the list won't get split).
	if ( firstBlock.isEmpty && firstBlock.name != 'listItem' ) {
		return 'videoBlock';
	}

	// Otherwise insert an inline video.
	return 'videoInline';
}

/**
 * A helper utility that positions the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} instance
 * with respect to the video in the editor content, if one is selected.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export function repositionContextualBalloon( editor ) {
	const balloon = editor.plugins.get( 'ContextualBalloon' );

	if ( editor.plugins.get( 'VideoUtils' ).getClosestSelectedVideoWidget( editor.editing.view.document.selection ) ) {
		const position = getBalloonPositionData( editor );

		balloon.updatePosition( position );
	}
}

/**
 * Returns the positioning options that control the geometry of the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon} with respect
 * to the selected element in the editor content.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 * @returns {module:utils/dom/position~Options}
 */
export function getBalloonPositionData( editor ) {
	const editingView = editor.editing.view;
	const defaultPositions = BalloonPanelView.defaultPositions;
	const videoUtils = editor.plugins.get( 'VideoUtils' );

	return {
		target: editingView.domConverter.mapViewToDom( videoUtils.getClosestSelectedVideoWidget( editingView.document.selection ) ),
		positions: [
			defaultPositions.northArrowSouth,
			defaultPositions.northArrowSouthWest,
			defaultPositions.northArrowSouthEast,
			defaultPositions.southArrowNorth,
			defaultPositions.southArrowNorthWest,
			defaultPositions.southArrowNorthEast,
			defaultPositions.viewportStickyNorth
		]
	};
}
