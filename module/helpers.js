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

  static orderKeys(obj, expected) {
    let keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
            if (k1 < k2) return -1;
            else if (k1 > k2) return +1;
            else return 0;
        });

    var i, after = {};
    for (i = 0; i < keys.length; i++) {
          after[keys[i]] = obj[keys[i]];
          delete obj[keys[i]];
        }

    for (i = 0; i < keys.length; i++) {
          obj[keys[i]] = after[keys[i]];
        }
    return obj;
  }

  static hasModifiers(event) {
    return event && (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey);
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
