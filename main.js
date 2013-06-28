
//Initialize
var log = function() {
//	console.log.apply(console,arguments);
};

var img, _container = false, transport, nextButton, spaceButton, prevButton;

var spotifyUI = $("wrapper");
var body = document.getElementsByTagName('body')[0];

init();
render();

var _on = true;

function hide() {
	img.style.display = 'none';
	_container.style.display = 'none';
	transport.style.display = 'none';
	spotifyUI.style.opacity = 1;
	_on = false;
}

function show() {
	img.style.display = 'block';
	_container.style.display = 'block';
	transport.style.display = 'block';
	spotifyUI.style.opacity = 0;
	_on = true;
}

function toggle() {
	if(_on) {
		hide();
		_on = false;
	} else {
		show();
		_on = true;
	}
}

//grab current cover
function init() {
	img = document.createElement('img');
	img.setAttribute('id','cover');
	body.appendChild(img);

	_container = document.createElement('ul')
	_container.className = 'simple-playlist';
	body.appendChild(_container);


	spotifyUI.style.opacity = 0;
	_core.contextPlayer._events.play.push(render);

	var link = document.createElement('link');
	link.setAttribute('href','https://fonts.googleapis.com/css?family=Raleway:400,800');
	link.setAttribute('rel','stylesheet');
	link.setAttribute('media','all');
	link.setAttribute('type','text/css');
	document.getElementsByTagName('head')[0].appendChild(link);
	renderTransport();
}

var listening = false;

function render() {
	log('render');
	_container.style.cursor = 'default';
	img.src = _core.contextPlayer._currentTrack.image;
	loadPlaylist().then(renderPlaylist);
}


function loadPlaylist() {
	log('loadPlaylist');
	var list = _core.contextPlayer._currentContext.getList();
	var songList = [];	
	var _then;
	setTimeout(function() {
	list.forEach(function(trackURI, i) {
		_core.metadata.lookup(trackURI, function(song) {
			songList[i] = song;
			if(songList.length === list.length) {
				if(typeof _then === 'function') {
					_then();	
				}
			}
		});
	});
	},1);
	return {
		then: function(fn) {
			_then = function() {
				fn.call(this,songList);
			};
		}
	}
}

var scrollTop = 0;

function renderPlaylist(list) {
	log('renderPlaylist',list);
	var container = _container;
	container.innerHTML = '';
	list.forEach(function(song, i) {
		var songEl = renderSong(song,i);
		container.appendChild(songEl);
		var shift = false;	
		if(songEl.className.indexOf('active') > -1) {
			if( 
				//container is scrolled past the top of the el
				container.scrollTop > songEl.offsetTop 
			) {
				shift = true;
				scrollTop = songEl.offsetTop;
				log('setting top:',scrollTop);
			} else if(
				//bottom of div is above the bottom of the el
				container.scrollTop + container.offsetHeight < songEl.offsetTop + songEl.offsetHeight
			) {
				scrollTop = songEl.offsetTop + songEl.offsetHeight - container.offsetHeight;
				log('setting top:',scrollTop);
			}
			//Place the scroll
			container.scrollTop = scrollTop;
		}
	});
}



function curtail(text,length) {
	length = length || 45;
	if(text.length > length) return text.substring(0,7) + '...'
	return text;
}

function renderSong(song,i) {
	log('renderSong',song);
	var li = document.createElement('li');
	li.innerHTML = curtail(song.artist[0].name.toUpperCase()) + ' - ' + curtail(song.name);
	//Grab active
	if(_core.contextPlayer._currentTrack.__pid === song.playableId) {
		li.className = 'active';
	}
	function playMe() {
		var me = getSongByIndex(i);
		playSong(me);	
		li.className = li.className + ' queued';
		_container.style.cursor = 'wait';
	}
	li.addEventListener('click', playMe);
	li.addEventListener('touchstart', playMe);
	return li;
}

function renderTransport() {
	transport = document.createElement('div');
	transport.className = 'transport';
	body.appendChild(transport);
	var space = document.createElement('div');
	space.className = 'space';
	space.innerHTML = 'PLAY [space]';
	space.addEventListener('click', _core.contextPlayer.togglePlay.bind(_core.contextPlayer));
	spaceButton = space;
	var next = document.createElement('div');
	next.className = 'next';
	next.innerHTML = 'NEXT [ALT]';
	next.addEventListener('click', _core.contextPlayer.next.bind(_core.contextPlayer));
	nextButton = next;
	var prev = document.createElement('div');
	prev.innerHTML = 'PREV. [ALT]';
	prev.className = 'prev';
	prev.addEventListener('click', _core.contextPlayer.previous.bind(_core.contextPlayer));
	prevButton = prev;
	transport.appendChild(prev);
	transport.appendChild(space);
	transport.appendChild(next);
}

function previous() {
	_core.contextPlayer.previous();
	
	//Acitve on button
	prevButton.className = prevButton.className + ' active';
	setTimeout(function() {
		prevButton.className = prevButton.className.replace(/active/g,'');
	},200);
}

function next() {
	_core.contextPlayer.next();

	//Active on button
	nextButton.className = prevButton.className + ' active';
	setTimeout(function() {
		nextButton.className = prevButton.className.replace(/active/g,'');
	},200);
}


key('escape', hide);
//key('escape', hide);

document.addEventListener('keydown', function(e) {
	if(!_on) return;
	//Alt
	if(e.keyCode === 18) {
		if(e.keyLocation===1) return previous(); //left, on macbook at least
		return next();
	}
});

function getSongByIndex(index) {
	//going up or down?
	var curIndex = _core.contextPlayer._currentContext.getIndex();
	var song;
	var tries = 0;
	while(_core.contextPlayer._currentContext.getIndex() !== index) {
		song = _core.contextPlayer._currentContext[index > curIndex ? 'next' : 'previous']();
		tries++;
		if(tries > 100) return false;
	}
	return song;
}
	
function playSong(song) {
	var songItem = song.item;
	var songMetaData = song.metadata;
	var context = _core.contextPlayer._currentContext;
	songMetaData.uri = songItem;
	songItem = Spotify.Link.trackLink(songMetaData.__pid).toURI();
	song = "trackdone";
	_core.contextPlayer._attemptPlay(song,
	songItem, songMetaData, context);
}
