export class Helpers {
  static label(str) {
    const frags = str.split('_');
    for (let i=0; i<frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    frags.forEach((frag, idx) => {
      if (frag === 'Processing') frags[idx] = 'Proc.';
      if (frag === 'Mechanic') frags[idx] = 'Mech.';
    });
    return frags.join(' ');
  }

  static hasModifiers(event) {
    return event.shiftKey || event.altKey || event.ctrlKey || event.metaKey;
  }

  static filter(obj, comp) {
    let retObj = {};
    if (typeof obj === 'object' && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => { if (comp([key, value])) retObj[key] = value; });
    }
    return retObj;
  }

  static addLabels(obj, label, recurs = false) {
    if (typeof obj === 'object' && obj !== null) {
      if (!obj.hasOwnProperty('label') && obj.hasOwnProperty('value') && label !== '') {
        obj.label = label;
      }
      Object.entries(obj)
        .filter(([key, value]) => typeof value === 'object')
        .forEach(([key, value]) => Helpers.addLabels(value, key));
    }
  }
};
