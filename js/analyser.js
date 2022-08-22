SP.Analyser = function(game) {
    this.game = game;

    var ac = this.ac = this.getAudioContext();
    this.analyserNode = ac.createAnalyser();

    this.analyserInput = ac.createGainNode();

    var lp = ac.createBiquadFilter();
    var hp = ac.createBiquadFilter();


    lp.type = lp.LOWPASS;
    hp.type = hp.HIGHPASS;
    
    lp.frequency.value = 2000;
    hp.frequency.value = 100;
    lp.connect(hp);

    hp.connect(this.analyserNode);
    this.analyserInput.connect(lp);
    this.iterations = 5;
    
    this.freqData = new Uint8Array(this.analyserNode.frequencyBinCount);
    
    navigator.getUserMedia({audio: true},
                           this.initializeMicrophone.bind(this),
                           function(err) { console.log(err); });

};


SP.Analyser.prototype.getAudioContext = function () {
    var vendors = ['', 'ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && (!window.AudioContext || !navigator.getUserMedia); ++x) {
        window.AudioContext = window[vendors[x]+'AudioContext'];
        navigator.getUserMedia = navigator[vendors[x]+'GetUserMedia'];
    }
    if (!window.AudioContext || !navigator.getUserMedia) {
        alert('UNFORTUNATELY THIS APPlICATION REQUIRES THE LATEST BUILD OF CHROME WITH "Web Audio Input" ENABLED IN chrome://flags.');
    } else {
        return new AudioContext();
    }
};

SP.Analyser.prototype.getHPSpectrum = function () {
    this.analyserNode.getByteFrequencyData(this.freqData);
    var n = this.freqData.length;

    var m = Math.floor(n/this.iterations);

    var plotData = new Array(n);
    var accumulator = new Array(m);

    
    for (var j = 0; j < m; j++) {
        accumulator[j] = 1 + j/10;
    }

    for (var i = 1; i < this.iterations; i++) {
        for (var j = 0; j < m; j++) {
            accumulator[j] *= this.freqData[j*i] / 50;
        }
    }
    return accumulator;
}


SP.Analyser.prototype.getAction = function(spectrum) {

    var m = spectrum.length;

    var max = 0;
    var avg = 0;
    for (var j = 0; j < m; j++) {
        var v = spectrum[j];
        avg += v;
        if (spectrum[j] > spectrum[max]) {
            max = j;
        }
    }
    avg /= m;
    

    if (spectrum[max] - avg > 50 && spectrum[max] > 100) {
        if (max > 10) {
	    return 'up';
        } else {
            return 'down';
        }
    } else {
        return 'stop';
    }
}


SP.Analyser.prototype.initializeMicrophone = function (stream) {
    this.mediaSource = this.ac.createMediaStreamSource(stream);
    this.mediaSource.connect(this.analyserInput);
    requestAnimationFrame(this.mainLoop.bind(this));
}


SP.Analyser.prototype.mainLoop = function () {
    var spectrum = this.getHPSpectrum();
    var action = this.getAction(spectrum);
    var game = this.game;
    game.updateFrequencySpectrum(spectrum.slice(0,spectrum.length/8));
    switch (action) {
    case 'up':
        game.moveUp();
        break;
    case 'down':
        game.moveDown();
        break;
    default:
        game.stop();
    }
    
    requestAnimationFrame(this.mainLoop.bind(this));
}





