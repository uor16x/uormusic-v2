export const PlaybackService = {
    audio: null,
    playing: false,

    setAudio(audioRef) {
        this.audio = audioRef
    },

    checkAudio() {
        if (!this.audio) {
            throw new Error('set the audio first!')
        }
    },

    setSrc(src) {
        this.checkAudio()
        this.audio.src = src
    },

    play() {
        this.checkAudio()
        if (!this.playing) {
            this.audio.play();
            this.playing = true
        }
    },

    pause() {
        this.checkAudio()
        if (this.playing) {
            this.audio.pause();
            this.playing = false
        }
    }
}