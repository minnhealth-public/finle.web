CKEDITOR.plugins.add( 'formmodplugin', {
    icons: 'formmodplugin',
    init: function( editor ) {}
});

CKEDITOR.on( "dialogDefinition", function( ev ) {
    var dialogName = ev.data.name;
    var dialogDefinition = ev.data.definition;
    if ( ["textarea", "checkbox", "radio", "textfield", "select"].includes(dialogName)) {
        findReplaceRequire(dialogDefinition.getContents("info").elements)
        dialogDefinition.getContents('info').elements.splice(1, 0, getDescriptionElement(dialogName))
        dialogDefinition.getContents('info').elements.splice(0, 0, getIdElement(dialogName))
    }
});

function getIdElement(dialogName) {
    const descriptionInput = {
        id: "id",
        type: "text",
        label: "Id",
        "default": "",
        accessKey: "I",
        setup: function(a, b) {
            let domElement = a;
            if (a == "option") return
            if (a == "clear"){
                this.setValue(this["default"] || "")
                return
            }
            if(a == "select"){domElement = b}

            if(domElement.$){
                this.setValue(domElement.$.id)

            } else if(a.element){
                this.setValue(domElement.element.$.id)
            }
        },
        commit: function(a) {
            if(a.$){
                this.getValue() ? (a.$.id = this.getValue()) : (delete a.$.id)
            }else if(a.element){
                this.getValue() ? (a.element.$.id = this.getValue()) : (delete a.element.$.id)
            }
        }
    }

    if(dialogName === "select"){
        descriptionInput.widths = ["25%", "75%"];
        descriptionInput.labelLayout = "horizontal";
        descriptionInput.style = "width:350px";
    }
    return descriptionInput;
}



function getDescriptionElement(dialogName) {
    const descriptionInput = {
        id: "description",
        type: "text",
        label: "Description",
        "default": "",
        accessKey: "D",
        setup: function(a, b) {
            let domElement = a;
            if (a == "option") return
            if (a == "clear"){
                this.setValue(this["default"] || "")
                return
            }
            if(a == "select"){domElement = b}
            console.log(domElement)

            if(domElement.$){
                this.setValue(domElement.$.dataset.description)
            } else if(a.element){
                this.setValue(domElement.element.$.dataset.description)
            }
        },
        commit: function(a) {
            if(a.$){
                this.getValue() ?
                    (a.$.dataset.description = this.getValue()) :
                    (delete a.$.dataset.description)
            }else if(a.element){
                this.getValue() ?
                    (a.element.$.dataset.description = this.getValue()) :
                    (delete a.element.$.dataset.description)
            }
        }
    }

    if(dialogName === "select"){
        descriptionInput.widths = ["25%", "75%"];
        descriptionInput.labelLayout = "horizontal";
        descriptionInput.style = "width:350px";
    }
    return descriptionInput;
}

function findReplaceRequire(elements) {
    elements.forEach((element) => {
        if (element.children)
            findReplaceRequire(element.children)

        if (element.id === "required"){
            element.setup = function(a, b) {
                let domElement = a
                if (a == "option") return
                if(a == "clear") {
                    this.setValue(false)
                    return
                }
                if(a == "select"){domElement = b}

                this.setValue(domElement.$.dataset.required)
            }
            element.commit = function(a) {
                if(a.$){
                    this.getValue() ? a.$.dataset.required = true : delete a.$.dataset.required
                }else if(a.element){
                    this.getValue() ? a.element.$.dataset.required = true : delete a.element.$.dataset.required
                }
            }
        }
    })
}
