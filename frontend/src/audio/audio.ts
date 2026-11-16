
const ok = new Howl({
    src: [`${import.meta.env.BASE_URL}assets/audio/sfx/next.ogg`],
    volume: 0.1,
});


export const AUDIO = {
    se: {
        ok: ok,
    }
};
