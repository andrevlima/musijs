function Scale(startTone, formation) {
    let toneScale = [];
    let initialTone = new Tone().setTone(startTone);
    
    let lastTone = initialTone;
    formation.forEach( (interval) => {
        toneScale.push( lastTone.getTone() );
        lastTone.upSemitone(interval);
    });

    return toneScale;
}

function VM() {
    this.notes = Tone.getNotes();
    this.tone = ko.observable();
    this.scale = ko.computed(function() {
        return new Scale(this.tone(), [2,2,1,2,2,2,1]);    
    }, this);
    
}

viewModel = new VM();

ko.applyBindings(viewModel, document.body);