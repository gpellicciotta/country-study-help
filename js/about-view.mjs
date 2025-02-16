import log from './logging.mjs';
import countries from './countries.mjs';

import { EventTargetMixin } from './event-target-mixin.mjs';
import { CountryView } from './country-view.mjs';
import { Quiz } from './quiz.mjs';

/**
 *  The search view.
 */
export class AboutView extends EventTargetMixin(Object) {
  constructor(parentElement, app) {
    super();
    if (parentElement && app) {
      this.attach(parentElement, app);
    }
  }

  attach(parentElement, app) {
    log.debug("Attaching about view to parent element", parentElement);	

    this.app = app;
    this.parent = parentElement; 

    // Model/data elements:

    // Get UI control elements:

    // Get UI display elements:

    // Attach event handlers: 
  }

  activate() {
    this._updateUrl('about', null);  
  }

  deactivate() {

  }

  detach() {
    this.parent.removeChild(this.element);
    this.parent = null;
    this.app = null;
  }

  // Actions: 

  _updateUrl(view) {
    let newUrl = `${window.location.origin}/${view}`
    if (newUrl !== window.location.href) {
      history.pushState({ view: view, state: null }, '', newUrl);
    }
  }

  // Event Handlers:

}