!(function (e) {
	const i = (e.af = e.af || {});
	(i.dictionary = Object.assign(i.dictionary || {}, {
		'%0 of %1': '%0 van %1',
		'Block quote': 'Verwysingsaanhaling',
		Bold: 'Vet',
		Cancel: 'Kanselleer',
		'Cannot upload file:': 'Lêer nie opgelaai nie:',
		'Could not insert image at the current position.':
			'Beeld kan nie in die posisie toegevoeg word nie.',
		'Could not obtain resized image URL.':
			'Kon nie die beeld URL vir die aanpassing kry nie.',
		'Insert image or file': 'Voeg beeld of lêer in',
		'Inserting image failed': 'Beeld kan nie toegevoeg word nie',
		Italic: 'Kursief',
		'Rich Text Editor. Editing area: %0': '',
		Save: 'Stoor',
		'Selecting resized image failed':
			'Kon nie die beeld se grootte verander nie',
		'Show more items': 'Wys meer items'
	})),
		(i.getPluralForm = function (e) {
			return 1 != e;
		});
})(window.CKEDITOR_TRANSLATIONS || (window.CKEDITOR_TRANSLATIONS = {}));
