
//Initialize
var log = function() {
	console.log.apply(console,arguments);
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
	spotifyUI.style.opacity = 0;
	_core.contextPlayer._events.play.push(render);

	var link = document.createElement('link');
	link.setAttribute('href','http://fonts.googleapis.com/css?family=Raleway:400,800');
	link.setAttribute('rel','stylesheet');
	body.appendChild(link);
	renderTransport();
}

var listening = false;

function render() {
	log('render');
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
	if(!_container) {
		_container = document.createElement('ul')
		_container.className = 'simple-playlist';
		body.appendChild(_container);
	}
	var container = _container;
	container.innerHTML = '';
	list.forEach(function(song, i) {
		var songEl = renderSong(song,i);
		container.appendChild(songEl);
	
		if(songEl.className.indexOf('active') > -1) {
			//Scroll if necessary.
			//I think this is broken
			if(container.scrollTop > songEl.offsetTop || container.scrollTop + container.offsetHeight < (songEl.offsetTop + songEl.offsetHeight)) {
				scrollTop = songEl.offsetTop;
			}
		}
		//Put it back where you found it.
		container.scrollTop = scrollTop;
	});
}



function curtail(text,length) {
	length = length || 15;
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
	next.innerHTML = 'NEXT';
	next.addEventListener('click', _core.contextPlayer.next.bind(_core.contextPlayer));
	nextButton = next;
	var prev = document.createElement('div');
	prev.innerHTML = 'PREV.';
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
	


