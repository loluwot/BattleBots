import querystring from 'query-string';
import { Lib } from 'lance-gg';
import NClientEngine from '../client/NClientEngine';
import NGameEngine from '../common/NGameEngine';
const qsOptions = querystring.parse(location.search);

// default options, overwritten by query-string options
// is sent to both game engine and client engine
const defaults = {
    traceLevel: Lib.Trace.TRACE_NONE,
    delayInputCount: 5,
    scheduler: 'render-schedule',
    syncOptions: {
        sync: 'interpolate',
        localObjBending: 0.9,
        remoteObjBending: 0.6,
        bendingIncrements: 6
    }
};
let options = Object.assign(defaults, qsOptions);

// create a client engine and a game engine
const gameEngine = new NGameEngine(options);
const clientEngine = new NClientEngine(gameEngine, options);

document.addEventListener('DOMContentLoaded', function(e) { clientEngine.start(); });
