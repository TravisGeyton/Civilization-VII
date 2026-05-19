import { CinematicManager } from '/base-standard/ui/cinematic/cinematic-manager.js';
import { MustGetElement } from '/core/ui/utilities/utilities-dom.js';

const MOD_CSS_PATH = "fs://game/detailed-wonder-cinematic-continued/data/detailed-wonder-cinematic.css";

class DetailedWonderCinematic_WonderCompleteDecorator
{
    constructor(val) {
        this._screen = val;
    }

    beforeAttach() {
    }

    afterAttach() {
        const quoteContainer = MustGetElement('.cinematic-moment_quote-container', this._screen.Root);
        const quoteBox = MustGetElement('.cinematic-moment_quote-box', this._screen.Root);
        let textContainer = document.createElement('div');
        textContainer.classList.add('.cinematic-details-container');


        let descriptionBox = document.createElement('div');
        descriptionBox.classList.add('cinematic-moment_description-box', 'flex', 'flex-col', 'items-center', 'mb-6', 'grow', 'mx-10', 'p-4');

        let descriptionContainer = document.createElement('div');
        descriptionContainer.classList.add('cinematic-moment_description-container', 'relative', 'flex', 'flex-col', 'items-center', 'px-8', 'pb-2');
        descriptionBox.appendChild(descriptionContainer);

        let descriptionText = document.createElement('div');
        descriptionText.classList.add('.cinematic-moment_description-text', 'font-body-base');
        descriptionText.innerHTML = Locale.stylize(this.getWonderDescription());
        descriptionContainer.appendChild(descriptionText);

        // replace the quote box with a container containing the description box and quote box
        quoteContainer.insertBefore(textContainer, quoteBox);
        textContainer.appendChild(descriptionBox);
        textContainer.appendChild(quoteBox);

        // Adjust alignment to account for extra box on the left side
        const flexContainer = MustGetElement('.justify-between', this._screen.Root);
        flexContainer.classList.remove('items-center');
        flexContainer.classList.add('items-end');
    }

    getWonderDescription() {}

    beforeDetach() { }

    afterDetach() { }
}

class DetailedWonderCinematic_NaturalWonderDecorator extends DetailedWonderCinematic_WonderCompleteDecorator
{
    constructor(val)
    {
        super(val);
    }

    getWonderDescription()
    {
        const location = CinematicManager.getCinematicLocation();
        const featureType = GameplayMap.getFeatureType(location.x, location.y);
        const feature = GameInfo.Features.lookup(featureType);
        return feature.Description;
    }
}

class DetailedWonderCinematic_ConstructedWonderDecorator extends DetailedWonderCinematic_WonderCompleteDecorator
{
    constructor(val)
    {
        super(val);
    }

    getWonderDescription()
    {
        const location = CinematicManager.getCinematicLocation();
        // walk the constructibles on the tile and find the wonder to get it's name
        const constructibles = MapConstructibles.getConstructibles(location.x, location.y);
        for (let i = 0; i < constructibles.length; i++) {
            const instance = Constructibles.getByComponentID(constructibles[i]);
            if (instance) {
                const info = GameInfo.Constructibles.lookup(instance.type);
                if (info?.ConstructibleClass == "WONDER") {
                    return info.Description;
                }
            }
        }
    }
}

function addStyleToDefinition(controlName) {
    const def = Controls.getDefinition(controlName);
    if (def) {
        if (!def.styles) {
            def.styles = [];
        }
        def.styles.push(MOD_CSS_PATH);
    } else {
        console.warn(`[Detailed Wonder Cinematic] Definition for '${controlName}' not found. CSS may not load.`);
    }
}

// Natural Wonders
Controls.decorate('screen-natural-wonder-revealed-placard', (val) => new DetailedWonderCinematic_NaturalWonderDecorator(val));
addStyleToDefinition('screen-natural-wonder-revealed-placard');

// Constructed Wonders
Controls.decorate('screen-wonder-complete-placard', (val) => new DetailedWonderCinematic_ConstructedWonderDecorator(val));
addStyleToDefinition('screen-wonder-complete-placard');
