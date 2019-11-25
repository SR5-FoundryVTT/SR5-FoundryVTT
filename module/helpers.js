export class Helpers {
  static label(str) {
    return str.replace('_',' ').replace(/^\w/, c => c.toUpperCase());
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

  static addLabels(obj, label) {
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
