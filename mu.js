Tone = (function() {
    const notes = ["C", ["C#", "Db"], "D", ["D#", "Eb"], "E", "F", ["F#", "Gb"], "G", ["G#", "Ab"], "A", ["A#", "Bb"], "B"];
    const translation = {
        pt: {
            "C":"Dó", "C#":"Dó Sustenido",
            "D":"Ré", "D#":"Ré Sustenido",
            "E":"Mi", "F":"Fá", "F#":"Fá Sustenido",
            "G":"Sol", "G#":"Sol Sustenido",
            "A":"Lá", "A#":"Lá Sustenido",
            "B":"Si",
        }
    }
        
    function Tone() {
        this.currentPosition = 0;
        var mode = "sharp";
        
        this.setMode = function(modeParam) { mode = modeParam; return this; }
        this.getMode = () => mode; 

        this.getTone = function() { 
            return getAdaptedTone(notes[this.currentPosition], mode);
        }
        this.setTone = function(tone) {
            this.currentPosition = this.findTonePosition(tone);
            return this;
        }

        this.targetLanguage = 'pt';
        this.getTranslatedTone = () => translation[this.targetLanguage][this.getTone(mode)];
        

        this.upSemitone = (semitones = 1) => {
            let finalPosition = this.normalize(this.currentPosition + semitones);
            this.currentPosition = finalPosition;
			return this;   
        }

        this.downSemitone = (semitones = 1) => {
            let finalPosition = this.normalize(this.currentPosition - semitones);
            this.currentPosition = finalPosition;
			return this;   
        }

        this.upTone = (tones = 1) => {
           return this.upSemitone(tones * 2);
        }

        this.downTone = (tones = 1) => {    
            return this.downSemitone(tones * 2);
        }

        this.hasAccident = function() {
            return hasAccident(notes[this.currentPosition]);
        }
    }

    function hasAccident(toneOrArrTone) {
        return (toneOrArrTone instanceof Array);
    }

    function extractFlat(toneOrArrTone) {
        return hasAccident(toneOrArrTone) ? toneOrArrTone[1] : toneOrArrTone;
    }

    function extractSharp(toneOrArrTone) {
        return hasAccident(toneOrArrTone) ? toneOrArrTone[0] : toneOrArrTone;
    }

    function isToneEqual(toneOrArrTone, searchingTone) {
        if(hasAccident(toneOrArrTone)) {
            return toneOrArrTone.includes(searchingTone);
        } else {
            return toneOrArrTone === searchingTone;
        }
    }

    Tone.getAllTones = (mode = "sharp") => notes.map(tone => getAdaptedTone(tone, mode));

    Tone.prototype.findTonePosition = (searchingTone) => {
       return notes.findIndex((note) => isToneEqual(note, searchingTone));
    }

    Tone.prototype.normalize = (value) => {
        var maximum = notes.length;
        var timesBigger = Math.floor(value/maximum);
        return value - timesBigger * maximum;
    }

    function getAdaptedTone(toneOrArrTone, mode) {
        if(mode == "flat")
            return extractFlat(toneOrArrTone);
        else if(mode == "sharp")
            return extractSharp(toneOrArrTone);
    }

    return Tone;
})();

Scale = (function() {
	function Scale(startTone) {
		let formation = [];
		let tones = [];
		this.initialTone = new Tone().setTone(startTone);

		const getTonesFromFormation = (function (formation) {
			let toneScale = [];        
			let currentTone = this.initialTone;
			formation.forEach( (interval) => {
				toneScale.push( new Tone().setTone(currentTone.getTone())  );
				currentTone.upSemitone(interval);
			});

			return toneScale;
		}).bind(this);

		this.setFormation = function(formationArg) {
			formation = formationArg;
			tones = getTonesFromFormation(formationArg);
			return this;
		}
		this.getFormation = () => formation;

		this.getTones = () => tones;

		this.getPlainTones = () => tones.map(tone => tone.getTone());
	}
	
	return Scale;
})();


ToneSorter = (function() {
	function ToneSorter() {
		const self = this;

		self.tone = null;
		self.nextTone = null;
		self.nextInterval = null;
		self.nextMoveIsForward = null;

		self.accidentalsAllowed = false;

		self.isAccidentalsAllow = (allow) => accidentalsAllowed = allow; this;

		let maxInterval = 1;
		let minInterval = 1;

		self.setMaxInterval = (number) => maxInterval = number; this;
		self.setMinInterval = (number) => minInterval = number; this;

		function getRandomInt(min, max) {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		function sortCurrentTone() {
			let tones = Tone.getAllTones();
			let nextTonePosition = getRandomInt(0, tones.length - 1);

			self.tone = new Tone().setTone(tones[nextTonePosition]);
		}

		function sortNextTone() {
			self.nextMoveIsForward = Boolean(getRandomInt(0,1));
			self.nextInterval = getRandomInt(minInterval, maxInterval);

			self.nextTone = new Tone().setTone(self.tone.getTone());

			if(self.nextMoveIsForward) {
				self.nextTone.upSemitone(self.nextInterval);
			} else {
				self.nextTone.downSemitone(self.nextInterval);
			}

			if(!self.accidentalsAllowed && self.nextTone.hasAccident()) {
				if(self.nextMoveIsForward) {
					self.nextTone.upSemitone(1);
				} else {
					self.nextTone.downSemitone(1);
				}
			}
		}


		self.sort = function() {
			sortCurrentTone();
			sortNextTone();

			return self;
		}

		self.isNextTone = function(tryingNextTone) {
			return String(tryingNextTone) === String(self.nextTone.getTone()); 
		}

		self.sort();
	}
	return ToneSorter;
})();
