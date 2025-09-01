// JavaScript for NeoWave Music Player

const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const progressBar = document.getElementById('progress-bar');
const volumeSlider = document.getElementById('volume-slider');
const songTitle = document.getElementById('song-title');
const artist = document.getElementById('artist');
const songListElement = document.getElementById('song-list');

let playlist = [
    { title: "Kesariya", artist: "Arijit Singh", file: "song.mp3" },
    { title: "Perfect", artist: "Ed Sheeran", file: "song1.mp3" },
    { title: "Ae Dil Hai Mushkil", artist: "Arijit Singh", file: "Ae_Dil_Hai_Mushkil.mp3" },
    { title: "Hua Main (Animal)", artist: "Raghav Chaitanya", file: "Hua_Main_(Animal).mp3" },
    { title: "Aaya Re Toofan", artist: "A. R. Rahman, Vaishali Samant, Irshad Kamil", file: "Aaya_Re_Toofan_Chhaava.mp3" }
];

let currentIndex = 0;
let isPlaying = false;

function loadSong(index) {
  const song = playlist[index];
  audio.src = song.file;
  songTitle.textContent = song.title;
  artist.textContent = song.artist;
  highlightActiveSong();
}

function playPause() {
  if (audio.paused) {
    audio.play();
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  } else {
    audio.pause();
    isPlaying = false;
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

function nextSong() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex);
  if (isPlaying) audio.play();
}

function prevSong() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentIndex);
  if (isPlaying) audio.play();
}

audio.addEventListener('timeupdate', () => {
  if (!isNaN(audio.duration)) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }
});

function seekSong() {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
}

function setVolume() {
  audio.volume = volumeSlider.value;
}

audio.addEventListener('ended', nextSong);

function handleUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    const customSong = {
      title: file.name.split('.')[0],
      artist: 'You',
      file: url
    };
    playlist.push(customSong);
    updatePlaylist();
    currentIndex = playlist.length - 1;
    loadSong(currentIndex);
    if (isPlaying) audio.play();
  }
}

function updatePlaylist() {
  songListElement.innerHTML = '';
  playlist.forEach((song, index) => {
    const li = document.createElement('li');
    li.textContent = song.title + ' - ' + song.artist;
    li.onclick = () => {
      currentIndex = index;
      loadSong(index);
      audio.play();
      isPlaying = true;
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    };
    songListElement.appendChild(li);
  });
  highlightActiveSong();
}

function highlightActiveSong() {
  const items = songListElement.querySelectorAll('li');
  items.forEach((item, index) => {
    item.style.backgroundColor = index === currentIndex ? 'rgba(168, 255, 191, 0.2)' : 'transparent';
  });
}

function shufflePlaylist() {
  for (let i = playlist.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [playlist[i], playlist[j]] = [playlist[j], playlist[i]];
  }
  updatePlaylist();
  currentIndex = 0;
  loadSong(currentIndex);
  if (isPlaying) audio.play();
}

// Initial load
window.onload = () => {
  loadSong(currentIndex);
  updatePlaylist();
  audio.volume = volumeSlider.value;
};