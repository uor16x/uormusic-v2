export const PlaybackService = {
    audio: null,
    playing: false,
    song: null,
    playlist: null,

    showPlayerCallbacks: [],
    subscribeShowPlayer(fn) {
        this.showPlayerCallbacks.push(fn);
    },
    showPlayer() {
        this.showPlayerCallbacks.forEach(fn => fn());
    },

    playbackCallbacks: [],
    subscribePlayback(fn) {
        this.playbackCallbacks.push(fn);
    },
    playbackAction() {
        this.playbackCallbacks.forEach(fn => fn());
    },

    nextSongCallbacks: [],
    subscribeNextSong(fn) {
        this.nextSongCallbacks.push(fn);
    },
    nextSongPublish(id) {
        this.nextSongCallbacks.forEach(fn => fn(id));
    },


    setAudio(audioRef) {
        this.audio = audioRef
    },

    checkAudio() {
        if (!this.audio) {
            throw new Error('set the audio first!')
        }
    },

    setSong(song, playlist) {
        this.checkAudio()
        if (!this.song && song) {
            this.showPlayer()
        }
        this.song = song
        this.playlist = playlist
        this.audio.src = this.song.url
    },

    play() {
        this.checkAudio()
        if (!this.playing) {
            this.audio.play();
            this.playing = true
        }
        this.playbackAction()
    },

    pause() {
        this.checkAudio()
        if (this.playing) {
            this.audio.pause();
            this.playing = false
        }
        this.playbackAction()
    },

    next() {
        this.checkAudio()
        if (!this.playlist || !this.song) return
        this.pause()
        const currentSongIndex = this.playlist.songs
            .findIndex(songId => songId === this.song._id)
        const newIndex = currentSongIndex === this.playlist.songs.length - 1
            ? 0
            : currentSongIndex + 1
        this.nextSongPublish(this.playlist.songs[newIndex])
    }
}