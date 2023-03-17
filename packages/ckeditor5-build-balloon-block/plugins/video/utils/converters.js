/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module video/video/converters
 */

import { first } from 'ckeditor5/src/utils';

/**
 * Returns a function that converts the video view representation:
 *
 *		<figure class="video"><video src="..." alt="..."></video></figure>
 *
 * to the model representation:
 *
 *		<videoBlock src="..." alt="..."></videoBlock>
 *
 * The entire content of the `<figure>` element except the first `<video>` is being converted as children
 * of the `<videoBlock>` model element.
 *
 * @protected
 * @param {module:video/videoutils~VideoUtils} videoUtils
 * @returns {Function}
 */
export function upcastVideoFigure( videoUtils ) {
	return dispatcher => {
		dispatcher.on( 'element:figure', converter );
	};

	function converter( evt, data, conversionApi ) {
		// Do not convert if this is not an "video figure".
		if ( !conversionApi.consumable.test( data.viewItem, { name: true, classes: 'video' } ) ) {
			return;
		}

		// Find an video element inside the figure element.
		const viewVideo = videoUtils.findViewVideoElement( data.viewItem );

		// Do not convert if video element is absent or was already converted.
		if ( !viewVideo || !conversionApi.consumable.test( viewVideo, { name: true } ) ) {
			return;
		}

		// Consume the figure to prevent other converters from processing it again.
		conversionApi.consumable.consume( data.viewItem, { name: true, classes: 'video' } );

		// Convert view video to model video.
		const conversionResult = conversionApi.convertItem( viewVideo, data.modelCursor );

		// Get video element from conversion result.
		const modelVideo = first( conversionResult.modelRange.getItems() );

		// When video wasn't successfully converted then finish conversion.
		if ( !modelVideo ) {
			// Revert consumed figure so other features can convert it.
			conversionApi.consumable.revert( data.viewItem, { name: true, classes: 'video' } );

			return;
		}

		// Convert rest of the figure element's children as an video children.
		conversionApi.convertChildren( data.viewItem, modelVideo );

		conversionApi.updateConversionResult( modelVideo, data );
	}
}

/**
 * Converts the `source` model attribute to the `<picture><source /><source />...<video /></picture>`
 * view structure.
 *
 * @protected
 * @param {module:video/videoutils~VideoUtils} videoUtils
 * @returns {Function}
 */
export function downcastSourcesAttribute( videoUtils ) {
	return dispatcher => {
		dispatcher.on( 'attribute:sources:videoBlock', converter );
		dispatcher.on( 'attribute:sources:videoInline', converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item );
		const videoElement = videoUtils.findViewVideoElement( element );

		if ( data.attributeNewValue && data.attributeNewValue.length ) {
			// Make sure <picture> does not break attribute elements, for instance <a> in linked videos.
			const pictureElement = viewWriter.createContainerElement( 'picture', null,
				data.attributeNewValue.map( sourceAttributes => {
					return viewWriter.createEmptyElement( 'source', sourceAttributes );
				} )
			);

			// Collect all wrapping attribute elements.
			const attributeElements = [];
			let viewElement = videoElement.parent;

			while ( viewElement && viewElement.is( 'attributeElement' ) ) {
				const parentElement = viewElement.parent;

				viewWriter.unwrap( viewWriter.createRangeOn( videoElement ), viewElement );

				attributeElements.unshift( viewElement );
				viewElement = parentElement;
			}

			// Insert the picture and move video into it.
			viewWriter.insert( viewWriter.createPositionBefore( videoElement ), pictureElement );
			viewWriter.move( viewWriter.createRangeOn( videoElement ), viewWriter.createPositionAt( pictureElement, 'end' ) );

			// Apply collected attribute elements over the new picture element.
			for ( const attributeElement of attributeElements ) {
				viewWriter.wrap( viewWriter.createRangeOn( pictureElement ), attributeElement );
			}
		}
		// Both setting "sources" to an empty array and removing the attribute should unwrap the <video />.
		// Unwrap once if the latter followed the former, though.
		else if ( videoElement.parent.is( 'element', 'picture' ) ) {
			const pictureElement = videoElement.parent;

			viewWriter.move( viewWriter.createRangeOn( videoElement ), viewWriter.createPositionBefore( pictureElement ) );
			viewWriter.remove( pictureElement );
		}
	}
}

/**
 * Converter used to convert a given video attribute from the model to the view.
 *
 * @protected
 * @param {module:video/videoutils~VideoUtils} videoUtils
 * @param {'videoBlock'|'videoInline'} videoType The type of the video.
 * @param {String} attributeKey The name of the attribute to convert.
 * @returns {Function}
 */
export function downcastVideoAttribute( videoUtils, videoType, attributeKey ) {
	return dispatcher => {
		dispatcher.on( `attribute:${ attributeKey }:${ videoType }`, converter );
	};

	function converter( evt, data, conversionApi ) {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const viewWriter = conversionApi.writer;
		const element = conversionApi.mapper.toViewElement( data.item );
		const video = videoUtils.findViewVideoElement( element );

		viewWriter.setAttribute( data.attributeKey, data.attributeNewValue || '', video );
	}
}

