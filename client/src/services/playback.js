export const PlaybackService = {
    audio: null,
    playing: false,
    song: null,

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

    setAudio(audioRef) {
        this.audio = audioRef
    },

    checkAudio() {
        if (!this.audio) {
            throw new Error('set the audio first!')
        }
    },

    setSong(song) {
        this.checkAudio()
        if (!this.song && song) {
            this.showPlayer()
        }
        this.song = song
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
    }
}