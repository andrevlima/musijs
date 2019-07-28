function VM() {
    this.allTones = Tone.getAllTones();
    this.tone = ko.observable('C');
    this.scale = ko.computed(function() {
        return new Scale(this.tone()).setFormation([2,2,1,2,2,2,1]).getPlainTones();    
    }, this);
    
}

viewModel = new VM();

ko.applyBindings(viewModel, document.body);