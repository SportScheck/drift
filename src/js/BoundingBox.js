import throwIfMissing from './util/throwIfMissing';
import { addClasses, removeClasses } from './util/dom';

export default class BoundingBox {
  constructor(options) {
    this.isShowing = false;

    let {
      namespace = null,
      zoomFactor = throwIfMissing(),
      containerEl = throwIfMissing(),
      customBoundingBox = null,
      onBoundingBoxInitialized = null,
      onBoundingBoxShow = null
    } = options;

    this.settings = {
      namespace,
      zoomFactor,
      containerEl,
      customBoundingBox,
      onBoundingBoxInitialized,
      onBoundingBoxShow
    };

    this.openClasses = this._buildClasses('open');

    this._buildElement();
  }

  _buildClasses(suffix) {
    let classes = [`drift-${suffix}`];

    let ns = this.settings.namespace;
    if (ns) {
      classes.push(`${ns}-${suffix}`);
    }

    return classes;
  }

  _buildElement() {
    this.el = document.createElement('div');
    addClasses(this.el, this._buildClasses('bounding-box'));

    if (this.settings.customBoundingBox) {
      this.el.innerHTML = this.settings.customBoundingBox;
    }

    if (this.settings.onBoundingBoxInitialized) {
      this.settings.onBoundingBoxInitialized(this.el);
    }
  }

  show(zoomPaneWidth, zoomPaneHeight) {
    this.isShowing = true;

    if (this.settings.containerEl) {
      this.settings.containerEl.appendChild(this.el);
    }

    if (this.settings.onBoundingBoxShow) {
      this.settings.onBoundingBoxShow(this.el);
    }

    let style = this.el.style;
    style.width = `${Math.round(zoomPaneWidth / this.settings.zoomFactor)}px`;
    style.height = `${Math.round(zoomPaneHeight / this.settings.zoomFactor)}px`;

    addClasses(this.el, this.openClasses);
  }

  hide() {
    if (this.isShowing && this.settings.containerEl) {
      this.settings.containerEl.removeChild(this.el);
    }

    this.isShowing = false;

    removeClasses(this.el, this.openClasses);
  }

  setPosition(percentageOffsetX, percentageOffsetY, triggerRect) {
    let inlineLeft, inlineTop;

    const relativePage = triggerRect.rectParent === undefined;

    if (relativePage) {
      let pageXOffset = window.pageXOffset;
      let pageYOffset = window.pageYOffset;

      inlineLeft = triggerRect.rect.left + (percentageOffsetX * triggerRect.rect.width)
        - (this.el.clientWidth / 2) + pageXOffset;
      inlineTop = triggerRect.rect.top + (percentageOffsetY * triggerRect.rect.height)
        - (this.el.clientHeight / 2) + pageYOffset;

      if (inlineLeft < triggerRect.rect.left + pageXOffset) {
        inlineLeft = triggerRect.rect.left + pageXOffset;
      } else if (inlineLeft + this.el.clientWidth > triggerRect.rect.left + triggerRect.rect.width + pageXOffset) {
        inlineLeft = triggerRect.rect.left + triggerRect.rect.width - this.el.clientWidth + pageXOffset;
      }

      if (inlineTop < triggerRect.rect.top + pageYOffset) {
        inlineTop = triggerRect.rect.top + pageYOffset;
      } else if (inlineTop + this.el.clientHeight > triggerRect.rect.top + triggerRect.rect.height + pageYOffset) {
        inlineTop = triggerRect.rect.top + triggerRect.rect.height - this.el.clientHeight + pageYOffset;
      }
    } else {
      let parentXOffset = (triggerRect.rectParent.width - triggerRect.rect.width) / 2;
      let parentYOffset = (triggerRect.rectParent.height - triggerRect.rect.height) / 2;

      inlineLeft = percentageOffsetX * triggerRect.rect.width - this.el.clientWidth / 2;
      inlineTop = percentageOffsetY * triggerRect.rect.height - this.el.clientHeight / 2;

      if (inlineLeft < 0) {
        inlineLeft = 0;
      } else if (inlineLeft + this.el.clientWidth > triggerRect.rect.width) {
        inlineLeft = triggerRect.rect.width - this.el.clientWidth;
      }

      if (inlineTop < 0) {
        inlineTop = 0;
      } else if (inlineTop + this.el.clientHeight > triggerRect.rect.height) {
        inlineTop = triggerRect.rect.height - this.el.clientHeight;
      }

      inlineLeft += parentXOffset;
      inlineTop += parentYOffset;
    }

    this.el.style.left = `${inlineLeft}px`;
    this.el.style.top = `${inlineTop}px`;
  }
}
