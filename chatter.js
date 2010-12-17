pInput = new Element('div', { id: 'pPanel', 'class': 'chatter pInput' }).adopt([
	pDisplay = new Element('div', { 'class': 'pDisplay', text: '' }),
	tInput = new Element('input', { 'type': 'text', 'class': 'tInput' }),
	pLoader = new Element('div', { 'id': 'spinner', 'class':'pLoader' })
]);
document.id(document.body).grab(pInput, 'top');

// attach an event to the translation input to query for translation when succession of keypress's stop
new ScannerKeystrokeObserver({
		element: tInput, delay: 800,
		onRead: function(v) {
			pLoader.setStyle('visibility', 'visible');
			chrome.extension.sendRequest({ service: "translateout", text: tInput.get('value') }, function(response) {
				pDisplay.set('text', response.translation);
				pLoader.setStyle('visibility', 'hidden');
			});		
		}
});

// update any currently open chat console if the enter key is pressed in the translation box
tInput.addEvent('keypress', function(v) {
	if (v.key == 'enter') {
		var ta = $$('#fbDockChatTabs .fbDockChatTab.openToggler .inputContainer .input');
		if (ta.length > 0) {
			ta[0].set('value', pDisplay.get('text'));
			ta[0].focus();
			tInput.set('value', '');
			pDisplay.set('text', '');
		}
	}
});

var chatterDone = [];
function translate(c) {
	if (!chatterDone.contains(c)) {
		var t = c.get("text");
		chatterDone.push(c);
		chrome.extension.sendRequest({ service: "translatein", text: t }, function(response) {
			c.grab(new Element('div', { 'class': 'chatter', text: response.translation }));
		});		
	}
}

function updateConversation() {
	$try(function(){
		$('fbDockChatTabs').getChildren().each(function(e) {
			e.getElements('.fbDockChatTabFlyout .conversation .fbChatMessage').each(translate);
		});
	});
	setTimeout(updateConversation, 500);
}
updateConversation();


