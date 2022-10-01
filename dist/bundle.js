var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __reflectGet = Reflect.get;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __superGet = (cls, obj, key) => __reflectGet(__getProtoOf(cls), key, obj);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// node_modules/xml2js/lib/defaults.js
var require_defaults = __commonJS({
  "node_modules/xml2js/lib/defaults.js"(exports) {
    (function() {
      exports.defaults = {
        "0.1": {
          explicitCharkey: false,
          trim: true,
          normalize: true,
          normalizeTags: false,
          attrkey: "@",
          charkey: "#",
          explicitArray: false,
          ignoreAttrs: false,
          mergeAttrs: false,
          explicitRoot: false,
          validator: null,
          xmlns: false,
          explicitChildren: false,
          childkey: "@@",
          charsAsChildren: false,
          includeWhiteChars: false,
          async: false,
          strict: true,
          attrNameProcessors: null,
          attrValueProcessors: null,
          tagNameProcessors: null,
          valueProcessors: null,
          emptyTag: ""
        },
        "0.2": {
          explicitCharkey: false,
          trim: false,
          normalize: false,
          normalizeTags: false,
          attrkey: "$",
          charkey: "_",
          explicitArray: true,
          ignoreAttrs: false,
          mergeAttrs: false,
          explicitRoot: true,
          validator: null,
          xmlns: false,
          explicitChildren: false,
          preserveChildrenOrder: false,
          childkey: "$$",
          charsAsChildren: false,
          includeWhiteChars: false,
          async: false,
          strict: true,
          attrNameProcessors: null,
          attrValueProcessors: null,
          tagNameProcessors: null,
          valueProcessors: null,
          rootName: "root",
          xmldec: {
            "version": "1.0",
            "encoding": "UTF-8",
            "standalone": true
          },
          doctype: null,
          renderOpts: {
            "pretty": true,
            "indent": "  ",
            "newline": "\n"
          },
          headless: false,
          chunkSize: 1e4,
          emptyTag: "",
          cdata: false
        }
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/Utility.js
var require_Utility = __commonJS({
  "node_modules/xmlbuilder/lib/Utility.js"(exports, module) {
    (function() {
      var assign, getValue, isArray, isEmpty, isFunction, isObject, isPlainObject, slice = [].slice, hasProp = {}.hasOwnProperty;
      assign = function() {
        var i, key, len, source, sources, target;
        target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
        if (isFunction(Object.assign)) {
          Object.assign.apply(null, arguments);
        } else {
          for (i = 0, len = sources.length; i < len; i++) {
            source = sources[i];
            if (source != null) {
              for (key in source) {
                if (!hasProp.call(source, key))
                  continue;
                target[key] = source[key];
              }
            }
          }
        }
        return target;
      };
      isFunction = function(val) {
        return !!val && Object.prototype.toString.call(val) === "[object Function]";
      };
      isObject = function(val) {
        var ref;
        return !!val && ((ref = typeof val) === "function" || ref === "object");
      };
      isArray = function(val) {
        if (isFunction(Array.isArray)) {
          return Array.isArray(val);
        } else {
          return Object.prototype.toString.call(val) === "[object Array]";
        }
      };
      isEmpty = function(val) {
        var key;
        if (isArray(val)) {
          return !val.length;
        } else {
          for (key in val) {
            if (!hasProp.call(val, key))
              continue;
            return false;
          }
          return true;
        }
      };
      isPlainObject = function(val) {
        var ctor, proto;
        return isObject(val) && (proto = Object.getPrototypeOf(val)) && (ctor = proto.constructor) && typeof ctor === "function" && ctor instanceof ctor && Function.prototype.toString.call(ctor) === Function.prototype.toString.call(Object);
      };
      getValue = function(obj) {
        if (isFunction(obj.valueOf)) {
          return obj.valueOf();
        } else {
          return obj;
        }
      };
      module.exports.assign = assign;
      module.exports.isFunction = isFunction;
      module.exports.isObject = isObject;
      module.exports.isArray = isArray;
      module.exports.isEmpty = isEmpty;
      module.exports.isPlainObject = isPlainObject;
      module.exports.getValue = getValue;
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMImplementation.js
var require_XMLDOMImplementation = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMImplementation.js"(exports, module) {
    (function() {
      var XMLDOMImplementation;
      module.exports = XMLDOMImplementation = function() {
        function XMLDOMImplementation2() {
        }
        XMLDOMImplementation2.prototype.hasFeature = function(feature, version) {
          return true;
        };
        XMLDOMImplementation2.prototype.createDocumentType = function(qualifiedName, publicId, systemId) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLDOMImplementation2.prototype.createDocument = function(namespaceURI, qualifiedName, doctype) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLDOMImplementation2.prototype.createHTMLDocument = function(title) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLDOMImplementation2.prototype.getFeature = function(feature, version) {
          throw new Error("This DOM method is not implemented.");
        };
        return XMLDOMImplementation2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js
var require_XMLDOMErrorHandler = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMErrorHandler.js"(exports, module) {
    (function() {
      var XMLDOMErrorHandler;
      module.exports = XMLDOMErrorHandler = function() {
        function XMLDOMErrorHandler2() {
        }
        XMLDOMErrorHandler2.prototype.handleError = function(error) {
          throw new Error(error);
        };
        return XMLDOMErrorHandler2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMStringList.js
var require_XMLDOMStringList = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMStringList.js"(exports, module) {
    (function() {
      var XMLDOMStringList;
      module.exports = XMLDOMStringList = function() {
        function XMLDOMStringList2(arr) {
          this.arr = arr || [];
        }
        Object.defineProperty(XMLDOMStringList2.prototype, "length", {
          get: function() {
            return this.arr.length;
          }
        });
        XMLDOMStringList2.prototype.item = function(index) {
          return this.arr[index] || null;
        };
        XMLDOMStringList2.prototype.contains = function(str) {
          return this.arr.indexOf(str) !== -1;
        };
        return XMLDOMStringList2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDOMConfiguration.js
var require_XMLDOMConfiguration = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDOMConfiguration.js"(exports, module) {
    (function() {
      var XMLDOMConfiguration, XMLDOMErrorHandler, XMLDOMStringList;
      XMLDOMErrorHandler = require_XMLDOMErrorHandler();
      XMLDOMStringList = require_XMLDOMStringList();
      module.exports = XMLDOMConfiguration = function() {
        function XMLDOMConfiguration2() {
          var clonedSelf;
          this.defaultParams = {
            "canonical-form": false,
            "cdata-sections": false,
            "comments": false,
            "datatype-normalization": false,
            "element-content-whitespace": true,
            "entities": true,
            "error-handler": new XMLDOMErrorHandler(),
            "infoset": true,
            "validate-if-schema": false,
            "namespaces": true,
            "namespace-declarations": true,
            "normalize-characters": false,
            "schema-location": "",
            "schema-type": "",
            "split-cdata-sections": true,
            "validate": false,
            "well-formed": true
          };
          this.params = clonedSelf = Object.create(this.defaultParams);
        }
        Object.defineProperty(XMLDOMConfiguration2.prototype, "parameterNames", {
          get: function() {
            return new XMLDOMStringList(Object.keys(this.defaultParams));
          }
        });
        XMLDOMConfiguration2.prototype.getParameter = function(name) {
          if (this.params.hasOwnProperty(name)) {
            return this.params[name];
          } else {
            return null;
          }
        };
        XMLDOMConfiguration2.prototype.canSetParameter = function(name, value) {
          return true;
        };
        XMLDOMConfiguration2.prototype.setParameter = function(name, value) {
          if (value != null) {
            return this.params[name] = value;
          } else {
            return delete this.params[name];
          }
        };
        return XMLDOMConfiguration2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/NodeType.js
var require_NodeType = __commonJS({
  "node_modules/xmlbuilder/lib/NodeType.js"(exports, module) {
    (function() {
      module.exports = {
        Element: 1,
        Attribute: 2,
        Text: 3,
        CData: 4,
        EntityReference: 5,
        EntityDeclaration: 6,
        ProcessingInstruction: 7,
        Comment: 8,
        Document: 9,
        DocType: 10,
        DocumentFragment: 11,
        NotationDeclaration: 12,
        Declaration: 201,
        Raw: 202,
        AttributeDeclaration: 203,
        ElementDeclaration: 204,
        Dummy: 205
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLAttribute.js
var require_XMLAttribute = __commonJS({
  "node_modules/xmlbuilder/lib/XMLAttribute.js"(exports, module) {
    (function() {
      var NodeType, XMLAttribute, XMLNode;
      NodeType = require_NodeType();
      XMLNode = require_XMLNode();
      module.exports = XMLAttribute = function() {
        function XMLAttribute2(parent, name, value) {
          this.parent = parent;
          if (this.parent) {
            this.options = this.parent.options;
            this.stringify = this.parent.stringify;
          }
          if (name == null) {
            throw new Error("Missing attribute name. " + this.debugInfo(name));
          }
          this.name = this.stringify.name(name);
          this.value = this.stringify.attValue(value);
          this.type = NodeType.Attribute;
          this.isId = false;
          this.schemaTypeInfo = null;
        }
        Object.defineProperty(XMLAttribute2.prototype, "nodeType", {
          get: function() {
            return this.type;
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "ownerElement", {
          get: function() {
            return this.parent;
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "textContent", {
          get: function() {
            return this.value;
          },
          set: function(value) {
            return this.value = value || "";
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "namespaceURI", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "prefix", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "localName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLAttribute2.prototype, "specified", {
          get: function() {
            return true;
          }
        });
        XMLAttribute2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLAttribute2.prototype.toString = function(options) {
          return this.options.writer.attribute(this, this.options.writer.filterOptions(options));
        };
        XMLAttribute2.prototype.debugInfo = function(name) {
          name = name || this.name;
          if (name == null) {
            return "parent: <" + this.parent.name + ">";
          } else {
            return "attribute: {" + name + "}, parent: <" + this.parent.name + ">";
          }
        };
        XMLAttribute2.prototype.isEqualNode = function(node) {
          if (node.namespaceURI !== this.namespaceURI) {
            return false;
          }
          if (node.prefix !== this.prefix) {
            return false;
          }
          if (node.localName !== this.localName) {
            return false;
          }
          if (node.value !== this.value) {
            return false;
          }
          return true;
        };
        return XMLAttribute2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLNamedNodeMap.js
var require_XMLNamedNodeMap = __commonJS({
  "node_modules/xmlbuilder/lib/XMLNamedNodeMap.js"(exports, module) {
    (function() {
      var XMLNamedNodeMap;
      module.exports = XMLNamedNodeMap = function() {
        function XMLNamedNodeMap2(nodes) {
          this.nodes = nodes;
        }
        Object.defineProperty(XMLNamedNodeMap2.prototype, "length", {
          get: function() {
            return Object.keys(this.nodes).length || 0;
          }
        });
        XMLNamedNodeMap2.prototype.clone = function() {
          return this.nodes = null;
        };
        XMLNamedNodeMap2.prototype.getNamedItem = function(name) {
          return this.nodes[name];
        };
        XMLNamedNodeMap2.prototype.setNamedItem = function(node) {
          var oldNode;
          oldNode = this.nodes[node.nodeName];
          this.nodes[node.nodeName] = node;
          return oldNode || null;
        };
        XMLNamedNodeMap2.prototype.removeNamedItem = function(name) {
          var oldNode;
          oldNode = this.nodes[name];
          delete this.nodes[name];
          return oldNode || null;
        };
        XMLNamedNodeMap2.prototype.item = function(index) {
          return this.nodes[Object.keys(this.nodes)[index]] || null;
        };
        XMLNamedNodeMap2.prototype.getNamedItemNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLNamedNodeMap2.prototype.setNamedItemNS = function(node) {
          throw new Error("This DOM method is not implemented.");
        };
        XMLNamedNodeMap2.prototype.removeNamedItemNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented.");
        };
        return XMLNamedNodeMap2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLElement.js
var require_XMLElement = __commonJS({
  "node_modules/xmlbuilder/lib/XMLElement.js"(exports, module) {
    (function() {
      var NodeType, XMLAttribute, XMLElement, XMLNamedNodeMap, XMLNode, getValue, isFunction, isObject, ref, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      ref = require_Utility(), isObject = ref.isObject, isFunction = ref.isFunction, getValue = ref.getValue;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      XMLAttribute = require_XMLAttribute();
      XMLNamedNodeMap = require_XMLNamedNodeMap();
      module.exports = XMLElement = function(superClass) {
        extend(XMLElement2, superClass);
        function XMLElement2(parent, name, attributes) {
          var child, j, len, ref1;
          XMLElement2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing element name. " + this.debugInfo());
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.Element;
          this.attribs = {};
          this.schemaTypeInfo = null;
          if (attributes != null) {
            this.attribute(attributes);
          }
          if (parent.type === NodeType.Document) {
            this.isRoot = true;
            this.documentObject = parent;
            parent.rootObject = this;
            if (parent.children) {
              ref1 = parent.children;
              for (j = 0, len = ref1.length; j < len; j++) {
                child = ref1[j];
                if (child.type === NodeType.DocType) {
                  child.name = this.name;
                  break;
                }
              }
            }
          }
        }
        Object.defineProperty(XMLElement2.prototype, "tagName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLElement2.prototype, "namespaceURI", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLElement2.prototype, "prefix", {
          get: function() {
            return "";
          }
        });
        Object.defineProperty(XMLElement2.prototype, "localName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLElement2.prototype, "id", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLElement2.prototype, "className", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLElement2.prototype, "classList", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLElement2.prototype, "attributes", {
          get: function() {
            if (!this.attributeMap || !this.attributeMap.nodes) {
              this.attributeMap = new XMLNamedNodeMap(this.attribs);
            }
            return this.attributeMap;
          }
        });
        XMLElement2.prototype.clone = function() {
          var att, attName, clonedSelf, ref1;
          clonedSelf = Object.create(this);
          if (clonedSelf.isRoot) {
            clonedSelf.documentObject = null;
          }
          clonedSelf.attribs = {};
          ref1 = this.attribs;
          for (attName in ref1) {
            if (!hasProp.call(ref1, attName))
              continue;
            att = ref1[attName];
            clonedSelf.attribs[attName] = att.clone();
          }
          clonedSelf.children = [];
          this.children.forEach(function(child) {
            var clonedChild;
            clonedChild = child.clone();
            clonedChild.parent = clonedSelf;
            return clonedSelf.children.push(clonedChild);
          });
          return clonedSelf;
        };
        XMLElement2.prototype.attribute = function(name, value) {
          var attName, attValue;
          if (name != null) {
            name = getValue(name);
          }
          if (isObject(name)) {
            for (attName in name) {
              if (!hasProp.call(name, attName))
                continue;
              attValue = name[attName];
              this.attribute(attName, attValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            if (this.options.keepNullAttributes && value == null) {
              this.attribs[name] = new XMLAttribute(this, name, "");
            } else if (value != null) {
              this.attribs[name] = new XMLAttribute(this, name, value);
            }
          }
          return this;
        };
        XMLElement2.prototype.removeAttribute = function(name) {
          var attName, j, len;
          if (name == null) {
            throw new Error("Missing attribute name. " + this.debugInfo());
          }
          name = getValue(name);
          if (Array.isArray(name)) {
            for (j = 0, len = name.length; j < len; j++) {
              attName = name[j];
              delete this.attribs[attName];
            }
          } else {
            delete this.attribs[name];
          }
          return this;
        };
        XMLElement2.prototype.toString = function(options) {
          return this.options.writer.element(this, this.options.writer.filterOptions(options));
        };
        XMLElement2.prototype.att = function(name, value) {
          return this.attribute(name, value);
        };
        XMLElement2.prototype.a = function(name, value) {
          return this.attribute(name, value);
        };
        XMLElement2.prototype.getAttribute = function(name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].value;
          } else {
            return null;
          }
        };
        XMLElement2.prototype.setAttribute = function(name, value) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getAttributeNode = function(name) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name];
          } else {
            return null;
          }
        };
        XMLElement2.prototype.setAttributeNode = function(newAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.removeAttributeNode = function(oldAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagName = function(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getAttributeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setAttributeNS = function(namespaceURI, qualifiedName, value) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.removeAttributeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getAttributeNodeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setAttributeNodeNS = function(newAttr) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.hasAttribute = function(name) {
          return this.attribs.hasOwnProperty(name);
        };
        XMLElement2.prototype.hasAttributeNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setIdAttribute = function(name, isId) {
          if (this.attribs.hasOwnProperty(name)) {
            return this.attribs[name].isId;
          } else {
            return isId;
          }
        };
        XMLElement2.prototype.setIdAttributeNS = function(namespaceURI, localName, isId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.setIdAttributeNode = function(idAttr, isId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagName = function(tagname) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.getElementsByClassName = function(classNames) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLElement2.prototype.isEqualNode = function(node) {
          var i, j, ref1;
          if (!XMLElement2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.namespaceURI !== this.namespaceURI) {
            return false;
          }
          if (node.prefix !== this.prefix) {
            return false;
          }
          if (node.localName !== this.localName) {
            return false;
          }
          if (node.attribs.length !== this.attribs.length) {
            return false;
          }
          for (i = j = 0, ref1 = this.attribs.length - 1; 0 <= ref1 ? j <= ref1 : j >= ref1; i = 0 <= ref1 ? ++j : --j) {
            if (!this.attribs[i].isEqualNode(node.attribs[i])) {
              return false;
            }
          }
          return true;
        };
        return XMLElement2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLCharacterData.js
var require_XMLCharacterData = __commonJS({
  "node_modules/xmlbuilder/lib/XMLCharacterData.js"(exports, module) {
    (function() {
      var XMLCharacterData, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      module.exports = XMLCharacterData = function(superClass) {
        extend(XMLCharacterData2, superClass);
        function XMLCharacterData2(parent) {
          XMLCharacterData2.__super__.constructor.call(this, parent);
          this.value = "";
        }
        Object.defineProperty(XMLCharacterData2.prototype, "data", {
          get: function() {
            return this.value;
          },
          set: function(value) {
            return this.value = value || "";
          }
        });
        Object.defineProperty(XMLCharacterData2.prototype, "length", {
          get: function() {
            return this.value.length;
          }
        });
        Object.defineProperty(XMLCharacterData2.prototype, "textContent", {
          get: function() {
            return this.value;
          },
          set: function(value) {
            return this.value = value || "";
          }
        });
        XMLCharacterData2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLCharacterData2.prototype.substringData = function(offset, count) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.appendData = function(arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.insertData = function(offset, arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.deleteData = function(offset, count) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.replaceData = function(offset, count, arg) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLCharacterData2.prototype.isEqualNode = function(node) {
          if (!XMLCharacterData2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.data !== this.data) {
            return false;
          }
          return true;
        };
        return XMLCharacterData2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLCData.js
var require_XMLCData = __commonJS({
  "node_modules/xmlbuilder/lib/XMLCData.js"(exports, module) {
    (function() {
      var NodeType, XMLCData, XMLCharacterData, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module.exports = XMLCData = function(superClass) {
        extend(XMLCData2, superClass);
        function XMLCData2(parent, text) {
          XMLCData2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing CDATA text. " + this.debugInfo());
          }
          this.name = "#cdata-section";
          this.type = NodeType.CData;
          this.value = this.stringify.cdata(text);
        }
        XMLCData2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLCData2.prototype.toString = function(options) {
          return this.options.writer.cdata(this, this.options.writer.filterOptions(options));
        };
        return XMLCData2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLComment.js
var require_XMLComment = __commonJS({
  "node_modules/xmlbuilder/lib/XMLComment.js"(exports, module) {
    (function() {
      var NodeType, XMLCharacterData, XMLComment, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module.exports = XMLComment = function(superClass) {
        extend(XMLComment2, superClass);
        function XMLComment2(parent, text) {
          XMLComment2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing comment text. " + this.debugInfo());
          }
          this.name = "#comment";
          this.type = NodeType.Comment;
          this.value = this.stringify.comment(text);
        }
        XMLComment2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLComment2.prototype.toString = function(options) {
          return this.options.writer.comment(this, this.options.writer.filterOptions(options));
        };
        return XMLComment2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDeclaration.js
var require_XMLDeclaration = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDeclaration.js"(exports, module) {
    (function() {
      var NodeType, XMLDeclaration, XMLNode, isObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isObject = require_Utility().isObject;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module.exports = XMLDeclaration = function(superClass) {
        extend(XMLDeclaration2, superClass);
        function XMLDeclaration2(parent, version, encoding, standalone) {
          var ref;
          XMLDeclaration2.__super__.constructor.call(this, parent);
          if (isObject(version)) {
            ref = version, version = ref.version, encoding = ref.encoding, standalone = ref.standalone;
          }
          if (!version) {
            version = "1.0";
          }
          this.type = NodeType.Declaration;
          this.version = this.stringify.xmlVersion(version);
          if (encoding != null) {
            this.encoding = this.stringify.xmlEncoding(encoding);
          }
          if (standalone != null) {
            this.standalone = this.stringify.xmlStandalone(standalone);
          }
        }
        XMLDeclaration2.prototype.toString = function(options) {
          return this.options.writer.declaration(this, this.options.writer.filterOptions(options));
        };
        return XMLDeclaration2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDAttList.js
var require_XMLDTDAttList = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDAttList.js"(exports, module) {
    (function() {
      var NodeType, XMLDTDAttList, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module.exports = XMLDTDAttList = function(superClass) {
        extend(XMLDTDAttList2, superClass);
        function XMLDTDAttList2(parent, elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          XMLDTDAttList2.__super__.constructor.call(this, parent);
          if (elementName == null) {
            throw new Error("Missing DTD element name. " + this.debugInfo());
          }
          if (attributeName == null) {
            throw new Error("Missing DTD attribute name. " + this.debugInfo(elementName));
          }
          if (!attributeType) {
            throw new Error("Missing DTD attribute type. " + this.debugInfo(elementName));
          }
          if (!defaultValueType) {
            throw new Error("Missing DTD attribute default. " + this.debugInfo(elementName));
          }
          if (defaultValueType.indexOf("#") !== 0) {
            defaultValueType = "#" + defaultValueType;
          }
          if (!defaultValueType.match(/^(#REQUIRED|#IMPLIED|#FIXED|#DEFAULT)$/)) {
            throw new Error("Invalid default value type; expected: #REQUIRED, #IMPLIED, #FIXED or #DEFAULT. " + this.debugInfo(elementName));
          }
          if (defaultValue && !defaultValueType.match(/^(#FIXED|#DEFAULT)$/)) {
            throw new Error("Default value only applies to #FIXED or #DEFAULT. " + this.debugInfo(elementName));
          }
          this.elementName = this.stringify.name(elementName);
          this.type = NodeType.AttributeDeclaration;
          this.attributeName = this.stringify.name(attributeName);
          this.attributeType = this.stringify.dtdAttType(attributeType);
          if (defaultValue) {
            this.defaultValue = this.stringify.dtdAttDefault(defaultValue);
          }
          this.defaultValueType = defaultValueType;
        }
        XMLDTDAttList2.prototype.toString = function(options) {
          return this.options.writer.dtdAttList(this, this.options.writer.filterOptions(options));
        };
        return XMLDTDAttList2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDEntity.js
var require_XMLDTDEntity = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDEntity.js"(exports, module) {
    (function() {
      var NodeType, XMLDTDEntity, XMLNode, isObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isObject = require_Utility().isObject;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module.exports = XMLDTDEntity = function(superClass) {
        extend(XMLDTDEntity2, superClass);
        function XMLDTDEntity2(parent, pe, name, value) {
          XMLDTDEntity2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing DTD entity name. " + this.debugInfo(name));
          }
          if (value == null) {
            throw new Error("Missing DTD entity value. " + this.debugInfo(name));
          }
          this.pe = !!pe;
          this.name = this.stringify.name(name);
          this.type = NodeType.EntityDeclaration;
          if (!isObject(value)) {
            this.value = this.stringify.dtdEntityValue(value);
            this.internal = true;
          } else {
            if (!value.pubID && !value.sysID) {
              throw new Error("Public and/or system identifiers are required for an external entity. " + this.debugInfo(name));
            }
            if (value.pubID && !value.sysID) {
              throw new Error("System identifier is required for a public external entity. " + this.debugInfo(name));
            }
            this.internal = false;
            if (value.pubID != null) {
              this.pubID = this.stringify.dtdPubID(value.pubID);
            }
            if (value.sysID != null) {
              this.sysID = this.stringify.dtdSysID(value.sysID);
            }
            if (value.nData != null) {
              this.nData = this.stringify.dtdNData(value.nData);
            }
            if (this.pe && this.nData) {
              throw new Error("Notation declaration is not allowed in a parameter entity. " + this.debugInfo(name));
            }
          }
        }
        Object.defineProperty(XMLDTDEntity2.prototype, "publicId", {
          get: function() {
            return this.pubID;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "systemId", {
          get: function() {
            return this.sysID;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "notationName", {
          get: function() {
            return this.nData || null;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "inputEncoding", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "xmlEncoding", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDTDEntity2.prototype, "xmlVersion", {
          get: function() {
            return null;
          }
        });
        XMLDTDEntity2.prototype.toString = function(options) {
          return this.options.writer.dtdEntity(this, this.options.writer.filterOptions(options));
        };
        return XMLDTDEntity2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDElement.js
var require_XMLDTDElement = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDElement.js"(exports, module) {
    (function() {
      var NodeType, XMLDTDElement, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module.exports = XMLDTDElement = function(superClass) {
        extend(XMLDTDElement2, superClass);
        function XMLDTDElement2(parent, name, value) {
          XMLDTDElement2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing DTD element name. " + this.debugInfo());
          }
          if (!value) {
            value = "(#PCDATA)";
          }
          if (Array.isArray(value)) {
            value = "(" + value.join(",") + ")";
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.ElementDeclaration;
          this.value = this.stringify.dtdElementValue(value);
        }
        XMLDTDElement2.prototype.toString = function(options) {
          return this.options.writer.dtdElement(this, this.options.writer.filterOptions(options));
        };
        return XMLDTDElement2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDTDNotation.js
var require_XMLDTDNotation = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDTDNotation.js"(exports, module) {
    (function() {
      var NodeType, XMLDTDNotation, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module.exports = XMLDTDNotation = function(superClass) {
        extend(XMLDTDNotation2, superClass);
        function XMLDTDNotation2(parent, name, value) {
          XMLDTDNotation2.__super__.constructor.call(this, parent);
          if (name == null) {
            throw new Error("Missing DTD notation name. " + this.debugInfo(name));
          }
          if (!value.pubID && !value.sysID) {
            throw new Error("Public or system identifiers are required for an external entity. " + this.debugInfo(name));
          }
          this.name = this.stringify.name(name);
          this.type = NodeType.NotationDeclaration;
          if (value.pubID != null) {
            this.pubID = this.stringify.dtdPubID(value.pubID);
          }
          if (value.sysID != null) {
            this.sysID = this.stringify.dtdSysID(value.sysID);
          }
        }
        Object.defineProperty(XMLDTDNotation2.prototype, "publicId", {
          get: function() {
            return this.pubID;
          }
        });
        Object.defineProperty(XMLDTDNotation2.prototype, "systemId", {
          get: function() {
            return this.sysID;
          }
        });
        XMLDTDNotation2.prototype.toString = function(options) {
          return this.options.writer.dtdNotation(this, this.options.writer.filterOptions(options));
        };
        return XMLDTDNotation2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDocType.js
var require_XMLDocType = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDocType.js"(exports, module) {
    (function() {
      var NodeType, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDocType, XMLNamedNodeMap, XMLNode, isObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isObject = require_Utility().isObject;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      XMLDTDAttList = require_XMLDTDAttList();
      XMLDTDEntity = require_XMLDTDEntity();
      XMLDTDElement = require_XMLDTDElement();
      XMLDTDNotation = require_XMLDTDNotation();
      XMLNamedNodeMap = require_XMLNamedNodeMap();
      module.exports = XMLDocType = function(superClass) {
        extend(XMLDocType2, superClass);
        function XMLDocType2(parent, pubID, sysID) {
          var child, i, len, ref, ref1, ref2;
          XMLDocType2.__super__.constructor.call(this, parent);
          this.type = NodeType.DocType;
          if (parent.children) {
            ref = parent.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.Element) {
                this.name = child.name;
                break;
              }
            }
          }
          this.documentObject = parent;
          if (isObject(pubID)) {
            ref1 = pubID, pubID = ref1.pubID, sysID = ref1.sysID;
          }
          if (sysID == null) {
            ref2 = [pubID, sysID], sysID = ref2[0], pubID = ref2[1];
          }
          if (pubID != null) {
            this.pubID = this.stringify.dtdPubID(pubID);
          }
          if (sysID != null) {
            this.sysID = this.stringify.dtdSysID(sysID);
          }
        }
        Object.defineProperty(XMLDocType2.prototype, "entities", {
          get: function() {
            var child, i, len, nodes, ref;
            nodes = {};
            ref = this.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.EntityDeclaration && !child.pe) {
                nodes[child.name] = child;
              }
            }
            return new XMLNamedNodeMap(nodes);
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "notations", {
          get: function() {
            var child, i, len, nodes, ref;
            nodes = {};
            ref = this.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.NotationDeclaration) {
                nodes[child.name] = child;
              }
            }
            return new XMLNamedNodeMap(nodes);
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "publicId", {
          get: function() {
            return this.pubID;
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "systemId", {
          get: function() {
            return this.sysID;
          }
        });
        Object.defineProperty(XMLDocType2.prototype, "internalSubset", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        XMLDocType2.prototype.element = function(name, value) {
          var child;
          child = new XMLDTDElement(this, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          var child;
          child = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.entity = function(name, value) {
          var child;
          child = new XMLDTDEntity(this, false, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.pEntity = function(name, value) {
          var child;
          child = new XMLDTDEntity(this, true, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.notation = function(name, value) {
          var child;
          child = new XMLDTDNotation(this, name, value);
          this.children.push(child);
          return this;
        };
        XMLDocType2.prototype.toString = function(options) {
          return this.options.writer.docType(this, this.options.writer.filterOptions(options));
        };
        XMLDocType2.prototype.ele = function(name, value) {
          return this.element(name, value);
        };
        XMLDocType2.prototype.att = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          return this.attList(elementName, attributeName, attributeType, defaultValueType, defaultValue);
        };
        XMLDocType2.prototype.ent = function(name, value) {
          return this.entity(name, value);
        };
        XMLDocType2.prototype.pent = function(name, value) {
          return this.pEntity(name, value);
        };
        XMLDocType2.prototype.not = function(name, value) {
          return this.notation(name, value);
        };
        XMLDocType2.prototype.up = function() {
          return this.root() || this.documentObject;
        };
        XMLDocType2.prototype.isEqualNode = function(node) {
          if (!XMLDocType2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.name !== this.name) {
            return false;
          }
          if (node.publicId !== this.publicId) {
            return false;
          }
          if (node.systemId !== this.systemId) {
            return false;
          }
          return true;
        };
        return XMLDocType2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLRaw.js
var require_XMLRaw = __commonJS({
  "node_modules/xmlbuilder/lib/XMLRaw.js"(exports, module) {
    (function() {
      var NodeType, XMLNode, XMLRaw, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLNode = require_XMLNode();
      module.exports = XMLRaw = function(superClass) {
        extend(XMLRaw2, superClass);
        function XMLRaw2(parent, text) {
          XMLRaw2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing raw text. " + this.debugInfo());
          }
          this.type = NodeType.Raw;
          this.value = this.stringify.raw(text);
        }
        XMLRaw2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLRaw2.prototype.toString = function(options) {
          return this.options.writer.raw(this, this.options.writer.filterOptions(options));
        };
        return XMLRaw2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLText.js
var require_XMLText = __commonJS({
  "node_modules/xmlbuilder/lib/XMLText.js"(exports, module) {
    (function() {
      var NodeType, XMLCharacterData, XMLText, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module.exports = XMLText = function(superClass) {
        extend(XMLText2, superClass);
        function XMLText2(parent, text) {
          XMLText2.__super__.constructor.call(this, parent);
          if (text == null) {
            throw new Error("Missing element text. " + this.debugInfo());
          }
          this.name = "#text";
          this.type = NodeType.Text;
          this.value = this.stringify.text(text);
        }
        Object.defineProperty(XMLText2.prototype, "isElementContentWhitespace", {
          get: function() {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        Object.defineProperty(XMLText2.prototype, "wholeText", {
          get: function() {
            var next, prev, str;
            str = "";
            prev = this.previousSibling;
            while (prev) {
              str = prev.data + str;
              prev = prev.previousSibling;
            }
            str += this.data;
            next = this.nextSibling;
            while (next) {
              str = str + next.data;
              next = next.nextSibling;
            }
            return str;
          }
        });
        XMLText2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLText2.prototype.toString = function(options) {
          return this.options.writer.text(this, this.options.writer.filterOptions(options));
        };
        XMLText2.prototype.splitText = function(offset) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLText2.prototype.replaceWholeText = function(content) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        return XMLText2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLProcessingInstruction.js
var require_XMLProcessingInstruction = __commonJS({
  "node_modules/xmlbuilder/lib/XMLProcessingInstruction.js"(exports, module) {
    (function() {
      var NodeType, XMLCharacterData, XMLProcessingInstruction, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLCharacterData = require_XMLCharacterData();
      module.exports = XMLProcessingInstruction = function(superClass) {
        extend(XMLProcessingInstruction2, superClass);
        function XMLProcessingInstruction2(parent, target, value) {
          XMLProcessingInstruction2.__super__.constructor.call(this, parent);
          if (target == null) {
            throw new Error("Missing instruction target. " + this.debugInfo());
          }
          this.type = NodeType.ProcessingInstruction;
          this.target = this.stringify.insTarget(target);
          this.name = this.target;
          if (value) {
            this.value = this.stringify.insValue(value);
          }
        }
        XMLProcessingInstruction2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLProcessingInstruction2.prototype.toString = function(options) {
          return this.options.writer.processingInstruction(this, this.options.writer.filterOptions(options));
        };
        XMLProcessingInstruction2.prototype.isEqualNode = function(node) {
          if (!XMLProcessingInstruction2.__super__.isEqualNode.apply(this, arguments).isEqualNode(node)) {
            return false;
          }
          if (node.target !== this.target) {
            return false;
          }
          return true;
        };
        return XMLProcessingInstruction2;
      }(XMLCharacterData);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDummy.js
var require_XMLDummy = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDummy.js"(exports, module) {
    (function() {
      var NodeType, XMLDummy, XMLNode, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      module.exports = XMLDummy = function(superClass) {
        extend(XMLDummy2, superClass);
        function XMLDummy2(parent) {
          XMLDummy2.__super__.constructor.call(this, parent);
          this.type = NodeType.Dummy;
        }
        XMLDummy2.prototype.clone = function() {
          return Object.create(this);
        };
        XMLDummy2.prototype.toString = function(options) {
          return "";
        };
        return XMLDummy2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLNodeList.js
var require_XMLNodeList = __commonJS({
  "node_modules/xmlbuilder/lib/XMLNodeList.js"(exports, module) {
    (function() {
      var XMLNodeList;
      module.exports = XMLNodeList = function() {
        function XMLNodeList2(nodes) {
          this.nodes = nodes;
        }
        Object.defineProperty(XMLNodeList2.prototype, "length", {
          get: function() {
            return this.nodes.length || 0;
          }
        });
        XMLNodeList2.prototype.clone = function() {
          return this.nodes = null;
        };
        XMLNodeList2.prototype.item = function(index) {
          return this.nodes[index] || null;
        };
        return XMLNodeList2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/DocumentPosition.js
var require_DocumentPosition = __commonJS({
  "node_modules/xmlbuilder/lib/DocumentPosition.js"(exports, module) {
    (function() {
      module.exports = {
        Disconnected: 1,
        Preceding: 2,
        Following: 4,
        Contains: 8,
        ContainedBy: 16,
        ImplementationSpecific: 32
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLNode.js
var require_XMLNode = __commonJS({
  "node_modules/xmlbuilder/lib/XMLNode.js"(exports, module) {
    (function() {
      var DocumentPosition, NodeType, XMLCData, XMLComment, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLNamedNodeMap, XMLNode, XMLNodeList, XMLProcessingInstruction, XMLRaw, XMLText, getValue, isEmpty, isFunction, isObject, ref1, hasProp = {}.hasOwnProperty;
      ref1 = require_Utility(), isObject = ref1.isObject, isFunction = ref1.isFunction, isEmpty = ref1.isEmpty, getValue = ref1.getValue;
      XMLElement = null;
      XMLCData = null;
      XMLComment = null;
      XMLDeclaration = null;
      XMLDocType = null;
      XMLRaw = null;
      XMLText = null;
      XMLProcessingInstruction = null;
      XMLDummy = null;
      NodeType = null;
      XMLNodeList = null;
      XMLNamedNodeMap = null;
      DocumentPosition = null;
      module.exports = XMLNode = function() {
        function XMLNode2(parent1) {
          this.parent = parent1;
          if (this.parent) {
            this.options = this.parent.options;
            this.stringify = this.parent.stringify;
          }
          this.value = null;
          this.children = [];
          this.baseURI = null;
          if (!XMLElement) {
            XMLElement = require_XMLElement();
            XMLCData = require_XMLCData();
            XMLComment = require_XMLComment();
            XMLDeclaration = require_XMLDeclaration();
            XMLDocType = require_XMLDocType();
            XMLRaw = require_XMLRaw();
            XMLText = require_XMLText();
            XMLProcessingInstruction = require_XMLProcessingInstruction();
            XMLDummy = require_XMLDummy();
            NodeType = require_NodeType();
            XMLNodeList = require_XMLNodeList();
            XMLNamedNodeMap = require_XMLNamedNodeMap();
            DocumentPosition = require_DocumentPosition();
          }
        }
        Object.defineProperty(XMLNode2.prototype, "nodeName", {
          get: function() {
            return this.name;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "nodeType", {
          get: function() {
            return this.type;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "nodeValue", {
          get: function() {
            return this.value;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "parentNode", {
          get: function() {
            return this.parent;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "childNodes", {
          get: function() {
            if (!this.childNodeList || !this.childNodeList.nodes) {
              this.childNodeList = new XMLNodeList(this.children);
            }
            return this.childNodeList;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "firstChild", {
          get: function() {
            return this.children[0] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "lastChild", {
          get: function() {
            return this.children[this.children.length - 1] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "previousSibling", {
          get: function() {
            var i;
            i = this.parent.children.indexOf(this);
            return this.parent.children[i - 1] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "nextSibling", {
          get: function() {
            var i;
            i = this.parent.children.indexOf(this);
            return this.parent.children[i + 1] || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "ownerDocument", {
          get: function() {
            return this.document() || null;
          }
        });
        Object.defineProperty(XMLNode2.prototype, "textContent", {
          get: function() {
            var child, j, len, ref2, str;
            if (this.nodeType === NodeType.Element || this.nodeType === NodeType.DocumentFragment) {
              str = "";
              ref2 = this.children;
              for (j = 0, len = ref2.length; j < len; j++) {
                child = ref2[j];
                if (child.textContent) {
                  str += child.textContent;
                }
              }
              return str;
            } else {
              return null;
            }
          },
          set: function(value) {
            throw new Error("This DOM method is not implemented." + this.debugInfo());
          }
        });
        XMLNode2.prototype.setParent = function(parent) {
          var child, j, len, ref2, results;
          this.parent = parent;
          if (parent) {
            this.options = parent.options;
            this.stringify = parent.stringify;
          }
          ref2 = this.children;
          results = [];
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j];
            results.push(child.setParent(this));
          }
          return results;
        };
        XMLNode2.prototype.element = function(name, attributes, text) {
          var childNode, item, j, k, key, lastChild, len, len1, ref2, ref3, val;
          lastChild = null;
          if (attributes === null && text == null) {
            ref2 = [{}, null], attributes = ref2[0], text = ref2[1];
          }
          if (attributes == null) {
            attributes = {};
          }
          attributes = getValue(attributes);
          if (!isObject(attributes)) {
            ref3 = [attributes, text], text = ref3[0], attributes = ref3[1];
          }
          if (name != null) {
            name = getValue(name);
          }
          if (Array.isArray(name)) {
            for (j = 0, len = name.length; j < len; j++) {
              item = name[j];
              lastChild = this.element(item);
            }
          } else if (isFunction(name)) {
            lastChild = this.element(name.apply());
          } else if (isObject(name)) {
            for (key in name) {
              if (!hasProp.call(name, key))
                continue;
              val = name[key];
              if (isFunction(val)) {
                val = val.apply();
              }
              if (!this.options.ignoreDecorators && this.stringify.convertAttKey && key.indexOf(this.stringify.convertAttKey) === 0) {
                lastChild = this.attribute(key.substr(this.stringify.convertAttKey.length), val);
              } else if (!this.options.separateArrayItems && Array.isArray(val) && isEmpty(val)) {
                lastChild = this.dummy();
              } else if (isObject(val) && isEmpty(val)) {
                lastChild = this.element(key);
              } else if (!this.options.keepNullNodes && val == null) {
                lastChild = this.dummy();
              } else if (!this.options.separateArrayItems && Array.isArray(val)) {
                for (k = 0, len1 = val.length; k < len1; k++) {
                  item = val[k];
                  childNode = {};
                  childNode[key] = item;
                  lastChild = this.element(childNode);
                }
              } else if (isObject(val)) {
                if (!this.options.ignoreDecorators && this.stringify.convertTextKey && key.indexOf(this.stringify.convertTextKey) === 0) {
                  lastChild = this.element(val);
                } else {
                  lastChild = this.element(key);
                  lastChild.element(val);
                }
              } else {
                lastChild = this.element(key, val);
              }
            }
          } else if (!this.options.keepNullNodes && text === null) {
            lastChild = this.dummy();
          } else {
            if (!this.options.ignoreDecorators && this.stringify.convertTextKey && name.indexOf(this.stringify.convertTextKey) === 0) {
              lastChild = this.text(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertCDataKey && name.indexOf(this.stringify.convertCDataKey) === 0) {
              lastChild = this.cdata(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertCommentKey && name.indexOf(this.stringify.convertCommentKey) === 0) {
              lastChild = this.comment(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertRawKey && name.indexOf(this.stringify.convertRawKey) === 0) {
              lastChild = this.raw(text);
            } else if (!this.options.ignoreDecorators && this.stringify.convertPIKey && name.indexOf(this.stringify.convertPIKey) === 0) {
              lastChild = this.instruction(name.substr(this.stringify.convertPIKey.length), text);
            } else {
              lastChild = this.node(name, attributes, text);
            }
          }
          if (lastChild == null) {
            throw new Error("Could not create any elements with: " + name + ". " + this.debugInfo());
          }
          return lastChild;
        };
        XMLNode2.prototype.insertBefore = function(name, attributes, text) {
          var child, i, newChild, refChild, removed;
          if (name != null ? name.type : void 0) {
            newChild = name;
            refChild = attributes;
            newChild.setParent(this);
            if (refChild) {
              i = children.indexOf(refChild);
              removed = children.splice(i);
              children.push(newChild);
              Array.prototype.push.apply(children, removed);
            } else {
              children.push(newChild);
            }
            return newChild;
          } else {
            if (this.isRoot) {
              throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
            }
            i = this.parent.children.indexOf(this);
            removed = this.parent.children.splice(i);
            child = this.parent.element(name, attributes, text);
            Array.prototype.push.apply(this.parent.children, removed);
            return child;
          }
        };
        XMLNode2.prototype.insertAfter = function(name, attributes, text) {
          var child, i, removed;
          if (this.isRoot) {
            throw new Error("Cannot insert elements at root level. " + this.debugInfo(name));
          }
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          child = this.parent.element(name, attributes, text);
          Array.prototype.push.apply(this.parent.children, removed);
          return child;
        };
        XMLNode2.prototype.remove = function() {
          var i, ref2;
          if (this.isRoot) {
            throw new Error("Cannot remove the root element. " + this.debugInfo());
          }
          i = this.parent.children.indexOf(this);
          [].splice.apply(this.parent.children, [i, i - i + 1].concat(ref2 = [])), ref2;
          return this.parent;
        };
        XMLNode2.prototype.node = function(name, attributes, text) {
          var child, ref2;
          if (name != null) {
            name = getValue(name);
          }
          attributes || (attributes = {});
          attributes = getValue(attributes);
          if (!isObject(attributes)) {
            ref2 = [attributes, text], text = ref2[0], attributes = ref2[1];
          }
          child = new XMLElement(this, name, attributes);
          if (text != null) {
            child.text(text);
          }
          this.children.push(child);
          return child;
        };
        XMLNode2.prototype.text = function(value) {
          var child;
          if (isObject(value)) {
            this.element(value);
          }
          child = new XMLText(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.cdata = function(value) {
          var child;
          child = new XMLCData(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.comment = function(value) {
          var child;
          child = new XMLComment(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.commentBefore = function(value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i);
          child = this.parent.comment(value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.commentAfter = function(value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          child = this.parent.comment(value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.raw = function(value) {
          var child;
          child = new XMLRaw(this, value);
          this.children.push(child);
          return this;
        };
        XMLNode2.prototype.dummy = function() {
          var child;
          child = new XMLDummy(this);
          return child;
        };
        XMLNode2.prototype.instruction = function(target, value) {
          var insTarget, insValue, instruction, j, len;
          if (target != null) {
            target = getValue(target);
          }
          if (value != null) {
            value = getValue(value);
          }
          if (Array.isArray(target)) {
            for (j = 0, len = target.length; j < len; j++) {
              insTarget = target[j];
              this.instruction(insTarget);
            }
          } else if (isObject(target)) {
            for (insTarget in target) {
              if (!hasProp.call(target, insTarget))
                continue;
              insValue = target[insTarget];
              this.instruction(insTarget, insValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            instruction = new XMLProcessingInstruction(this, target, value);
            this.children.push(instruction);
          }
          return this;
        };
        XMLNode2.prototype.instructionBefore = function(target, value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i);
          child = this.parent.instruction(target, value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.instructionAfter = function(target, value) {
          var child, i, removed;
          i = this.parent.children.indexOf(this);
          removed = this.parent.children.splice(i + 1);
          child = this.parent.instruction(target, value);
          Array.prototype.push.apply(this.parent.children, removed);
          return this;
        };
        XMLNode2.prototype.declaration = function(version, encoding, standalone) {
          var doc, xmldec;
          doc = this.document();
          xmldec = new XMLDeclaration(doc, version, encoding, standalone);
          if (doc.children.length === 0) {
            doc.children.unshift(xmldec);
          } else if (doc.children[0].type === NodeType.Declaration) {
            doc.children[0] = xmldec;
          } else {
            doc.children.unshift(xmldec);
          }
          return doc.root() || doc;
        };
        XMLNode2.prototype.dtd = function(pubID, sysID) {
          var child, doc, doctype, i, j, k, len, len1, ref2, ref3;
          doc = this.document();
          doctype = new XMLDocType(doc, pubID, sysID);
          ref2 = doc.children;
          for (i = j = 0, len = ref2.length; j < len; i = ++j) {
            child = ref2[i];
            if (child.type === NodeType.DocType) {
              doc.children[i] = doctype;
              return doctype;
            }
          }
          ref3 = doc.children;
          for (i = k = 0, len1 = ref3.length; k < len1; i = ++k) {
            child = ref3[i];
            if (child.isRoot) {
              doc.children.splice(i, 0, doctype);
              return doctype;
            }
          }
          doc.children.push(doctype);
          return doctype;
        };
        XMLNode2.prototype.up = function() {
          if (this.isRoot) {
            throw new Error("The root node has no parent. Use doc() if you need to get the document object.");
          }
          return this.parent;
        };
        XMLNode2.prototype.root = function() {
          var node;
          node = this;
          while (node) {
            if (node.type === NodeType.Document) {
              return node.rootObject;
            } else if (node.isRoot) {
              return node;
            } else {
              node = node.parent;
            }
          }
        };
        XMLNode2.prototype.document = function() {
          var node;
          node = this;
          while (node) {
            if (node.type === NodeType.Document) {
              return node;
            } else {
              node = node.parent;
            }
          }
        };
        XMLNode2.prototype.end = function(options) {
          return this.document().end(options);
        };
        XMLNode2.prototype.prev = function() {
          var i;
          i = this.parent.children.indexOf(this);
          if (i < 1) {
            throw new Error("Already at the first node. " + this.debugInfo());
          }
          return this.parent.children[i - 1];
        };
        XMLNode2.prototype.next = function() {
          var i;
          i = this.parent.children.indexOf(this);
          if (i === -1 || i === this.parent.children.length - 1) {
            throw new Error("Already at the last node. " + this.debugInfo());
          }
          return this.parent.children[i + 1];
        };
        XMLNode2.prototype.importDocument = function(doc) {
          var clonedRoot;
          clonedRoot = doc.root().clone();
          clonedRoot.parent = this;
          clonedRoot.isRoot = false;
          this.children.push(clonedRoot);
          return this;
        };
        XMLNode2.prototype.debugInfo = function(name) {
          var ref2, ref3;
          name = name || this.name;
          if (name == null && !((ref2 = this.parent) != null ? ref2.name : void 0)) {
            return "";
          } else if (name == null) {
            return "parent: <" + this.parent.name + ">";
          } else if (!((ref3 = this.parent) != null ? ref3.name : void 0)) {
            return "node: <" + name + ">";
          } else {
            return "node: <" + name + ">, parent: <" + this.parent.name + ">";
          }
        };
        XMLNode2.prototype.ele = function(name, attributes, text) {
          return this.element(name, attributes, text);
        };
        XMLNode2.prototype.nod = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLNode2.prototype.txt = function(value) {
          return this.text(value);
        };
        XMLNode2.prototype.dat = function(value) {
          return this.cdata(value);
        };
        XMLNode2.prototype.com = function(value) {
          return this.comment(value);
        };
        XMLNode2.prototype.ins = function(target, value) {
          return this.instruction(target, value);
        };
        XMLNode2.prototype.doc = function() {
          return this.document();
        };
        XMLNode2.prototype.dec = function(version, encoding, standalone) {
          return this.declaration(version, encoding, standalone);
        };
        XMLNode2.prototype.e = function(name, attributes, text) {
          return this.element(name, attributes, text);
        };
        XMLNode2.prototype.n = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLNode2.prototype.t = function(value) {
          return this.text(value);
        };
        XMLNode2.prototype.d = function(value) {
          return this.cdata(value);
        };
        XMLNode2.prototype.c = function(value) {
          return this.comment(value);
        };
        XMLNode2.prototype.r = function(value) {
          return this.raw(value);
        };
        XMLNode2.prototype.i = function(target, value) {
          return this.instruction(target, value);
        };
        XMLNode2.prototype.u = function() {
          return this.up();
        };
        XMLNode2.prototype.importXMLBuilder = function(doc) {
          return this.importDocument(doc);
        };
        XMLNode2.prototype.replaceChild = function(newChild, oldChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.removeChild = function(oldChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.appendChild = function(newChild) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.hasChildNodes = function() {
          return this.children.length !== 0;
        };
        XMLNode2.prototype.cloneNode = function(deep) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.normalize = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.isSupported = function(feature, version) {
          return true;
        };
        XMLNode2.prototype.hasAttributes = function() {
          return this.attribs.length !== 0;
        };
        XMLNode2.prototype.compareDocumentPosition = function(other) {
          var ref, res;
          ref = this;
          if (ref === other) {
            return 0;
          } else if (this.document() !== other.document()) {
            res = DocumentPosition.Disconnected | DocumentPosition.ImplementationSpecific;
            if (Math.random() < 0.5) {
              res |= DocumentPosition.Preceding;
            } else {
              res |= DocumentPosition.Following;
            }
            return res;
          } else if (ref.isAncestor(other)) {
            return DocumentPosition.Contains | DocumentPosition.Preceding;
          } else if (ref.isDescendant(other)) {
            return DocumentPosition.Contains | DocumentPosition.Following;
          } else if (ref.isPreceding(other)) {
            return DocumentPosition.Preceding;
          } else {
            return DocumentPosition.Following;
          }
        };
        XMLNode2.prototype.isSameNode = function(other) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.lookupPrefix = function(namespaceURI) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.isDefaultNamespace = function(namespaceURI) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.lookupNamespaceURI = function(prefix) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.isEqualNode = function(node) {
          var i, j, ref2;
          if (node.nodeType !== this.nodeType) {
            return false;
          }
          if (node.children.length !== this.children.length) {
            return false;
          }
          for (i = j = 0, ref2 = this.children.length - 1; 0 <= ref2 ? j <= ref2 : j >= ref2; i = 0 <= ref2 ? ++j : --j) {
            if (!this.children[i].isEqualNode(node.children[i])) {
              return false;
            }
          }
          return true;
        };
        XMLNode2.prototype.getFeature = function(feature, version) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.setUserData = function(key, data, handler) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.getUserData = function(key) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLNode2.prototype.contains = function(other) {
          if (!other) {
            return false;
          }
          return other === this || this.isDescendant(other);
        };
        XMLNode2.prototype.isDescendant = function(node) {
          var child, isDescendantChild, j, len, ref2;
          ref2 = this.children;
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j];
            if (node === child) {
              return true;
            }
            isDescendantChild = child.isDescendant(node);
            if (isDescendantChild) {
              return true;
            }
          }
          return false;
        };
        XMLNode2.prototype.isAncestor = function(node) {
          return node.isDescendant(this);
        };
        XMLNode2.prototype.isPreceding = function(node) {
          var nodePos, thisPos;
          nodePos = this.treePosition(node);
          thisPos = this.treePosition(this);
          if (nodePos === -1 || thisPos === -1) {
            return false;
          } else {
            return nodePos < thisPos;
          }
        };
        XMLNode2.prototype.isFollowing = function(node) {
          var nodePos, thisPos;
          nodePos = this.treePosition(node);
          thisPos = this.treePosition(this);
          if (nodePos === -1 || thisPos === -1) {
            return false;
          } else {
            return nodePos > thisPos;
          }
        };
        XMLNode2.prototype.treePosition = function(node) {
          var found, pos;
          pos = 0;
          found = false;
          this.foreachTreeNode(this.document(), function(childNode) {
            pos++;
            if (!found && childNode === node) {
              return found = true;
            }
          });
          if (found) {
            return pos;
          } else {
            return -1;
          }
        };
        XMLNode2.prototype.foreachTreeNode = function(node, func) {
          var child, j, len, ref2, res;
          node || (node = this.document());
          ref2 = node.children;
          for (j = 0, len = ref2.length; j < len; j++) {
            child = ref2[j];
            if (res = func(child)) {
              return res;
            } else {
              res = this.foreachTreeNode(child, func);
              if (res) {
                return res;
              }
            }
          }
        };
        return XMLNode2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLStringifier.js
var require_XMLStringifier = __commonJS({
  "node_modules/xmlbuilder/lib/XMLStringifier.js"(exports, module) {
    (function() {
      var XMLStringifier, bind = function(fn, me) {
        return function() {
          return fn.apply(me, arguments);
        };
      }, hasProp = {}.hasOwnProperty;
      module.exports = XMLStringifier = function() {
        function XMLStringifier2(options) {
          this.assertLegalName = bind(this.assertLegalName, this);
          this.assertLegalChar = bind(this.assertLegalChar, this);
          var key, ref, value;
          options || (options = {});
          this.options = options;
          if (!this.options.version) {
            this.options.version = "1.0";
          }
          ref = options.stringify || {};
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this[key] = value;
          }
        }
        XMLStringifier2.prototype.name = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalName("" + val || "");
        };
        XMLStringifier2.prototype.text = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar(this.textEscape("" + val || ""));
        };
        XMLStringifier2.prototype.cdata = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          val = val.replace("]]>", "]]]]><![CDATA[>");
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.comment = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (val.match(/--/)) {
            throw new Error("Comment text cannot contain double-hypen: " + val);
          }
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.raw = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return "" + val || "";
        };
        XMLStringifier2.prototype.attValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar(this.attEscape(val = "" + val || ""));
        };
        XMLStringifier2.prototype.insTarget = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.insValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (val.match(/\?>/)) {
            throw new Error("Invalid processing instruction value: " + val);
          }
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.xmlVersion = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (!val.match(/1\.[0-9]+/)) {
            throw new Error("Invalid version number: " + val);
          }
          return val;
        };
        XMLStringifier2.prototype.xmlEncoding = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          val = "" + val || "";
          if (!val.match(/^[A-Za-z](?:[A-Za-z0-9._-])*$/)) {
            throw new Error("Invalid encoding: " + val);
          }
          return this.assertLegalChar(val);
        };
        XMLStringifier2.prototype.xmlStandalone = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          if (val) {
            return "yes";
          } else {
            return "no";
          }
        };
        XMLStringifier2.prototype.dtdPubID = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdSysID = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdElementValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdAttType = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdAttDefault = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdEntityValue = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.dtdNData = function(val) {
          if (this.options.noValidation) {
            return val;
          }
          return this.assertLegalChar("" + val || "");
        };
        XMLStringifier2.prototype.convertAttKey = "@";
        XMLStringifier2.prototype.convertPIKey = "?";
        XMLStringifier2.prototype.convertTextKey = "#text";
        XMLStringifier2.prototype.convertCDataKey = "#cdata";
        XMLStringifier2.prototype.convertCommentKey = "#comment";
        XMLStringifier2.prototype.convertRawKey = "#raw";
        XMLStringifier2.prototype.assertLegalChar = function(str) {
          var regex, res;
          if (this.options.noValidation) {
            return str;
          }
          regex = "";
          if (this.options.version === "1.0") {
            regex = /[\0-\x08\x0B\f\x0E-\x1F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
            if (res = str.match(regex)) {
              throw new Error("Invalid character in string: " + str + " at index " + res.index);
            }
          } else if (this.options.version === "1.1") {
            regex = /[\0\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
            if (res = str.match(regex)) {
              throw new Error("Invalid character in string: " + str + " at index " + res.index);
            }
          }
          return str;
        };
        XMLStringifier2.prototype.assertLegalName = function(str) {
          var regex;
          if (this.options.noValidation) {
            return str;
          }
          this.assertLegalChar(str);
          regex = /^([:A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])([\x2D\.0-:A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;
          if (!str.match(regex)) {
            throw new Error("Invalid character in name");
          }
          return str;
        };
        XMLStringifier2.prototype.textEscape = function(str) {
          var ampregex;
          if (this.options.noValidation) {
            return str;
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
          return str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\r/g, "&#xD;");
        };
        XMLStringifier2.prototype.attEscape = function(str) {
          var ampregex;
          if (this.options.noValidation) {
            return str;
          }
          ampregex = this.options.noDoubleEncoding ? /(?!&\S+;)&/g : /&/g;
          return str.replace(ampregex, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/\t/g, "&#x9;").replace(/\n/g, "&#xA;").replace(/\r/g, "&#xD;");
        };
        return XMLStringifier2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/WriterState.js
var require_WriterState = __commonJS({
  "node_modules/xmlbuilder/lib/WriterState.js"(exports, module) {
    (function() {
      module.exports = {
        None: 0,
        OpenTag: 1,
        InsideTag: 2,
        CloseTag: 3
      };
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLWriterBase.js
var require_XMLWriterBase = __commonJS({
  "node_modules/xmlbuilder/lib/XMLWriterBase.js"(exports, module) {
    (function() {
      var NodeType, WriterState, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDummy, XMLElement, XMLProcessingInstruction, XMLRaw, XMLText, XMLWriterBase, assign, hasProp = {}.hasOwnProperty;
      assign = require_Utility().assign;
      NodeType = require_NodeType();
      XMLDeclaration = require_XMLDeclaration();
      XMLDocType = require_XMLDocType();
      XMLCData = require_XMLCData();
      XMLComment = require_XMLComment();
      XMLElement = require_XMLElement();
      XMLRaw = require_XMLRaw();
      XMLText = require_XMLText();
      XMLProcessingInstruction = require_XMLProcessingInstruction();
      XMLDummy = require_XMLDummy();
      XMLDTDAttList = require_XMLDTDAttList();
      XMLDTDElement = require_XMLDTDElement();
      XMLDTDEntity = require_XMLDTDEntity();
      XMLDTDNotation = require_XMLDTDNotation();
      WriterState = require_WriterState();
      module.exports = XMLWriterBase = function() {
        function XMLWriterBase2(options) {
          var key, ref, value;
          options || (options = {});
          this.options = options;
          ref = options.writer || {};
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this["_" + key] = this[key];
            this[key] = value;
          }
        }
        XMLWriterBase2.prototype.filterOptions = function(options) {
          var filteredOptions, ref, ref1, ref2, ref3, ref4, ref5, ref6;
          options || (options = {});
          options = assign({}, this.options, options);
          filteredOptions = {
            writer: this
          };
          filteredOptions.pretty = options.pretty || false;
          filteredOptions.allowEmpty = options.allowEmpty || false;
          filteredOptions.indent = (ref = options.indent) != null ? ref : "  ";
          filteredOptions.newline = (ref1 = options.newline) != null ? ref1 : "\n";
          filteredOptions.offset = (ref2 = options.offset) != null ? ref2 : 0;
          filteredOptions.dontPrettyTextNodes = (ref3 = (ref4 = options.dontPrettyTextNodes) != null ? ref4 : options.dontprettytextnodes) != null ? ref3 : 0;
          filteredOptions.spaceBeforeSlash = (ref5 = (ref6 = options.spaceBeforeSlash) != null ? ref6 : options.spacebeforeslash) != null ? ref5 : "";
          if (filteredOptions.spaceBeforeSlash === true) {
            filteredOptions.spaceBeforeSlash = " ";
          }
          filteredOptions.suppressPrettyCount = 0;
          filteredOptions.user = {};
          filteredOptions.state = WriterState.None;
          return filteredOptions;
        };
        XMLWriterBase2.prototype.indent = function(node, options, level) {
          var indentLevel;
          if (!options.pretty || options.suppressPrettyCount) {
            return "";
          } else if (options.pretty) {
            indentLevel = (level || 0) + options.offset + 1;
            if (indentLevel > 0) {
              return new Array(indentLevel).join(options.indent);
            }
          }
          return "";
        };
        XMLWriterBase2.prototype.endline = function(node, options, level) {
          if (!options.pretty || options.suppressPrettyCount) {
            return "";
          } else {
            return options.newline;
          }
        };
        XMLWriterBase2.prototype.attribute = function(att, options, level) {
          var r;
          this.openAttribute(att, options, level);
          r = " " + att.name + '="' + att.value + '"';
          this.closeAttribute(att, options, level);
          return r;
        };
        XMLWriterBase2.prototype.cdata = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<![CDATA[";
          options.state = WriterState.InsideTag;
          r += node.value;
          options.state = WriterState.CloseTag;
          r += "]]>" + this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.comment = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<!-- ";
          options.state = WriterState.InsideTag;
          r += node.value;
          options.state = WriterState.CloseTag;
          r += " -->" + this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.declaration = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<?xml";
          options.state = WriterState.InsideTag;
          r += ' version="' + node.version + '"';
          if (node.encoding != null) {
            r += ' encoding="' + node.encoding + '"';
          }
          if (node.standalone != null) {
            r += ' standalone="' + node.standalone + '"';
          }
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + "?>";
          r += this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.docType = function(node, options, level) {
          var child, i, len, r, ref;
          level || (level = 0);
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level);
          r += "<!DOCTYPE " + node.root().name;
          if (node.pubID && node.sysID) {
            r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
          } else if (node.sysID) {
            r += ' SYSTEM "' + node.sysID + '"';
          }
          if (node.children.length > 0) {
            r += " [";
            r += this.endline(node, options, level);
            options.state = WriterState.InsideTag;
            ref = node.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              r += this.writeChildNode(child, options, level + 1);
            }
            options.state = WriterState.CloseTag;
            r += "]";
          }
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + ">";
          r += this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.element = function(node, options, level) {
          var att, child, childNodeCount, firstChildNode, i, j, len, len1, name, prettySuppressed, r, ref, ref1, ref2;
          level || (level = 0);
          prettySuppressed = false;
          r = "";
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r += this.indent(node, options, level) + "<" + node.name;
          ref = node.attribs;
          for (name in ref) {
            if (!hasProp.call(ref, name))
              continue;
            att = ref[name];
            r += this.attribute(att, options, level);
          }
          childNodeCount = node.children.length;
          firstChildNode = childNodeCount === 0 ? null : node.children[0];
          if (childNodeCount === 0 || node.children.every(function(e) {
            return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === "";
          })) {
            if (options.allowEmpty) {
              r += ">";
              options.state = WriterState.CloseTag;
              r += "</" + node.name + ">" + this.endline(node, options, level);
            } else {
              options.state = WriterState.CloseTag;
              r += options.spaceBeforeSlash + "/>" + this.endline(node, options, level);
            }
          } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && firstChildNode.value != null) {
            r += ">";
            options.state = WriterState.InsideTag;
            options.suppressPrettyCount++;
            prettySuppressed = true;
            r += this.writeChildNode(firstChildNode, options, level + 1);
            options.suppressPrettyCount--;
            prettySuppressed = false;
            options.state = WriterState.CloseTag;
            r += "</" + node.name + ">" + this.endline(node, options, level);
          } else {
            if (options.dontPrettyTextNodes) {
              ref1 = node.children;
              for (i = 0, len = ref1.length; i < len; i++) {
                child = ref1[i];
                if ((child.type === NodeType.Text || child.type === NodeType.Raw) && child.value != null) {
                  options.suppressPrettyCount++;
                  prettySuppressed = true;
                  break;
                }
              }
            }
            r += ">" + this.endline(node, options, level);
            options.state = WriterState.InsideTag;
            ref2 = node.children;
            for (j = 0, len1 = ref2.length; j < len1; j++) {
              child = ref2[j];
              r += this.writeChildNode(child, options, level + 1);
            }
            options.state = WriterState.CloseTag;
            r += this.indent(node, options, level) + "</" + node.name + ">";
            if (prettySuppressed) {
              options.suppressPrettyCount--;
            }
            r += this.endline(node, options, level);
            options.state = WriterState.None;
          }
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.writeChildNode = function(node, options, level) {
          switch (node.type) {
            case NodeType.CData:
              return this.cdata(node, options, level);
            case NodeType.Comment:
              return this.comment(node, options, level);
            case NodeType.Element:
              return this.element(node, options, level);
            case NodeType.Raw:
              return this.raw(node, options, level);
            case NodeType.Text:
              return this.text(node, options, level);
            case NodeType.ProcessingInstruction:
              return this.processingInstruction(node, options, level);
            case NodeType.Dummy:
              return "";
            case NodeType.Declaration:
              return this.declaration(node, options, level);
            case NodeType.DocType:
              return this.docType(node, options, level);
            case NodeType.AttributeDeclaration:
              return this.dtdAttList(node, options, level);
            case NodeType.ElementDeclaration:
              return this.dtdElement(node, options, level);
            case NodeType.EntityDeclaration:
              return this.dtdEntity(node, options, level);
            case NodeType.NotationDeclaration:
              return this.dtdNotation(node, options, level);
            default:
              throw new Error("Unknown XML node type: " + node.constructor.name);
          }
        };
        XMLWriterBase2.prototype.processingInstruction = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<?";
          options.state = WriterState.InsideTag;
          r += node.target;
          if (node.value) {
            r += " " + node.value;
          }
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + "?>";
          r += this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.raw = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level);
          options.state = WriterState.InsideTag;
          r += node.value;
          options.state = WriterState.CloseTag;
          r += this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.text = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level);
          options.state = WriterState.InsideTag;
          r += node.value;
          options.state = WriterState.CloseTag;
          r += this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdAttList = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<!ATTLIST";
          options.state = WriterState.InsideTag;
          r += " " + node.elementName + " " + node.attributeName + " " + node.attributeType;
          if (node.defaultValueType !== "#DEFAULT") {
            r += " " + node.defaultValueType;
          }
          if (node.defaultValue) {
            r += ' "' + node.defaultValue + '"';
          }
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdElement = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<!ELEMENT";
          options.state = WriterState.InsideTag;
          r += " " + node.name + " " + node.value;
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdEntity = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<!ENTITY";
          options.state = WriterState.InsideTag;
          if (node.pe) {
            r += " %";
          }
          r += " " + node.name;
          if (node.value) {
            r += ' "' + node.value + '"';
          } else {
            if (node.pubID && node.sysID) {
              r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
            } else if (node.sysID) {
              r += ' SYSTEM "' + node.sysID + '"';
            }
            if (node.nData) {
              r += " NDATA " + node.nData;
            }
          }
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.dtdNotation = function(node, options, level) {
          var r;
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          r = this.indent(node, options, level) + "<!NOTATION";
          options.state = WriterState.InsideTag;
          r += " " + node.name;
          if (node.pubID && node.sysID) {
            r += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
          } else if (node.pubID) {
            r += ' PUBLIC "' + node.pubID + '"';
          } else if (node.sysID) {
            r += ' SYSTEM "' + node.sysID + '"';
          }
          options.state = WriterState.CloseTag;
          r += options.spaceBeforeSlash + ">" + this.endline(node, options, level);
          options.state = WriterState.None;
          this.closeNode(node, options, level);
          return r;
        };
        XMLWriterBase2.prototype.openNode = function(node, options, level) {
        };
        XMLWriterBase2.prototype.closeNode = function(node, options, level) {
        };
        XMLWriterBase2.prototype.openAttribute = function(att, options, level) {
        };
        XMLWriterBase2.prototype.closeAttribute = function(att, options, level) {
        };
        return XMLWriterBase2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLStringWriter.js
var require_XMLStringWriter = __commonJS({
  "node_modules/xmlbuilder/lib/XMLStringWriter.js"(exports, module) {
    (function() {
      var XMLStringWriter, XMLWriterBase, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      XMLWriterBase = require_XMLWriterBase();
      module.exports = XMLStringWriter = function(superClass) {
        extend(XMLStringWriter2, superClass);
        function XMLStringWriter2(options) {
          XMLStringWriter2.__super__.constructor.call(this, options);
        }
        XMLStringWriter2.prototype.document = function(doc, options) {
          var child, i, len, r, ref;
          options = this.filterOptions(options);
          r = "";
          ref = doc.children;
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            r += this.writeChildNode(child, options, 0);
          }
          if (options.pretty && r.slice(-options.newline.length) === options.newline) {
            r = r.slice(0, -options.newline.length);
          }
          return r;
        };
        return XMLStringWriter2;
      }(XMLWriterBase);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDocument.js
var require_XMLDocument = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDocument.js"(exports, module) {
    (function() {
      var NodeType, XMLDOMConfiguration, XMLDOMImplementation, XMLDocument, XMLNode, XMLStringWriter, XMLStringifier, isPlainObject, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      isPlainObject = require_Utility().isPlainObject;
      XMLDOMImplementation = require_XMLDOMImplementation();
      XMLDOMConfiguration = require_XMLDOMConfiguration();
      XMLNode = require_XMLNode();
      NodeType = require_NodeType();
      XMLStringifier = require_XMLStringifier();
      XMLStringWriter = require_XMLStringWriter();
      module.exports = XMLDocument = function(superClass) {
        extend(XMLDocument2, superClass);
        function XMLDocument2(options) {
          XMLDocument2.__super__.constructor.call(this, null);
          this.name = "#document";
          this.type = NodeType.Document;
          this.documentURI = null;
          this.domConfig = new XMLDOMConfiguration();
          options || (options = {});
          if (!options.writer) {
            options.writer = new XMLStringWriter();
          }
          this.options = options;
          this.stringify = new XMLStringifier(options);
        }
        Object.defineProperty(XMLDocument2.prototype, "implementation", {
          value: new XMLDOMImplementation()
        });
        Object.defineProperty(XMLDocument2.prototype, "doctype", {
          get: function() {
            var child, i, len, ref;
            ref = this.children;
            for (i = 0, len = ref.length; i < len; i++) {
              child = ref[i];
              if (child.type === NodeType.DocType) {
                return child;
              }
            }
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "documentElement", {
          get: function() {
            return this.rootObject || null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "inputEncoding", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "strictErrorChecking", {
          get: function() {
            return false;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "xmlEncoding", {
          get: function() {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].encoding;
            } else {
              return null;
            }
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "xmlStandalone", {
          get: function() {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].standalone === "yes";
            } else {
              return false;
            }
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "xmlVersion", {
          get: function() {
            if (this.children.length !== 0 && this.children[0].type === NodeType.Declaration) {
              return this.children[0].version;
            } else {
              return "1.0";
            }
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "URL", {
          get: function() {
            return this.documentURI;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "origin", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "compatMode", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "characterSet", {
          get: function() {
            return null;
          }
        });
        Object.defineProperty(XMLDocument2.prototype, "contentType", {
          get: function() {
            return null;
          }
        });
        XMLDocument2.prototype.end = function(writer) {
          var writerOptions;
          writerOptions = {};
          if (!writer) {
            writer = this.options.writer;
          } else if (isPlainObject(writer)) {
            writerOptions = writer;
            writer = this.options.writer;
          }
          return writer.document(this, writer.filterOptions(writerOptions));
        };
        XMLDocument2.prototype.toString = function(options) {
          return this.options.writer.document(this, this.options.writer.filterOptions(options));
        };
        XMLDocument2.prototype.createElement = function(tagName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createDocumentFragment = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createTextNode = function(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createComment = function(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createCDATASection = function(data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createProcessingInstruction = function(target, data) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createAttribute = function(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createEntityReference = function(name) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementsByTagName = function(tagname) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.importNode = function(importedNode, deep) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createElementNS = function(namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createAttributeNS = function(namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementsByTagNameNS = function(namespaceURI, localName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementById = function(elementId) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.adoptNode = function(source) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.normalizeDocument = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.renameNode = function(node, namespaceURI, qualifiedName) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.getElementsByClassName = function(classNames) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createEvent = function(eventInterface) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createRange = function() {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createNodeIterator = function(root, whatToShow, filter) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        XMLDocument2.prototype.createTreeWalker = function(root, whatToShow, filter) {
          throw new Error("This DOM method is not implemented." + this.debugInfo());
        };
        return XMLDocument2;
      }(XMLNode);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLDocumentCB.js
var require_XMLDocumentCB = __commonJS({
  "node_modules/xmlbuilder/lib/XMLDocumentCB.js"(exports, module) {
    (function() {
      var NodeType, WriterState, XMLAttribute, XMLCData, XMLComment, XMLDTDAttList, XMLDTDElement, XMLDTDEntity, XMLDTDNotation, XMLDeclaration, XMLDocType, XMLDocument, XMLDocumentCB, XMLElement, XMLProcessingInstruction, XMLRaw, XMLStringWriter, XMLStringifier, XMLText, getValue, isFunction, isObject, isPlainObject, ref, hasProp = {}.hasOwnProperty;
      ref = require_Utility(), isObject = ref.isObject, isFunction = ref.isFunction, isPlainObject = ref.isPlainObject, getValue = ref.getValue;
      NodeType = require_NodeType();
      XMLDocument = require_XMLDocument();
      XMLElement = require_XMLElement();
      XMLCData = require_XMLCData();
      XMLComment = require_XMLComment();
      XMLRaw = require_XMLRaw();
      XMLText = require_XMLText();
      XMLProcessingInstruction = require_XMLProcessingInstruction();
      XMLDeclaration = require_XMLDeclaration();
      XMLDocType = require_XMLDocType();
      XMLDTDAttList = require_XMLDTDAttList();
      XMLDTDEntity = require_XMLDTDEntity();
      XMLDTDElement = require_XMLDTDElement();
      XMLDTDNotation = require_XMLDTDNotation();
      XMLAttribute = require_XMLAttribute();
      XMLStringifier = require_XMLStringifier();
      XMLStringWriter = require_XMLStringWriter();
      WriterState = require_WriterState();
      module.exports = XMLDocumentCB = function() {
        function XMLDocumentCB2(options, onData, onEnd) {
          var writerOptions;
          this.name = "?xml";
          this.type = NodeType.Document;
          options || (options = {});
          writerOptions = {};
          if (!options.writer) {
            options.writer = new XMLStringWriter();
          } else if (isPlainObject(options.writer)) {
            writerOptions = options.writer;
            options.writer = new XMLStringWriter();
          }
          this.options = options;
          this.writer = options.writer;
          this.writerOptions = this.writer.filterOptions(writerOptions);
          this.stringify = new XMLStringifier(options);
          this.onDataCallback = onData || function() {
          };
          this.onEndCallback = onEnd || function() {
          };
          this.currentNode = null;
          this.currentLevel = -1;
          this.openTags = {};
          this.documentStarted = false;
          this.documentCompleted = false;
          this.root = null;
        }
        XMLDocumentCB2.prototype.createChildNode = function(node) {
          var att, attName, attributes, child, i, len, ref1, ref2;
          switch (node.type) {
            case NodeType.CData:
              this.cdata(node.value);
              break;
            case NodeType.Comment:
              this.comment(node.value);
              break;
            case NodeType.Element:
              attributes = {};
              ref1 = node.attribs;
              for (attName in ref1) {
                if (!hasProp.call(ref1, attName))
                  continue;
                att = ref1[attName];
                attributes[attName] = att.value;
              }
              this.node(node.name, attributes);
              break;
            case NodeType.Dummy:
              this.dummy();
              break;
            case NodeType.Raw:
              this.raw(node.value);
              break;
            case NodeType.Text:
              this.text(node.value);
              break;
            case NodeType.ProcessingInstruction:
              this.instruction(node.target, node.value);
              break;
            default:
              throw new Error("This XML node type is not supported in a JS object: " + node.constructor.name);
          }
          ref2 = node.children;
          for (i = 0, len = ref2.length; i < len; i++) {
            child = ref2[i];
            this.createChildNode(child);
            if (child.type === NodeType.Element) {
              this.up();
            }
          }
          return this;
        };
        XMLDocumentCB2.prototype.dummy = function() {
          return this;
        };
        XMLDocumentCB2.prototype.node = function(name, attributes, text) {
          var ref1;
          if (name == null) {
            throw new Error("Missing node name.");
          }
          if (this.root && this.currentLevel === -1) {
            throw new Error("Document can only have one root node. " + this.debugInfo(name));
          }
          this.openCurrent();
          name = getValue(name);
          if (attributes == null) {
            attributes = {};
          }
          attributes = getValue(attributes);
          if (!isObject(attributes)) {
            ref1 = [attributes, text], text = ref1[0], attributes = ref1[1];
          }
          this.currentNode = new XMLElement(this, name, attributes);
          this.currentNode.children = false;
          this.currentLevel++;
          this.openTags[this.currentLevel] = this.currentNode;
          if (text != null) {
            this.text(text);
          }
          return this;
        };
        XMLDocumentCB2.prototype.element = function(name, attributes, text) {
          var child, i, len, oldValidationFlag, ref1, root;
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            this.dtdElement.apply(this, arguments);
          } else {
            if (Array.isArray(name) || isObject(name) || isFunction(name)) {
              oldValidationFlag = this.options.noValidation;
              this.options.noValidation = true;
              root = new XMLDocument(this.options).element("TEMP_ROOT");
              root.element(name);
              this.options.noValidation = oldValidationFlag;
              ref1 = root.children;
              for (i = 0, len = ref1.length; i < len; i++) {
                child = ref1[i];
                this.createChildNode(child);
                if (child.type === NodeType.Element) {
                  this.up();
                }
              }
            } else {
              this.node(name, attributes, text);
            }
          }
          return this;
        };
        XMLDocumentCB2.prototype.attribute = function(name, value) {
          var attName, attValue;
          if (!this.currentNode || this.currentNode.children) {
            throw new Error("att() can only be used immediately after an ele() call in callback mode. " + this.debugInfo(name));
          }
          if (name != null) {
            name = getValue(name);
          }
          if (isObject(name)) {
            for (attName in name) {
              if (!hasProp.call(name, attName))
                continue;
              attValue = name[attName];
              this.attribute(attName, attValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            if (this.options.keepNullAttributes && value == null) {
              this.currentNode.attribs[name] = new XMLAttribute(this, name, "");
            } else if (value != null) {
              this.currentNode.attribs[name] = new XMLAttribute(this, name, value);
            }
          }
          return this;
        };
        XMLDocumentCB2.prototype.text = function(value) {
          var node;
          this.openCurrent();
          node = new XMLText(this, value);
          this.onData(this.writer.text(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.cdata = function(value) {
          var node;
          this.openCurrent();
          node = new XMLCData(this, value);
          this.onData(this.writer.cdata(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.comment = function(value) {
          var node;
          this.openCurrent();
          node = new XMLComment(this, value);
          this.onData(this.writer.comment(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.raw = function(value) {
          var node;
          this.openCurrent();
          node = new XMLRaw(this, value);
          this.onData(this.writer.raw(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.instruction = function(target, value) {
          var i, insTarget, insValue, len, node;
          this.openCurrent();
          if (target != null) {
            target = getValue(target);
          }
          if (value != null) {
            value = getValue(value);
          }
          if (Array.isArray(target)) {
            for (i = 0, len = target.length; i < len; i++) {
              insTarget = target[i];
              this.instruction(insTarget);
            }
          } else if (isObject(target)) {
            for (insTarget in target) {
              if (!hasProp.call(target, insTarget))
                continue;
              insValue = target[insTarget];
              this.instruction(insTarget, insValue);
            }
          } else {
            if (isFunction(value)) {
              value = value.apply();
            }
            node = new XMLProcessingInstruction(this, target, value);
            this.onData(this.writer.processingInstruction(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          }
          return this;
        };
        XMLDocumentCB2.prototype.declaration = function(version, encoding, standalone) {
          var node;
          this.openCurrent();
          if (this.documentStarted) {
            throw new Error("declaration() must be the first node.");
          }
          node = new XMLDeclaration(this, version, encoding, standalone);
          this.onData(this.writer.declaration(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.doctype = function(root, pubID, sysID) {
          this.openCurrent();
          if (root == null) {
            throw new Error("Missing root node name.");
          }
          if (this.root) {
            throw new Error("dtd() must come before the root node.");
          }
          this.currentNode = new XMLDocType(this, pubID, sysID);
          this.currentNode.rootNodeName = root;
          this.currentNode.children = false;
          this.currentLevel++;
          this.openTags[this.currentLevel] = this.currentNode;
          return this;
        };
        XMLDocumentCB2.prototype.dtdElement = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDElement(this, name, value);
          this.onData(this.writer.dtdElement(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.attList = function(elementName, attributeName, attributeType, defaultValueType, defaultValue) {
          var node;
          this.openCurrent();
          node = new XMLDTDAttList(this, elementName, attributeName, attributeType, defaultValueType, defaultValue);
          this.onData(this.writer.dtdAttList(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.entity = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDEntity(this, false, name, value);
          this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.pEntity = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDEntity(this, true, name, value);
          this.onData(this.writer.dtdEntity(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.notation = function(name, value) {
          var node;
          this.openCurrent();
          node = new XMLDTDNotation(this, name, value);
          this.onData(this.writer.dtdNotation(node, this.writerOptions, this.currentLevel + 1), this.currentLevel + 1);
          return this;
        };
        XMLDocumentCB2.prototype.up = function() {
          if (this.currentLevel < 0) {
            throw new Error("The document node has no parent.");
          }
          if (this.currentNode) {
            if (this.currentNode.children) {
              this.closeNode(this.currentNode);
            } else {
              this.openNode(this.currentNode);
            }
            this.currentNode = null;
          } else {
            this.closeNode(this.openTags[this.currentLevel]);
          }
          delete this.openTags[this.currentLevel];
          this.currentLevel--;
          return this;
        };
        XMLDocumentCB2.prototype.end = function() {
          while (this.currentLevel >= 0) {
            this.up();
          }
          return this.onEnd();
        };
        XMLDocumentCB2.prototype.openCurrent = function() {
          if (this.currentNode) {
            this.currentNode.children = true;
            return this.openNode(this.currentNode);
          }
        };
        XMLDocumentCB2.prototype.openNode = function(node) {
          var att, chunk, name, ref1;
          if (!node.isOpen) {
            if (!this.root && this.currentLevel === 0 && node.type === NodeType.Element) {
              this.root = node;
            }
            chunk = "";
            if (node.type === NodeType.Element) {
              this.writerOptions.state = WriterState.OpenTag;
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "<" + node.name;
              ref1 = node.attribs;
              for (name in ref1) {
                if (!hasProp.call(ref1, name))
                  continue;
                att = ref1[name];
                chunk += this.writer.attribute(att, this.writerOptions, this.currentLevel);
              }
              chunk += (node.children ? ">" : "/>") + this.writer.endline(node, this.writerOptions, this.currentLevel);
              this.writerOptions.state = WriterState.InsideTag;
            } else {
              this.writerOptions.state = WriterState.OpenTag;
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "<!DOCTYPE " + node.rootNodeName;
              if (node.pubID && node.sysID) {
                chunk += ' PUBLIC "' + node.pubID + '" "' + node.sysID + '"';
              } else if (node.sysID) {
                chunk += ' SYSTEM "' + node.sysID + '"';
              }
              if (node.children) {
                chunk += " [";
                this.writerOptions.state = WriterState.InsideTag;
              } else {
                this.writerOptions.state = WriterState.CloseTag;
                chunk += ">";
              }
              chunk += this.writer.endline(node, this.writerOptions, this.currentLevel);
            }
            this.onData(chunk, this.currentLevel);
            return node.isOpen = true;
          }
        };
        XMLDocumentCB2.prototype.closeNode = function(node) {
          var chunk;
          if (!node.isClosed) {
            chunk = "";
            this.writerOptions.state = WriterState.CloseTag;
            if (node.type === NodeType.Element) {
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "</" + node.name + ">" + this.writer.endline(node, this.writerOptions, this.currentLevel);
            } else {
              chunk = this.writer.indent(node, this.writerOptions, this.currentLevel) + "]>" + this.writer.endline(node, this.writerOptions, this.currentLevel);
            }
            this.writerOptions.state = WriterState.None;
            this.onData(chunk, this.currentLevel);
            return node.isClosed = true;
          }
        };
        XMLDocumentCB2.prototype.onData = function(chunk, level) {
          this.documentStarted = true;
          return this.onDataCallback(chunk, level + 1);
        };
        XMLDocumentCB2.prototype.onEnd = function() {
          this.documentCompleted = true;
          return this.onEndCallback();
        };
        XMLDocumentCB2.prototype.debugInfo = function(name) {
          if (name == null) {
            return "";
          } else {
            return "node: <" + name + ">";
          }
        };
        XMLDocumentCB2.prototype.ele = function() {
          return this.element.apply(this, arguments);
        };
        XMLDocumentCB2.prototype.nod = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLDocumentCB2.prototype.txt = function(value) {
          return this.text(value);
        };
        XMLDocumentCB2.prototype.dat = function(value) {
          return this.cdata(value);
        };
        XMLDocumentCB2.prototype.com = function(value) {
          return this.comment(value);
        };
        XMLDocumentCB2.prototype.ins = function(target, value) {
          return this.instruction(target, value);
        };
        XMLDocumentCB2.prototype.dec = function(version, encoding, standalone) {
          return this.declaration(version, encoding, standalone);
        };
        XMLDocumentCB2.prototype.dtd = function(root, pubID, sysID) {
          return this.doctype(root, pubID, sysID);
        };
        XMLDocumentCB2.prototype.e = function(name, attributes, text) {
          return this.element(name, attributes, text);
        };
        XMLDocumentCB2.prototype.n = function(name, attributes, text) {
          return this.node(name, attributes, text);
        };
        XMLDocumentCB2.prototype.t = function(value) {
          return this.text(value);
        };
        XMLDocumentCB2.prototype.d = function(value) {
          return this.cdata(value);
        };
        XMLDocumentCB2.prototype.c = function(value) {
          return this.comment(value);
        };
        XMLDocumentCB2.prototype.r = function(value) {
          return this.raw(value);
        };
        XMLDocumentCB2.prototype.i = function(target, value) {
          return this.instruction(target, value);
        };
        XMLDocumentCB2.prototype.att = function() {
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            return this.attList.apply(this, arguments);
          } else {
            return this.attribute.apply(this, arguments);
          }
        };
        XMLDocumentCB2.prototype.a = function() {
          if (this.currentNode && this.currentNode.type === NodeType.DocType) {
            return this.attList.apply(this, arguments);
          } else {
            return this.attribute.apply(this, arguments);
          }
        };
        XMLDocumentCB2.prototype.ent = function(name, value) {
          return this.entity(name, value);
        };
        XMLDocumentCB2.prototype.pent = function(name, value) {
          return this.pEntity(name, value);
        };
        XMLDocumentCB2.prototype.not = function(name, value) {
          return this.notation(name, value);
        };
        return XMLDocumentCB2;
      }();
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/XMLStreamWriter.js
var require_XMLStreamWriter = __commonJS({
  "node_modules/xmlbuilder/lib/XMLStreamWriter.js"(exports, module) {
    (function() {
      var NodeType, WriterState, XMLStreamWriter, XMLWriterBase, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      NodeType = require_NodeType();
      XMLWriterBase = require_XMLWriterBase();
      WriterState = require_WriterState();
      module.exports = XMLStreamWriter = function(superClass) {
        extend(XMLStreamWriter2, superClass);
        function XMLStreamWriter2(stream, options) {
          this.stream = stream;
          XMLStreamWriter2.__super__.constructor.call(this, options);
        }
        XMLStreamWriter2.prototype.endline = function(node, options, level) {
          if (node.isLastRootNode && options.state === WriterState.CloseTag) {
            return "";
          } else {
            return XMLStreamWriter2.__super__.endline.call(this, node, options, level);
          }
        };
        XMLStreamWriter2.prototype.document = function(doc, options) {
          var child, i, j, k, len, len1, ref, ref1, results;
          ref = doc.children;
          for (i = j = 0, len = ref.length; j < len; i = ++j) {
            child = ref[i];
            child.isLastRootNode = i === doc.children.length - 1;
          }
          options = this.filterOptions(options);
          ref1 = doc.children;
          results = [];
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            child = ref1[k];
            results.push(this.writeChildNode(child, options, 0));
          }
          return results;
        };
        XMLStreamWriter2.prototype.attribute = function(att, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.attribute.call(this, att, options, level));
        };
        XMLStreamWriter2.prototype.cdata = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.cdata.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.comment = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.comment.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.declaration = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.declaration.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.docType = function(node, options, level) {
          var child, j, len, ref;
          level || (level = 0);
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          this.stream.write(this.indent(node, options, level));
          this.stream.write("<!DOCTYPE " + node.root().name);
          if (node.pubID && node.sysID) {
            this.stream.write(' PUBLIC "' + node.pubID + '" "' + node.sysID + '"');
          } else if (node.sysID) {
            this.stream.write(' SYSTEM "' + node.sysID + '"');
          }
          if (node.children.length > 0) {
            this.stream.write(" [");
            this.stream.write(this.endline(node, options, level));
            options.state = WriterState.InsideTag;
            ref = node.children;
            for (j = 0, len = ref.length; j < len; j++) {
              child = ref[j];
              this.writeChildNode(child, options, level + 1);
            }
            options.state = WriterState.CloseTag;
            this.stream.write("]");
          }
          options.state = WriterState.CloseTag;
          this.stream.write(options.spaceBeforeSlash + ">");
          this.stream.write(this.endline(node, options, level));
          options.state = WriterState.None;
          return this.closeNode(node, options, level);
        };
        XMLStreamWriter2.prototype.element = function(node, options, level) {
          var att, child, childNodeCount, firstChildNode, j, len, name, prettySuppressed, ref, ref1;
          level || (level = 0);
          this.openNode(node, options, level);
          options.state = WriterState.OpenTag;
          this.stream.write(this.indent(node, options, level) + "<" + node.name);
          ref = node.attribs;
          for (name in ref) {
            if (!hasProp.call(ref, name))
              continue;
            att = ref[name];
            this.attribute(att, options, level);
          }
          childNodeCount = node.children.length;
          firstChildNode = childNodeCount === 0 ? null : node.children[0];
          if (childNodeCount === 0 || node.children.every(function(e) {
            return (e.type === NodeType.Text || e.type === NodeType.Raw) && e.value === "";
          })) {
            if (options.allowEmpty) {
              this.stream.write(">");
              options.state = WriterState.CloseTag;
              this.stream.write("</" + node.name + ">");
            } else {
              options.state = WriterState.CloseTag;
              this.stream.write(options.spaceBeforeSlash + "/>");
            }
          } else if (options.pretty && childNodeCount === 1 && (firstChildNode.type === NodeType.Text || firstChildNode.type === NodeType.Raw) && firstChildNode.value != null) {
            this.stream.write(">");
            options.state = WriterState.InsideTag;
            options.suppressPrettyCount++;
            prettySuppressed = true;
            this.writeChildNode(firstChildNode, options, level + 1);
            options.suppressPrettyCount--;
            prettySuppressed = false;
            options.state = WriterState.CloseTag;
            this.stream.write("</" + node.name + ">");
          } else {
            this.stream.write(">" + this.endline(node, options, level));
            options.state = WriterState.InsideTag;
            ref1 = node.children;
            for (j = 0, len = ref1.length; j < len; j++) {
              child = ref1[j];
              this.writeChildNode(child, options, level + 1);
            }
            options.state = WriterState.CloseTag;
            this.stream.write(this.indent(node, options, level) + "</" + node.name + ">");
          }
          this.stream.write(this.endline(node, options, level));
          options.state = WriterState.None;
          return this.closeNode(node, options, level);
        };
        XMLStreamWriter2.prototype.processingInstruction = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.processingInstruction.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.raw = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.raw.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.text = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.text.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.dtdAttList = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdAttList.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.dtdElement = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdElement.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.dtdEntity = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdEntity.call(this, node, options, level));
        };
        XMLStreamWriter2.prototype.dtdNotation = function(node, options, level) {
          return this.stream.write(XMLStreamWriter2.__super__.dtdNotation.call(this, node, options, level));
        };
        return XMLStreamWriter2;
      }(XMLWriterBase);
    }).call(exports);
  }
});

// node_modules/xmlbuilder/lib/index.js
var require_lib = __commonJS({
  "node_modules/xmlbuilder/lib/index.js"(exports, module) {
    (function() {
      var NodeType, WriterState, XMLDOMImplementation, XMLDocument, XMLDocumentCB, XMLStreamWriter, XMLStringWriter, assign, isFunction, ref;
      ref = require_Utility(), assign = ref.assign, isFunction = ref.isFunction;
      XMLDOMImplementation = require_XMLDOMImplementation();
      XMLDocument = require_XMLDocument();
      XMLDocumentCB = require_XMLDocumentCB();
      XMLStringWriter = require_XMLStringWriter();
      XMLStreamWriter = require_XMLStreamWriter();
      NodeType = require_NodeType();
      WriterState = require_WriterState();
      module.exports.create = function(name, xmldec, doctype, options) {
        var doc, root;
        if (name == null) {
          throw new Error("Root element needs a name.");
        }
        options = assign({}, xmldec, doctype, options);
        doc = new XMLDocument(options);
        root = doc.element(name);
        if (!options.headless) {
          doc.declaration(options);
          if (options.pubID != null || options.sysID != null) {
            doc.dtd(options);
          }
        }
        return root;
      };
      module.exports.begin = function(options, onData, onEnd) {
        var ref1;
        if (isFunction(options)) {
          ref1 = [options, onData], onData = ref1[0], onEnd = ref1[1];
          options = {};
        }
        if (onData) {
          return new XMLDocumentCB(options, onData, onEnd);
        } else {
          return new XMLDocument(options);
        }
      };
      module.exports.stringWriter = function(options) {
        return new XMLStringWriter(options);
      };
      module.exports.streamWriter = function(stream, options) {
        return new XMLStreamWriter(stream, options);
      };
      module.exports.implementation = new XMLDOMImplementation();
      module.exports.nodeType = NodeType;
      module.exports.writerState = WriterState;
    }).call(exports);
  }
});

// node_modules/xml2js/lib/builder.js
var require_builder = __commonJS({
  "node_modules/xml2js/lib/builder.js"(exports) {
    (function() {
      "use strict";
      var builder, defaults, escapeCDATA, requiresCDATA, wrapCDATA, hasProp = {}.hasOwnProperty;
      builder = require_lib();
      defaults = require_defaults().defaults;
      requiresCDATA = function(entry) {
        return typeof entry === "string" && (entry.indexOf("&") >= 0 || entry.indexOf(">") >= 0 || entry.indexOf("<") >= 0);
      };
      wrapCDATA = function(entry) {
        return "<![CDATA[" + escapeCDATA(entry) + "]]>";
      };
      escapeCDATA = function(entry) {
        return entry.replace("]]>", "]]]]><![CDATA[>");
      };
      exports.Builder = function() {
        function Builder(opts) {
          var key, ref, value;
          this.options = {};
          ref = defaults["0.2"];
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this.options[key] = value;
          }
          for (key in opts) {
            if (!hasProp.call(opts, key))
              continue;
            value = opts[key];
            this.options[key] = value;
          }
        }
        Builder.prototype.buildObject = function(rootObj) {
          var attrkey, charkey, render, rootElement, rootName;
          attrkey = this.options.attrkey;
          charkey = this.options.charkey;
          if (Object.keys(rootObj).length === 1 && this.options.rootName === defaults["0.2"].rootName) {
            rootName = Object.keys(rootObj)[0];
            rootObj = rootObj[rootName];
          } else {
            rootName = this.options.rootName;
          }
          render = function(_this) {
            return function(element, obj) {
              var attr, child, entry, index, key, value;
              if (typeof obj !== "object") {
                if (_this.options.cdata && requiresCDATA(obj)) {
                  element.raw(wrapCDATA(obj));
                } else {
                  element.txt(obj);
                }
              } else if (Array.isArray(obj)) {
                for (index in obj) {
                  if (!hasProp.call(obj, index))
                    continue;
                  child = obj[index];
                  for (key in child) {
                    entry = child[key];
                    element = render(element.ele(key), entry).up();
                  }
                }
              } else {
                for (key in obj) {
                  if (!hasProp.call(obj, key))
                    continue;
                  child = obj[key];
                  if (key === attrkey) {
                    if (typeof child === "object") {
                      for (attr in child) {
                        value = child[attr];
                        element = element.att(attr, value);
                      }
                    }
                  } else if (key === charkey) {
                    if (_this.options.cdata && requiresCDATA(child)) {
                      element = element.raw(wrapCDATA(child));
                    } else {
                      element = element.txt(child);
                    }
                  } else if (Array.isArray(child)) {
                    for (index in child) {
                      if (!hasProp.call(child, index))
                        continue;
                      entry = child[index];
                      if (typeof entry === "string") {
                        if (_this.options.cdata && requiresCDATA(entry)) {
                          element = element.ele(key).raw(wrapCDATA(entry)).up();
                        } else {
                          element = element.ele(key, entry).up();
                        }
                      } else {
                        element = render(element.ele(key), entry).up();
                      }
                    }
                  } else if (typeof child === "object") {
                    element = render(element.ele(key), child).up();
                  } else {
                    if (typeof child === "string" && _this.options.cdata && requiresCDATA(child)) {
                      element = element.ele(key).raw(wrapCDATA(child)).up();
                    } else {
                      if (child == null) {
                        child = "";
                      }
                      element = element.ele(key, child.toString()).up();
                    }
                  }
                }
              }
              return element;
            };
          }(this);
          rootElement = builder.create(rootName, this.options.xmldec, this.options.doctype, {
            headless: this.options.headless,
            allowSurrogateChars: this.options.allowSurrogateChars
          });
          return render(rootElement, rootObj).end(this.options.renderOpts);
        };
        return Builder;
      }();
    }).call(exports);
  }
});

// node_modules/emitter-component/index.js
var require_emitter_component = __commonJS({
  "node_modules/emitter-component/index.js"(exports, module) {
    module.exports = Emitter;
    function Emitter(obj) {
      if (obj)
        return mixin(obj);
    }
    function mixin(obj) {
      for (var key in Emitter.prototype) {
        obj[key] = Emitter.prototype[key];
      }
      return obj;
    }
    Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};
      (this._callbacks[event] = this._callbacks[event] || []).push(fn);
      return this;
    };
    Emitter.prototype.once = function(event, fn) {
      var self = this;
      this._callbacks = this._callbacks || {};
      function on() {
        self.off(event, on);
        fn.apply(this, arguments);
      }
      on.fn = fn;
      this.on(event, on);
      return this;
    };
    Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
      this._callbacks = this._callbacks || {};
      if (0 == arguments.length) {
        this._callbacks = {};
        return this;
      }
      var callbacks = this._callbacks[event];
      if (!callbacks)
        return this;
      if (1 == arguments.length) {
        delete this._callbacks[event];
        return this;
      }
      var cb;
      for (var i = 0; i < callbacks.length; i++) {
        cb = callbacks[i];
        if (cb === fn || cb.fn === fn) {
          callbacks.splice(i, 1);
          break;
        }
      }
      return this;
    };
    Emitter.prototype.emit = function(event) {
      this._callbacks = this._callbacks || {};
      var args = [].slice.call(arguments, 1), callbacks = this._callbacks[event];
      if (callbacks) {
        callbacks = callbacks.slice(0);
        for (var i = 0, len = callbacks.length; i < len; ++i) {
          callbacks[i].apply(this, args);
        }
      }
      return this;
    };
    Emitter.prototype.listeners = function(event) {
      this._callbacks = this._callbacks || {};
      return this._callbacks[event] || [];
    };
    Emitter.prototype.hasListeners = function(event) {
      return !!this.listeners(event).length;
    };
  }
});

// node_modules/stream/index.js
var require_stream = __commonJS({
  "node_modules/stream/index.js"(exports, module) {
    var Emitter = require_emitter_component();
    function Stream() {
      Emitter.call(this);
    }
    Stream.prototype = new Emitter();
    module.exports = Stream;
    Stream.Stream = Stream;
    Stream.prototype.pipe = function(dest, options) {
      var source = this;
      function ondata(chunk) {
        if (dest.writable) {
          if (false === dest.write(chunk) && source.pause) {
            source.pause();
          }
        }
      }
      source.on("data", ondata);
      function ondrain() {
        if (source.readable && source.resume) {
          source.resume();
        }
      }
      dest.on("drain", ondrain);
      if (!dest._isStdio && (!options || options.end !== false)) {
        source.on("end", onend);
        source.on("close", onclose);
      }
      var didOnEnd = false;
      function onend() {
        if (didOnEnd)
          return;
        didOnEnd = true;
        dest.end();
      }
      function onclose() {
        if (didOnEnd)
          return;
        didOnEnd = true;
        if (typeof dest.destroy === "function")
          dest.destroy();
      }
      function onerror(er) {
        cleanup();
        if (!this.hasListeners("error")) {
          throw er;
        }
      }
      source.on("error", onerror);
      dest.on("error", onerror);
      function cleanup() {
        source.off("data", ondata);
        dest.off("drain", ondrain);
        source.off("end", onend);
        source.off("close", onclose);
        source.off("error", onerror);
        dest.off("error", onerror);
        source.off("end", cleanup);
        source.off("close", cleanup);
        dest.off("end", cleanup);
        dest.off("close", cleanup);
      }
      source.on("end", cleanup);
      source.on("close", cleanup);
      dest.on("end", cleanup);
      dest.on("close", cleanup);
      dest.emit("pipe", source);
      return dest;
    };
  }
});

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1)
        validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// node_modules/buffer/index.js
var require_buffer = __commonJS({
  "node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer2;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer2.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this))
          return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer2.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer2.isBuffer(this))
          return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function Buffer2(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError('The "string" argument must be of type string. Received type number');
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer2.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError('The "value" argument must not be of type number. Received type number');
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer2.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b)
        return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    Buffer2.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer2, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer2.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer2.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer2.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer2.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer2.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer2.alloc(+length);
    }
    Buffer2.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer2.prototype;
    };
    Buffer2.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array))
        a = Buffer2.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array))
        b = Buffer2.from(b, b.offset, b.byteLength);
      if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      }
      if (a === b)
        return 0;
      let x = a.length;
      let y = b.length;
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    Buffer2.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer2.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer2.alloc(0);
      }
      let i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      const buffer = Buffer2.allocUnsafe(length);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer2.isBuffer(buf))
              buf = Buffer2.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(buffer, buf, pos);
          }
        } else if (!Buffer2.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer2.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0)
        return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding)
        encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer2.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer2.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer2.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer2.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer2.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0)
        return "";
      if (arguments.length === 0)
        return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
    Buffer2.prototype.equals = function equals(b) {
      if (!Buffer2.isBuffer(b))
        throw new TypeError("Argument must be a Buffer");
      if (this === b)
        return true;
      return Buffer2.compare(this, b) === 0;
    };
    Buffer2.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max)
        str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
    }
    Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer2.from(target, target.offset, target.byteLength);
      }
      if (!Buffer2.isBuffer(target)) {
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target)
        return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y)
        return -1;
      if (y < x)
        return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0)
        return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0)
        byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir)
          return -1;
        else
          byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir)
          byteOffset = 0;
        else
          return -1;
      }
      if (typeof val === "string") {
        val = Buffer2.from(val, encoding);
      }
      if (Buffer2.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1)
              foundIndex = i;
            if (i - foundIndex + 1 === valLength)
              return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1)
              i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength)
          byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found)
            return i;
        }
      }
      return -1;
    }
    Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i;
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed))
          return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer2.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0)
            encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining)
        length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding)
        encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase)
              throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer2.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i = start;
      while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0)
        start = 0;
      if (!end || end < 0 || end > len)
        end = len;
      let out = "";
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer2.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0)
          start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0)
          end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start)
        end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer2.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0)
        throw new RangeError("offset is not uint");
      if (offset + ext > length)
        throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert)
        checkOffset(offset, byteLength2, this.length);
      let i = byteLength2;
      let mul = 1;
      let val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul)
        val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128))
        return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert)
        checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer2.isBuffer(buf))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min)
        throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
    }
    Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 1, 127, -128);
      if (value < 0)
        value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert)
        checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0)
        value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length)
        throw new RangeError("Index out of range");
      if (offset < 0)
        throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer2.isBuffer(target))
        throw new TypeError("argument should be a Buffer");
      if (!start)
        start = 0;
      if (!end && end !== 0)
        end = this.length;
      if (targetStart >= target.length)
        targetStart = target.length;
      if (!targetStart)
        targetStart = 0;
      if (end > 0 && end < start)
        end = start;
      if (end === start)
        return 0;
      if (target.length === 0 || this.length === 0)
        return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length)
        throw new RangeError("Index out of range");
      if (end < 0)
        throw new RangeError("sourceEnd out of bounds");
      if (end > this.length)
        end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
      }
      return len;
    };
    Buffer2.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val)
        val = 0;
      let i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    var errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
      if (name) {
        return `${name} is outside of buffer bounds`;
      }
      return "Attempt to access memory outside buffer bounds";
    }, RangeError);
    E("ERR_INVALID_ARG_TYPE", function(name, actual) {
      return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
    }, TypeError);
    E("ERR_OUT_OF_RANGE", function(str, range, input) {
      let msg = `The value of "${str}" is out of range.`;
      let received = input;
      if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
        received = addNumericalSeparator(String(input));
      } else if (typeof input === "bigint") {
        received = String(input);
        if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
          received = addNumericalSeparator(received);
        }
        received += "n";
      }
      msg += ` It must be ${range}. Received ${received}`;
      return msg;
    }, RangeError);
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
          } else {
            range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
          }
        } else {
          range = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2)
        return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length) {
              if ((units -= 3) > -1)
                bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0)
            break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0)
            break;
          bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0)
            break;
          bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0)
            break;
          bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0)
          break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i;
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length)
          break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = function() {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table;
    }();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  }
});

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS({
  "node_modules/safe-buffer/index.js"(exports, module) {
    var buffer = require_buffer();
    var Buffer2 = buffer.Buffer;
    function copyProps(src, dst) {
      for (var key in src) {
        dst[key] = src[key];
      }
    }
    if (Buffer2.from && Buffer2.alloc && Buffer2.allocUnsafe && Buffer2.allocUnsafeSlow) {
      module.exports = buffer;
    } else {
      copyProps(buffer, exports);
      exports.Buffer = SafeBuffer;
    }
    function SafeBuffer(arg, encodingOrOffset, length) {
      return Buffer2(arg, encodingOrOffset, length);
    }
    SafeBuffer.prototype = Object.create(Buffer2.prototype);
    copyProps(Buffer2, SafeBuffer);
    SafeBuffer.from = function(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        throw new TypeError("Argument must not be a number");
      }
      return Buffer2(arg, encodingOrOffset, length);
    };
    SafeBuffer.alloc = function(size, fill, encoding) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      var buf = Buffer2(size);
      if (fill !== void 0) {
        if (typeof encoding === "string") {
          buf.fill(fill, encoding);
        } else {
          buf.fill(fill);
        }
      } else {
        buf.fill(0);
      }
      return buf;
    };
    SafeBuffer.allocUnsafe = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return Buffer2(size);
    };
    SafeBuffer.allocUnsafeSlow = function(size) {
      if (typeof size !== "number") {
        throw new TypeError("Argument must be a number");
      }
      return buffer.SlowBuffer(size);
    };
  }
});

// node_modules/string_decoder/lib/string_decoder.js
var require_string_decoder = __commonJS({
  "node_modules/string_decoder/lib/string_decoder.js"(exports) {
    "use strict";
    var Buffer2 = require_safe_buffer().Buffer;
    var isEncoding = Buffer2.isEncoding || function(encoding) {
      encoding = "" + encoding;
      switch (encoding && encoding.toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
        case "raw":
          return true;
        default:
          return false;
      }
    };
    function _normalizeEncoding(enc) {
      if (!enc)
        return "utf8";
      var retried;
      while (true) {
        switch (enc) {
          case "utf8":
          case "utf-8":
            return "utf8";
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return "utf16le";
          case "latin1":
          case "binary":
            return "latin1";
          case "base64":
          case "ascii":
          case "hex":
            return enc;
          default:
            if (retried)
              return;
            enc = ("" + enc).toLowerCase();
            retried = true;
        }
      }
    }
    function normalizeEncoding(enc) {
      var nenc = _normalizeEncoding(enc);
      if (typeof nenc !== "string" && (Buffer2.isEncoding === isEncoding || !isEncoding(enc)))
        throw new Error("Unknown encoding: " + enc);
      return nenc || enc;
    }
    exports.StringDecoder = StringDecoder;
    function StringDecoder(encoding) {
      this.encoding = normalizeEncoding(encoding);
      var nb;
      switch (this.encoding) {
        case "utf16le":
          this.text = utf16Text;
          this.end = utf16End;
          nb = 4;
          break;
        case "utf8":
          this.fillLast = utf8FillLast;
          nb = 4;
          break;
        case "base64":
          this.text = base64Text;
          this.end = base64End;
          nb = 3;
          break;
        default:
          this.write = simpleWrite;
          this.end = simpleEnd;
          return;
      }
      this.lastNeed = 0;
      this.lastTotal = 0;
      this.lastChar = Buffer2.allocUnsafe(nb);
    }
    StringDecoder.prototype.write = function(buf) {
      if (buf.length === 0)
        return "";
      var r;
      var i;
      if (this.lastNeed) {
        r = this.fillLast(buf);
        if (r === void 0)
          return "";
        i = this.lastNeed;
        this.lastNeed = 0;
      } else {
        i = 0;
      }
      if (i < buf.length)
        return r ? r + this.text(buf, i) : this.text(buf, i);
      return r || "";
    };
    StringDecoder.prototype.end = utf8End;
    StringDecoder.prototype.text = utf8Text;
    StringDecoder.prototype.fillLast = function(buf) {
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
      this.lastNeed -= buf.length;
    };
    function utf8CheckByte(byte) {
      if (byte <= 127)
        return 0;
      else if (byte >> 5 === 6)
        return 2;
      else if (byte >> 4 === 14)
        return 3;
      else if (byte >> 3 === 30)
        return 4;
      return byte >> 6 === 2 ? -1 : -2;
    }
    function utf8CheckIncomplete(self, buf, i) {
      var j = buf.length - 1;
      if (j < i)
        return 0;
      var nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self.lastNeed = nb - 1;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0)
          self.lastNeed = nb - 2;
        return nb;
      }
      if (--j < i || nb === -2)
        return 0;
      nb = utf8CheckByte(buf[j]);
      if (nb >= 0) {
        if (nb > 0) {
          if (nb === 2)
            nb = 0;
          else
            self.lastNeed = nb - 3;
        }
        return nb;
      }
      return 0;
    }
    function utf8CheckExtraBytes(self, buf, p) {
      if ((buf[0] & 192) !== 128) {
        self.lastNeed = 0;
        return "\uFFFD";
      }
      if (self.lastNeed > 1 && buf.length > 1) {
        if ((buf[1] & 192) !== 128) {
          self.lastNeed = 1;
          return "\uFFFD";
        }
        if (self.lastNeed > 2 && buf.length > 2) {
          if ((buf[2] & 192) !== 128) {
            self.lastNeed = 2;
            return "\uFFFD";
          }
        }
      }
    }
    function utf8FillLast(buf) {
      var p = this.lastTotal - this.lastNeed;
      var r = utf8CheckExtraBytes(this, buf, p);
      if (r !== void 0)
        return r;
      if (this.lastNeed <= buf.length) {
        buf.copy(this.lastChar, p, 0, this.lastNeed);
        return this.lastChar.toString(this.encoding, 0, this.lastTotal);
      }
      buf.copy(this.lastChar, p, 0, buf.length);
      this.lastNeed -= buf.length;
    }
    function utf8Text(buf, i) {
      var total = utf8CheckIncomplete(this, buf, i);
      if (!this.lastNeed)
        return buf.toString("utf8", i);
      this.lastTotal = total;
      var end = buf.length - (total - this.lastNeed);
      buf.copy(this.lastChar, 0, end);
      return buf.toString("utf8", i, end);
    }
    function utf8End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + "\uFFFD";
      return r;
    }
    function utf16Text(buf, i) {
      if ((buf.length - i) % 2 === 0) {
        var r = buf.toString("utf16le", i);
        if (r) {
          var c = r.charCodeAt(r.length - 1);
          if (c >= 55296 && c <= 56319) {
            this.lastNeed = 2;
            this.lastTotal = 4;
            this.lastChar[0] = buf[buf.length - 2];
            this.lastChar[1] = buf[buf.length - 1];
            return r.slice(0, -1);
          }
        }
        return r;
      }
      this.lastNeed = 1;
      this.lastTotal = 2;
      this.lastChar[0] = buf[buf.length - 1];
      return buf.toString("utf16le", i, buf.length - 1);
    }
    function utf16End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed) {
        var end = this.lastTotal - this.lastNeed;
        return r + this.lastChar.toString("utf16le", 0, end);
      }
      return r;
    }
    function base64Text(buf, i) {
      var n = (buf.length - i) % 3;
      if (n === 0)
        return buf.toString("base64", i);
      this.lastNeed = 3 - n;
      this.lastTotal = 3;
      if (n === 1) {
        this.lastChar[0] = buf[buf.length - 1];
      } else {
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
      }
      return buf.toString("base64", i, buf.length - n);
    }
    function base64End(buf) {
      var r = buf && buf.length ? this.write(buf) : "";
      if (this.lastNeed)
        return r + this.lastChar.toString("base64", 0, 3 - this.lastNeed);
      return r;
    }
    function simpleWrite(buf) {
      return buf.toString(this.encoding);
    }
    function simpleEnd(buf) {
      return buf && buf.length ? this.write(buf) : "";
    }
  }
});

// node_modules/sax/lib/sax.js
var require_sax = __commonJS({
  "node_modules/sax/lib/sax.js"(exports) {
    (function(sax) {
      sax.parser = function(strict, opt) {
        return new SAXParser(strict, opt);
      };
      sax.SAXParser = SAXParser;
      sax.SAXStream = SAXStream;
      sax.createStream = createStream;
      sax.MAX_BUFFER_LENGTH = 64 * 1024;
      var buffers = [
        "comment",
        "sgmlDecl",
        "textNode",
        "tagName",
        "doctype",
        "procInstName",
        "procInstBody",
        "entity",
        "attribName",
        "attribValue",
        "cdata",
        "script"
      ];
      sax.EVENTS = [
        "text",
        "processinginstruction",
        "sgmldeclaration",
        "doctype",
        "comment",
        "opentagstart",
        "attribute",
        "opentag",
        "closetag",
        "opencdata",
        "cdata",
        "closecdata",
        "error",
        "end",
        "ready",
        "script",
        "opennamespace",
        "closenamespace"
      ];
      function SAXParser(strict, opt) {
        if (!(this instanceof SAXParser)) {
          return new SAXParser(strict, opt);
        }
        var parser = this;
        clearBuffers(parser);
        parser.q = parser.c = "";
        parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
        parser.opt = opt || {};
        parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
        parser.looseCase = parser.opt.lowercase ? "toLowerCase" : "toUpperCase";
        parser.tags = [];
        parser.closed = parser.closedRoot = parser.sawRoot = false;
        parser.tag = parser.error = null;
        parser.strict = !!strict;
        parser.noscript = !!(strict || parser.opt.noscript);
        parser.state = S.BEGIN;
        parser.strictEntities = parser.opt.strictEntities;
        parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES);
        parser.attribList = [];
        if (parser.opt.xmlns) {
          parser.ns = Object.create(rootNS);
        }
        parser.trackPosition = parser.opt.position !== false;
        if (parser.trackPosition) {
          parser.position = parser.line = parser.column = 0;
        }
        emit(parser, "onready");
      }
      if (!Object.create) {
        Object.create = function(o) {
          function F() {
          }
          F.prototype = o;
          var newf = new F();
          return newf;
        };
      }
      if (!Object.keys) {
        Object.keys = function(o) {
          var a = [];
          for (var i in o)
            if (o.hasOwnProperty(i))
              a.push(i);
          return a;
        };
      }
      function checkBufferLength(parser) {
        var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
        var maxActual = 0;
        for (var i = 0, l = buffers.length; i < l; i++) {
          var len = parser[buffers[i]].length;
          if (len > maxAllowed) {
            switch (buffers[i]) {
              case "textNode":
                closeText(parser);
                break;
              case "cdata":
                emitNode(parser, "oncdata", parser.cdata);
                parser.cdata = "";
                break;
              case "script":
                emitNode(parser, "onscript", parser.script);
                parser.script = "";
                break;
              default:
                error(parser, "Max buffer length exceeded: " + buffers[i]);
            }
          }
          maxActual = Math.max(maxActual, len);
        }
        var m = sax.MAX_BUFFER_LENGTH - maxActual;
        parser.bufferCheckPosition = m + parser.position;
      }
      function clearBuffers(parser) {
        for (var i = 0, l = buffers.length; i < l; i++) {
          parser[buffers[i]] = "";
        }
      }
      function flushBuffers(parser) {
        closeText(parser);
        if (parser.cdata !== "") {
          emitNode(parser, "oncdata", parser.cdata);
          parser.cdata = "";
        }
        if (parser.script !== "") {
          emitNode(parser, "onscript", parser.script);
          parser.script = "";
        }
      }
      SAXParser.prototype = {
        end: function() {
          end(this);
        },
        write,
        resume: function() {
          this.error = null;
          return this;
        },
        close: function() {
          return this.write(null);
        },
        flush: function() {
          flushBuffers(this);
        }
      };
      var Stream;
      try {
        Stream = require_stream().Stream;
      } catch (ex) {
        Stream = function() {
        };
      }
      var streamWraps = sax.EVENTS.filter(function(ev) {
        return ev !== "error" && ev !== "end";
      });
      function createStream(strict, opt) {
        return new SAXStream(strict, opt);
      }
      function SAXStream(strict, opt) {
        if (!(this instanceof SAXStream)) {
          return new SAXStream(strict, opt);
        }
        Stream.apply(this);
        this._parser = new SAXParser(strict, opt);
        this.writable = true;
        this.readable = true;
        var me = this;
        this._parser.onend = function() {
          me.emit("end");
        };
        this._parser.onerror = function(er) {
          me.emit("error", er);
          me._parser.error = null;
        };
        this._decoder = null;
        streamWraps.forEach(function(ev) {
          Object.defineProperty(me, "on" + ev, {
            get: function() {
              return me._parser["on" + ev];
            },
            set: function(h) {
              if (!h) {
                me.removeAllListeners(ev);
                me._parser["on" + ev] = h;
                return h;
              }
              me.on(ev, h);
            },
            enumerable: true,
            configurable: false
          });
        });
      }
      SAXStream.prototype = Object.create(Stream.prototype, {
        constructor: {
          value: SAXStream
        }
      });
      SAXStream.prototype.write = function(data) {
        if (typeof Buffer === "function" && typeof Buffer.isBuffer === "function" && Buffer.isBuffer(data)) {
          if (!this._decoder) {
            var SD = require_string_decoder().StringDecoder;
            this._decoder = new SD("utf8");
          }
          data = this._decoder.write(data);
        }
        this._parser.write(data.toString());
        this.emit("data", data);
        return true;
      };
      SAXStream.prototype.end = function(chunk) {
        if (chunk && chunk.length) {
          this.write(chunk);
        }
        this._parser.end();
        return true;
      };
      SAXStream.prototype.on = function(ev, handler) {
        var me = this;
        if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1) {
          me._parser["on" + ev] = function() {
            var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
            args.splice(0, 0, ev);
            me.emit.apply(me, args);
          };
        }
        return Stream.prototype.on.call(me, ev, handler);
      };
      var CDATA = "[CDATA[";
      var DOCTYPE = "DOCTYPE";
      var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
      var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
      var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE };
      var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
      var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
      function isWhitespace(c) {
        return c === " " || c === "\n" || c === "\r" || c === "	";
      }
      function isQuote(c) {
        return c === '"' || c === "'";
      }
      function isAttribEnd(c) {
        return c === ">" || isWhitespace(c);
      }
      function isMatch(regex, c) {
        return regex.test(c);
      }
      function notMatch(regex, c) {
        return !isMatch(regex, c);
      }
      var S = 0;
      sax.STATE = {
        BEGIN: S++,
        BEGIN_WHITESPACE: S++,
        TEXT: S++,
        TEXT_ENTITY: S++,
        OPEN_WAKA: S++,
        SGML_DECL: S++,
        SGML_DECL_QUOTED: S++,
        DOCTYPE: S++,
        DOCTYPE_QUOTED: S++,
        DOCTYPE_DTD: S++,
        DOCTYPE_DTD_QUOTED: S++,
        COMMENT_STARTING: S++,
        COMMENT: S++,
        COMMENT_ENDING: S++,
        COMMENT_ENDED: S++,
        CDATA: S++,
        CDATA_ENDING: S++,
        CDATA_ENDING_2: S++,
        PROC_INST: S++,
        PROC_INST_BODY: S++,
        PROC_INST_ENDING: S++,
        OPEN_TAG: S++,
        OPEN_TAG_SLASH: S++,
        ATTRIB: S++,
        ATTRIB_NAME: S++,
        ATTRIB_NAME_SAW_WHITE: S++,
        ATTRIB_VALUE: S++,
        ATTRIB_VALUE_QUOTED: S++,
        ATTRIB_VALUE_CLOSED: S++,
        ATTRIB_VALUE_UNQUOTED: S++,
        ATTRIB_VALUE_ENTITY_Q: S++,
        ATTRIB_VALUE_ENTITY_U: S++,
        CLOSE_TAG: S++,
        CLOSE_TAG_SAW_WHITE: S++,
        SCRIPT: S++,
        SCRIPT_ENDING: S++
      };
      sax.XML_ENTITIES = {
        "amp": "&",
        "gt": ">",
        "lt": "<",
        "quot": '"',
        "apos": "'"
      };
      sax.ENTITIES = {
        "amp": "&",
        "gt": ">",
        "lt": "<",
        "quot": '"',
        "apos": "'",
        "AElig": 198,
        "Aacute": 193,
        "Acirc": 194,
        "Agrave": 192,
        "Aring": 197,
        "Atilde": 195,
        "Auml": 196,
        "Ccedil": 199,
        "ETH": 208,
        "Eacute": 201,
        "Ecirc": 202,
        "Egrave": 200,
        "Euml": 203,
        "Iacute": 205,
        "Icirc": 206,
        "Igrave": 204,
        "Iuml": 207,
        "Ntilde": 209,
        "Oacute": 211,
        "Ocirc": 212,
        "Ograve": 210,
        "Oslash": 216,
        "Otilde": 213,
        "Ouml": 214,
        "THORN": 222,
        "Uacute": 218,
        "Ucirc": 219,
        "Ugrave": 217,
        "Uuml": 220,
        "Yacute": 221,
        "aacute": 225,
        "acirc": 226,
        "aelig": 230,
        "agrave": 224,
        "aring": 229,
        "atilde": 227,
        "auml": 228,
        "ccedil": 231,
        "eacute": 233,
        "ecirc": 234,
        "egrave": 232,
        "eth": 240,
        "euml": 235,
        "iacute": 237,
        "icirc": 238,
        "igrave": 236,
        "iuml": 239,
        "ntilde": 241,
        "oacute": 243,
        "ocirc": 244,
        "ograve": 242,
        "oslash": 248,
        "otilde": 245,
        "ouml": 246,
        "szlig": 223,
        "thorn": 254,
        "uacute": 250,
        "ucirc": 251,
        "ugrave": 249,
        "uuml": 252,
        "yacute": 253,
        "yuml": 255,
        "copy": 169,
        "reg": 174,
        "nbsp": 160,
        "iexcl": 161,
        "cent": 162,
        "pound": 163,
        "curren": 164,
        "yen": 165,
        "brvbar": 166,
        "sect": 167,
        "uml": 168,
        "ordf": 170,
        "laquo": 171,
        "not": 172,
        "shy": 173,
        "macr": 175,
        "deg": 176,
        "plusmn": 177,
        "sup1": 185,
        "sup2": 178,
        "sup3": 179,
        "acute": 180,
        "micro": 181,
        "para": 182,
        "middot": 183,
        "cedil": 184,
        "ordm": 186,
        "raquo": 187,
        "frac14": 188,
        "frac12": 189,
        "frac34": 190,
        "iquest": 191,
        "times": 215,
        "divide": 247,
        "OElig": 338,
        "oelig": 339,
        "Scaron": 352,
        "scaron": 353,
        "Yuml": 376,
        "fnof": 402,
        "circ": 710,
        "tilde": 732,
        "Alpha": 913,
        "Beta": 914,
        "Gamma": 915,
        "Delta": 916,
        "Epsilon": 917,
        "Zeta": 918,
        "Eta": 919,
        "Theta": 920,
        "Iota": 921,
        "Kappa": 922,
        "Lambda": 923,
        "Mu": 924,
        "Nu": 925,
        "Xi": 926,
        "Omicron": 927,
        "Pi": 928,
        "Rho": 929,
        "Sigma": 931,
        "Tau": 932,
        "Upsilon": 933,
        "Phi": 934,
        "Chi": 935,
        "Psi": 936,
        "Omega": 937,
        "alpha": 945,
        "beta": 946,
        "gamma": 947,
        "delta": 948,
        "epsilon": 949,
        "zeta": 950,
        "eta": 951,
        "theta": 952,
        "iota": 953,
        "kappa": 954,
        "lambda": 955,
        "mu": 956,
        "nu": 957,
        "xi": 958,
        "omicron": 959,
        "pi": 960,
        "rho": 961,
        "sigmaf": 962,
        "sigma": 963,
        "tau": 964,
        "upsilon": 965,
        "phi": 966,
        "chi": 967,
        "psi": 968,
        "omega": 969,
        "thetasym": 977,
        "upsih": 978,
        "piv": 982,
        "ensp": 8194,
        "emsp": 8195,
        "thinsp": 8201,
        "zwnj": 8204,
        "zwj": 8205,
        "lrm": 8206,
        "rlm": 8207,
        "ndash": 8211,
        "mdash": 8212,
        "lsquo": 8216,
        "rsquo": 8217,
        "sbquo": 8218,
        "ldquo": 8220,
        "rdquo": 8221,
        "bdquo": 8222,
        "dagger": 8224,
        "Dagger": 8225,
        "bull": 8226,
        "hellip": 8230,
        "permil": 8240,
        "prime": 8242,
        "Prime": 8243,
        "lsaquo": 8249,
        "rsaquo": 8250,
        "oline": 8254,
        "frasl": 8260,
        "euro": 8364,
        "image": 8465,
        "weierp": 8472,
        "real": 8476,
        "trade": 8482,
        "alefsym": 8501,
        "larr": 8592,
        "uarr": 8593,
        "rarr": 8594,
        "darr": 8595,
        "harr": 8596,
        "crarr": 8629,
        "lArr": 8656,
        "uArr": 8657,
        "rArr": 8658,
        "dArr": 8659,
        "hArr": 8660,
        "forall": 8704,
        "part": 8706,
        "exist": 8707,
        "empty": 8709,
        "nabla": 8711,
        "isin": 8712,
        "notin": 8713,
        "ni": 8715,
        "prod": 8719,
        "sum": 8721,
        "minus": 8722,
        "lowast": 8727,
        "radic": 8730,
        "prop": 8733,
        "infin": 8734,
        "ang": 8736,
        "and": 8743,
        "or": 8744,
        "cap": 8745,
        "cup": 8746,
        "int": 8747,
        "there4": 8756,
        "sim": 8764,
        "cong": 8773,
        "asymp": 8776,
        "ne": 8800,
        "equiv": 8801,
        "le": 8804,
        "ge": 8805,
        "sub": 8834,
        "sup": 8835,
        "nsub": 8836,
        "sube": 8838,
        "supe": 8839,
        "oplus": 8853,
        "otimes": 8855,
        "perp": 8869,
        "sdot": 8901,
        "lceil": 8968,
        "rceil": 8969,
        "lfloor": 8970,
        "rfloor": 8971,
        "lang": 9001,
        "rang": 9002,
        "loz": 9674,
        "spades": 9824,
        "clubs": 9827,
        "hearts": 9829,
        "diams": 9830
      };
      Object.keys(sax.ENTITIES).forEach(function(key) {
        var e = sax.ENTITIES[key];
        var s2 = typeof e === "number" ? String.fromCharCode(e) : e;
        sax.ENTITIES[key] = s2;
      });
      for (var s in sax.STATE) {
        sax.STATE[sax.STATE[s]] = s;
      }
      S = sax.STATE;
      function emit(parser, event, data) {
        parser[event] && parser[event](data);
      }
      function emitNode(parser, nodeType, data) {
        if (parser.textNode)
          closeText(parser);
        emit(parser, nodeType, data);
      }
      function closeText(parser) {
        parser.textNode = textopts(parser.opt, parser.textNode);
        if (parser.textNode)
          emit(parser, "ontext", parser.textNode);
        parser.textNode = "";
      }
      function textopts(opt, text) {
        if (opt.trim)
          text = text.trim();
        if (opt.normalize)
          text = text.replace(/\s+/g, " ");
        return text;
      }
      function error(parser, er) {
        closeText(parser);
        if (parser.trackPosition) {
          er += "\nLine: " + parser.line + "\nColumn: " + parser.column + "\nChar: " + parser.c;
        }
        er = new Error(er);
        parser.error = er;
        emit(parser, "onerror", er);
        return parser;
      }
      function end(parser) {
        if (parser.sawRoot && !parser.closedRoot)
          strictFail(parser, "Unclosed root tag");
        if (parser.state !== S.BEGIN && parser.state !== S.BEGIN_WHITESPACE && parser.state !== S.TEXT) {
          error(parser, "Unexpected end");
        }
        closeText(parser);
        parser.c = "";
        parser.closed = true;
        emit(parser, "onend");
        SAXParser.call(parser, parser.strict, parser.opt);
        return parser;
      }
      function strictFail(parser, message) {
        if (typeof parser !== "object" || !(parser instanceof SAXParser)) {
          throw new Error("bad call to strictFail");
        }
        if (parser.strict) {
          error(parser, message);
        }
      }
      function newTag(parser) {
        if (!parser.strict)
          parser.tagName = parser.tagName[parser.looseCase]();
        var parent = parser.tags[parser.tags.length - 1] || parser;
        var tag = parser.tag = { name: parser.tagName, attributes: {} };
        if (parser.opt.xmlns) {
          tag.ns = parent.ns;
        }
        parser.attribList.length = 0;
        emitNode(parser, "onopentagstart", tag);
      }
      function qname(name, attribute) {
        var i = name.indexOf(":");
        var qualName = i < 0 ? ["", name] : name.split(":");
        var prefix = qualName[0];
        var local = qualName[1];
        if (attribute && name === "xmlns") {
          prefix = "xmlns";
          local = "";
        }
        return { prefix, local };
      }
      function attrib(parser) {
        if (!parser.strict) {
          parser.attribName = parser.attribName[parser.looseCase]();
        }
        if (parser.attribList.indexOf(parser.attribName) !== -1 || parser.tag.attributes.hasOwnProperty(parser.attribName)) {
          parser.attribName = parser.attribValue = "";
          return;
        }
        if (parser.opt.xmlns) {
          var qn = qname(parser.attribName, true);
          var prefix = qn.prefix;
          var local = qn.local;
          if (prefix === "xmlns") {
            if (local === "xml" && parser.attribValue !== XML_NAMESPACE) {
              strictFail(parser, "xml: prefix must be bound to " + XML_NAMESPACE + "\nActual: " + parser.attribValue);
            } else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE) {
              strictFail(parser, "xmlns: prefix must be bound to " + XMLNS_NAMESPACE + "\nActual: " + parser.attribValue);
            } else {
              var tag = parser.tag;
              var parent = parser.tags[parser.tags.length - 1] || parser;
              if (tag.ns === parent.ns) {
                tag.ns = Object.create(parent.ns);
              }
              tag.ns[local] = parser.attribValue;
            }
          }
          parser.attribList.push([parser.attribName, parser.attribValue]);
        } else {
          parser.tag.attributes[parser.attribName] = parser.attribValue;
          emitNode(parser, "onattribute", {
            name: parser.attribName,
            value: parser.attribValue
          });
        }
        parser.attribName = parser.attribValue = "";
      }
      function openTag(parser, selfClosing) {
        if (parser.opt.xmlns) {
          var tag = parser.tag;
          var qn = qname(parser.tagName);
          tag.prefix = qn.prefix;
          tag.local = qn.local;
          tag.uri = tag.ns[qn.prefix] || "";
          if (tag.prefix && !tag.uri) {
            strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(parser.tagName));
            tag.uri = qn.prefix;
          }
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (tag.ns && parent.ns !== tag.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              emitNode(parser, "onopennamespace", {
                prefix: p,
                uri: tag.ns[p]
              });
            });
          }
          for (var i = 0, l = parser.attribList.length; i < l; i++) {
            var nv = parser.attribList[i];
            var name = nv[0];
            var value = nv[1];
            var qualName = qname(name, true);
            var prefix = qualName.prefix;
            var local = qualName.local;
            var uri = prefix === "" ? "" : tag.ns[prefix] || "";
            var a = {
              name,
              value,
              prefix,
              local,
              uri
            };
            if (prefix && prefix !== "xmlns" && !uri) {
              strictFail(parser, "Unbound namespace prefix: " + JSON.stringify(prefix));
              a.uri = prefix;
            }
            parser.tag.attributes[name] = a;
            emitNode(parser, "onattribute", a);
          }
          parser.attribList.length = 0;
        }
        parser.tag.isSelfClosing = !!selfClosing;
        parser.sawRoot = true;
        parser.tags.push(parser.tag);
        emitNode(parser, "onopentag", parser.tag);
        if (!selfClosing) {
          if (!parser.noscript && parser.tagName.toLowerCase() === "script") {
            parser.state = S.SCRIPT;
          } else {
            parser.state = S.TEXT;
          }
          parser.tag = null;
          parser.tagName = "";
        }
        parser.attribName = parser.attribValue = "";
        parser.attribList.length = 0;
      }
      function closeTag(parser) {
        if (!parser.tagName) {
          strictFail(parser, "Weird empty close tag.");
          parser.textNode += "</>";
          parser.state = S.TEXT;
          return;
        }
        if (parser.script) {
          if (parser.tagName !== "script") {
            parser.script += "</" + parser.tagName + ">";
            parser.tagName = "";
            parser.state = S.SCRIPT;
            return;
          }
          emitNode(parser, "onscript", parser.script);
          parser.script = "";
        }
        var t = parser.tags.length;
        var tagName = parser.tagName;
        if (!parser.strict) {
          tagName = tagName[parser.looseCase]();
        }
        var closeTo = tagName;
        while (t--) {
          var close = parser.tags[t];
          if (close.name !== closeTo) {
            strictFail(parser, "Unexpected close tag");
          } else {
            break;
          }
        }
        if (t < 0) {
          strictFail(parser, "Unmatched closing tag: " + parser.tagName);
          parser.textNode += "</" + parser.tagName + ">";
          parser.state = S.TEXT;
          return;
        }
        parser.tagName = tagName;
        var s2 = parser.tags.length;
        while (s2-- > t) {
          var tag = parser.tag = parser.tags.pop();
          parser.tagName = parser.tag.name;
          emitNode(parser, "onclosetag", parser.tagName);
          var x = {};
          for (var i in tag.ns) {
            x[i] = tag.ns[i];
          }
          var parent = parser.tags[parser.tags.length - 1] || parser;
          if (parser.opt.xmlns && tag.ns !== parent.ns) {
            Object.keys(tag.ns).forEach(function(p) {
              var n = tag.ns[p];
              emitNode(parser, "onclosenamespace", { prefix: p, uri: n });
            });
          }
        }
        if (t === 0)
          parser.closedRoot = true;
        parser.tagName = parser.attribValue = parser.attribName = "";
        parser.attribList.length = 0;
        parser.state = S.TEXT;
      }
      function parseEntity(parser) {
        var entity = parser.entity;
        var entityLC = entity.toLowerCase();
        var num;
        var numStr = "";
        if (parser.ENTITIES[entity]) {
          return parser.ENTITIES[entity];
        }
        if (parser.ENTITIES[entityLC]) {
          return parser.ENTITIES[entityLC];
        }
        entity = entityLC;
        if (entity.charAt(0) === "#") {
          if (entity.charAt(1) === "x") {
            entity = entity.slice(2);
            num = parseInt(entity, 16);
            numStr = num.toString(16);
          } else {
            entity = entity.slice(1);
            num = parseInt(entity, 10);
            numStr = num.toString(10);
          }
        }
        entity = entity.replace(/^0+/, "");
        if (isNaN(num) || numStr.toLowerCase() !== entity) {
          strictFail(parser, "Invalid character entity");
          return "&" + parser.entity + ";";
        }
        return String.fromCodePoint(num);
      }
      function beginWhiteSpace(parser, c) {
        if (c === "<") {
          parser.state = S.OPEN_WAKA;
          parser.startTagPosition = parser.position;
        } else if (!isWhitespace(c)) {
          strictFail(parser, "Non-whitespace before first tag.");
          parser.textNode = c;
          parser.state = S.TEXT;
        }
      }
      function charAt(chunk, i) {
        var result = "";
        if (i < chunk.length) {
          result = chunk.charAt(i);
        }
        return result;
      }
      function write(chunk) {
        var parser = this;
        if (this.error) {
          throw this.error;
        }
        if (parser.closed) {
          return error(parser, "Cannot write after close. Assign an onready handler.");
        }
        if (chunk === null) {
          return end(parser);
        }
        if (typeof chunk === "object") {
          chunk = chunk.toString();
        }
        var i = 0;
        var c = "";
        while (true) {
          c = charAt(chunk, i++);
          parser.c = c;
          if (!c) {
            break;
          }
          if (parser.trackPosition) {
            parser.position++;
            if (c === "\n") {
              parser.line++;
              parser.column = 0;
            } else {
              parser.column++;
            }
          }
          switch (parser.state) {
            case S.BEGIN:
              parser.state = S.BEGIN_WHITESPACE;
              if (c === "\uFEFF") {
                continue;
              }
              beginWhiteSpace(parser, c);
              continue;
            case S.BEGIN_WHITESPACE:
              beginWhiteSpace(parser, c);
              continue;
            case S.TEXT:
              if (parser.sawRoot && !parser.closedRoot) {
                var starti = i - 1;
                while (c && c !== "<" && c !== "&") {
                  c = charAt(chunk, i++);
                  if (c && parser.trackPosition) {
                    parser.position++;
                    if (c === "\n") {
                      parser.line++;
                      parser.column = 0;
                    } else {
                      parser.column++;
                    }
                  }
                }
                parser.textNode += chunk.substring(starti, i - 1);
              }
              if (c === "<" && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                parser.state = S.OPEN_WAKA;
                parser.startTagPosition = parser.position;
              } else {
                if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
                  strictFail(parser, "Text data outside of root node.");
                }
                if (c === "&") {
                  parser.state = S.TEXT_ENTITY;
                } else {
                  parser.textNode += c;
                }
              }
              continue;
            case S.SCRIPT:
              if (c === "<") {
                parser.state = S.SCRIPT_ENDING;
              } else {
                parser.script += c;
              }
              continue;
            case S.SCRIPT_ENDING:
              if (c === "/") {
                parser.state = S.CLOSE_TAG;
              } else {
                parser.script += "<" + c;
                parser.state = S.SCRIPT;
              }
              continue;
            case S.OPEN_WAKA:
              if (c === "!") {
                parser.state = S.SGML_DECL;
                parser.sgmlDecl = "";
              } else if (isWhitespace(c)) {
              } else if (isMatch(nameStart, c)) {
                parser.state = S.OPEN_TAG;
                parser.tagName = c;
              } else if (c === "/") {
                parser.state = S.CLOSE_TAG;
                parser.tagName = "";
              } else if (c === "?") {
                parser.state = S.PROC_INST;
                parser.procInstName = parser.procInstBody = "";
              } else {
                strictFail(parser, "Unencoded <");
                if (parser.startTagPosition + 1 < parser.position) {
                  var pad = parser.position - parser.startTagPosition;
                  c = new Array(pad).join(" ") + c;
                }
                parser.textNode += "<" + c;
                parser.state = S.TEXT;
              }
              continue;
            case S.SGML_DECL:
              if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                emitNode(parser, "onopencdata");
                parser.state = S.CDATA;
                parser.sgmlDecl = "";
                parser.cdata = "";
              } else if (parser.sgmlDecl + c === "--") {
                parser.state = S.COMMENT;
                parser.comment = "";
                parser.sgmlDecl = "";
              } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                parser.state = S.DOCTYPE;
                if (parser.doctype || parser.sawRoot) {
                  strictFail(parser, "Inappropriately located doctype declaration");
                }
                parser.doctype = "";
                parser.sgmlDecl = "";
              } else if (c === ">") {
                emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
                parser.sgmlDecl = "";
                parser.state = S.TEXT;
              } else if (isQuote(c)) {
                parser.state = S.SGML_DECL_QUOTED;
                parser.sgmlDecl += c;
              } else {
                parser.sgmlDecl += c;
              }
              continue;
            case S.SGML_DECL_QUOTED:
              if (c === parser.q) {
                parser.state = S.SGML_DECL;
                parser.q = "";
              }
              parser.sgmlDecl += c;
              continue;
            case S.DOCTYPE:
              if (c === ">") {
                parser.state = S.TEXT;
                emitNode(parser, "ondoctype", parser.doctype);
                parser.doctype = true;
              } else {
                parser.doctype += c;
                if (c === "[") {
                  parser.state = S.DOCTYPE_DTD;
                } else if (isQuote(c)) {
                  parser.state = S.DOCTYPE_QUOTED;
                  parser.q = c;
                }
              }
              continue;
            case S.DOCTYPE_QUOTED:
              parser.doctype += c;
              if (c === parser.q) {
                parser.q = "";
                parser.state = S.DOCTYPE;
              }
              continue;
            case S.DOCTYPE_DTD:
              parser.doctype += c;
              if (c === "]") {
                parser.state = S.DOCTYPE;
              } else if (isQuote(c)) {
                parser.state = S.DOCTYPE_DTD_QUOTED;
                parser.q = c;
              }
              continue;
            case S.DOCTYPE_DTD_QUOTED:
              parser.doctype += c;
              if (c === parser.q) {
                parser.state = S.DOCTYPE_DTD;
                parser.q = "";
              }
              continue;
            case S.COMMENT:
              if (c === "-") {
                parser.state = S.COMMENT_ENDING;
              } else {
                parser.comment += c;
              }
              continue;
            case S.COMMENT_ENDING:
              if (c === "-") {
                parser.state = S.COMMENT_ENDED;
                parser.comment = textopts(parser.opt, parser.comment);
                if (parser.comment) {
                  emitNode(parser, "oncomment", parser.comment);
                }
                parser.comment = "";
              } else {
                parser.comment += "-" + c;
                parser.state = S.COMMENT;
              }
              continue;
            case S.COMMENT_ENDED:
              if (c !== ">") {
                strictFail(parser, "Malformed comment");
                parser.comment += "--" + c;
                parser.state = S.COMMENT;
              } else {
                parser.state = S.TEXT;
              }
              continue;
            case S.CDATA:
              if (c === "]") {
                parser.state = S.CDATA_ENDING;
              } else {
                parser.cdata += c;
              }
              continue;
            case S.CDATA_ENDING:
              if (c === "]") {
                parser.state = S.CDATA_ENDING_2;
              } else {
                parser.cdata += "]" + c;
                parser.state = S.CDATA;
              }
              continue;
            case S.CDATA_ENDING_2:
              if (c === ">") {
                if (parser.cdata) {
                  emitNode(parser, "oncdata", parser.cdata);
                }
                emitNode(parser, "onclosecdata");
                parser.cdata = "";
                parser.state = S.TEXT;
              } else if (c === "]") {
                parser.cdata += "]";
              } else {
                parser.cdata += "]]" + c;
                parser.state = S.CDATA;
              }
              continue;
            case S.PROC_INST:
              if (c === "?") {
                parser.state = S.PROC_INST_ENDING;
              } else if (isWhitespace(c)) {
                parser.state = S.PROC_INST_BODY;
              } else {
                parser.procInstName += c;
              }
              continue;
            case S.PROC_INST_BODY:
              if (!parser.procInstBody && isWhitespace(c)) {
                continue;
              } else if (c === "?") {
                parser.state = S.PROC_INST_ENDING;
              } else {
                parser.procInstBody += c;
              }
              continue;
            case S.PROC_INST_ENDING:
              if (c === ">") {
                emitNode(parser, "onprocessinginstruction", {
                  name: parser.procInstName,
                  body: parser.procInstBody
                });
                parser.procInstName = parser.procInstBody = "";
                parser.state = S.TEXT;
              } else {
                parser.procInstBody += "?" + c;
                parser.state = S.PROC_INST_BODY;
              }
              continue;
            case S.OPEN_TAG:
              if (isMatch(nameBody, c)) {
                parser.tagName += c;
              } else {
                newTag(parser);
                if (c === ">") {
                  openTag(parser);
                } else if (c === "/") {
                  parser.state = S.OPEN_TAG_SLASH;
                } else {
                  if (!isWhitespace(c)) {
                    strictFail(parser, "Invalid character in tag name");
                  }
                  parser.state = S.ATTRIB;
                }
              }
              continue;
            case S.OPEN_TAG_SLASH:
              if (c === ">") {
                openTag(parser, true);
                closeTag(parser);
              } else {
                strictFail(parser, "Forward-slash in opening tag not followed by >");
                parser.state = S.ATTRIB;
              }
              continue;
            case S.ATTRIB:
              if (isWhitespace(c)) {
                continue;
              } else if (c === ">") {
                openTag(parser);
              } else if (c === "/") {
                parser.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                parser.attribName = c;
                parser.attribValue = "";
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME:
              if (c === "=") {
                parser.state = S.ATTRIB_VALUE;
              } else if (c === ">") {
                strictFail(parser, "Attribute without value");
                parser.attribValue = parser.attribName;
                attrib(parser);
                openTag(parser);
              } else if (isWhitespace(c)) {
                parser.state = S.ATTRIB_NAME_SAW_WHITE;
              } else if (isMatch(nameBody, c)) {
                parser.attribName += c;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_NAME_SAW_WHITE:
              if (c === "=") {
                parser.state = S.ATTRIB_VALUE;
              } else if (isWhitespace(c)) {
                continue;
              } else {
                strictFail(parser, "Attribute without value");
                parser.tag.attributes[parser.attribName] = "";
                parser.attribValue = "";
                emitNode(parser, "onattribute", {
                  name: parser.attribName,
                  value: ""
                });
                parser.attribName = "";
                if (c === ">") {
                  openTag(parser);
                } else if (isMatch(nameStart, c)) {
                  parser.attribName = c;
                  parser.state = S.ATTRIB_NAME;
                } else {
                  strictFail(parser, "Invalid attribute name");
                  parser.state = S.ATTRIB;
                }
              }
              continue;
            case S.ATTRIB_VALUE:
              if (isWhitespace(c)) {
                continue;
              } else if (isQuote(c)) {
                parser.q = c;
                parser.state = S.ATTRIB_VALUE_QUOTED;
              } else {
                strictFail(parser, "Unquoted attribute value");
                parser.state = S.ATTRIB_VALUE_UNQUOTED;
                parser.attribValue = c;
              }
              continue;
            case S.ATTRIB_VALUE_QUOTED:
              if (c !== parser.q) {
                if (c === "&") {
                  parser.state = S.ATTRIB_VALUE_ENTITY_Q;
                } else {
                  parser.attribValue += c;
                }
                continue;
              }
              attrib(parser);
              parser.q = "";
              parser.state = S.ATTRIB_VALUE_CLOSED;
              continue;
            case S.ATTRIB_VALUE_CLOSED:
              if (isWhitespace(c)) {
                parser.state = S.ATTRIB;
              } else if (c === ">") {
                openTag(parser);
              } else if (c === "/") {
                parser.state = S.OPEN_TAG_SLASH;
              } else if (isMatch(nameStart, c)) {
                strictFail(parser, "No whitespace between attributes");
                parser.attribName = c;
                parser.attribValue = "";
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
              }
              continue;
            case S.ATTRIB_VALUE_UNQUOTED:
              if (!isAttribEnd(c)) {
                if (c === "&") {
                  parser.state = S.ATTRIB_VALUE_ENTITY_U;
                } else {
                  parser.attribValue += c;
                }
                continue;
              }
              attrib(parser);
              if (c === ">") {
                openTag(parser);
              } else {
                parser.state = S.ATTRIB;
              }
              continue;
            case S.CLOSE_TAG:
              if (!parser.tagName) {
                if (isWhitespace(c)) {
                  continue;
                } else if (notMatch(nameStart, c)) {
                  if (parser.script) {
                    parser.script += "</" + c;
                    parser.state = S.SCRIPT;
                  } else {
                    strictFail(parser, "Invalid tagname in closing tag.");
                  }
                } else {
                  parser.tagName = c;
                }
              } else if (c === ">") {
                closeTag(parser);
              } else if (isMatch(nameBody, c)) {
                parser.tagName += c;
              } else if (parser.script) {
                parser.script += "</" + parser.tagName;
                parser.tagName = "";
                parser.state = S.SCRIPT;
              } else {
                if (!isWhitespace(c)) {
                  strictFail(parser, "Invalid tagname in closing tag");
                }
                parser.state = S.CLOSE_TAG_SAW_WHITE;
              }
              continue;
            case S.CLOSE_TAG_SAW_WHITE:
              if (isWhitespace(c)) {
                continue;
              }
              if (c === ">") {
                closeTag(parser);
              } else {
                strictFail(parser, "Invalid characters in closing tag");
              }
              continue;
            case S.TEXT_ENTITY:
            case S.ATTRIB_VALUE_ENTITY_Q:
            case S.ATTRIB_VALUE_ENTITY_U:
              var returnState;
              var buffer;
              switch (parser.state) {
                case S.TEXT_ENTITY:
                  returnState = S.TEXT;
                  buffer = "textNode";
                  break;
                case S.ATTRIB_VALUE_ENTITY_Q:
                  returnState = S.ATTRIB_VALUE_QUOTED;
                  buffer = "attribValue";
                  break;
                case S.ATTRIB_VALUE_ENTITY_U:
                  returnState = S.ATTRIB_VALUE_UNQUOTED;
                  buffer = "attribValue";
                  break;
              }
              if (c === ";") {
                parser[buffer] += parseEntity(parser);
                parser.entity = "";
                parser.state = returnState;
              } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
                parser.entity += c;
              } else {
                strictFail(parser, "Invalid character in entity name");
                parser[buffer] += "&" + parser.entity + c;
                parser.entity = "";
                parser.state = returnState;
              }
              continue;
            default:
              throw new Error(parser, "Unknown state: " + parser.state);
          }
        }
        if (parser.position >= parser.bufferCheckPosition) {
          checkBufferLength(parser);
        }
        return parser;
      }
      if (!String.fromCodePoint) {
        (function() {
          var stringFromCharCode = String.fromCharCode;
          var floor = Math.floor;
          var fromCodePoint = function() {
            var MAX_SIZE = 16384;
            var codeUnits = [];
            var highSurrogate;
            var lowSurrogate;
            var index = -1;
            var length = arguments.length;
            if (!length) {
              return "";
            }
            var result = "";
            while (++index < length) {
              var codePoint = Number(arguments[index]);
              if (!isFinite(codePoint) || codePoint < 0 || codePoint > 1114111 || floor(codePoint) !== codePoint) {
                throw RangeError("Invalid code point: " + codePoint);
              }
              if (codePoint <= 65535) {
                codeUnits.push(codePoint);
              } else {
                codePoint -= 65536;
                highSurrogate = (codePoint >> 10) + 55296;
                lowSurrogate = codePoint % 1024 + 56320;
                codeUnits.push(highSurrogate, lowSurrogate);
              }
              if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                result += stringFromCharCode.apply(null, codeUnits);
                codeUnits.length = 0;
              }
            }
            return result;
          };
          if (Object.defineProperty) {
            Object.defineProperty(String, "fromCodePoint", {
              value: fromCodePoint,
              configurable: true,
              writable: true
            });
          } else {
            String.fromCodePoint = fromCodePoint;
          }
        })();
      }
    })(typeof exports === "undefined" ? exports.sax = {} : exports);
  }
});

// node_modules/events/events.js
var require_events = __commonJS({
  "node_modules/events/events.js"(exports, module) {
    "use strict";
    var R = typeof Reflect === "object" ? Reflect : null;
    var ReflectApply = R && typeof R.apply === "function" ? R.apply : function ReflectApply2(target, receiver, args) {
      return Function.prototype.apply.call(target, receiver, args);
    };
    var ReflectOwnKeys;
    if (R && typeof R.ownKeys === "function") {
      ReflectOwnKeys = R.ownKeys;
    } else if (Object.getOwnPropertySymbols) {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
      };
    } else {
      ReflectOwnKeys = function ReflectOwnKeys2(target) {
        return Object.getOwnPropertyNames(target);
      };
    }
    function ProcessEmitWarning(warning) {
      if (console && console.warn)
        console.warn(warning);
    }
    var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
      return value !== value;
    };
    function EventEmitter() {
      EventEmitter.init.call(this);
    }
    module.exports = EventEmitter;
    module.exports.once = once;
    EventEmitter.EventEmitter = EventEmitter;
    EventEmitter.prototype._events = void 0;
    EventEmitter.prototype._eventsCount = 0;
    EventEmitter.prototype._maxListeners = void 0;
    var defaultMaxListeners = 10;
    function checkListener(listener) {
      if (typeof listener !== "function") {
        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
      }
    }
    Object.defineProperty(EventEmitter, "defaultMaxListeners", {
      enumerable: true,
      get: function() {
        return defaultMaxListeners;
      },
      set: function(arg) {
        if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
          throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
        }
        defaultMaxListeners = arg;
      }
    });
    EventEmitter.init = function() {
      if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
      }
      this._maxListeners = this._maxListeners || void 0;
    };
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== "number" || n < 0 || NumberIsNaN(n)) {
        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + ".");
      }
      this._maxListeners = n;
      return this;
    };
    function _getMaxListeners(that) {
      if (that._maxListeners === void 0)
        return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }
    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return _getMaxListeners(this);
    };
    EventEmitter.prototype.emit = function emit(type) {
      var args = [];
      for (var i = 1; i < arguments.length; i++)
        args.push(arguments[i]);
      var doError = type === "error";
      var events = this._events;
      if (events !== void 0)
        doError = doError && events.error === void 0;
      else if (!doError)
        return false;
      if (doError) {
        var er;
        if (args.length > 0)
          er = args[0];
        if (er instanceof Error) {
          throw er;
        }
        var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
        err.context = er;
        throw err;
      }
      var handler = events[type];
      if (handler === void 0)
        return false;
      if (typeof handler === "function") {
        ReflectApply(handler, this, args);
      } else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i)
          ReflectApply(listeners[i], this, args);
      }
      return true;
    };
    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;
      checkListener(listener);
      events = target._events;
      if (events === void 0) {
        events = target._events = /* @__PURE__ */ Object.create(null);
        target._eventsCount = 0;
      } else {
        if (events.newListener !== void 0) {
          target.emit("newListener", type, listener.listener ? listener.listener : listener);
          events = target._events;
        }
        existing = events[type];
      }
      if (existing === void 0) {
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === "function") {
          existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
        m = _getMaxListeners(target);
        if (m > 0 && existing.length > m && !existing.warned) {
          existing.warned = true;
          var w = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
          w.name = "MaxListenersExceededWarning";
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          ProcessEmitWarning(w);
        }
      }
      return target;
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
    EventEmitter.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };
    function onceWrapper() {
      if (!this.fired) {
        this.target.removeListener(this.type, this.wrapFn);
        this.fired = true;
        if (arguments.length === 0)
          return this.listener.call(this.target);
        return this.listener.apply(this.target, arguments);
      }
    }
    function _onceWrap(target, type, listener) {
      var state = { fired: false, wrapFn: void 0, target, type, listener };
      var wrapped = onceWrapper.bind(state);
      wrapped.listener = listener;
      state.wrapFn = wrapped;
      return wrapped;
    }
    EventEmitter.prototype.once = function once2(type, listener) {
      checkListener(listener);
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };
    EventEmitter.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i, originalListener;
      checkListener(listener);
      events = this._events;
      if (events === void 0)
        return this;
      list = events[type];
      if (list === void 0)
        return this;
      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = /* @__PURE__ */ Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit("removeListener", type, list.listener || listener);
        }
      } else if (typeof list !== "function") {
        position = -1;
        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }
        if (position < 0)
          return this;
        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }
        if (list.length === 1)
          events[type] = list[0];
        if (events.removeListener !== void 0)
          this.emit("removeListener", type, originalListener || listener);
      }
      return this;
    };
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events, i;
      events = this._events;
      if (events === void 0)
        return this;
      if (events.removeListener === void 0) {
        if (arguments.length === 0) {
          this._events = /* @__PURE__ */ Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== void 0) {
          if (--this._eventsCount === 0)
            this._events = /* @__PURE__ */ Object.create(null);
          else
            delete events[type];
        }
        return this;
      }
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === "removeListener")
            continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners("removeListener");
        this._events = /* @__PURE__ */ Object.create(null);
        this._eventsCount = 0;
        return this;
      }
      listeners = events[type];
      if (typeof listeners === "function") {
        this.removeListener(type, listeners);
      } else if (listeners !== void 0) {
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }
      return this;
    };
    function _listeners(target, type, unwrap) {
      var events = target._events;
      if (events === void 0)
        return [];
      var evlistener = events[type];
      if (evlistener === void 0)
        return [];
      if (typeof evlistener === "function")
        return unwrap ? [evlistener.listener || evlistener] : [evlistener];
      return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
    }
    EventEmitter.prototype.listeners = function listeners(type) {
      return _listeners(this, type, true);
    };
    EventEmitter.prototype.rawListeners = function rawListeners(type) {
      return _listeners(this, type, false);
    };
    EventEmitter.listenerCount = function(emitter, type) {
      if (typeof emitter.listenerCount === "function") {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };
    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;
      if (events !== void 0) {
        var evlistener = events[type];
        if (typeof evlistener === "function") {
          return 1;
        } else if (evlistener !== void 0) {
          return evlistener.length;
        }
      }
      return 0;
    }
    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
    };
    function arrayClone(arr, n) {
      var copy = new Array(n);
      for (var i = 0; i < n; ++i)
        copy[i] = arr[i];
      return copy;
    }
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++)
        list[index] = list[index + 1];
      list.pop();
    }
    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }
    function once(emitter, name) {
      return new Promise(function(resolve, reject) {
        function errorListener(err) {
          emitter.removeListener(name, resolver);
          reject(err);
        }
        function resolver() {
          if (typeof emitter.removeListener === "function") {
            emitter.removeListener("error", errorListener);
          }
          resolve([].slice.call(arguments));
        }
        ;
        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
        if (name !== "error") {
          addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
        }
      });
    }
    function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
      if (typeof emitter.on === "function") {
        eventTargetAgnosticAddListener(emitter, "error", handler, flags);
      }
    }
    function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
      if (typeof emitter.on === "function") {
        if (flags.once) {
          emitter.once(name, listener);
        } else {
          emitter.on(name, listener);
        }
      } else if (typeof emitter.addEventListener === "function") {
        emitter.addEventListener(name, function wrapListener(arg) {
          if (flags.once) {
            emitter.removeEventListener(name, wrapListener);
          }
          listener(arg);
        });
      } else {
        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
      }
    }
  }
});

// node_modules/xml2js/lib/bom.js
var require_bom = __commonJS({
  "node_modules/xml2js/lib/bom.js"(exports) {
    (function() {
      "use strict";
      exports.stripBOM = function(str) {
        if (str[0] === "\uFEFF") {
          return str.substring(1);
        } else {
          return str;
        }
      };
    }).call(exports);
  }
});

// node_modules/xml2js/lib/processors.js
var require_processors = __commonJS({
  "node_modules/xml2js/lib/processors.js"(exports) {
    (function() {
      "use strict";
      var prefixMatch;
      prefixMatch = new RegExp(/(?!xmlns)^.*:/);
      exports.normalize = function(str) {
        return str.toLowerCase();
      };
      exports.firstCharLowerCase = function(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
      };
      exports.stripPrefix = function(str) {
        return str.replace(prefixMatch, "");
      };
      exports.parseNumbers = function(str) {
        if (!isNaN(str)) {
          str = str % 1 === 0 ? parseInt(str, 10) : parseFloat(str);
        }
        return str;
      };
      exports.parseBooleans = function(str) {
        if (/^(?:true|false)$/i.test(str)) {
          str = str.toLowerCase() === "true";
        }
        return str;
      };
    }).call(exports);
  }
});

// node_modules/timers/index.js
var require_timers = __commonJS({
  "node_modules/timers/index.js"(exports) {
    exports.every = function(str) {
      return new Every(str);
    };
    var time = {
      millisecond: 1,
      second: 1e3,
      minute: 6e4,
      hour: 36e5,
      day: 864e5
    };
    for (key in time) {
      if (key === "millisecond") {
        time.ms = time[key];
      } else {
        time[key.charAt(0)] = time[key];
      }
      time[key + "s"] = time[key];
    }
    var key;
    function Every(str) {
      this.count = 0;
      var m = parse(str);
      if (m) {
        this.time = Number(m[0]) * time[m[1]];
        this.type = m[1];
      }
    }
    Every.prototype.do = function(cb) {
      if (this.time) {
        this.interval = setInterval(callback, this.time);
      }
      var that = this;
      function callback() {
        that.count++;
        cb.call(that);
      }
      return this;
    };
    Every.prototype.stop = function() {
      if (this.interval) {
        clearInterval(this.interval);
        delete this.interval;
      }
      return this;
    };
    var reg = /^\s*(\d+(?:\.\d+)?)\s*([a-z]+)\s*$/;
    function parse(str) {
      var m = str.match(reg);
      if (m && time[m[2]]) {
        return m.slice(1);
      }
      return null;
    }
  }
});

// node_modules/xml2js/lib/parser.js
var require_parser = __commonJS({
  "node_modules/xml2js/lib/parser.js"(exports) {
    (function() {
      "use strict";
      var bom, defaults, events, isEmpty, processItem, processors, sax, setImmediate, bind = function(fn, me) {
        return function() {
          return fn.apply(me, arguments);
        };
      }, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      sax = require_sax();
      events = require_events();
      bom = require_bom();
      processors = require_processors();
      setImmediate = require_timers().setImmediate;
      defaults = require_defaults().defaults;
      isEmpty = function(thing) {
        return typeof thing === "object" && thing != null && Object.keys(thing).length === 0;
      };
      processItem = function(processors2, item, key) {
        var i, len, process;
        for (i = 0, len = processors2.length; i < len; i++) {
          process = processors2[i];
          item = process(item, key);
        }
        return item;
      };
      exports.Parser = function(superClass) {
        extend(Parser2, superClass);
        function Parser2(opts) {
          this.parseStringPromise = bind(this.parseStringPromise, this);
          this.parseString = bind(this.parseString, this);
          this.reset = bind(this.reset, this);
          this.assignOrPush = bind(this.assignOrPush, this);
          this.processAsync = bind(this.processAsync, this);
          var key, ref, value;
          if (!(this instanceof exports.Parser)) {
            return new exports.Parser(opts);
          }
          this.options = {};
          ref = defaults["0.2"];
          for (key in ref) {
            if (!hasProp.call(ref, key))
              continue;
            value = ref[key];
            this.options[key] = value;
          }
          for (key in opts) {
            if (!hasProp.call(opts, key))
              continue;
            value = opts[key];
            this.options[key] = value;
          }
          if (this.options.xmlns) {
            this.options.xmlnskey = this.options.attrkey + "ns";
          }
          if (this.options.normalizeTags) {
            if (!this.options.tagNameProcessors) {
              this.options.tagNameProcessors = [];
            }
            this.options.tagNameProcessors.unshift(processors.normalize);
          }
          this.reset();
        }
        Parser2.prototype.processAsync = function() {
          var chunk, err;
          try {
            if (this.remaining.length <= this.options.chunkSize) {
              chunk = this.remaining;
              this.remaining = "";
              this.saxParser = this.saxParser.write(chunk);
              return this.saxParser.close();
            } else {
              chunk = this.remaining.substr(0, this.options.chunkSize);
              this.remaining = this.remaining.substr(this.options.chunkSize, this.remaining.length);
              this.saxParser = this.saxParser.write(chunk);
              return setImmediate(this.processAsync);
            }
          } catch (error1) {
            err = error1;
            if (!this.saxParser.errThrown) {
              this.saxParser.errThrown = true;
              return this.emit(err);
            }
          }
        };
        Parser2.prototype.assignOrPush = function(obj, key, newValue) {
          if (!(key in obj)) {
            if (!this.options.explicitArray) {
              return obj[key] = newValue;
            } else {
              return obj[key] = [newValue];
            }
          } else {
            if (!(obj[key] instanceof Array)) {
              obj[key] = [obj[key]];
            }
            return obj[key].push(newValue);
          }
        };
        Parser2.prototype.reset = function() {
          var attrkey, charkey, ontext, stack;
          this.removeAllListeners();
          this.saxParser = sax.parser(this.options.strict, {
            trim: false,
            normalize: false,
            xmlns: this.options.xmlns
          });
          this.saxParser.errThrown = false;
          this.saxParser.onerror = function(_this) {
            return function(error) {
              _this.saxParser.resume();
              if (!_this.saxParser.errThrown) {
                _this.saxParser.errThrown = true;
                return _this.emit("error", error);
              }
            };
          }(this);
          this.saxParser.onend = function(_this) {
            return function() {
              if (!_this.saxParser.ended) {
                _this.saxParser.ended = true;
                return _this.emit("end", _this.resultObject);
              }
            };
          }(this);
          this.saxParser.ended = false;
          this.EXPLICIT_CHARKEY = this.options.explicitCharkey;
          this.resultObject = null;
          stack = [];
          attrkey = this.options.attrkey;
          charkey = this.options.charkey;
          this.saxParser.onopentag = function(_this) {
            return function(node) {
              var key, newValue, obj, processedKey, ref;
              obj = {};
              obj[charkey] = "";
              if (!_this.options.ignoreAttrs) {
                ref = node.attributes;
                for (key in ref) {
                  if (!hasProp.call(ref, key))
                    continue;
                  if (!(attrkey in obj) && !_this.options.mergeAttrs) {
                    obj[attrkey] = {};
                  }
                  newValue = _this.options.attrValueProcessors ? processItem(_this.options.attrValueProcessors, node.attributes[key], key) : node.attributes[key];
                  processedKey = _this.options.attrNameProcessors ? processItem(_this.options.attrNameProcessors, key) : key;
                  if (_this.options.mergeAttrs) {
                    _this.assignOrPush(obj, processedKey, newValue);
                  } else {
                    obj[attrkey][processedKey] = newValue;
                  }
                }
              }
              obj["#name"] = _this.options.tagNameProcessors ? processItem(_this.options.tagNameProcessors, node.name) : node.name;
              if (_this.options.xmlns) {
                obj[_this.options.xmlnskey] = {
                  uri: node.uri,
                  local: node.local
                };
              }
              return stack.push(obj);
            };
          }(this);
          this.saxParser.onclosetag = function(_this) {
            return function() {
              var cdata, emptyStr, key, node, nodeName, obj, objClone, old, s, xpath;
              obj = stack.pop();
              nodeName = obj["#name"];
              if (!_this.options.explicitChildren || !_this.options.preserveChildrenOrder) {
                delete obj["#name"];
              }
              if (obj.cdata === true) {
                cdata = obj.cdata;
                delete obj.cdata;
              }
              s = stack[stack.length - 1];
              if (obj[charkey].match(/^\s*$/) && !cdata) {
                emptyStr = obj[charkey];
                delete obj[charkey];
              } else {
                if (_this.options.trim) {
                  obj[charkey] = obj[charkey].trim();
                }
                if (_this.options.normalize) {
                  obj[charkey] = obj[charkey].replace(/\s{2,}/g, " ").trim();
                }
                obj[charkey] = _this.options.valueProcessors ? processItem(_this.options.valueProcessors, obj[charkey], nodeName) : obj[charkey];
                if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                  obj = obj[charkey];
                }
              }
              if (isEmpty(obj)) {
                obj = _this.options.emptyTag !== "" ? _this.options.emptyTag : emptyStr;
              }
              if (_this.options.validator != null) {
                xpath = "/" + function() {
                  var i, len, results;
                  results = [];
                  for (i = 0, len = stack.length; i < len; i++) {
                    node = stack[i];
                    results.push(node["#name"]);
                  }
                  return results;
                }().concat(nodeName).join("/");
                (function() {
                  var err;
                  try {
                    return obj = _this.options.validator(xpath, s && s[nodeName], obj);
                  } catch (error1) {
                    err = error1;
                    return _this.emit("error", err);
                  }
                })();
              }
              if (_this.options.explicitChildren && !_this.options.mergeAttrs && typeof obj === "object") {
                if (!_this.options.preserveChildrenOrder) {
                  node = {};
                  if (_this.options.attrkey in obj) {
                    node[_this.options.attrkey] = obj[_this.options.attrkey];
                    delete obj[_this.options.attrkey];
                  }
                  if (!_this.options.charsAsChildren && _this.options.charkey in obj) {
                    node[_this.options.charkey] = obj[_this.options.charkey];
                    delete obj[_this.options.charkey];
                  }
                  if (Object.getOwnPropertyNames(obj).length > 0) {
                    node[_this.options.childkey] = obj;
                  }
                  obj = node;
                } else if (s) {
                  s[_this.options.childkey] = s[_this.options.childkey] || [];
                  objClone = {};
                  for (key in obj) {
                    if (!hasProp.call(obj, key))
                      continue;
                    objClone[key] = obj[key];
                  }
                  s[_this.options.childkey].push(objClone);
                  delete obj["#name"];
                  if (Object.keys(obj).length === 1 && charkey in obj && !_this.EXPLICIT_CHARKEY) {
                    obj = obj[charkey];
                  }
                }
              }
              if (stack.length > 0) {
                return _this.assignOrPush(s, nodeName, obj);
              } else {
                if (_this.options.explicitRoot) {
                  old = obj;
                  obj = {};
                  obj[nodeName] = old;
                }
                _this.resultObject = obj;
                _this.saxParser.ended = true;
                return _this.emit("end", _this.resultObject);
              }
            };
          }(this);
          ontext = function(_this) {
            return function(text) {
              var charChild, s;
              s = stack[stack.length - 1];
              if (s) {
                s[charkey] += text;
                if (_this.options.explicitChildren && _this.options.preserveChildrenOrder && _this.options.charsAsChildren && (_this.options.includeWhiteChars || text.replace(/\\n/g, "").trim() !== "")) {
                  s[_this.options.childkey] = s[_this.options.childkey] || [];
                  charChild = {
                    "#name": "__text__"
                  };
                  charChild[charkey] = text;
                  if (_this.options.normalize) {
                    charChild[charkey] = charChild[charkey].replace(/\s{2,}/g, " ").trim();
                  }
                  s[_this.options.childkey].push(charChild);
                }
                return s;
              }
            };
          }(this);
          this.saxParser.ontext = ontext;
          return this.saxParser.oncdata = function(_this) {
            return function(text) {
              var s;
              s = ontext(text);
              if (s) {
                return s.cdata = true;
              }
            };
          }(this);
        };
        Parser2.prototype.parseString = function(str, cb) {
          var err;
          if (cb != null && typeof cb === "function") {
            this.on("end", function(result) {
              this.reset();
              return cb(null, result);
            });
            this.on("error", function(err2) {
              this.reset();
              return cb(err2);
            });
          }
          try {
            str = str.toString();
            if (str.trim() === "") {
              this.emit("end", null);
              return true;
            }
            str = bom.stripBOM(str);
            if (this.options.async) {
              this.remaining = str;
              setImmediate(this.processAsync);
              return this.saxParser;
            }
            return this.saxParser.write(str).close();
          } catch (error1) {
            err = error1;
            if (!(this.saxParser.errThrown || this.saxParser.ended)) {
              this.emit("error", err);
              return this.saxParser.errThrown = true;
            } else if (this.saxParser.ended) {
              throw err;
            }
          }
        };
        Parser2.prototype.parseStringPromise = function(str) {
          return new Promise(function(_this) {
            return function(resolve, reject) {
              return _this.parseString(str, function(err, value) {
                if (err) {
                  return reject(err);
                } else {
                  return resolve(value);
                }
              });
            };
          }(this));
        };
        return Parser2;
      }(events);
      exports.parseString = function(str, a, b) {
        var cb, options, parser;
        if (b != null) {
          if (typeof b === "function") {
            cb = b;
          }
          if (typeof a === "object") {
            options = a;
          }
        } else {
          if (typeof a === "function") {
            cb = a;
          }
          options = {};
        }
        parser = new exports.Parser(options);
        return parser.parseString(str, cb);
      };
      exports.parseStringPromise = function(str, a) {
        var options, parser;
        if (typeof a === "object") {
          options = a;
        }
        parser = new exports.Parser(options);
        return parser.parseStringPromise(str);
      };
    }).call(exports);
  }
});

// node_modules/xml2js/lib/xml2js.js
var require_xml2js = __commonJS({
  "node_modules/xml2js/lib/xml2js.js"(exports) {
    (function() {
      "use strict";
      var builder, defaults, parser, processors, extend = function(child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      }, hasProp = {}.hasOwnProperty;
      defaults = require_defaults();
      builder = require_builder();
      parser = require_parser();
      processors = require_processors();
      exports.defaults = defaults.defaults;
      exports.processors = processors;
      exports.ValidationError = function(superClass) {
        extend(ValidationError, superClass);
        function ValidationError(message) {
          this.message = message;
        }
        return ValidationError;
      }(Error);
      exports.Builder = builder.Builder;
      exports.Parser = parser.Parser;
      exports.parseString = parser.parseString;
      exports.parseStringPromise = parser.parseStringPromise;
    }).call(exports);
  }
});

// src/module/handlebars/HandlebarTemplates.ts
var preloadHandlebarsTemplates = () => __async(void 0, null, function* () {
  const templatePaths = [
    "systems/shadowrun5e/dist/templates/actor/tabs/ActionsTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/BioTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/MagicTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/MatrixTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/MiscTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/SkillsTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/SocialTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/SpellsTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/EffectsTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/CritterPowersTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/NetworkTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/InventoryTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/spirit/SpiritSkillsTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/matrix/SpriteSkillsTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/matrix/SpritePowersTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/vehicle/VehicleSkillsTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/vehicle/VehicleMatrixTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/ic/ICActorTab.html",
    "systems/shadowrun5e/dist/templates/actor/tabs/ic/ICMiscTab.html",
    "systems/shadowrun5e/dist/templates/actor/parts/Initiative.html",
    "systems/shadowrun5e/dist/templates/actor/parts/Movement.html",
    "systems/shadowrun5e/dist/templates/actor/parts/ProfileImage.html",
    "systems/shadowrun5e/dist/templates/actor/parts/NameInput.html",
    "systems/shadowrun5e/dist/templates/actor/parts/ActionList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/ContactList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/SinAndLifestyleList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/magic/AdeptPowerList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/magic/SpellList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/magic/SpellAndAdeptPowerList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/magic/SpiritOptions.html",
    "systems/shadowrun5e/dist/templates/actor/parts/matrix/ProgramList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/matrix/ComplexFormList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/matrix/MatrixAttribute.html",
    "systems/shadowrun5e/dist/templates/actor/parts/matrix/SpritePowerList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/matrix/DeviceRating.html",
    "systems/shadowrun5e/dist/templates/actor/parts/matrix/Marks.html",
    "systems/shadowrun5e/dist/templates/actor/parts/attributes/Attribute.html",
    "systems/shadowrun5e/dist/templates/actor/parts/attributes/AttributeList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/attributes/SpecialAttributeList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/attributes/Limits.html",
    "systems/shadowrun5e/dist/templates/actor/parts/skills/ActiveSkillList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/skills/LanguageAndKnowledgeSkillList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleStatsList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleSecondStatsList.html",
    "systems/shadowrun5e/dist/templates/actor/parts/vehicle/VehicleMovement.html",
    "systems/shadowrun5e/dist/templates/actor/parts/ic/ICStats.html",
    "systems/shadowrun5e/dist/templates/actor/parts/ic/ICConfiguration.html",
    "systems/shadowrun5e/dist/templates/actor-limited/character.html",
    "systems/shadowrun5e/dist/templates/actor-limited/spirit.html",
    "systems/shadowrun5e/dist/templates/actor-limited/sprite.html",
    "systems/shadowrun5e/dist/templates/actor-limited/vehicle.html",
    "systems/shadowrun5e/dist/templates/actor-limited/critter.html",
    "systems/shadowrun5e/dist/templates/actor-limited/parts/Header.html",
    "systems/shadowrun5e/dist/templates/actor-limited/parts/MiscCharacter.html",
    "systems/shadowrun5e/dist/templates/actor-limited/parts/MiscSpirit.html",
    "systems/shadowrun5e/dist/templates/actor-limited/parts/MiscSprite.html",
    "systems/shadowrun5e/dist/templates/actor-limited/parts/MiscVehicle.html",
    "systems/shadowrun5e/dist/templates/actor-limited/parts/MiscCritter.html",
    "systems/shadowrun5e/dist/templates/item/parts/description.html",
    "systems/shadowrun5e/dist/templates/item/parts/technology.html",
    "systems/shadowrun5e/dist/templates/item/parts/header.html",
    "systems/shadowrun5e/dist/templates/item/parts/weapon-ammo-list.html",
    "systems/shadowrun5e/dist/templates/item/parts/weapon-mods-list.html",
    "systems/shadowrun5e/dist/templates/item/parts/action.html",
    "systems/shadowrun5e/dist/templates/item/parts/action_results.html",
    "systems/shadowrun5e/dist/templates/item/parts/modifier.html",
    "systems/shadowrun5e/dist/templates/item/parts/damage.html",
    "systems/shadowrun5e/dist/templates/item/parts/opposed.html",
    "systems/shadowrun5e/dist/templates/item/parts/spell.html",
    "systems/shadowrun5e/dist/templates/item/parts/complex_form.html",
    "systems/shadowrun5e/dist/templates/item/parts/weapon.html",
    "systems/shadowrun5e/dist/templates/item/parts/armor.html",
    "systems/shadowrun5e/dist/templates/item/parts/matrix.html",
    "systems/shadowrun5e/dist/templates/item/parts/sin.html",
    "systems/shadowrun5e/dist/templates/item/parts/contact.html",
    "systems/shadowrun5e/dist/templates/item/parts/lifestyle.html",
    "systems/shadowrun5e/dist/templates/item/parts/ammo.html",
    "systems/shadowrun5e/dist/templates/item/parts/modification.html",
    "systems/shadowrun5e/dist/templates/item/parts/program.html",
    "systems/shadowrun5e/dist/templates/item/parts/critter_power.html",
    "systems/shadowrun5e/dist/templates/rolls/parts/parts-list.html",
    "systems/shadowrun5e/dist/templates/rolls/parts/Damage.html",
    "systems/shadowrun5e/dist/templates/common/TabWrapper.html",
    "systems/shadowrun5e/dist/templates/common/ValueInput.html",
    "systems/shadowrun5e/dist/templates/common/ValueMaxAttribute.html",
    "systems/shadowrun5e/dist/templates/common/Attribute.html",
    "systems/shadowrun5e/dist/templates/common/ValueModifiers.html",
    "systems/shadowrun5e/dist/templates/common/Select.html",
    "systems/shadowrun5e/dist/templates/common/HorizontalCellInput.html",
    "systems/shadowrun5e/dist/templates/common/HeaderBlock.html",
    "systems/shadowrun5e/dist/templates/common/NameLineBlock.html",
    "systems/shadowrun5e/dist/templates/common/List/ListItem.html",
    "systems/shadowrun5e/dist/templates/common/List/ListEntityItem.html",
    "systems/shadowrun5e/dist/templates/common/List/ListHeader.html",
    "systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.html",
    "systems/shadowrun5e/dist/templates/apps/dialogs/parts/success-test-common.html",
    "systems/shadowrun5e/dist/templates/rolls/success-test-message.html",
    "systems/shadowrun5e/dist/templates/rolls/parts/rolled-dice.html",
    "systems/shadowrun5e/dist/templates/rolls/parts/test-opposed-resist.html"
  ];
  return loadTemplates(templatePaths);
});

// src/module/parts/PartsList.ts
var PartsList = class {
  get list() {
    return this._list.slice();
  }
  get length() {
    return this._list.length;
  }
  get total() {
    let total = 0;
    for (const part of this._list) {
      if (typeof part.value === "number") {
        total += part.value;
      }
    }
    return total;
  }
  get last() {
    return this._list[this._list.length - 1];
  }
  get isEmpty() {
    return this.length === 0;
  }
  getPartValue(name) {
    var _a;
    return (_a = this._list.find((part) => part.name === name)) == null ? void 0 : _a.value;
  }
  clear() {
    this._list.length = 0;
  }
  constructor(parts) {
    let actualParts = [];
    if (parts) {
      if (Array.isArray(parts)) {
        actualParts = parts;
      } else if (typeof parts === "object") {
        for (const [name, value] of Object.entries(parts)) {
          if (value !== null && value !== void 0) {
            if (!isNaN(Number(name)) && typeof value === "object") {
              actualParts.push({
                name: value.name,
                value: value.value
              });
            } else {
              actualParts.push({
                name,
                value
              });
            }
          }
        }
      }
    }
    this._list = actualParts;
  }
  addPart(name, value) {
    this._list.push({
      name,
      value
    });
  }
  addUniquePart(name, value, overwrite = true) {
    const index = this._list.findIndex((part) => part.name === name);
    if (index > -1) {
      if (!overwrite)
        return;
      this._list.splice(index, 1);
      if (value === void 0 || value === null)
        return;
      this.addUniquePart(name, value);
    } else if (value !== void 0) {
      this.addPart(name, value);
    } else {
      console.warn("Shadowrun 5e | PartsList cant add a none-numerical modifier.", name, value);
    }
  }
  removePart(name) {
    let index = this._list.findIndex((part) => part.name === name);
    let removed = false;
    while (index > -1) {
      removed = true;
      this._list.splice(index, 1);
      index = this._list.findIndex((part) => part.name === name);
    }
    return removed;
  }
  getMessageOutput() {
    return this.list;
  }
  static AddPart(list, name, value) {
    const parts = new PartsList(list);
    parts.addPart(name, value);
    return parts._list;
  }
  static AddUniquePart(list, name, value, overwrite = true) {
    const parts = new PartsList(list);
    parts.addUniquePart(name, value, overwrite);
    return parts._list;
  }
  static RemovePart(list, name) {
    const parts = new PartsList(list);
    parts.removePart(name);
    return parts._list;
  }
  static Total(list) {
    const parts = new PartsList(list);
    return parts.total;
  }
};

// src/module/constants.ts
var SYSTEM_NAME = "shadowrun5e";
var SYSTEM_SOCKET = `system.${SYSTEM_NAME}`;
var FLAGS = {
  ShowGlitchAnimation: "showGlitchAnimation",
  ShowTokenNameForChatOutput: "showTokenNameInsteadOfActor",
  WhisperOpposedTestsToTargetedPlayers: "whisperOpposedTestsToTargetedPlayers",
  OnlyAllowRollOnDefaultableSkills: "onlyAllowRollOnDefaultableSkills",
  ShowSkillsWithDetails: "showSkillsWithDetails",
  OnlyAutoRollNPCInCombat: "onlyAutoRollNPCInCombat",
  MessageCustomRoll: "customRoll",
  ApplyLimits: "applyLimits",
  LastRollPromptValue: "lastRollPromptValue",
  DisplayDefaultRollCard: "displayDefaultRollCard",
  CombatInitiativePass: "combatInitiativePass",
  EmbeddedItems: "embeddedItems",
  LastFireMode: "lastFireMode",
  LastSpellForce: "lastSpellForce",
  LastComplexFormLevel: "lastComplexFormLevel",
  LastFireRange: "lastFireRange",
  Attack: "attack",
  Roll: "roll",
  ActionTestData: "actionTestData",
  TargetsSceneTokenIds: "targetsSceneTokenIds",
  ChangelogShownForVersion: "changelogShownForVersion",
  Modifier: "modifier",
  DoInitPass: "doInitPass",
  DoNextRound: "doNextRound",
  addNetworkController: "addNetworkController",
  TokenHealthBars: "tokenHealthBars",
  Test: "TestData",
  HideGMOnlyChatContent: "HideGMOnlyChatContent",
  MustHaveRessourcesOnTest: "MustConsumeRessourcesOnTest"
};
var CORE_NAME = "core";
var CORE_FLAGS = {
  RollMode: "rollMode"
};
var METATYPEMODIFIER = "SR5.Character.Modifiers.NPCMetatypeAttribute";
var LENGTH_UNIT_TO_METERS_MULTIPLIERS = {
  "m": 1,
  "meter": 1,
  "meters": 1,
  "km": 1e3,
  "kilometers": 1e3,
  "kilometer": 1e3
};
var DEFAULT_ROLL_NAME = "Roll";
var LENGTH_UNIT = "m";
var SKILL_DEFAULT_NAME = "";
var DEFAULT_ID_LENGTH = 16;
var SR = {
  combat: {
    environmental: {
      range_modifiers: {
        short: 0,
        medium: -1,
        long: -3,
        extreme: -6,
        out_of_range: 0
      },
      levels: {
        good: 0,
        light: -1,
        moderate: -3,
        heavy: -6,
        extreme: -10
      }
    },
    INI_RESULT_MOD_AFTER_INI_PASS: -10,
    INITIAL_INI_PASS: 1,
    INITIAL_INI_ROUND: 1
  },
  die: {
    glitch: [1],
    success: [5, 6]
  },
  defense: {
    spell: {
      direct: {
        mana: "willpower",
        physical: "body"
      }
    }
  },
  attributes: {
    ranges: {
      magic: { min: 0 },
      edge: { min: 0 },
      resonance: { min: 0 },
      essence: { min: 0 },
      body: { min: 1 },
      agility: { min: 1 },
      reaction: { min: 1 },
      strength: { min: 1 },
      willpower: { min: 1 },
      logic: { min: 1 },
      intuition: { min: 1 },
      charisma: { min: 1 },
      attack: { min: 0 },
      sleaze: { min: 0 },
      data_processing: { min: 0 },
      firewall: { min: 0 },
      host_rating: { min: 0, max: 12 }
    },
    defaults: {
      essence: 6
    },
    SHORT_NAME_LENGTH: 3
  },
  skill: {
    DEFAULTING_MODIFIER: -1,
    SPECIALIZATION_MODIFIER: 2
  },
  initiatives: {
    ic: {
      dice: 4
    },
    ranges: {
      base: { min: 0 },
      dice: { min: 0, max: 5 }
    }
  }
};

// src/module/apps/dialogs/FormDialog.ts
var FormDialog = class extends Dialog {
  constructor(data, options) {
    super(data, options);
    const { templateData, templatePath } = data;
    this._templateData = templateData;
    this._templatePath = templatePath;
    this._onAfterClose = data.onAfterClose || this.onAfterClose;
    this.selection = this._emptySelection();
    this._selectionPromise = new Promise((resolve, reject) => {
      this._selectionResolve = resolve;
      this._selectionReject = reject;
    });
  }
  close() {
    return __async(this, null, function* () {
      yield __superGet(FormDialog.prototype, this, "close").call(this);
      if (this.canceled) {
        setTimeout(() => this._selectionResolve(this.selection), 250);
      }
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.on("change", "input,select,textarea", this._onChangeInput.bind(this));
  }
  submit(button) {
    return __async(this, null, function* () {
      var _a;
      this.selectedButton = (_a = button.name) != null ? _a : button.label;
      this.applyFormData();
      __superGet(FormDialog.prototype, this, "submit").call(this, button);
      yield this.afterSubmit("jQuery" in this.options ? this.element : this.element[0]);
    });
  }
  afterSubmit(html) {
    return __async(this, null, function* () {
      this.selection = yield this._onAfterClose(html, this.selectedButton);
      setTimeout(() => this._selectionResolve(this.selection), 250);
    });
  }
  applyFormData() {
    if (!this.options.applyFormChangesOnSubmit)
      return;
    if (!this.form)
      throw new Error(`The FormApplication subclass has no registered form element`);
    const fd = new FormDataExtended(this.form, { editors: {} });
    const data = fd.object;
    this._updateData(data);
  }
  _updateData(data) {
    foundry.utils.mergeObject(this.data.templateData, data);
  }
  getData() {
    this.data.buttons = this.data.buttons || this.buttons;
    this._amendButtonsWithName(this.data.buttons);
    const data = super.getData();
    return mergeObject(data, __spreadProps(__spreadValues({}, this.data), {
      content: ""
    }));
  }
  get buttons() {
    return {};
  }
  get templateContent() {
    return "";
  }
  select() {
    return __async(this, null, function* () {
      yield this.render(true);
      if (this._selectionPromise === void 0 || this.selection === void 0) {
        return this._emptySelection();
      }
      return yield this._selectionPromise;
    });
  }
  _emptySelection() {
    return {};
  }
  get selected() {
    return !this.canceled;
  }
  get canceled() {
    return !this.selectedButton || this.selectedButton === "cancel";
  }
  static getButtons() {
    return {};
  }
  _amendButtonsWithName(buttons) {
    Object.keys(buttons).forEach((name) => buttons[name].name = name);
  }
  _renderInner(data) {
    return __async(this, null, function* () {
      const templatePath = data.templatePath || this.templateContent;
      if (templatePath)
        data.content = yield renderTemplate(data.templatePath || this.templateContent, data.templateData || data);
      const html = yield __superGet(FormDialog.prototype, this, "_renderInner").call(this, data);
      this.form = html.filter((i, el) => el instanceof HTMLFormElement)[0];
      if (!this.form)
        this.form = html.find("form")[0];
      return html;
    });
  }
  _onChangeInput(event) {
    return __async(this, null, function* () {
      const el = event.target;
      if (this.options.applyFormChangesOnSubmit) {
        this.applyFormData();
        this.render();
      }
    });
  }
  onAfterClose(html) {
  }
};

// src/module/apps/dialogs/DeleteConfirmationDialog.ts
var DeleteConfirmationDialog = class extends FormDialog {
  constructor(options) {
    const dialogData = DeleteConfirmationDialog.getDialogData();
    super(dialogData, options);
  }
  static getDialogData() {
    return {
      title: game.i18n.localize("SR5.DeleteConfirmationApplication.Title"),
      buttons: {
        delete: {
          label: game.i18n.localize("SR5.DeleteConfirmationApplication.Delete")
        },
        cancel: {
          label: game.i18n.localize("SR5.DeleteConfirmationApplication.Cancel")
        }
      },
      default: "cancel",
      templateData: {},
      templatePath: "systems/shadowrun5e/dist/templates/apps/dialogs/delete-confirmation-dialog.html"
    };
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "delete-confirmation-application";
    options.classes = ["sr5", "form-dialog"];
    options.resizable = true;
    options.height = "auto";
    return options;
  }
};

// src/module/data/DataDefaults.ts
var DefaultValues = class {
  static damageData(partialDamageData = {}) {
    const data = {
      type: {
        base: "physical",
        value: "physical"
      },
      element: {
        base: "",
        value: ""
      },
      base: 0,
      value: 0,
      ap: {
        base: 0,
        value: 0,
        mod: []
      },
      attribute: "",
      mod: [],
      base_formula_operator: "add",
      source: {
        actorId: "",
        itemId: "",
        itemType: "",
        itemName: ""
      }
    };
    return mergeObject(data, partialDamageData);
  }
  static actorArmorData(partialActorArmorData = {}) {
    return mergeObject({
      value: 0,
      mod: [],
      base: 0,
      label: ""
    }, partialActorArmorData);
  }
  static equipmentData(partialEquipmentData = {}) {
    return mergeObject({
      description: this.descriptionData(),
      technology: this.technologyData()
    }, partialEquipmentData);
  }
  static qualityData(partialQualityData = {}) {
    return mergeObject({
      type: "",
      description: this.descriptionData(),
      action: this.actionRollData()
    }, partialQualityData);
  }
  static technologyData(partialTechnologyData = {}) {
    return mergeObject({
      rating: "",
      availability: "",
      quantity: 1,
      cost: 0,
      equipped: false,
      conceal: {
        base: 0,
        value: 0,
        mod: []
      },
      condition_monitor: {
        label: "",
        value: 0,
        max: 0
      },
      wireless: true,
      networkController: void 0
    }, partialTechnologyData);
  }
  static descriptionData(partialDescriptionData = {}) {
    return mergeObject({
      value: "",
      chat: "",
      source: ""
    }, partialDescriptionData);
  }
  static matrixData(partialMatrixData = {}) {
    if (partialMatrixData.category === void 0)
      delete partialMatrixData.category;
    if (partialMatrixData.atts === void 0)
      delete partialMatrixData.atts;
    return mergeObject({
      category: "",
      atts: {
        att1: {
          value: 0,
          att: "attack",
          editable: true
        },
        att2: {
          value: 0,
          att: "attack",
          editable: true
        },
        att3: {
          value: 0,
          att: "attack",
          editable: true
        },
        att4: {
          value: 0,
          att: "attack",
          editable: true
        }
      },
      networkDevices: []
    }, partialMatrixData);
  }
  static actionRollData(partialActionRollData = {}) {
    return mergeObject({
      type: "",
      category: "",
      attribute: "",
      attribute2: "",
      skill: "",
      spec: false,
      mod: 0,
      mod_description: "",
      limit: this.limitData(),
      extended: false,
      damage: this.damageData(),
      opposed: this.opposedTestData(),
      alt_mod: 0,
      dice_pool_mod: []
    }, partialActionRollData);
  }
  static actionResultData(partialActionResultData = {}) {
    return mergeObject({
      success: {
        matrix: {
          placeMarks: false
        }
      }
    });
  }
  static limitData(partialLimitData = {}) {
    return mergeObject({
      value: 0,
      base: 0,
      attribute: "",
      mod: []
    }, partialLimitData);
  }
  static opposedTestData(partialOpposedTestData = {}) {
    return mergeObject({
      type: "",
      attribute: "",
      attribute2: "",
      skill: "",
      mod: 0,
      description: ""
    }, partialOpposedTestData);
  }
  static skillData(partialSkillData = {}) {
    return mergeObject({
      name: SKILL_DEFAULT_NAME,
      base: 0,
      value: 0,
      hidden: false,
      canDefault: false,
      label: "",
      bonus: [],
      specs: [],
      mod: [],
      attribute: ""
    }, partialSkillData);
  }
  static trackData(partialTrackData = {}) {
    return mergeObject({
      value: 0,
      max: 0,
      label: "",
      mod: [],
      disabled: false,
      wounds: 0
    }, partialTrackData);
  }
  static hostData(partialHostData = {}) {
    return mergeObject(__spreadProps(__spreadValues({
      description: DefaultValues.descriptionData(partialHostData.description)
    }, DefaultValues.matrixData({ category: partialHostData.category, atts: partialHostData.atts })), {
      rating: 0,
      ic: []
    }), partialHostData);
  }
  static sourceEntityData(partialSourceEntityData = {}) {
    return mergeObject({
      id: "",
      name: "",
      pack: null,
      type: "Actor",
      data: partialSourceEntityData.data || void 0
    }, partialSourceEntityData);
  }
  static equipmentItemData(partialEquipmentItemData = {}) {
    var _a, _b;
    return mergeObject({
      name: "",
      type: "equipment",
      data: {
        description: DefaultValues.descriptionData(((_a = partialEquipmentItemData.data) == null ? void 0 : _a.description) || {}),
        technology: DefaultValues.technologyData(((_b = partialEquipmentItemData.data) == null ? void 0 : _b.technology) || {})
      }
    }, partialEquipmentItemData);
  }
  static deviceItemData(partialDeviceItemData = {}) {
    var _a, _b, _c, _d;
    return mergeObject({
      name: "",
      type: "device",
      data: __spreadValues({
        description: DefaultValues.descriptionData(((_a = partialDeviceItemData.data) == null ? void 0 : _a.description) || {}),
        technology: DefaultValues.technologyData(((_b = partialDeviceItemData.data) == null ? void 0 : _b.technology) || {})
      }, DefaultValues.matrixData({ category: (_c = partialDeviceItemData.data) == null ? void 0 : _c.category, atts: (_d = partialDeviceItemData.data) == null ? void 0 : _d.atts }))
    }, partialDeviceItemData);
  }
  static valueData(partialValueData = {}) {
    return mergeObject({
      base: 0,
      value: 0,
      temp: 0,
      mod: [],
      label: ""
    }, partialValueData);
  }
  static genericValueData(partialGenericValueData = {}) {
    return mergeObject({
      base: 0,
      value: 0,
      temp: 0,
      mod: [],
      label: ""
    }, partialGenericValueData);
  }
  static minimalActionData(partialActionData = {}) {
    return mergeObject({
      attribute: "",
      attribute2: "",
      skill: "",
      mod: 0,
      armor: false,
      limit: {
        value: 0,
        attribute: "",
        mod: [],
        base: 0
      }
    }, partialActionData);
  }
  static actionData(partialActionData = {}) {
    return mergeObject({
      test: "",
      type: "",
      category: "",
      attribute: "",
      attribute2: "",
      skill: "",
      spec: false,
      mod: 0,
      mod_description: "",
      damage: DefaultValues.damageData(),
      modifiers: [],
      limit: {
        value: 0,
        attribute: "",
        mod: [],
        base: 0
      },
      threshold: {
        value: 0,
        base: 0
      },
      extended: false,
      opposed: {
        type: "",
        test: "",
        attribute: "",
        attribute2: "",
        skill: "",
        mod: 0,
        description: ""
      },
      followed: {
        test: "",
        attribute: "",
        attribute2: "",
        skill: "",
        mod: 0
      },
      alt_mod: 0,
      dice_pool_mod: []
    }, partialActionData);
  }
  static fireModeData(partialFireModeData = {}) {
    return mergeObject({
      value: 0,
      label: "",
      defense: 0,
      recoil: false,
      suppression: false,
      mode: "single_shot",
      action: "simple"
    }, partialFireModeData);
  }
};
var DataDefaults = {
  grunt: {
    metatype_modifiers: {
      elf: {
        attributes: {
          agility: 1,
          charisma: 2,
          edge: -1
        }
      },
      ork: {
        attributes: {
          body: 3,
          strength: 2,
          logic: -1,
          charisma: -1,
          edge: -1
        }
      },
      troll: {
        attributes: {
          body: 4,
          agility: -1,
          strength: 4,
          logic: -1,
          intuition: -1,
          charisma: -2,
          edge: -1
        },
        general: {
          armor: 1
        }
      },
      dwarf: {
        attributes: {
          body: 2,
          reaction: -1,
          strength: 2,
          willpower: 1,
          edge: -1
        }
      }
    }
  },
  damage: DefaultValues.damageData({ type: { base: "", value: "" } })
};

// src/module/config.ts
var SR5 = {
  itemTypes: {
    action: "SR5.ItemTypes.Action",
    adept_power: "SR5.ItemTypes.AdeptPower",
    ammo: "SR5.ItemTypes.Ammo",
    armor: "SR5.ItemTypes.Armor",
    complex_form: "SR5.ItemTypes.ComplexForm",
    contact: "SR5.ItemTypes.Contact",
    critter_power: "SR5.ItemTypes.CritterPower",
    cyberware: "SR5.ItemTypes.Cyberware",
    bioware: "SR5.ItemTypes.Bioware",
    device: "SR5.ItemTypes.Device",
    equipment: "SR5.ItemTypes.Equipment",
    lifestyle: "SR5.ItemTypes.Lifestyle",
    modification: "SR5.ItemTypes.Modification",
    quality: "SR5.ItemTypes.Quality",
    sin: "SR5.ItemTypes.Sin",
    spell: "SR5.ItemTypes.Spell",
    weapon: "SR5.ItemTypes.Weapon",
    host: "SR5.ItemTypes.Host"
  },
  attributes: {
    agility: "SR5.AttrAgility",
    attack: "SR5.MatrixAttrAttack",
    body: "SR5.AttrBody",
    charisma: "SR5.AttrCharisma",
    data_processing: "SR5.MatrixAttrDataProc",
    edge: "SR5.AttrEdge",
    essence: "SR5.AttrEssence",
    firewall: "SR5.MatrixAttrFirewall",
    intuition: "SR5.AttrIntuition",
    logic: "SR5.AttrLogic",
    magic: "SR5.AttrMagic",
    reaction: "SR5.AttrReaction",
    resonance: "SR5.AttrResonance",
    sleaze: "SR5.MatrixAttrSleaze",
    strength: "SR5.AttrStrength",
    willpower: "SR5.AttrWillpower"
  },
  limits: {
    physical: "SR5.LimitPhysical",
    social: "SR5.LimitSocial",
    mental: "SR5.LimitMental",
    attack: "SR5.MatrixAttrAttack",
    sleaze: "SR5.MatrixAttrSleaze",
    data_processing: "SR5.MatrixAttrDataProc",
    firewall: "SR5.MatrixAttrFirewall",
    speed: "SR5.Vehicle.Stats.Speed",
    sensor: "SR5.Vehicle.Stats.Sensor",
    handling: "SR5.Vehicle.Stats.Handling"
  },
  specialTypes: {
    mundane: "SR5.Mundane",
    magic: "SR5.Awakened",
    resonance: "SR5.Emerged"
  },
  damageTypes: {
    physical: "SR5.DmgTypePhysical",
    stun: "SR5.DmgTypeStun",
    matrix: "SR5.DmgTypeMatrix"
  },
  elementTypes: {
    fire: "SR5.ElementFire",
    cold: "SR5.ElementCold",
    acid: "SR5.ElementAcid",
    electricity: "SR5.ElementElectricity",
    radiation: "SR5.ElementRadiation"
  },
  spellCategories: {
    combat: "SR5.SpellCatCombat",
    detection: "SR5.SpellCatDetection",
    health: "SR5.SpellCatHealth",
    illusion: "SR5.SpellCatIllusion",
    manipulation: "SR5.SpellCatManipulation"
  },
  spellTypes: {
    physical: "SR5.SpellTypePhysical",
    mana: "SR5.SpellTypeMana"
  },
  spellRanges: {
    touch: "SR5.SpellRangeTouch",
    los: "SR5.SpellRangeLos",
    los_a: "SR5.SpellRangeLosA"
  },
  combatSpellTypes: {
    direct: "SR5.SpellCombatDirect",
    indirect: "SR5.SpellCombatIndirect"
  },
  detectionSpellTypes: {
    directional: "SR5.SpellDetectionDirectional",
    psychic: "SR5.SpellDetectionPsychic",
    area: "SR5.SpellDetectionArea"
  },
  illusionSpellTypes: {
    obvious: "SR5.SpellIllusionObvious",
    realistic: "SR5.SpellIllusionRealistic"
  },
  illusionSpellSenses: {
    "single-sense": "SR5.SpellIllusionSingleSense",
    "multi-sense": "SR5.SpellIllusionMultiSense"
  },
  attributeRolls: {
    composure: "SR5.RollComposure",
    lift_carry: "SR5.RollLiftCarry",
    judge_intentions: "SR5.RollJudgeIntentions",
    memory: "SR5.RollMemory"
  },
  matrixTargets: {
    persona: "SR5.TargetPersona",
    device: "SR5.TargetDevice",
    file: "SR5.TargetFile",
    self: "SR5.TargetSelf",
    sprite: "SR5.TargetSprite",
    other: "SR5.TargetOther"
  },
  durations: {
    instant: "SR5.DurationInstant",
    sustained: "SR5.DurationSustained",
    permanent: "SR5.DurationPermanent"
  },
  weaponCategories: {
    range: "SR5.WeaponCatRange",
    melee: "SR5.WeaponCatMelee",
    thrown: "SR5.WeaponCatThrown"
  },
  weaponRanges: {
    short: "SR5.WeaponRangeShort",
    medium: "SR5.WeaponRangeMedium",
    long: "SR5.WeaponRangeLong",
    extreme: "SR5.WeaponRangeExtreme"
  },
  qualityTypes: {
    positive: "SR5.QualityTypePositive",
    negative: "SR5.QualityTypeNegative"
  },
  adeptPower: {
    types: {
      active: "SR5.AdeptPower.Types.Active",
      passive: "SR5.AdeptPower.Types.Passive"
    }
  },
  deviceCategories: {
    commlink: "SR5.DeviceCatCommlink",
    cyberdeck: "SR5.DeviceCatCyberdeck"
  },
  cyberwareGrades: {
    standard: "SR5.CyberwareGradeStandard",
    alpha: "SR5.CyberwareGradeAlpha",
    beta: "SR5.CyberwareGradeBeta",
    delta: "SR5.CyberwareGradeDelta",
    used: "SR5.CyberwareGradeUsed"
  },
  knowledgeSkillCategories: {
    street: "SR5.KnowledgeSkillStreet",
    academic: "SR5.KnowledgeSkillAcademic",
    professional: "SR5.KnowledgeSkillProfessional",
    interests: "SR5.KnowledgeSkillInterests"
  },
  activeSkills: {
    archery: "SR5.SkillArchery",
    automatics: "SR5.SkillAutomatics",
    blades: "SR5.SkillBlades",
    clubs: "SR5.SkillClubs",
    exotic_melee: "SR5.SkillExoticMelee",
    exotic_range: "SR5.SkillExoticRange",
    heavy_weapons: "SR5.SkillHeavyWeapons",
    longarms: "SR5.SkillLongarms",
    pistols: "SR5.SkillPistols",
    throwing_weapons: "SR5.SkillThrowingWeapons",
    unarmed_combat: "SR5.SkillUnarmedCombat",
    disguise: "SR5.SkillDisguise",
    diving: "SR5.SkillDiving",
    escape_artist: "SR5.SkillEscapeArtist",
    free_fall: "SR5.SkillFreeFall",
    gymnastics: "SR5.SkillGymnastics",
    palming: "SR5.SkillPalming",
    perception: "SR5.SkillPerception",
    running: "SR5.SkillRunning",
    sneaking: "SR5.SkillSneaking",
    survival: "SR5.SkillSurvival",
    swimming: "SR5.SkillSwimming",
    tracking: "SR5.SkillTracking",
    con: "SR5.SkillCon",
    etiquette: "SR5.SkillEtiquette",
    impersonation: "SR5.SkillImpersonation",
    instruction: "SR5.SkillInstruction",
    intimidation: "SR5.SkillIntimidation",
    leadership: "SR5.SkillLeadership",
    negotiation: "SR5.SkillNegotiation",
    performance: "SR5.SkillPerformance",
    alchemy: "SR5.SkillAlchemy",
    arcana: "SR5.SkillArcana",
    artificing: "SR5.SkillArtificing",
    assensing: "SR5.SkillAssensing",
    astral_combat: "SR5.SkillAstralCombat",
    banishing: "SR5.SkillBanishing",
    binding: "SR5.SkillBinding",
    counterspelling: "SR5.SkillCounterspelling",
    disenchanting: "SR5.SkillDisenchanting",
    ritual_spellcasting: "SR5.SkillRitualSpellcasting",
    spellcasting: "SR5.SkillSpellcasting",
    summoning: "SR5.SkillSummoning",
    compiling: "SR5.SkillCompiling",
    decompiling: "SR5.SkillDecompiling",
    registering: "SR5.SkillRegistering",
    aeronautics_mechanic: "SR5.SkillAeronauticsMechanic",
    automotive_mechanic: "SR5.SkillAutomotiveMechanic",
    industrial_mechanic: "SR5.SkillIndustrialMechanic",
    nautical_mechanic: "SR5.SkillNauticalMechanic",
    animal_handling: "SR5.SkillAnimalHandling",
    armorer: "SR5.SkillArmorer",
    artisan: "SR5.SkillArtisan",
    biotechnology: "SR5.SkillBiotechnology",
    chemistry: "SR5.SkillChemistry",
    computer: "SR5.SkillComputer",
    cybercombat: "SR5.SkillCybercombat",
    cybertechnology: "SR5.SkillCybertechnology",
    demolitions: "SR5.SkillDemolitions",
    electronic_warfare: "SR5.SkillElectronicWarfare",
    first_aid: "SR5.SkillFirstAid",
    forgery: "SR5.SkillForgery",
    hacking: "SR5.SkillHacking",
    hardware: "SR5.SkillHardware",
    locksmith: "SR5.SkillLocksmith",
    medicine: "SR5.SkillMedicine",
    navigation: "SR5.SkillNavigation",
    software: "SR5.SkillSoftware",
    gunnery: "SR5.SkillGunnery",
    pilot_aerospace: "SR5.SkillPilotAerospace",
    pilot_aircraft: "SR5.SkillPilotAircraft",
    pilot_walker: "SR5.SkillPilotWalker",
    pilot_ground_craft: "SR5.SkillPilotGroundCraft",
    pilot_water_craft: "SR5.SkillPilotWaterCraft",
    pilot_exotic_vehicle: "SR5.SkillPilotExoticVehicle"
  },
  actionTypes: {
    none: "SR5.ActionTypeNone",
    free: "SR5.ActionTypeFree",
    simple: "SR5.ActionTypeSimple",
    complex: "SR5.ActionTypeComplex",
    varies: "SR5.ActionTypeVaries"
  },
  actionDamageFormulaOperators: {
    add: "+",
    subtract: "-",
    multiply: "*",
    divide: "/"
  },
  matrixAttributes: {
    attack: "SR5.MatrixAttrAttack",
    sleaze: "SR5.MatrixAttrSleaze",
    data_processing: "SR5.MatrixAttrDataProc",
    firewall: "SR5.MatrixAttrFirewall"
  },
  initiativeCategories: {
    meatspace: "SR5.InitCatMeatspace",
    astral: "SR5.InitCatAstral",
    matrix: "SR5.InitCatMatrix"
  },
  modificationTypes: {
    weapon: "SR5.Weapon",
    armor: "SR5.Armor"
  },
  mountPoints: {
    barrel: "SR5.Barrel",
    under_barrel: "SR5.UnderBarrel",
    stock: "SR5.Stock",
    top: "SR5.Top",
    side: "SR5.Side",
    internal: "SR5.Internal"
  },
  lifestyleTypes: {
    street: "SR5.LifestyleStreet",
    squatter: "SR5.LifestyleSquatter",
    low: "SR5.LifestyleLow",
    medium: "SR5.LifestyleMiddle",
    high: "SR5.LifestyleHigh",
    luxory: "SR5.LifestyleLuxory",
    other: "SR5.LifestyleOther"
  },
  kbmod: {
    ITEM_DESCR: "ctrlKey",
    EDGE: "altKey",
    HIDE_DIALOG: "shiftKey"
  },
  actorModifiers: {
    soak: "SR5.RollSoak",
    drain: "SR5.Drain",
    armor: "SR5.Armor",
    physical_limit: "SR5.PhysicalLimit",
    social_limit: "SR5.SocialLimit",
    mental_limit: "SR5.MentalLimit",
    stun_track: "SR5.StunTrack",
    physical_track: "SR5.PhysicalTrack",
    meat_initiative: "SR5.MeatSpaceInit",
    meat_initiative_dice: "SR5.MeatSpaceDice",
    astral_initiative: "SR5.AstralInit",
    astral_initiative_dice: "SR5.AstralDice",
    matrix_initiative: "SR5.MatrixInit",
    matrix_initiative_dice: "SR5.MatrixDice",
    matrix_track: "SR5.MatrixTrack",
    composure: "SR5.RollComposure",
    lift_carry: "SR5.RollLiftCarry",
    judge_intentions: "SR5.RollJudgeIntentions",
    memory: "SR5.RollMemory",
    walk: "SR5.Walk",
    run: "SR5.Run",
    defense: "SR5.RollDefense",
    wound_tolerance: "SR5.WoundTolerance",
    essence: "SR5.AttrEssence",
    fade: "SR5.RollFade",
    global: "SR5.Global"
  },
  modifierTypes: {
    armor: "SR5.Armor",
    composure: "SR5.RollComposure",
    defense: "SR5.RollDefense",
    drain: "SR5.Drain",
    environmental: "SR5.ModifierTypes.Environmental",
    fade: "SR5.RollFade",
    global: "SR5.Global",
    judge_intentions: "SR5.RollJudgeIntentions",
    lift_carry: "SR5.RollLiftCarry",
    memory: "SR5.RollMemory",
    soak: "SR5.RollSoak",
    wounds: "SR5.ModifierTypes.Wounds"
  },
  weaponCategoryActiveTests: {
    "range": "RangedAttackTest",
    "melee": "MeleeAttackTest",
    "thrown": "ThrownAttackTest"
  },
  spellOpposedTests: {
    "combat": "CombatSpellDefenseTest"
  },
  activeTests: {
    "spell": "SpellCastingTest",
    "complex_form": "ComplexFormTest"
  },
  opposedTests: {
    "spell": {
      "combat": "CombatSpellDefenseTest"
    }
  },
  opposedResistTests: {
    "spell": {
      "combat": "PhysicalResistTest"
    }
  },
  supressionDefenseTest: "SupressionDefenseTest",
  packNames: {
    "generalActions": "General Actions",
    "matrixActions": "Matrix Actions"
  },
  programTypes: {
    common_program: "SR5.CommonProgram",
    hacking_program: "SR5.HackingProgram",
    agent: "SR5.Agent"
  },
  spiritTypes: {
    air: "SR5.Spirit.Types.Air",
    aircraft: "SR5.Spirit.Types.Aircraft",
    airwave: "SR5.Spirit.Types.Airwave",
    automotive: "SR5.Spirit.Types.Automotive",
    beasts: "SR5.Spirit.Types.Beasts",
    ceramic: "SR5.Spirit.Types.Ceramic",
    earth: "SR5.Spirit.Types.Earth",
    energy: "SR5.Spirit.Types.Energy",
    fire: "SR5.Spirit.Types.Fire",
    guardian: "SR5.Spirit.Types.Guardian",
    guidance: "SR5.Spirit.Types.Guidance",
    man: "SR5.Spirit.Types.Man",
    metal: "SR5.Spirit.Types.Metal",
    plant: "SR5.Spirit.Types.Plant",
    ship: "SR5.Spirit.Types.Ship",
    task: "SR5.Spirit.Types.Task",
    train: "SR5.Spirit.Types.Train",
    water: "SR5.Spirit.Types.Water",
    toxic_air: "SR5.Spirit.Types.ToxicAir",
    toxic_beasts: "SR5.Spirit.Types.ToxicBeasts",
    toxic_earth: "SR5.Spirit.Types.ToxicEarth",
    toxic_fire: "SR5.Spirit.Types.ToxicFire",
    toxic_man: "SR5.Spirit.Types.ToxicMan",
    toxic_water: "SR5.Spirit.Types.ToxicWater",
    blood: "SR5.Spirit.Types.Blood",
    muse: "SR5.Spirit.Types.Muse",
    nightmare: "SR5.Spirit.Types.Nightmare",
    shade: "SR5.Spirit.Types.Shade",
    succubus: "SR5.Spirit.Types.Succubus",
    wraith: "SR5.Spirit.Types.Wraith",
    shedim: "SR5.Spirit.Types.Shedim",
    master_shedim: "SR5.Spirit.Types.MasterShedim",
    caretaker: "SR5.Spirit.Types.Caretaker",
    nymph: "SR5.Spirit.Types.Nymph",
    scout: "SR5.Spirit.Types.Scout",
    soldier: "SR5.Spirit.Types.Soldier",
    worker: "SR5.Spirit.Types.Worker",
    queen: "SR5.Spirit.Types.Queen"
  },
  critterPower: {
    categories: {
      mundane: "SR5.CritterPower.Categories.Mundane",
      paranormal: "SR5.CritterPower.Categories.Paranormal",
      free_spirit: "SR5.CritterPower.Categories.FreeSpirit",
      emergent: "SR5.CritterPower.Categories.Emergent",
      shapeshifter: "SR5.CritterPower.Categories.Shapeshifter",
      drake: "SR5.CritterPower.Categories.Drake",
      echoes: "SR5.CritterPower.Categories.Echoes",
      weakness: "SR5.CritterPower.Categories.Weakness",
      paranormal_infected: "SR5.CritterPower.Categories.ParanormalInfected"
    },
    types: {
      mana: "SR5.CritterPower.Types.Mana",
      physical: "SR5.CritterPower.Types.Physical"
    },
    ranges: {
      los: "SR5.CritterPower.Ranges.LineOfSight",
      self: "SR5.CritterPower.Ranges.Self",
      touch: "SR5.CritterPower.Ranges.Touch",
      los_a: "SR5.CritterPower.Ranges.LineOfSightArea",
      special: "SR5.CritterPower.Ranges.Special"
    },
    durations: {
      always: "SR5.CritterPower.Durations.Always",
      instant: "SR5.CritterPower.Durations.Instant",
      sustained: "SR5.CritterPower.Durations.Sustained",
      permanent: "SR5.CritterPower.Durations.Permanent",
      special: "SR5.CritterPower.Durations.Special"
    }
  },
  spriteTypes: {
    courier: "SR5.Sprite.Types.Courier",
    crack: "SR5.Sprite.Types.Crack",
    data: "SR5.Sprite.Types.Data",
    fault: "SR5.Sprite.Types.Fault",
    machine: "SR5.Sprite.Types.Machine"
  },
  vehicle: {
    types: {
      air: "SR5.Vehicle.Types.Air",
      aerospace: "SR5.Vehicle.Types.Aerospace",
      ground: "SR5.Vehicle.Types.Ground",
      water: "SR5.Vehicle.Types.Water",
      walker: "SR5.Vehicle.Types.Walker",
      exotic: "SR5.Vehicle.Types.Exotic"
    },
    stats: {
      handling: "SR5.Vehicle.Stats.Handling",
      off_road_handling: "SR5.Vehicle.Stats.OffRoadHandling",
      speed: "SR5.Vehicle.Stats.Speed",
      off_road_speed: "SR5.Vehicle.Stats.OffRoadSpeed",
      acceleration: "SR5.Vehicle.Stats.Acceleration",
      pilot: "SR5.Vehicle.Stats.Pilot",
      sensor: "SR5.Vehicle.Stats.Sensor"
    },
    control_modes: {
      manual: "SR5.Vehicle.ControlModes.Manual",
      remote: "SR5.Vehicle.ControlModes.Remote",
      rigger: "SR5.Vehicle.ControlModes.Rigger",
      autopilot: "SR5.Vehicle.ControlModes.Autopilot"
    },
    environments: {
      speed: "SR5.Vehicle.Environments.Speed",
      handling: "SR5.Vehicle.Environments.Handling"
    }
  },
  ic: {
    types: {
      acid: "SR5.IC.Types.Acid",
      binder: "SR5.IC.Types.Binder",
      black_ic: "SR5.IC.Types.BlackIC",
      blaster: "SR5.IC.Types.Blaster",
      crash: "SR5.IC.Types.Crash",
      jammer: "SR5.IC.Types.Jammer",
      killer: "SR5.IC.Types.Killer",
      marker: "SR5.IC.Types.Marker",
      patrol: "SR5.IC.Types.Patrol",
      probe: "SR5.IC.Types.Probe",
      scramble: "SR5.IC.Types.Scramble",
      sparky: "SR5.IC.Types.Sparky",
      tar_baby: "SR5.IC.Types.TarBaby",
      track: "SR5.IC.Types.Track"
    }
  },
  character: {
    types: {
      human: "SR5.Character.Types.Human",
      elf: "SR5.Character.Types.Elf",
      ork: "SR5.Character.Types.Ork",
      dwarf: "SR5.Character.Types.Dwarf",
      troll: "SR5.Character.Types.Troll"
    }
  },
  rangeWeaponMode: [
    "single_shot",
    "semi_auto",
    "burst_fire",
    "full_auto"
  ],
  rangeWeaponModeLabel: {
    "single_shot": "SR5.WeaponModeSingleShot",
    "semi_auto": "SR5.WeaponModeSemiAuto",
    "burst_file": "SR5.WeaponModeBurstFire",
    "full_auto": "SR5.WeaponModeFullAuto"
  },
  fireModes: [
    {
      label: "SR5.WeaponModeSingleShot",
      value: 1,
      recoil: false,
      defense: 0,
      suppression: false,
      action: "simple",
      mode: "single_shot"
    },
    {
      label: "SR5.WeaponModeSemiAutoShort",
      value: 1,
      recoil: true,
      defense: 0,
      suppression: false,
      action: "simple",
      mode: "semi_auto"
    },
    {
      label: "SR5.WeaponModeSemiAutoBurst",
      value: 3,
      recoil: true,
      defense: -2,
      suppression: false,
      action: "complex",
      mode: "semi_auto"
    },
    {
      label: "SR5.WeaponModeBurstFire",
      value: 3,
      recoil: true,
      defense: -2,
      suppression: false,
      action: "simple",
      mode: "burst_fire"
    },
    {
      label: "SR5.WeaponModeBurstFireLong",
      value: 6,
      recoil: true,
      defense: -2,
      suppression: false,
      action: "complex",
      mode: "burst_fire"
    },
    {
      label: "SR5.WeaponModeFullAutoShort",
      value: 6,
      recoil: true,
      defense: -5,
      suppression: false,
      action: "simple",
      mode: "full_auto"
    },
    {
      label: "SR5.WeaponModeFullAutoLong",
      value: 10,
      recoil: true,
      defense: -9,
      suppression: false,
      action: "complex",
      mode: "full_auto"
    },
    {
      label: "SR5.Suppressing",
      value: 20,
      recoil: false,
      defense: 0,
      suppression: true,
      action: "complex",
      mode: "full_auto"
    }
  ]
};

// src/module/helpers.ts
var Helpers = class {
  static calcTotal(value, options) {
    if (value.mod === void 0)
      value.mod = [];
    const parts = new PartsList(value.mod);
    if (!isNaN(value.temp) && Number(value.temp) > 0) {
      parts.addUniquePart("SR5.Temporary", value["temp"]);
    }
    value.base = value.base !== void 0 ? Number(value.base) : 0;
    if (value.override) {
      value.value = Helpers.applyValueRange(value.override.value, options);
      return value.value;
    }
    switch (getType(value.base)) {
      case "number":
        value.value = Helpers.roundTo(parts.total + value.base, 3);
        value.value = Helpers.applyValueRange(value.value, options);
        break;
      default:
        value.value = parts.last === void 0 ? value.base : parts.last;
        break;
    }
    value.mod = parts.list;
    return value.value;
  }
  static roundTo(value, decimals) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }
  static applyValueRange(value, options) {
    if (typeof (options == null ? void 0 : options.min) === "number") {
      value = Math.max(options.min, value);
    }
    if (typeof (options == null ? void 0 : options.max) === "number") {
      value = Math.min(options.max, value);
    }
    return value;
  }
  static listItemId(event) {
    return event.currentTarget.closest(".list-item").dataset.itemId;
  }
  static onSetFlag(data) {
    if (typeof data !== "object")
      return data;
    if (data === void 0 || data === null)
      return data;
    const newData = {};
    for (const [key, value] of Object.entries(data)) {
      const newKey = key.replace("SR5.", "SR5_DOT_");
      newData[newKey] = this.onSetFlag(value);
    }
    return newData;
  }
  static onGetFlag(data) {
    if (typeof data !== "object")
      return data;
    if (data === void 0 || data === null)
      return data;
    const newData = {};
    for (const [key, value] of Object.entries(data)) {
      const newKey = key.replace("SR5_DOT_", "SR5.");
      newData[newKey] = this.onGetFlag(value);
    }
    return newData;
  }
  static isMatrix(atts) {
    var _a;
    if (!atts)
      return false;
    if (typeof atts === "boolean")
      return atts;
    const matrixLabels = [
      "SR5.MatrixAttrFirewall",
      "SR5.MatrixAttrDataProcessing",
      "SR5.MatrixAttrSleaze",
      "SR5.MatrixAttrAttack",
      "SR5.SkillComputer",
      "SR5.SkillHacking",
      "SR5.SkillCybercombat",
      "SR5.SkillElectronicWarfare",
      "SR5.Software"
    ];
    if (!Array.isArray(atts))
      atts = [atts];
    atts = atts.filter((att) => att);
    for (const att of atts) {
      if (typeof att === "string") {
        if (matrixLabels.indexOf(att) >= 0) {
          return true;
        }
      } else if (typeof att === "object" && att.label !== void 0) {
        if (matrixLabels.indexOf((_a = att.label) != null ? _a : "") >= 0) {
          return true;
        }
      }
    }
    return false;
  }
  static parseInputToString(val) {
    if (val === void 0)
      return "";
    if (typeof val === "number")
      return val.toString();
    if (typeof val === "string")
      return val;
    if (Array.isArray(val)) {
      return val.join(",");
    }
    return "";
  }
  static parseInputToNumber(val) {
    if (typeof val === "number")
      return val;
    if (typeof val === "string") {
      const ret = +val;
      if (!isNaN(ret))
        return ret;
      return 0;
    }
    if (Array.isArray(val)) {
      const str = val.join("");
      const ret = +str;
      if (!isNaN(ret))
        return ret;
      return 0;
    }
    return 0;
  }
  static setupCustomCheckbox(app, html) {
    const setContent = (el) => {
      const checkbox = $(el).children("input[type=checkbox]");
      const checkmark = $(el).children(".checkmark");
      if ($(checkbox).prop("checked")) {
        $(checkmark).addClass("fa-check-circle");
        $(checkmark).removeClass("fa-circle");
      } else {
        $(checkmark).addClass("fa-circle");
        $(checkmark).removeClass("fa-check-circle");
      }
    };
    html.find("label.checkbox").each(function() {
      setContent(this);
    });
    html.find("label.checkbox").click((event) => setContent(event.currentTarget));
    html.find(".submit-checkbox").change((event) => app._onSubmit(event));
  }
  static mapRoundsToDefenseDesc(rounds) {
    if (rounds === 1)
      return "";
    if (rounds === 3)
      return "-2";
    if (rounds === 6)
      return "-5";
    if (rounds === 10)
      return "-9";
    if (rounds === 20)
      return "SR5.DuckOrCover";
    return "";
  }
  static label(str) {
    const frags = str.split("_");
    for (let i = 0; i < frags.length; i++) {
      frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    frags.forEach((frag, idx) => {
      if (frag === "Processing")
        frags[idx] = "Proc.";
      if (frag === "Mechanic")
        frags[idx] = "Mech.";
    });
    return frags.join(" ");
  }
  static orderKeys(obj) {
    const keys = Object.keys(obj).sort(function keyOrder(k1, k2) {
      if (k1 < k2)
        return -1;
      if (k1 > k2)
        return 1;
      return 0;
    });
    let i;
    const after = {};
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
    const retObj = {};
    if (typeof obj === "object" && obj !== null) {
      Object.entries(obj).forEach(([key, value]) => {
        if (comp([key, value]))
          retObj[key] = value;
      });
    }
    return retObj;
  }
  static addLabels(obj, label) {
    if (typeof obj === "object" && obj !== null) {
      if (!obj.hasOwnProperty("label") && obj.hasOwnProperty("value") && label !== "") {
        obj.label = label;
      }
      Object.entries(obj).filter(([, value]) => typeof value === "object").forEach(([key, value]) => Helpers.addLabels(value, key));
    }
  }
  static shortenAttributeLocalization(label, length = 3) {
    const name = game.i18n.localize(label);
    if (length <= 0) {
      return name;
    }
    if (name.length < length) {
      length = name.length;
    }
    return name.slice(0, length).toUpperCase();
  }
  static getToken(id) {
    if (!canvas || !canvas.ready || !canvas.tokens)
      return;
    for (const token of canvas.tokens.placeables) {
      if (token.id === id) {
        return token;
      }
    }
  }
  static getSceneTokenActor(sceneTokenId) {
    const [sceneId, tokenId] = Helpers.deconstructSceneTokenId(sceneTokenId);
    const token = Helpers.getSceneTokenDocument(sceneId, tokenId);
    if (!token)
      return null;
    return token.getActor();
  }
  static deconstructSceneTokenId(sceneTokenId) {
    return sceneTokenId.split(".");
  }
  static getSceneTokenDocument(sceneId, tokenId) {
    var _a;
    const scene = (_a = game.scenes) == null ? void 0 : _a.get(sceneId);
    if (!scene)
      return;
    const token = scene.tokens.get(tokenId);
    if (!token)
      return;
    return token;
  }
  static getUserTargets(user) {
    user = user ? user : game.user;
    if (!user)
      return [];
    return Array.from(user.targets);
  }
  static userHasTargets(user) {
    user = user ? user : game.user;
    if (!user)
      return false;
    return user.targets.size > 0;
  }
  static measureTokenDistance(tokenOrigin, tokenDest) {
    if (!canvas || !canvas.ready || !canvas.scene || !canvas.grid)
      return 0;
    if (!tokenOrigin || !tokenDest)
      return 0;
    const origin = new PIXI.Point(...canvas.grid.getCenter(tokenOrigin.data.x, tokenOrigin.data.y));
    const dest = new PIXI.Point(...canvas.grid.getCenter(tokenDest.data.x, tokenDest.data.y));
    const distanceInGridUnits = canvas.grid.measureDistance(origin, dest);
    const sceneUnit = canvas.scene.data.gridUnits;
    return Helpers.convertLengthUnit(distanceInGridUnits, sceneUnit);
  }
  static convertLengthUnit(length, fromUnit) {
    fromUnit = fromUnit.toLowerCase();
    if (!LENGTH_UNIT_TO_METERS_MULTIPLIERS.hasOwnProperty(fromUnit)) {
      console.error(`Distance can't be converted from ${fromUnit} to ${LENGTH_UNIT}`);
      return 0;
    }
    return Math.floor(length * LENGTH_UNIT_TO_METERS_MULTIPLIERS[fromUnit]);
  }
  static getWeaponRange(distance, ranges) {
    const rangeKey = Object.keys(ranges).find((range) => distance < ranges[range].distance);
    if (rangeKey) {
      return ranges[rangeKey];
    } else {
      const { extreme } = ranges;
      return Helpers.createRangeDescription("SR5.OutOfRange", extreme.distance, SR.combat.environmental.range_modifiers.out_of_range);
    }
  }
  static getControlledTokens() {
    if (!canvas || !canvas.ready || !canvas.tokens)
      return [];
    return canvas.tokens.controlled;
  }
  static getTargetedTokens() {
    if (!canvas.ready || !game.user)
      return [];
    return Array.from(game.user.targets);
  }
  static getSelectedActorsOrCharacter() {
    if (!game.user)
      return [];
    const tokens = Helpers.getControlledTokens();
    const actors = tokens.map((token) => token.actor);
    if (actors.length === 0 && game.user.character) {
      actors.push(game.user.character);
    }
    return actors;
  }
  static getTestTargetActors(testData) {
    return __async(this, null, function* () {
      const actors = [];
      for (const uuid of testData.targetActorsUuid) {
        const tokenDoc = yield fromUuid(uuid);
        if (!(tokenDoc instanceof TokenDocument)) {
          console.error(`Shadowrun5e | Been given testData with targets. UUID ${uuid} should point to a TokenDocument but doesn't`, tokenDoc);
          continue;
        }
        if (!tokenDoc.actor)
          continue;
        actors.push(tokenDoc.actor);
      }
      return actors;
    });
  }
  static createRangeDescription(label, distance, modifier) {
    label = game.i18n.localize(label);
    return { label, distance, modifier };
  }
  static convertIndexedObjectToArray(indexedObject) {
    return Object.keys(indexedObject).map((index) => {
      if (Number.isNaN(index)) {
        console.warn("An object with no numerical index was given, which is likely a bug.", indexedObject);
      }
      return indexedObject[index];
    });
  }
  static getChatSpeakerName(actor) {
    if (!actor)
      return "";
    const useTokenNameForChatOutput = game.settings.get(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput);
    const token = actor.getToken();
    if (useTokenNameForChatOutput && token)
      return token.name;
    return actor.name;
  }
  static getChatSpeakerImg(actor) {
    if (!actor)
      return "";
    const useTokenForChatOutput = game.settings.get(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput);
    const token = actor.getToken();
    if (useTokenForChatOutput && token)
      return token.texture.src || "";
    return actor.img || "";
  }
  static createDamageData(value, type, ap = 0, element = "", sourceItem) {
    const damage = duplicate(DataDefaults.damage);
    damage.base = value;
    damage.value = value;
    damage.type.base = type;
    damage.type.value = type;
    damage.ap.base = ap;
    damage.ap.value = ap;
    damage.element.base = element;
    damage.element.value = element;
    if (sourceItem && sourceItem.actor) {
      damage.source = {
        actorId: sourceItem.actor.id,
        itemType: sourceItem.type,
        itemId: sourceItem.id,
        itemName: sourceItem.name
      };
    }
    return damage;
  }
  static findDamageSource(damageData) {
    if (!game.actors)
      return;
    if (!damageData.source) {
      return;
    }
    const actorId = damageData.source.actorId;
    const actorSource = game.actors.get(actorId);
    if (!actorSource) {
      return;
    }
    const itemId = damageData.source.itemId;
    const actorItem = actorSource.items.get(itemId);
    if (actorItem) {
      return actorItem;
    }
    const tokens = actorSource.getActiveTokens();
    let tokenItem;
    tokens.forEach((token) => {
      if (!token.actor)
        return;
      const foundItem = token.actor.items.get(itemId);
      if (foundItem) {
        tokenItem = foundItem;
      }
    });
    return tokenItem;
  }
  static modifyDamageByHits(incoming, hits, modificationLabel) {
    const modified = duplicate(incoming);
    modified.mod = PartsList.AddUniquePart(modified.mod, modificationLabel, hits);
    modified.value = Helpers.calcTotal(modified, { min: 0 });
    return { incoming, modified };
  }
  static reduceDamageByHits(incoming, hits, modificationLabel) {
    if (hits < 0)
      hits = 0;
    return Helpers.modifyDamageByHits(incoming, -hits, modificationLabel);
  }
  static confirmDeletion() {
    return __async(this, null, function* () {
      const dialog = new DeleteConfirmationDialog();
      yield dialog.select();
      return !dialog.canceled && dialog.selectedButton === "delete";
    });
  }
  static getRandomIdSkillFieldDataEntry(skillDataPath, skillField, idLength = DEFAULT_ID_LENGTH) {
    if (!skillDataPath || skillDataPath.length === 0)
      return;
    const id = randomID(idLength);
    const updateSkillData = {
      [skillDataPath]: { [id]: skillField }
    };
    return {
      id,
      updateSkillData
    };
  }
  static getUpdateDataEntry(path, value) {
    return { [path]: value };
  }
  static getDeleteKeyUpdateData(path, key) {
    return { [path]: { [`-=${key}`]: null } };
  }
  static localizeSkill(skill) {
    return skill.label ? game.i18n.localize(skill.label) : skill.name;
  }
  static sortSkills(skills, asc = true) {
    const sortedEntries = Object.entries(skills).sort(([aId, a], [bId, b]) => {
      const comparatorA = Helpers.localizeSkill(a) || aId;
      const comparatorB = Helpers.localizeSkill(b) || bId;
      if (asc)
        return comparatorA.localeCompare(comparatorB) === 1 ? 1 : -1;
      else
        return comparatorA.localeCompare(comparatorB) === 1 ? -1 : 1;
    });
    const sortedAsObject = {};
    for (const [id, skill] of sortedEntries) {
      sortedAsObject[id] = skill;
    }
    return sortedAsObject;
  }
  static sortConfigValuesByTranslation(configValues, asc = true) {
    const sortedEntries = Object.entries(configValues).sort(([aId, a], [bId, b]) => {
      const comparatorA = game.i18n.localize(a);
      const comparatorB = game.i18n.localize(b);
      if (asc)
        return comparatorA.localeCompare(comparatorB) === 1 ? 1 : -1;
      else
        return comparatorA.localeCompare(comparatorB) === 1 ? -1 : 1;
    });
    const sortedAsObject = {};
    for (const [key, translated] of sortedEntries) {
      sortedAsObject[key] = translated;
    }
    return sortedAsObject;
  }
  static getPlayersWithPermission(document2, permission, active = true) {
    if (!game.users)
      return [];
    return game.users.filter((user) => {
      if (user.isGM)
        return false;
      if (!document2.testUserPermission(user, permission))
        return false;
      if (active && !user.active)
        return false;
      return true;
    });
  }
  static getSkillLabelOrName(skill) {
    return skill.label ? game.i18n.localize(skill.label) : skill.name || "";
  }
  static showDiceSoNice(roll, whisper, blind = false) {
    return __async(this, null, function* () {
      if (!game.dice3d)
        return;
      const synchronize = (whisper == null ? void 0 : whisper.length) === 0 || whisper === null;
      whisper = (whisper == null ? void 0 : whisper.length) > 0 ? whisper : null;
      yield game.dice3d.showForRoll(roll, game.user, synchronize, whisper, blind);
      console.error(game.dice3d);
    });
  }
  static getEntityFromDropData(data) {
    return __async(this, null, function* () {
      if (!game.actors || !game.items)
        return;
      if (data.pack && data.type === "Actor")
        return yield Helpers.getEntityFromCollection(data.pack, data.id);
      if (data.pack && data.type === "Item")
        return yield Helpers.getEntityFromCollection(data.pack, data.id);
      if (data.type === "Actor")
        return game.actors.get(data.id);
      if (data.type === "Item")
        return game.items.get(data.id);
    });
  }
  static getEntityFromCollection(collection, id) {
    return __async(this, null, function* () {
      const pack = game.packs.find((p) => p.collection === collection);
      return yield pack.getDocument(id);
    });
  }
  static isValidMarkId(markId) {
    if (!game.scenes)
      return false;
    const [sceneId, targetId, itemId] = Helpers.deconstructMarkId(markId);
    const scene = game.scenes.get(sceneId);
    if (!scene)
      return false;
    const tokenDocument = scene.tokens.get(targetId);
    if (!tokenDocument)
      return false;
    const actor = tokenDocument.actor;
    if (itemId && !(actor == null ? void 0 : actor.items.get(itemId)))
      return false;
    return true;
  }
  static buildMarkId(sceneId, targetId, itemId, separator = "/") {
    return [sceneId, targetId, itemId || ""].join(separator);
  }
  static deconstructMarkId(markId, separator = "/") {
    const ids = markId.split(separator);
    if (ids.length !== 3) {
      console.error("A mark id must always be of length 3");
    }
    return ids;
  }
  static getMarkIdDocuments(markId) {
    var _a, _b;
    if (!game.scenes || !game.items)
      return;
    const [sceneId, targetId, itemId] = Helpers.deconstructMarkId(markId);
    const scene = game.scenes.get(sceneId);
    if (!scene)
      return;
    const target = scene.tokens.get(targetId) || game.items.get(targetId);
    const item = (_b = (_a = target == null ? void 0 : target.actor) == null ? void 0 : _a.items) == null ? void 0 : _b.get(itemId);
    return {
      scene,
      target,
      item
    };
  }
  static objectHasKeys(obj, keys) {
    for (const key of keys) {
      if (!obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  static getPackAction(packName, actionName) {
    return __async(this, null, function* () {
      console.info(`Shadowrun 5e | Trying to fetch action ${actionName} from pack ${packName}`);
      const pack = game.packs.find((pack2) => pack2.metadata.system === SYSTEM_NAME && pack2.metadata.name === packName);
      if (!pack)
        return;
      const packEntry = pack.index.find((data) => {
        var _a;
        return ((_a = data.name) == null ? void 0 : _a.toLowerCase().replace(new RegExp(" ", "g"), "_")) === actionName.toLowerCase();
      });
      if (!packEntry)
        return;
      const item = yield pack.getDocument(packEntry._id);
      if (!item || item.type !== "action")
        return;
      console.info(`Shadowrun5e | Fetched action ${actionName} from pack ${packName}`, item);
      return item;
    });
  }
  static renderEntityLinkSheet(event) {
    return __async(this, null, function* () {
      const element = $(event.currentTarget);
      const uuid = element.data("uuid");
      yield Helpers.renderDocumentSheet(uuid);
    });
  }
  static renderDocumentSheet(uuid, resolveTokenToActor = true) {
    return __async(this, null, function* () {
      if (!uuid)
        return;
      let document2 = yield fromUuid(uuid);
      if (!document2)
        return;
      if (document2 instanceof TokenDocument && resolveTokenToActor && document2.actor)
        document2 = document2.actor;
      yield document2.sheet.render(true);
    });
  }
  static injectWeaponTestIntoChangeData(type, changeData, applyData) {
    var _a;
    if (((_a = changeData == null ? void 0 : changeData.system) == null ? void 0 : _a.category) === void 0)
      return;
    if (changeData.system.category === "") {
      foundry.utils.setProperty(applyData, "system.action.test", "");
      return;
    }
    const test = SR5.weaponCategoryActiveTests[changeData.system.category];
    if (!test) {
      console.error(`Shadowrun 5 | There is no active test configured for the weapon category ${changeData.system.category}.`, changeData);
    }
    foundry.utils.setProperty(applyData, "system.action.test", test);
    foundry.utils.setProperty(applyData, "system.action.opposed.test", "PhysicalDefenseTest");
    foundry.utils.setProperty(applyData, "system.action.opposed.resist.test", "PhysicalResistTest");
  }
  static injectSpellTestIntoChangeData(type, changeData, applyData) {
    var _a;
    if (((_a = changeData == null ? void 0 : changeData.system) == null ? void 0 : _a.category) === void 0)
      return;
    if (changeData.system.category === "") {
      foundry.utils.setProperty(applyData, "system.action.test", "");
      return;
    }
    const test = SR5.activeTests[type];
    const opposedTest = SR5.opposedTests[type][changeData.system.category] || "OpposedTest";
    const resistTest = SR5.opposedResistTests[type][changeData.system.category] || "";
    foundry.utils.setProperty(applyData, "system.action.test", test);
    foundry.utils.setProperty(applyData, "system.action.opposed.test", opposedTest);
    foundry.utils.setProperty(applyData, "system.action.opposed.resist.test", resistTest);
  }
  static injectComplexFormTestIntoChangeData(type, changeData, applyData) {
    const test = SR5.activeTests[type];
    foundry.utils.setProperty(applyData, "system.action.test", test);
  }
  static injectActionTestsIntoChangeData(type, changeData, applyData) {
    if (!changeData)
      return;
    const typeHandler = {
      "weapon": Helpers.injectWeaponTestIntoChangeData,
      "spell": Helpers.injectSpellTestIntoChangeData,
      "complex_form": Helpers.injectComplexFormTestIntoChangeData
    };
    const handler = typeHandler[type];
    if (!handler)
      return;
    handler(type, changeData, applyData);
  }
};

// src/module/handlebars/RollAndLabelHelpers.ts
var registerRollAndLabelHelpers = () => {
  Handlebars.registerHelper("damageAbbreviation", function(damage) {
    if (damage === "physical")
      return "P";
    if (damage === "stun")
      return "S";
    if (damage === "matrix")
      return "M";
    return "";
  });
  Handlebars.registerHelper("damageCode", function(damage) {
    const typeCode = Handlebars.helpers.damageAbbreviation(damage.type.value);
    let code = `${damage.value}${typeCode}`;
    return new Handlebars.SafeString(code);
  });
  Handlebars.registerHelper("diceIcon", function(side) {
    if (side) {
      switch (side) {
        case 1:
          return "red";
        case 2:
          return "grey";
        case 3:
          return "grey";
        case 4:
          return "grey";
        case 5:
          return "green";
        case 6:
          return "green";
      }
    }
  });
  Handlebars.registerHelper("elementIcon", function(element) {
    let icon = "";
    if (element === "electricity") {
      icon = "fas fa-bolt";
    } else if (element === "radiation") {
      icon = "fas fa-radiation-alt";
    } else if (element === "fire") {
      icon = "fas fa-fire";
    } else if (element === "acid") {
      icon = "fas fa-vials";
    } else if (element === "cold") {
      icon = "fas fa-snowflake";
    }
    return icon;
  });
  Handlebars.registerHelper("partsTotal", function(partsList) {
    const parts = new PartsList(partsList);
    return parts.total;
  });
  Handlebars.registerHelper("signedValue", function(value) {
    return value > 0 ? `+${value}` : `${value}`;
  });
  Handlebars.registerHelper("speakerName", Helpers.getChatSpeakerName);
  Handlebars.registerHelper("speakerImg", Helpers.getChatSpeakerImg);
};

// src/module/data/DataWrapper.ts
var DataWrapper = class {
  constructor(data) {
    this.data = data;
  }
};

// src/module/data/SR5ItemDataWrapper.ts
var SR5ItemDataWrapper = class extends DataWrapper {
  getType() {
    return this.data.type;
  }
  getData() {
    return this.data.data;
  }
  isAreaOfEffect() {
    return this.isGrenade() || this.isSpell() && this.getData().range === "los_a";
  }
  isArmor() {
    return this.data.type === "armor";
  }
  couldHaveArmor() {
    const armor = this.getData().armor;
    return this.isArmor() || armor !== void 0;
  }
  hasArmorBase() {
    var _a;
    return this.hasArmor() && !((_a = this.getData().armor) == null ? void 0 : _a.mod);
  }
  hasArmorAccessory() {
    var _a, _b;
    return this.hasArmor() && ((_b = (_a = this.getData().armor) == null ? void 0 : _a.mod) != null ? _b : false);
  }
  hasArmor() {
    return this.getArmorValue() > 0;
  }
  isGrenade() {
    var _a, _b;
    return this.isThrownWeapon() && ((_b = (_a = this.getData().thrown) == null ? void 0 : _a.blast.radius) != null ? _b : 0) > 0;
  }
  isThrownWeapon() {
    if (!this.isWeapon())
      return false;
    const weaponData = this.getData();
    return weaponData.category === "thrown";
  }
  isWeapon() {
    return this.data.type === "weapon";
  }
  isModification() {
    return this.data.type === "modification";
  }
  isWeaponModification() {
    if (!this.isModification())
      return false;
    const modification = this.data;
    return modification.data.type === "weapon";
  }
  isArmorModification() {
    if (!this.isModification())
      return false;
    const modification = this.data;
    return modification.data.type === "armor";
  }
  isProgram() {
    return this.data.type === "program";
  }
  isQuality() {
    return this.data.type === "quality";
  }
  isAmmo() {
    return this.data.type === "ammo";
  }
  isCyberware() {
    return this.data.type === "cyberware";
  }
  isBioware() {
    return this.data.type === "bioware";
  }
  isBodyware() {
    return this.isCyberware() || this.isBioware();
  }
  isCombatSpell() {
    if (!this.isSpell())
      return false;
    const spellData = this.getData();
    return spellData.category === "combat";
  }
  isDirectCombatSpell() {
    var _a, _b;
    if (!this.isCombatSpell())
      return false;
    return ((_b = (_a = this.getData()) == null ? void 0 : _a.combat) == null ? void 0 : _b.type) === "direct";
  }
  isIndirectCombatSpell() {
    var _a, _b;
    if (!this.isCombatSpell())
      return false;
    return ((_b = (_a = this.getData()) == null ? void 0 : _a.combat) == null ? void 0 : _b.type) === "indirect";
  }
  isManaSpell() {
    if (!this.isSpell())
      return false;
    const spellData = this.getData();
    return spellData.type === "mana";
  }
  isPhysicalSpell() {
    if (!this.isSpell())
      return false;
    const spellData = this.getData();
    return spellData.type === "physical";
  }
  isRangedWeapon() {
    if (!this.isWeapon())
      return false;
    const weaponData = this.getData();
    return weaponData.category === "range";
  }
  isSpell() {
    return this.data.type === "spell";
  }
  isSpritePower() {
    return this.data.type === "sprite_power";
  }
  isComplexForm() {
    return this.data.type === "complex_form";
  }
  isContact() {
    return this.data.type === "contact";
  }
  isCritterPower() {
    return this.data.type === "critter_power";
  }
  isMeleeWeapon() {
    if (!this.isWeapon())
      return false;
    const weaponData = this.getData();
    return weaponData.category === "melee";
  }
  isDevice() {
    return this.data.type === "device";
  }
  isEquipment() {
    return this.data.type === "equipment";
  }
  isEquipped() {
    var _a;
    return ((_a = this.getData().technology) == null ? void 0 : _a.equipped) || false;
  }
  isCyberdeck() {
    if (!this.isDevice())
      return false;
    const deviceData = this.getData();
    return deviceData.category === "cyberdeck";
  }
  isCommlink() {
    if (!this.isDevice())
      return false;
    const deviceData = this.getData();
    return deviceData.category === "commlink";
  }
  isMatrixAction() {
    return this.isAction() && this.getData().result.success.matrix.placeMarks;
  }
  isSin() {
    return this.data.type === "sin";
  }
  isLifestyle() {
    return this.data.type === "lifestyle";
  }
  getId() {
    return this.data._id;
  }
  getBookSource() {
    var _a, _b;
    return (_b = (_a = this.getData().description) == null ? void 0 : _a.source) != null ? _b : "";
  }
  getConditionMonitor() {
    var _a, _b;
    return (_b = (_a = this.getData().technology) == null ? void 0 : _a.condition_monitor) != null ? _b : { value: 0, max: 0, label: "" };
  }
  getRating() {
    var _a;
    return ((_a = this.getData().technology) == null ? void 0 : _a.rating) || 0;
  }
  getArmorValue() {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.getData()) == null ? void 0 : _a.armor) == null ? void 0 : _b.value) != null ? _c : 0;
  }
  getArmorElements() {
    const { fire, electricity, cold, acid } = this.getData().armor || {};
    return { fire: fire != null ? fire : 0, electricity: electricity != null ? electricity : 0, cold: cold != null ? cold : 0, acid: acid != null ? acid : 0 };
  }
  getName() {
    return this.data.name;
  }
  getEssenceLoss() {
    var _a, _b;
    return (_b = (_a = this.getData()) == null ? void 0 : _a.essence) != null ? _b : 0;
  }
  getAmmo() {
    return this.getData().ammo;
  }
  getASDF() {
    if (!this.isDevice())
      return void 0;
    const matrix = {
      attack: {
        value: 0,
        device_att: ""
      },
      sleaze: {
        value: 0,
        device_att: ""
      },
      data_processing: {
        value: this.getRating(),
        device_att: ""
      },
      firewall: {
        value: this.getRating(),
        device_att: ""
      }
    };
    if (this.isCyberdeck()) {
      const atts = this.getData().atts;
      if (atts) {
        for (let [key, att] of Object.entries(atts)) {
          matrix[att.att].value = att.value;
          matrix[att.att].device_att = key;
        }
      }
    }
    return matrix;
  }
  getQuantity() {
    var _a, _b;
    return ((_b = (_a = this.getData()) == null ? void 0 : _a.technology) == null ? void 0 : _b.quantity) || 1;
  }
  isAction() {
    return this.data.type === "action";
  }
  getAction() {
    return this.getData().action;
  }
  getActionDicePoolMod() {
    var _a;
    return (_a = this.getData().action) == null ? void 0 : _a.mod;
  }
  getLimitAttribute() {
    var _a, _b;
    return (_b = (_a = this.getData().action) == null ? void 0 : _a.limit) == null ? void 0 : _b.attribute;
  }
  getActionSkill() {
    var _a;
    return (_a = this.getData().action) == null ? void 0 : _a.skill;
  }
  getActionAttribute() {
    var _a;
    return (_a = this.getData().action) == null ? void 0 : _a.attribute;
  }
  getActionAttribute2() {
    var _a;
    return (_a = this.getData().action) == null ? void 0 : _a.attribute2;
  }
  getActionLimit() {
    var _a, _b;
    return (_b = (_a = this.getData().action) == null ? void 0 : _a.limit) == null ? void 0 : _b.value;
  }
  getModifierList() {
    var _a;
    return ((_a = this.getData().action) == null ? void 0 : _a.dice_pool_mod) || [];
  }
  getActionSpecialization() {
    var _a;
    if ((_a = this.getData().action) == null ? void 0 : _a.spec)
      return "SR5.Specialization";
    return void 0;
  }
  getDrain() {
    return this.getData().drain || 0;
  }
  getFade() {
    return this.getData().fade || 0;
  }
  getRecoilCompensation() {
    var _a, _b, _c;
    if (!this.isRangedWeapon())
      return 0;
    const base = (_c = (_b = (_a = this.getData()) == null ? void 0 : _a.range) == null ? void 0 : _b.rc.value) != null ? _c : "0";
    return Number(base);
  }
  getReach() {
    var _a, _b;
    if (this.isMeleeWeapon()) {
      return (_b = (_a = this.getData().melee) == null ? void 0 : _a.reach) != null ? _b : 0;
    }
    return 0;
  }
  getTechnology() {
    if ("technology" in this.data.data)
      return this.data.data.technology;
  }
  getRange() {
    if (!("range" in this.data.data))
      return;
    if (this.data.type === "critter_power")
      return this.data.data.range;
    if (this.data.type === "spell")
      return this.data.data.range;
    if (this.data.type === "weapon")
      return this.data.data.range;
  }
  hasDefenseTest() {
    var _a, _b;
    return ((_b = (_a = this.getData().action) == null ? void 0 : _a.opposed) == null ? void 0 : _b.type) === "defense";
  }
  hasAmmo() {
    return !!this.getAmmo();
  }
  getActionResult() {
    return this.getData().result;
  }
};

// src/module/handlebars/ItemLineHelpers.ts
var registerItemLineHelpers = () => {
  Handlebars.registerHelper("ItemHeaderIcons", function(type) {
    const PlusIcon = "fas fa-plus";
    const AddText = game.i18n.localize("SR5.Add");
    const addIcon = {
      icon: PlusIcon,
      text: AddText,
      title: game.i18n.localize("SR5.CreateItem"),
      cssClass: "item-create",
      data: {}
    };
    switch (type) {
      case "lifestyle":
        addIcon.title = game.i18n.localize("SR5.CreateItemLifestyle");
        return [addIcon];
      case "contact":
        addIcon.title = game.i18n.localize("SR5.CreateItemContact");
        return [addIcon];
      case "sin":
        addIcon.title = game.i18n.localize("SR5.CreateItemSIN");
        return [addIcon];
      case "license":
        addIcon.title = game.i18n.localize("SR5.CreateItemLicense");
        return [addIcon];
      case "quality":
        addIcon.title = game.i18n.localize("SR5.CreateItemQuality");
        return [addIcon];
      case "adept_power":
        addIcon.title = game.i18n.localize("SR5.CreateItemAdeptPower");
        return [addIcon];
      case "action":
        addIcon.title = game.i18n.localize("SR5.CreateItemAction");
        return [addIcon];
      case "spell":
        addIcon.title = game.i18n.localize("SR5.CreateItemSpell");
        return [addIcon];
      case "gear":
        addIcon.title = game.i18n.localize("SR5.CreateItemGear");
        return [addIcon];
      case "complex_form":
        addIcon.title = game.i18n.localize("SR5.CreateItemComplexForm");
        return [addIcon];
      case "program":
        addIcon.title = game.i18n.localize("SR5.CreateItemProgram");
        return [addIcon];
      case "weapon":
        addIcon.title = game.i18n.localize("SR5.CreateItemWeapon");
        return [addIcon];
      case "armor":
        addIcon.title = game.i18n.localize("SR5.CreateItemArmor");
        return [addIcon];
      case "ammo":
        addIcon.title = game.i18n.localize("SR5.CreateItemAmmo");
        return [addIcon];
      case "modification":
        addIcon.title = game.i18n.localize("SR5.CreateItemModification");
        return [addIcon];
      case "device":
        addIcon.title = game.i18n.localize("SR5.CreateItemDevice");
        return [addIcon];
      case "equipment":
        addIcon.title = game.i18n.localize("SR5.CreateItemEquipment");
        return [addIcon];
      case "cyberware":
        addIcon.title = game.i18n.localize("SR5.CreateItemCyberware");
        return [addIcon];
      case "bioware":
        addIcon.title = game.i18n.localize("SR5.CreateItemBioware");
        return [addIcon];
      case "critter_power":
        addIcon.title = game.i18n.localize("SR5.CreateItemCritterPower");
        return [addIcon];
      case "sprite_power":
        addIcon.title = game.i18n.localize("SR5.CreateItemSpritePower");
        return [addIcon];
      case "effect":
        addIcon.title = game.i18n.localize("SR5.CreateEffect");
        addIcon.cssClass = "effect-control";
        addIcon.data = { action: "create" };
        return [addIcon];
      default:
        return [];
    }
  });
  Handlebars.registerHelper("InventoryIcons", function(name) {
    const addItemIcon = {
      icon: "fas fa-plus",
      text: game.i18n.localize("SR5.Add"),
      title: game.i18n.localize("SR5.CreateItem"),
      cssClass: "inventory-item-create",
      data: { inventory: name }
    };
    return [addItemIcon];
  });
  Handlebars.registerHelper("ItemHeaderRightSide", function(id) {
    switch (id) {
      case "action":
        return [
          {
            text: {
              text: game.i18n.localize("SR5.Skill"),
              cssClass: "six"
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Attribute"),
              cssClass: "six"
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Attribute"),
              cssClass: "six"
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Limit"),
              cssClass: "six"
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Modifier"),
              cssClass: "six"
            }
          }
        ];
      case "weapon":
      case "armor":
      case "device":
      case "equipment":
      case "cyberware":
      case "bioware":
      case "modification":
      case "ammo":
        return [
          {
            text: {
              text: game.i18n.localize("SR5.Qty")
            }
          }
        ];
      case "complex_form":
        return [
          {
            text: {
              text: game.i18n.localize("SR5.Target")
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Duration")
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Fade")
            }
          }
        ];
      case "adept_power":
        return [
          {
            text: {
              text: game.i18n.localize("SR5.PowerType")
            }
          }
        ];
      case "spell":
        return [
          {
            text: {
              text: game.i18n.localize("SR5.SpellType")
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.SpellRange")
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Duration")
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.Drain")
            }
          }
        ];
      case "critter_power":
        return [
          {
            text: {
              text: game.i18n.localize("SR5.CritterPower.Type")
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.CritterPower.Range")
            }
          },
          {
            text: {
              text: game.i18n.localize("SR5.CritterPower.Duration")
            }
          }
        ];
      case "quality":
        return [
          {
            text: {
              text: game.i18n.localize("SR5.QualityType")
            }
          }
        ];
      default:
        return [];
    }
  });
  Handlebars.registerHelper("ItemRightSide", function(item) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    const wrapper = new SR5ItemDataWrapper(item);
    const qtyInput = {
      input: {
        type: "number",
        value: wrapper.getQuantity(),
        cssClass: "item-qty"
      }
    };
    switch (item.type) {
      case "action":
        return [
          {
            text: {
              text: game.i18n.localize(SR5.activeSkills[(_a = wrapper.getActionSkill()) != null ? _a : ""]),
              cssClass: "six"
            }
          },
          {
            text: {
              text: game.i18n.localize(SR5.attributes[(_b = wrapper.getActionAttribute()) != null ? _b : ""]),
              cssClass: "six"
            }
          },
          {
            text: {
              text: game.i18n.localize(SR5.attributes[(_c = wrapper.getActionAttribute2()) != null ? _c : ""]),
              cssClass: "six"
            }
          },
          {
            text: {
              text: wrapper.getLimitAttribute() ? game.i18n.localize(SR5.attributes[(_d = wrapper.getLimitAttribute()) != null ? _d : ""]) : wrapper.getActionLimit(),
              cssClass: "six"
            }
          },
          {
            text: {
              text: wrapper.getActionDicePoolMod(),
              cssClass: "six"
            }
          }
        ];
      case "armor":
      case "ammo":
      case "modification":
      case "device":
      case "equipment":
      case "cyberware":
      case "bioware":
        return [qtyInput];
      case "weapon":
        if (wrapper.isRangedWeapon()) {
          const count = (_f = (_e = wrapper.getAmmo()) == null ? void 0 : _e.current.value) != null ? _f : 0;
          const max = (_h = (_g = wrapper.getAmmo()) == null ? void 0 : _g.current.max) != null ? _h : 0;
          const text = count < max || max === 0 ? `${game.i18n.localize("SR5.WeaponReload")} (${count}/${max})` : game.i18n.localize("SR5.AmmoFull");
          const cssClass = "no-break" + (count < max ? " reload-ammo roll" : "faded");
          return [
            {
              text: {
                title: `${game.i18n.localize("SR5.WeaponAmmoCount")}: ${count}`,
                text,
                cssClass
              }
            },
            {
              text: {
                text: ""
              }
            },
            qtyInput
          ];
        } else {
          return [qtyInput];
        }
      case "quality":
        return [
          {
            text: {
              text: game.i18n.localize(SR5.qualityTypes[(_i = item.data.type) != null ? _i : ""])
            }
          }
        ];
      case "adept_power":
        return [
          {
            text: {
              text: game.i18n.localize(SR5.adeptPower.types[(_j = item.data.type) != null ? _j : ""])
            }
          }
        ];
      case "spell":
        return [
          {
            text: {
              text: game.i18n.localize(SR5.spellTypes[(_k = item.data.type) != null ? _k : ""])
            }
          },
          {
            text: {
              text: game.i18n.localize(SR5.spellRanges[(_l = item.data.range) != null ? _l : ""])
            }
          },
          {
            text: {
              text: game.i18n.localize(SR5.durations[(_m = item.data.duration) != null ? _m : ""])
            }
          },
          {
            text: {
              text: wrapper.getDrain()
            }
          }
        ];
      case "critter_power":
        return [
          {
            text: {
              text: game.i18n.localize(SR5.critterPower.types[(_n = item.data.powerType) != null ? _n : ""])
            }
          },
          {
            text: {
              text: game.i18n.localize(SR5.critterPower.ranges[(_o = item.data.range) != null ? _o : ""])
            }
          },
          {
            text: {
              text: game.i18n.localize(SR5.critterPower.durations[(_p = item.data.duration) != null ? _p : ""])
            }
          }
        ];
      case "complex_form":
        return [
          {
            text: {
              text: game.i18n.localize(SR5.matrixTargets[(_q = item.data.target) != null ? _q : ""])
            }
          },
          {
            text: {
              text: game.i18n.localize(SR5.durations[(_r = item.data.duration) != null ? _r : ""])
            }
          },
          {
            text: {
              text: String(item.data.fade)
            }
          }
        ];
      case "program":
        return [
          {
            button: {
              cssClass: `item-equip-toggle ${wrapper.isEquipped() ? "light" : ""}`,
              short: true,
              text: wrapper.isEquipped() ? game.i18n.localize("SR5.Loaded") : game.i18n.localize("SR5.Load") + " >>"
            }
          }
        ];
      default:
        return [];
    }
  });
  Handlebars.registerHelper("ItemIcons", function(item) {
    const wrapper = new SR5ItemDataWrapper(item);
    const editIcon = {
      icon: "fas fa-edit item-edit",
      title: game.i18n.localize("SR5.EditItem")
    };
    const removeIcon = {
      icon: "fas fa-trash item-delete",
      title: game.i18n.localize("SR5.DeleteItem")
    };
    const equipIcon = {
      icon: `${wrapper.isEquipped() ? "fas fa-check-circle" : "far fa-circle"} item-equip-toggle`,
      title: game.i18n.localize("SR5.ToggleEquip")
    };
    const pdfIcon = {
      icon: "fas fa-file open-source-pdf",
      title: game.i18n.localize("SR5.OpenSourcePdf")
    };
    const icons = [editIcon, removeIcon];
    if (ui["PDFoundry"]) {
      icons.unshift(pdfIcon);
    }
    switch (wrapper.getType()) {
      case "program":
      case "armor":
      case "device":
      case "equipment":
      case "cyberware":
      case "bioware":
      case "weapon":
        icons.unshift(equipIcon);
    }
    return icons;
  });
  Handlebars.registerHelper("InventoryItemIcons", function(item) {
    const wrapper = new SR5ItemDataWrapper(item);
    const moveIcon = {
      icon: "fas fa-exchange-alt inventory-item-move",
      title: game.i18n.localize("SR5.MoveItemInventory")
    };
    const editIcon = {
      icon: "fas fa-edit item-edit",
      title: game.i18n.localize("SR5.EditItem")
    };
    const removeIcon = {
      icon: "fas fa-trash item-delete",
      title: game.i18n.localize("SR5.DeleteItem")
    };
    const equipIcon = {
      icon: `${wrapper.isEquipped() ? "fas fa-check-circle" : "far fa-circle"} item-equip-toggle`,
      title: game.i18n.localize("SR5.ToggleEquip")
    };
    const pdfIcon = {
      icon: "fas fa-file open-source-pdf",
      title: game.i18n.localize("SR5.OpenSourcePdf")
    };
    const icons = [moveIcon, editIcon, removeIcon];
    if (ui["PDFoundry"]) {
      icons.unshift(pdfIcon);
    }
    switch (wrapper.getType()) {
      case "program":
      case "armor":
      case "device":
      case "equipment":
      case "cyberware":
      case "bioware":
      case "weapon":
        icons.unshift(equipIcon);
    }
    return icons;
  });
  Handlebars.registerHelper("EffectIcons", function(effect) {
    const editIcon = {
      icon: "fas fa-edit effect-control",
      title: game.i18n.localize("SR5.EditItem"),
      data: { action: "edit" }
    };
    const removeIcon = {
      icon: "fas fa-trash effect-control",
      title: game.i18n.localize("SR5.DeleteItem"),
      data: { action: "delete" }
    };
    const disableIcon = {
      icon: `${effect.data.disabled ? "far fa-circle" : "fas fa-check-circle"} effect-control`,
      title: game.i18n.localize("SR5.ToggleActive"),
      data: { action: "toggle" }
    };
    const openOriginIcon = {
      icon: "fas fa-file effect-control",
      title: game.i18n.localize("SR5.OpenOrigin"),
      data: { action: "open-origin" }
    };
    let icons = [disableIcon, editIcon, removeIcon];
    if (effect.isOriginOwned)
      icons = [openOriginIcon, ...icons];
    return icons;
  });
  Handlebars.registerHelper("EffectData", function(effectType) {
    return { "effect-type": effectType };
  });
  Handlebars.registerHelper("MarksRightSide", (marked) => {
    const quantityInput = {
      input: {
        type: "number",
        value: marked.marks,
        cssClass: "marks-qty"
      }
    };
    return [quantityInput];
  });
  Handlebars.registerHelper("MarksIcons", (marked) => {
    const incrementIcon = {
      icon: "fas fa-plus marks-add-one",
      title: game.i18n.localize("SR5.Labels.Sheet.AddOne"),
      data: { action: "add-one" }
    };
    const decrementIcon = {
      icon: "fas fa-minus marks-remove-one",
      title: game.i18n.localize("SR5.Labels.Sheet.SubtractOne"),
      data: { action: "remove-one" }
    };
    return [incrementIcon, decrementIcon];
  });
  Handlebars.registerHelper("MarkListHeaderRightSide", () => {
    return [
      {
        text: {
          text: game.i18n.localize("SR5.FOUNDRY.Scene")
        }
      },
      {
        text: {
          text: game.i18n.localize("SR5.FOUNDRY.Item")
        }
      },
      {
        text: {
          text: game.i18n.localize("SR5.Qty")
        }
      }
    ];
  });
  Handlebars.registerHelper("MarkListHeaderIcons", () => {
    return [{
      icon: "fas fa-trash",
      title: game.i18n.localize("SR5.ClearMarks"),
      text: game.i18n.localize("SR5.Del"),
      cssClass: "marks-clear-all"
    }];
  });
  Handlebars.registerHelper("NetworkDevicesListRightSide", () => {
    return [
      {
        text: {
          text: game.i18n.localize("SR5.FOUNDRY.Actor")
        }
      },
      {
        text: {
          text: game.i18n.localize("SR5.FOUNDRY.Item")
        }
      }
    ];
  });
  Handlebars.registerHelper("NetworkDevicesListHeaderIcons", () => {
    return [{
      icon: "fas fa-trash",
      title: game.i18n.localize("SR5.Labels.Sheet.ClearNetwork"),
      text: game.i18n.localize("SR5.Del"),
      cssClass: "network-clear"
    }];
  });
};

// src/module/rules/SkillRules.ts
var SkillRules = class {
  static mustDefaultToRoll(skill) {
    return skill.base === 0;
  }
  static allowDefaultingRoll(skill) {
    return skill.canDefault;
  }
  static allowRoll(skill) {
    return !SkillRules.mustDefaultToRoll(skill) || SkillRules.allowDefaultingRoll(skill);
  }
  static addDefaultingPart(parts) {
    parts.addUniquePart("SR5.Defaulting", SkillRules.defaultingModifier);
  }
  static level(skill, options = { specialization: false }) {
    if (this.mustDefaultToRoll(skill) && this.allowDefaultingRoll(skill)) {
      return SkillRules.defaultingModifier;
    }
    const skillValue = typeof skill.value === "number" ? skill.value : 0;
    const specializationBonus = options.specialization ? SR.skill.SPECIALIZATION_MODIFIER : 0;
    return skillValue + specializationBonus;
  }
  static get defaultingModifier() {
    return SR.skill.DEFAULTING_MODIFIER;
  }
  static get SpecializationModifier() {
    return SR.skill.SPECIALIZATION_MODIFIER;
  }
};

// src/module/handlebars/SkillLineHelpers.ts
var registerSkillLineHelpers = () => {
  Handlebars.registerHelper("SkillHeaderIcons", function(category) {
    const addIcon = {
      icon: "fas fa-plus",
      title: game.i18n.localize("SR5.AddSkill"),
      text: game.i18n.localize("SR5.Add"),
      cssClass: ""
    };
    switch (category) {
      case "active":
        addIcon.cssClass = "add-active";
        return [addIcon];
      case "language":
        addIcon.cssClass = "add-language";
        return [addIcon];
      case "knowledge":
        addIcon.cssClass = "add-knowledge";
        return [addIcon];
      default:
        return [];
    }
  });
  Handlebars.registerHelper("SkillHeaderRightSide", function(id, filters) {
    const specs = {
      text: {
        text: game.i18n.localize("SR5.Specialization"),
        cssClass: "skill-spec-item"
      }
    };
    const rtg = {
      text: {
        text: !filters || filters.showUntrainedSkills ? game.i18n.localize("SR5.Rtg") : game.i18n.localize("SR5.RtgAboveZero"),
        cssClass: "rtg"
      }
    };
    switch (id) {
      case "active":
      case "knowledge":
      case "language":
        return [specs, rtg];
      default:
        return [];
    }
  });
  Handlebars.registerHelper("SkillRightSide", function(skillType, skill) {
    const specs = Array.isArray(skill.specs) ? skill.specs : [skill.specs];
    return [
      {
        html: {
          text: specs.map((spec) => `<span class="roll skill-spec-roll">${spec}</span>`).join(", "),
          cssClass: "skill-spec-item"
        }
      },
      {
        text: {
          text: Helpers.calcTotal(skill),
          cssClass: "rtg"
        }
      }
    ];
  });
  Handlebars.registerHelper("SkillAdditionCssClass", function(skill) {
    const classes = [];
    if (game.settings.get(SYSTEM_NAME, FLAGS.ShowSkillsWithDetails) && !SkillRules.allowDefaultingRoll(skill)) {
      classes.push("skill-roll-not-defaultable");
    }
    return classes;
  });
  Handlebars.registerHelper("SkillIcons", function(skillType, skill) {
    const editIcon = {
      icon: "fas fa-edit",
      title: game.i18n.localize("SR5.EditSkill"),
      cssClass: ""
    };
    const removeIcon = {
      icon: "fas fa-trash",
      title: game.i18n.localize("SR5.DeleteSkill"),
      cssClass: ""
    };
    switch (skillType) {
      case "active":
        editIcon.cssClass = "skill-edit";
        removeIcon.cssClass = "remove-active";
        return [editIcon, removeIcon];
      case "language":
        editIcon.cssClass = "language-skill-edit";
        removeIcon.cssClass = "remove-language";
        return [editIcon, removeIcon];
      case "knowledge":
        editIcon.cssClass = "knowledge-skill-edit";
        removeIcon.cssClass = "remove-knowledge";
        return [editIcon, removeIcon];
      default:
        return [editIcon];
    }
  });
};

// src/module/handlebars/AppHelpers.ts
var registerAppHelpers = () => {
  Handlebars.registerHelper("IsEnvModifierActive", (active, category, modifier) => {
    return active[category] === modifier;
  });
};

// src/module/rolls/SR5Roll.ts
var SR5Roll = class extends Roll {
  get sides() {
    if (this.terms) {
      return this.terms[0].results.map((result) => result.result);
    }
    return this.parts[0].rolls.map((roll) => roll.roll);
  }
  get limit() {
    return this.data.limit;
  }
  get threshold() {
    return this.data.threshold;
  }
  get parts() {
    return this.data.parts;
  }
  get explodeSixes() {
    return this.data.explodeSixes;
  }
  count(side) {
    return this.sides.reduce((counted, result) => result === side ? counted + 1 : counted, 0);
  }
  get hits() {
    return this.sides.reduce((hits, result) => SR.die.success.includes(result) ? hits + 1 : hits, 0);
  }
  get glitches() {
    return this.sides.reduce((glitches, result) => SR.die.glitch.includes(result) ? glitches + 1 : glitches, 0);
  }
  get pool() {
    if (this.terms) {
      return this.dice[0].number;
    }
    return this.parts[0].rolls.length;
  }
  get poolThrown() {
    return this.dice[0].results.length;
  }
  get glitched() {
    return this.glitches > Math.floor(this.pool / 2);
  }
  get total() {
    return this.hits;
  }
};

// src/module/actor/flows/SkillFlow.ts
var SkillFlow = class {
  static handleDefaulting(skill, parts) {
    var _a;
    if (!SkillRules.mustDefaultToRoll(skill))
      return;
    if (!SkillFlow.allowDefaultingRoll(skill)) {
      (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.Warnings.SkillCantBeDefault"));
      return;
    }
    SkillRules.addDefaultingPart(parts);
  }
  static allowDefaultingRoll(skill) {
    const allowUnimproviseable = game.settings.get(SYSTEM_NAME, FLAGS.OnlyAllowRollOnDefaultableSkills) === false;
    if (allowUnimproviseable)
      return true;
    return SkillRules.allowDefaultingRoll(skill);
  }
  static allowRoll(skill) {
    if (SkillRules.mustDefaultToRoll(skill) && SkillFlow.allowDefaultingRoll(skill)) {
      return true;
    }
    return SkillRules.allowRoll(skill);
  }
  static isCustomSkill(skill) {
    return skill.name !== void 0 && skill.name !== "";
  }
  static isLegacySkill(skill) {
    return !SkillFlow.isCustomSkill(skill);
  }
};

// src/module/item/flows/ActionFlow.ts
var ActionFlow = class {
  static calcDamage(damage, actor, item) {
    damage = duplicate(damage);
    if (!actor)
      return damage;
    if (item) {
      damage.source = ActionFlow._damageSource(actor, item);
    }
    const attribute = actor.findAttribute(damage.attribute);
    if (!attribute)
      return damage;
    if (!damage.base_formula_operator) {
      console.error(`Unsupported base damage formula operator: '${damage.base_formula_operator}' used. Falling back to 'add'.`);
      damage.base_formula_operator = "add";
    }
    switch (damage.base_formula_operator) {
      case "add":
        PartsList.AddUniquePart(damage.mod, attribute.label, attribute.value);
        break;
      case "subtract":
        PartsList.AddUniquePart(damage.mod, attribute.label, -attribute.value);
        break;
      case "multiply":
        PartsList.AddUniquePart(damage.mod, "SR5.Value", damage.base * attribute.value - damage.base);
        break;
      case "divide":
        PartsList.AddUniquePart(damage.mod, "SR5.BaseValue", damage.base * -1);
        const denominator = attribute.value === 0 ? 1 : attribute.value;
        PartsList.AddUniquePart(damage.mod, "SR5.Value", Math.floor(damage.base / denominator));
        break;
    }
    damage.value = Helpers.calcTotal(damage, { min: 0 });
    return damage;
  }
  static _damageSource(actor, item) {
    return {
      actorId: actor.id || "",
      itemId: item.id || "",
      itemName: item.name || "",
      itemType: item.type
    };
  }
  static hasDamage(damage) {
    if (damage.base !== 0)
      return true;
    if (damage.attribute)
      return true;
    if (damage.type)
      return true;
    if (damage.element)
      return true;
    return false;
  }
};

// src/module/tests/TestCreator.ts
var TestCreator = {
  fromPool: function(values = { pool: 0, limit: 0, threshold: 0 }, options) {
    const data = TestCreator._minimalTestData();
    data.pool.base = values.pool;
    data.threshold.base = values.threshold || 0;
    data.limit.base = values.limit || 0;
    const successTestCls = TestCreator._getTestClass("SuccessTest");
    return new successTestCls(data, void 0, options);
  },
  fromItem: function(item, actor, options) {
    return __async(this, null, function* () {
      if (!actor)
        actor = item.parent;
      if (!(actor instanceof SR5Actor)) {
        console.error("Shadowrun 5e | A SuccessTest can only be created with an explicit Actor or Item with an actor parent.");
        return;
      }
      const action = item.getAction();
      if (!action)
        return;
      if (!action.test) {
        action.test = "SuccessTest";
        console.warn(`Shadowrun 5e | An action without a defined test handler defaulted to ${"SuccessTest"}`);
      }
      if (!game.shadowrun5e.tests.hasOwnProperty(action.test)) {
        console.error(`Shadowrun 5e | Test registration for test ${action.test} is missing`);
        return;
      }
      const cls = TestCreator._getTestClass(action.test);
      const data = yield TestCreator._getTestDataFromItemAction(cls, item, actor);
      const documents = { item, actor };
      return new cls(data, documents, options);
    });
  },
  fromAction: function(action, actor, options) {
    return __async(this, null, function* () {
      if (!action.test) {
        action.test = "SuccessTest";
        console.warn(`Shadowrun 5e | An action without a defined test handler defaulted to ${"SuccessTest"}`);
      }
      if (!game.shadowrun5e.tests.hasOwnProperty(action.test)) {
        console.error(`Shadowrun 5e | Test registration for test ${action.test} is missing`);
        return;
      }
      const cls = TestCreator._getTestClass(action.test);
      const data = yield TestCreator._prepareTestDataWithAction(action, actor, TestCreator._minimalTestData());
      const documents = { actor };
      return new cls(data, documents, options);
    });
  },
  fromPackAction: function(packName, actionName, actor, options) {
    return __async(this, null, function* () {
      const item = yield Helpers.getPackAction(packName, actionName);
      if (!item) {
        console.error(`Shadowrun5 | The pack ${packName} doesn't include an item ${actionName}`);
        return;
      }
      return TestCreator.fromItem(item, actor, options);
    });
  },
  fromMessage: function(id) {
    return __async(this, null, function* () {
      var _a;
      const message = (_a = game.messages) == null ? void 0 : _a.get(id);
      if (!message) {
        console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
        return;
      }
      const flagData = message.getFlag(SYSTEM_NAME, FLAGS.Test);
      if (!flagData)
        return;
      const testData = foundry.utils.duplicate(flagData);
      if (!testData) {
        console.error(`Shadowrun 5e | Message with id ${id} doesn't have test data in it's flags.`);
        return;
      }
      const rolls = testData.rolls.map((roll) => SR5Roll.fromData(roll));
      const documents = { rolls };
      return TestCreator.fromTestData(testData.data, documents, testData.data.options);
    });
  },
  fromMessageAction: function(id, testClsName, options) {
    return __async(this, null, function* () {
      var _a, _b;
      const message = (_a = game.messages) == null ? void 0 : _a.get(id);
      if (!message) {
        console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
        return;
      }
      const testData = foundry.utils.duplicate(message.getFlag(SYSTEM_NAME, FLAGS.Test));
      if (!testData || !testData.data || !testData.rolls) {
        console.error(`Shadowrun 5e | Message with id ${id} doesn't have valid test data in it's flags.`);
        return;
      }
      const testClass = TestCreator._getTestClass(testClsName);
      if (!testClass) {
        console.error(`Shadowrun 5e | Couldn't find a registered test implementation for ${testClsName}`);
        return;
      }
      const targets = yield Helpers.getTestTargetActors(testData.data);
      const actors = targets.length > 0 ? targets : Helpers.getSelectedActorsOrCharacter();
      if (actors.length === 0)
        (_b = ui.notifications) == null ? void 0 : _b.warn(game.i18n.localize("SR5.Warnings.TokenSelectionNeeded"));
      for (const actor of actors) {
        const data = yield testClass._getOpposedActionTestData(testData.data, actor, id);
        if (!data)
          return;
        const documents = { actor };
        const test = new testClass(data, documents, options);
        yield test.execute();
      }
    });
  },
  fromTestData: function(data, documents, options) {
    const type = data.type || "SuccessTest";
    const cls = TestCreator._getTestClass(type);
    return new cls(data, documents, options);
  },
  fromOpposedTestResistTest: function(opposed, options) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      const opposedData = foundry.utils.duplicate(opposed.data);
      if (!((_c = (_b = (_a = opposedData == null ? void 0 : opposedData.against) == null ? void 0 : _a.opposed) == null ? void 0 : _b.resist) == null ? void 0 : _c.test))
        return console.error(`Shadowrun 5e | Given test doesn't define an opposed resist test`, opposed);
      if (!opposed.actor)
        return console.error(`Shadowrun 5e | A ${opposed.title} can't operate without a populated actor given`);
      const resistTestCls = TestCreator._getTestClass(opposedData.against.opposed.resist.test);
      const data = yield TestCreator._getOpposedResistTestData(resistTestCls, opposedData, opposed.actor, opposed.data.messageUuid);
      const documents = { actor: opposed.actor };
      return new resistTestCls(data, documents, options);
    });
  },
  fromFollowupTest: function(test, options) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      if (!((_c = (_b = (_a = test == null ? void 0 : test.data) == null ? void 0 : _a.action) == null ? void 0 : _b.followed) == null ? void 0 : _c.test))
        return;
      if (!test.item)
        return console.error(`Shadowrun 5e | Test doesn't have a populated item document`);
      if (!test.actor)
        return console.error(`Shadowrun 5e | Test doesn't have a populated actor document`);
      const testCls = TestCreator._getTestClass(test.data.action.followed.test);
      if (!testCls)
        return console.error(`Shadowrun 5e | A ${test.constructor.name} has a unregistered follow up test configured`, this);
      const data = TestCreator._minimalTestData();
      data.title = testCls.title;
      data.previousMessageId = test.data.messageUuid;
      data.against = test.data;
      const action = TestCreator._mergeMinimalActionDataInOrder(DefaultValues.actionData({ test: testCls.name }), yield testCls._getDocumentTestAction(test.item, test.actor), testCls._getDefaultTestAction());
      const testData = yield testCls._prepareActionTestData(action, test.actor, data);
      testData.following = test.data;
      const documents = { item: test.item, actor: test.actor };
      return new testCls(testData, documents, options);
    });
  },
  _getTestClass: function(testName) {
    if (!game.shadowrun5e.tests.hasOwnProperty(testName)) {
      console.error(`Shadowrun 5e | Tried getting a Test Class ${testName}, which isn't registered in: `, game.shadowrun5e.tests);
      return;
    }
    return game.shadowrun5e.tests[testName];
  },
  _getTestDataFromItemAction: function(testCls, item, actor) {
    return __async(this, null, function* () {
      const data = TestCreator._minimalTestData();
      let action = item.getAction();
      if (!action || !actor)
        return data;
      action = TestCreator._mergeMinimalActionDataInOrder(action, yield testCls._getDocumentTestAction(item, actor), testCls._getDefaultTestAction());
      return yield TestCreator._prepareTestDataWithAction(action, actor, data);
    });
  },
  _prepareTestDataWithAction: function(action, actor, data) {
    return __async(this, null, function* () {
      var _a;
      data.action = action;
      const pool = new PartsList(data.pool.mod);
      if (action.skill) {
        const skill = actor.getSkill(action.skill);
        if (skill && !SkillFlow.allowRoll(skill))
          (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.Warnings.SkillCantBeDefault", { localize: true });
        if (skill)
          pool.addUniquePart(skill.label || skill.name, SkillRules.level(skill));
        if (action.spec)
          pool.addUniquePart("SR5.Specialization", SkillRules.SpecializationModifier);
      }
      if (action.attribute) {
        const attribute = actor.getAttribute(action.attribute);
        if (attribute)
          pool.addPart(attribute.label, attribute.value);
        if (attribute && actor._isMatrixAttribute(action.attribute))
          actor._addMatrixParts(pool, true);
      }
      if (!action.skill && action.attribute2) {
        const attribute = actor.getAttribute(action.attribute2);
        if (attribute)
          pool.addPart(attribute.label, attribute.value);
        if (attribute && actor._isMatrixAttribute(action.attribute2))
          actor._addMatrixParts(pool, true);
      }
      if (action.mod) {
        data.pool.base = Number(action.mod);
      }
      if (action.dice_pool_mod) {
        action.dice_pool_mod.forEach((mod) => PartsList.AddUniquePart(data.modifiers.mod, mod.name, mod.value));
      }
      if (action.armor) {
        const armor = actor.getArmor();
        data.pool.mod = PartsList.AddUniquePart(data.pool.mod, "SR5.Armor", armor.value);
      }
      if (action.limit.base) {
        data.limit.base = Number(action.limit.base);
      }
      if (action.limit.mod) {
        action.limit.mod.forEach((mod) => PartsList.AddUniquePart(data.limit.mod, mod.name, mod.value));
      }
      if (action.limit.attribute) {
        const limit = actor.getLimit(action.limit.attribute);
        if (limit)
          data.limit.mod = PartsList.AddUniquePart(data.limit.mod, limit.label, limit.value);
        if (limit && actor._isMatrixAttribute(action.limit.attribute))
          actor._addMatrixParts(pool, true);
      }
      if (action.threshold.base) {
        data.threshold.base = Number(action.threshold.base);
      }
      if (ActionFlow.hasDamage(action.damage)) {
        data.damage = foundry.utils.duplicate(action.damage);
      }
      if (action.opposed.test) {
        data.opposed = action.opposed;
      }
      for (const modifier of data.action.modifiers) {
        const label = SR5.modifierTypes[modifier];
        const value = yield actor.modifiers.totalFor(modifier);
        data.modifiers.mod = PartsList.AddUniquePart(data.modifiers.mod, label, value);
      }
      data.extended = action.extended;
      return data;
    });
  },
  _getOpposedResistTestData: function(resistTestCls, opposedData, actor, previousMessageId) {
    return __async(this, null, function* () {
      if (!opposedData.against.opposed.resist.test) {
        console.error(`Shadowrun 5e | Supplied test action doesn't contain an resist test in it's opposed test configuration`, opposedData, this);
        return;
      }
      if (!actor) {
        console.error(`Shadowrun 5e | Can't resolve opposed test values due to missing actor`, resistTestCls);
      }
      const data = TestCreator._minimalTestData();
      data.previousMessageId = previousMessageId;
      data.following = opposedData;
      data.targetActorsUuid = [];
      const action = TestCreator._mergeMinimalActionDataInOrder(DefaultValues.actionData({ test: resistTestCls.name }), opposedData.against.opposed.resist, resistTestCls._getDefaultTestAction());
      return yield TestCreator._prepareTestDataWithAction(action, actor, data);
    });
  },
  _minimalTestData: function() {
    return {
      pool: DefaultValues.valueData({ label: "SR5.DicePool" }),
      limit: DefaultValues.valueData({ label: "SR5.Limit" }),
      threshold: DefaultValues.valueData({ label: "SR5.Threshold" }),
      damage: DefaultValues.damageData(),
      modifiers: DefaultValues.valueData({ label: "SR5.Labels.Action.Modifiers" }),
      values: {},
      action: DefaultValues.actionData(),
      opposed: {}
    };
  },
  _mergeMinimalActionDataInOrder: function(action, ...minimalActions) {
    action = duplicate(action);
    for (const minimalAction of minimalActions) {
      for (const key of Object.keys(DefaultValues.minimalActionData())) {
        if (!minimalAction.hasOwnProperty(key))
          continue;
        action[key] = minimalAction[key];
      }
    }
    return action;
  },
  shouldHideDialog(event) {
    if (!event)
      return false;
    return event[SR5.kbmod.HIDE_DIALOG] === true;
  },
  shouldPostItemDescription(event) {
    if (!event)
      return false;
    return event[SR5.kbmod.ITEM_DESCR] === true;
  }
};

// src/module/rolls/ShadowrunRoller.ts
var ShadowrunRoll = class extends Roll {
  toJSON() {
    const data = super.toJSON();
    data.class = "Roll";
    return data;
  }
  get sides() {
    if (this.terms) {
      return this.terms[0].results.map((result) => result.result);
    }
    return this.parts[0].rolls.map((roll) => roll.roll);
  }
  get limit() {
    return this.data.limit;
  }
  get threshold() {
    return this.data.threshold;
  }
  get parts() {
    return this.data.parts;
  }
  get explodeSixes() {
    return this.data.explodeSixes;
  }
  count(side) {
    const results = this.sides;
    return results.reduce((counted, result) => result === side ? counted + 1 : counted, 0);
  }
  get hits() {
    return this.total || 0;
  }
  get pool() {
    if (this.terms) {
      return this.dice[0].number;
    }
    return this.parts[0].rolls.length;
  }
  get glitched() {
    let glitched = 0;
    SR.die.glitch.forEach((die) => glitched += this.count(die));
    return glitched > Math.floor(this.pool / 2);
  }
  toMessage(messageData, rollMode) {
    console.error("message", messageData, rollMode);
    return super.toMessage(messageData, rollMode);
  }
};
var ShadowrunRoller = class {
  static shadowrunFormula({
    parts: partsProps,
    limit,
    explode
  }) {
    var _a;
    const parts = new PartsList(partsProps);
    const count = parts.total;
    if (count <= 0) {
      (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.RollOneDie"));
      return "0d6cs>=5";
    }
    let formula = `${count}d6`;
    if (explode) {
      formula += "x6";
    }
    if (limit == null ? void 0 : limit.value) {
      formula += `kh${limit.value}`;
    }
    formula += "cs>=5";
    return formula;
  }
  static promptSuccessTest() {
    return __async(this, null, function* () {
      var _a, _b;
      const lastPoolValue = Number((_a = game.user) == null ? void 0 : _a.getFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue)) || 0;
      const test = yield TestCreator.fromPool({ pool: lastPoolValue });
      yield test.execute();
      if (test.evaluated) {
        yield (_b = game.user) == null ? void 0 : _b.setFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue, test.pool.value);
      }
    });
  }
  static advancedRoll(advancedProps, dialogOptions) {
    return __async(this, null, function* () {
    });
  }
};

// src/module/apps/dialogs/DamageApplicationDialog.ts
var DamageApplicationDialog = class extends FormDialog {
  constructor(actors, damage, options) {
    const dialogData = DamageApplicationDialog.getDialogData(actors, damage);
    super(dialogData, options);
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "damage-application";
    options.classes = ["sr5", "form-dialog"];
    options.resizable = true;
    options.height = "auto";
    return options;
  }
  static getDialogData(actors, damage) {
    const title = game.i18n.localize("SR5.DamageApplication.Title");
    const templatePath = "systems/shadowrun5e/dist/templates/apps/dialogs/damage-application.html";
    const actorDamage = actors.map((a) => {
      return { actor: a };
    });
    const templateData = {
      damage,
      actorDamage
    };
    const buttons = {
      damage: {
        label: game.i18n.localize("SR5.DamageApplication.ApplyDamage")
      }
    };
    const onAfterClose = () => actorDamage;
    return {
      title,
      templatePath,
      templateData,
      onAfterClose,
      buttons,
      default: "damage"
    };
  }
};

// src/module/actor/flows/DamageApplicationFlow.ts
var DamageApplicationFlow = class {
  runApplyDamage(actors, damage) {
    return __async(this, null, function* () {
      const damageApplicationDialog = yield new DamageApplicationDialog(actors, damage);
      yield damageApplicationDialog.select();
      if (damageApplicationDialog.canceled) {
        return;
      }
      actors.forEach((actor) => {
        this.applyDamageToActor(actor, damage);
      });
    });
  }
  applyDamageToActor(actor, damage) {
    return __async(this, null, function* () {
      if (damage.value <= 0) {
        return;
      }
      damage = this.changeStunToPhysicalForGrunts(actor, damage);
      if (damage.type.value === "matrix") {
        damage = yield actor.addMatrixDamage(damage);
      }
      if (damage.type.value === "stun") {
        damage = yield actor.addStunDamage(damage);
      }
      if (damage.type.value === "physical") {
        yield actor.addPhysicalDamage(damage);
      }
    });
  }
  changeStunToPhysicalForGrunts(actor, damage) {
    const updatedDamage = duplicate(damage);
    if (!actor.isGrunt()) {
      return updatedDamage;
    }
    if (damage.type.value === "stun") {
      updatedDamage.type.value = "physical";
    }
    return updatedDamage;
  }
};

// src/module/rules/MatrixRules.ts
var MatrixRules = class {
  static getConditionMonitor(deviceRating) {
    deviceRating = Math.max(deviceRating, SR.attributes.ranges.host_rating.min);
    return Math.ceil(8 + deviceRating / 2);
  }
  static getICDeviceRating(hostRating) {
    return Math.max(hostRating, SR.attributes.ranges.host_rating.min);
  }
  static getICInitiativeBase(hostRating) {
    return Math.max(hostRating * 2, SR.attributes.ranges.host_rating.min);
  }
  static getICInitiativeDice() {
    return Math.max(SR.initiatives.ic.dice, SR.initiatives.ranges.dice.min);
  }
  static getICMeatAttributeBase(hostRating) {
    return Math.max(hostRating, SR.attributes.ranges.host_rating.min);
  }
  static isValidMarksCount(marks) {
    return marks >= MatrixRules.minMarksCount() && marks <= MatrixRules.maxMarksCount() && marks % 1 === 0;
  }
  static maxMarksCount() {
    return 3;
  }
  static minMarksCount() {
    return 0;
  }
  static getValidMarksCount(marks) {
    marks = Math.min(marks, MatrixRules.maxMarksCount());
    return Math.max(marks, MatrixRules.minMarksCount());
  }
  static hostMatrixAttributeRatings(hostRating) {
    return [0, 1, 2, 3].map((rating) => rating + hostRating);
  }
};

// src/module/rules/SoakRules.ts
var SoakRules = class {
  static applyAllSoakParts(soakParts, actor, damageData) {
    if (damageData.type.base !== "matrix") {
      SoakRules.applyPhysicalAndStunSoakParts(soakParts, actor, damageData);
    } else {
      SoakRules.applyMatrixSoakParts(soakParts, actor);
    }
  }
  static applyPhysicalAndStunSoakParts(soakParts, actor, damageData) {
    const damageSourceItem = Helpers.findDamageSource(damageData);
    if (damageSourceItem && damageSourceItem.isDirectCombatSpell()) {
      return SoakRules.applyDirectCombatSpellParts(damageSourceItem.data, soakParts, actor);
    }
    SoakRules.applyBodyAndArmorParts(soakParts, actor);
    const armor = actor.getArmor();
    SoakRules.applyArmorPenetration(soakParts, armor, damageData);
    SoakRules.applyElementalArmor(soakParts, armor, damageData.element.base);
  }
  static applyDirectCombatSpellParts(spellItem, soakParts, actor) {
    if (spellItem.data.type === "mana") {
      SoakRules.addUniquePart(soakParts, actor.getAttribute("willpower"), SR5.attributes.willpower);
    } else {
      SoakRules.addUniquePart(soakParts, actor.getAttribute("body"), SR5.attributes.body);
    }
    return;
  }
  static applyBodyAndArmorParts(soakParts, actor) {
    const body = actor.findAttribute("body");
    if (body) {
      soakParts.addUniquePart(body.label || "SR5.Body", body.value);
    }
    const mod = actor.getModifier("soak");
    if (mod) {
      soakParts.addUniquePart("SR5.Bonus", mod);
    }
    actor._addArmorParts(soakParts);
  }
  static applyArmorPenetration(soakParts, armor, damageData) {
    var _a;
    const bonusArmor = (_a = armor[damageData.element.value]) != null ? _a : 0;
    const totalArmor = armor.value + bonusArmor;
    const ap = Helpers.calcTotal(damageData.ap);
    soakParts.addUniquePart("SR5.AP", Math.max(ap, -totalArmor));
  }
  static applyElementalArmor(soakParts, armor, element) {
    var _a;
    const bonusArmor = (_a = armor[element]) != null ? _a : 0;
    if (bonusArmor) {
      soakParts.addUniquePart(SR5.elementTypes[element], bonusArmor);
    }
  }
  static applyMatrixSoakParts(soakParts, actor) {
    const actorData = actor.data.data;
    if (actorData.initiative.perception === "matrix") {
      if (actor.isVehicle()) {
        SoakRules.applyRatingAndFirewallParts(actorData, soakParts);
      } else {
        SoakRules.applyBiofeedbackParts(soakParts, actor, actorData);
      }
    } else {
      SoakRules.applyRatingAndFirewallParts(actorData, soakParts);
    }
  }
  static applyBiofeedbackParts(soakParts, actor, actorData) {
    SoakRules.addUniquePart(soakParts, actor.getAttribute("willpower"), SR5.attributes.willpower);
    if (!actorData.matrix) {
      return;
    }
    SoakRules.addUniquePart(soakParts, actorData.matrix.firewall, SR5.matrixAttributes.firewall);
  }
  static applyRatingAndFirewallParts(actorData, soakParts) {
    if (!actorData.matrix) {
      return;
    }
    const deviceRating = actorData.matrix.rating;
    if (deviceRating) {
      soakParts.addUniquePart("SR5.Labels.ActorSheet.DeviceRating", deviceRating);
    }
    this.addUniquePart(soakParts, actorData.matrix.firewall, SR5.matrixAttributes.firewall);
  }
  static addUniquePart(partsList, modifiableValue, label) {
    const totalValue = Helpers.calcTotal(modifiableValue);
    partsList.addUniquePart(label, totalValue);
  }
  static reduceDamage(actor, damageData, hits) {
    if (damageData.type.value === "stun" && actor.isVehicle()) {
      return Helpers.reduceDamageByHits(damageData, damageData.value, "SR5.VehicleStunImmunity");
    }
    return Helpers.reduceDamageByHits(damageData, hits, "SR5.SoakTest");
  }
  static modifyDamageType(damage, actor) {
    let updatedDamage = duplicate(damage);
    if (actor.isVehicle() && updatedDamage.element.value === "electricity" && updatedDamage.type.value === "stun") {
      updatedDamage.type.value = "physical";
    }
    const damageSourceItem = Helpers.findDamageSource(damage);
    if (damageSourceItem && damageSourceItem.isDirectCombatSpell()) {
      return updatedDamage;
    }
    updatedDamage = SoakRules.modifyPhysicalDamageForArmor(updatedDamage, actor);
    return SoakRules.modifyMatrixDamageForBiofeedback(updatedDamage, actor);
  }
  static modifyPhysicalDamageForArmor(damage, actor) {
    const updatedDamage = duplicate(damage);
    if (damage.type.value === "physical") {
      if (!actor.isCharacter() && !actor.isSpirit() && !actor.isCritter() && !actor.isVehicle()) {
        return updatedDamage;
      }
      const modifiedArmor = actor.getModifiedArmor(damage);
      if (modifiedArmor) {
        const armorWillChangeDamageType = modifiedArmor.value > damage.value;
        if (armorWillChangeDamageType) {
          updatedDamage.type.value = "stun";
        }
      }
    }
    return updatedDamage;
  }
  static modifyMatrixDamageForBiofeedback(damage, actor) {
    const updatedDamage = duplicate(damage);
    if (damage.type.value === "matrix") {
      const actorData = actor.data.data;
      if (!actor.isCharacter()) {
        return updatedDamage;
      }
      if (actorData.initiative.perception === "matrix") {
        if (actorData.matrix.hot_sim) {
          updatedDamage.type.value = "physical";
        } else {
          updatedDamage.type.value = "stun";
        }
      }
    }
    return updatedDamage;
  }
};

// src/module/rules/CombatRules.ts
var CombatRules = class {
  static iniOrderCanDoAnotherPass(scores) {
    for (const score of scores) {
      if (CombatRules.iniScoreCanDoAnotherPass(score))
        return true;
    }
    return false;
  }
  static iniScoreCanDoAnotherPass(score) {
    return CombatRules.reduceIniResultAfterPass(score) > 0;
  }
  static reduceIniResultAfterPass(score) {
    return Math.max(score + SR.combat.INI_RESULT_MOD_AFTER_INI_PASS, 0);
  }
  static reduceIniOnLateSpawn(score, pass) {
    pass = Math.max(pass - 1, 0);
    score = Math.max(score, 0);
    const reducedScore = score + pass * SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;
    return CombatRules.getValidInitiativeScore(reducedScore);
  }
  static getValidInitiativeScore(score) {
    return Math.max(score, 0);
  }
  static attackHits(attackerHits, defenderHits) {
    return attackerHits > defenderHits;
  }
  static attackGrazes(attackerHits, defenderHits) {
    return attackerHits === defenderHits;
  }
  static attackMisses(attackerHits, defenderHits) {
    return !CombatRules.attackHits(attackerHits, defenderHits);
  }
  static modifyDamageAfterHit(attackerHits, defenderHits, damage) {
    const modifiedDamage = foundry.utils.duplicate(damage);
    if (attackerHits < 0)
      attackerHits = 0;
    if (defenderHits < 0)
      defenderHits = 0;
    PartsList.AddUniquePart(modifiedDamage.mod, "SR5.Attacker", attackerHits);
    PartsList.AddUniquePart(modifiedDamage.mod, "SR5.Defender", -defenderHits);
    modifiedDamage.value = Helpers.calcTotal(modifiedDamage, { min: 0 });
    return modifiedDamage;
  }
  static modifyDamageAfterSupressionHit(damage) {
    return foundry.utils.duplicate(damage);
  }
  static modifyDamageAfterMiss(damage) {
    const modifiedDamage = foundry.utils.duplicate(damage);
    modifiedDamage.override = { name: "SR5.Success", value: 0 };
    Helpers.calcTotal(modifiedDamage, { min: 0 });
    return modifiedDamage;
  }
  static modifyDamageAfterResist(actor, damage, hits) {
    if (hits < 0)
      hits = 0;
    let { modified } = SoakRules.reduceDamage(actor, damage, hits);
    modified = SoakRules.modifyDamageType(modified, actor);
    Helpers.calcTotal(modified, { min: 0 });
    return modified;
  }
  static modifyArmorAfterHit(armor, damage) {
    const modifiedArmor = foundry.utils.duplicate(armor);
    if (damage.ap.value <= 0)
      return modifiedArmor;
    console.error("Check if ap is a negative value or positive value during weapon item configuration");
    PartsList.AddUniquePart(modifiedArmor.mod, "SR5.AP", damage.ap.value);
    modifiedArmor.value = Helpers.calcTotal(modifiedArmor, { min: 0 });
    return modifiedArmor;
  }
};

// src/module/rules/MeleeRules.ts
var MeleeRules = class {
  static defenseReachModifier(incomingReach, defendingReach) {
    return defendingReach - incomingReach;
  }
};

// src/module/apps/dialogs/TestDialog.ts
var TestDialog = class extends FormDialog {
  constructor(data, options = {}) {
    options.applyFormChangesOnSubmit = true;
    super(data, options);
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "test-dialog";
    options.classes = ["sr5", "form-dialog"];
    options.resizable = true;
    options.height = "auto";
    options.width = "auto";
    return options;
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".entity-link").on("click", Helpers.renderEntityLinkSheet);
  }
  get templateContent() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/success-test-dialog.html";
  }
  getData() {
    var _a;
    const data = super.getData();
    data.rollMode = (_a = data.test.data.options) == null ? void 0 : _a.rollMode;
    data.rollModes = CONFIG.Dice.rollModes;
    data.default = "roll";
    data.config = SR5;
    return data;
  }
  get title() {
    const data = this.data;
    return game.i18n.localize(data.test.title);
  }
  get buttons() {
    return {
      roll: {
        label: game.i18n.localize("SR5.Roll"),
        icon: '<i class="fas fa-dice-six"></i>'
      },
      cancel: {
        label: game.i18n.localize("SR5.Dialogs.Common.Cancel")
      }
    };
  }
  onAfterClose(html) {
    return this.data.test.data;
  }
  _updateData(data) {
    if (this.selectedButton === "cancel")
      return;
    Object.entries(data).forEach(([key, value]) => {
      const valueField = foundry.utils.getProperty(this.data, key);
      if (foundry.utils.getType(valueField) !== "Object" || !valueField.hasOwnProperty("mod"))
        return;
      delete data[key];
      if (valueField.value === value)
        return;
      if (value === null || value === "")
        delete valueField.override;
      else
        valueField.override = { name: "SR5.ManualOverride", value: Number(value) };
    });
    foundry.utils.mergeObject(this.data, data);
    this.data.test.prepareBaseValues();
    this.data.test.calculateBaseValues();
  }
};

// src/module/template.ts
var Template = class extends MeasuredTemplate {
  static fromItem(item, onComplete) {
    var _a, _b;
    if (!canvas.scene)
      return;
    const templateShape = "circle";
    const templateData = {
      t: templateShape,
      user: (_a = game.user) == null ? void 0 : _a.id,
      direction: 0,
      x: 0,
      y: 0,
      fillColor: (_b = game.user) == null ? void 0 : _b.color
    };
    const blast = item.getBlastData();
    templateData["distance"] = (blast == null ? void 0 : blast.radius) || 1;
    templateData["dropoff"] = (blast == null ? void 0 : blast.dropoff) || 0;
    const document2 = new MeasuredTemplateDocument(templateData, { parent: canvas.scene });
    const template = new Template(document2);
    template.item = item;
    template.onComplete = onComplete;
    return template;
  }
  drawPreview() {
    return __async(this, null, function* () {
      if (!canvas.ready || !this.layer.preview)
        return;
      const initialLayer = canvas.activeLayer;
      if (!initialLayer)
        return;
      yield this.draw();
      this.layer.activate();
      this.layer.preview.addChild(this);
      this.activatePreviewListeners(initialLayer);
    });
  }
  activatePreviewListeners(initialLayer) {
    if (!canvas.ready || !canvas.stage || !canvas.app)
      return;
    const handlers = {};
    let moveTime = 0;
    handlers["mm"] = (event) => {
      event.stopPropagation();
      if (!canvas.grid)
        return;
      let now = Date.now();
      if (now - moveTime <= 20)
        return;
      const mousePos = event.data.getLocalPosition(this.layer);
      const snapped = canvas.grid.getSnappedPosition(mousePos.x, mousePos.y, 2);
      this.document.updateSource({ x: snapped.x, y: snapped.y });
      this.refresh();
      moveTime = now;
    };
    handlers["rc"] = () => {
      if (!canvas.ready || !this.layer.preview || !canvas.stage || !canvas.app)
        return;
      this.layer.preview.removeChildren();
      canvas.stage.off("mousemove", handlers["mm"]);
      canvas.stage.off("mousedown", handlers["lc"]);
      canvas.app.view.oncontextmenu = null;
      canvas.app.view.onwheel = null;
      initialLayer.activate();
      if (this.onComplete)
        this.onComplete();
    };
    handlers["lc"] = (event) => {
      var _a;
      handlers["rc"](event);
      if (!canvas.grid)
        return;
      const gridPos = canvas.grid.getSnappedPosition(this.x, this.y, 2);
      const templateData = this.document.toObject();
      templateData.x = gridPos.x;
      templateData.y = gridPos.y;
      (_a = canvas.scene) == null ? void 0 : _a.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
    };
    handlers["mw"] = (event) => {
      if (event.ctrlKey)
        event.preventDefault();
      event.stopPropagation();
      if (!canvas.grid)
        return;
      let delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
      let snap = event.shiftKey ? delta : 5;
      const direction = this.document.direction + snap * Math.sign(event.deltaY);
      this.document.updateSource({ direction });
      this.refresh();
    };
    canvas.stage.on("mousemove", handlers["mm"]);
    canvas.stage.on("mousedown", handlers["lc"]);
    canvas.app.view.oncontextmenu = handlers["rc"];
    canvas.app.view.onwheel = handlers["mw"];
  }
};

// src/module/rules/TestRules.ts
var TestRules = {
  extendedModifierValue: -1,
  calcNextExtendedModifier: (current = 0) => {
    return current + TestRules.extendedModifierValue;
  },
  canExtendTest: (pool, threshold, extendedHits) => {
    if (threshold > 0)
      return extendedHits < threshold && pool > 0;
    return pool > 0;
  },
  success: (hits, threshold) => {
    hits = Math.max(hits, 0);
    threshold = Math.max(threshold, 0);
    if (threshold > 0)
      return hits >= threshold;
    else
      return hits > 0;
  },
  glitched: (glitches, pool) => {
    glitches = Math.max(glitches, 0);
    pool = Math.max(pool, 1);
    return glitches > Math.floor(pool / 2);
  },
  criticalGlitched: (success, glitched) => {
    return !success && glitched;
  }
};

// src/module/tests/SuccessTest.ts
var SuccessTest = class {
  constructor(data, documents, options) {
    this.actor = documents == null ? void 0 : documents.actor;
    this.item = documents == null ? void 0 : documents.item;
    this.rolls = (documents == null ? void 0 : documents.rolls) || [];
    this.targets = [];
    this.evaluated = false;
    options = options || {};
    this.data = this._prepareData(data, options);
    this.calculateBaseValues();
    console.info(`Shadowrun 5e | Created ${this.constructor.name} Test`, this);
  }
  _prepareData(data, options) {
    var _a, _b;
    data.type = data.type || this.type;
    data.targetActorsUuid = data.targetActorsUuid || Helpers.getUserTargets().map((token) => {
      var _a2;
      return (_a2 = token.actor) == null ? void 0 : _a2.uuid;
    }).filter((uuid) => !!uuid);
    data.sourceActorUuid = data.sourceActorUuid || ((_a = this.actor) == null ? void 0 : _a.uuid);
    data.sourceItemUuid = data.sourceItemUuid || ((_b = this.item) == null ? void 0 : _b.uuid);
    data.title = data.title || this.constructor.label;
    options.rollMode = options.rollMode !== void 0 ? options.rollMode : game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
    options.showDialog = options.showDialog !== void 0 ? options.showDialog : true;
    options.showMessage = options.showMessage !== void 0 ? options.showMessage : true;
    data.options = options;
    data.pushTheLimit = data.pushTheLimit !== void 0 ? data.pushTheLimit : false;
    data.secondChance = data.secondChance !== void 0 ? data.secondChance : false;
    data.pool = data.pool || DefaultValues.valueData({ label: "SR5.DicePool" });
    data.threshold = data.threshold || DefaultValues.valueData({ label: "SR5.Threshold" });
    data.limit = data.limit || DefaultValues.valueData({ label: "SR5.Limit" });
    data.values = data.values || {};
    data.values.hits = data.values.hits || DefaultValues.valueData({ label: "SR5.Hits" });
    data.values.extendedHits = data.values.extendedHits || DefaultValues.valueData({ label: "SR5.ExtendedHits" });
    data.values.netHits = data.values.netHits || DefaultValues.valueData({ label: "SR5.NetHits" });
    data.values.glitches = data.values.glitches || DefaultValues.valueData({ label: "SR5.Glitches" });
    data.opposed = data.opposed || void 0;
    data.modifiers = this._prepareModifiers(data.modifiers);
    data.damage = data.damage || DefaultValues.damageData();
    return data;
  }
  _prepareModifiers(modifiers) {
    return modifiers || DefaultValues.valueData({ label: "SR5.Labels.Action.Modifiers" });
  }
  get type() {
    return this.constructor.name;
  }
  toJSON() {
    return {
      data: this.data,
      rolls: this.rolls
    };
  }
  static get lowestSuccessSide() {
    return Math.min(...SR.die.success);
  }
  static get lowestGlitchSide() {
    return Math.min(...SR.die.glitch);
  }
  static _getDefaultTestAction() {
    return {};
  }
  static _getDocumentTestAction(item, actor) {
    return __async(this, null, function* () {
      return {};
    });
  }
  static _prepareActionTestData(action, actor, data) {
    return __async(this, null, function* () {
      return TestCreator._prepareTestDataWithAction(action, actor, data);
    });
  }
  static _getOpposedActionTestData(testData, actor, previousMessageId) {
    return __async(this, null, function* () {
      console.error(`Shadowrun 5e | Testing Class ${this.name} doesn't support opposed message actions`);
      return;
    });
  }
  static get label() {
    return `SR5.Tests.${this.name}`;
  }
  get hasModifiers() {
    return this.data.modifiers.mod.length > 0;
  }
  get formula() {
    const pool = Helpers.calcTotal(this.data.pool, { min: 0 });
    const explode = this.hasPushTheLimit ? "x6" : "";
    return `(${pool})d6cs>=${SuccessTest.lowestSuccessSide}${explode}`;
  }
  get code() {
    let pool = this.pool.mod.filter((mod) => mod.value !== 0).map((mod) => `${game.i18n.localize(mod.name)} (${mod.value})`);
    let threshold = this.threshold.override ? [game.i18n.localize(this.threshold.override.name)] : this.threshold.mod.map((mod) => game.i18n.localize(mod.name));
    let limit = this.limit.override ? [game.i18n.localize(this.limit.override.name)] : this.limit.mod.map((mod) => game.i18n.localize(mod.name));
    if (this.pool.base > 0)
      pool.push(String(this.pool.base));
    if (this.threshold.base > 0 && !this.threshold.override)
      threshold.push(String(this.threshold.base));
    if (this.limit.base > 0 && !this.limit.override)
      limit.push(String(this.limit.base));
    let code = pool.join(" + ").trim() || `${this.pool.value}`;
    if (threshold.length > 0 && this.threshold.value > 0)
      code = `${code} (${threshold.join(" + ").trim()})`;
    if (limit.length > 0 && this.limit.value > 0)
      code = `${code} [${limit.join(" + ").trim()}]`;
    return code;
  }
  get hasCode() {
    return this.pool.mod.length > 0 || this.threshold.mod.length > 0 || this.limit.mod.length > 0;
  }
  get title() {
    return `${game.i18n.localize(this.constructor.label)}`;
  }
  createRoll() {
    const roll = new SR5Roll(this.formula);
    this.rolls.push(roll);
    return roll;
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/success-test-dialog.html";
  }
  get _chatMessageTemplate() {
    return "systems/shadowrun5e/dist/templates/rolls/success-test-message.html";
  }
  _createTestDialog() {
    return new TestDialog({ test: this, templatePath: this._dialogTemplate });
  }
  showDialog() {
    return __async(this, null, function* () {
      var _a;
      if (!((_a = this.data.options) == null ? void 0 : _a.showDialog))
        return true;
      const dialog = this._createTestDialog();
      const data = yield dialog.select();
      if (dialog.canceled)
        return false;
      this.data = data;
      yield this.saveUserSelectionAfterDialog();
      this.prepareBaseValues();
      this.calculateBaseValues();
      return true;
    });
  }
  saveUserSelectionAfterDialog() {
    return __async(this, null, function* () {
    });
  }
  alterBaseValues() {
  }
  prepareBaseValues() {
    this.applyPushTheLimit();
    this.applyPoolModifiers();
  }
  applyPoolModifiers() {
    const pool = new PartsList(this.pool.mod);
    pool.removePart("SR5.Labels.Action.Modifiers");
    if (this.data.modifiers.override) {
      for (const modifier of this.data.modifiers.mod) {
        pool.removePart(modifier.name);
      }
      pool.addUniquePart("SR5.Labels.Action.Modifiers", this.data.modifiers.override.value);
      return;
    }
    for (const modifier of this.data.modifiers.mod) {
      pool.addUniquePart(modifier.name, modifier.value);
    }
  }
  calculateBaseValues() {
    this.data.modifiers.value = Helpers.calcTotal(this.data.modifiers);
    this.data.pool.value = Helpers.calcTotal(this.data.pool, { min: 0 });
    this.data.threshold.value = Helpers.calcTotal(this.data.threshold, { min: 0 });
    this.data.limit.value = Helpers.calcTotal(this.data.limit, { min: 0 });
    console.log(`Shadowrun 5e | Calculated base values for ${this.constructor.name}`, this.data);
  }
  evaluate() {
    return __async(this, null, function* () {
      for (const roll of this.rolls) {
        if (!roll._evaluated)
          yield roll.evaluate({ async: true });
      }
      this.evaluated = true;
      this.calculateDerivedValues();
      return this;
    });
  }
  populateTests() {
    return __async(this, null, function* () {
    });
  }
  populateDocuments() {
    return __async(this, null, function* () {
      if (!this.actor && this.data.sourceActorUuid) {
        const document2 = (yield fromUuid(this.data.sourceActorUuid)) || void 0;
        this.actor = document2 instanceof TokenDocument ? document2.actor : document2;
      }
      if (!this.item && this.data.sourceItemUuid)
        this.item = (yield fromUuid(this.data.sourceItemUuid)) || void 0;
      if (this.targets.length === 0 && this.data.targetActorsUuid) {
        this.targets = [];
        for (const uuid of this.data.targetActorsUuid) {
          const document2 = yield fromUuid(uuid);
          if (!document2)
            continue;
          const token = document2 instanceof SR5Actor ? document2.getToken() : document2;
          if (!(token instanceof TokenDocument))
            continue;
          this.targets.push(token);
        }
      }
    });
  }
  prepareDocumentData() {
    return __async(this, null, function* () {
      this.data.damage = ActionFlow.calcDamage(this.data.damage, this.actor, this.item);
    });
  }
  get testModifiers() {
    return ["global", "wounds"];
  }
  prepareDocumentModifiers() {
    return __async(this, null, function* () {
      yield this.prepareActorModifiers();
      yield this.prepareItemModifiers();
    });
  }
  prepareActorModifiers() {
    return __async(this, null, function* () {
      if (!this.actor)
        return;
      if (this.data.action.modifiers.length > 0)
        return;
      for (const type of this.testModifiers) {
        const value = yield this.actor.modifiers.totalFor(type);
        const name = SR5.modifierTypes[type];
        PartsList.AddUniquePart(this.data.modifiers.mod, name, value, true);
      }
    });
  }
  prepareItemModifiers() {
    return __async(this, null, function* () {
    });
  }
  calculateDerivedValues() {
    this.data.values.hits = this.calculateHits();
    this.data.values.extendedHits = this.calculateExtendedHits();
    this.data.values.netHits = this.calculateNetHits();
    this.data.values.glitches = this.calculateGlitches();
    console.log(`Shadowrun 5e | Calculated derived values for ${this.constructor.name}`, this.data);
  }
  get pool() {
    return this.data.pool;
  }
  get limit() {
    return this.data.limit;
  }
  get hasLimit() {
    const applyLimit = game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits);
    return applyLimit && !this.hasPushTheLimit && this.limit.value > 0;
  }
  get hasReducedHits() {
    return this.hits.value > this.limit.value;
  }
  get threshold() {
    return this.data.threshold;
  }
  get hasThreshold() {
    return this.threshold.value > 0;
  }
  calculateNetHits() {
    const hits = this.extended ? this.extendedHits : this.hits;
    const base = this.hasThreshold ? Math.max(hits.value - this.threshold.value, 0) : hits.value;
    const netHits = DefaultValues.valueData({
      label: "SR5.NetHits",
      base
    });
    netHits.value = Helpers.calcTotal(netHits, { min: 0 });
    return netHits;
  }
  get netHits() {
    return this.data.values.netHits;
  }
  calculateHits() {
    const rollHits = this.rolls.reduce((hits2, roll) => hits2 + roll.hits, 0);
    const hits = DefaultValues.valueData({
      label: "SR5.Hits",
      base: this.hasLimit ? Math.min(this.limit.value, rollHits) : rollHits
    });
    hits.value = Helpers.calcTotal(hits, { min: 0 });
    return hits;
  }
  get hits() {
    return this.data.values.hits;
  }
  get extendedHits() {
    return this.data.values.extendedHits || DefaultValues.valueData({ label: "SR5.ExtendedHits" });
  }
  calculateGlitches() {
    const rollGlitches = this.rolls.reduce((glitches2, roll) => glitches2 + roll.glitches, 0);
    const glitches = DefaultValues.valueData({
      label: "SR5.Glitches",
      base: rollGlitches
    });
    glitches.value = Helpers.calcTotal(glitches, { min: 0 });
    return glitches;
  }
  calculateExtendedHits() {
    if (!this.extended)
      return DefaultValues.valueData({ label: "SR5.ExtendedHits" });
    const extendedHits = this.extendedHits;
    extendedHits.mod = PartsList.AddPart(extendedHits.mod, "SR5.Hits", this.hits.value);
    Helpers.calcTotal(extendedHits, { min: 0 });
    return extendedHits;
  }
  get extended() {
    return this.canBeExtended && this.data.extended;
  }
  get canBeExtended() {
    return true;
  }
  get glitches() {
    return this.data.values.glitches;
  }
  get glitched() {
    return TestRules.glitched(this.glitches.value, this.pool.value);
  }
  get criticalGlitched() {
    return TestRules.criticalGlitched(this.success, this.glitched);
  }
  get success() {
    const hits = this.extended ? this.extendedHits : this.hits;
    return TestRules.success(hits.value, this.threshold.value);
  }
  get failure() {
    if (this.extended && this.threshold.value === 0)
      return true;
    if (this.extendedHits.value > 0 && this.threshold.value > 0)
      return this.extendedHits.value < this.threshold.value;
    return !this.success;
  }
  get canSucceed() {
    if (!this.extended)
      return true;
    return this.extended && this.hasThreshold;
  }
  get canFail() {
    return true;
  }
  get successLabel() {
    return "SR5.Success";
  }
  get failureLabel() {
    if (this.extended)
      return "SR5.Results";
    return "SR5.Failure";
  }
  get opposed() {
    return !!this.data.opposed && this.data.opposed.test !== "";
  }
  get opposing() {
    return false;
  }
  get results() {
    if (!this.item)
      return;
    return this.item.getActionResult();
  }
  get hasTargets() {
    return this.targets.length > 0;
  }
  get hasAction() {
    return !foundry.utils.isEmpty(this.data.action);
  }
  get description() {
    const poolPart = this.pool.value;
    const thresholdPart = this.hasThreshold ? `(${this.threshold.value})` : "";
    const limitPart = this.hasLimit ? `[${this.limit.value}]` : "";
    return `${poolPart} ${thresholdPart} ${limitPart}`;
  }
  get hasPushTheLimit() {
    return this.data.pushTheLimit;
  }
  get hasSecondChance() {
    return this.data.secondChance;
  }
  applyPushTheLimit() {
    if (!this.actor)
      return;
    const parts = new PartsList(this.pool.mod);
    if (this.hasPushTheLimit) {
      const edge = this.actor.getEdge().value;
      parts.addUniquePart("SR5.PushTheLimit", edge, true);
    } else {
      parts.removePart("SR5.PushTheLimit");
    }
  }
  applySecondChance() {
    var _a, _b;
    if (!this.actor)
      return;
    const parts = new PartsList(this.pool.mod);
    if (this.hasSecondChance) {
      if (this.glitched) {
        (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.Warnings.CantSecondChanceAGlitch", { localize: true });
        return this;
      }
      const lastRoll = this.rolls[this.rolls.length - 1];
      const dice = lastRoll.poolThrown - lastRoll.hits;
      if (dice <= 0) {
        (_b = ui.notifications) == null ? void 0 : _b.warn("SR5.Warnings.CantSecondChanceWithoutNoneHits", { localize: true });
        return this;
      }
      const parts2 = new PartsList(this.pool.mod);
      parts2.addPart("SR5.SecondChance", dice);
      const formula = `${dice}d6`;
      const roll = new SR5Roll(formula);
      this.rolls.push(roll);
    } else {
      parts.removePart("SR5.SecondChance");
    }
  }
  executeSecondChance() {
    return __async(this, null, function* () {
      var _a;
      console.log(`Shadowrun 5e | ${this.constructor.name} will apply second chance rules`);
      if (!this.data.sourceActorUuid)
        return this;
      if (this.glitched) {
        (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.Warnings.CantSecondChanceAGlitch", { localize: true });
        return this;
      }
      yield this.populateDocuments();
      this.data.secondChance = true;
      this.applySecondChance();
      this.calculateBaseValues();
      const actorConsumedResources = yield this.consumeDocumentRessoucesWhenNeeded();
      if (!actorConsumedResources)
        return this;
      this.data.secondChance = false;
      yield this.evaluate();
      yield this.processResults();
      yield this.toMessage();
      yield this.afterTestComplete();
      return this;
    });
  }
  canConsumeDocumentRessources() {
    var _a;
    if (!this.actor)
      return true;
    if (this.hasPushTheLimit || this.hasSecondChance) {
      if (this.actor.getEdge().uses <= 0) {
        (_a = ui.notifications) == null ? void 0 : _a.error(game.i18n.localize("SR5.MissingRessource.Edge"));
        return false;
      }
    }
    return true;
  }
  consumeDocumentRessources() {
    return __async(this, null, function* () {
      if (!this.actor)
        return true;
      if (this.hasPushTheLimit || this.hasSecondChance) {
        yield this.actor.useEdge();
      }
      return true;
    });
  }
  consumeDocumentRessoucesWhenNeeded() {
    return __async(this, null, function* () {
      const mustHaveRessouces = game.settings.get(SYSTEM_NAME, FLAGS.MustHaveRessourcesOnTest);
      if (mustHaveRessouces) {
        if (!this.canConsumeDocumentRessources())
          return false;
      }
      return yield this.consumeDocumentRessources();
    });
  }
  execute() {
    return __async(this, null, function* () {
      yield this.populateTests();
      yield this.populateDocuments();
      yield this.prepareDocumentModifiers();
      yield this.prepareDocumentData();
      this.alterBaseValues();
      this.prepareBaseValues();
      this.calculateBaseValues();
      const userConsented = yield this.showDialog();
      if (!userConsented)
        return this;
      const actorConsumedResources = yield this.consumeDocumentRessoucesWhenNeeded();
      if (!actorConsumedResources)
        return this;
      this.createRoll();
      yield this.evaluate();
      yield this.processResults();
      yield this.toMessage();
      yield this.afterTestComplete();
      return this;
    });
  }
  processResults() {
    return __async(this, null, function* () {
      if (this.success) {
        yield this.processSuccess();
      } else {
        yield this.processFailure();
      }
    });
  }
  processSuccess() {
    return __async(this, null, function* () {
    });
  }
  processFailure() {
    return __async(this, null, function* () {
    });
  }
  afterTestComplete() {
    return __async(this, null, function* () {
      console.log(`Shadowrun5e | Test ${this.constructor.name} completed.`, this);
      if (this.success) {
        yield this.afterSuccess();
      } else {
        yield this.afterFailure();
      }
      yield this.executeFollowUpTest();
      if (this.extended) {
        yield this.extendCurrentTest();
      }
    });
  }
  afterSuccess() {
    return __async(this, null, function* () {
    });
  }
  afterFailure() {
    return __async(this, null, function* () {
    });
  }
  executeFollowUpTest() {
    return __async(this, null, function* () {
      const test = yield TestCreator.fromFollowupTest(this, this.data.options);
      if (!test)
        return;
      yield test.execute();
    });
  }
  extendCurrentTest() {
    return __async(this, null, function* () {
      var _a;
      if (!this.canBeExtended)
        return;
      const data = foundry.utils.duplicate(this.data);
      if (!data.type)
        return;
      const pool = new PartsList(data.pool.mod);
      const currentModifierValue = pool.getPartValue("SR5.ExtendedTest") || 0;
      const nextModifierValue = TestRules.calcNextExtendedModifier(currentModifierValue);
      if (data.pool.override) {
        data.pool.override.value = Math.max(data.pool.override.value - 1, 0);
      } else {
        pool.addUniquePart("SR5.ExtendedTest", nextModifierValue);
      }
      Helpers.calcTotal(data.pool, { min: 0 });
      if (!TestRules.canExtendTest(data.pool.value, this.threshold.value, this.extendedHits.value)) {
        return (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.Warnings.CantExtendTestFurther", { localize: true });
      }
      const testCls = TestCreator._getTestClass(data.type);
      if (!testCls)
        return;
      const test = new testCls(data, { actor: this.actor, item: this.item }, this.data.options);
      yield this.populateDocuments();
      test.data.pushTheLimit = false;
      test.applyPushTheLimit();
      test.data.secondChance = false;
      test.applySecondChance();
      if (!test.extended) {
        test.data.extended = true;
        test.calculateExtendedHits();
      }
      yield test.execute();
    });
  }
  rollDiceSoNice() {
    return __async(this, null, function* () {
      var _a, _b, _c, _d;
      if (!game.dice3d || !game.user || !game.users)
        return;
      console.log("Shadowrun5e | Initiating DiceSoNice throw");
      const roll = this.rolls[this.rolls.length - 1];
      let whisper = null;
      if (this._applyGmOnlyContent && this.actor) {
        whisper = game.users.filter((user) => {
          var _a2;
          return (_a2 = this.actor) == null ? void 0 : _a2.testUserPermission(user, "OWNER");
        });
      }
      if (((_a = this.data.options) == null ? void 0 : _a.rollMode) === "gmroll" || ((_b = this.data.options) == null ? void 0 : _b.rollMode) === "blindroll") {
        whisper = whisper || [];
        whisper = [...game.users.filter((user) => user.isGM), ...whisper];
      }
      const blind = ((_c = this.data.options) == null ? void 0 : _c.rollMode) === "blindroll";
      const synchronize = ((_d = this.data.options) == null ? void 0 : _d.rollMode) === "publicroll";
      game.dice3d.showForRoll(roll, game.user, synchronize, whisper, blind, this.data.messageUuid);
    });
  }
  toMessage() {
    return __async(this, null, function* () {
      var _a;
      if (!((_a = this.data.options) == null ? void 0 : _a.showMessage))
        return;
      const templateData = this._prepareMessageTemplateData();
      const content = yield renderTemplate(this._chatMessageTemplate, templateData);
      const messageData = this._prepareMessageData(content);
      const options = { rollMode: this._rollMode };
      const message = yield ChatMessage.create(messageData, options);
      if (!message)
        return;
      this.data.messageUuid = message.uuid;
      yield this.rollDiceSoNice();
      return message;
    });
  }
  _prepareMessageTemplateData() {
    var _a, _b;
    const linkedTokens = ((_a = this.actor) == null ? void 0 : _a.getActiveTokens(true)) || [];
    const token = linkedTokens.length >= 1 ? linkedTokens[0] : void 0;
    return {
      title: this.data.title,
      test: this,
      speaker: {
        actor: this.actor,
        token
      },
      item: this.item,
      opposedActions: this._prepareOpposedActionsTemplateData(),
      resultActions: this._prepareResultActionsTemplateData(),
      previewTemplate: this._canPlaceBlastTemplate,
      showDescription: this._canShowDescription,
      description: ((_b = this.item) == null ? void 0 : _b.getChatData()) || "",
      applyGmOnlyContent: this._applyGmOnlyContent
    };
  }
  get _canShowDescription() {
    return true;
  }
  get _canPlaceBlastTemplate() {
    var _a;
    return ((_a = this.item) == null ? void 0 : _a.hasTemplate) || false;
  }
  get _applyGmOnlyContent() {
    const enableFeature = game.settings.get(SYSTEM_NAME, FLAGS.HideGMOnlyChatContent);
    return enableFeature && !!game.user && game.user.isGM && !!this.actor;
  }
  get _opposedTestClass() {
    if (!this.data.opposed || !this.data.opposed.test)
      return;
    return TestCreator._getTestClass(this.data.opposed.test);
  }
  _prepareOpposedActionsTemplateData() {
    const testCls = this._opposedTestClass;
    if (!testCls)
      return [];
    const action = {
      test: testCls.name,
      label: testCls.label
    };
    if (this.data.opposed.mod) {
      action.label += ` ${this.data.opposed.mod}`;
    }
    return [action];
  }
  _prepareResultActionsTemplateData() {
    const actions = [];
    const actionResultData = this.results;
    if (!actionResultData)
      return actions;
    if (actionResultData.success.matrix.placeMarks) {
      actions.push({
        action: "placeMarks",
        label: "SR5.PlaceMarks",
        value: ""
      });
    }
    return actions;
  }
  get _rollMode() {
    var _a, _b;
    return (_b = (_a = this.data.options) == null ? void 0 : _a.rollMode) != null ? _b : game.settings.get("core", "rollmode");
  }
  _prepareMessageData(content) {
    var _a, _b, _c, _d;
    const linkedTokens = ((_a = this.actor) == null ? void 0 : _a.getActiveTokens(true)) || [];
    const token = linkedTokens.length === 1 ? linkedTokens[0].id : void 0;
    const actor = (_b = this.actor) == null ? void 0 : _b.id;
    const alias = (_c = game.user) == null ? void 0 : _c.name;
    const formula = `0d6`;
    const roll = new SR5Roll(formula);
    roll.evaluate({ async: false });
    const messageData = {
      user: (_d = game.user) == null ? void 0 : _d.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      speaker: {
        actor,
        alias,
        token
      },
      roll,
      content,
      flags: {
        [SYSTEM_NAME]: { [FLAGS.Test]: this.toJSON() },
        "core.canPopout": true
      },
      sound: CONFIG.sounds.dice
    };
    ChatMessage.applyRollMode(messageData, this._rollMode);
    return messageData;
  }
  static chatMessageListeners(message, html, data) {
    return __async(this, null, function* () {
      html.find(".show-roll").on("click", this._chatToggleCardRolls);
      html.find(".show-description").on("click", this._chatToggleCardDescription);
      html.find(".chat-document-link").on("click", Helpers.renderEntityLinkSheet);
      html.find(".place-template").on("click", this._placeItemBlastZoneTemplate);
      html.find(".result-action").on("click", this._castResultAction);
      html.find(".chat-select-link").on("click", this._selectSceneToken);
      handleRenderChatMessage(message, html, data);
      yield this._showGmOnlyContent(message, html, data);
    });
  }
  static _showGmOnlyContent(message, html, data) {
    return __async(this, null, function* () {
      var _a;
      const test = yield TestCreator.fromMessage(message.id);
      if (!test)
        return;
      yield test.populateDocuments();
      if (!test.actor || !game.user) {
        html.find(".gm-only-content").removeClass("gm-only-content");
      } else if (game.user.isGM || game.user.isTrusted || ((_a = test.actor) == null ? void 0 : _a.isOwner)) {
        html.find(".gm-only-content").removeClass("gm-only-content");
      }
    });
  }
  static _selectSceneToken(event) {
    return __async(this, null, function* () {
      var _a, _b;
      event.preventDefault();
      event.stopPropagation();
      if (!game || !game.ready || !canvas || !canvas.ready)
        return;
      const selectLink = $(event.currentTarget);
      const tokenId = selectLink.data("tokenId");
      const token = (_a = canvas.tokens) == null ? void 0 : _a.get(tokenId);
      if (token && token instanceof Token) {
        token.control();
      } else {
        (_b = ui.notifications) == null ? void 0 : _b.warn(game.i18n.localize("SR5.NoSelectableToken"));
      }
    });
  }
  static chatLogListeners(chatLog, html, data) {
    return __async(this, null, function* () {
      html.find(".chat-message").each((index, element) => __async(this, null, function* () {
        var _a;
        element = $(element);
        const id = element.data("messageId");
        const message = (_a = game.messages) == null ? void 0 : _a.get(id);
        if (!message)
          return;
        yield this.chatMessageListeners(message, element, message.toObject());
      }));
    });
  }
  static _placeItemBlastZoneTemplate(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      const element = $(event.currentTarget);
      const card = element.closest(".chat-message");
      const messageId = card.data("messageId");
      const test = yield TestCreator.fromMessage(messageId);
      if (!test)
        return;
      yield test.populateDocuments();
      if (!test.item)
        return;
      const template = Template.fromItem(test.item);
      if (!template)
        return;
      yield template.drawPreview();
    });
  }
  static chatMessageContextOptions(html, options) {
    const secondChance = (li) => __async(this, null, function* () {
      const messageId = li.data().messageId;
      const test = yield TestCreator.fromMessage(messageId);
      if (!test)
        return console.error("Shadowrun 5e | Could not restore test from message");
      yield test.executeSecondChance();
    });
    const extendTest = (li) => __async(this, null, function* () {
      var _a;
      const messageId = li.data().messageId;
      const test = yield TestCreator.fromMessage(messageId);
      if (!test)
        return console.error("Shadowrun 5e | Could not restore test from message");
      if (!test.canBeExtended) {
        return (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.Warnings.CantExtendTest", { localize: true });
      }
      yield test.extendCurrentTest();
    });
    const deleteOption = options.pop();
    options.push({
      name: game.i18n.localize("SR5.SecondChance"),
      callback: secondChance,
      condition: true,
      icon: '<i class="fas fa-meteor"></i>'
    });
    options.push({
      name: game.i18n.localize("SR5.Extend"),
      callback: extendTest,
      condition: true,
      icon: '<i class="fas fa-clock"></i>'
    });
    options.push(deleteOption);
    return options;
  }
  static _chatToggleCardRolls(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      const card = $(event.currentTarget).closest(".chat-card");
      const element = card.find(".dice-rolls");
      if (element.is(":visible"))
        element.slideUp(200);
      else
        element.slideDown(200);
    });
  }
  static _chatToggleCardDescription(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      const card = $(event.currentTarget).closest(".chat-card");
      const element = card.find(".card-description");
      if (element.is(":visible"))
        element.slideUp(200);
      else
        element.slideDown(200);
    });
  }
  static _castResultAction(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      const element = $(event.currentTarget);
      const resultAction = element.data("action");
      const messageId = element.closest(".chat-message").data("messageId");
      const test = yield TestCreator.fromMessage(messageId);
      if (!test)
        return console.error(`Shadowrun5e | Couldn't find both a result action ('${resultAction}') and extract test from message ('${messageId}')`);
      yield test.populateDocuments();
      yield ActionResultFlow.executeResult(resultAction, test);
    });
  }
};

// src/module/tests/OpposedTest.ts
var OpposedTest = class extends SuccessTest {
  constructor(data, documents, options) {
    super(data, documents, options);
    const AgainstCls = data.against ? TestCreator._getTestClass(data.against.type) : SuccessTest;
    this.against = new AgainstCls(data.against || {});
  }
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    delete data.opposed;
    delete data.targetActorsUuid;
    return data;
  }
  populateDocuments() {
    return __async(this, null, function* () {
      yield __superGet(OpposedTest.prototype, this, "populateDocuments").call(this);
      yield this.against.populateDocuments();
    });
  }
  static _getOpposedActionTestData(againstData, actor, previousMessageId) {
    return __async(this, null, function* () {
      if (!againstData.opposed) {
        console.error(`Shadowrun 5e | Supplied test data doesn't contain an opposed action`, againstData, this);
        return;
      }
      if (againstData.opposed.type !== "") {
        console.warn(`Shadowrun 5e | Supplied test defines a opposed test type ${againstData.opposed.type} but only type '' is supported`, this);
      }
      if (!actor) {
        console.error(`Shadowrun 5e | Can't resolve opposed test values due to missing actor`, this);
        return;
      }
      const data = {
        title: againstData.opposed.description || void 0,
        previousMessageId,
        pool: DefaultValues.valueData({ label: "SR5.DicePool" }),
        limit: DefaultValues.valueData({ label: "SR5.Limit" }),
        threshold: DefaultValues.valueData({ label: "SR5.Threshold" }),
        values: {},
        sourceItemUuid: againstData.sourceItemUuid,
        against: againstData
      };
      data.threshold.base = againstData.values.netHits.value;
      let action = DefaultValues.actionData();
      action = TestCreator._mergeMinimalActionDataInOrder(action, againstData.opposed, this._getDefaultTestAction());
      if (againstData.sourceItemUuid) {
        const item = yield fromUuid(againstData.sourceItemUuid);
        if (item) {
          const itemAction = yield this._getDocumentTestAction(item, actor);
          action = TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
        }
      }
      return yield this._prepareActionTestData(action, actor, data);
    });
  }
  get opposed() {
    return false;
  }
  get opposing() {
    return true;
  }
  get canBeExtended() {
    return false;
  }
  get _canShowDescription() {
    return false;
  }
  get _canPlaceBlastTemplate() {
    return false;
  }
  prepareItemModifiers() {
    return __async(this, null, function* () {
      if (!this.item)
        return;
      const opposedMod = this.item.getOpposedTestMod();
      for (const modifier of opposedMod.list) {
        PartsList.AddUniquePart(this.data.modifiers.mod, modifier.name, modifier.value, true);
      }
    });
  }
  static _castOpposedAction(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const button = $(event.currentTarget);
      const card = button.closest(".chat-message");
      const messageId = card.data("messageId");
      const opposedActionTest = button.data("action");
      const showDialog = !TestCreator.shouldHideDialog(event);
      yield TestCreator.fromMessageAction(messageId, opposedActionTest, { showDialog });
    });
  }
  static chatMessageListeners(message, html, data) {
    return __async(this, null, function* () {
      html.find(".opposed-action").on("click", OpposedTest._castOpposedAction);
    });
  }
};

// src/module/tests/DefenseTest.ts
var DefenseTest = class extends OpposedTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    const damage = data.against ? data.against.damage : DefaultValues.damageData();
    data.incomingDamage = foundry.utils.duplicate(damage);
    data.modifiedDamage = foundry.utils.duplicate(damage);
    return data;
  }
  get _chatMessageTemplate() {
    return "systems/shadowrun5e/dist/templates/rolls/defense-test-message.html";
  }
  get successLabel() {
    return "SR5.AttackDodged";
  }
  get failureLabel() {
    return "SR5.AttackHits";
  }
  get hasChangedInitiative() {
    return this.data.iniMod !== void 0;
  }
  get initiativeModifier() {
    return this.data.iniMod || 0;
  }
};

// src/module/tests/PhysicalDefenseTest.ts
var PhysicalDefenseTest = class extends DefenseTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.cover = 0;
    data.activeDefense = "";
    data.activeDefenses = {};
    data.isMeleeAttack = false;
    data.defenseReach = 0;
    return data;
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/physical-defense-test-dialog.html";
  }
  static _getDefaultTestAction() {
    return DefaultValues.minimalActionData({
      "attribute": "reaction",
      "attribute2": "intuition"
    });
  }
  get testModifiers() {
    return ["global", "wounds", "defense"];
  }
  prepareDocumentData() {
    return __async(this, null, function* () {
      this.prepareActiveDefense();
      this.prepareMeleeReach();
      yield __superGet(PhysicalDefenseTest.prototype, this, "prepareDocumentData").call(this);
    });
  }
  prepareActiveDefense() {
    var _a, _b, _c;
    if (!this.actor)
      return;
    const actor = this.actor;
    this.data.activeDefenses = {
      full_defense: {
        label: "SR5.FullDefense",
        value: (_a = actor.getFullDefenseAttribute()) == null ? void 0 : _a.value,
        initMod: -10
      },
      dodge: {
        label: "SR5.Dodge",
        value: (_b = actor.findActiveSkill("gymnastics")) == null ? void 0 : _b.value,
        initMod: -5
      },
      block: {
        label: "SR5.Block",
        value: (_c = actor.findActiveSkill("unarmed_combat")) == null ? void 0 : _c.value,
        initMod: -5
      }
    };
    const equippedMeleeWeapons = actor.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
    equippedMeleeWeapons.forEach((weapon) => {
      var _a2;
      this.data.activeDefenses[`parry-${weapon.name}`] = {
        label: "SR5.Parry",
        weapon: weapon.name || "",
        value: (_a2 = actor.findActiveSkill(weapon.getActionSkill())) == null ? void 0 : _a2.value,
        initMod: -5
      };
    });
  }
  prepareMeleeReach() {
    if (!this.against.item)
      return;
    this.data.isMeleeAttack = this.against.item.isMeleeWeapon();
    if (!this.data.isMeleeAttack)
      return;
    if (!this.actor)
      return;
    const equippedMeleeWeapons = this.actor.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
    equippedMeleeWeapons.forEach((weapon) => {
      this.data.defenseReach = Math.max(this.data.defenseReach, weapon.getReach());
    });
    const attackData = this.against.data;
    const incomingReach = attackData.reach || 0;
    const defenseReach = this.data.defenseReach;
    this.data.defenseReach = MeleeRules.defenseReachModifier(incomingReach, defenseReach);
  }
  calculateBaseValues() {
    super.calculateBaseValues();
    this.applyIniModFromActiveDefense();
  }
  applyPoolModifiers() {
    this.applyPoolCoverModifier();
    this.applyPoolActiveDefenseModifier();
    this.applyPoolMeleeReachModifier();
    this.applyPoolRangedFireModModifier();
    super.applyPoolModifiers();
  }
  applyPoolCoverModifier() {
    this.data.cover = foundry.utils.getType(this.data.cover) === "string" ? Number(this.data.cover) : this.data.cover;
    PartsList.AddUniquePart(this.data.modifiers.mod, "SR5.Cover", this.data.cover);
  }
  applyPoolActiveDefenseModifier() {
    const defense = this.data.activeDefenses[this.data.activeDefense] || { label: "SR5.ActiveDefense", value: 0, init: 0 };
    PartsList.AddUniquePart(this.data.modifiers.mod, "SR5.ActiveDefense", defense.value);
  }
  applyPoolMeleeReachModifier() {
    if (!this.data.isMeleeAttack)
      return;
    PartsList.AddUniquePart(this.data.modifiers.mod, "SR5.WeaponReach", this.data.defenseReach);
  }
  applyPoolRangedFireModModifier() {
    if (!this.against.item)
      return;
    if (!this.against.item.isRangedWeapon())
      return;
    const fireMode = this.against.item.getLastFireMode();
    if (!fireMode.defense)
      return;
    PartsList.AddUniquePart(this.data.modifiers.mod, fireMode.label, Number(fireMode.defense));
  }
  get success() {
    return CombatRules.attackMisses(this.against.hits.value, this.hits.value);
  }
  get failure() {
    return CombatRules.attackHits(this.against.hits.value, this.hits.value);
  }
  processSuccess() {
    return __async(this, null, function* () {
      this.data.modifiedDamage = CombatRules.modifyDamageAfterMiss(this.data.incomingDamage);
      yield __superGet(PhysicalDefenseTest.prototype, this, "processSuccess").call(this);
    });
  }
  processFailure() {
    return __async(this, null, function* () {
      this.data.modifiedDamage = CombatRules.modifyDamageAfterHit(this.against.hits.value, this.hits.value, this.data.incomingDamage);
      yield __superGet(PhysicalDefenseTest.prototype, this, "processFailure").call(this);
    });
  }
  afterFailure() {
    return __async(this, null, function* () {
      const test = yield TestCreator.fromOpposedTestResistTest(this, this.data.options);
      if (!test)
        return;
      yield test.execute();
    });
  }
  canConsumeDocumentRessources() {
    var _a;
    if (this.actor && this.data.iniMod && game.combat) {
      const combat = game.combat;
      const combatant = combat.getActorCombatant(this.actor);
      if (combatant && combatant.initiative + this.data.iniMod < 0) {
        (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.MissingRessource.Initiative", { localize: true });
        return false;
      }
    }
    return super.canConsumeDocumentRessources();
  }
  applyIniModFromActiveDefense() {
    if (!this.actor)
      return;
    if (!this.data.activeDefense)
      return;
    const activeDefense = this.data.activeDefenses[this.data.activeDefense];
    if (!activeDefense)
      return;
    this.data.iniMod = activeDefense.initMod;
  }
  _prepareResultActionsTemplateData() {
    const actions = super._prepareResultActionsTemplateData();
    if (!this.data.activeDefense)
      return actions;
    const activeDefense = this.data.activeDefenses[this.data.activeDefense];
    if (!activeDefense)
      return actions;
    actions.push({
      action: "modifyCombatantInit",
      label: "SR5.Initiative",
      value: String(activeDefense.initMod)
    });
    return actions;
  }
};

// src/module/item/flows/ActionResultFlow.ts
var ActionResultFlow = class {
  static get _handlersResultAction() {
    const handlers = /* @__PURE__ */ new Map();
    handlers.set("placeMarks", () => {
      var _a;
      return (_a = ui.notifications) == null ? void 0 : _a.error("Placing marks currently isnt suported. Sorry!");
    });
    handlers.set("modifyCombatantInit", ActionResultFlow._castInitModifierAction);
    return handlers;
  }
  static executeResult(resultAction, test) {
    return __async(this, null, function* () {
      const handler = ActionResultFlow._handlersResultAction.get(resultAction);
      if (!handler)
        return console.error(`Shadowrun 5e | Action result ${resultAction} has not handler registered`);
      yield handler(test);
    });
  }
  static placeMatrixMarks(active, targets, marks) {
    return __async(this, null, function* () {
      var _a;
      if (!MatrixRules.isValidMarksCount(marks)) {
        return (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.Warnings.InvalidMarksCount"));
      }
      for (const target of targets) {
        yield active.setMarks(target, marks);
      }
    });
  }
  static _castInitModifierAction(test) {
    return __async(this, null, function* () {
      var _a;
      if (!(test instanceof PhysicalDefenseTest))
        return;
      if (!test.data.iniMod)
        return;
      yield (_a = test.actor) == null ? void 0 : _a.changeCombatInitiative(test.data.iniMod);
    });
  }
};

// src/module/chat.ts
function createChatMessage(template, templateData) {
  return __async(this, null, function* () {
    const chatData = yield createChatData(template, templateData);
    const message = yield ChatMessage.create(chatData);
    if (!message)
      return null;
    return message;
  });
}
var createChatData = (template, templateData) => __async(void 0, null, function* () {
  var _a, _b, _c, _d;
  const html = yield renderTemplate(template, templateData);
  const chatData = {
    user: (_a = game.user) == null ? void 0 : _a.id,
    speaker: {
      actor: (_b = templateData.actor) == null ? void 0 : _b.id,
      token: (_c = templateData.token) == null ? void 0 : _c.id,
      alias: (_d = game.user) == null ? void 0 : _d.name
    },
    item: templateData.item,
    content: html,
    rollMode: game.settings.get(CORE_NAME, CORE_FLAGS.RollMode)
  };
  ChatMessage.applyRollMode(chatData, chatData.rollMode);
  return chatData;
});
function createItemChatMessage(options) {
  return __async(this, null, function* () {
    const templateData = createChatTemplateData(options);
    return yield createChatMessage("systems/shadowrun5e/dist/templates/rolls/item-card.html", templateData);
  });
}
function createChatTemplateData(options) {
  let { actor, item, description, tests } = options;
  const token = actor == null ? void 0 : actor.getToken();
  const title = game.i18n.localize("SR5.Description");
  return {
    title,
    actor,
    token,
    item,
    description,
    tests
  };
}
var handleRenderChatMessage = (app, html, data) => {
  html.on("click", ".apply-damage", (event) => chatMessageActionApplyDamage(html, event));
};
var chatMessageActionApplyDamage = (html, event) => __async(void 0, null, function* () {
  var _a;
  event.stopPropagation();
  event.preventDefault();
  const applyDamage = $(event.currentTarget);
  const value = Number(applyDamage.data("damageValue"));
  const type = String(applyDamage.data("damageType"));
  const ap = Number(applyDamage.data("damageAp"));
  const element = String(applyDamage.data("damageElement"));
  let damage = Helpers.createDamageData(value, type, ap, element);
  let actors = Helpers.getSelectedActorsOrCharacter();
  if (actors.length === 0) {
    const messageId = html.data("messageId");
    const test = yield TestCreator.fromMessage(messageId);
    if (!test)
      return;
    yield test.populateDocuments();
    if (test.hasTargets)
      test.targets.forEach((target) => actors.push(target.actor));
    else
      actors.push(test.actor);
  }
  if (actors.length === 0) {
    (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.Warnings.TokenSelectionNeeded"));
    return;
  }
  yield new DamageApplicationFlow().runApplyDamage(actors, damage);
});

// src/module/item/ChatData.ts
var ChatData = {
  action: (data, labels, props) => {
    if (data.action) {
      const labelStringList = [];
      if (data.action.skill) {
        labelStringList.push(Helpers.label(data.action.skill));
        labelStringList.push(Helpers.label(data.action.attribute));
      } else if (data.action.attribute2) {
        labelStringList.push(Helpers.label(data.action.attribute));
        labelStringList.push(Helpers.label(data.action.attribute2));
      } else if (data.action.attribute) {
        labelStringList.push(Helpers.label(data.action.attribute));
      }
      if (data.action.mod) {
        labelStringList.push(`${game.i18n.localize("SR5.ItemMod")} (${data.action.mod})`);
      }
      if (labelStringList.length) {
        labels.roll = labelStringList.join(" + ");
      }
      if (data.action.opposed.type) {
        const { opposed } = data.action;
        if (opposed.type !== "custom")
          labels.opposedRoll = `vs. ${Helpers.label(opposed.type)}`;
        else if (opposed.skill)
          labels.opposedRoll = `vs. ${Helpers.label(opposed.skill)}+${Helpers.label(opposed.attribute)}`;
        else if (opposed.attribute2)
          labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}+${Helpers.label(opposed.attribute2)}`;
        else if (opposed.attribute)
          labels.opposedRoll = `vs. ${Helpers.label(opposed.attribute)}`;
      }
      if (data.action.type !== "" && data.action.type !== "varies" && data.action.type !== "none") {
        props.push(`${Helpers.label(data.action.type)} Action`);
      }
      if (data.action.limit) {
        const { limit } = data.action;
        const attribute = limit.attribute ? `${game.i18n.localize(SR5.limits[limit.attribute])}` : "";
        const limitVal = limit.value ? limit.value : "";
        let limitStr = "";
        if (attribute) {
          limitStr += attribute;
        }
        if (limitVal) {
          if (attribute) {
            limitStr += " + ";
          }
          limitStr += limitVal;
        }
        if (limitStr) {
          props.push(`Limit ${limitStr}`);
        }
      }
      if (data.action.damage.type.value) {
        const { damage } = data.action;
        let damageString = "";
        let elementString = "";
        const attribute = damage.attribute ? `${game.i18n.localize(SR5.attributes[damage.attribute])} + ` : "";
        if (damage.value || attribute) {
          const type = damage.type.value ? damage.type.value.toUpperCase().charAt(0) : "";
          damageString = `DV ${attribute}${damage.value}${type}`;
        }
        if (damage.element.value) {
          if (damage.value) {
            if (damage.element.value === "electricity") {
              damageString += " (e)";
            } else {
              elementString = Helpers.label(damage.element.value);
            }
          } else {
            elementString = Helpers.label(damage.element.value);
          }
        }
        if (damageString)
          props.push(damageString);
        if (elementString)
          props.push(elementString);
        if (damage.ap && damage.ap.value)
          props.push(`AP ${damage.ap.value}`);
      }
    }
  },
  sin: (data, labels, props) => {
    props.push(`Rating ${data.technology.rating}`);
    data.licenses.forEach((license) => {
      props.push(`${license.name} R${license.rtg}`);
    });
  },
  contact: (data, labels, props) => {
    props.push(data.type);
    props.push(`${game.i18n.localize("SR5.Connection")} ${data.connection}`);
    props.push(`${game.i18n.localize("SR5.Loyalty")} ${data.loyalty}`);
    if (data.blackmail) {
      props.push(`${game.i18n.localize("SR5.Blackmail")}`);
    }
    if (data.family) {
      props.push(game.i18n.localize("SR5.Family"));
    }
  },
  lifestyle: (data, labels, props) => {
    props.push(Helpers.label(data.type));
    if (data.cost)
      props.push(`\xA5${data.cost}`);
    if (data.comforts)
      props.push(`Comforts ${data.comforts}`);
    if (data.security)
      props.push(`Security ${data.security}`);
    if (data.neighborhood)
      props.push(`Neighborhood ${data.neighborhood}`);
    if (data.guests)
      props.push(`Guests ${data.guests}`);
  },
  adept_power: (data, labels, props) => {
    ChatData.action(data, labels, props);
    props.push(`PP ${data.pp}`);
    props.push(Helpers.label(data.type));
  },
  armor: (data, labels, props) => {
    if (data.armor) {
      if (data.armor.value)
        props.push(`Armor ${data.armor.mod ? "+" : ""}${data.armor.value}`);
      if (data.armor.acid)
        props.push(`Acid ${data.armor.acid}`);
      if (data.armor.cold)
        props.push(`Cold ${data.armor.cold}`);
      if (data.armor.fire)
        props.push(`Fire ${data.armor.fire}`);
      if (data.armor.electricity)
        props.push(`Electricity ${data.armor.electricity}`);
      if (data.armor.radiation)
        props.push(`Radiation ${data.armor.radiation}`);
    }
  },
  ammo: (data, labels, props) => {
    if (data.damageType)
      props.push(`${game.i18n.localize("SR5.DamageType")} ${data.damageType}`);
    if (data.damage)
      props.push(`${game.i18n.localize("SR5.DamageValue")} ${data.damage}`);
    if (data.element)
      props.push(`${game.i18n.localize("SR5.Element")} ${data.element}`);
    if (data.ap)
      props.push(`${game.i18n.localize("SR5.AP")} ${data.ap}`);
    if (data.blast.radius)
      props.push(`${game.i18n.localize("SR5.BlastRadius")} ${data.blast.radius}m`);
    if (data.blast.dropoff)
      props.push(`${game.i18n.localize("SR5.Dropoff")} ${data.blast.dropoff}/m`);
  },
  program: (data, labels, props) => {
    props.push(game.i18n.localize(SR5.programTypes[data.type]));
  },
  complex_form: (data, labels, props) => {
    ChatData.action(data, labels, props);
    props.push(Helpers.label(data.target), Helpers.label(data.duration));
    const { fade } = data;
    if (fade > 0)
      props.push(`Fade L+${fade}`);
    else if (fade < 0)
      props.push(`Fade L${fade}`);
    else
      props.push("Fade L");
  },
  cyberware: (data, labels, props) => {
    ChatData.action(data, labels, props);
    ChatData.armor(data, labels, props);
    if (data.essence)
      props.push(`Ess ${data.essence}`);
  },
  bioware: (data, labels, props) => {
    ChatData.action(data, labels, props);
    ChatData.armor(data, labels, props);
    if (data.essence)
      props.push(`Ess ${data.essence}`);
  },
  device: (data, labels, props) => {
    if (data.technology && data.technology.rating)
      props.push(`Rating ${data.technology.rating}`);
    if (data.category === "cyberdeck") {
      for (const attN of Object.values(data.atts)) {
        props.push(`${Helpers.label(attN.att)} ${attN.value}`);
      }
    }
  },
  equipment: (data, labels, props) => {
    if (data.technology && data.technology.rating)
      props.push(`Rating ${data.technology.rating}`);
  },
  quality: (data, labels, props) => {
    ChatData.action(data, labels, props);
    props.push(Helpers.label(data.type));
  },
  sprite_power: (data, labels, props) => {
    ChatData.action(data, labels, props);
  },
  critter_power: (data, labels, props) => {
    props.push(game.i18n.localize(SR5.critterPower.types[data.powerType]));
    props.push(game.i18n.localize(SR5.critterPower.durations[data.duration]));
    props.push(game.i18n.localize(SR5.critterPower.ranges[data.range]));
    ChatData.action(data, labels, props);
  },
  spell: (data, labels, props) => {
    props.push(Helpers.label(data.category), Helpers.label(data.type));
    if (data.category === "combat") {
      props.push(Helpers.label(data.combat.type));
    } else if (data.category === "health") {
    } else if (data.category === "illusion") {
      props.push(data.illusion.type);
      props.push(data.illusion.sense);
    } else if (data.category === "manipulation") {
      if (data.manipulation.damaging)
        props.push("Damaging");
      if (data.manipulation.mental)
        props.push("Mental");
      if (data.manipulation.environmental)
        props.push("Environmental");
      if (data.manipulation.physical)
        props.push("Physical");
    } else if (data.category === "detection") {
      props.push(data.illusion.type);
      props.push(data.illusion.passive ? "Passive" : "Active");
      if (data.illusion.extended)
        props.push("Extended");
    }
    props.push(Helpers.label(data.range));
    ChatData.action(data, labels, props);
    props.push(Helpers.label(data.duration));
    const { drain } = data;
    if (drain > 0)
      props.push(`Drain F+${drain}`);
    else if (drain < 0)
      props.push(`Drain F${drain}`);
    else
      props.push("Drain F");
    labels.roll = "Cast";
  },
  weapon: (data, labels, props, item) => {
    var _a, _b, _c;
    ChatData.action(data, labels, props);
    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (prop.includes("Limit")) {
        props[i] = prop.replace("Limit", "Accuracy");
      }
    }
    const equippedAmmo = item.getEquippedAmmo();
    if (equippedAmmo && data.ammo && ((_a = data.ammo.current) == null ? void 0 : _a.max)) {
      if (equippedAmmo) {
        const ammoData = equippedAmmo.data.data;
        const { current, spare_clips } = data.ammo;
        if (equippedAmmo.name)
          props.push(`${equippedAmmo.name} (${current.value}/${current.max})`);
        if (ammoData.blast.radius)
          props.push(`${game.i18n.localize("SR5.BlastRadius")} ${ammoData.blast.radius}m`);
        if (ammoData.blast.dropoff)
          props.push(`${game.i18n.localize("SR5.Dropoff")} $ammoData.blast.dropoff}/m`);
        if (spare_clips && spare_clips.max)
          props.push(`${game.i18n.localize("SR5.SpareClips")} (${spare_clips.value}/${spare_clips.max})`);
      }
    }
    if ((_c = (_b = data.technology) == null ? void 0 : _b.conceal) == null ? void 0 : _c.value) {
      props.push(`${game.i18n.localize("SR5.Conceal")} ${data.technology.conceal.value}`);
    }
    if (data.category === "range") {
      if (data.range.rc) {
        let rcString = `${game.i18n.localize("SR5.RecoilCompensation")} ${data.range.rc.value}`;
        if (item == null ? void 0 : item.actor) {
          rcString += ` (${game.i18n.localize("SR5.Total")} ${item.actor.getRecoilCompensation()})`;
        }
        props.push(rcString);
      }
      if (data.range.modes) {
        const newModes = [];
        const { modes } = data.range;
        if (modes.single_shot)
          newModes.push("SR5.WeaponModeSingleShotShort");
        if (modes.semi_auto)
          newModes.push("SR5.WeaponModeSemiAutoShort");
        if (modes.burst_fire)
          newModes.push("SR5.WeaponModeBurstFireShort");
        if (modes.full_auto)
          newModes.push("SR5.WeaponModeFullAutoShort");
        props.push(newModes.map((m) => game.i18n.localize(m)).join("/"));
      }
      if (data.range.ranges)
        props.push(Array.from(Object.values(data.range.ranges)).join("/"));
    } else if (data.category === "melee") {
      if (data.melee.reach) {
        const reachString = `${game.i18n.localize("SR5.Reach")} ${data.melee.reach}`;
        const accIndex = props.findIndex((p) => p.includes("Accuracy"));
        if (accIndex > -1) {
          props.splice(accIndex + 1, 0, reachString);
        } else {
          props.push(reachString);
        }
      }
    } else if (data.category === "thrown") {
      const { blast } = data.thrown;
      if (blast == null ? void 0 : blast.radius)
        props.push(`${game.i18n.localize("SR5.BlastRadius")} ${blast.radius}m`);
      if (blast == null ? void 0 : blast.dropoff)
        props.push(`${game.i18n.localize("SR5.Dropoff")} ${blast.dropoff}/m`);
      if (data.thrown.ranges) {
        const mult = data.thrown.ranges.attribute && (item == null ? void 0 : item.actor) ? item.actor.data.data.attributes[data.thrown.ranges.attribute].value : 1;
        const ranges = [data.thrown.ranges.short, data.thrown.ranges.medium, data.thrown.ranges.long, data.thrown.ranges.extreme];
        props.push(ranges.map((v) => v * mult).join("/"));
      }
    }
    const equippedMods = item.getEquippedMods();
    if (equippedMods) {
      equippedMods.forEach((mod) => {
        props.push(`${mod.name}`);
      });
    }
  }
};

// src/module/sockets.ts
var SocketMessage = class {
  static _createMessage(type, data, userId) {
    return { type, data, userId };
  }
  static emit(type, data) {
    return __async(this, null, function* () {
      if (!game.socket)
        return;
      const message = SocketMessage._createMessage(type, data);
      console.trace("Shadowrun 5e | Emiting Shadowrun5e system socket message", message);
      yield game.socket.emit(SYSTEM_SOCKET, message);
    });
  }
  static emitForGM(type, data) {
    return __async(this, null, function* () {
      if (!game.socket || !game.user || !game.users)
        return;
      if (game.user.isGM)
        return console.error("Active user is GM! Aborting socket message...");
      const gmUser = game.users.find((user) => user.isGM);
      if (!gmUser)
        return console.error("No active GM user! One GM must be active for this action to work.");
      const message = SocketMessage._createMessage(type, data, gmUser.id);
      console.trace("Shadowrun 5e | Emiting Shadowrun5e system socket message", message);
      yield game.socket.emit(SYSTEM_SOCKET, message);
    });
  }
};

// src/module/item/flows/NetworkDeviceFlow.ts
var NetworkDeviceFlow = class {
  static buildLink(target) {
    return target.uuid;
  }
  static resolveLink(link) {
    if (!link)
      return;
    let parts = link.split(".");
    let doc;
    if (parts[0] === "Compendium") {
      parts.shift();
      const [scope, packName, id] = parts.slice(0, 3);
      parts = parts.slice(3);
      const pack = game.packs.get(`${scope}.${packName}`);
      if (!pack)
        return;
      doc = pack.getDocument(id);
    } else {
      const [docName, docId] = parts.slice(0, 2);
      parts = parts.slice(2);
      const collection = CONFIG[docName].collection.instance;
      doc = collection.get(docId);
    }
    while (doc && parts.length > 1) {
      const [embeddedName, embeddedId] = parts.slice(0, 2);
      doc = doc.getEmbeddedDocument(embeddedName, embeddedId);
      parts = parts.slice(2);
    }
    return doc || null;
  }
  static emitAddNetworkControllerSocketMessage(controller, networkDevice) {
    return __async(this, null, function* () {
      const controllerLink = NetworkDeviceFlow.buildLink(controller);
      const networkDeviceLink = NetworkDeviceFlow.buildLink(networkDevice);
      yield SocketMessage.emitForGM(FLAGS.addNetworkController, { controllerLink, networkDeviceLink });
    });
  }
  static _handleAddNetworkControllerSocketMessage(message) {
    return __async(this, null, function* () {
      var _a;
      console.log("Shadowrun 5e | Handle add network controller socket message", message);
      if (!((_a = game.user) == null ? void 0 : _a.isGM))
        return console.error(`Shadowrun 5e | Abort handling of message. Current user isn't a GM`, game.user);
      const controller = NetworkDeviceFlow.resolveLink(message.data.controllerLink);
      const device = NetworkDeviceFlow.resolveLink(message.data.networkDeviceLink);
      if (!controller || !device)
        return console.error("Shadowrun 5e | Either the networks controller or device did not resolve.");
      yield NetworkDeviceFlow._handleAddDeviceToNetwork(controller, device);
    });
  }
  static addDeviceToNetwork(controller, device) {
    return __async(this, null, function* () {
      var _a;
      console.log(`Shadowrun5e | Adding an the item ${device.name} to the controller ${controller.name}`, controller, device);
      if (controller.id === device.id)
        return console.warn("Shadowrun 5e | A device cant be its own network controller");
      const technologyData = device.getTechnologyData();
      if (!technologyData)
        return (_a = ui.notifications) == null ? void 0 : _a.error(game.i18n.localize("SR5.Errors.CanOnlyAddTechnologyItemsToANetwork"));
      if (!controller.canBeNetworkController)
        return;
      if (NetworkDeviceFlow._currentUserCanModifyDevice(controller) && NetworkDeviceFlow._currentUserCanModifyDevice(device))
        yield NetworkDeviceFlow._handleAddDeviceToNetwork(controller, device);
      else
        yield NetworkDeviceFlow.emitAddNetworkControllerSocketMessage(controller, device);
    });
  }
  static _handleAddDeviceToNetwork(controller, device) {
    return __async(this, null, function* () {
      if (!NetworkDeviceFlow._currentUserCanModifyDevice(controller) && !NetworkDeviceFlow._currentUserCanModifyDevice(device))
        return console.error(`User isn't owner or GM of this device`, controller);
      const controllerData = controller.asDevice() || controller.asHostData();
      if (!controllerData)
        return console.error(`Device isn't capable of accepting network devices`, controller);
      const technologyData = device.getTechnologyData();
      if (!technologyData)
        return console.error(`'Device can't be added to a network`);
      if (technologyData.networkController)
        yield NetworkDeviceFlow._removeDeviceFromController(device);
      const controllerLink = NetworkDeviceFlow.buildLink(controller);
      yield NetworkDeviceFlow._setControllerFromLink(device, controllerLink);
      const networkDeviceLink = NetworkDeviceFlow.buildLink(device);
      const networkDevices = controllerData.data.networkDevices;
      if (networkDevices.includes(networkDeviceLink))
        return;
      return NetworkDeviceFlow._setDevicesOnController(controller, [...networkDevices, networkDeviceLink]);
    });
  }
  static removeDeviceFromController(device) {
    return __async(this, null, function* () {
      if (!device)
        return;
      console.log(`Shadowrun 5e | Removing device ${device.name} from it's controller`);
      yield NetworkDeviceFlow._removeDeviceFromController(device);
      yield NetworkDeviceFlow._removeControllerFromDevice(device);
    });
  }
  static removeDeviceLinkFromNetwork(controller, deviceLink) {
    return __async(this, null, function* () {
      console.log(`Shadowrun 5e | Removing device with uuid ${deviceLink} from network`);
      const controllerData = controller.asController();
      const device = NetworkDeviceFlow.resolveLink(deviceLink);
      if (device) {
        const technologyData = device.getTechnologyData();
        if (technologyData)
          yield NetworkDeviceFlow._removeControllerFromDevice(device);
      }
      if (!controllerData)
        return;
      const deviceLinks = controllerData.data.networkDevices.filter((existingLink) => existingLink !== deviceLink);
      yield NetworkDeviceFlow._setDevicesOnController(controller, deviceLinks);
    });
  }
  static removeAllDevicesFromNetwork(controller) {
    return __async(this, null, function* () {
      console.log(`Shadowrun 5e | Removing all devices from network ${controller.name}`);
      yield NetworkDeviceFlow._removeControllerFromAllDevices(controller);
      yield NetworkDeviceFlow._removeAllDevicesFromController(controller);
    });
  }
  static _setControllerFromLink(device, controllerLink) {
    return __async(this, null, function* () {
      if (!device.canBeNetworkDevice)
        return console.error("Shadowrun 5e | Given device cant be part of a network", device);
      yield device.update({ "data.technology.networkController": controllerLink });
    });
  }
  static _removeControllerFromDevice(device) {
    return __async(this, null, function* () {
      if (!device.canBeNetworkDevice)
        return console.error("Shadowrun 5e | Given device cant be part of a network", device);
      if (!NetworkDeviceFlow._currentUserCanModifyDevice(device))
        return;
      yield device.update({ "data.technology.networkController": "" });
    });
  }
  static _setDevicesOnController(controller, deviceLinks) {
    return __async(this, null, function* () {
      if (!controller.canBeNetworkController)
        return console.error("Shadowrun 5e | Given device cant control a network", controller);
      yield controller.update({ "data.networkDevices": deviceLinks });
    });
  }
  static _removeAllDevicesFromController(controller) {
    return __async(this, null, function* () {
      if (!controller.canBeNetworkController)
        return console.error("Shadowrun 5e | Given device cant control a network", controller);
      yield controller.update({ "data.networkDevices": [] });
    });
  }
  static _removeDeviceFromController(device) {
    return __async(this, null, function* () {
      if (!device.canBeNetworkDevice)
        return console.error("Shadowrun 5e | Given device cant be part of a network", device);
      const technologyData = device.getTechnologyData();
      if (!technologyData)
        return;
      const controller = NetworkDeviceFlow.resolveLink(technologyData.networkController);
      if (!controller)
        return;
      if (!NetworkDeviceFlow._currentUserCanModifyDevice(controller))
        return;
      const controllerData = controller.asController();
      if (!controllerData)
        return;
      const deviceLink = NetworkDeviceFlow.buildLink(device);
      const deviceLinks = controllerData.data.networkDevices.filter((existingLink) => existingLink !== deviceLink);
      yield NetworkDeviceFlow._setDevicesOnController(controller, deviceLinks);
    });
  }
  static _removeControllerFromAllDevices(controller) {
    return __async(this, null, function* () {
      if (!controller.canBeNetworkController)
        return console.error("Shadowrun 5e | Given device cant control a network", controller);
      const controllerData = controller.asController();
      if (!controllerData)
        return;
      const networkDevices = controllerData.data.networkDevices;
      if (networkDevices) {
        const devices = networkDevices.map((deviceLink) => NetworkDeviceFlow.resolveLink(deviceLink));
        for (const device of devices) {
          if (!device)
            continue;
          yield NetworkDeviceFlow._removeControllerFromDevice(device);
        }
      }
    });
  }
  static getNetworkDevices(controller) {
    const devices = [];
    const controllerData = controller.asController();
    if (!controllerData)
      return devices;
    controllerData.data.networkDevices.forEach((link) => {
      const device = NetworkDeviceFlow.resolveLink(link);
      if (!device)
        return console.warn(`Shadowrun5e | Controller ${controller.name} has a network device ${link} that doesn't exist anymore`);
      devices.push(device);
    });
    return devices;
  }
  static handleOnDeleteItem(item, data, id) {
    return __async(this, null, function* () {
      console.log(`Shadowrun 5e | Checking for network on deleted item ${item.name}`, item);
      if (item.canBeNetworkController)
        return yield NetworkDeviceFlow._removeControllerFromAllDevices(item);
      if (item.canBeNetworkDevice)
        return yield NetworkDeviceFlow._removeDeviceFromController(item);
    });
  }
  static _currentUserCanModifyDevice(device) {
    var _a;
    return ((_a = game.user) == null ? void 0 : _a.isGM) || device.isOwner;
  }
};

// src/module/item/prep/HostPrep.ts
function HostDataPreparation(system) {
  HostPrep.setDeviceCategory(system);
  HostPrep.prepareMatrixAttributes(system);
}
var HostPrep = class {
  static setDeviceCategory(system) {
    system.category = "host";
  }
  static prepareMatrixAttributes(system) {
    const hostAttributeRatings = MatrixRules.hostMatrixAttributeRatings(system.rating);
    Object.values(system.atts).forEach((attribute) => {
      attribute.value = hostAttributeRatings.pop();
      attribute.editable = false;
    });
  }
};

// src/module/item/SR5Item.ts
var _SR5Item = class extends Item {
  constructor() {
    super(...arguments);
    this.labels = {};
  }
  get actor() {
    return super.actor;
  }
  get actorOwner() {
    if (!this.actor)
      return;
    if (this.actor instanceof SR5Actor)
      return this.actor;
    return this.actor.actorOwner;
  }
  get wrapper() {
    return new SR5ItemDataWrapper(this.data);
  }
  getLastFireMode() {
    return this.getFlag(SYSTEM_NAME, FLAGS.LastFireMode) || DefaultValues.fireModeData();
  }
  setLastFireMode(fireMode) {
    return __async(this, null, function* () {
      return this.setFlag(SYSTEM_NAME, FLAGS.LastFireMode, fireMode);
    });
  }
  getLastSpellForce() {
    return this.getFlag(SYSTEM_NAME, FLAGS.LastSpellForce) || { value: 0 };
  }
  setLastSpellForce(force) {
    return __async(this, null, function* () {
      return this.setFlag(SYSTEM_NAME, FLAGS.LastSpellForce, force);
    });
  }
  getLastComplexFormLevel() {
    return this.getFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel) || { value: 0 };
  }
  setLastComplexFormLevel(level) {
    return __async(this, null, function* () {
      return this.setFlag(SYSTEM_NAME, FLAGS.LastComplexFormLevel, level);
    });
  }
  getLastFireRangeMod() {
    return this.getFlag(SYSTEM_NAME, FLAGS.LastFireRange) || { value: 0 };
  }
  setLastFireRangeMod(environmentalMod) {
    return __async(this, null, function* () {
      return this.setFlag(SYSTEM_NAME, FLAGS.LastFireRange, environmentalMod);
    });
  }
  getNestedItems() {
    let items = this.getFlag(SYSTEM_NAME, FLAGS.EmbeddedItems);
    items = items ? items : [];
    if (items && !Array.isArray(items)) {
      items = Helpers.convertIndexedObjectToArray(items);
    }
    items = items.map((item) => {
      if (item.effects && !Array.isArray(item.effects)) {
        item.effects = Helpers.convertIndexedObjectToArray(item.effects);
      }
      return item;
    });
    return items;
  }
  setNestedItems(items) {
    return __async(this, null, function* () {
      yield this.setFlag(SYSTEM_NAME, FLAGS.EmbeddedItems, items);
    });
  }
  clearNestedItems() {
    return __async(this, null, function* () {
      yield this.unsetFlag(SYSTEM_NAME, FLAGS.EmbeddedItems);
    });
  }
  get hasOpposedRoll() {
    const action = this.getAction();
    if (!action)
      return false;
    return !!action.opposed.test;
  }
  get hasRoll() {
    const action = this.getAction();
    return !!(action && action.type !== "" && (action.skill || action.attribute || action.attribute2 || action.dice_pool_mod));
  }
  get hasTemplate() {
    return this.isAreaOfEffect();
  }
  prepareData() {
    var _a;
    super.prepareData();
    this.prepareNestedItems();
    this.labels = {};
    if (this.type === "sin") {
      if (typeof this.system.licenses === "object") {
        this.system.licenses = Object.values(this.system.licenses);
      }
    }
    const equippedMods = this.getEquippedMods();
    const equippedAmmo = this.getEquippedAmmo();
    const technology = this.getTechnologyData();
    if (technology) {
      if (technology.condition_monitor === void 0) {
        technology.condition_monitor = { value: 0, max: 0, label: "" };
      }
      const rating = typeof technology.rating === "string" ? 0 : technology.rating;
      technology.condition_monitor.max = 8 + Math.ceil(rating / 2);
      if (!technology.conceal)
        technology.conceal = { base: 0, value: 0, mod: [] };
      const concealParts = new PartsList();
      equippedMods.forEach((mod) => {
        const technology2 = mod.getTechnologyData();
        if (technology2 && technology2.conceal.value) {
          concealParts.addUniquePart(mod.name, technology2.conceal.value);
        }
      });
      technology.conceal.mod = concealParts.list;
      technology.conceal.value = Helpers.calcTotal(technology.conceal);
    }
    const action = this.getAction();
    if (action) {
      action.alt_mod = 0;
      action.limit.mod = [];
      action.damage.mod = [];
      action.damage.ap.mod = [];
      action.dice_pool_mod = [];
      if (action.damage.base_formula_operator === "+") {
        action.damage.base_formula_operator = "add";
      }
      if ((_a = this.actor) == null ? void 0 : _a.data) {
        action.damage.source = {
          actorId: this.actor.id,
          itemId: this.id,
          itemName: this.name,
          itemType: this.type
        };
      }
      const limitParts = new PartsList(action.limit.mod);
      const dpParts = new PartsList(action.dice_pool_mod);
      equippedMods.forEach((mod) => {
        const modification = mod.asModificationData();
        if (!modification)
          return;
        if (modification.system.accuracy)
          limitParts.addUniquePart(mod.name, modification.system.accuracy);
        if (modification.system.dice_pool)
          dpParts.addUniquePart(mod.name, modification.system.dice_pool);
      });
      if (equippedAmmo) {
        const ammoData = equippedAmmo.system;
        action.damage.mod = PartsList.AddUniquePart(action.damage.mod, equippedAmmo.name, ammoData.damage);
        action.damage.ap.mod = PartsList.AddUniquePart(action.damage.ap.mod, equippedAmmo.name, ammoData.ap);
        if (ammoData.element) {
          action.damage.element.value = ammoData.element;
        } else {
          action.damage.element.value = action.damage.element.base;
        }
        if (ammoData.damageType) {
          action.damage.type.value = ammoData.damageType;
        } else {
          action.damage.type.value = action.damage.type.base;
        }
      } else {
        action.damage.element.value = action.damage.element.base;
        action.damage.type.value = action.damage.type.base;
      }
      action.damage.value = Helpers.calcTotal(action.damage);
      action.damage.ap.value = Helpers.calcTotal(action.damage.ap);
      action.limit.value = Helpers.calcTotal(action.limit);
    }
    const range = this.getWeaponRange();
    if (range) {
      if (range.rc) {
        const rangeParts = new PartsList();
        equippedMods.forEach((mod) => {
          if (mod.system.rc)
            rangeParts.addUniquePart(mod.name, mod.system.rc);
        });
        range.rc.mod = rangeParts.list;
        if (range.rc)
          range.rc.value = Helpers.calcTotal(range.rc);
      }
    }
    const adeptPower = this.asAdeptPowerData();
    if (adeptPower) {
      adeptPower.system.type = adeptPower.system.action.type ? "active" : "passive";
    }
    switch (this.type) {
      case "host":
        HostDataPreparation(this.system);
    }
  }
  postItemCard() {
    return __async(this, null, function* () {
      const tests = this.getActionTests();
      const options = {
        actor: this.actor,
        description: this.getChatData(),
        item: this,
        previewTemplate: this.hasTemplate,
        tests
      };
      return yield createItemChatMessage(options);
    });
  }
  castAction(event) {
    return __async(this, null, function* () {
      const dontRollTest = TestCreator.shouldPostItemDescription(event) || !this.hasRoll;
      if (dontRollTest)
        return yield this.postItemCard();
      if (!this.actor)
        return;
      const showDialog = !TestCreator.shouldHideDialog(event);
      const test = yield TestCreator.fromItem(this, this.actor, { showDialog });
      if (!test)
        return;
      yield test.execute();
    });
  }
  getChatData(htmlOptions = {}) {
    const system = duplicate(this.system);
    const { labels } = this;
    if (!system.description)
      system.description = {};
    if (!system.description.value)
      system.description.value = "";
    system.description.value = TextEditor.enrichHTML(system.description.value, __spreadProps(__spreadValues({}, htmlOptions), { async: false }));
    const props = [];
    const func = ChatData[this.type];
    if (func)
      func(duplicate(system), labels, props, this);
    system.properties = props.filter((p) => !!p);
    return system;
  }
  getActionTestName() {
    const testName = this.getRollName();
    return testName ? testName : game.i18n.localize("SR5.Action");
  }
  getOpposedTestMod() {
    const parts = new PartsList();
    if (this.hasOpposedTest()) {
      if (this.isAreaOfEffect()) {
        parts.addUniquePart("SR5.Aoe", -2);
      }
    }
    return parts;
  }
  getBlastData(actionTestData) {
    if (this.isSpell() && this.isAreaOfEffect()) {
      const system = this.system;
      let distance = this.getLastSpellForce().value;
      if (actionTestData == null ? void 0 : actionTestData.spell) {
        distance = actionTestData.spell.force;
      }
      if (system.extended)
        distance *= 10;
      const dropoff = 0;
      return {
        radius: distance,
        dropoff
      };
    } else if (this.isGrenade()) {
      const system = this.system;
      const distance = system.thrown.blast.radius;
      const dropoff = system.thrown.blast.dropoff;
      return {
        radius: distance,
        dropoff
      };
    } else if (this.hasExplosiveAmmo()) {
      const ammo = this.getEquippedAmmo();
      const ammoData = ammo.asAmmoData();
      if (!ammoData)
        return { radius: 0, dropoff: 0 };
      const distance = ammoData.system.blast.radius;
      const dropoff = ammoData.system.blast.dropoff;
      return {
        radius: distance,
        dropoff
      };
    }
  }
  getEquippedAmmo() {
    const equippedAmmos = (this.items || []).filter((item) => item.isAmmo() && item.isEquipped());
    return equippedAmmos[0];
  }
  getEquippedMods() {
    return (this.items || []).filter((item) => item.isWeaponModification() && item.isEquipped());
  }
  hasExplosiveAmmo() {
    const ammo = this.getEquippedAmmo();
    if (!ammo)
      return false;
    const system = ammo.system;
    return system.blast.radius > 0;
  }
  equipWeaponMod(iid) {
    return __async(this, null, function* () {
      yield this.equipNestedItem(iid, "modification", { unequipOthers: false, toggle: true });
    });
  }
  hasAmmo(rounds = 0) {
    return this.ammoLeft >= rounds;
  }
  get ammoLeft() {
    const ammo = this.wrapper.getAmmo();
    if (!ammo)
      return 0;
    return ammo.current.value;
  }
  useAmmo(fired) {
    return __async(this, null, function* () {
      if (this.type !== "weapon")
        return;
      const value = Math.max(0, this.system.ammo.current.value - fired);
      return yield this.update({ "system.ammo.current.value": value });
    });
  }
  reloadAmmo() {
    return __async(this, null, function* () {
      var _a;
      if (this.type !== "weapon")
        return;
      const updateData = {};
      const diff = this.system.ammo.current.max - this.system.ammo.current.value;
      updateData["system.ammo.current.value"] = this.system.ammo.current.max;
      if (this.system.ammo.current.spare_clips) {
        updateData["system.ammo.current.value"] = Math.max(0, this.system.ammo.spare_clips.value - 1);
      }
      yield this.update(updateData);
      const newAmmunition = (this.items || []).filter((i) => i.type === "ammo").reduce((acc, item) => {
        var _a2;
        if (item.data && item.data.system.technology.equipped) {
          const itemData = item.toObject();
          const qty = typeof itemData.system.technology.quantity === "string" ? 0 : itemData.system.technology.quantity;
          if (qty - diff < 0) {
            (_a2 = ui.notifications) == null ? void 0 : _a2.warn("SR5.Warnings.CantConsumeEquippedAmmo", { localize: true });
          }
          itemData.system.technology.quantity = Math.max(0, qty - diff);
          acc.push(itemData);
        }
        return acc;
      }, []);
      if (newAmmunition && newAmmunition.length) {
        yield this.updateNestedItems(newAmmunition);
        (_a = ui.notifications) == null ? void 0 : _a.info("SR5.Infos.ConsumedEquippedAmmo", { localize: true });
      }
    });
  }
  equipNestedItem(_0, _1) {
    return __async(this, arguments, function* (id, type, options = {}) {
      const unequipOthers = options.unequipOthers || false;
      const toggle = options.toggle || false;
      const updateData = [];
      const ammoItems = this.items.filter((item) => item.type === type);
      for (const item of ammoItems) {
        if (!unequipOthers && item.id !== id)
          continue;
        const equip = toggle ? !item.system.technology.equipped : id === item.id;
        updateData.push({ _id: item.id, "system.technology.equipped": equip });
      }
      if (updateData)
        yield this.updateNestedItems(updateData);
    });
  }
  equipAmmo(id) {
    return __async(this, null, function* () {
      yield this.equipNestedItem(id, "ammo", { unequipOthers: true });
    });
  }
  addNewLicense() {
    return __async(this, null, function* () {
      if (this.type !== "sin")
        return;
      const licenses = foundry.utils.getType(this.system.licenses) === "Object" ? Object.values(this.system.licenses) : this.system.licenses;
      licenses.push({
        name: "",
        rtg: "",
        description: ""
      });
      yield this.update({ "system.licenses": licenses });
    });
  }
  getRollPartsList() {
    const action = this.getAction();
    if (!action || !this.actor)
      return [];
    const parts = new PartsList(duplicate(this.getModifierList()));
    const skill = this.actor.findActiveSkill(this.getActionSkill());
    const attribute = this.actor.findAttribute(this.getActionAttribute());
    const attribute2 = this.actor.findAttribute(this.getActionAttribute2());
    if (attribute && attribute.label)
      parts.addPart(attribute.label, attribute.value);
    if (skill) {
      parts.addUniquePart(skill.label || skill.name, skill.value);
      SkillFlow.handleDefaulting(skill, parts);
    } else if (attribute2 && attribute2.label) {
      parts.addPart(attribute2.label, attribute2.value);
    }
    const spec = this.getActionSpecialization();
    if (spec)
      parts.addUniquePart(spec, 2);
    const mod = parseInt(this.system.action.mod || 0);
    if (mod)
      parts.addUniquePart("SR5.ItemMod", mod);
    const atts = [];
    if (attribute !== void 0)
      atts.push(attribute);
    if (attribute2 !== void 0)
      atts.push(attribute2);
    if (skill !== void 0)
      atts.push(skill);
    this.actor._addGlobalParts(parts);
    this.actor._addMatrixParts(parts, atts);
    this._addWeaponParts(parts);
    return parts.list;
  }
  calculateRecoil() {
    var _a;
    const lastFireMode = this.getLastFireMode();
    if (!lastFireMode)
      return 0;
    if (lastFireMode.value === 20)
      return 0;
    return Math.min(this.getRecoilCompensation(true) - (((_a = this.getLastFireMode()) == null ? void 0 : _a.value) || 0), 0);
  }
  _addWeaponParts(parts) {
    if (this.isRangedWeapon()) {
      const recoil = this.calculateRecoil();
      if (recoil)
        parts.addUniquePart("SR5.Recoil", recoil);
    }
  }
  isSin() {
    return this.wrapper.isSin();
  }
  asSinData() {
    if (this.isSin()) {
      return this.data;
    }
  }
  isLifestyle() {
    return this.wrapper.isLifestyle();
  }
  asLifestyleData() {
    if (this.isLifestyle()) {
      return this.data;
    }
  }
  isAmmo() {
    return this.wrapper.isAmmo();
  }
  asAmmoData() {
    if (this.isAmmo()) {
      return this.data;
    }
  }
  isModification() {
    return this.wrapper.isModification();
  }
  asModificationData() {
    if (this.isModification()) {
      return this.data;
    }
  }
  isWeaponModification() {
    return this.wrapper.isWeaponModification();
  }
  isArmorModification() {
    return this.wrapper.isArmorModification();
  }
  isProgram() {
    return this.wrapper.isProgram();
  }
  asProgramData() {
    if (this.isProgram()) {
      return this.data;
    }
  }
  isQuality() {
    return this.wrapper.isQuality();
  }
  asQualityData() {
    if (this.isQuality()) {
      return this.data;
    }
  }
  isAdeptPower() {
    return this.type === "adept_power";
  }
  asAdeptPowerData() {
    if (this.isAdeptPower())
      return this.data;
  }
  isHost() {
    return this.type === "host";
  }
  asHostData() {
    if (this.isHost()) {
      return this.data;
    }
  }
  removeLicense(index) {
    return __async(this, null, function* () {
      if (this.type !== "sin")
        return;
      const licenses = this.system.licenses.splice(index, 1);
      yield this.update({ "system.licenses": licenses });
    });
  }
  isAction() {
    return this.wrapper.isAction();
  }
  asActionData() {
    if (this.isAction()) {
      return this.data;
    }
  }
  rollOpposedTest(target, attack, event) {
    return __async(this, null, function* () {
      console.error(`Shadowrun5e | ${this.constructor.name}.rollOpposedTest is not supported anymore`);
    });
  }
  rollTestType(type, attack, event, target) {
    return __async(this, null, function* () {
      if (type === "opposed") {
        yield this.rollOpposedTest(target, attack, event);
      }
      if (type === "action") {
        yield this.castAction(event);
      }
    });
  }
  static getItemFromMessage(html) {
    var _a;
    if (!game || !game.scenes || !game.ready || !canvas || !canvas.ready || !canvas.scene)
      return;
    const card = html.find(".chat-card");
    let actor;
    const sceneTokenId = card.data("tokenId");
    if (sceneTokenId)
      actor = Helpers.getSceneTokenActor(sceneTokenId);
    else
      actor = (_a = game.actors) == null ? void 0 : _a.get(card.data("actorId"));
    if (!actor)
      return;
    const itemId = card.data("itemId");
    return actor.items.get(itemId);
  }
  static getTargets() {
    if (!game.ready || !game.user)
      return;
    const { character } = game.user;
    const { controlled } = canvas.tokens;
    const targets = controlled.reduce((arr, t) => t.actor ? arr.concat([t.actor]) : arr, []);
    if (character && controlled.length === 0)
      targets.push(character);
    if (!targets.length)
      throw new Error(`You must designate a specific Token as the roll target`);
    return targets;
  }
  getActionTests() {
    if (!this.hasRoll)
      return [];
    return [{
      label: this.getActionTestName(),
      type: "action"
    }];
  }
  getActionResult() {
    if (!this.isAction())
      return;
    return this.wrapper.getActionResult();
  }
  createNestedItem(_0) {
    return __async(this, arguments, function* (itemData, options = {}) {
      if (!Array.isArray(itemData))
        itemData = [itemData];
      if (this.type === "weapon") {
        const currentItems = duplicate(this.getNestedItems());
        itemData.forEach((ogItem) => {
          var _a, _b;
          const item = duplicate(ogItem);
          item._id = randomID(16);
          if (item.type === "ammo" || item.type === "modification") {
            if ((_b = (_a = item == null ? void 0 : item.system) == null ? void 0 : _a.technology) == null ? void 0 : _b.equipped) {
              item.system.technology.equipped = false;
            }
            currentItems.push(item);
          }
        });
        yield this.setNestedItems(currentItems);
      }
      this.prepareNestedItems();
      this.prepareData();
      this.render(false);
      return true;
    });
  }
  prepareNestedItems() {
    this.items = this.items || [];
    const items = this.getNestedItems();
    if (!items)
      return;
    const loaded = this.items.reduce((object, item) => {
      object[item.id] = item;
      return object;
    }, {});
    const tempItems = items.map((item) => {
      const data = game.user ? { ownership: { [game.user.id]: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER } } : {};
      item = mergeObject(item, data);
      if (item._id in loaded) {
        const currentItem = loaded[item._id];
        currentItem.updateSource(item);
        currentItem.prepareData();
        return currentItem;
      } else {
        return new _SR5Item(item, { parent: this });
      }
    });
    this.items = tempItems;
  }
  getOwnedItem(itemId) {
    const items = this.items;
    if (!items)
      return;
    return items.find((item) => item.id === itemId);
  }
  updateNestedItems(changes) {
    return __async(this, null, function* () {
      const items = duplicate(this.getNestedItems());
      if (!items)
        return;
      changes = Array.isArray(changes) ? changes : [changes];
      if (!changes || changes.length === 0)
        return;
      changes.forEach((itemChanges) => {
        const index = items.findIndex((i) => i._id === itemChanges._id);
        if (index === -1)
          return;
        const item = items[index];
        delete itemChanges._id;
        if (item) {
          itemChanges = expandObject(itemChanges);
          mergeObject(item, itemChanges);
          items[index] = item;
        }
      });
      yield this.setNestedItems(items);
      this.prepareNestedItems();
      this.prepareData();
      this.render(false);
      return true;
    });
  }
  updateEmbeddedEntity(embeddedName, data, options) {
    return __async(this, null, function* () {
      yield this.updateNestedItems(data);
      return this;
    });
  }
  deleteOwnedItem(deleted) {
    return __async(this, null, function* () {
      const items = duplicate(this.getNestedItems());
      if (!items)
        return;
      const idx = items.findIndex((i) => i._id === deleted || Number(i._id) === deleted);
      if (idx === -1)
        throw new Error(`Shadowrun5e | Couldn't find owned item ${deleted}`);
      items.splice(idx, 1);
      yield this.clearNestedItems();
      yield this.setNestedItems(items);
      yield this.prepareNestedItems();
      yield this.prepareData();
      yield this.render(false);
      return true;
    });
  }
  openPdfSource() {
    return __async(this, null, function* () {
      var _a, _b;
      if (!ui["pdfpager"]) {
        (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.DIALOG.MissingModuleContent", { localize: true });
        return;
      }
      const source = this.getBookSource();
      if (source === "") {
        (_b = ui.notifications) == null ? void 0 : _b.error("SR5.SourceFieldEmptyError", { localize: true });
      }
      const [code, page] = source.split(" ");
      ui.pdfpager.openPDFByCode(code, { page: parseInt(page) });
    });
  }
  _canDealDamage() {
    const action = this.getAction();
    if (!action)
      return false;
    return !!action.damage.type.base;
  }
  getAction() {
    return this.wrapper.getAction();
  }
  getExtended() {
    const action = this.getAction();
    if (!action)
      return false;
    return action.extended;
  }
  getTechnologyData() {
    return this.wrapper.getTechnology();
  }
  getRange() {
    return this.wrapper.getRange();
  }
  getWeaponRange() {
    if (this.isRangedWeapon())
      return this.getRange();
  }
  getRollName() {
    if (this.isRangedWeapon()) {
      return game.i18n.localize("SR5.RangeWeaponAttack");
    }
    if (this.isMeleeWeapon()) {
      return game.i18n.localize("SR5.MeleeWeaponAttack");
    }
    if (this.isCombatSpell()) {
      return game.i18n.localize("SR5.SpellAttack");
    }
    if (this.isSpell()) {
      return game.i18n.localize("SR5.SpellCast");
    }
    if (this.hasRoll) {
      return this.name;
    }
    return DEFAULT_ROLL_NAME;
  }
  isAreaOfEffect() {
    return this.wrapper.isAreaOfEffect();
  }
  isArmor() {
    return this.wrapper.isArmor();
  }
  asArmorData() {
    if (this.isArmor()) {
      return this.data;
    }
  }
  hasArmorBase() {
    return this.wrapper.hasArmorBase();
  }
  hasArmorAccessory() {
    return this.wrapper.hasArmorAccessory();
  }
  hasArmor() {
    return this.wrapper.hasArmor();
  }
  isGrenade() {
    return this.wrapper.isGrenade();
  }
  isWeapon() {
    return this.wrapper.isWeapon();
  }
  asWeapon() {
    if (this.wrapper.isWeapon()) {
      return this.data;
    }
  }
  isCyberware() {
    return this.wrapper.isCyberware();
  }
  asCyberware() {
    if (this.isCyberware()) {
      return this.data;
    }
  }
  isCombatSpell() {
    return this.wrapper.isCombatSpell();
  }
  isDirectCombatSpell() {
    return this.wrapper.isDirectCombatSpell();
  }
  isIndirectCombatSpell() {
    return this.wrapper.isIndirectCombatSpell();
  }
  isManaSpell() {
    return this.wrapper.isManaSpell();
  }
  isPhysicalSpell() {
    return this.wrapper.isPhysicalSpell();
  }
  isRangedWeapon() {
    return this.wrapper.isRangedWeapon();
  }
  isSpell() {
    return this.wrapper.isSpell();
  }
  asSpell() {
    if (this.isSpell()) {
      return this.data;
    }
  }
  isSpritePower() {
    return this.wrapper.isSpritePower();
  }
  asSpritePower() {
    if (this.isSpritePower()) {
      return this.data;
    }
  }
  isBioware() {
    return this.wrapper.isBioware();
  }
  isComplexForm() {
    return this.wrapper.isComplexForm();
  }
  asComplexForm() {
    if (this.isComplexForm()) {
      return this.data;
    }
  }
  isContact() {
    return this.wrapper.isContact();
  }
  asContact() {
    if (this.isContact()) {
      return this.data;
    }
  }
  isCritterPower() {
    return this.wrapper.isCritterPower();
  }
  asCritterPower() {
    if (this.isCritterPower()) {
      return this.data;
    }
  }
  isMeleeWeapon() {
    return this.wrapper.isMeleeWeapon();
  }
  isDevice() {
    return this.wrapper.isDevice();
  }
  asDevice() {
    if (this.isDevice()) {
      return this.data;
    }
  }
  asController() {
    return this.asHostData() || this.asDevice() || void 0;
  }
  isEquipment() {
    return this.wrapper.isEquipment();
  }
  asEquipment() {
    if (this.isEquipment()) {
      return this.data;
    }
  }
  isEquipped() {
    return this.wrapper.isEquipped();
  }
  isCyberdeck() {
    return this.wrapper.isCyberdeck();
  }
  isCommlink() {
    return this.wrapper.isCommlink();
  }
  isMatrixAction() {
    return this.wrapper.isMatrixAction();
  }
  getBookSource() {
    return this.wrapper.getBookSource();
  }
  getConditionMonitor() {
    return this.wrapper.getConditionMonitor();
  }
  getRating() {
    return this.wrapper.getRating();
  }
  getArmorValue() {
    return this.wrapper.getArmorValue();
  }
  getArmorElements() {
    return this.wrapper.getArmorElements();
  }
  getEssenceLoss() {
    return this.wrapper.getEssenceLoss();
  }
  getASDF() {
    return this.wrapper.getASDF();
  }
  getActionSkill() {
    return this.wrapper.getActionSkill();
  }
  getActionAttribute() {
    return this.wrapper.getActionAttribute();
  }
  getActionAttribute2() {
    return this.wrapper.getActionAttribute2();
  }
  getModifierList() {
    return this.wrapper.getModifierList();
  }
  getActionSpecialization() {
    return this.wrapper.getActionSpecialization();
  }
  get getDrain() {
    return this.wrapper.getDrain();
  }
  getFade() {
    return this.wrapper.getFade();
  }
  getRecoilCompensation(includeActor = true) {
    let rc = this.wrapper.getRecoilCompensation();
    if (includeActor && this.actor) {
      rc += this.actor.getRecoilCompensation();
    }
    return rc;
  }
  getReach() {
    var _a;
    if (this.isMeleeWeapon()) {
      const system = this.system;
      return (_a = system.melee.reach) != null ? _a : 0;
    }
    return 0;
  }
  getCondition() {
    const technology = this.getTechnologyData();
    if (technology && "condition_monitor" in technology)
      return technology.condition_monitor;
  }
  hasOpposedTest() {
    if (!this.hasOpposedRoll)
      return false;
    const action = this.getAction();
    if (!action)
      return false;
    return action.opposed.test !== "";
  }
  addIC(id, pack = null) {
    return __async(this, null, function* () {
      var _a;
      const hostData = this.asHostData();
      if (!hostData || !id)
        return;
      const actor = pack ? yield Helpers.getEntityFromCollection(pack, id) : (_a = game.actors) == null ? void 0 : _a.get(id);
      if (!actor || !actor.isIC()) {
        console.error(`Provided actor id ${id} doesn't exist (with pack collection '${pack}') or isn't an IC type`);
        return;
      }
      const icData = actor.asIC();
      if (!icData)
        return;
      const sourceEntity = DefaultValues.sourceEntityData({
        id: actor.id,
        name: actor.name,
        type: "Actor",
        pack,
        data: { icType: icData.data.icType }
      });
      hostData.data.ic.push(sourceEntity);
      yield this.update({ "data.ic": hostData.data.ic });
    });
  }
  removeIC(index) {
    return __async(this, null, function* () {
      if (isNaN(index) || index < 0)
        return;
      const hostData = this.asHostData();
      if (!hostData)
        return;
      if (hostData.data.ic.length <= index)
        return;
      hostData.data.ic.splice(index, 1);
      yield this.update({ "data.ic": hostData.data.ic });
    });
  }
  get _isNestedItem() {
    return this.hasOwnProperty("parent") && this.parent instanceof _SR5Item;
  }
  updateNestedItem(data) {
    return __async(this, null, function* () {
      var _a;
      if (!this.parent || this.parent instanceof SR5Actor)
        return this;
      data._id = this.id;
      yield this.parent.updateNestedItems(data);
      yield (_a = this.sheet) == null ? void 0 : _a.render(false);
      return this;
    });
  }
  update(data, options) {
    return __async(this, null, function* () {
      if (this._isNestedItem) {
        return this.updateNestedItem(data);
      }
      return yield __superGet(_SR5Item.prototype, this, "update").call(this, data, options);
    });
  }
  setMarks(target, marks, options) {
    return __async(this, null, function* () {
      if (!canvas.ready)
        return;
      if (!this.isHost()) {
        console.error("Only Host item types can place matrix marks!");
        return;
      }
      const scene = (options == null ? void 0 : options.scene) || canvas.scene;
      const item = options == null ? void 0 : options.item;
      const markId = Helpers.buildMarkId(scene.id, target.id, item == null ? void 0 : item.id);
      const hostData = this.asHostData();
      if (!hostData)
        return;
      const currentMarks = (options == null ? void 0 : options.overwrite) ? 0 : this.getMarksById(markId);
      hostData.data.marks[markId] = MatrixRules.getValidMarksCount(currentMarks + marks);
      yield this.update({ "data.marks": hostData.data.marks });
    });
  }
  getMarksById(markId) {
    const hostData = this.asHostData();
    return hostData ? hostData.data.marks[markId] : 0;
  }
  getAllMarks() {
    const hostData = this.asHostData();
    if (!hostData)
      return;
    return hostData.data.marks;
  }
  getMarks(target, item, options) {
    if (!canvas.ready)
      return 0;
    if (!this.isHost())
      return 0;
    const scene = (options == null ? void 0 : options.scene) || canvas.scene;
    item = item || target.getMatrixDevice();
    const markId = Helpers.buildMarkId(scene.id, target.id, item == null ? void 0 : item.id);
    const hostData = this.asHostData();
    if (!hostData)
      return 0;
    return hostData.data.marks[markId] || 0;
  }
  clearMarks() {
    return __async(this, null, function* () {
      if (!this.isHost())
        return;
      const hostData = this.asHostData();
      if (!hostData)
        return;
      const updateData = {};
      for (const markId of Object.keys(hostData.data.marks)) {
        updateData[`-=${markId}`] = null;
      }
      yield this.update({ "data.marks": updateData });
    });
  }
  clearMark(markId) {
    return __async(this, null, function* () {
      if (!this.isHost())
        return;
      const updateData = {};
      updateData[`-=${markId}`] = null;
      yield this.update({ "data.marks": updateData });
    });
  }
  addNetworkDevice(target) {
    return __async(this, null, function* () {
      yield NetworkDeviceFlow.addDeviceToNetwork(this, target);
    });
  }
  addNetworkController(target) {
    return __async(this, null, function* () {
      yield this.addNetworkDevice(target);
    });
  }
  removeNetworkDevice(index) {
    return __async(this, null, function* () {
      const controllerData = this.asController();
      if (!controllerData)
        return;
      if (controllerData.data.networkDevices[index] === void 0)
        return;
      const networkDeviceLink = controllerData.data.networkDevices[index];
      const controller = this;
      return yield NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, networkDeviceLink);
    });
  }
  removeAllNetworkDevices() {
    return __async(this, null, function* () {
      const controllerData = this.asController();
      if (!controllerData)
        return;
      return yield NetworkDeviceFlow.removeAllDevicesFromNetwork(this);
    });
  }
  getAllMarkedDocuments() {
    if (!this.isHost())
      return [];
    const marks = this.getAllMarks();
    if (!marks)
      return [];
    return Object.entries(marks).filter(([markId, marks2]) => Helpers.isValidMarkId(markId)).map(([markId, marks2]) => __spreadProps(__spreadValues({}, Helpers.getMarkIdDocuments(markId)), {
      marks: marks2,
      markId
    }));
  }
  get networkController() {
    const technologyData = this.getTechnologyData();
    if (!technologyData)
      return;
    if (!technologyData.networkController)
      return;
    return NetworkDeviceFlow.resolveLink(technologyData.networkController);
  }
  get networkDevices() {
    const controllerData = this.asDevice() || this.asHostData();
    if (!controllerData)
      return [];
    return NetworkDeviceFlow.getNetworkDevices(this);
  }
  get canBeNetworkController() {
    return this.isDevice() || this.isHost();
  }
  get canBeNetworkDevice() {
    const technologyData = this.getTechnologyData();
    return !!technologyData;
  }
  disconnectFromNetwork() {
    return __async(this, null, function* () {
      if (this.canBeNetworkController)
        yield NetworkDeviceFlow.removeAllDevicesFromNetwork(this);
      if (this.canBeNetworkDevice)
        yield NetworkDeviceFlow.removeDeviceFromController(this);
    });
  }
  _onCreate(changed, options, user) {
    return __async(this, null, function* () {
      const applyData = {};
      Helpers.injectActionTestsIntoChangeData(this.type, changed, applyData);
      yield __superGet(_SR5Item.prototype, this, "_preCreate").call(this, changed, options, user);
      if (!foundry.utils.isEmpty(applyData))
        this.update(applyData);
    });
  }
  _preUpdate(changed, options, user) {
    return __async(this, null, function* () {
      Helpers.injectActionTestsIntoChangeData(this.type, changed, changed);
      yield __superGet(_SR5Item.prototype, this, "_preUpdate").call(this, changed, options, user);
    });
  }
};
var SR5Item = _SR5Item;
SR5Item.LOG_V10_COMPATIBILITY_WARNINGS = false;

// src/module/actor/prep/functions/InitiativePrep.ts
var InitiativePrep = class {
  static prepareCurrentInitiative(system) {
    const { initiative } = system;
    if (initiative.perception === "matrix")
      initiative.current = initiative.matrix;
    else if (initiative.perception === "astral")
      initiative.current = initiative.astral;
    else {
      initiative.current = initiative.meatspace;
      initiative.perception = "meatspace";
    }
    initiative.current.dice.value = Helpers.calcTotal(initiative.current.dice, { min: 0, max: 5 });
    if (initiative.edge)
      initiative.current.dice.value = 5;
    initiative.current.dice.value = Math.min(5, initiative.current.dice.value);
    initiative.current.dice.text = `${initiative.current.dice.value}d6`;
    initiative.current.base.value = Helpers.calcTotal(initiative.current.base);
  }
  static prepareMeatspaceInit(system) {
    const { initiative, attributes, modifiers } = system;
    initiative.meatspace.base.base = attributes.intuition.value + attributes.reaction.value;
    initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers["meat_initiative"]));
    initiative.meatspace.dice.base = 1;
    initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers["meat_initiative_dice"]));
  }
  static prepareAstralInit(system) {
    const { initiative, attributes, modifiers } = system;
    initiative.astral.base.base = attributes.intuition.value * 2;
    initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers["astral_initiative"]));
    initiative.astral.dice.base = 2;
    initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers["astral_initiative_dice"]));
  }
  static prepareMatrixInit(system) {
    const { initiative, attributes, modifiers, matrix } = system;
    if (matrix) {
      initiative.matrix.base.base = attributes.intuition.value + system.matrix.data_processing.value;
      initiative.matrix.base.mod = PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", Number(modifiers["matrix_initiative"]));
      initiative.matrix.dice.base = matrix.hot_sim ? 4 : 3;
      initiative.matrix.dice.mod = PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", Number(modifiers["matrix_initiative_dice"]));
    }
  }
};

// src/module/actor/prep/functions/ModifiersPrep.ts
var ModifiersPrep = class {
  static prepareModifiers(system) {
    let modifiers = ModifiersPrep.commonModifiers;
    modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
    modifiers = modifiers.concat(ModifiersPrep.characterModifiers);
    ModifiersPrep.setupModifiers(system, modifiers);
  }
  static get commonModifiers() {
    return ["soak", "defense"];
  }
  static get characterModifiers() {
    return [
      "drain",
      "armor",
      "physical_limit",
      "social_limit",
      "mental_limit",
      "stun_track",
      "physical_track",
      "meat_initiative",
      "meat_initiative_dice",
      "astral_initiative",
      "astral_initiative_dice",
      "composure",
      "lift_carry",
      "judge_intentions",
      "memory",
      "walk",
      "run",
      "wound_tolerance",
      "essence",
      "fade"
    ];
  }
  static get matrixModifiers() {
    return [
      "matrix_initiative",
      "matrix_initiative_dice",
      "matrix_track"
    ];
  }
  static setupModifiers(system, modifiers) {
    if (!system.modifiers) {
      system.modifiers = {};
    }
    modifiers.sort();
    modifiers.unshift("global");
    const sorted = {};
    for (const modifier of modifiers) {
      sorted[modifier] = Number(system.modifiers[modifier]) || 0;
    }
    system.modifiers = sorted;
  }
  static clearAttributeMods(system) {
    const { attributes } = system;
    for (const [name, attribute] of Object.entries(attributes)) {
      if (!SR5.attributes.hasOwnProperty(name) || !attribute)
        return;
      attribute.mod = [];
    }
  }
  static clearArmorMods(system) {
    const { armor } = system;
    armor.mod = [];
  }
  static clearLimitMods(system) {
    const { limits } = system;
    for (const [name, limit] of Object.entries(limits)) {
      if (!SR5.limits.hasOwnProperty(name) || !limit)
        return;
      limit.mod = [];
    }
  }
};

// src/module/actor/prep/functions/AttributesPrep.ts
var AttributesPrep = class {
  static prepareAttributes(system) {
    const { attributes } = system;
    attributes.magic.hidden = true;
    attributes.resonance.hidden = true;
    attributes.edge.hidden = true;
    attributes.essence.hidden = true;
    for (let [name, attribute] of Object.entries(attributes)) {
      if (name === "edge" && attribute["uses"] === void 0)
        return;
      AttributesPrep.prepareAttribute(name, attribute);
    }
  }
  static prepareAttribute(name, attribute) {
    if (!SR5.attributes.hasOwnProperty(name) || !attribute)
      return;
    AttributesPrep.calculateAttribute(name, attribute);
    attribute.label = SR5.attributes[name];
  }
  static calculateAttribute(name, attribute) {
    if (!SR5.attributes.hasOwnProperty(name) || !attribute)
      return;
    const range = SR.attributes.ranges[name];
    Helpers.calcTotal(attribute, range);
  }
};

// src/module/actor/prep/functions/MatrixPrep.ts
var MatrixPrep = class {
  static prepareMatrix(system, items) {
    const { matrix, attributes } = system;
    const MatrixList = ["firewall", "sleaze", "data_processing", "attack"];
    MatrixList.forEach((key) => {
      const parts = new PartsList(matrix[key].mod);
      parts.addUniquePart("SR5.Temporary", matrix[key].temp);
      parts.removePart("Temporary");
      matrix[key].mod = parts.list;
      matrix[key].value = parts.total;
    });
    matrix.condition_monitor.max = 0;
    matrix.rating = 0;
    matrix.name = "";
    matrix.device = "";
    matrix.condition_monitor.label = "SR5.ConditionMonitor";
    const device = items.find((item) => item.isEquipped() && item.isDevice());
    if (device) {
      const conditionMonitor = device.getConditionMonitor();
      matrix.device = device.getId();
      matrix.condition_monitor.max = conditionMonitor.max;
      matrix.condition_monitor.value = conditionMonitor.value;
      matrix.rating = device.getRating();
      matrix.is_cyberdeck = device.isCyberdeck();
      matrix.name = device.getName();
      matrix.item = device.getData();
      const deviceAtts = device.getASDF();
      if (deviceAtts) {
        for (const [key, value] of Object.entries(deviceAtts)) {
          if (value && matrix[key]) {
            matrix[key].base = value.value;
            matrix[key].device_att = value.device_att;
          }
        }
      }
    } else if (system.special === "resonance") {
      matrix.firewall.base = Helpers.calcTotal(attributes.willpower);
      matrix.data_processing.base = Helpers.calcTotal(attributes.logic);
      matrix.rating = Helpers.calcTotal(attributes.resonance);
      matrix.attack.base = Helpers.calcTotal(attributes.charisma);
      matrix.sleaze.base = Helpers.calcTotal(attributes.intuition);
      matrix.name = game.i18n.localize("SR5.LivingPersona");
    }
    if (matrix.condition_monitor.value > matrix.condition_monitor.max) {
      matrix.condition_monitor.value = matrix.condition_monitor.max;
    }
  }
  static prepareMatrixToLimitsAndAttributes(system) {
    const { matrix, attributes, limits } = system;
    Object.keys(SR5.matrixAttributes).forEach((attributeName) => {
      if (!matrix.hasOwnProperty(attributeName)) {
        return console.error(`SR5Actor matrix preparation failed due to missing matrix attributes`);
      }
      const attribute = matrix[attributeName];
      AttributesPrep.prepareAttribute(attributeName, attribute);
      const { value, base, mod, label } = attribute;
      const hidden = true;
      limits[attributeName] = {
        value,
        base,
        mod,
        label,
        hidden
      };
      attributes[attributeName] = {
        value,
        base,
        mod,
        label,
        hidden
      };
    });
  }
  static prepareAttributesForDevice(system) {
    const { matrix, attributes } = system;
    const rating = matrix.rating || 0;
    const mentalAttributes = ["intuition", "logic", "charisma", "willpower"];
    mentalAttributes.forEach((attLabel) => {
      if (attributes[attLabel] !== void 0) {
        attributes[attLabel].base = rating;
        Helpers.calcTotal(attributes[attLabel]);
      }
    });
    const basic = ["firewall", "data_processing"];
    basic.forEach((attId) => {
      matrix[attId].base = rating;
    });
    [...basic, "sleaze", "attack"].forEach((attId) => {
      Helpers.calcTotal(matrix[attId]);
    });
  }
};

// src/module/actor/prep/functions/ItemPrep.ts
var ItemPrep = class {
  static prepareArmor(system, items) {
    const { armor } = system;
    armor.base = 0;
    armor.value = 0;
    for (const element of Object.keys(SR5.elementTypes)) {
      armor[element] = 0;
    }
    const armorModParts = new PartsList(armor.mod);
    const equippedArmor = items.filter((item) => item.couldHaveArmor() && item.isEquipped());
    equippedArmor == null ? void 0 : equippedArmor.forEach((item) => {
      if (item.hasArmor()) {
        if (item.hasArmorAccessory()) {
          armorModParts.addUniquePart(item.getName(), item.getArmorValue());
        } else {
          const armorValue = item.getArmorValue();
          if (armorValue > armor.base) {
            armor.base = item.getArmorValue();
            armor.label = item.getName();
          }
        }
      }
      for (const element of Object.keys(SR5.elementTypes)) {
        armor[element] += item.getArmorElements()[element];
      }
    });
    if (system.modifiers["armor"])
      armorModParts.addUniquePart(game.i18n.localize("SR5.Bonus"), system.modifiers["armor"]);
    armor.value = Helpers.calcTotal(armor);
  }
  static prepareBodyware(system, items) {
    const { attributes } = system;
    const parts = new PartsList();
    items.filter((item) => item.isBodyware() && item.isEquipped()).forEach((item) => {
      if (item.getEssenceLoss()) {
        parts.addUniquePart(item.getName(), -Number(item.getEssenceLoss()));
      }
    });
    const essenceMod = system.modifiers["essence"];
    if (essenceMod && !Number.isNaN(essenceMod)) {
      parts.addUniquePart("SR5.Bonus", Number(essenceMod));
    }
    attributes.essence.base = SR.attributes.defaults.essence;
    attributes.essence.mod = parts.list;
    attributes.essence.value = Helpers.calcTotal(attributes.essence);
  }
};

// src/module/actor/prep/functions/SkillsPrep.ts
var SkillsPrep = class {
  static prepareSkills(system) {
    const { language, active, knowledge } = system.skills;
    if (language) {
      if (!language.value) {
        language.value = {};
      }
      if (Array.isArray(language.value) && language.value.length == 0) {
        language.value = {};
      }
      language.attribute = "intuition";
    }
    const prepareSkill = (skill) => {
      var _a;
      if (!skill.base)
        skill.base = 0;
      if ((_a = skill.bonus) == null ? void 0 : _a.length) {
        for (let bonus of skill.bonus) {
          skill.mod = PartsList.AddUniquePart(skill.mod, bonus.key, Number(bonus.value));
        }
      }
      skill.value = Helpers.calcTotal(skill);
      _mergeWithMissingSkillFields(skill);
    };
    for (const skill of Object.values(active)) {
      if (!skill.hidden) {
        prepareSkill(skill);
      }
    }
    const entries = Object.entries(system.skills.language.value);
    entries.forEach(([key, val]) => val._delete && delete system.skills.language.value[key]);
    for (let skill of Object.values(language.value)) {
      prepareSkill(skill);
      skill.attribute = "intuition";
    }
    for (let [, group] of Object.entries(knowledge)) {
      const entries2 = Object.entries(group.value);
      group.value = entries2.filter(([, val]) => !val._delete).reduce((acc, [id, skill]) => {
        prepareSkill(skill);
        skill.attribute = group.attribute;
        acc[id] = skill;
        return acc;
      }, {});
    }
    for (let [skillKey, skillValue] of Object.entries(active)) {
      skillValue.label = SR5.activeSkills[skillKey];
    }
  }
};
var _mergeWithMissingSkillFields = (givenSkill) => {
  const template = {
    name: "",
    base: "",
    value: 0,
    attribute: "",
    mod: [],
    specs: [],
    hidden: false
  };
  mergeObject(givenSkill, template, { overwrite: false });
};

// src/module/actor/prep/functions/LimitsPrep.ts
var LimitsPrep = class {
  static prepareLimits(system) {
    const { limits, modifiers } = system;
    limits.physical.mod = PartsList.AddUniquePart(limits.physical.mod, "SR5.Bonus", Number(modifiers["physical_limit"]));
    limits.mental.mod = PartsList.AddUniquePart(limits.mental.mod, "SR5.Bonus", Number(modifiers["mental_limit"]));
    limits.social.mod = PartsList.AddUniquePart(limits.social.mod, "SR5.Bonus", Number(modifiers["social_limit"]));
    for (let [name, limit] of Object.entries(limits)) {
      Helpers.calcTotal(limit);
      limit.label = SR5.limits[name];
    }
  }
  static prepareLimitBaseFromAttributes(system) {
    const { limits, attributes } = system;
    limits.physical.base = Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3);
    limits.mental.base = Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3);
    limits.social.base = Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3);
  }
};

// src/module/actor/prep/functions/ConditionMonitorsPrep.ts
var ConditionMonitorsPrep = class {
  static prepareStun(system) {
    const { track, attributes, modifiers } = system;
    track.stun.base = 8 + Math.ceil(attributes.willpower.value / 2);
    track.stun.max = track.stun.base + Number(modifiers["stun_track"]);
    track.stun.label = SR5.damageTypes.stun;
    track.stun.disabled = false;
  }
  static preparePhysical(system) {
    const { track, attributes, modifiers } = system;
    track.physical.base = 8 + Math.ceil(attributes.body.value / 2);
    track.physical.max = track.physical.base + Number(modifiers["physical_track"]);
    track.physical.overflow.max = attributes.body.value;
    track.physical.label = SR5.damageTypes.physical;
    track.physical.disabled = false;
  }
  static prepareGrunt(system) {
    ConditionMonitorsPrep.prepareStun(system);
    const { track, attributes, modifiers } = system;
    track.stun.value = 0;
    track.stun.disabled = true;
    const attribute = attributes.willpower.value > attributes.body.value ? attributes.willpower : attributes.body;
    track.physical.base = 8 + Math.ceil(attribute.value / 2);
    track.physical.max = track.physical.base + Number(modifiers["physical_track"]);
    track.physical.overflow.max = attributes.body.value;
    track.physical.label = "SR5.ConditionMonitor";
    track.physical.disabled = false;
  }
};

// src/module/actor/prep/functions/MovementPrep.ts
var MovementPrep = class {
  static prepareMovement(system) {
    const { attributes, modifiers } = system;
    const movement = system.movement;
    movement.walk.value = attributes.agility.value * (2 + Number(modifiers["walk"])) + new PartsList(movement.walk.mod).total;
    movement.run.value = attributes.agility.value * (4 + Number(modifiers["run"])) + new PartsList(movement.run.mod).total;
  }
};

// src/module/actor/prep/functions/WoundsPrep.ts
var WoundsPrep = class {
  static prepareWounds(system) {
    const { modifiers, track } = system;
    const count = 3 + Number(modifiers["wound_tolerance"]);
    const stunWounds = track.stun.disabled ? 0 : Math.floor(track.stun.value / count);
    const physicalWounds = track.physical.disabled ? 0 : Math.floor(track.physical.value / count);
    track.stun.wounds = stunWounds;
    track.physical.wounds = physicalWounds;
    system.wounds = {
      value: stunWounds + physicalWounds
    };
  }
};

// src/module/actor/prep/functions/NPCPrep.ts
var NPCPrep = class {
  static prepareNPCData(system) {
    NPCPrep.applyMetatypeModifiers(system);
  }
  static applyMetatypeModifiers(system) {
    var _a;
    const { attributes, metatype } = system;
    const metatypeModifier = DataDefaults.grunt.metatype_modifiers[metatype] || {};
    for (const [name, attribute] of Object.entries(attributes)) {
      if (!Array.isArray(attribute.mod)) {
        console.error("Actor data contains wrong data type for attribute.mod", attribute, !Array.isArray(attribute.mod));
      } else {
        const parts = new PartsList(attribute.mod);
        parts.removePart(METATYPEMODIFIER);
        const modifyBy = (_a = metatypeModifier.attributes) == null ? void 0 : _a[name];
        if (system.is_npc && modifyBy) {
          parts.addPart(METATYPEMODIFIER, modifyBy);
        }
        attribute.mod = parts.list;
        AttributesPrep.calculateAttribute(name, attribute);
      }
    }
  }
};

// src/module/actor/prep/CharacterPrep.ts
var CharacterPrep = class {
  static prepareBaseData(system) {
    ModifiersPrep.prepareModifiers(system);
    ModifiersPrep.clearAttributeMods(system);
    ModifiersPrep.clearArmorMods(system);
    ModifiersPrep.clearLimitMods(system);
  }
  static prepareDerivedData(system, items) {
    AttributesPrep.prepareAttributes(system);
    NPCPrep.prepareNPCData(system);
    SkillsPrep.prepareSkills(system);
    ItemPrep.prepareArmor(system, items);
    ItemPrep.prepareBodyware(system, items);
    MatrixPrep.prepareMatrix(system, items);
    MatrixPrep.prepareMatrixToLimitsAndAttributes(system);
    LimitsPrep.prepareLimitBaseFromAttributes(system);
    LimitsPrep.prepareLimits(system);
    if (system.is_npc && system.npc.is_grunt) {
      ConditionMonitorsPrep.prepareGrunt(system);
    } else {
      ConditionMonitorsPrep.preparePhysical(system);
      ConditionMonitorsPrep.prepareStun(system);
    }
    MovementPrep.prepareMovement(system);
    WoundsPrep.prepareWounds(system);
    InitiativePrep.prepareMeatspaceInit(system);
    InitiativePrep.prepareAstralInit(system);
    InitiativePrep.prepareMatrixInit(system);
    InitiativePrep.prepareCurrentInitiative(system);
  }
};

// src/module/actor/prep/CritterPrep.ts
var CritterPrep = class {
  static prepareBaseData(data) {
    ModifiersPrep.prepareModifiers(data);
    ModifiersPrep.clearAttributeMods(data);
    ModifiersPrep.clearArmorMods(data);
    ModifiersPrep.clearLimitMods(data);
  }
  static prepareDerivedData(data, items) {
    AttributesPrep.prepareAttributes(data);
    SkillsPrep.prepareSkills(data);
    ItemPrep.prepareArmor(data, items);
    ItemPrep.prepareBodyware(data, items);
    MatrixPrep.prepareMatrix(data, items);
    MatrixPrep.prepareMatrixToLimitsAndAttributes(data);
    LimitsPrep.prepareLimitBaseFromAttributes(data);
    LimitsPrep.prepareLimits(data);
    ConditionMonitorsPrep.preparePhysical(data);
    ConditionMonitorsPrep.prepareStun(data);
    MovementPrep.prepareMovement(data);
    WoundsPrep.prepareWounds(data);
    InitiativePrep.prepareMeatspaceInit(data);
    InitiativePrep.prepareAstralInit(data);
    InitiativePrep.prepareMatrixInit(data);
    InitiativePrep.prepareCurrentInitiative(data);
  }
};

// src/module/actor/prep/SpiritPrep.ts
var SpiritPrep = class {
  static prepareBaseData(data) {
    SpiritPrep.prepareSpiritSpecial(data);
    ModifiersPrep.prepareModifiers(data);
    ModifiersPrep.clearAttributeMods(data);
    ModifiersPrep.clearArmorMods(data);
    ModifiersPrep.clearLimitMods(data);
  }
  static prepareDerivedData(data, items) {
    SpiritPrep.prepareSpiritBaseData(data);
    AttributesPrep.prepareAttributes(data);
    SkillsPrep.prepareSkills(data);
    LimitsPrep.prepareLimitBaseFromAttributes(data);
    LimitsPrep.prepareLimits(data);
    SpiritPrep.prepareSpiritArmor(data);
    ConditionMonitorsPrep.prepareStun(data);
    ConditionMonitorsPrep.preparePhysical(data);
    MovementPrep.prepareMovement(data);
    WoundsPrep.prepareWounds(data);
    InitiativePrep.prepareCurrentInitiative(data);
  }
  static prepareSpiritSpecial(data) {
    data.special = "magic";
  }
  static prepareSpiritBaseData(data) {
    const overrides = this.getSpiritStatModifiers(data.spiritType);
    if (overrides) {
      const { attributes, skills, initiative, force, modifiers } = data;
      for (const [attId, value] of Object.entries(overrides.attributes)) {
        if (attributes[attId] !== void 0) {
          attributes[attId].base = value + force;
        }
      }
      for (const [skillId, skill] of Object.entries(skills.active)) {
        if (SkillFlow.isCustomSkill(skill))
          continue;
        skill.base = overrides.skills.find((s) => s === skillId) ? force : 0;
      }
      initiative.meatspace.base.base = force * 2 + overrides.init + Number(modifiers["astral_initiative"]);
      initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers["meat_initiative"]));
      initiative.meatspace.dice.base = 2;
      initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers["meat_initiative_dice"]));
      initiative.astral.base.base = force * 2 + overrides.astral_init + Number(modifiers["astral_initiative_dice"]);
      initiative.astral.base.mod = PartsList.AddUniquePart(initiative.astral.base.mod, "SR5.Bonus", Number(modifiers["astral_initiative"]));
      initiative.astral.dice.base = 3;
      initiative.astral.dice.mod = PartsList.AddUniquePart(initiative.astral.dice.mod, "SR5.Bonus", Number(modifiers["astral_initiative_dice"]));
    }
  }
  static prepareSpiritArmor(data) {
    var _a;
    const { armor, attributes } = data;
    armor.base = ((_a = attributes.essence.value) != null ? _a : 0) * 2;
    armor.value = Helpers.calcTotal(armor);
  }
  static getSpiritStatModifiers(spiritType) {
    const overrides = {
      attributes: {
        body: 0,
        agility: 0,
        reaction: 0,
        strength: 0,
        willpower: 0,
        logic: 0,
        intuition: 0,
        charisma: 0,
        magic: 0,
        essence: 0
      },
      init: 0,
      astral_init: 0,
      skills: []
    };
    switch (spiritType) {
      case "air":
        overrides.attributes.body = -2;
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 4;
        overrides.attributes.strength = -3;
        overrides.init = 4;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "aircraft":
        overrides.attributes.body = 2;
        overrides.attributes.agility = 1;
        overrides.attributes.strength = 1;
        overrides.attributes.logic = -2;
        overrides.skills.push("free_fall", "navigation", "perception", "pilot_aircraft", "unarmed_combat");
        break;
      case "airwave":
        overrides.attributes.body = 2;
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 4;
        overrides.attributes.strength = -3;
        overrides.init = 4;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "impersonation", "perception", "running", "unarmed_combat");
        break;
      case "automotive":
        overrides.attributes.body = 1;
        overrides.attributes.agility = 2;
        overrides.attributes.reaction = 1;
        overrides.attributes.logic = -2;
        overrides.init = 1;
        overrides.skills.push("navigation", "perception", "pilot_ground_craft", "running", "unarmed_combat");
        break;
      case "beasts":
        overrides.attributes.body = 2;
        overrides.attributes.agility = 1;
        overrides.attributes.strength = 2;
        overrides.skills.push("assensing", "astral_combat", "perception", "unarmed_combat");
        break;
      case "ceramic":
        overrides.attributes.agility = 1;
        overrides.attributes.reaction = 2;
        overrides.init = 2;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "earth":
        overrides.attributes.body = 4;
        overrides.attributes.agility = -2;
        overrides.attributes.reaction = -1;
        overrides.attributes.strength = 4;
        overrides.attributes.logic = -1;
        overrides.init = -1;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "energy":
        overrides.attributes.body = 1;
        overrides.attributes.agility = 2;
        overrides.attributes.reaction = 3;
        overrides.attributes.strength = -2;
        overrides.attributes.intuition = 1;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "fire":
        overrides.attributes.body = 1;
        overrides.attributes.agility = 2;
        overrides.attributes.reaction = 3;
        overrides.attributes.strength = -2;
        overrides.attributes.intuition = 1;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "flight", "perception", "unarmed_combat");
        break;
      case "guardian":
        overrides.attributes.body = 1;
        overrides.attributes.agility = 2;
        overrides.attributes.reaction = 3;
        overrides.attributes.strength = 2;
        overrides.init = 1;
        overrides.skills.push("assensing", "astral_combat", "blades", "clubs", "counter_spelling", "exotic_range", "perception", "unarmed_combat");
        break;
      case "guidance":
        overrides.attributes.body = 3;
        overrides.attributes.agility = -1;
        overrides.attributes.reaction = 2;
        overrides.attributes.strength = 1;
        overrides.skills.push("arcana", "assensing", "astral_combat", "counter_spelling", "perception", "unarmed_combat");
        break;
      case "man":
        overrides.attributes.body = 1;
        overrides.attributes.reaction = 2;
        overrides.attributes.strength = -2;
        overrides.attributes.intuition = 1;
        overrides.init = 2;
        overrides.skills.push("assensing", "astral_combat", "perception", "spellcasting", "unarmed_combat");
        break;
      case "metal":
        overrides.attributes.body = 4;
        overrides.attributes.agility = -2;
        overrides.attributes.reaction = -1;
        overrides.attributes.strength = 4;
        overrides.attributes.logic = -1;
        overrides.init = -1;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "plant":
        overrides.attributes.body = 2;
        overrides.attributes.agility = -1;
        overrides.attributes.strength = 1;
        overrides.attributes.logic = -1;
        overrides.skills.push("assensing", "astral_combat", "perception", "exotic_range", "unarmed_combat");
        break;
      case "ship":
        overrides.attributes.body = 4;
        overrides.attributes.agility = -1;
        overrides.attributes.reaction = -1;
        overrides.attributes.strength = 2;
        overrides.attributes.logic = -2;
        overrides.init = -1;
        overrides.skills.push("navigation", "perception", "pilot_water_craft", "survival", "swimming", "unarmed_combat");
        break;
      case "task":
        overrides.attributes.reaction = 2;
        overrides.attributes.strength = 2;
        overrides.init = 2;
        overrides.skills.push("artisan", "assensing", "astral_combat", "perception", "unarmed_combat");
        break;
      case "train":
        overrides.attributes.body = 3;
        overrides.attributes.agility = -1;
        overrides.attributes.reaction = -1;
        overrides.attributes.strength = 2;
        overrides.attributes.willpower = 1;
        overrides.attributes.logic = -2;
        overrides.init = -1;
        overrides.skills.push("intimidation", "navigation", "perception", "pilot_ground_craft", "unarmed_combat");
        break;
      case "water":
        overrides.attributes.agility = 1;
        overrides.attributes.reaction = 2;
        overrides.init = 2;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "toxic_air":
        overrides.attributes.body = -2;
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 4;
        overrides.attributes.strength = -3;
        overrides.init = 4;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "running", "unarmed_combat");
        break;
      case "toxic_beasts":
        overrides.attributes.body = 2;
        overrides.attributes.agility = 1;
        overrides.attributes.strength = 2;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "gymnastics", "perception", "running", "unarmed_combat");
        break;
      case "toxic_earth":
        overrides.attributes.body = 4;
        overrides.attributes.agility = -2;
        overrides.attributes.reaction = -1;
        overrides.attributes.strength = 4;
        overrides.attributes.logic = -1;
        overrides.init = -1;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "toxic_fire":
        overrides.attributes.body = 1;
        overrides.attributes.agility = 2;
        overrides.attributes.reaction = 3;
        overrides.attributes.strength = -2;
        overrides.attributes.intuition = 1;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "flight", "unarmed_combat");
        break;
      case "toxic_man":
        overrides.attributes.reaction = 2;
        overrides.attributes.strength = -2;
        overrides.attributes.intuition = 1;
        overrides.init = 2;
        overrides.skills.push("assensing", "astral_combat", "perception", "spell_casting", "unarmed_combat");
        break;
      case "toxic_water":
        overrides.attributes.body = 1;
        overrides.attributes.agility = 1;
        overrides.attributes.reaction = 2;
        overrides.init = 2;
        overrides.skills.push("assensing", "astral_combat", "exotic_range", "perception", "unarmed_combat");
        break;
      case "blood":
        overrides.attributes.body = 2;
        overrides.attributes.agility = 2;
        overrides.attributes.strength = 2;
        overrides.attributes.logic = -1;
        overrides.skills.push("assensing", "astral_combat", "perception", "running", "unarmed_combat");
        break;
      case "muse":
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 2;
        overrides.attributes.willpower = 1;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "con", "gymnastics", "intimidation", "perception", "unarmed_combat");
        break;
      case "nightmare":
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 2;
        overrides.attributes.willpower = 1;
        overrides.attributes.intuition = 1;
        overrides.attributes.charisma = 2;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "con", "gymnastics", "intimidation", "perception", "unarmed_combat");
        break;
      case "shade":
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 2;
        overrides.attributes.willpower = 1;
        overrides.attributes.intuition = 1;
        overrides.attributes.charisma = 2;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "con", "gymnastics", "intimidation", "perception", "unarmed_combat");
        break;
      case "succubus":
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 2;
        overrides.attributes.willpower = 1;
        overrides.attributes.intuition = 1;
        overrides.attributes.charisma = 2;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "con", "gymnastics", "intimidation", "perception", "unarmed_combat");
        break;
      case "wraith":
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 2;
        overrides.attributes.willpower = 1;
        overrides.attributes.intuition = 1;
        overrides.attributes.charisma = 2;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "con", "gymnastics", "intimidation", "perception", "unarmed_combat");
        break;
      case "shedim":
        overrides.attributes.reaction = 2;
        overrides.attributes.strength = 1;
        overrides.init = 2;
        overrides.skills.push("assensing", "astral_combat", "perception", "unarmed_combat");
        break;
      case "master_shedim":
        overrides.attributes.reaction = 2;
        overrides.attributes.strength = 1;
        overrides.attributes.logic = 1;
        overrides.attributes.intuition = 1;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "counterspelling", "perception", "spellcasting", "unarmed_combat");
        break;
      case "caretaker":
        overrides.attributes.agility = 1;
        overrides.attributes.reaction = 1;
        overrides.init = 1;
        overrides.skills.push("assensing", "astral_combat", "leadership", "perception", "unarmed_combat");
        break;
      case "nymph":
        overrides.attributes.body = 1;
        overrides.attributes.reaction = 3;
        overrides.attributes.strength = 1;
        overrides.init = 3;
        overrides.skills.push("assensing", "astral_combat", "perception", "gymnastics", "spellcasting", "unarmed_combat");
        break;
      case "scout":
        overrides.attributes.agility = 2;
        overrides.attributes.reaction = 2;
        overrides.init = 2;
        overrides.skills.push("assensing", "astral_combat", "perception", "gymnastics", "sneaking", "unarmed_combat");
        break;
      case "soldier":
        overrides.attributes.body = 3;
        overrides.attributes.agility = 1;
        overrides.attributes.reaction = 1;
        overrides.attributes.strength = 3;
        overrides.init = 1;
        overrides.skills.push("assensing", "astral_combat", "counterspelling", "exotic_range", "gymnastics", "perception", "unarmed_combat");
        break;
      case "worker":
        overrides.attributes.strength = 1;
        overrides.skills.push("assensing", "astral_combat", "perception", "unarmed_combat");
        break;
      case "queen":
        overrides.attributes.body = 5;
        overrides.attributes.agility = 3;
        overrides.attributes.reaction = 4;
        overrides.attributes.strength = 5;
        overrides.attributes.willpower = 1;
        overrides.attributes.logic = 1;
        overrides.attributes.intuition = 1;
        overrides.init = 5;
        overrides.skills.push("assensing", "astral_combat", "con", "counterspelling", "gymnastics", "leadership", "negotiation", "perception", "spellcasting", "unarmed_combat");
        break;
    }
    return overrides;
  }
};

// src/module/actor/prep/SpritePrep.ts
var SpritePrep = class {
  static prepareBaseData(data) {
    SpritePrep.prepareSpriteSpecial(data);
    ModifiersPrep.prepareModifiers(data);
    ModifiersPrep.clearAttributeMods(data);
    ModifiersPrep.clearLimitMods(data);
  }
  static prepareDerivedData(data, items) {
    SpritePrep.prepareSpriteMatrixAttributes(data);
    SpritePrep.prepareSpriteAttributes(data);
    SpritePrep.prepareSpriteSkills(data);
    AttributesPrep.prepareAttributes(data);
    SkillsPrep.prepareSkills(data);
    LimitsPrep.prepareLimits(data);
    MatrixPrep.prepareMatrixToLimitsAndAttributes(data);
    SpritePrep.prepareSpriteConditionMonitor(data);
    SpritePrep.prepareSpriteInitiative(data);
    InitiativePrep.prepareCurrentInitiative(data);
  }
  static prepareSpriteSpecial(data) {
    data.special = "resonance";
  }
  static prepareSpriteAttributes(data) {
    const { attributes, level, spriteType } = data;
    const overrides = this.getSpriteStatModifiers(spriteType);
    attributes.resonance.base = level + overrides.resonance;
    Helpers.calcTotal(attributes.resonance);
  }
  static prepareSpriteMatrixAttributes(data) {
    const { level, matrix, spriteType } = data;
    const matrixAtts = ["attack", "sleaze", "data_processing", "firewall"];
    const overrides = this.getSpriteStatModifiers(spriteType);
    matrixAtts.forEach((att) => {
      if (matrix[att] !== void 0) {
        matrix[att].base = level + overrides[att];
        matrix[att].value = Helpers.calcTotal(matrix[att]);
      }
    });
    matrix.rating = level;
  }
  static prepareSpriteSkills(data) {
    const { skills, level, spriteType } = data;
    const overrides = this.getSpriteStatModifiers(spriteType);
    for (const [skillId, skill] of Object.entries(skills.active)) {
      skill.base = overrides.skills.find((s) => s === skillId) ? level : 0;
    }
  }
  static prepareSpriteConditionMonitor(data) {
    const { matrix, level } = data;
    matrix.condition_monitor.max = 8 + Math.ceil(level / 2);
  }
  static prepareSpriteInitiative(data) {
    const { initiative, level, spriteType, modifiers } = data;
    initiative.perception = "matrix";
    const overrides = this.getSpriteStatModifiers(spriteType);
    initiative.matrix.base.base = level * 2 + overrides.init;
    PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", modifiers["matrix_initiative"]);
    Helpers.calcTotal(initiative.matrix.base, { min: 0 });
    initiative.matrix.dice.base = 4;
    PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", modifiers["matrix_initiative_dice"]);
    Helpers.calcTotal(initiative.matrix.dice, { min: 0 });
  }
  static getSpriteStatModifiers(spriteType) {
    const overrides = {
      attack: 0,
      sleaze: 0,
      data_processing: 0,
      firewall: 0,
      resonance: 0,
      init: 0,
      skills: ["computer"]
    };
    switch (spriteType) {
      case "courier":
        overrides.sleaze = 3;
        overrides.data_processing = 1;
        overrides.firewall = 2;
        overrides.init = 1;
        overrides.skills.push("hacking");
        break;
      case "crack":
        overrides.sleaze = 3;
        overrides.data_processing = 2;
        overrides.firewall = 1;
        overrides.init = 2;
        overrides.skills.push("hacking", "electronic_warfare");
        break;
      case "data":
        overrides.attack = -1;
        overrides.data_processing = 4;
        overrides.firewall = 1;
        overrides.init = 4;
        overrides.skills.push("electronic_warfare");
        break;
      case "fault":
        overrides.attack = 3;
        overrides.data_processing = 1;
        overrides.firewall = 2;
        overrides.init = 1;
        overrides.skills.push("cybercombat", "hacking");
        break;
      case "machine":
        overrides.attack = 1;
        overrides.data_processing = 3;
        overrides.firewall = 2;
        overrides.init = 3;
        overrides.skills.push("electronic_warfare", "hardware");
        break;
    }
    return overrides;
  }
};

// src/module/actor/prep/VehiclePrep.ts
var VehiclePrep = class {
  static prepareBaseData(data) {
    ModifiersPrep.prepareModifiers(data);
    ModifiersPrep.clearAttributeMods(data);
    ModifiersPrep.clearArmorMods(data);
    ModifiersPrep.clearLimitMods(data);
  }
  static prepareDerivedData(data, items) {
    VehiclePrep.prepareVehicleStats(data);
    VehiclePrep.prepareAttributes(data);
    VehiclePrep.prepareLimits(data);
    AttributesPrep.prepareAttributes(data);
    SkillsPrep.prepareSkills(data);
    LimitsPrep.prepareLimits(data);
    VehiclePrep.prepareConditionMonitor(data);
    MatrixPrep.prepareMatrixToLimitsAndAttributes(data);
    MatrixPrep.prepareAttributesForDevice(data);
    VehiclePrep.prepareMovement(data);
    VehiclePrep.prepareMeatspaceInit(data);
    InitiativePrep.prepareMatrixInit(data);
    InitiativePrep.prepareCurrentInitiative(data);
    VehiclePrep.prepareArmor(data);
  }
  static prepareVehicleStats(data) {
    var _a;
    const { vehicle_stats, isOffRoad } = data;
    for (let [key, stat] of Object.entries(vehicle_stats)) {
      if (typeof stat.mod === "object") {
        stat.mod = new PartsList(stat.mod).list;
      }
      const parts = new PartsList(stat.mod);
      parts.addUniquePart("SR5.Temporary", (_a = stat.temp) != null ? _a : 0);
      stat.mod = parts.list;
      Helpers.calcTotal(stat);
      stat.label = SR5.vehicle.stats[key];
    }
    if (isOffRoad) {
      vehicle_stats.off_road_speed.hidden = false;
      vehicle_stats.off_road_handling.hidden = false;
      vehicle_stats.speed.hidden = true;
      vehicle_stats.handling.hidden = true;
    } else {
      vehicle_stats.off_road_speed.hidden = true;
      vehicle_stats.off_road_handling.hidden = true;
      vehicle_stats.speed.hidden = false;
      vehicle_stats.handling.hidden = false;
    }
  }
  static prepareAttributes(data) {
    const { attributes, vehicle_stats } = data;
    const attributeIds = ["agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma"];
    const totalPilot = Helpers.calcTotal(vehicle_stats.pilot);
    attributeIds.forEach((attId) => {
      if (attributes[attId] !== void 0) {
        attributes[attId].base = totalPilot;
      }
    });
  }
  static prepareLimits(data) {
    const { limits, vehicle_stats, isOffRoad } = data;
    limits.mental.base = Helpers.calcTotal(vehicle_stats.sensor);
    limits.sensor = __spreadProps(__spreadValues({}, vehicle_stats.sensor), { hidden: true });
    limits.handling = __spreadProps(__spreadValues({}, isOffRoad ? vehicle_stats.off_road_handling : vehicle_stats.handling), { hidden: true });
    limits.speed = __spreadProps(__spreadValues({}, isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed), { hidden: true });
  }
  static prepareConditionMonitor(data) {
    const { track, attributes, matrix, isDrone, modifiers } = data;
    const halfBody = Math.ceil(Helpers.calcTotal(attributes.body) / 2);
    if (isDrone) {
      track.physical.base = 6 + halfBody;
      track.physical.max = track.physical.base + (Number(modifiers["physical_track"]) || 0);
    } else {
      track.physical.base = 12 + halfBody;
      track.physical.max = track.physical.base + (Number(modifiers["physical_track"]) || 0);
    }
    track.physical.label = SR5.damageTypes.physical;
    const rating = matrix.rating || 0;
    matrix.condition_monitor.max = 8 + Math.ceil(rating / 2);
  }
  static prepareMovement(data) {
    const { vehicle_stats, movement, isOffRoad } = data;
    let speedTotal = Helpers.calcTotal(isOffRoad ? vehicle_stats.off_road_speed : vehicle_stats.speed);
    movement.walk.base = 5 * Math.pow(2, speedTotal - 1);
    movement.walk.value = movement.walk.base;
    movement.run.base = 10 * Math.pow(2, speedTotal - 1);
    movement.run.value = movement.run.base;
  }
  static prepareMeatspaceInit(data) {
    const { vehicle_stats, initiative, modifiers } = data;
    const pilot = Helpers.calcTotal(vehicle_stats.pilot);
    initiative.meatspace.base.base = pilot * 2;
    initiative.meatspace.base.mod = PartsList.AddUniquePart(initiative.meatspace.base.mod, "SR5.Bonus", Number(modifiers["meat_initiative"]));
    initiative.meatspace.dice.base = 4;
    initiative.meatspace.dice.mod = PartsList.AddUniquePart(initiative.meatspace.dice.mod, "SR5.Bonus", Number(modifiers["meat_initiative_dice"]));
    Helpers.calcTotal(initiative.meatspace.base);
    Helpers.calcTotal(initiative.meatspace.dice);
  }
  static prepareArmor(data) {
    const { armor, modifiers } = data;
    armor.mod = PartsList.AddUniquePart(armor.mod, "SR5.Temporary", Number(armor["temp"]));
    armor.mod = PartsList.AddUniquePart(armor.mod, "SR5.Bonus", Number(modifiers["armor"]));
    Helpers.calcTotal(armor);
  }
};

// src/module/rules/Modifiers.ts
var Modifiers = class {
  constructor(data) {
    if (!data || typeof data !== "object" || !("environmental" in data)) {
      data = Modifiers.getDefaultModifiers();
    }
    this.data = duplicate(data);
  }
  get hasActiveEnvironmental() {
    return Object.keys(this.environmental.active).length > 0;
  }
  get modifiers() {
    return this.data;
  }
  set modifiers(modifiers) {
    this.data = modifiers;
  }
  getTotalForType(type) {
    const modifier = this.modifiers[type] || { total: 0 };
    return modifier.total;
  }
  get environmental() {
    return this.data.environmental;
  }
  set environmental(modifiers) {
    this.data.environmental = modifiers;
  }
  _matchingActiveEnvironmental(category, level) {
    return this.environmental.active[category] === level;
  }
  _setEnvironmentalCategoryActive(category, level) {
    this.environmental.active[category] = level;
  }
  _setEnvironmentalCategoryInactive(category) {
    delete this.environmental.active[category];
  }
  _disableEnvironmentalOverwrite() {
    this._setEnvironmentalCategoryInactive("value");
  }
  activateEnvironmentalCategory(category, level) {
    if (!this._environmentalCategoryIsOverwrite(category)) {
      this._disableEnvironmentalOverwrite();
    }
    this._setEnvironmentalCategoryActive(category, level);
    this.calcEnvironmentalTotal();
  }
  toggleEnvironmentalCategory(category, level) {
    if (this._matchingActiveEnvironmental(category, level)) {
      this._setEnvironmentalCategoryInactive(category);
    } else if (this._environmentalCategoryIsOverwrite(category)) {
      this._setEnvironmentalOverwriteActive(level);
    } else {
      this._setEnvironmentalCategoryActive(category, level);
    }
    if (!this._environmentalCategoryIsOverwrite(category)) {
      this._setEnvironmentalOverwriteInactive();
    }
    this.calcEnvironmentalTotal();
  }
  calcEnvironmentalTotal() {
    if (this.hasActiveEnvironmentalOverwrite) {
      const modifier = this._activeEnvironmentalOverwrite;
      if (modifier === void 0) {
        console.error("An active overwrite modifier was returned as undefined");
        return;
      }
      this._resetEnvironmental();
      this._setEnvironmentalOverwriteActive(modifier);
      this._setEnvironmentalTotal(modifier);
    } else {
      const activeCategories = Object.entries(this.environmental.active).filter(([category, level]) => category !== "value");
      const activeLevels = activeCategories.map(([category, level]) => level ? level : 0);
      const count = this._countActiveModifierLevels(activeLevels);
      const modifiers = Modifiers.getEnvironmentalModifierLevels();
      if (count.extreme > 0 || count.heavy >= 2) {
        this._setEnvironmentalTotal(modifiers.extreme);
      } else if (count.heavy === 1 || count.moderate >= 2) {
        this._setEnvironmentalTotal(modifiers.heavy);
      } else if (count.moderate === 1 || count.light >= 2) {
        this._setEnvironmentalTotal(modifiers.moderate);
      } else if (count.light === 1) {
        this._setEnvironmentalTotal(modifiers.light);
      } else {
        this._setEnvironmentalTotal(modifiers.good);
      }
    }
  }
  static clearOnEntity(document2) {
    return __async(this, null, function* () {
      yield document2.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
      return new Modifiers(Modifiers.getDefaultModifiers());
    });
  }
  static clearEnvironmentalOnEntity(document2) {
    return __async(this, null, function* () {
      const modifiers = yield Modifiers.getModifiersFromEntity(document2);
      modifiers.data.environmental = Modifiers.getDefaultEnvironmentalModifiers();
      yield Modifiers.setModifiersOnEntity(document2, modifiers.data);
      return modifiers;
    });
  }
  _environmentalCategoryIsOverwrite(category) {
    return category === "value";
  }
  _resetEnvironmental() {
    Object.keys(this.environmental.active).forEach((category) => delete this.environmental.active[category]);
  }
  _setEnvironmentalOverwriteActive(value) {
    this._resetEnvironmental();
    this._setEnvironmentalCategoryActive("value", value);
  }
  _setEnvironmentalOverwriteInactive() {
    this._setEnvironmentalCategoryInactive("value");
  }
  _setEnvironmentalTotal(value) {
    this.environmental.total = value;
  }
  get _activeEnvironmentalOverwrite() {
    return this.modifiers.environmental.active.value;
  }
  get hasActiveEnvironmentalOverwrite() {
    return this.environmental.active.value !== void 0;
  }
  _countActiveModifierLevels(values) {
    const modifiers = Modifiers.getEnvironmentalModifierLevels();
    return {
      light: values.reduce((count, value) => value === modifiers.light ? count + 1 : count, 0),
      moderate: values.reduce((count, value) => value === modifiers.moderate ? count + 1 : count, 0),
      heavy: values.reduce((count, value) => value === modifiers.heavy ? count + 1 : count, 0),
      extreme: values.reduce((count, value) => value === modifiers.extreme ? count + 1 : count, 0)
    };
  }
  static getDefaultEnvironmentalModifiers() {
    return {
      total: 0,
      active: {}
    };
  }
  static getDefaultModifier() {
    return {
      total: 0
    };
  }
  static getDefaultModifiers() {
    return {
      environmental: Modifiers.getDefaultEnvironmentalModifiers()
    };
  }
  static getEnvironmentalModifierLevels() {
    return SR.combat.environmental.levels;
  }
  static getModifiersFromEntity(document2) {
    const data = document2.getFlag(SYSTEM_NAME, FLAGS.Modifier);
    return new Modifiers(data);
  }
  static setModifiersOnEntity(document2, modifiers) {
    return __async(this, null, function* () {
      yield document2.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
      yield document2.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
    });
  }
};

// src/module/actor/prep/ICPrep.ts
var ICPrep = class {
  static prepareBaseData(data) {
    ModifiersPrep.clearAttributeMods(data);
    ModifiersPrep.clearLimitMods(data);
    ICPrep.addMissingTracks(data);
    ICPrep.prepareModifiers(data);
    ICPrep.hideMeatAttributes(data);
  }
  static prepareDerivedData(data, items) {
    ICPrep.prepareMatrixAttributes(data);
    SkillsPrep.prepareSkills(data);
    ICPrep.prepareHostAttributes(data);
    ICPrep.prepareMeatAttributes(data);
    MatrixPrep.prepareMatrixToLimitsAndAttributes(data);
    ICPrep.prepareMatrix(data);
    ICPrep.prepareMatrixTrack(data);
    ICPrep.prepareMatrixInit(data);
    InitiativePrep.prepareCurrentInitiative(data);
  }
  static addMissingTracks(data) {
    const track = data.track || {};
    if (!track.matrix)
      track.matrix = DefaultValues.trackData();
    data.track = track;
  }
  static prepareModifiers(data) {
    let modifiers = ModifiersPrep.commonModifiers;
    modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
    ModifiersPrep.setupModifiers(data, modifiers);
  }
  static prepareMatrix(data) {
    data.matrix.rating = MatrixRules.getICDeviceRating(data.host.rating);
  }
  static prepareMatrixTrack(data) {
    const { modifiers, track, matrix } = data;
    matrix.condition_monitor.max = Number(modifiers["matrix_track"]) + MatrixRules.getConditionMonitor(matrix.rating);
    track.matrix.base = MatrixRules.getConditionMonitor(matrix.rating);
    track.matrix.mod = PartsList.AddUniquePart(track.matrix.mod, "SR5.Bonus", Number(modifiers["matrix_track"]));
    track.matrix.max = matrix.condition_monitor.max;
    track.matrix.label = SR5.damageTypes.matrix;
  }
  static prepareMatrixInit(data) {
    const { initiative, modifiers, host } = data;
    initiative.perception = "matrix";
    initiative.matrix.base.base = MatrixRules.getICInitiativeBase(host.rating);
    initiative.matrix.base.mod = PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", Number(modifiers["matrix_initiative"]));
    initiative.matrix.dice.base = MatrixRules.getICInitiativeDice();
    initiative.matrix.dice.mod = PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", Number(modifiers["matrix_initiative_dice"]));
  }
  static prepareHostAttributes(data) {
    if (!data.host.id || !data.host.atts)
      return;
    Object.keys(data.host.atts).forEach((deviceAttribute) => {
      const attribute = data.host.atts[deviceAttribute];
      data.matrix[attribute.att].base = attribute.value;
      data.matrix[attribute.att].device_att = deviceAttribute;
    });
  }
  static hideMeatAttributes(data) {
    const { attributes } = data;
    for (const attribute of Object.values(attributes)) {
      attribute.hidden = true;
    }
  }
  static prepareMeatAttributes(data) {
    const { attributes, host } = data;
    for (const id of Object.keys(SR5.attributes)) {
      if (!attributes.hasOwnProperty(id))
        continue;
      if (["magic", "edge", "essence", "resonance"].includes(id))
        continue;
      const attribute = attributes[id];
      attribute.base = 0;
      const parts = new PartsList(attribute.mod);
      parts.addPart("SR5.Host.Rating", MatrixRules.getICMeatAttributeBase(host.rating));
      attribute.mod = parts.list;
      AttributesPrep.prepareAttribute(id, attribute);
    }
  }
  static prepareMatrixAttributes(data) {
    const { matrix } = data;
    for (const id of Object.keys(SR5.matrixAttributes)) {
      if (!matrix.hasOwnProperty(id))
        continue;
      const attribute = matrix[id];
      AttributesPrep.prepareAttribute(id, attribute);
    }
  }
};

// src/module/actor/flows/InventoryFlow.ts
var InventoryFlow = class {
  constructor(document2) {
    if (document2.system.inventories === void 0)
      console.error("Shawdorun 5e | Actor given does not have a inventory data structure. You will experience bugs.");
    this.document = document2;
  }
  create(name) {
    return __async(this, null, function* () {
      var _a;
      console.log(`Shadowrun 5e | Creating inventory ${name}`);
      if (this.exists(name))
        return (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.Errors.InventoryAlreadyExists"));
      if (this.document.defaultInventory.name === name)
        return;
      const updateData = {
        "system.inventories": {
          [name]: {
            name,
            label: name,
            itemIds: []
          }
        }
      };
      console.log(`Shadowrun 5e | Executing update to create inventory`, updateData);
      return yield this.document.update(updateData, { render: false });
    });
  }
  remove(_0) {
    return __async(this, arguments, function* (name, moveTo = this.document.defaultInventory.name) {
      var _a;
      console.log(`Shadowrun 5e | Removing inventory ${name}. Moving items over to ${moveTo}`);
      if (this.document.defaultInventory.name === name)
        return (_a = ui.notifications) == null ? void 0 : _a.error(game.i18n.localize("SR5.Errors.DefaultInventoryCantBeRemoved"));
      if (!this.exists(name))
        return console.error(`Shadowrun 5e | Can't remove inventory ${name} or move its items over to inventory ${moveTo}`);
      if (!this.exists(moveTo))
        moveTo = this.document.defaultInventory.name;
      const updateData = Helpers.getDeleteKeyUpdateData("system.inventories", name);
      if (this.document.defaultInventory.name !== moveTo) {
        updateData[`system.inventories.${moveTo}.itemIds`] = [
          ...this.document.system.inventories[name].itemIds,
          ...this.document.system.inventories[moveTo].itemIds
        ];
      }
      console.log(`Shadowrun 5e | Executing update to remove inventory`, updateData);
      yield this.document.update(updateData, { render: false });
    });
  }
  exists(name) {
    return name === Object.keys(this.document.system.inventories).find((inventory) => inventory.toLowerCase() === name.toLowerCase());
  }
  getOne(name) {
    return this.document.system.inventories[name];
  }
  getAll() {
    return this.document.system.inventories;
  }
  rename(current, newName) {
    return __async(this, null, function* () {
      console.log(`Shadowrun 5e | Renaming the inventory ${current} to ${newName}`);
      if (this.document.defaultInventory.name === current)
        return;
      if (current === newName)
        return;
      const inventory = this.getOne(current);
      if (!inventory)
        return;
      inventory.name = newName;
      inventory.label = newName;
      const updateData = {
        "system.inventories": {
          [`-=${current}`]: null,
          [newName]: inventory
        }
      };
      console.log(`Shadowrun 5e | Executing update to rename inventory`, updateData);
      yield this.document.update(updateData, { render: false });
    });
  }
  addItems(name, items, removeFromCurrent = true) {
    return __async(this, null, function* () {
      console.log(`Shadowrun 5e | Adding items to to inventory ${name}`, items);
      if (this.document.defaultInventory.name !== name && !this.exists(name))
        return;
      if (items instanceof SR5Item)
        items = [items];
      if (items.length === 0)
        return;
      if (removeFromCurrent) {
        for (const item of items)
          yield this.removeItem(item);
      }
      if (this.document.defaultInventory.name === name)
        return;
      for (const item of items) {
        if (item.id)
          this.document.system.inventories[name].itemIds.push(item.id);
      }
      const updateData = { [`system.inventories.${name}.itemIds`]: this.document.system.inventories[name].itemIds };
      console.log(`Shadowrun 5e | Executing adding items to inventory`, updateData);
      yield this.document.update(updateData);
    });
  }
  removeItem(item, name) {
    return __async(this, null, function* () {
      console.log(`Shadowrun 5e | Removing item from inventory (${name || this.document.defaultInventory.name})`, item);
      if (this.document.defaultInventory.name === name)
        return;
      const inventories = name ? [this.document.system.inventories[name]] : Object.values(this.document.system.inventories).filter(({ itemIds }) => itemIds.includes(item.id));
      if (inventories.length === 0)
        return;
      const updateData = {};
      for (const inventory of inventories) {
        const itemIds = inventory.itemIds.filter((id) => id !== item.id);
        updateData[`system.inventories.${inventory.name}.itemIds`] = itemIds;
      }
      console.log(`Shadowrun 5e | Executing update to remove item`, updateData);
      if (updateData)
        yield this.document.update(updateData);
    });
  }
};

// src/module/actor/flows/ModifierFlow.ts
var ModifierFlow = class {
  constructor(document2) {
    this.document = document2;
  }
  totalFor(type) {
    return __async(this, null, function* () {
      if (this[type] !== void 0)
        return this[type];
      const modifiers = yield this.document.getModifiers();
      if (modifiers.modifiers.hasOwnProperty(type))
        return modifiers.getTotalForType(type);
      return this.document.getModifier(type) || 0;
    });
  }
  get wounds() {
    return this.document.getWoundModifier();
  }
};

// src/module/tests/AttributeOnlyTest.ts
var AttributeOnlyTest = class extends SuccessTest {
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/attribute-only-test-dialog.html";
  }
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.attribute1 = data.action.attribute;
    data.attribute2 = data.action.attribute2;
    return data;
  }
  prepareBaseValues() {
    this.prepareAttributeSelection();
    super.prepareBaseValues();
  }
  prepareAttributeSelection() {
    if (!this.actor)
      return;
    this.data.pool.mod = [];
    const pool = new PartsList(this.pool.mod);
    const attribute1 = this.actor.getAttribute(this.data.attribute1);
    const attribute2 = this.actor.getAttribute(this.data.attribute2);
    if (attribute1)
      pool.addPart(attribute1.label, attribute1.value);
    if (attribute2)
      pool.addPart(attribute2.label, attribute2.value);
    if (attribute1 && this.actor._isMatrixAttribute(this.data.attribute1))
      this.actor._addMatrixParts(pool, true);
    if (attribute2 && this.actor._isMatrixAttribute(this.data.attribute2))
      this.actor._addMatrixParts(pool, true);
  }
};

// src/module/rules/RecoveryRules.ts
var RecoveryRules = {
  canHealPhysicalDamage: (stunBoxes) => {
    return stunBoxes === 0;
  }
};

// src/module/actor/SR5Actor.ts
var _SR5Actor = class extends Actor {
  constructor(data, context) {
    super(data, context);
    this.defaultInventory = {
      name: "Carried",
      label: "SR5.Labels.Inventory.Carried",
      itemIds: []
    };
    this.inventory = new InventoryFlow(this);
    this.modifiers = new ModifierFlow(this);
  }
  getOverwatchScore() {
    const os = this.getFlag(SYSTEM_NAME, "overwatchScore");
    return os !== void 0 ? os : 0;
  }
  setOverwatchScore(value) {
    return __async(this, null, function* () {
      const num = parseInt(value);
      if (!isNaN(num)) {
        return this.setFlag(SYSTEM_NAME, "overwatchScore", num);
      }
    });
  }
  prepareData() {
    super.prepareData();
  }
  prepareBaseData() {
    super.prepareBaseData();
    switch (this.type) {
      case "character":
        CharacterPrep.prepareBaseData(this.system);
        break;
      case "critter":
        CritterPrep.prepareBaseData(this.system);
        break;
      case "spirit":
        SpiritPrep.prepareBaseData(this.system);
        break;
      case "sprite":
        SpritePrep.prepareBaseData(this.system);
        break;
      case "vehicle":
        VehiclePrep.prepareBaseData(this.system);
        break;
      case "ic":
        ICPrep.prepareBaseData(this.system);
        break;
    }
  }
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
  }
  applyActiveEffects() {
    var _a;
    try {
      super.applyActiveEffects();
    } catch (error) {
      console.error(`Shadowrun5e | Some effect changes could not be applied and might cause issues. Check effects of actor (${this.name}) / id (${this.id})`);
      console.error(error);
      (_a = ui.notifications) == null ? void 0 : _a.error(`See browser console (F12): Some effect changes could not be applied and might cause issues. Check effects of actor (${this.name}) / id (${this.id})`);
    }
  }
  prepareDerivedData() {
    super.prepareDerivedData();
    const itemDataWrappers = this.items.map((item) => new SR5ItemDataWrapper(item.data));
    switch (this.type) {
      case "character":
        CharacterPrep.prepareDerivedData(this.system, itemDataWrappers);
        break;
      case "critter":
        CritterPrep.prepareDerivedData(this.system, itemDataWrappers);
        break;
      case "spirit":
        SpiritPrep.prepareDerivedData(this.system, itemDataWrappers);
        break;
      case "sprite":
        SpritePrep.prepareDerivedData(this.system, itemDataWrappers);
        break;
      case "vehicle":
        VehiclePrep.prepareDerivedData(this.system, itemDataWrappers);
        break;
      case "ic":
        ICPrep.prepareDerivedData(this.system, itemDataWrappers);
        break;
    }
  }
  applyOverrideActiveEffects() {
    const changes = this.effects.reduce((changes2, effect) => {
      if (effect.data.disabled)
        return changes2;
      return changes2.concat(effect.data.changes.filter((change) => change.mode === CONST.ACTIVE_EFFECT_MODES.OVERRIDE).map((change) => {
        var _a;
        change = foundry.utils.duplicate(change);
        change.effect = effect;
        change.priority = (_a = change.priority) != null ? _a : change.mode * 10;
        return change;
      }));
    }, []);
    changes.sort((a, b) => a.priority - b.priority);
    for (const change of changes) {
      change.effect.apply(this, change);
    }
  }
  _applySomeActiveEffects(partialKeys) {
    const changes = this._reduceEffectChangesByKeys(partialKeys);
    this._applyActiveEffectChanges(changes);
  }
  _applyActiveEffectChanges(changes) {
    const overrides = {};
    for (const change of changes) {
      const result = change.effect.apply(this, change);
      if (result !== null)
        overrides[change.key] = result;
    }
    this.overrides = __spreadValues(__spreadValues({}, this.overrides), foundry.utils.expandObject(overrides));
  }
  _reduceEffectChangesByKeys(partialKeys) {
    const changes = this.effects.reduce((changes2, effect) => {
      if (effect.data.disabled)
        return changes2;
      return changes2.concat(effect.data.changes.filter((change) => partialKeys.some((partialKey) => change.key.includes(partialKey))).map((change) => {
        var _a;
        change = foundry.utils.duplicate(change);
        change.effect = effect;
        change.priority = (_a = change.priority) != null ? _a : change.mode * 10;
        return change;
      }));
    }, []);
    changes.sort((a, b) => a.priority - b.priority);
    return changes;
  }
  getModifier(modifierName) {
    return this.system.modifiers[modifierName];
  }
  findActiveSkill(skillName) {
    if (!skillName)
      return;
    const skills = this.getActiveSkills();
    const skill = skills[skillName];
    if (skill)
      return skill;
    return Object.values(skills).find((skill2) => skill2.name === skillName);
  }
  findAttribute(id) {
    if (id === void 0)
      return;
    const attributes = this.getAttributes();
    if (!attributes)
      return;
    return attributes[id];
  }
  findVehicleStat(statName) {
    if (statName === void 0)
      return;
    const vehicleStats = this.getVehicleStats();
    if (vehicleStats)
      return vehicleStats[statName];
  }
  findLimitFromAttribute(attributeName) {
    if (attributeName === void 0)
      return void 0;
    const attribute = this.findAttribute(attributeName);
    if (!(attribute == null ? void 0 : attribute.limit))
      return void 0;
    return this.findLimit(attribute.limit);
  }
  findLimit(limitName) {
    if (!limitName)
      return void 0;
    return this.system.limits[limitName];
  }
  getWoundModifier() {
    if (!("wounds" in this.system))
      return 0;
    return -1 * this.system.wounds.value || 0;
  }
  useEdge(by = -1) {
    return __async(this, null, function* () {
      const edge = this.getEdge();
      if (edge && edge.value === 0)
        return;
      const usesLeft = edge.uses > 0 ? edge.uses : by * -1;
      const uses = Math.min(edge.value, usesLeft + by);
      yield this.update({ "data.attributes.edge.uses": uses });
    });
  }
  getEdge() {
    return this.system.attributes.edge;
  }
  hasArmor() {
    return "armor" in this.system;
  }
  getArmor(damage) {
    const armor = "armor" in this.system ? foundry.utils.duplicate(this.system.armor) : DefaultValues.actorArmorData();
    damage = damage || DefaultValues.damageData();
    Helpers.calcTotal(damage);
    Helpers.calcTotal(damage.ap);
    if (damage.ap.value !== 0)
      PartsList.AddUniquePart(armor.mod, "SR5.AP", damage.ap.value);
    if (damage.element.value !== "") {
      const armorForDamageElement = armor[damage.element.value] || 0;
      if (armorForDamageElement > 0)
        PartsList.AddUniquePart(armor.mod, "SR5.Element", armorForDamageElement);
    }
    Helpers.calcTotal(armor, { min: 0 });
    return armor;
  }
  getMatrixDevice() {
    if (!("matrix" in this.system))
      return;
    const matrix = this.system.matrix;
    if (matrix.device)
      return this.items.get(matrix.device);
  }
  getFullDefenseAttribute() {
    if (this.isVehicle()) {
      return this.findVehicleStat("pilot");
    } else if (this.isCharacter()) {
      const character = this.asCharacter();
      if (character) {
        let att = character.system.full_defense_attribute;
        if (!att)
          att = "willpower";
        return this.findAttribute(att);
      }
    }
  }
  getEquippedWeapons() {
    return this.items.filter((item) => item.isEquipped() && item.isWeapon());
  }
  getRecoilCompensation() {
    let total = 1;
    const strength = this.findAttribute("strength");
    if (strength) {
      total += Math.ceil(strength.value / 3);
    }
    return total;
  }
  getDeviceRating() {
    if (!("matrix" in this.system))
      return 0;
    return parseInt(this.system.matrix.rating);
  }
  getAttributes() {
    return this.system.attributes;
  }
  getAttribute(name) {
    const stats = this.getVehicleStats();
    if (stats && stats[name])
      return stats[name];
    const attributes = this.getAttributes();
    return attributes[name];
  }
  getLimits() {
    return this.system.limits;
  }
  getLimit(name) {
    const limits = this.getLimits();
    return limits[name];
  }
  getType() {
    return this.type;
  }
  isCharacter() {
    return this.getType() === "character";
  }
  isSpirit() {
    return this.getType() === "spirit";
  }
  isSprite() {
    return this.getType() === "sprite";
  }
  isVehicle() {
    return this.getType() === "vehicle";
  }
  isGrunt() {
    if (!("is_npc" in this.system) || !("npc" in this.system))
      return false;
    return this.system.is_npc && this.system.npc.is_grunt;
  }
  isCritter() {
    return this.getType() === "critter";
  }
  isIC() {
    return this.getType() === "ic";
  }
  get hasNaturalRecovery() {
    return this.isCharacter() || this.isCritter();
  }
  getVehicleTypeSkillName() {
    if (!("vehicleType" in this.system))
      return;
    switch (this.system.vehicleType) {
      case "air":
        return "pilot_aircraft";
      case "ground":
        return "pilot_ground_craft";
      case "water":
        return "pilot_water_craft";
      case "aerospace":
        return "pilot_aerospace";
      case "walker":
        return "pilot_walker";
      case "exotic":
        return "pilot_exotic_vehicle";
      default:
        return;
    }
  }
  getVehicleTypeSkill() {
    if (!this.isVehicle())
      return;
    const name = this.getVehicleTypeSkillName();
    return this.findActiveSkill(name);
  }
  get hasSkills() {
    return this.getSkills() !== void 0;
  }
  getSkills() {
    return this.system.skills;
  }
  getActiveSkills() {
    return this.system.skills.active;
  }
  get hasSpecial() {
    return ["character", "sprite", "spirit", "critter"].includes(this.type);
  }
  get hasFullDefense() {
    return ["character", "vehicle", "sprite", "spirit", "critter"].includes(this.type);
  }
  get isAwakened() {
    return this.system.special === "magic";
  }
  get isEmerged() {
    if (this.isSprite())
      return true;
    if (this.isCharacter() && this.system.special === "resonance")
      return true;
    return false;
  }
  getPool(skillId, options = { specialization: false, byLabel: false }) {
    const skill = options.byLabel ? this.getSkillByLabel(skillId) : this.getSkill(skillId);
    if (!skill || !skill.attribute)
      return 0;
    if (!SkillFlow.allowRoll(skill))
      return 0;
    const attribute = this.getAttribute(skill.attribute);
    const attributeValue = typeof attribute.value === "number" ? attribute.value : 0;
    const skillValue = typeof skill.value === "number" ? skill.value : 0;
    if (SkillRules.mustDefaultToRoll(skill) && SkillRules.allowDefaultingRoll(skill)) {
      return SkillRules.defaultingModifier + attributeValue;
    }
    const specializationBonus = options.specialization ? SR.skill.SPECIALIZATION_MODIFIER : 0;
    return skillValue + attributeValue + specializationBonus;
  }
  getSkill(id, options = { byLabel: false }) {
    if (options.byLabel)
      return this.getSkillByLabel(id);
    const { skills } = this.system;
    if (skills.active.hasOwnProperty(id)) {
      return skills.active[id];
    }
    if (skills.language.value.hasOwnProperty(id)) {
      return skills.language.value[id];
    }
    for (const categoryKey in skills.knowledge) {
      if (skills.knowledge.hasOwnProperty(categoryKey)) {
        const category = skills.knowledge[categoryKey];
        if (category.value.hasOwnProperty(id)) {
          return category.value[id];
        }
      }
    }
  }
  getSkillByLabel(searchedFor) {
    if (!searchedFor)
      return;
    const possibleMatch = (skill) => skill.label ? game.i18n.localize(skill.label) : skill.name;
    const skills = this.getSkills();
    for (const [id, skill] of Object.entries(skills.active)) {
      if (searchedFor === possibleMatch(skill))
        return __spreadProps(__spreadValues({}, skill), { id });
    }
    for (const [id, skill] of Object.entries(skills.language.value)) {
      if (searchedFor === possibleMatch(skill))
        return __spreadProps(__spreadValues({}, skill), { id });
    }
    for (const categoryKey in skills.knowledge) {
      if (!skills.knowledge.hasOwnProperty(categoryKey))
        continue;
      const categorySkills = skills.knowledge[categoryKey].value;
      for (const [id, skill] of Object.entries(categorySkills)) {
        if (searchedFor === possibleMatch(skill))
          return __spreadProps(__spreadValues({}, skill), { id });
      }
    }
  }
  getSkillLabel(skillId) {
    const skill = this.getSkill(skillId);
    if (!skill) {
      return "";
    }
    return skill.label ? skill.label : skill.name ? skill.name : "";
  }
  addKnowledgeSkill(category, skill) {
    return __async(this, null, function* () {
      if (!this.system.skills.knowledge.hasOwnProperty(category)) {
        console.error(`Shadowrun5e | Tried creating knowledge skill with unkown category ${category}`);
        return;
      }
      const defaultSkill = {
        name: "",
        specs: [],
        base: 0,
        value: 0,
        mod: 0
      };
      skill = __spreadValues(__spreadValues({}, defaultSkill), skill);
      const id = randomID(16);
      const value = {};
      value[id] = skill;
      const fieldName = `system.skills.knowledge.${category}.value`;
      const updateData = {};
      updateData[fieldName] = value;
      yield this.update(updateData);
      return id;
    });
  }
  addActiveSkill() {
    return __async(this, arguments, function* (skillData = { name: SKILL_DEFAULT_NAME }) {
      const skill = DefaultValues.skillData(skillData);
      const activeSkillsPath = "system.skills.active";
      const updateSkillDataResult = Helpers.getRandomIdSkillFieldDataEntry(activeSkillsPath, skill);
      if (!updateSkillDataResult)
        return;
      const { updateSkillData, id } = updateSkillDataResult;
      yield this.update(updateSkillData);
      return id;
    });
  }
  removeLanguageSkill(skillId) {
    return __async(this, null, function* () {
      const updateData = Helpers.getDeleteKeyUpdateData("system.skills.language.value", skillId);
      yield this.update(updateData);
    });
  }
  addLanguageSkill(skill) {
    return __async(this, null, function* () {
      const defaultSkill = {
        name: "",
        specs: [],
        base: 0,
        value: 0,
        mod: 0
      };
      skill = __spreadValues(__spreadValues({}, defaultSkill), skill);
      const id = randomID(16);
      const value = {};
      value[id] = skill;
      const fieldName = `system.skills.language.value`;
      const updateData = {};
      updateData[fieldName] = value;
      yield this.update(updateData);
      return id;
    });
  }
  removeKnowledgeSkill(skillId, category) {
    return __async(this, null, function* () {
      const updateData = Helpers.getDeleteKeyUpdateData(`system.skills.knowledge.${category}.value`, skillId);
      yield this.update(updateData);
    });
  }
  removeActiveSkill(skillId) {
    return __async(this, null, function* () {
      var _a;
      const activeSkills = this.getActiveSkills();
      if (!activeSkills.hasOwnProperty(skillId))
        return;
      const skill = this.getSkill(skillId);
      if (!skill)
        return;
      if (skill.name === "" && skill.label !== void 0 && skill.label !== "") {
        yield this.hideSkill(skillId);
        if (!this.prototypeToken.actorLink)
          yield (_a = this.sheet) == null ? void 0 : _a.render();
        return;
      }
      const updateData = Helpers.getDeleteKeyUpdateData("system.skills.active", skillId);
      yield this.update(updateData);
    });
  }
  hideSkill(skillId) {
    return __async(this, null, function* () {
      if (!skillId)
        return;
      const skill = this.getSkill(skillId);
      if (!skill)
        return;
      skill.hidden = true;
      const updateData = Helpers.getUpdateDataEntry(`system.skills.active.${skillId}`, skill);
      yield this.update(updateData);
    });
  }
  showSkill(skillId) {
    return __async(this, null, function* () {
      if (!skillId)
        return;
      const skill = this.getSkill(skillId);
      if (!skill)
        return;
      skill.hidden = false;
      const updateData = Helpers.getUpdateDataEntry(`system.skills.active.${skillId}`, skill);
      yield this.update(updateData);
    });
  }
  showHiddenSkills() {
    return __async(this, null, function* () {
      var _a;
      const updateData = {};
      const skills = this.getActiveSkills();
      for (const [id, skill] of Object.entries(skills)) {
        if (skill.hidden === true) {
          skill.hidden = false;
          updateData[`system.skills.active.${id}`] = skill;
        }
      }
      if (!updateData)
        return;
      yield this.update(updateData);
      if (!this.prototypeToken.actorLink)
        yield (_a = this.sheet) == null ? void 0 : _a.render();
    });
  }
  promptRoll() {
    return __async(this, null, function* () {
      yield ShadowrunRoller.promptSuccessTest();
    });
  }
  rollDeviceRating(options) {
    return __async(this, null, function* () {
      const rating = this.getDeviceRating();
      const showDialog = !TestCreator.shouldHideDialog(options == null ? void 0 : options.event);
      const testCls = TestCreator._getTestClass("SuccessTest");
      const test = new testCls({}, { actor: this }, { showDialog });
      const pool = new PartsList(test.pool.mod);
      pool.addPart("SR5.Labels.ActorSheet.DeviceRating", rating);
      pool.addPart("SR5.Labels.ActorSheet.DeviceRating", rating);
      const mods = new PartsList();
      this._addGlobalParts(mods);
      test.data.modifiers.mod = mods.list;
      yield test.execute();
    });
  }
  rollPackAction(packName, actionName, options) {
    return __async(this, null, function* () {
      const showDialog = !TestCreator.shouldHideDialog(options == null ? void 0 : options.event);
      const test = yield TestCreator.fromPackAction(packName, actionName, this, { showDialog });
      if (!test)
        return console.error("Shadowrun 5e | Rolling pack action failed");
      yield test.execute();
    });
  }
  rollGeneralAction(actionName, options) {
    return __async(this, null, function* () {
      yield this.rollPackAction(SR5.packNames.generalActions, actionName, options);
    });
  }
  rollSkill(_0) {
    return __async(this, arguments, function* (skillId, options = {}) {
      console.info(`Shadowrun5e | Rolling skill test for ${skillId}`);
      const action = this.skillActionData(skillId, options);
      if (!action)
        return;
      const showDialog = !TestCreator.shouldHideDialog(options.event);
      const test = yield TestCreator.fromAction(action, this, { showDialog });
      if (!test)
        return;
      yield test.execute();
    });
  }
  rollDroneInfiltration(options) {
    return __async(this, null, function* () {
      if (!this.isVehicle()) {
        return void 0;
      }
      const actorData = duplicate(this.system);
      if (actorData.controlMode === "autopilot") {
        const parts = new PartsList();
        const pilot = Helpers.calcTotal(actorData.vehicle_stats.pilot);
        const sneaking = this.findActiveSkill("sneaking");
        const limit = this.findLimit("sensor");
        if (sneaking && limit) {
          parts.addPart("SR5.Vehicle.Stealth", Helpers.calcTotal(sneaking));
          parts.addPart("SR5.Vehicle.Stats.Pilot", pilot);
          this._addGlobalParts(parts);
          return ShadowrunRoller.advancedRoll({
            event: options == null ? void 0 : options.event,
            actor: this,
            parts: parts.list,
            limit,
            title: game.i18n.localize("SR5.Labels.ActorSheet.RollDroneInfiltration")
          });
        }
      } else {
        yield this.rollSkill("sneaking", options);
      }
    });
  }
  rollAttribute(name, options) {
    return __async(this, null, function* () {
      console.info(`Shadowrun5e | Rolling attribute ${name} test from ${this.constructor.name}`);
      const action = DefaultValues.actionData({ attribute: name, test: AttributeOnlyTest.name });
      const test = yield TestCreator.fromAction(action, this);
      if (!test)
        return;
      yield test.execute();
    });
  }
  _isMatrixAttribute(attribute) {
    return SR5.matrixAttributes.hasOwnProperty(attribute);
  }
  _addMatrixParts(parts, atts) {
    if (Helpers.isMatrix(atts)) {
      if (!("matrix" in this.system))
        return;
      const matrix = this.system.matrix;
      if (matrix.hot_sim)
        parts.addUniquePart("SR5.HotSim", 2);
      if (matrix.running_silent)
        parts.addUniquePart("SR5.RunningSilent", -2);
    }
  }
  _addGlobalParts(parts) {
    if (this.system.modifiers.global) {
      parts.addUniquePart("SR5.Global", this.system.modifiers.global);
    }
  }
  _addDefenseParts(parts) {
    if (this.isVehicle()) {
      const pilot = this.findVehicleStat("pilot");
      if (pilot) {
        parts.addUniquePart(pilot.label, Helpers.calcTotal(pilot));
      }
      const skill = this.getVehicleTypeSkill();
      if (skill) {
        parts.addUniquePart("SR5.Vehicle.Maneuvering", Helpers.calcTotal(skill));
      }
    } else {
      const reaction = this.findAttribute("reaction");
      const intuition = this.findAttribute("intuition");
      if (reaction) {
        parts.addUniquePart(reaction.label || "SR5.Reaction", reaction.value);
      }
      if (intuition) {
        parts.addUniquePart(intuition.label || "SR5.Intuition", intuition.value);
      }
    }
    const mod = this.getModifier("defense");
    if (mod) {
      parts.addUniquePart("SR5.Bonus", mod);
    }
  }
  _addArmorParts(parts) {
    const armor = this.getArmor();
    if (armor) {
      parts.addUniquePart(armor.label || "SR5.Armor", armor.base);
      for (let part of armor.mod) {
        parts.addUniquePart(part.name, part.value);
      }
    }
  }
  skillActionData(skillId, options = {}) {
    var _a;
    const byLabel = options.byLabel || false;
    const skill = this.getSkill(skillId, { byLabel });
    if (!skill) {
      console.error(`Shadowrun 5e | Skill ${skillId} is not registered of actor ${this.id}`);
      return;
    }
    if (!SkillFlow.allowRoll(skill)) {
      (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.Warnings.SkillCantBeDefault"));
    }
    skillId = skill.id || skillId;
    const attribute = this.getAttribute(skill.attribute);
    const limit = attribute.limit || "";
    const spec = options.specialization || false;
    return DefaultValues.actionData({
      skill: skillId,
      spec,
      attribute: skill.attribute,
      limit: {
        base: 0,
        value: 0,
        mod: [],
        attribute: limit
      },
      test: SuccessTest.name
    });
  }
  setFlag(scope, key, value) {
    const newValue = Helpers.onSetFlag(value);
    return super.setFlag(scope, key, newValue);
  }
  getFlag(scope, key) {
    const data = super.getFlag(scope, key);
    return Helpers.onGetFlag(data);
  }
  getToken() {
    if (this._isLinkedToToken() && this.hasToken()) {
      const linked = true;
      const tokens = this.getActiveTokens(linked);
      return tokens[0].document;
    }
    return this.token;
  }
  _isLinkedToToken() {
    return this.prototypeToken.actorLink && !this.token;
  }
  hasToken() {
    return this.getActiveTokens().length > 0;
  }
  hasActivePlayerOwner() {
    const players = this.getActivePlayerOwners();
    return players.length > 0;
  }
  getActivePlayer() {
    var _a;
    if (!game.users)
      return null;
    if (!this.hasPlayerOwner)
      return null;
    for (const user of game.users.contents) {
      if (!user.active || user.isGM) {
        continue;
      }
      if (this.id === ((_a = user.character) == null ? void 0 : _a.id)) {
        return user;
      }
    }
    return null;
  }
  getActivePlayerOwners() {
    return Helpers.getPlayersWithPermission(this, "OWNER", true);
  }
  __addDamageToTrackValue(damage, track) {
    if (damage.value === 0)
      return track;
    if (track.value === track.max)
      return track;
    track = duplicate(track);
    track.value += damage.value;
    if (track.value > track.max) {
      console.error("Damage did overflow the track, which shouldn't happen at this stage. Damage has been set to max. Please use applyDamage.");
      track.value = track.max;
    }
    return track;
  }
  _addDamageToDeviceTrack(damage, device) {
    return __async(this, null, function* () {
      if (!device)
        return;
      let condition = device.getCondition();
      if (!condition)
        return damage;
      if (damage.value === 0)
        return;
      if (condition.value === condition.max)
        return;
      condition = this.__addDamageToTrackValue(damage, condition);
      const updateData = { ["system.technology.condition_monitor"]: condition };
      yield device.update(updateData);
    });
  }
  _addDamageToTrack(damage, track) {
    return __async(this, null, function* () {
      if (damage.value === 0)
        return;
      if (track.value === track.max)
        return;
      track = this.__addDamageToTrackValue(damage, track);
      const updateData = { [`system.track.${damage.type.value}`]: track };
      yield this.update(updateData);
    });
  }
  _addDamageToOverflow(damage, track) {
    return __async(this, null, function* () {
      if (damage.value === 0)
        return;
      if (track.overflow.value === track.overflow.max)
        return;
      const overflow = duplicate(track.overflow);
      overflow.value += damage.value;
      overflow.value = Math.min(overflow.value, overflow.max);
      const updateData = { [`system.track.${damage.type.value}.overflow`]: overflow };
      yield this.update(updateData);
    });
  }
  healDamage(track, healing) {
    return __async(this, null, function* () {
      var _a;
      console.log(`Shadowrun5e | Healing ${track} damage of ${healing} for actor`, this);
      if (!((_a = this.system) == null ? void 0 : _a.track.hasOwnProperty(track)))
        return;
      const current = Math.max(this.system.track[track].value - healing, 0);
      yield this.update({ [`system.track.${track}.value`]: current });
    });
  }
  healStunDamage(healing) {
    return __async(this, null, function* () {
      yield this.healDamage("stun", healing);
    });
  }
  healPhysicalDamage(healing) {
    return __async(this, null, function* () {
      yield this.healDamage("physical", healing);
    });
  }
  get canRecoverPhysicalDamage() {
    const stun = this.getStunTrack();
    if (!stun)
      return false;
    return RecoveryRules.canHealPhysicalDamage(stun.value);
  }
  addStunDamage(damage) {
    return __async(this, null, function* () {
      if (damage.type.value !== "stun")
        return damage;
      const track = this.getStunTrack();
      if (!track)
        return damage;
      const { overflow, rest } = this._calcDamageOverflow(damage, track);
      if (overflow.value > 0) {
        overflow.value = Math.floor(overflow.value / 2);
        overflow.type.value = "physical";
      }
      yield this._addDamageToTrack(rest, track);
      return overflow;
    });
  }
  addPhysicalDamage(damage) {
    return __async(this, null, function* () {
      if (damage.type.value !== "physical")
        return damage;
      const track = this.getPhysicalTrack();
      if (!track)
        return damage;
      const { overflow, rest } = this._calcDamageOverflow(damage, track);
      yield this._addDamageToTrack(rest, track);
      yield this._addDamageToOverflow(overflow, track);
    });
  }
  addMatrixDamage(damage) {
    return __async(this, null, function* () {
      if (damage.type.value !== "matrix")
        return damage;
      const device = this.getMatrixDevice();
      const track = this.getMatrixTrack();
      if (!track)
        return damage;
      const { overflow, rest } = this._calcDamageOverflow(damage, track);
      if (device) {
        yield this._addDamageToDeviceTrack(rest, device);
      }
      if (this.isIC() || this.isSprite()) {
        yield this._addDamageToTrack(rest, track);
      }
      return overflow;
    });
  }
  setMatrixDamage(value) {
    return __async(this, null, function* () {
      value = Math.max(value, 0);
      const damage = DefaultValues.damageData({
        type: { base: "matrix", value: "matrix" },
        base: value,
        value
      });
      let track = this.getMatrixTrack();
      if (!track)
        return;
      track.value = 0;
      if (value > 0)
        track = this.__addDamageToTrackValue(damage, track);
      const device = this.getMatrixDevice();
      if (device) {
        return yield device.update({ "system.technology.condition_monitor": track });
      }
      if (this.isIC()) {
        return yield this.update({ "system.track.matrix": track });
      }
      if (this.isMatrixActor) {
        return yield this.update({ "system.matrix.condition_monitor": track });
      }
    });
  }
  _calcDamageOverflow(damage, track) {
    const freeTrackDamage = track.max - track.value;
    const overflowDamage = damage.value > freeTrackDamage ? damage.value - freeTrackDamage : 0;
    const restDamage = damage.value - overflowDamage;
    const overflow = duplicate(damage);
    const rest = duplicate(damage);
    overflow.value = overflowDamage;
    rest.value = restDamage;
    return { overflow, rest };
  }
  getStunTrack() {
    if ("track" in this.system && "stun" in this.system.track)
      return this.system.track.stun;
  }
  getPhysicalTrack() {
    if ("track" in this.system && "physical" in this.system.track)
      return this.system.track.physical;
  }
  getMatrixTrack() {
    if ("track" in this.system && "matrix" in this.system.track) {
      return this.system.track.matrix;
    }
    if (this.isMatrixActor) {
      return this.system.matrix.condition_monitor;
    }
    const device = this.getMatrixDevice();
    if (!device)
      return void 0;
    return device.getCondition();
  }
  getModifiedArmor(damage) {
    var _a;
    if (!((_a = damage.ap) == null ? void 0 : _a.value)) {
      return this.getArmor();
    }
    const modified = duplicate(this.getArmor());
    if (modified) {
      modified.mod = PartsList.AddUniquePart(modified.mod, "SR5.DV", damage.ap.value);
      modified.value = Helpers.calcTotal(modified, { min: 0 });
    }
    return modified;
  }
  changeCombatInitiative(modifier) {
    return __async(this, null, function* () {
      var _a;
      if (modifier === 0)
        return;
      const combat = game.combat;
      const combatant = combat.getActorCombatant(this);
      if (!combatant)
        return;
      if (combatant.initiative + modifier < 0) {
        (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.MissingRessource.Initiative", { localize: true });
      }
      yield combat.adjustInitiative(combatant, modifier);
    });
  }
  hasDamageTracks() {
    return "track" in this.system;
  }
  asVehicle() {
    if (this.isVehicle())
      return this.data;
  }
  asCharacter() {
    if (this.isCharacter())
      return this.data;
  }
  asSpirit() {
    if (this.isSpirit()) {
      return this.data;
    }
  }
  asSprite() {
    if (this.isSprite()) {
      return this.data;
    }
  }
  asCritter() {
    if (this.isCritter()) {
      return this.data;
    }
  }
  asIC() {
    if (this.isIC()) {
      return this.data;
    }
  }
  getVehicleStats() {
    if (this.isVehicle() && "vehicle_stats" in this.system) {
      return this.system.vehicle_stats;
    }
  }
  addVehicleDriver(id) {
    return __async(this, null, function* () {
      var _a;
      if (!this.isVehicle())
        return;
      const driver = (_a = game.actors) == null ? void 0 : _a.get(id);
      if (!driver)
        return;
      yield this.update({ "system.driver": driver.id });
    });
  }
  removeVehicleDriver() {
    return __async(this, null, function* () {
      if (!this.hasDriver())
        return;
      yield this.update({ "system.driver": "" });
    });
  }
  hasDriver() {
    const data = this.asVehicle();
    if (!data)
      return false;
    return this.system.driver.length > 0;
  }
  getVehicleDriver() {
    var _a;
    if (!this.hasDriver())
      return;
    const data = this.asVehicle();
    if (!data)
      return;
    const driver = (_a = game.actors) == null ? void 0 : _a.get(this.system.driver);
    if (!driver)
      return;
    return driver;
  }
  addICHost(id) {
    return __async(this, null, function* () {
      var _a;
      if (!this.isIC())
        return;
      const item = (_a = game.items) == null ? void 0 : _a.get(id);
      if (!item || !item.isHost())
        return;
      const hostData = item.asHostData();
      if (!hostData)
        return;
      yield this._updateICHostData(hostData);
    });
  }
  _updateICHostData(hostData) {
    return __async(this, null, function* () {
      var _a;
      const updateData = {
        id: hostData._id,
        rating: hostData.data.rating,
        atts: duplicate(hostData.system.atts)
      };
      yield this.update({ "system.host": updateData }, { render: false });
      yield (_a = this.sheet) == null ? void 0 : _a.render();
    });
  }
  removeICHost() {
    return __async(this, null, function* () {
      if (!this.isIC())
        return;
      const updateData = {
        id: null,
        rating: 0,
        atts: null
      };
      yield this.update({ "system.host": updateData });
    });
  }
  hasHost() {
    const ic = this.asIC();
    if (!ic)
      return false;
    return ic && !!ic.system.host.id;
  }
  getICHost() {
    var _a, _b;
    const ic = this.asIC();
    if (!ic)
      return;
    return (_b = game.items) == null ? void 0 : _b.get((_a = ic == null ? void 0 : ic.system) == null ? void 0 : _a.host.id);
  }
  matchesActorTypes(types) {
    return types.includes(this.type);
  }
  getModifiers() {
    return __async(this, arguments, function* (ignoreScene = false, scene = canvas.scene) {
      const onActor = Modifiers.getModifiersFromEntity(this);
      if (onActor.hasActiveEnvironmental) {
        return onActor;
      } else if (ignoreScene || scene === null) {
        return new Modifiers(Modifiers.getDefaultModifiers());
      } else {
        return Modifiers.getModifiersFromEntity(scene);
      }
    });
  }
  setModifiers(modifiers) {
    return __async(this, null, function* () {
      yield Modifiers.setModifiersOnEntity(this, modifiers.modifiers);
    });
  }
  get isMatrixActor() {
    return "matrix" in this.system;
  }
  get matrixData() {
    if (!this.isMatrixActor)
      return;
    return this.system.matrix;
  }
  setMarks(target, marks, options) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      if (!canvas.ready)
        return;
      if (this.isIC() && this.hasHost()) {
        return yield (_a = this.getICHost()) == null ? void 0 : _a.setMarks(target, marks, options);
      }
      if (!this.isMatrixActor) {
        (_b = ui.notifications) == null ? void 0 : _b.error(game.i18n.localize("SR5.Errors.MarksCantBePlacedBy"));
        return console.error(`The actor type ${this.type} can't receive matrix marks!`);
      }
      if (target.actor && !target.actor.isMatrixActor) {
        (_c = ui.notifications) == null ? void 0 : _c.error(game.i18n.localize("SR5.Errors.MarksCantBePlacedOn"));
        return console.error(`The actor type ${target.actor.type} can't receive matrix marks!`);
      }
      if (!target.actor) {
        return console.error(`The token ${target.name} is missing it's actor`);
      }
      if (this.id === target.actor.id) {
        return;
      }
      const scene = (options == null ? void 0 : options.scene) || canvas.scene;
      const item = options == null ? void 0 : options.item;
      const markId = Helpers.buildMarkId(scene.id, target.id, item == null ? void 0 : item.id);
      const matrixData = this.matrixData;
      if (!matrixData)
        return;
      const currentMarks = (options == null ? void 0 : options.overwrite) ? 0 : this.getMarksById(markId);
      matrixData.marks[markId] = MatrixRules.getValidMarksCount(currentMarks + marks);
      yield this.update({ "system.matrix.marks": matrixData.marks });
    });
  }
  clearMarks() {
    return __async(this, null, function* () {
      const matrixData = this.matrixData;
      if (!matrixData)
        return;
      const updateData = {};
      for (const markId of Object.keys(matrixData.marks)) {
        updateData[`-=${markId}`] = null;
      }
      yield this.update({ "system.matrix.marks": updateData });
    });
  }
  clearMark(markId) {
    return __async(this, null, function* () {
      if (!this.isMatrixActor)
        return;
      const updateData = {};
      updateData[`-=${markId}`] = null;
      yield this.update({ "system.matrix.marks": updateData });
    });
  }
  getAllMarks() {
    const matrixData = this.matrixData;
    if (!matrixData)
      return;
    return matrixData.marks;
  }
  getMarks(target, item, options) {
    if (!canvas.ready)
      return 0;
    if (target instanceof SR5Item) {
      console.error("Not yet supported");
      return 0;
    }
    if (!target.actor || !target.actor.isMatrixActor)
      return 0;
    const scene = (options == null ? void 0 : options.scene) || canvas.scene;
    item = item || target instanceof _SR5Actor ? target.actor.getMatrixDevice() : void 0;
    const markId = Helpers.buildMarkId(scene.id, target.id, item == null ? void 0 : item.id);
    return this.getMarksById(markId);
  }
  getMarksById(markId) {
    var _a;
    return ((_a = this.matrixData) == null ? void 0 : _a.marks[markId]) || 0;
  }
  get matrixController() {
    if (this.isIC() && this.hasHost())
      return this.getICHost() || this;
    return this;
  }
  getAllMarkedDocuments() {
    const marks = this.matrixController.getAllMarks();
    if (!marks)
      return [];
    return Object.entries(marks).filter(([markId, marks2]) => Helpers.isValidMarkId(markId)).map(([markId, marks2]) => __spreadProps(__spreadValues({}, Helpers.getMarkIdDocuments(markId)), {
      marks: marks2,
      markId
    }));
  }
};
var SR5Actor = _SR5Actor;
SR5Actor.LOG_V10_COMPATIBILITY_WARNINGS = false;

// src/module/handlebars/BasicHelpers.ts
var registerBasicHelpers = () => {
  Handlebars.registerHelper("localizeOb", function(strId, obj) {
    if (obj)
      strId = obj[strId];
    return game.i18n.localize(strId);
  });
  Handlebars.registerHelper("localizeDocumentType", function(document2) {
    if (document2.type.length < 1)
      return "";
    const documentClass = document2 instanceof SR5Actor ? "ACTOR" : "ITEM";
    const documentTypeLabel = document2.type[0].toUpperCase() + document2.type.slice(1);
    const i18nTypeLabel = `${documentClass}.Type${documentTypeLabel}`;
    return game.i18n.localize(i18nTypeLabel);
  });
  Handlebars.registerHelper("localizeSkill", function(skill) {
    return skill.label ? game.i18n.localize(skill.label) : skill.name;
  });
  Handlebars.registerHelper("toHeaderCase", function(str) {
    if (str)
      return Helpers.label(str);
    return "";
  });
  Handlebars.registerHelper("concatStrings", function(...args) {
    return args.filter((a) => typeof a === "string").join("");
  });
  Handlebars.registerHelper("concat", function(strs, c = ",") {
    if (Array.isArray(strs)) {
      return strs.join(c);
    }
    return strs;
  });
  Handlebars.registerHelper("for", function(from, to, options) {
    let accum = "";
    for (let i = from; i < to; i += 1) {
      accum += options.fn(i);
    }
    return accum;
  });
  Handlebars.registerHelper("modulo", function(v1, v2) {
    return v1 % v2;
  });
  Handlebars.registerHelper("divide", function(v1, v2) {
    if (v2 === 0)
      return 0;
    return v1 / v2;
  });
  Handlebars.registerHelper("hasprop", function(obj, prop, options) {
    if (obj.hasOwnProperty(prop)) {
      return options.fn(this);
    } else
      return options.inverse(this);
  });
  Handlebars.registerHelper("ifin", function(val, arr, options) {
    if (arr.includes(val))
      return options.fn(this);
    else
      return options.inverse(this);
  });
  Handlebars.registerHelper("ifgt", function(v1, v2, options) {
    if (v1 > v2)
      return options.fn(this);
    else
      return options.inverse(this);
  });
  Handlebars.registerHelper("iflt", function(v1, v2, options) {
    if (v1 < v2)
      return options.fn(this);
    else
      return options.inverse(this);
  });
  Handlebars.registerHelper("iflte", function(v1, v2, options) {
    if (v1 <= v2)
      return options.fn(this);
    else
      return options.inverse(this);
  });
  Handlebars.registerHelper("ifne", function(v1, v2, options) {
    if (v1 !== v2)
      return options.fn(this);
    else
      return options.inverse(this);
  });
  Handlebars.registerHelper("ife", function(v1, v2, options) {
    if (v1 === v2)
      return options.fn(this);
    else
      return options.inverse(this);
  });
  Handlebars.registerHelper("empty", function(value) {
    if (foundry.utils.getType(value) === "Array")
      return value.length === 0;
    if (foundry.utils.getType(value) === "Object")
      return Object.keys(value).length === 0;
    if (foundry.utils.getType(value) === "String")
      return value.length === 0;
  });
  Handlebars.registerHelper("not", function(v1) {
    return !v1;
  });
  Handlebars.registerHelper("sum", function(v1, v2) {
    return v1 + v2;
  });
  Handlebars.registerHelper("isDefined", function(value) {
    return value !== void 0 && value !== null;
  });
  Handlebars.registerHelper("fallbackValue", function(value, defaultValue) {
    return new Handlebars.SafeString(value != null ? value : defaultValue);
  });
  Handlebars.registerHelper("log", function(value) {
    console.log(value);
  });
  Handlebars.registerHelper("buildName", function(options) {
    const hash = Helpers.orderKeys(options.hash);
    const name = Object.values(hash).reduce((retVal, current, index) => {
      if (index > 0)
        retVal += ".";
      return retVal + current;
    }, "");
    return new Handlebars.SafeString(name);
  });
  Handlebars.registerHelper("disabledHelper", function(value) {
    const val = Boolean(value);
    return val ? val : void 0;
  });
  Handlebars.registerHelper("localizeShortened", function(label, length, options) {
    return new Handlebars.SafeString(Helpers.shortenAttributeLocalization(label, length));
  });
  Handlebars.registerHelper("objValue", function(obj, key) {
    return obj[key] || "";
  });
};

// src/module/handlebars/HandlebarManager.ts
var HandlebarManager = class {
  static loadTemplates() {
    return __async(this, null, function* () {
      yield preloadHandlebarsTemplates();
    });
  }
  static registerHelpers() {
    registerBasicHelpers();
    registerRollAndLabelHelpers();
    registerItemLineHelpers();
    registerSkillLineHelpers();
    registerAppHelpers();
  }
};

// src/module/migrator/VersionMigration.ts
var _VersionMigration = class {
  constructor() {
    this.m_Abort = false;
  }
  get SourceVersionFriendlyName() {
    return `v${this.SourceVersion}`;
  }
  get TargetVersionFriendlyName() {
    return `v${this.TargetVersion}`;
  }
  abort(reason) {
    var _a;
    this.m_Abort = true;
    this.m_AbortReason = reason;
    (_a = ui.notifications) == null ? void 0 : _a.error(`Data migration has been aborted: ${reason}`, { permanent: true });
  }
  Migrate(game2) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      (_a = ui.notifications) == null ? void 0 : _a.info(`${game2.i18n.localize("SR5.MIGRATION.BeginNotification")} ${this.SourceVersionFriendlyName} -> ${this.TargetVersionFriendlyName}.`);
      (_b = ui.notifications) == null ? void 0 : _b.warn(game2.i18n.localize("SR5.MIGRATION.DoNotCloseNotification"), {
        permanent: true
      });
      const entityUpdates = /* @__PURE__ */ new Map();
      yield this.PreMigrateItemData(game2, entityUpdates);
      if (this.m_Abort) {
        return Promise.reject(this.m_AbortReason);
      }
      yield this.IterateItems(game2, entityUpdates);
      yield this.PostMigrateItemData(game2, entityUpdates);
      if (this.m_Abort) {
        return Promise.reject(this.m_AbortReason);
      }
      yield this.PreMigrateActorData(game2, entityUpdates);
      if (this.m_Abort) {
        return Promise.reject(this.m_AbortReason);
      }
      yield this.IterateActors(game2, entityUpdates);
      yield this.PostMigrateActorData(game2, entityUpdates);
      if (this.m_Abort) {
        return Promise.reject(this.m_AbortReason);
      }
      yield this.PreMigrateSceneData(game2, entityUpdates);
      if (this.m_Abort) {
        return Promise.reject(this.m_AbortReason);
      }
      yield this.IterateScenes(game2, entityUpdates);
      yield this.PostMigrateSceneData(game2, entityUpdates);
      if (this.m_Abort) {
        return Promise.reject(this.m_AbortReason);
      }
      yield this.Apply(entityUpdates);
      yield game2.settings.set(_VersionMigration.MODULE_NAME, _VersionMigration.KEY_DATA_VERSION, this.TargetVersion);
      (_c = ui.notifications) == null ? void 0 : _c.info(`${game2.i18n.localize("SR5.MIGRATION.SuccessNotification")} ${this.TargetVersion}.`, { permanent: true });
    });
  }
  Apply(documentUpdates) {
    return __async(this, null, function* () {
      for (const [entity, { updateData, embeddedItems }] of documentUpdates) {
        if (embeddedItems !== null) {
          const actor = entity;
          yield actor.updateEmbeddedDocuments("Item", embeddedItems);
        }
        if (updateData !== null) {
          yield entity.update(updateData, { enforceTypes: false });
        }
      }
    });
  }
  IterateScenes(game2, entityUpdates) {
    return __async(this, null, function* () {
      for (const scene of game2.scenes.contents) {
        try {
          if (!(yield this.ShouldMigrateSceneData(scene))) {
            continue;
          }
          console.log(`Migrating Scene entity ${scene.name}`);
          const updateData = yield this.MigrateSceneData(duplicate(scene.data));
          expandObject(updateData);
          entityUpdates.set(scene, {
            updateData,
            embeddedItems: null
          });
          for (const token of scene.data.tokens) {
            if (!token.actor || token.data.actorLink)
              continue;
            if (foundry.utils.isEmpty(token.actor.data))
              continue;
            const updateData2 = yield this.MigrateActorData(foundry.utils.duplicate(token.actor.data));
            expandObject(updateData2);
            entityUpdates.set(token.actor, {
              updateData: updateData2.data || null,
              embeddedItems: updateData2.items || null
            });
          }
          if (foundry.utils.isEmpty(updateData)) {
            continue;
          }
          expandObject(updateData);
          entityUpdates.set(scene, {
            updateData,
            embeddedItems: null
          });
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      }
    });
  }
  IterateItems(game2, entityUpdates) {
    return __async(this, null, function* () {
      for (const item of game2.items.contents) {
        try {
          if (!(yield this.ShouldMigrateItemData(item.data))) {
            continue;
          }
          console.log(`Migrating Item: ${item.name}`);
          const updateData = yield this.MigrateItemData(item.data);
          if (foundry.utils.isEmpty(updateData)) {
            continue;
          }
          expandObject(updateData);
          entityUpdates.set(item, {
            updateData,
            embeddedItems: null
          });
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      }
    });
  }
  IterateActors(game2, entityUpdates) {
    return __async(this, null, function* () {
      for (const actor of game2.actors.contents) {
        try {
          if (!(yield this.ShouldMigrateActorData(actor.data))) {
            continue;
          }
          console.log(`Migrating Actor ${actor.name}`);
          console.log(actor);
          const updateData = yield this.MigrateActorData(duplicate(actor.data));
          console.log(updateData);
          let items = [];
          if (updateData.items) {
            items = updateData.items;
            delete updateData.items;
          }
          expandObject(updateData);
          entityUpdates.set(actor, {
            updateData,
            embeddedItems: items
          });
        } catch (error) {
          console.error(error);
          return Promise.reject(error);
        }
      }
    });
  }
  IterateActorItems(actorData, updateData) {
    return __async(this, null, function* () {
      let hasItemUpdates = false;
      if (actorData.items !== void 0) {
        const items = yield Promise.all(actorData.items.map((itemData) => __async(this, null, function* () {
          if (itemData instanceof SR5Item)
            console.error("Shadowrun 5e | Migration encountered an Item when it should have encountered ItemData / Object");
          if (!(yield this.ShouldMigrateItemData(itemData)))
            return itemData;
          let itemUpdate = yield this.MigrateItemData(itemData);
          hasItemUpdates = true;
          itemUpdate["_id"] = itemData._id;
          return mergeObject(itemData, itemUpdate.data, {
            enforceTypes: false,
            inplace: false
          });
        })));
        if (hasItemUpdates) {
          updateData.items = items;
        }
      }
      return updateData;
    });
  }
  ShouldMigrateSceneData(scene) {
    return __async(this, null, function* () {
      return false;
    });
  }
  MigrateSceneData(scene) {
    return __async(this, null, function* () {
      return {};
    });
  }
  PreMigrateSceneData(game2, entityUpdates) {
    return __async(this, null, function* () {
    });
  }
  PostMigrateSceneData(game2, entityUpdates) {
    return __async(this, null, function* () {
    });
  }
  ShouldMigrateItemData(item) {
    return __async(this, null, function* () {
      return false;
    });
  }
  MigrateItemData(item) {
    return __async(this, null, function* () {
      return {};
    });
  }
  PreMigrateItemData(game2, entityUpdates) {
    return __async(this, null, function* () {
    });
  }
  PostMigrateItemData(game2, entityUpdates) {
    return __async(this, null, function* () {
    });
  }
  ShouldMigrateActorData(actor) {
    return __async(this, null, function* () {
      return false;
    });
  }
  MigrateActorData(actor) {
    return __async(this, null, function* () {
      return {};
    });
  }
  PreMigrateActorData(game2, entityUpdates) {
    return __async(this, null, function* () {
    });
  }
  PostMigrateActorData(game2, entityUpdates) {
    return __async(this, null, function* () {
    });
  }
  MigrateCompendiumPack(pack) {
    return __async(this, null, function* () {
      if (!["Actor", "Item", "Scene"].includes(pack.metadata.type))
        return;
      yield pack.migrate({});
      const documents = yield pack.getDocuments();
      for (let document2 of documents) {
        try {
          let updateData = null;
          if (pack.metadata.type === "Item") {
            updateData = yield this.MigrateItemData(foundry.utils.duplicate(document2.data));
            if (foundry.utils.isEmpty(updateData)) {
              continue;
            }
            if (updateData.data) {
              expandObject(updateData.data);
              document2.update(updateData.data);
            }
          } else if (pack.metadata.type === "Actor") {
            updateData = yield this.MigrateActorData(foundry.utils.duplicate(document2.data));
            if (foundry.utils.isEmpty(updateData)) {
              continue;
            }
            if (updateData.items) {
              yield document2.updateEmbeddedDocuments("Item", updateData.items);
            }
            if (updateData.effects) {
              yield document2.updateEmbeddedDocuments("Effect", updateData.effects);
            }
            if (updateData.data) {
              expandObject(updateData.data);
              yield document2.update(updateData.data);
            }
          } else if (pack.metadata.type === "Scene") {
            updateData = yield this.MigrateSceneData(foundry.utils.duplicate(document2.data));
            if (foundry.utils.isEmpty(updateData)) {
              continue;
            }
            if (updateData.data) {
              expandObject(updateData.data);
              yield document2.update(updateData.data);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
      console.log(`Migrated all ${pack.metadata.type} entities from Compendium ${pack.collection}`);
    });
  }
};
var VersionMigration = _VersionMigration;
VersionMigration.MODULE_NAME = "shadowrun5e";
VersionMigration.KEY_DATA_VERSION = "systemMigrationVersion";
VersionMigration.NO_VERSION = "0";

// src/module/migrator/versions/Version0_8_0.ts
var Version0_8_0 = class extends VersionMigration {
  get SourceVersion() {
    return "0.7.6";
  }
  get TargetVersion() {
    return Version0_8_0.TargetVersion;
  }
  static get TargetVersion() {
    return "0.8.0";
  }
  ShouldMigrateItemData(data) {
    return __async(this, null, function* () {
      return this._ShouldMigrateItemData(data);
    });
  }
  _ShouldMigrateItemData(data) {
    return ["weapon", "spell"].includes(data.type);
  }
  ShouldMigrateSceneData(scene) {
    return __async(this, null, function* () {
      return scene.tokens.size > 0;
    });
  }
  ShouldMigrateActorData(data) {
    return __async(this, null, function* () {
      return data.items.contents.filter((i) => this._ShouldMigrateItemData(i.data)).length > 0;
    });
  }
  MigrateItemData(data) {
    return __async(this, null, function* () {
      const updateData = {};
      Helpers.injectActionTestsIntoChangeData(data.type, data, data);
      return updateData;
    });
  }
  MigrateActorData(data) {
    return __async(this, null, function* () {
      var _a;
      let updateData = {
        items: []
      };
      updateData = yield this.IterateActorItems(data, updateData);
      if (updateData.data && foundry.utils.isEmpty(updateData.data))
        delete updateData.data;
      if (((_a = updateData.items) == null ? void 0 : _a.length) === 0)
        delete updateData.items;
      return updateData;
    });
  }
};

// src/module/migrator/Migrator.ts
var _Migrator = class {
  static get isEmptyWorld() {
    var _a, _b, _c;
    return ((_a = game.actors) == null ? void 0 : _a.contents.length) === 0 && ((_b = game.items) == null ? void 0 : _b.contents.length) === 0 && ((_c = game.scenes) == null ? void 0 : _c.contents.length) === 0 && _Migrator.onlySystemPacks;
  }
  static get onlySystemPacks() {
    return game.packs.contents.filter((pack) => pack.metadata.packageType !== "system" && pack.metadata.packageName !== "shadowrun5e").length === 0;
  }
  static InitWorldForMigration() {
    return __async(this, null, function* () {
      console.log("Shadowrun 5e | Initializing an empty world for future migrations");
      yield game.settings.set(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION, game.system.version);
    });
  }
  static BeginMigration() {
    return __async(this, null, function* () {
      let currentVersion = game.settings.get(VersionMigration.MODULE_NAME, VersionMigration.KEY_DATA_VERSION);
      if (currentVersion === void 0 || currentVersion === null) {
        currentVersion = VersionMigration.NO_VERSION;
      }
      const migrations = _Migrator.s_Versions.filter(({ versionNumber }) => {
        return this.compareVersion(versionNumber, currentVersion) === 1;
      });
      if (migrations.length === 0) {
        return;
      }
      const localizedWarningTitle = game.i18n.localize("SR5.MIGRATION.WarningTitle");
      const localizedWarningHeader = game.i18n.localize("SR5.MIGRATION.WarningHeader");
      const localizedWarningRequired = game.i18n.localize("SR5.MIGRATION.WarningRequired");
      const localizedWarningDescription = game.i18n.localize("SR5.MIGRATION.WarningDescription");
      const localizedWarningBackup = game.i18n.localize("SR5.MIGRATION.WarningBackup");
      const localizedWarningBegin = game.i18n.localize("SR5.MIGRATION.BeginMigration");
      const d = new Dialog({
        title: localizedWarningTitle,
        content: `<h2 style="color: red; text-align: center">${localizedWarningHeader}</h2><p style="text-align: center"><i>${localizedWarningRequired}</i></p><p>${localizedWarningDescription}</p><h3 style="color: red">${localizedWarningBackup}</h3>`,
        buttons: {
          ok: {
            label: localizedWarningBegin,
            callback: () => this.migrate(migrations)
          }
        },
        default: "ok"
      });
      d.render(true);
    });
  }
  static migrate(migrations) {
    return __async(this, null, function* () {
      migrations.sort((a, b) => {
        return this.compareVersion(a.versionNumber, b.versionNumber);
      });
      yield this.migrateWorld(game, migrations);
      yield this.migrateCompendium(game, migrations);
      const localizedWarningTitle = game.i18n.localize("SR5.MIGRATION.SuccessTitle");
      const localizedWarningHeader = game.i18n.localize("SR5.MIGRATION.SuccessHeader");
      const localizedSuccessDescription = game.i18n.localize("SR5.MIGRATION.SuccessDescription");
      const localizedSuccessPacksInfo = game.i18n.localize("SR5.MIGRATION.SuccessPacksInfo");
      const localizedSuccessConfirm = game.i18n.localize("SR5.MIGRATION.SuccessConfirm");
      const packsDialog = new Dialog({
        title: localizedWarningTitle,
        content: `<h2 style="text-align: center; color: green">${localizedWarningHeader}</h2><p>${localizedSuccessDescription}</p><p style="text-align: center"><i>${localizedSuccessPacksInfo}</i></p>`,
        buttons: {
          ok: {
            icon: '<i class="fas fa-check"></i>',
            label: localizedSuccessConfirm
          }
        },
        default: "ok"
      });
      packsDialog.render(true);
    });
  }
  static migrateWorld(game2, migrations) {
    return __async(this, null, function* () {
      for (const { migration } of migrations) {
        yield migration.Migrate(game2);
      }
    });
  }
  static migrateCompendium(game2, migrations) {
    return __async(this, null, function* () {
      var _a;
      const packs = (_a = game2.packs) == null ? void 0 : _a.filter((pack) => pack.metadata.package === "world" && ["Actor", "Item", "Scene"].includes(pack.metadata.type));
      if (!packs)
        return;
      for (const pack of packs) {
        for (const { migration } of migrations) {
          yield migration.MigrateCompendiumPack(pack);
        }
      }
    });
  }
  static compareVersion(v1, v2) {
    const s1 = v1.split(".").map((s) => parseInt(s, 10));
    const s2 = v2.split(".").map((s) => parseInt(s, 10));
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
      if (s1[i] > s2[i])
        return 1;
      if (s1[i] < s2[i])
        return -1;
    }
    return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
  }
};
var Migrator = _Migrator;
Migrator.s_Versions = [
  { versionNumber: Version0_8_0.TargetVersion, migration: new Version0_8_0() }
];

// src/module/settings.ts
var registerSystemSettings = () => {
  game.settings.register(SYSTEM_NAME, "diagonalMovement", {
    name: "SETTINGS.DiagonalMovementName",
    hint: "SETTINGS.DiagonalMovementDescription",
    scope: "world",
    config: true,
    type: String,
    default: "1-2-1",
    choices: {
      "1-1-1": "SETTINGS.IgnoreDiagonal",
      "1-2-1": "SETTINGS.EstimateDiagonal",
      "EUCL": "SETTINGS.Euclidean"
    },
    onChange: (rule) => {
      if (canvas.ready) {
        canvas.grid.diagonalRule = rule;
      }
    }
  });
  game.settings.register(SYSTEM_NAME, "applyLimits", {
    name: "SETTINGS.ApplyLimitsName",
    hint: "SETTINGS.ApplyLimitsDescription",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_NAME, VersionMigration.KEY_DATA_VERSION, {
    name: "System Data Version.",
    scope: "world",
    config: false,
    type: String,
    default: "0"
  });
  game.settings.register(SYSTEM_NAME, FLAGS.ShowGlitchAnimation, {
    name: "SETTINGS.ShowGlitchAnimationName",
    hint: "SETTINGS.ShowGlitchAnimationDescription",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput, {
    name: "SETTINGS.ShowTokenNameForChatOutputName",
    hint: "SETTINGS.ShowTokenNameForChatOutputDescription",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_NAME, FLAGS.OnlyAllowRollOnDefaultableSkills, {
    name: "SETTINGS.OnlyAllowRollOnDefaultableSkills",
    hint: "SETTINGS.OnlyAllowRollOnDefaultableSkillsDescription",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_NAME, FLAGS.ShowSkillsWithDetails, {
    name: "SETTINGS.ShowSkillsWithDetails",
    hint: "SETTINGS.ShowSkillsWithDetailsDescription",
    scope: "client",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat, {
    name: "SETTINGS.OnlyAutoRollNPCInCombat",
    hint: "SETTINGS.OnlyAutoRollNPCInCombatDescription",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
  game.settings.register(SYSTEM_NAME, FLAGS.TokenHealthBars, {
    name: "SETTINGS.TokenHealthBars",
    hint: "SETTINGS.TokenHealthBarsDescription",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  game.settings.register(SYSTEM_NAME, FLAGS.HideGMOnlyChatContent, {
    name: "SETTINGS.HideGMOnlyChatContent",
    hint: "SETTINGS.HideGMOnlyChatContentDescription",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
  game.settings.register(SYSTEM_NAME, FLAGS.MustHaveRessourcesOnTest, {
    name: "SETTINGS.MustHaveRessourcesOnTest",
    hint: "SETTINGS.MustHaveRessourcesOnTestDescription",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
};

// src/module/effects.ts
function onManageActiveEffect(event, owner) {
  return __async(this, null, function* () {
    if (owner.isOwned)
      return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.");
    event.preventDefault();
    const icon = event.currentTarget;
    const item = event.currentTarget.closest(".list-item");
    const effect = item.dataset.itemId ? owner.effects.get(item.dataset.itemId) : null;
    switch (icon.dataset.action) {
      case "create":
        return owner.createEmbeddedDocuments("ActiveEffect", [{
          label: game.i18n.localize("SR5.ActiveEffect.New"),
          origin: owner.uuid,
          "duration.rounds": item.dataset.effectType === "temporary" ? 1 : void 0,
          disabled: item.dataset.effectType === "inactive"
        }]);
      case "edit":
        return effect.sheet.render(true);
      case "delete":
        const userConsented = yield Helpers.confirmDeletion();
        if (!userConsented)
          return;
        return effect.delete();
      case "toggle":
        return effect.toggleDisabled();
      case "open-origin":
        return effect.renderSourceSheet();
      default:
        console.error(`An active effect with the id '${effect}' couldn't be managed as no action has been defined within the template.`);
        return;
    }
  });
}
function prepareActiveEffectCategories(effects) {
  const categories = {
    temporary: {
      type: "temporary",
      label: game.i18n.localize("SR5.ActiveEffect.Types.Temporary"),
      effects: []
    },
    passive: {
      type: "passive",
      label: game.i18n.localize("SR5.ActiveEffect.Types.Passive"),
      effects: []
    },
    inactive: {
      type: "inactive",
      label: game.i18n.localize("SR5.ActiveEffect.Types.Inactive"),
      effects: []
    }
  };
  for (let effect of effects) {
    effect._getSourceName();
    if (effect.data.disabled)
      categories.inactive.effects.push(effect);
    else if (effect.isTemporary)
      categories.temporary.effects.push(effect);
    else
      categories.passive.effects.push(effect);
  }
  return categories;
}

// src/module/item/SR5ItemSheet.ts
var SR5ItemSheet = class extends ItemSheet {
  constructor() {
    super(...arguments);
    this._shownDesc = [];
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["sr5", "sheet", "item"],
      width: 650,
      height: 450,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheetbody" }]
    });
  }
  get template() {
    const path = "systems/shadowrun5e/dist/templates/item/";
    return `${path}${this.item.data.type}.html`;
  }
  getData(options) {
    return __async(this, null, function* () {
      let data = __superGet(SR5ItemSheet.prototype, this, "getData").call(this, options);
      data.type = data.data.type;
      data.system = data.item.system;
      data.data = data.item.system;
      const itemData = this.item.system;
      if (itemData.action) {
        try {
          const { action } = itemData;
          if (action.mod === 0)
            delete action.mod;
          if (action.limit === 0)
            delete action.limit;
          if (action.damage) {
            if (action.damage.mod === 0)
              delete action.damage.mod;
            if (action.damage.ap.mod === 0)
              delete action.damage.ap.mod;
          }
          if (action.limit) {
            if (action.limit.mod === 0)
              delete action.limit.mod;
          }
        } catch (e) {
          console.error(e);
        }
      }
      if (itemData.technology) {
        try {
          const tech = itemData.technology;
          if (tech.rating === 0)
            delete tech.rating;
          if (tech.quantity === 0)
            delete tech.quantity;
          if (tech.cost === 0)
            delete tech.cost;
        } catch (e) {
          console.log(e);
        }
      }
      data["config"] = SR5;
      const items = this.item.items;
      const [ammunition, weaponMods, armorMods] = items.reduce((parts, item) => {
        if (item.type === "ammo")
          parts[0].push(item.data);
        if (item.type === "modification" && "type" in item.system && item.system.type === "weapon")
          parts[1].push(item._source);
        if (item.type === "modification" && "type" in item.system && item.system.type === "armor")
          parts[2].push(item._source);
        return parts;
      }, [[], [], []]);
      data["ammunition"] = ammunition;
      data["weaponMods"] = weaponMods;
      data["armorMods"] = armorMods;
      data["activeSkills"] = this._getSortedActiveSkillsForSelect();
      data["attributes"] = this._getSortedAttributesForSelect();
      data["limits"] = this._getSortedLimitsForSelect();
      data["effects"] = prepareActiveEffectCategories(this.document.effects);
      if (this.object.isHost()) {
        data["markedDocuments"] = this.object.getAllMarkedDocuments();
      }
      if (this.item.canBeNetworkController) {
        data["networkDevices"] = this.item.networkDevices;
      }
      if (this.item.canBeNetworkDevice) {
        data["networkController"] = this.item.networkController;
      }
      data.tests = game.shadowrun5e.tests;
      data.opposedTests = game.shadowrun5e.opposedTests;
      data.activeTests = game.shadowrun5e.activeTests;
      data.resistTests = game.shadowrun5e.resistTests;
      data.descriptionHTML = yield TextEditor.enrichHTML(this.item.system.description.value, {
        async: true
      });
      return data;
    });
  }
  _getSortedLimitsForSelect() {
    return Helpers.sortConfigValuesByTranslation(SR5.limits);
  }
  _getSortedAttributesForSelect() {
    return Helpers.sortConfigValuesByTranslation(SR5.attributes);
  }
  _getSortedActiveSkillsForSelect() {
    const actor = this.item.actorOwner;
    if (!actor || actor.isIC())
      return Helpers.sortConfigValuesByTranslation(SR5.activeSkills);
    const activeSkills = Helpers.sortSkills(actor.getActiveSkills());
    const activeSkillsForSelect = {};
    for (const [id, skill] of Object.entries(activeSkills)) {
      const key = skill.name || id;
      const label = skill.label || skill.name;
      activeSkillsForSelect[key] = label;
    }
    return activeSkillsForSelect;
  }
  _getNetworkDevices() {
    return [];
  }
  activateListeners(html) {
    super.activateListeners(html);
    Helpers.setupCustomCheckbox(this, html);
    this.form.ondragover = (event) => this._onDragOver(event);
    this.form.ondrop = (event) => this._onDrop(event);
    html.find(".effect-control").click((event) => onManageActiveEffect(event, this.document));
    html.find(".edit-item").click(this._onEditItem.bind(this));
    html.find(".open-source-pdf").on("click", this._onOpenSourcePdf.bind(this));
    html.find(".has-desc").click((event) => {
      event.preventDefault();
      const item = $(event.currentTarget).parents(".list-item");
      const iid = $(item).data().item;
      const field = item.next();
      field.toggle();
      if (iid) {
        if (field.is(":visible"))
          this._shownDesc.push(iid);
        else
          this._shownDesc = this._shownDesc.filter((val) => val !== iid);
      }
    });
    html.find(".hidden").hide();
    html.find(".entity-remove").on("click", this._onEntityRemove.bind(this));
    html.find(".add-new-ammo").click(this._onAddNewAmmo.bind(this));
    html.find(".ammo-equip").click(this._onAmmoEquip.bind(this));
    html.find(".ammo-delete").click(this._onAmmoRemove.bind(this));
    html.find(".ammo-reload").click(this._onAmmoReload.bind(this));
    html.find(".add-new-mod").click(this._onAddWeaponMod.bind(this));
    html.find(".mod-equip").click(this._onWeaponModEquip.bind(this));
    html.find(".mod-delete").click(this._onWeaponModRemove.bind(this));
    html.find(".add-new-license").click(this._onAddLicense.bind(this));
    html.find(".license-delete").on("click", this._onRemoveLicense.bind(this));
    html.find(".network-clear").on("click", this._onRemoveAllNetworkDevices.bind(this));
    html.find(".network-device-remove").on("click", this._onRemoveNetworkDevice.bind(this));
    html.find(".marks-qty").on("change", this._onMarksQuantityChange.bind(this));
    html.find(".marks-add-one").on("click", (event) => __async(this, null, function* () {
      return this._onMarksQuantityChangeBy(event, 1);
    }));
    html.find(".marks-remove-one").on("click", (event) => __async(this, null, function* () {
      return this._onMarksQuantityChangeBy(event, -1);
    }));
    html.find(".marks-delete").on("click", this._onMarksDelete.bind(this));
    html.find(".marks-clear-all").on("click", this._onMarksClearAll.bind(this));
    html.find(".origin-link").on("click", this._onOpenOriginLink.bind(this));
    html.find(".controller-remove").on("click", this._onControllerRemove.bind(this));
  }
  _onDrop(event) {
    return __async(this, null, function* () {
      var _a;
      if (!game.items || !game.actors || !game.scenes)
        return;
      event.preventDefault();
      event.stopPropagation();
      let data;
      try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch (err) {
        return console.log("Shadowrun 5e | drop error");
      }
      if (!data)
        return;
      if (this.item.isWeapon() && data.type === "Item") {
        let item;
        if (data.data) {
          if (this.item.isOwned && data.actorId === ((_a = this.item.actor) == null ? void 0 : _a.id) && data.data._id === this.item.id) {
            return console.warn("Shadowrun 5e | Cant drop items onto themself");
          }
          item = data;
        } else if (data.pack) {
          item = yield Helpers.getEntityFromCollection(data.pack, data.id);
        } else {
          item = yield fromUuid(data.uuid);
        }
        if (!item)
          return console.error("Shadowrun 5e | Item could not be created from DropData", data);
        return yield this.item.createNestedItem(item._source);
      }
      if (this.item.isHost() && data.type === "Actor") {
        const actor = yield fromUuid(data.uuid);
        if (!actor || !actor.id)
          return console.error("Shadowrun 5e | Actor could not be retrieved from DropData", data);
        return yield this.item.addIC(actor.id, data.pack);
      }
      if (this.item.canBeNetworkController && data.type === "Item") {
        const item = yield fromUuid(data.uuid);
        if (!item || !item.id)
          return console.error("Shadowrun 5e | Item could not be retrieved from DropData", data);
        return yield this.item.addNetworkDevice(item);
      }
    });
  }
  _eventId(event) {
    event.preventDefault();
    return event.currentTarget.closest(".list-item").dataset.itemId;
  }
  _onOpenSourcePdf(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      yield this.item.openPdfSource();
    });
  }
  _onEditItem(event) {
    return __async(this, null, function* () {
      var _a;
      const item = this.item.getOwnedItem(this._eventId(event));
      if (item) {
        (_a = item.sheet) == null ? void 0 : _a.render(true);
      }
    });
  }
  _onEntityRemove(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const entityRemove = $(event.currentTarget).closest(".entity-remove");
      const list = entityRemove.data("list");
      const position = entityRemove.data("position");
      if (!list)
        return;
      switch (list) {
        case "ic":
          yield this.item.removeIC(position);
          break;
      }
    });
  }
  _onAddLicense(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      yield this.item.addNewLicense();
    });
  }
  _onRemoveLicense(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const index = event.currentTarget.dataset.index;
      if (index >= 0)
        yield this.item.removeLicense(index);
    });
  }
  _onWeaponModRemove(event) {
    return __async(this, null, function* () {
      yield this._onOwnedItemRemove(event);
    });
  }
  _onWeaponModEquip(event) {
    return __async(this, null, function* () {
      yield this.item.equipWeaponMod(this._eventId(event));
    });
  }
  _onAddWeaponMod(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const type = "modification";
      const itemData = {
        name: `New ${Helpers.label(type)}`,
        type,
        system: { type: "weapon" }
      };
      const item = new SR5Item(itemData, { parent: this.item });
      yield this.item.createNestedItem(item._source);
    });
  }
  _onAmmoReload(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      yield this.item.reloadAmmo();
    });
  }
  _onAmmoRemove(event) {
    return __async(this, null, function* () {
      yield this._onOwnedItemRemove(event);
    });
  }
  _onAmmoEquip(event) {
    return __async(this, null, function* () {
      yield this.item.equipAmmo(this._eventId(event));
    });
  }
  _onAddNewAmmo(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const type = "ammo";
      const itemData = {
        name: `New ${Helpers.label(type)}`,
        type
      };
      const item = new SR5Item(itemData, { parent: this.item });
      yield this.item.createNestedItem(item._source);
    });
  }
  _onOwnedItemRemove(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      1;
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      yield this.item.deleteOwnedItem(this._eventId(event));
    });
  }
  _onRemoveAllNetworkDevices(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      yield this.item.removeAllNetworkDevices();
    });
  }
  _onRemoveNetworkDevice(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      const networkDeviceIndex = Helpers.parseInputToNumber(event.currentTarget.closest(".list-item").dataset.listItemIndex);
      yield this.item.removeNetworkDevice(networkDeviceIndex);
    });
  }
  _findActiveList() {
    return $(this.element).find(".tab.active .scroll-area");
  }
  fixStaleRenderedState() {
    if (this._state === Application.RENDER_STATES.RENDERED && ui.windows[this.appId] === void 0) {
      console.warn(`SR5ItemSheet app for ${this.document.name} is set as RENDERED but has no window registered. Fixing app internal render state. This is a known bug.`);
      this._state = Application.RENDER_STATES.CLOSED;
    }
  }
  _render() {
    return __async(this, arguments, function* (force = false, options = {}) {
      this._saveScrollPositions();
      yield __superGet(SR5ItemSheet.prototype, this, "_render").call(this, force, options);
      this._restoreScrollPositions();
    });
  }
  _restoreScrollPositions() {
    const activeList = this._findActiveList();
    if (activeList.length && this._scroll != null) {
      activeList.prop("scrollTop", this._scroll);
    }
  }
  _saveScrollPositions() {
    const activeList = this._findActiveList();
    if (activeList.length) {
      this._scroll = activeList.prop("scrollTop");
    }
  }
  _onMarksQuantityChange(event) {
    return __async(this, null, function* () {
      event.stopPropagation();
      if (!this.object.isHost())
        return;
      const markId = event.currentTarget.dataset.markId;
      if (!markId)
        return;
      const markedIdDocuments = Helpers.getMarkIdDocuments(markId);
      if (!markedIdDocuments)
        return;
      const { scene, target, item } = markedIdDocuments;
      if (!scene || !target)
        return;
      const marks = parseInt(event.currentTarget.value);
      yield this.object.setMarks(target, marks, { scene, item, overwrite: true });
    });
  }
  _onMarksQuantityChangeBy(event, by) {
    return __async(this, null, function* () {
      event.stopPropagation();
      if (!this.object.isHost())
        return;
      const markId = event.currentTarget.dataset.markId;
      if (!markId)
        return;
      const markedIdDocuments = Helpers.getMarkIdDocuments(markId);
      if (!markedIdDocuments)
        return;
      const { scene, target, item } = markedIdDocuments;
      if (!scene || !target)
        return;
      yield this.object.setMarks(target, by, { scene, item });
    });
  }
  _onMarksDelete(event) {
    return __async(this, null, function* () {
      event.stopPropagation();
      if (!this.object.isHost())
        return;
      const markId = event.currentTarget.dataset.markId;
      if (!markId)
        return;
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      yield this.object.clearMark(markId);
    });
  }
  _onMarksClearAll(event) {
    return __async(this, null, function* () {
      event.stopPropagation();
      if (!this.object.isHost())
        return;
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      yield this.object.clearMarks();
    });
  }
  _onOpenOriginLink(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      console.log("Shadowrun 5e | Opening PAN/WAN network controller");
      const originLink = event.currentTarget.dataset.originLink;
      const device = yield fromUuid(originLink);
      if (!device)
        return;
      device.sheet.render(true);
    });
  }
  _onControllerRemove(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      yield this.item.disconnectFromNetwork();
    });
  }
};

// src/module/token/SR5Token.ts
var SR5Token = class extends Token {
  _drawBar(number, bar, data) {
    const tokenHealthBars = game.settings.get(SYSTEM_NAME, FLAGS.TokenHealthBars);
    if (tokenHealthBars && data && data.attribute.startsWith("track")) {
      const track = data;
      track.value = track.max - track.value;
    }
    super._drawBar(number, bar, data);
  }
};

// src/module/canvas.ts
var measureDistance = function(segments, options = {}) {
  if (!game || !game.ready || !canvas || !canvas.ready)
    return 0;
  if (!options.gridSpaces)
    return BaseGrid.prototype.measureDistances.call(this, segments, options);
  let nDiagonal = 0;
  const rule = this.parent.diagonalRule;
  const d = canvas.dimensions;
  return segments.map((s) => {
    let r = s.ray;
    let nx = Math.abs(Math.ceil(r.dx / d.size));
    let ny = Math.abs(Math.ceil(r.dy / d.size));
    let nd = Math.min(nx, ny);
    let ns = Math.abs(ny - nx);
    nDiagonal += nd;
    if (rule === "1-2-1") {
      let nd10 = Math.floor(nDiagonal / 2) - Math.floor((nDiagonal - nd) / 2);
      let spaces = nd10 * 2 + (nd - nd10) + ns;
      return spaces * canvas.dimensions.distance;
    } else if (rule === "EUCL") {
      return Math.round(Math.hypot(nx, ny) * canvas.scene.data.gridDistance);
    } else
      return (ns + nd) * canvas.scene.data.gridDistance;
  });
};

// src/module/macros.ts
function createItemMacro(item, slot) {
  return __async(this, null, function* () {
    var _a;
    if (!game || !game.macros)
      return;
    const command = `game.shadowrun5e.rollItemMacro("${item.name}");`;
    let macro = game.macros.contents.find((m) => m.name === item.name);
    if (!macro) {
      macro = yield Macro.create({
        name: item.name,
        type: "script",
        img: item.img,
        command,
        flags: { "shadowrun5e.itemMacro": true }
      }, { renderSheet: false });
    }
    if (macro)
      (_a = game.user) == null ? void 0 : _a.assignHotbarMacro(macro, slot);
  });
}
function rollItemMacro(itemName) {
  var _a;
  if (!game || !game.actors)
    return;
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token)
    actor = game.actors.tokens[speaker.token];
  if (!speaker.actor)
    return;
  if (!actor)
    actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find((i) => i.name === itemName) : null;
  if (!item) {
    return (_a = ui.notifications) == null ? void 0 : _a.warn(`Your controlled Actor does not have an item named ${itemName}`);
  }
  return item.castAction();
}
function createSkillMacro(data, slot) {
  return __async(this, null, function* () {
    if (!game.macros || !game.user)
      return;
    const { skillId, skill } = data;
    const name = Helpers.getSkillLabelOrName(skill);
    const existingMacro = game.macros.contents.find((macro2) => macro2.name === name);
    if (existingMacro)
      return;
    const command = `game.shadowrun5e.rollSkillMacro("${name}");`;
    const macro = yield Macro.create({
      name,
      type: "script",
      command
    });
    if (macro)
      yield game.user.assignHotbarMacro(macro, slot);
  });
}
function rollSkillMacro(skillLabel) {
  return __async(this, null, function* () {
    if (!game || !game.actors)
      return;
    if (!skillLabel)
      return;
    const speaker = ChatMessage.getSpeaker();
    if (!speaker)
      return;
    const actor = game.actors.tokens[speaker.token] || game.actors.get(speaker.actor);
    if (!actor)
      return;
    yield actor.rollSkill(skillLabel, { byLabel: true });
  });
}

// src/module/apps/gmtools/OverwatchScoreTracker.js
var _OverwatchScoreTracker = class extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "overwatch-score-tracker";
    options.classes = ["sr5"];
    options.title = game.i18n.localize("SR5.OverwatchScoreTrackerTitle");
    options.template = "systems/shadowrun5e/dist/templates/apps/gmtools/overwatch-score-tracker.html";
    options.width = 450;
    options.height = "auto";
    options.resizable = true;
    return options;
  }
  getData(options) {
    const actors = this._prepareCharacterActorsData();
    _OverwatchScoreTracker.addedActors.forEach((id) => {
      const actor = game.actors.get(id);
      if (actor) {
        actors.push(actor.toObject());
      }
    });
    this.actors = actors;
    return {
      actors
    };
  }
  _prepareCharacterActorsData() {
    return game.users.reduce((acc, user) => {
      if (!user.isGM && user.character) {
        acc.push(user.character.toObject());
      }
      return acc;
    }, []);
  }
  activateListeners(html) {
    html.find(".overwatch-score-reset").on("click", this._resetOverwatchScore.bind(this));
    html.find(".overwatch-score-add").on("click", this._addOverwatchScore.bind(this));
    html.find(".overwatch-score-input").on("change", this._setOverwatchScore.bind(this));
    html.find(".overwatch-score-roll-15-minutes").on("click", this._rollFor15Minutes.bind(this));
    html.find(".overwatch-score-add-actor").on("click", this._onAddActor.bind(this));
  }
  _getActorFromEvent(event) {
    const id = $(event.currentTarget).closest(".list-item").data("actorId");
    if (id)
      return game.actors.get(id);
  }
  _onAddActor(event) {
    var _a;
    event.preventDefault();
    const tokens = Helpers.getControlledTokens();
    if (tokens.length === 0) {
      return (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.OverwatchScoreTracker.NotifyNoSelectedTokens"));
    }
    const unlinkedActor = tokens.find((token) => !token.data.actorLink);
    if (unlinkedActor !== void 0) {
      ui.notifications.warn(game.i18n.localize("SR5.OverwatchScoreTracker.OnlyLinkedActorsSupported"));
    }
    tokens.filter((token) => token.data.actorLink).forEach((token) => {
      const actor = game.actors.get(token.data.actorId);
      if (!actor)
        return;
      if (this._isActorOnTracker(actor))
        return;
      _OverwatchScoreTracker.addedActors.push(actor.id);
    });
    this.render();
  }
  _isActorOnTracker(actor) {
    return this.actors.find((actorData) => actorData._id === actor.id) !== void 0;
  }
  _setOverwatchScore(event) {
    const actor = this._getActorFromEvent(event);
    const amount = event.currentTarget.value;
    if (amount && actor) {
      actor.setOverwatchScore(amount).then(() => this.render());
    }
  }
  _addOverwatchScore(event) {
    const actor = this._getActorFromEvent(event);
    const amount = parseInt(event.currentTarget.dataset.amount);
    if (amount && actor) {
      const os = actor.getOverwatchScore();
      actor.setOverwatchScore(os + amount).then(() => this.render());
    }
  }
  _resetOverwatchScore(event) {
    event.preventDefault();
    const actor = this._getActorFromEvent(event);
    if (actor) {
      actor.setOverwatchScore(0).then(() => this.render());
    }
  }
  _rollFor15Minutes(event) {
    event.preventDefault();
    const actor = this._getActorFromEvent(event);
    if (actor) {
      const roll = new Roll(_OverwatchScoreTracker.MatrixOverwatchDiceCount);
      roll.evaluate({ async: false });
      if (roll.total) {
        const os = actor.getOverwatchScore();
        actor.setOverwatchScore(os + roll.total).then(() => this.render());
      }
    }
  }
};
var OverwatchScoreTracker = _OverwatchScoreTracker;
__publicField(OverwatchScoreTracker, "MatrixOverwatchDiceCount", "2d6");
__publicField(OverwatchScoreTracker, "addedActors", []);

// src/module/combat/SR5Combat.ts
var SR5Combat = class extends Combat {
  get settings() {
    return super.settings;
  }
  get initiativePass() {
    return this.getFlag(SYSTEM_NAME, FLAGS.CombatInitiativePass) || SR.combat.INITIAL_INI_PASS;
  }
  static setInitiativePass(combat, pass) {
    return __async(this, null, function* () {
      yield combat.unsetFlag(SYSTEM_NAME, FLAGS.CombatInitiativePass);
      yield combat.setFlag(SYSTEM_NAME, FLAGS.CombatInitiativePass, pass);
    });
  }
  getActorCombatant(actor) {
    const token = actor.getToken();
    if (!token)
      return;
    return this.getCombatantByToken(token.id);
  }
  static addCombatTrackerContextOptions(html, options) {
    options.push({
      name: game.i18n.localize("SR5.COMBAT.ReduceInitByOne"),
      icon: '<i class="fas fa-caret-down"></i>',
      callback: (li) => __async(this, null, function* () {
        var _a;
        const combatant = yield (_a = game.combat) == null ? void 0 : _a.combatants.get(li.data("combatant-id"));
        if (combatant) {
          const combat = game.combat;
          yield combat.adjustInitiative(combatant, -1);
        }
      })
    }, {
      name: game.i18n.localize("SR5.COMBAT.ReduceInitByFive"),
      icon: '<i class="fas fa-angle-down"></i>',
      callback: (li) => __async(this, null, function* () {
        var _a;
        const combatant = yield (_a = game.combat) == null ? void 0 : _a.combatants.get(li.data("combatant-id"));
        if (combatant) {
          const combat = game.combat;
          yield combat.adjustInitiative(combatant, -5);
        }
      })
    }, {
      name: game.i18n.localize("SR5.COMBAT.ReduceInitByTen"),
      icon: '<i class="fas fa-angle-double-down"></i>',
      callback: (li) => __async(this, null, function* () {
        var _a;
        const combatant = yield (_a = game.combat) == null ? void 0 : _a.combatants.get(li.data("combatant-id"));
        if (combatant) {
          const combat = game.combat;
          yield combat.adjustInitiative(combatant, -10);
        }
      })
    });
    return options;
  }
  adjustInitiative(combatant, adjustment) {
    return __async(this, null, function* () {
      combatant = typeof combatant === "string" ? this.combatants.find((c) => c.id === combatant) : combatant;
      if (!combatant || typeof combatant === "string") {
        console.error("Could not find combatant with id ", combatant);
        return;
      }
      yield combatant.update({
        initiative: Number(combatant.initiative) + adjustment
      });
    });
  }
  static handleIniPass(combatId) {
    return __async(this, null, function* () {
      var _a;
      const combat = (_a = game.combats) == null ? void 0 : _a.get(combatId);
      if (!combat)
        return;
      const initiativePass = combat.initiativePass + 1;
      const turn = 0;
      const combatantsData = [];
      for (const combatant of combat.combatants) {
        const initiative = CombatRules.reduceIniResultAfterPass(Number(combatant.initiative));
        combatantsData.push({
          _id: combatant.id,
          initiative
        });
      }
      yield SR5Combat.setInitiativePass(combat, initiativePass);
      yield combat.update({ turn, combatants: combatantsData });
      return;
    });
  }
  static handleNextRound(combatId) {
    return __async(this, null, function* () {
      var _a;
      const combat = (_a = game.combats) == null ? void 0 : _a.get(combatId);
      if (!combat)
        return;
      yield combat.resetAll();
      yield SR5Combat.setInitiativePass(combat, SR.combat.INITIAL_INI_PASS);
      if (game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat)) {
        yield combat.rollNPC();
      } else {
        yield combat.rollAll();
      }
      const turn = 0;
      yield combat.update({ turn });
    });
  }
  setupTurns() {
    const turns = super.setupTurns();
    return turns.sort(SR5Combat.sortByRERIC);
  }
  static sortByRERIC(left, right) {
    const leftInit = Number(left.initiative);
    const rightInit = Number(right.initiative);
    if (isNaN(leftInit))
      return 1;
    if (isNaN(rightInit))
      return -1;
    if (leftInit > rightInit)
      return -1;
    if (leftInit < rightInit)
      return 1;
    const genData = (actor) => {
      var _a, _b;
      if (!actor)
        return [0, 0, 0, 0];
      return [
        Number(actor.getEdge().value),
        Number((_a = actor.findAttribute("reaction")) == null ? void 0 : _a.value),
        Number((_b = actor.findAttribute("intuition")) == null ? void 0 : _b.value),
        new Roll("1d2").evaluate({ async: false }).total
      ];
    };
    const leftData = genData(left.actor);
    const rightData = genData(right.actor);
    for (let index = 0; index < leftData.length; index++) {
      const diff = rightData[index] - leftData[index];
      if (diff !== 0)
        return diff;
    }
    return 0;
  }
  get nextUndefeatedTurnPosition() {
    for (let [turnInPass, combatant] of this.turns.entries()) {
      if (this.turn !== null && turnInPass <= this.turn)
        continue;
      if (!combatant.defeated && combatant.initiative > 0) {
        return turnInPass;
      }
    }
    return this.turns.length;
  }
  get nextViableTurnPosition() {
    for (let [turnInPass, combatant] of this.turns.entries()) {
      if (this.turn !== null && turnInPass <= this.turn)
        continue;
      if (combatant.initiative > 0) {
        return turnInPass;
      }
    }
    return this.turns.length;
  }
  doIniPass(nextTurn) {
    if (nextTurn < this.turns.length)
      return false;
    const currentScores = this.combatants.map((combatant) => Number(combatant.initiative));
    return CombatRules.iniOrderCanDoAnotherPass(currentScores);
  }
  nextTurn() {
    return __async(this, null, function* () {
      var _a, _b, _c;
      let nextRound = this.round;
      let initiativePass = this.initiativePass;
      let nextTurn = ((_a = this.settings) == null ? void 0 : _a.skipDefeated) ? this.nextUndefeatedTurnPosition : this.nextViableTurnPosition;
      if (nextRound === 0 && initiativePass === 0) {
        yield this.startCombat();
        return;
      }
      if (nextTurn < this.turns.length) {
        yield this.update({ turn: nextTurn });
        return;
      }
      if (!((_b = game.user) == null ? void 0 : _b.isGM) && this.doIniPass(nextTurn)) {
        yield this._createDoIniPassSocketMessage();
        return;
      }
      if (((_c = game.user) == null ? void 0 : _c.isGM) && this.doIniPass(nextTurn)) {
        yield SR5Combat.handleIniPass(this.id);
        return;
      }
      return this.nextRound();
    });
  }
  startCombat() {
    return __async(this, null, function* () {
      const nextRound = SR.combat.INITIAL_INI_ROUND;
      const initiativePass = SR.combat.INITIAL_INI_PASS;
      const nextTurn = 0;
      yield SR5Combat.setInitiativePass(this, initiativePass);
      yield this.update({ round: nextRound, turn: nextTurn });
      if (game.settings.get(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat)) {
        yield this.rollNPC();
      } else {
        yield this.rollAll();
      }
      return this;
    });
  }
  nextRound() {
    return __async(this, null, function* () {
      var _a;
      yield __superGet(SR5Combat.prototype, this, "nextRound").call(this);
      if (!((_a = game.user) == null ? void 0 : _a.isGM)) {
        yield this._createDoNextRoundSocketMessage();
      } else {
        yield SR5Combat.handleNextRound(this.id);
      }
    });
  }
  rollAll(options) {
    return __async(this, null, function* () {
      const combat = yield __superGet(SR5Combat.prototype, this, "rollAll").call(this);
      if (combat.turn !== 0)
        yield combat.update({ turn: 0 });
      return combat;
    });
  }
  rollInitiative(ids, options) {
    return __async(this, null, function* () {
      const combat = yield __superGet(SR5Combat.prototype, this, "rollInitiative").call(this, ids, options);
      if (this.initiativePass === SR.combat.INITIAL_INI_PASS)
        yield combat.update({ turn: 0 });
      return combat;
    });
  }
  static onPreUpdateCombatant(combatant, changed, options, id) {
    console.log("Shadowrun5e | Handle preUpdateCombatant to apply system rules", combatant, changed);
    if (changed.initiative)
      changed.initiative = CombatRules.getValidInitiativeScore(changed.initiative);
  }
  _getInitiativeFormula(combatant) {
    if (this.initiativePass === SR.combat.INITIAL_INI_PASS) {
      return super._getInitiativeFormula(combatant);
    }
    return SR5Combat._getSystemInitiativeFormula(this.initiativePass);
  }
  static _getSystemInitiativeBaseFormula() {
    return String(CONFIG.Combat.initiative.formula || game.system.data.initiative);
  }
  static _getSystemInitiativeFormula(initiativePass) {
    initiativePass = initiativePass > 1 ? initiativePass : 1;
    const baseFormula = SR5Combat._getSystemInitiativeBaseFormula();
    const ongoingIniPassModified = (initiativePass - 1) * -SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;
    return `max(${baseFormula} - ${ongoingIniPassModified}[Pass], 0)`;
  }
  static _handleDoNextRoundSocketMessage(message) {
    return __async(this, null, function* () {
      if (!message.data.hasOwnProperty("id") && typeof message.data.id !== "string") {
        console.error(`SR5Combat Socket Message ${FLAGS.DoNextRound} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
        return;
      }
      return yield SR5Combat.handleNextRound(message.data.id);
    });
  }
  static _handleDoInitPassSocketMessage(message) {
    return __async(this, null, function* () {
      if (!message.data.hasOwnProperty("id") && typeof message.data.id !== "string") {
        console.error(`SR5Combat Socket Message ${FLAGS.DoInitPass} data.id must be a string (combat id) but is ${typeof message.data} (${message.data})!`);
        return;
      }
      return yield SR5Combat.handleIniPass(message.data.id);
    });
  }
  _createDoNextRoundSocketMessage() {
    return __async(this, null, function* () {
      yield SocketMessage.emitForGM(FLAGS.DoNextRound, { id: this.id });
    });
  }
  _createDoIniPassSocketMessage() {
    return __async(this, null, function* () {
      yield SocketMessage.emitForGM(FLAGS.DoInitPass, { id: this.id });
    });
  }
};
function _combatantGetInitiativeFormula() {
  const combat = this.parent;
  return SR5Combat._getSystemInitiativeFormula(combat.initiativePass);
}

// src/module/importer/importer/Constants.ts
var Constants = class {
};
Constants.MAP_CATEGORY_TO_SKILL = {
  "Assault Cannons": "heavy_weapons",
  "Assault Rifles": "automatics",
  "Blades": "blades",
  "Bows": "archery",
  "Carbines": "automatics",
  "Clubs": "clubs",
  "Crossbows": "archery",
  "Exotic Melee Weapons": "exotic_melee",
  "Exotic Ranged Weapons": "exotic_ranged",
  "Flamethrowers": "exotic_ranged",
  "Grenade Launchers": "heavy_weapons",
  "Heavy Machine Guns": "heavy_weapons",
  "Heavy Pistols": "pistols",
  "Holdouts": "pistols",
  "Laser Weapons": "exotic_ranged",
  "Light Machine Guns": "heavy_weapons",
  "Light Pistols": "pistols",
  "Machine Pistols": "automatics",
  "Medium Machine Guns": "automatics",
  "Missile Launchers": "heavy_weapons",
  "Shotguns": "longarms",
  "Sniper Rifles": "longarms",
  "Sporting Rifles": "longarms",
  "Submachine Guns": "automatics",
  "Tasers": "pistols",
  "Unarmed": "unarmed_combat"
};
Constants.WEAPON_RANGES = {
  "Tasers": {
    short: 5,
    medium: 10,
    long: 15,
    extreme: 20
  },
  "Holdouts": {
    short: 5,
    medium: 15,
    long: 30,
    extreme: 50
  },
  "Light Pistols": {
    short: 5,
    medium: 15,
    long: 30,
    extreme: 50
  },
  "Heavy Pistols": {
    short: 5,
    medium: 20,
    long: 40,
    extreme: 60
  },
  "Machine Pistols": {
    short: 5,
    medium: 15,
    long: 30,
    extreme: 50
  },
  "Submachine Guns": {
    short: 10,
    medium: 40,
    long: 80,
    extreme: 150
  },
  "Assault Rifles": {
    short: 25,
    medium: 150,
    long: 350,
    extreme: 550
  },
  "Shotguns": {
    short: 10,
    medium: 40,
    long: 80,
    extreme: 150
  },
  "Shotguns (slug)": {
    short: 10,
    medium: 40,
    long: 80,
    extreme: 150
  },
  "Shotguns (flechette)": {
    short: 15,
    medium: 30,
    long: 45,
    extreme: 60
  },
  "Sniper Rifles": {
    short: 50,
    medium: 350,
    long: 800,
    extreme: 1500
  },
  "Sporting Rifles": {
    short: 50,
    medium: 250,
    long: 500,
    extreme: 750
  },
  "Light Machine Guns": {
    short: 25,
    medium: 200,
    long: 400,
    extreme: 800
  },
  "Medium/Heavy Machinegun": {
    short: 40,
    medium: 250,
    long: 750,
    extreme: 1200
  },
  "Assault Cannons": {
    short: 50,
    medium: 300,
    long: 750,
    extreme: 1500
  },
  "Grenade Launchers": {
    min: 5,
    short: 50,
    medium: 100,
    long: 150,
    extreme: 500
  },
  "Missile Launchers": {
    min: 20,
    short: 70,
    medium: 150,
    long: 450,
    extreme: 1500
  },
  "Bows": {
    short: 1,
    medium: 10,
    long: 30,
    extreme: 60,
    attribute: "strength"
  },
  "Light Crossbows": {
    short: 6,
    medium: 24,
    long: 60,
    extreme: 120
  },
  "Medium Crossbows": {
    short: 9,
    medium: 36,
    long: 90,
    extreme: 150
  },
  "Heavy Crossbows": {
    short: 15,
    medium: 45,
    long: 120,
    extreme: 180
  },
  "Thrown Knife": {
    short: 1,
    medium: 2,
    long: 3,
    extreme: 5,
    attribute: "strength"
  },
  "Net": {
    short: 0.5,
    medium: 1,
    long: 1.5,
    extreme: 2.5,
    attribute: "strength"
  },
  "Shuriken": {
    short: 1,
    medium: 2,
    long: 5,
    extreme: 7,
    attribute: "strength"
  },
  "Standard Grenade": {
    short: 2,
    medium: 4,
    long: 6,
    extreme: 10,
    attribute: "strength"
  },
  "Aerodynamic Grenade": {
    min: 0,
    short: 2,
    medium: 4,
    long: 8,
    extreme: 15,
    attribute: "strength"
  },
  "Harpoon Gun": {
    short: 5,
    medium: 20,
    long: 40,
    extreme: 60
  },
  "Harpoon Gun (Underwater)": {
    short: 6,
    medium: 24,
    long: 60,
    extreme: 120
  },
  "Flamethrowers": {
    short: 15,
    medium: 20,
    long: -1,
    extreme: -1
  }
};
Constants.ROOT_IMPORT_FOLDER_NAME = "SR5e";

// src/module/importer/helper/ImportStrategy.ts
var ImportStrategy = class {
};

// src/module/importer/helper/XMLStrategy.ts
var XMLStrategy = class extends ImportStrategy {
  intValue(jsonData, key, fallback = void 0) {
    try {
      return parseInt(jsonData[key][ImportHelper.CHAR_KEY]);
    } catch (e) {
      if (fallback !== void 0) {
        return fallback;
      } else {
        throw e;
      }
    }
  }
  stringValue(jsonData, key, fallback = void 0) {
    try {
      return jsonData[key][ImportHelper.CHAR_KEY];
    } catch (e) {
      if (fallback !== void 0) {
        return fallback;
      } else {
        throw e;
      }
    }
  }
  objectValue(jsonData, key, fallback = void 0) {
    try {
      return jsonData[key];
    } catch (e) {
      if (fallback !== void 0) {
        return fallback;
      } else {
        throw e;
      }
    }
  }
};

// src/module/importer/helper/JSONStrategy.ts
var JSONStrategy = class extends ImportStrategy {
  intValue(jsonData, key, fallback = void 0) {
    throw new Error("Unimplemented");
  }
  stringValue(jsonData, key, fallback = void 0) {
    throw new Error("Unimplemented");
  }
  objectValue(jsonData, key, fallback = void 0) {
    throw new Error("Unimplemented");
  }
};

// src/module/importer/helper/ImportHelper.ts
var _ImportHelper = class {
  static SetMode(mode) {
    switch (mode) {
      case 1 /* XML */:
        _ImportHelper.s_Strategy = new XMLStrategy();
        break;
      case 2 /* JSON */:
        _ImportHelper.s_Strategy = new JSONStrategy();
        break;
    }
  }
  constructor() {
  }
  static NewFolder(name, folder = null) {
    return __async(this, null, function* () {
      return yield Folder.create({
        type: "Item",
        folder: folder === null ? null : folder.id,
        name
      });
    });
  }
  static GetFolderAtPath(path, mkdirs = false) {
    return __async(this, null, function* () {
      var _a;
      let currentFolder, lastFolder = null;
      const pathSegments = path.split("/");
      for (const pathSegment of pathSegments) {
        currentFolder = (_a = game.folders) == null ? void 0 : _a.find((folder) => {
          return folder.folder === lastFolder && folder.name === pathSegment;
        });
        if (!currentFolder && !mkdirs)
          return Promise.reject(`Unable to find folder: ${path}`);
        if (!currentFolder)
          currentFolder = yield _ImportHelper.NewFolder(pathSegment, lastFolder);
        lastFolder = currentFolder;
      }
      return Promise.resolve(currentFolder);
    });
  }
  static IntValue(jsonData, key, fallback = void 0) {
    return _ImportHelper.s_Strategy.intValue(jsonData, key, fallback);
  }
  static StringValue(jsonData, key, fallback = void 0) {
    return _ImportHelper.s_Strategy.stringValue(jsonData, key, fallback);
  }
  static ObjectValue(jsonData, key, fallback = void 0) {
    return _ImportHelper.s_Strategy.objectValue(jsonData, key, fallback);
  }
  static findItem(nameOrCmp) {
    var _a, _b;
    let result;
    if (typeof nameOrCmp === "string") {
      result = (_a = game.items) == null ? void 0 : _a.find((item) => item.name == nameOrCmp);
    } else {
      result = (_b = game.items) == null ? void 0 : _b.find(nameOrCmp);
    }
    return result;
  }
  static TranslateCategory(name, jsonCategoryTranslations) {
    if (jsonCategoryTranslations && jsonCategoryTranslations.hasOwnProperty(name)) {
      return jsonCategoryTranslations[name];
    }
    return name;
  }
  static MakeCategoryFolders(jsonData, path, jsonCategoryTranslations) {
    return __async(this, null, function* () {
      let folders = {};
      let jsonCategories = jsonData["categories"]["category"];
      for (let i = 0; i < jsonCategories.length; i++) {
        let categoryName = jsonCategories[i][_ImportHelper.CHAR_KEY];
        let origCategoryName = categoryName;
        categoryName = _ImportHelper.TranslateCategory(categoryName, jsonCategoryTranslations);
        folders[origCategoryName.toLowerCase()] = yield _ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${path}/${categoryName}`, true);
      }
      return folders;
    });
  }
  static ExtractDataFileTranslation(jsoni18n, dataFileName) {
    for (let i = 0; i < jsoni18n.length; i++) {
      const translation = jsoni18n[i];
      if (translation.$.file === dataFileName) {
        return translation;
      }
    }
    return {};
  }
  static ExtractCategoriesTranslation(jsonChummeri18n) {
    const categoryTranslations = {};
    if (jsonChummeri18n && jsonChummeri18n.hasOwnProperty("categories")) {
      jsonChummeri18n.categories.category.forEach((category) => {
        const name = category[_ImportHelper.CHAR_KEY];
        const translate = category.$.translate;
        categoryTranslations[name] = translate;
      });
    }
    return categoryTranslations;
  }
  static ExtractItemTranslation(jsonItemsi18n, typeKey, listKey) {
    const itemTranslation = {};
    if (jsonItemsi18n && jsonItemsi18n[typeKey] && jsonItemsi18n[typeKey][listKey] && jsonItemsi18n[typeKey][listKey].length > 0) {
      jsonItemsi18n[typeKey][listKey].forEach((item) => {
        const name = item.name[_ImportHelper.CHAR_KEY];
        const translate = item.translate[_ImportHelper.CHAR_KEY];
        const altpage = item.altpage[_ImportHelper.CHAR_KEY];
        itemTranslation[name] = { translate, altpage };
      });
    }
    return itemTranslation;
  }
  static MapNameToTranslationKey(translationMap, name, key, fallbackValue = "") {
    if (translationMap && translationMap.hasOwnProperty(name) && translationMap[name].hasOwnProperty(key)) {
      return translationMap[name][key];
    }
    return fallbackValue;
  }
  static MapNameToTranslation(translationMap, name) {
    return _ImportHelper.MapNameToTranslationKey(translationMap, name, "translate", name);
  }
  static MapNameToPageSource(translationMap, name, fallback = "?") {
    return _ImportHelper.MapNameToTranslationKey(translationMap, name, "altpage", fallback);
  }
};
var ImportHelper = _ImportHelper;
ImportHelper.CHAR_KEY = "_TEXT";
ImportHelper.s_Strategy = new XMLStrategy();

// src/module/importer/importer/DataImporter.ts
var xml2js = require_xml2js();
var _DataImporter = class {
  static CanParseI18n(jsonObject) {
    return jsonObject.hasOwnProperty("chummer") && jsonObject.chummer.length > 0 && jsonObject.chummer[0].$.hasOwnProperty("file");
  }
  static ParseTranslation(jsonObject) {
    if (jsonObject && jsonObject.hasOwnProperty("chummer")) {
      _DataImporter.jsoni18n = jsonObject["chummer"];
    }
  }
  static xml2json(xmlString) {
    return __async(this, null, function* () {
      const parser = xml2js.Parser({
        explicitArray: false,
        explicitCharkey: true,
        charkey: ImportHelper.CHAR_KEY
      });
      return (yield parser.parseStringPromise(xmlString))["chummer"];
    });
  }
  static unsupportedBookSource(jsonObject) {
    if (!jsonObject.hasOwnProperty("source"))
      return false;
    const source = ImportHelper.StringValue(jsonObject, "source", "");
    return _DataImporter.unsupportedBooks.includes(source);
  }
  static unsupportedEntry(jsonObject) {
    if (_DataImporter.unsupportedBookSource(jsonObject)) {
      return true;
    }
    return false;
  }
};
var DataImporter = _DataImporter;
DataImporter.unsupportedBooks = ["2050"];

// src/module/importer/parser/Parser.ts
var Parser = class {
};

// src/module/importer/parser/item/ItemParserBase.ts
var ItemParserBase = class extends Parser {
  Parse(jsonData, data, jsonTranslation) {
    data.name = ImportHelper.StringValue(jsonData, "name");
    data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.StringValue(jsonData, "page")}`;
    if (jsonTranslation) {
      const origName = ImportHelper.StringValue(jsonData, "name");
      data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
      data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
    }
    return data;
  }
};

// src/module/importer/parser/item/TechnologyItemParserBase.ts
var TechnologyItemParserBase = class extends ItemParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    data.data.technology.availability = ImportHelper.StringValue(jsonData, "avail", "0");
    data.data.technology.cost = ImportHelper.IntValue(jsonData, "cost", 0);
    data.data.technology.rating = ImportHelper.IntValue(jsonData, "rating", 0);
    return data;
  }
};

// src/module/importer/parser/weapon/WeaponParserBase.ts
var WeaponParserBase = class extends TechnologyItemParserBase {
  GetSkill(weaponJson) {
    if (weaponJson.hasOwnProperty("useskill")) {
      let jsonSkill = ImportHelper.StringValue(weaponJson, "useskill");
      if (Constants.MAP_CATEGORY_TO_SKILL.hasOwnProperty(jsonSkill)) {
        return Constants.MAP_CATEGORY_TO_SKILL[jsonSkill];
      }
      return jsonSkill.replace(/[\s\-]/g, "_").toLowerCase();
    } else {
      let category = ImportHelper.StringValue(weaponJson, "category");
      if (Constants.MAP_CATEGORY_TO_SKILL.hasOwnProperty(category)) {
        return Constants.MAP_CATEGORY_TO_SKILL[category];
      }
      let type = ImportHelper.StringValue(weaponJson, "type").toLowerCase();
      return type === "ranged" ? "exotic_range" : "exotic_melee";
    }
  }
  static GetWeaponType(weaponJson) {
    let type = ImportHelper.StringValue(weaponJson, "type");
    if (type === "Melee") {
      return "melee";
    } else {
      if (weaponJson.hasOwnProperty("useskill")) {
        let skill = ImportHelper.StringValue(weaponJson, "useskill");
        if (skill === "Throwing Weapons")
          return "thrown";
      }
      let category = ImportHelper.StringValue(weaponJson, "category");
      if (category === "Throwing Weapons")
        return "thrown";
      return "range";
    }
  }
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    let category = ImportHelper.StringValue(jsonData, "category");
    if (category === "Hold-outs") {
      category = "Holdouts";
    }
    data.data.category = WeaponParserBase.GetWeaponType(jsonData);
    data.data.subcategory = category.toLowerCase();
    data.data.action.skill = this.GetSkill(jsonData);
    data.data.action.damage = this.GetDamage(jsonData);
    data.data.action.limit.value = ImportHelper.IntValue(jsonData, "accuracy");
    data.data.action.limit.base = ImportHelper.IntValue(jsonData, "accuracy");
    data.data.technology.conceal.base = ImportHelper.IntValue(jsonData, "conceal");
    return data;
  }
};

// src/module/importer/parser/weapon/RangedParser.ts
var RangedParser = class extends WeaponParserBase {
  GetDamage(jsonData) {
    var _a;
    let jsonDamage = ImportHelper.StringValue(jsonData, "damage");
    let damageCode = (_a = jsonDamage.match(/[0-9]+[PS]/g)) == null ? void 0 : _a[0];
    if (damageCode == null) {
      return DefaultValues.damageData();
    }
    let damageType = damageCode.includes("P") ? "physical" : "stun";
    let damageAmount = parseInt(damageCode.replace(damageType[0].toUpperCase(), ""));
    let damageAp = ImportHelper.IntValue(jsonData, "ap", 0);
    const partialDamageData = {
      type: {
        base: damageType,
        value: damageType
      },
      base: damageAmount,
      value: damageAmount,
      ap: {
        base: damageAp,
        value: damageAp,
        mod: []
      }
    };
    return DefaultValues.damageData(partialDamageData);
  }
  GetAmmo(weaponJson) {
    var _a;
    let jsonAmmo = ImportHelper.StringValue(weaponJson, "ammo");
    let match = (_a = jsonAmmo.match(/([0-9]+)/g)) == null ? void 0 : _a[0];
    return match !== void 0 ? parseInt(match) : 0;
  }
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    data.data.range.rc.base = ImportHelper.IntValue(jsonData, "rc");
    data.data.range.rc.value = ImportHelper.IntValue(jsonData, "rc");
    if (jsonData.hasOwnProperty("range")) {
      data.data.range.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, "range")];
    } else {
      data.data.range.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, "category")];
    }
    data.data.ammo.current.value = this.GetAmmo(jsonData);
    data.data.ammo.current.max = this.GetAmmo(jsonData);
    data.data.range.modes.single_shot = ImportHelper.StringValue(jsonData, "mode").includes("SS");
    data.data.range.modes.semi_auto = ImportHelper.StringValue(jsonData, "mode").includes("SA");
    data.data.range.modes.burst_fire = ImportHelper.StringValue(jsonData, "mode").includes("BF");
    data.data.range.modes.full_auto = ImportHelper.StringValue(jsonData, "mode").includes("FA");
    return data;
  }
};

// src/module/importer/parser/weapon/MeleeParser.ts
var MeleeParser = class extends WeaponParserBase {
  GetDamage(jsonData) {
    var _a;
    let jsonDamage = ImportHelper.StringValue(jsonData, "damage");
    let damageCode = (_a = jsonDamage.match(/(STR)([+-]?)([1-9]*)\)([PS])/g)) == null ? void 0 : _a[0];
    if (damageCode == null) {
      return DefaultValues.damageData();
    }
    let damageBase = 0;
    let damageAp = ImportHelper.IntValue(jsonData, "ap", 0);
    let splitDamageCode = damageCode.split(")");
    let damageType = splitDamageCode[1].includes("P") ? "physical" : "stun";
    let splitBaseCode = damageCode.includes("+") ? splitDamageCode[0].split("+") : splitDamageCode[0].split("-");
    if (splitDamageCode[0].includes("+") || splitDamageCode[0].includes("-")) {
      damageBase = parseInt(splitBaseCode[1], 0);
    }
    let damageAttribute = damageCode.includes("STR") ? "strength" : "";
    const partialDamageData = {
      type: {
        base: damageType,
        value: damageType
      },
      base: damageBase,
      value: damageBase,
      ap: {
        base: damageAp,
        value: damageAp,
        mod: []
      },
      attribute: damageAttribute
    };
    return DefaultValues.damageData(partialDamageData);
  }
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    data.data.melee.reach = ImportHelper.IntValue(jsonData, "reach");
    return data;
  }
};

// src/module/importer/parser/weapon/ThrownParser.ts
var ThrownParser = class extends WeaponParserBase {
  GetDamage(jsonData) {
    var _a, _b, _c, _d;
    let jsonDamage = ImportHelper.StringValue(jsonData, "damage");
    let damageAmount = 0;
    let damageType = "physical";
    let damageAttribute = "";
    if (jsonDamage.includes("STR")) {
      damageAttribute = "strength";
      let damageMatch = (_a = jsonDamage.match(/((STR)([+-])[0-9]\)[PS])/g)) == null ? void 0 : _a[0];
      if (damageMatch !== void 0) {
        let amountMatch = (_b = damageMatch.match(/-?[0-9]+/g)) == null ? void 0 : _b[0];
        damageAmount = amountMatch !== void 0 ? parseInt(amountMatch) : 0;
      }
    } else {
      let damageMatch = (_c = jsonDamage.match(/([0-9]+[PS])/g)) == null ? void 0 : _c[0];
      if (damageMatch !== void 0) {
        let amountMatch = (_d = damageMatch.match(/[0-9]+/g)) == null ? void 0 : _d[0];
        if (amountMatch !== void 0) {
          damageAmount = parseInt(amountMatch);
        }
      } else {
        const partialDamageData2 = {
          type: {
            base: "physical",
            value: "physical"
          }
        };
        return DefaultValues.damageData(partialDamageData2);
      }
    }
    damageType = jsonDamage.includes("P") ? "physical" : "stun";
    let damageAp = ImportHelper.IntValue(jsonData, "ap", 0);
    const partialDamageData = {
      type: {
        base: damageType,
        value: damageType
      },
      base: damageAmount,
      value: damageAmount,
      ap: {
        base: damageAp,
        value: damageAp,
        mod: []
      },
      attribute: damageAttribute
    };
    return DefaultValues.damageData(partialDamageData);
  }
  GetBlast(jsonData, data) {
    var _a, _b, _c, _d;
    let blastData = {
      radius: 0,
      dropoff: 0
    };
    let blastCode = ImportHelper.StringValue(jsonData, "damage");
    let radiusMatch = (_a = blastCode.match(/([0-9]+m)/)) == null ? void 0 : _a[0];
    if (radiusMatch !== void 0) {
      radiusMatch = (_b = radiusMatch.match(/[0-9]+/)) == null ? void 0 : _b[0];
      if (radiusMatch !== void 0) {
        blastData.radius = parseInt(radiusMatch);
      }
    }
    let dropoffMatch = (_c = blastCode.match(/(-[0-9]+\/m)/)) == null ? void 0 : _c[0];
    if (dropoffMatch !== void 0) {
      dropoffMatch = (_d = dropoffMatch.match(/-[0-9]+/)) == null ? void 0 : _d[0];
      if (dropoffMatch !== void 0) {
        blastData.dropoff = parseInt(dropoffMatch);
      }
    }
    if (blastData.dropoff && !blastData.radius) {
      blastData.radius = -(data.data.action.damage.base / blastData.dropoff);
    }
    return blastData;
  }
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    if (jsonData.hasOwnProperty("range")) {
      data.data.thrown.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, "range")];
    } else {
      data.data.thrown.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, "category")];
    }
    data.data.thrown.blast = this.GetBlast(jsonData, data);
    return data;
  }
};

// src/module/importer/parser/ParserMap.ts
var ParserMap = class extends Parser {
  constructor(branchKey, elements) {
    super();
    this.m_BranchKey = branchKey;
    this.m_Map = /* @__PURE__ */ new Map();
    for (const { key, value } of elements) {
      this.m_Map.set(key, value);
    }
  }
  Parse(jsonData, data, jsonTranslation) {
    let key;
    if (typeof this.m_BranchKey === "function") {
      key = this.m_BranchKey(jsonData);
    } else {
      key = this.m_BranchKey;
      key = ImportHelper.StringValue(jsonData, key);
    }
    const parser = this.m_Map.get(key);
    if (parser === void 0) {
      console.warn(`Could not find mapped parser for category ${key}.`);
      return data;
    }
    return parser.Parse(jsonData, data, jsonTranslation);
  }
};

// src/module/importer/importer/WeaponImporter.ts
var WeaponImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["weapons.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("weapons") && jsonObject["weapons"].hasOwnProperty("weapon");
  }
  GetDefaultData() {
    return {
      name: "Unnamed Item",
      type: "weapon",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        action: DefaultValues.actionData({ type: "varies", attribute: "agility" }),
        technology: DefaultValues.technologyData({ rating: 1 }),
        ammo: {
          spare_clips: {
            value: 0,
            max: 0
          },
          current: {
            value: 0,
            max: 0
          }
        },
        range: {
          category: "",
          ranges: {
            short: 0,
            medium: 0,
            long: 0,
            extreme: 0
          },
          rc: {
            value: 0,
            base: 0,
            mod: []
          },
          modes: {
            single_shot: false,
            semi_auto: false,
            burst_fire: false,
            full_auto: false
          }
        },
        melee: {
          reach: 0
        },
        thrown: {
          ranges: {
            short: 0,
            medium: 0,
            long: 0,
            extreme: 0,
            attribute: ""
          },
          blast: {
            radius: 0,
            dropoff: 0
          }
        },
        category: "range",
        subcategory: ""
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonWeaponi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonWeaponi18n);
    this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponi18n, "weapons", "weapon");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const folders = yield ImportHelper.MakeCategoryFolders(jsonObject, "Weapons", this.categoryTranslations);
      folders["gear"] = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Gear`, true);
      folders["quality"] = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Weapons/Quality`, true);
      const parser = new ParserMap(WeaponParserBase.GetWeaponType, [
        { key: "range", value: new RangedParser() },
        { key: "melee", value: new MeleeParser() },
        { key: "thrown", value: new ThrownParser() }
      ]);
      let datas = [];
      let jsonDatas = jsonObject["weapons"]["weapon"];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
        data.folder = folders[data.data.subcategory].id;
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/parser/armor/ArmorParserBase.ts
var ArmorParserBase = class extends TechnologyItemParserBase {
  Parse(jsonData, data) {
    data = super.Parse(jsonData, data);
    data.data.armor.value = ImportHelper.IntValue(jsonData, "armor", 0);
    data.data.armor.mod = ImportHelper.StringValue(jsonData, "armor").includes("+");
    return data;
  }
};

// src/module/importer/importer/ArmorImporter.ts
var ArmorImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["armor.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("armors") && jsonObject["armors"].hasOwnProperty("armor");
  }
  GetDefaultData() {
    return {
      name: "Unnamed Armor",
      type: "armor",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        technology: DefaultValues.technologyData({ rating: 1, equipped: true, wireless: false }),
        armor: {
          value: 0,
          mod: false,
          acid: 0,
          cold: 0,
          fire: 0,
          electricity: 0,
          radiation: 0
        }
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonArmori18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonArmori18n);
    this.armorTranslations = ImportHelper.ExtractItemTranslation(jsonArmori18n, "armors", "armor");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const folders = yield ImportHelper.MakeCategoryFolders(jsonObject, "Armor", this.categoryTranslations);
      const parser = new ArmorParserBase();
      let datas = [];
      let jsonDatas = jsonObject["armors"]["armor"];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        let data = parser.Parse(jsonData, this.GetDefaultData());
        const category = ImportHelper.StringValue(jsonData, "category").toLowerCase();
        data.name = ImportHelper.MapNameToTranslation(this.armorTranslations, data.name);
        data.folder = folders[category].id;
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/importer/AmmoImporter.ts
var AmmoImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["gear.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("gears") && jsonObject["gears"].hasOwnProperty("gear");
  }
  GetDefaultData() {
    return {
      name: "",
      type: "ammo",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        technology: DefaultValues.technologyData({ rating: 1, equipped: true, wireless: false }),
        element: "",
        ap: 0,
        damage: 0,
        damageType: "physical",
        blast: {
          radius: 0,
          dropoff: 0
        }
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
    this.entryTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, "gears", "gear");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      let ammoDatas = [];
      let jsonAmmos = jsonObject["gears"]["gear"];
      for (let i = 0; i < jsonAmmos.length; i++) {
        let jsonData = jsonAmmos[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        if (ImportHelper.StringValue(jsonData, "category", "") !== "Ammunition") {
          continue;
        }
        let data = this.GetDefaultData();
        data.name = ImportHelper.StringValue(jsonData, "name");
        data.name = ImportHelper.MapNameToTranslation(this.entryTranslations, data.name);
        data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.StringValue(jsonData, "page")}`;
        data.data.technology.rating = 2;
        data.data.technology.availability = ImportHelper.StringValue(jsonData, "avail");
        data.data.technology.cost = ImportHelper.IntValue(jsonData, "cost", 0);
        let bonusData = ImportHelper.ObjectValue(jsonData, "weaponbonus", null);
        if (bonusData !== void 0 && bonusData !== null) {
          data.data.ap = ImportHelper.IntValue(bonusData, "ap", 0);
          data.data.damage = ImportHelper.IntValue(bonusData, "damage", 0);
          let damageType = ImportHelper.StringValue(bonusData, "damagetype", "");
          if (damageType.length > 0) {
            if (damageType.includes("P")) {
              data.data.damageType = "physical";
            } else if (damageType.includes("S")) {
              data.data.damageType = "stun";
            } else if (damageType.includes("M")) {
              data.data.damageType = "matrix";
            }
          }
        }
        let shouldLookForWeapons = false;
        let nameLower = data.name.toLowerCase();
        ["grenade", "rocket", "missile"].forEach((compare) => {
          shouldLookForWeapons = shouldLookForWeapons || nameLower.includes(compare);
        });
        if (shouldLookForWeapons) {
          let foundWeapon = ImportHelper.findItem((item) => {
            if (!item || !item.name)
              return false;
            return item.type === "weapon" && item.name.toLowerCase() === nameLower;
          });
          if (foundWeapon != null && "action" in foundWeapon.data.data) {
            const weaponData = foundWeapon.data.data;
            data.data.damage = weaponData.action.damage.value;
            data.data.ap = weaponData.action.damage.ap.value;
          }
        }
        data.data.technology.conceal.base = 0;
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        ammoDatas.push(data);
      }
      for (let i = 0; i < ammoDatas.length; i++) {
        let folderName = "Misc";
        let ammo = ammoDatas[i];
        let splitName = ammo.name.split(":");
        if (splitName.length > 1) {
          folderName = splitName[0].trim();
        }
        let folder = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Ammo/${folderName}`, true);
        ammo.folder = folder.id;
      }
      return yield Item.create(ammoDatas);
    });
  }
};

// src/module/importer/parser/mod/ModParserBase.ts
var ModParserBase = class extends TechnologyItemParserBase {
  Parse(jsonData, data) {
    data = super.Parse(jsonData, data);
    data.data.type = "weapon";
    data.data.mount_point = ImportHelper.StringValue(jsonData, "mount");
    data.data.rc = ImportHelper.IntValue(jsonData, "rc", 0);
    data.data.accuracy = ImportHelper.IntValue(jsonData, "accuracy", 0);
    data.data.technology.conceal.base = ImportHelper.IntValue(jsonData, "conceal", 0);
    return data;
  }
};

// src/module/importer/importer/ModImporter.ts
var ModImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["weapons.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("accessories") && jsonObject["accessories"].hasOwnProperty("accessory");
  }
  GetDefaultData() {
    return {
      name: "",
      type: "modification",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        technology: DefaultValues.technologyData({ rating: 1, equipped: true }),
        type: "",
        mount_point: "",
        dice_pool: 0,
        accuracy: 0,
        rc: 0
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonWeaponsi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.accessoryTranslations = ImportHelper.ExtractItemTranslation(jsonWeaponsi18n, "accessories", "accessory");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const parser = new ModParserBase();
      let datas = [];
      let jsonDatas = jsonObject["accessories"]["accessory"];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        let data = parser.Parse(jsonData, this.GetDefaultData());
        data.name = ImportHelper.MapNameToTranslation(this.accessoryTranslations, data.name);
        let folderName = data.data.mount_point !== void 0 ? data.data.mount_point : "Other";
        if (folderName.includes("/")) {
          let splitName = folderName.split("/");
          folderName = splitName[0];
        }
        let folder = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Mods/${folderName}`, true);
        data.folder = folder.id;
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/parser/spell/SpellParserBase.ts
var SpellParserBase = class extends ItemParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data.name = ImportHelper.StringValue(jsonData, "name");
    data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.StringValue(jsonData, "page")}`;
    data.data.category = ImportHelper.StringValue(jsonData, "category").toLowerCase();
    let damage = ImportHelper.StringValue(jsonData, "damage");
    if (damage === "P") {
      data.data.action.damage.type.base = "physical";
      data.data.action.damage.type.value = "physical";
    } else if (damage === "S") {
      data.data.action.damage.type.base = "stun";
      data.data.action.damage.type.value = "stun";
    }
    let duration = ImportHelper.StringValue(jsonData, "duration");
    if (duration === "I") {
      data.data.duration = "instant";
    } else if (duration === "S") {
      data.data.duration = "sustained";
    } else if (duration === "P") {
      data.data.duration = "permanent";
    }
    let drain = ImportHelper.StringValue(jsonData, "dv");
    if (drain.includes("+") || drain.includes("-")) {
      data.data.drain = parseInt(drain.substring(1, drain.length));
    }
    let range = ImportHelper.StringValue(jsonData, "range");
    if (range === "T") {
      data.data.range = "touch";
    } else if (range === "LOS") {
      data.data.range = "los";
    } else if (range === "LOS (A)") {
      data.data.range = "los_a";
    }
    let type = ImportHelper.StringValue(jsonData, "type");
    if (type === "P") {
      data.data.type = "physical";
    } else if (type === "M") {
      data.data.type = "mana";
    }
    if (jsonTranslation) {
      const origName = ImportHelper.StringValue(jsonData, "name");
      data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
      data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
    }
    return data;
  }
};

// src/module/importer/parser/spell/CombatSpellParser.ts
var CombatSpellParser = class extends SpellParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    let descriptor = ImportHelper.StringValue(jsonData, "descriptor");
    if (descriptor === void 0) {
      descriptor = "";
    }
    data.data.combat.type = descriptor.includes("Indirect") ? "indirect" : "direct";
    return data;
  }
};

// src/module/importer/parser/spell/ManipulationSpellParser.ts
var ManipulationSpellParser = class extends SpellParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    let descriptor = ImportHelper.StringValue(jsonData, "descriptor");
    if (descriptor === void 0) {
      descriptor = "";
    }
    data.data.manipulation.environmental = descriptor.includes("Environmental");
    data.data.manipulation.mental = descriptor.includes("Mental");
    if (data.data.manipulation.mental) {
      data.data.action.opposed.type = "custom";
      data.data.action.opposed.attribute = "logic";
      data.data.action.opposed.attribute2 = "willpower";
    }
    data.data.manipulation.physical = descriptor.includes("Physical");
    if (data.data.manipulation.physical) {
      data.data.action.opposed.type = "custom";
      data.data.action.opposed.attribute = "body";
      data.data.action.opposed.attribute2 = "strength";
    }
    data.data.manipulation.damaging = descriptor.includes("Damaging");
    if (data.data.manipulation.damaging) {
      data.data.action.opposed.type = "soak";
    }
    return data;
  }
};

// src/module/importer/parser/spell/IllusionSpellParser.ts
var IllusionSpellParser = class extends SpellParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    let descriptor = ImportHelper.StringValue(jsonData, "descriptor");
    if (descriptor === void 0) {
      descriptor = "";
    }
    if (data.data.type === "mana") {
      data.data.action.opposed.type = "custom";
      data.data.action.opposed.attribute = "logic";
      data.data.action.opposed.attribute2 = "willpower";
    } else if (data.data.type === "physical") {
      data.data.action.opposed.type = "custom";
      data.data.action.opposed.attribute = "intuition";
      data.data.action.opposed.attribute2 = "logic";
    }
    return data;
  }
};

// src/module/importer/parser/spell/DetectionSpellImporter.ts
var DetectionSpellImporter = class extends SpellParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    let descriptor = ImportHelper.StringValue(jsonData, "descriptor");
    if (descriptor === void 0) {
      descriptor = "";
    }
    data.data.detection.passive = descriptor.includes("Passive");
    if (!data.data.detection.passive) {
      data.data.action.opposed.type = "custom";
      data.data.action.opposed.attribute = "willpower";
      data.data.action.opposed.attribute2 = "logic";
    }
    data.data.detection.extended = descriptor.includes("Extended");
    if (descriptor.includes("Psychic")) {
      data.data.detection.type = "psychic";
    } else if (descriptor.includes("Directional")) {
      data.data.detection.type = "directional";
    } else if (descriptor.includes("Area")) {
      data.data.detection.type = "area";
    }
    return data;
  }
};

// src/module/importer/importer/SpellImporter.ts
var SpellImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["spells.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("spells") && jsonObject["spells"].hasOwnProperty("spell");
  }
  GetDefaultData() {
    return {
      name: "Unnamed Item",
      type: "spell",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        action: DefaultValues.actionData({
          type: "varies",
          attribute: "magic",
          skill: "spellcasting",
          damage: DefaultValues.damageData({ type: { base: "", value: "" } })
        }),
        drain: 0,
        category: "",
        type: "",
        range: "",
        duration: "",
        extended: false,
        combat: {
          type: ""
        },
        detection: {
          passive: false,
          type: "",
          extended: false
        },
        illusion: {
          type: "",
          sense: ""
        },
        manipulation: {
          damaging: false,
          mental: false,
          environmental: false,
          physical: false
        }
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonSpelli18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonSpelli18n);
    this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonSpelli18n, "spells", "spell");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const folders = yield ImportHelper.MakeCategoryFolders(jsonObject, "Spells", this.categoryTranslations);
      const parser = new ParserMap("category", [
        { key: "Combat", value: new CombatSpellParser() },
        { key: "Manipulation", value: new ManipulationSpellParser() },
        { key: "Illusion", value: new IllusionSpellParser() },
        { key: "Detection", value: new DetectionSpellImporter() },
        { key: "Health", value: new SpellParserBase() },
        { key: "Enchantments", value: new SpellParserBase() },
        { key: "Rituals", value: new SpellParserBase() }
      ]);
      let datas = [];
      let jsonDatas = jsonObject["spells"]["spell"];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
        data.folder = folders[data.data.category].id;
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/parser/quality/QualityParserBase.ts
var QualityParserBase = class extends ItemParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data.name = ImportHelper.StringValue(jsonData, "name");
    data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.StringValue(jsonData, "page")}`;
    data.data.type = ImportHelper.StringValue(jsonData, "category") === "Positive" ? "positive" : "negative";
    if (jsonTranslation) {
      const origName = ImportHelper.StringValue(jsonData, "name");
      data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
      data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
    }
    return data;
  }
};

// src/module/importer/importer/QualityImporter.ts
var QualityImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["qualities.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("qualities") && jsonObject["qualities"].hasOwnProperty("quality");
  }
  GetDefaultData() {
    return {
      name: "Unnamed Quality",
      type: "quality",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        action: DefaultValues.actionData({
          damage: DefaultValues.damageData({ type: { base: "", value: "" } })
        }),
        type: ""
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonQualityi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonQualityi18n);
    this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonQualityi18n, "qualities", "quality");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const jsonNameTranslations = {};
      const folders = yield ImportHelper.MakeCategoryFolders(jsonObject, "Qualities", this.categoryTranslations);
      const parser = new QualityParserBase();
      let datas = [];
      let jsonDatas = jsonObject["qualities"]["quality"];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
        let category = ImportHelper.StringValue(jsonData, "category");
        data.folder = folders[category.toLowerCase()].id;
        data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/parser/complex-form/ComplexFormParserBase.ts
var ComplexFormParserBase = class extends ItemParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data.name = ImportHelper.StringValue(jsonData, "name");
    data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.StringValue(jsonData, "page")}`;
    let fade = ImportHelper.StringValue(jsonData, "fv");
    if (fade.includes("+") || fade.includes("-")) {
      data.data.fade = parseInt(fade.substring(1, fade.length));
    }
    let duration = ImportHelper.StringValue(jsonData, "duration");
    if (duration === "I") {
      data.data.duration = "instant";
    } else if (duration === "S") {
      data.data.duration = "sustained";
    } else if (duration === "P") {
      data.data.duration = "permanent";
    }
    let target = ImportHelper.StringValue(jsonData, "target");
    switch (target) {
      case "Device":
      case "File":
      case "Host":
      case "Persona":
      case "Self":
      case "Sprite":
        data.data.target = target.toLowerCase();
        break;
      default:
        data.data.target = "other";
        break;
    }
    if (jsonTranslation) {
      const origName = ImportHelper.StringValue(jsonData, "name");
      data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
      data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
    }
    return data;
  }
};

// src/module/importer/importer/ComplexFormImporter.ts
var ComplexFormImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["complexforms.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("complexforms") && jsonObject["complexforms"].hasOwnProperty("complexform");
  }
  GetDefaultData() {
    return {
      name: "Unnamed Form",
      type: "complex_form",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        action: DefaultValues.actionData({
          type: "complex",
          attribute: "resonance",
          skill: "compiling"
        }),
        target: "",
        duration: "",
        fade: 0
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonItemi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.nameTranslations = ImportHelper.ExtractItemTranslation(jsonItemi18n, "complexforms", "complexform");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const parser = new ComplexFormParserBase();
      const folder = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Complex Forms`, true);
      let datas = [];
      let jsonDatas = jsonObject["complexforms"]["complexform"];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        let data = parser.Parse(jsonData, this.GetDefaultData(), this.nameTranslations);
        data.folder = folder.id;
        data.name = ImportHelper.MapNameToTranslation(this.nameTranslations, data.name);
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/parser/ware/CyberwareParser.ts
var CyberwareParser = class extends TechnologyItemParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data = super.Parse(jsonData, data, jsonTranslation);
    const essence = ImportHelper.StringValue(jsonData, "ess", "0").match(/[0-9]\.?[0-9]*/g);
    if (essence !== null) {
      data.data.essence = parseFloat(essence[0]);
    }
    const capacity = ImportHelper.StringValue(jsonData, "capacity", "0").match(/[0-9]+/g);
    if (capacity !== null) {
      data.data.capacity = parseInt(capacity[0]);
    }
    return data;
  }
};

// src/module/importer/importer/WareImporter.ts
var WareImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["cyberware.xml", "bioware.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("cyberwares") && jsonObject["cyberwares"].hasOwnProperty("cyberware") || jsonObject.hasOwnProperty("biowares") && jsonObject["biowares"].hasOwnProperty("bioware");
  }
  GetDefaultCyberwareData() {
    return __spreadProps(__spreadValues({}, this.GetDefaultData()), { type: "cyberware" });
  }
  GetDefaultBiowareData() {
    return __spreadProps(__spreadValues({}, this.GetDefaultData()), { type: "bioware" });
  }
  GetDefaultData() {
    return {
      name: "Unnamed Form",
      type: "cyberware",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        technology: DefaultValues.technologyData({ rating: 1 }),
        armor: {
          value: 0,
          mod: false,
          acid: 0,
          cold: 0,
          fire: 0,
          electricity: 0,
          radiation: 0
        },
        action: DefaultValues.actionData(),
        grade: "standard",
        essence: 0,
        capacity: 0
      }
    };
  }
  ExtractTranslation(fileName) {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonItemi18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, fileName);
    if (this.files.length !== 2)
      console.error("Lazily hacked code will fail for more or less than two files.");
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonItemi18n);
    const { typeKey, listKey } = fileName === "cyberware.xml" ? { typeKey: "cyberwares", listKey: "cyberware" } : { typeKey: "biowares", listKey: "bioware" };
    this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonItemi18n, typeKey, listKey);
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const cyberParser = new CyberwareParser();
      let key = jsonObject.hasOwnProperty("cyberwares") ? "Cyberware" : "Bioware";
      const folders = yield ImportHelper.MakeCategoryFolders(jsonObject, key);
      key = key.toLowerCase();
      let datas = [];
      let jsonDatas = jsonObject[key + "s"][key];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        if (DataImporter.unsupportedEntry(jsonData)) {
          continue;
        }
        const defaultData = key === "cyberware" ? this.GetDefaultCyberwareData() : this.GetDefaultBiowareData();
        let data = cyberParser.Parse(jsonData, defaultData, this.itemTranslations);
        const category = ImportHelper.StringValue(jsonData, "category");
        data.folder = folders[category.toLowerCase()].id;
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/parser/critter-power/CritterPowerParserBase.ts
var CritterPowerParserBase = class extends ItemParserBase {
  Parse(jsonData, data, jsonTranslation) {
    data.name = ImportHelper.StringValue(jsonData, "name");
    data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.StringValue(jsonData, "page")}`;
    data.data.category = ImportHelper.StringValue(jsonData, "category").toLowerCase();
    let duration = ImportHelper.StringValue(jsonData, "duration");
    if (duration === "Always") {
      data.data.duration = "always";
    } else if (duration === "Instant") {
      data.data.duration = "instant";
    } else if (duration === "Sustained") {
      data.data.duration = "sustained";
    } else if (duration === "Permanent") {
      data.data.duration = "permanent";
    } else {
      data.data.duration = "special";
    }
    let range = ImportHelper.StringValue(jsonData, "range");
    if (range === "T") {
      data.data.range = "touch";
    } else if (range === "LOS") {
      data.data.range = "los";
    } else if (range === "LOS (A)") {
      data.data.range = "los_a";
    } else if (range === "Self") {
      data.data.range = "self";
    } else {
      data.data.range = "special";
    }
    let type = ImportHelper.StringValue(jsonData, "type");
    if (type === "P") {
      data.data.powerType = "physical";
    } else if (type === "M") {
      data.data.powerType = "mana";
    }
    if (jsonTranslation) {
      const origName = ImportHelper.StringValue(jsonData, "name");
      data.name = ImportHelper.MapNameToTranslation(jsonTranslation, origName);
      data.data.description.source = `${ImportHelper.StringValue(jsonData, "source")} ${ImportHelper.MapNameToPageSource(jsonTranslation, origName)}`;
    }
    return data;
  }
};

// src/module/importer/importer/CritterPowerImporter.ts
var CritterPowerImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["critterpowers.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("powers") && jsonObject["powers"].hasOwnProperty("power");
  }
  GetDefaultData() {
    return {
      name: "Unnamed Item",
      type: "critter_power",
      data: {
        description: {
          value: "",
          chat: "",
          source: ""
        },
        action: DefaultValues.actionData({
          damage: DefaultValues.damageData({ type: { base: "", value: "" } })
        }),
        armor: {
          value: 0,
          mod: false,
          acid: 0,
          cold: 0,
          fire: 0,
          electricity: 0,
          radiation: 0
        },
        category: "",
        powerType: "",
        range: "",
        duration: "",
        karma: 0
      }
    };
  }
  ExtractTranslation() {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonCritterPoweri18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonCritterPoweri18n);
    this.itemTranslations = ImportHelper.ExtractItemTranslation(jsonCritterPoweri18n, "powers", "power");
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const parser = new CritterPowerParserBase();
      const folder = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/Critter Powers`, true);
      let datas = [];
      let jsonDatas = jsonObject["powers"]["power"];
      for (let i = 0; i < jsonDatas.length; i++) {
        let jsonData = jsonDatas[i];
        let data = parser.Parse(jsonData, this.GetDefaultData(), this.itemTranslations);
        data.folder = folder.id;
        data.name = ImportHelper.MapNameToTranslation(this.itemTranslations, data.name);
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        datas.push(data);
      }
      return yield Item.create(datas);
    });
  }
};

// src/module/importer/importer/DeviceImporter.ts
var DeviceImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["gear.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("gears") && jsonObject["gears"].hasOwnProperty("gear");
  }
  GetDefaultData() {
    return DefaultValues.deviceItemData();
  }
  ExtractTranslation(fileName) {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
    this.entryTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, "gears", "gear");
  }
  ParseCommlinkDevices(commlinks, folder) {
    const entries = [];
    for (const commlink of commlinks) {
      if (DataImporter.unsupportedEntry(commlink)) {
        continue;
      }
      const data = this.GetDefaultData();
      data.name = ImportHelper.StringValue(commlink, "name");
      data.name = ImportHelper.MapNameToTranslation(this.entryTranslations, data.name);
      data.data.description.source = `${ImportHelper.StringValue(commlink, "source")} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(commlink, "name"), ImportHelper.StringValue(commlink, "page"))}`;
      data.data.technology.rating = ImportHelper.IntValue(commlink, "devicerating", 0);
      data.data.technology.availability = ImportHelper.StringValue(commlink, "avail");
      data.data.technology.cost = ImportHelper.IntValue(commlink, "cost", 0);
      data.data.atts.att3.value = ImportHelper.IntValue(commlink, "dataprocessing", 0);
      data.data.atts.att4.value = ImportHelper.IntValue(commlink, "firewall", 0);
      data.folder = folder.id;
      Helpers.injectActionTestsIntoChangeData(data.type, data, data);
      entries.push(data);
    }
    return entries;
  }
  ParseCyberdeckDevices(cyberdecks, folder) {
    const entries = [];
    for (const cyberdeck of cyberdecks) {
      if (DataImporter.unsupportedEntry(cyberdeck)) {
        continue;
      }
      const data = this.GetDefaultData();
      data.data.category = "cyberdeck";
      data.name = ImportHelper.StringValue(cyberdeck, "name");
      data.name = ImportHelper.MapNameToTranslation(this.entryTranslations, data.name);
      data.data.description.source = `${ImportHelper.StringValue(cyberdeck, "source")} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(cyberdeck, "name"), ImportHelper.StringValue(cyberdeck, "page"))}`;
      data.data.technology.rating = ImportHelper.IntValue(cyberdeck, "devicerating", 0);
      data.data.technology.availability = ImportHelper.StringValue(cyberdeck, "avail");
      data.data.technology.cost = ImportHelper.IntValue(cyberdeck, "cost", 0);
      if (cyberdeck.hasOwnProperty("attributearray")) {
        const attributeOrder = ImportHelper.StringValue(cyberdeck, "attributearray").split(",");
        const att1 = Number(attributeOrder[0]);
        const att2 = Number(attributeOrder[1]);
        const att3 = Number(attributeOrder[2]);
        const att4 = Number(attributeOrder[3]);
        data.data.atts.att1.value = att1;
        data.data.atts.att2.value = att2;
        data.data.atts.att3.value = att3;
        data.data.atts.att4.value = att4;
      } else if (cyberdeck.hasOwnProperty("attack")) {
        data.data.atts.att1.value = ImportHelper.IntValue(cyberdeck, "attack", 0);
        data.data.atts.att2.value = ImportHelper.IntValue(cyberdeck, "sleaze", 0);
        data.data.atts.att3.value = ImportHelper.IntValue(cyberdeck, "dataprocessing", 0);
        data.data.atts.att4.value = ImportHelper.IntValue(cyberdeck, "firewall", 0);
      }
      data.folder = folder.id;
      Helpers.injectActionTestsIntoChangeData(data.type, data, data);
      entries.push(data);
    }
    return entries;
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      let entries = [];
      const commlinks = jsonObject["gears"]["gear"].filter((gear) => ImportHelper.StringValue(gear, "category", "") === "Commlinks");
      const cyberdecks = jsonObject["gears"]["gear"].filter((gear) => ImportHelper.StringValue(gear, "category", "") === "Cyberdecks");
      let commlinksFolder = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize("SR5.DeviceCatCommlink")}`, true);
      let cyberdecksFolder = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize("SR5.DeviceCatCyberdeck")}`, true);
      entries = entries.concat(this.ParseCommlinkDevices(commlinks, commlinksFolder));
      entries = entries.concat(this.ParseCyberdeckDevices(cyberdecks, cyberdecksFolder));
      return yield Item.create(entries);
    });
  }
  static unsupportedEntry(jsonData) {
    if (DataImporter.unsupportedEntry(jsonData)) {
      return true;
    }
    const unsupportedIds = [
      "d63eb841-7b15-4539-9026-b90a4924aeeb"
    ];
    return unsupportedIds.includes(ImportHelper.StringValue(jsonData, "id"));
  }
};

// src/module/importer/importer/EquipmentImporter.ts
var EquipmentImporter = class extends DataImporter {
  constructor() {
    super(...arguments);
    this.files = ["gear.xml"];
  }
  CanParse(jsonObject) {
    return jsonObject.hasOwnProperty("gears") && jsonObject["gears"].hasOwnProperty("gear");
  }
  GetDefaultData() {
    return DefaultValues.equipmentItemData();
  }
  ExtractTranslation(fileName) {
    if (!DataImporter.jsoni18n) {
      return;
    }
    let jsonGeari18n = ImportHelper.ExtractDataFileTranslation(DataImporter.jsoni18n, this.files[0]);
    this.categoryTranslations = ImportHelper.ExtractCategoriesTranslation(jsonGeari18n);
    this.entryTranslations = ImportHelper.ExtractItemTranslation(jsonGeari18n, "gears", "gear");
  }
  ParseEquipments(equipments) {
    return __async(this, null, function* () {
      const entries = [];
      for (const equipment of equipments) {
        if (DataImporter.unsupportedEntry(equipment)) {
          continue;
        }
        const category = ImportHelper.TranslateCategory(ImportHelper.StringValue(equipment, "category"), this.categoryTranslations).replace("/", " ");
        let categoryFolder = yield ImportHelper.GetFolderAtPath(`${Constants.ROOT_IMPORT_FOLDER_NAME}/${game.i18n.localize("SR5.Gear")}/${category}`, true);
        const data = this.GetDefaultData();
        data.name = ImportHelper.StringValue(equipment, "name");
        data.name = ImportHelper.MapNameToTranslation(this.entryTranslations, data.name);
        data.data.description.source = `${ImportHelper.StringValue(equipment, "source")} ${ImportHelper.MapNameToPageSource(this.entryTranslations, ImportHelper.StringValue(equipment, "name"), ImportHelper.StringValue(equipment, "page"))}`;
        data.data.technology.rating = ImportHelper.IntValue(equipment, "rating", 0);
        data.data.technology.availability = ImportHelper.StringValue(equipment, "avail");
        data.data.technology.cost = ImportHelper.IntValue(equipment, "cost", 0);
        data.folder = categoryFolder.id;
        Helpers.injectActionTestsIntoChangeData(data.type, data, data);
        entries.push(data);
      }
      return entries;
    });
  }
  FilterJsonObjects(jsonObject) {
    const unsupportedCategories = [
      "Ammunition",
      "Commlinks",
      "Cyberdecks",
      "Hacking Programs",
      "Rigger Command Consoles",
      "Custom"
    ];
    return jsonObject["gears"]["gear"].filter((gear) => !unsupportedCategories.includes(ImportHelper.StringValue(gear, "category", "")));
  }
  Parse(jsonObject) {
    return __async(this, null, function* () {
      const equipments = this.FilterJsonObjects(jsonObject);
      const entries = yield this.ParseEquipments(equipments);
      return yield Item.create(entries);
    });
  }
};

// src/module/importer/apps/import-form.ts
var _Import = class extends Application {
  constructor() {
    super();
    this.supportedDataFiles = [];
    this.dataFiles = [];
    this.parsedFiles = [];
    this.disableImportButton = true;
    this.isDataFile = (file) => {
      return this.supportedDataFiles.some((supported) => supported === file.name);
    };
    this.isLangDataFile = (file) => {
      const pattern = /[a-zA-Z]{2}-[a-zA-Z]{2}_data\.xml/;
      return file.name.match(pattern) !== null;
    };
    this.collectDataImporterFileSupport();
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "chummer-data-import";
    options.classes = ["app", "window-app", "filepicker"];
    options.title = "Chummer/Data Import";
    options.template = "systems/shadowrun5e/dist/templates/apps/compendium-import.html";
    options.width = 600;
    options.height = "auto";
    return options;
  }
  getData(options) {
    const data = super.getData(options);
    data.dataFiles = {};
    this.supportedDataFiles.forEach((supportedFileName) => {
      const missing = !this.dataFiles.some((dataFile) => supportedFileName === dataFile.name);
      const parsed = this.parsedFiles.some((parsedFileName) => supportedFileName === parsedFileName);
      const parsing = supportedFileName === this.currentParsedFile;
      data.dataFiles[supportedFileName] = {
        name: supportedFileName,
        missing,
        parsed,
        parsing
      };
    });
    data.langDataFile = this.langDataFile ? this.langDataFile.name : "";
    data.finishedOverallParsing = this.supportedDataFiles.length === this.parsedFiles.length;
    data.disableImportButton = this.disableImportButton;
    return __spreadValues({}, data);
  }
  collectDataImporterFileSupport() {
    this.supportedDataFiles = [];
    _Import.Importers.forEach((importer) => {
      if (this.supportedDataFiles.some((supported) => importer.files.includes(supported))) {
        return;
      }
      this.supportedDataFiles = this.supportedDataFiles.concat(importer.files);
    });
  }
  clearParsingStatus() {
    this.parsedFiles = [];
  }
  parseXML(xmlSource, fileName) {
    return __async(this, null, function* () {
      let jsonSource = yield DataImporter.xml2json(xmlSource);
      ImportHelper.SetMode(1 /* XML */);
      for (const di of _Import.Importers) {
        if (di.CanParse(jsonSource)) {
          di.ExtractTranslation(fileName);
          yield di.Parse(jsonSource);
        }
      }
    });
  }
  parseXmli18n(xmlSource) {
    return __async(this, null, function* () {
      if (!xmlSource) {
        return;
      }
      let jsonSource = yield DataImporter.xml2json(xmlSource);
      if (DataImporter.CanParseI18n(jsonSource)) {
        DataImporter.ParseTranslation(jsonSource);
      }
    });
  }
  activateListeners(html) {
    html.find("button[type='submit']").on("click", (event) => __async(this, null, function* () {
      event.preventDefault();
      this.clearParsingStatus();
      this.disableImportButton = true;
      yield this.render();
      if (this.langDataFile) {
        const text = yield this.langDataFile.text();
        yield this.parseXmli18n(text);
      }
      for (const supportedFile of this.supportedDataFiles) {
        const dataFile = this.dataFiles.find((dataFile2) => dataFile2.name === supportedFile);
        if (dataFile) {
          const text = yield dataFile.text();
          this.currentParsedFile = dataFile.name;
          yield this.render();
          yield this.parseXML(text, dataFile.name);
          if (!this.parsedFiles.some((parsedFileName) => parsedFileName === dataFile.name)) {
            this.parsedFiles.push(dataFile.name);
          }
          yield this.render();
        }
      }
      this.disableImportButton = false;
      yield this.render();
    }));
    html.find("input[type='file'].langDataFileDrop").on("change", (event) => __async(this, null, function* () {
      Array.from(event.target.files).forEach((file) => {
        if (this.isLangDataFile(file)) {
          this.langDataFile = file;
          this.render();
        }
      });
      return true;
    }));
    html.find("input[type='file'].filedatadrop").on("change", (event) => __async(this, null, function* () {
      Array.from(event.target.files).forEach((file) => {
        if (this.isDataFile(file)) {
          const existingIdx = this.dataFiles.findIndex((dataFile) => dataFile.name === file.name);
          if (existingIdx === -1) {
            this.dataFiles.push(file);
          } else {
            this.dataFiles[existingIdx] = file;
          }
        }
      });
      if (this.dataFiles.length > 0) {
        this.disableImportButton = false;
      }
      this.render();
    }));
  }
};
var Import = _Import;
Import.Importers = [
  new ModImporter(),
  new WeaponImporter(),
  new ArmorImporter(),
  new AmmoImporter(),
  new SpellImporter(),
  new ComplexFormImporter(),
  new QualityImporter(),
  new WareImporter(),
  new CritterPowerImporter(),
  new DeviceImporter(),
  new EquipmentImporter()
];

// src/module/apps/ChangelogApplication.ts
var ChangelogApplication = class extends Application {
  get template() {
    return "systems/shadowrun5e/dist/templates/apps/changelog.html";
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["shadowrun5e"];
    options.title = game.i18n.localize("SR5.ChangelogApplication.Title");
    options.width = 500;
    options.height = "auto";
    return options;
  }
  render(force, options) {
    ChangelogApplication.setRenderForCurrentVersion();
    return super.render(force, options);
  }
  static setRenderForCurrentVersion() {
    var _a;
    (_a = game.user) == null ? void 0 : _a.setFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion, game.system.version);
  }
  static get showApplication() {
    var _a, _b, _c;
    if (!((_a = game.user) == null ? void 0 : _a.isGM) || !((_b = game.user) == null ? void 0 : _b.isTrusted))
      return false;
    const shownForVersion = (_c = game.user) == null ? void 0 : _c.getFlag(SYSTEM_NAME, FLAGS.ChangelogShownForVersion);
    return shownForVersion !== game.system.version;
  }
};

// src/module/apps/EnvModifiersApplication.ts
var EnvModifiersApplication = class extends Application {
  constructor(target) {
    super();
    this.target = target;
  }
  get template() {
    return "systems/shadowrun5e/dist/templates/apps/env-modifiers.html";
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.classes = ["sr5", "form-dialog"];
    options.id = "env-modifiers-application";
    options.title = game.i18n.localize("SR5.EnvModifiersApplication.Title");
    options.width = "auto";
    options.height = "auto";
    options.resizable = true;
    return options;
  }
  getData(options) {
    return __async(this, null, function* () {
      const data = __superGet(EnvModifiersApplication.prototype, this, "getData").call(this, options);
      this.modifiers = yield this._getModifiers();
      data.active = this.modifiers.environmental.active;
      data.total = this.modifiers.environmental.total;
      data.levels = Modifiers.getEnvironmentalModifierLevels();
      data.targetType = this._getTargetTypeLabel();
      data.targetName = this.target.name;
      data.disableForm = this._disableInputsForUser();
      return data;
    });
  }
  activateListeners(html) {
    $(html).find("button.env-modifier").on("click", this._handleModifierChange.bind(this));
    $(html).find("button.remove-modifiers-from-target").on("click", this._handleRemoveModifiersFromTarget.bind(this));
  }
  _handleModifierChange(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const element = event.currentTarget;
      if (!element.dataset.category || !element.dataset.value)
        return;
      const category = element.dataset.category;
      const value = Number(element.dataset.value);
      this._toggleActiveModifierCategory(category, value);
      yield this._clearModifiersOnTargetForNoSelection();
      yield this._storeModifiersOnTarget();
      this._updateTokenHUDTotalDisplay();
      yield this.render();
    });
  }
  _updateTokenHUDTotalDisplay() {
    if (this.target instanceof SR5Actor) {
      $(".modifier-value-environmental").each((index, element) => {
        $(element).html(this.modifiers.environmental.total.toString());
      });
    }
  }
  _handleRemoveModifiersFromTarget(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      yield this.clearModifiersOnTarget();
      this._updateTokenHUDTotalDisplay();
      yield this.render();
    });
  }
  _toggleActiveModifierCategory(category, level) {
    this.modifiers.toggleEnvironmentalCategory(category, level);
  }
  _getModifiers() {
    return __async(this, null, function* () {
      if (this.target instanceof SR5Actor) {
        return yield this.target.getModifiers();
      }
      return Modifiers.getModifiersFromEntity(this.target);
    });
  }
  _storeModifiersOnTarget() {
    return __async(this, null, function* () {
      yield Modifiers.setModifiersOnEntity(this.target, this.modifiers.data);
    });
  }
  _clearModifiersOnTargetForNoSelection() {
    return __async(this, null, function* () {
      if (!this.modifiers.hasActiveEnvironmental) {
        this.modifiers = yield Modifiers.clearEnvironmentalOnEntity(this.target);
      }
    });
  }
  _targetHasEnvironmentalModifiers() {
    return __async(this, null, function* () {
      const modifiers = Modifiers.getModifiersFromEntity(this.target);
      return !!modifiers.environmental;
    });
  }
  clearModifiersOnTarget() {
    return __async(this, null, function* () {
      yield Modifiers.clearEnvironmentalOnEntity(this.target);
      this.modifiers = yield this._getModifiers();
    });
  }
  _getTargetTypeLabel() {
    if (this.target instanceof Scene) {
      return game.i18n.localize("DOCUMENT.Scene");
    }
    if (this.target instanceof SR5Actor) {
      return game.i18n.localize("DOCUMENT.Actor");
    }
    return "";
  }
  _disableInputsForUser() {
    var _a;
    if (!game.user)
      return false;
    return !(((_a = game.user) == null ? void 0 : _a.isGM) || this.target.testUserPermission(game.user, "OWNER"));
  }
  static openForCurrentScene() {
    return __async(this, null, function* () {
      if (!canvas || !canvas.ready || !canvas.scene)
        return;
      yield new EnvModifiersApplication(canvas.scene).render(true);
    });
  }
  static openForTokenHUD(tokenId) {
    const token = Helpers.getToken(tokenId);
    return (event) => __async(this, null, function* () {
      event.preventDefault();
      if (!token || !token.actor)
        return;
      yield new EnvModifiersApplication(token.actor).render(true);
    });
  }
  static getControl() {
    return {
      name: "environmental-modifiers-application",
      title: "CONTROLS.SR5.EnvironmentalModifiers",
      icon: "fas fa-list",
      onClick: EnvModifiersApplication.openForCurrentScene,
      button: true
    };
  }
  static addTokenHUDFields(app, html, data) {
    return __async(this, null, function* () {
      if (!data._id)
        return;
      console.log(`${SYSTEM_NAME} | Environmental Modifier HUD on renderTokenHUD`);
      const token = Helpers.getToken(data._id);
      if (!token)
        return;
      const actor = token.actor;
      const modifiers = yield actor.getModifiers();
      const container = $('<div class="col far-right sr-modifier-container"></div>');
      const column = $('<div class="col modifier-column"></div>');
      const modifier = $('<div class="modifier-row"></div>');
      const modifierValue = $(`<div class="modifier-value modifier-value-environmental">${modifiers.environmental.total}</div>`);
      const modifierDescription = $(`<div class="modifier-description open-environmental-modifier">${game.i18n.localize("SR5.EnvironmentModifier")}</div>`);
      modifierDescription.on("click", EnvModifiersApplication.openForTokenHUD(data._id));
      container.append(column);
      column.append(modifier);
      modifier.append(modifierValue);
      modifier.append(modifierDescription);
      html.find(".col.right").after(container);
    });
  }
};

// src/test/sr5.Modifiers.spec.ts
var shadowrunRulesModifiers = (context) => {
  const { describe, it, assert } = context;
  const defaultModifiers = {
    environmental: {
      active: {},
      total: 0
    }
  };
  const activeModifiers = {
    environmental: {
      active: {
        wind: -1,
        light: -1
      },
      total: -3
    }
  };
  describe("SR5 Modifiers", () => {
    it("should create default modifier values", () => {
      const modifiers = Modifiers.getDefaultModifiers();
      assert.deepEqual(modifiers, defaultModifiers);
    });
    it("should use default modifiers for faulty constructor params", () => {
      assert.deepEqual(new Modifiers({}).data, defaultModifiers);
      assert.deepEqual(new Modifiers(void 0).data, defaultModifiers);
      assert.deepEqual(new Modifiers(null).data, defaultModifiers);
      assert.deepEqual(new Modifiers(0).data, defaultModifiers);
      assert.deepEqual(new Modifiers(1).data, defaultModifiers);
      assert.deepEqual(new Modifiers().data, defaultModifiers);
    });
    it("should set an environmental modifier active", () => {
      const modifiers = new Modifiers(defaultModifiers);
      modifiers._setEnvironmentalCategoryActive("wind", -1);
    });
    it("should set an environmental modifier inactive", () => {
      const modifiers = new Modifiers({
        environmental: {
          active: {
            wind: -1,
            light: -3
          },
          total: 0
        }
      });
      modifiers._setEnvironmentalCategoryInactive("wind");
      assert.deepEqual(modifiers.environmental.active, { light: -3 });
    });
    it("should understand active environmental modifiers", () => {
      const modifiersActive = new Modifiers({
        environmental: {
          active: {
            wind: -1,
            light: -3
          },
          total: 0
        }
      });
      assert.equal(modifiersActive.hasActiveEnvironmental, true);
      const modifiersInactive = new Modifiers({
        environmental: {
          active: {},
          total: 0
        }
      });
      assert.equal(modifiersInactive.hasActiveEnvironmental, false);
    });
    it("should calculate the total according to sr5 rules", () => {
      const modifiers = new Modifiers(defaultModifiers);
      assert.equal(modifiers.environmental.total, 0);
      modifiers.environmental.active.wind = -1;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -1);
      modifiers.environmental.active.light = -1;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -3);
      modifiers.environmental.active.range = -1;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -3);
      delete modifiers.environmental.active.light;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -3);
      modifiers.environmental.active.light = 0;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -3);
      modifiers.environmental.active.wind = -3;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -3);
      modifiers.environmental.active.light = -3;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -6);
      modifiers.environmental.active.range = -3;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -6);
      delete modifiers.environmental.active.light;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -6);
      modifiers.environmental.active.light = 0;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -6);
      modifiers.environmental.active.wind = -6;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -6);
      modifiers.environmental.active.light = -6;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -10);
      modifiers.environmental.active.range = -6;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -10);
      delete modifiers.environmental.active.light;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -10);
      modifiers.environmental.active.light = 0;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -10);
      modifiers.environmental.active.value = 0;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, 0);
      modifiers.environmental.active.value = -1;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -1);
      modifiers.environmental.active.value = -3;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -3);
      modifiers.environmental.active.value = -6;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -6);
      modifiers.environmental.active.value = -10;
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, -10);
    });
    it("should reset active environmental modifiers", () => {
      const modifiers = new Modifiers(activeModifiers);
      modifiers._resetEnvironmental();
      assert.deepEqual(modifiers.environmental.active, {});
    });
    it("should calculate total for faulty active", () => {
      const modifiers = new Modifiers({
        environmental: {
          total: -1,
          active: {
            light: null,
            wind: void 0,
            range: "",
            visibility: "string"
          }
        }
      });
      modifiers.calcEnvironmentalTotal();
      assert.equal(modifiers.environmental.total, 0);
    });
  });
};

// src/test/utils.ts
var SR5TestingDocuments = class {
  constructor(documentClass) {
    this.documents = {};
    this.documentClass = documentClass;
  }
  create(data) {
    return __async(this, null, function* () {
      const document2 = yield this.documentClass.create(__spreadValues(__spreadValues({ name: `#QUENCH_TEST_DOCUMENT_SHOULD_HAVE_BEEN_DELETED` }, data), { folder: this.folder }));
      this.documents[document2.id] = document2;
      return document2;
    });
  }
  delete(id) {
    return __async(this, null, function* () {
      const document2 = this.documents[id];
      if (!document2)
        return;
      yield this.documentClass.deleteDocuments([document2.data._id]);
      delete this.documents[document2.id];
    });
  }
  teardown() {
    return __async(this, null, function* () {
      yield this.documentClass.deleteDocuments(Object.values(this.documents).map((document2) => document2.id));
    });
  }
};

// src/test/sr5.SR5Item.spec.ts
var shadowrunSR5Item = (context) => {
  const { describe, it, assert, before, after } = context;
  let testItem;
  before(() => __async(void 0, null, function* () {
    testItem = new SR5TestingDocuments(SR5Item);
  }));
  after(() => __async(void 0, null, function* () {
    yield testItem.teardown();
  }));
  describe("SR5Items", () => {
    it("create a naked item of any type", () => __async(void 0, null, function* () {
      var _a;
      const item = yield testItem.create({ type: "action" });
      assert.notStrictEqual(item.id, "");
      assert.notStrictEqual(item.id, void 0);
      assert.notStrictEqual(item.id, null);
      const itemFromCollection = (_a = game.items) == null ? void 0 : _a.get(item.id);
      assert.notStrictEqual(itemFromCollection, null);
      assert.strictEqual(item.id, itemFromCollection == null ? void 0 : itemFromCollection.id);
    }));
    it("update an item of any type", () => __async(void 0, null, function* () {
      const item = yield testItem.create({ type: "action" });
      assert.notProperty(item.data.data, "test");
      yield item.update({ "data.test": true });
      assert.property(item.data.data, "test");
      assert.propertyVal(item.data.data, "test", true);
    }));
    it("embedd a ammo into a weapon and not the global item collection", () => __async(void 0, null, function* () {
      var _a;
      const weapon = yield testItem.create({ type: "weapon" });
      const ammo = yield testItem.create({ type: "ammo" });
      yield weapon.createNestedItem(ammo.data);
      const embeddedItemDatas = weapon.getNestedItems();
      assert.isNotEmpty(embeddedItemDatas);
      assert.lengthOf(embeddedItemDatas, 1);
      const embeddedAmmoData = embeddedItemDatas[0];
      assert.strictEqual(embeddedAmmoData.type, ammo.data.type);
      const embeddedAmmoInCollection = (_a = game.items) == null ? void 0 : _a.get(embeddedAmmoData._id);
      assert.strictEqual(embeddedAmmoInCollection, void 0);
    }));
    it("update an embedded ammo", () => __async(void 0, null, function* () {
      const weapon = yield testItem.create({ type: "weapon" });
      const ammo = yield testItem.create({ type: "ammo" });
      yield weapon.createNestedItem(ammo.data);
      const embeddedItemDatas = weapon.getNestedItems();
      assert.lengthOf(embeddedItemDatas, 1);
      const embeddedAmmoData = embeddedItemDatas[0];
      const embeddedAmmo = weapon.getOwnedItem(embeddedAmmoData._id);
      assert.notStrictEqual(embeddedAmmo, void 0);
      assert.instanceOf(embeddedAmmo, SR5Item);
      if (!embeddedAmmo)
        return;
      assert.notProperty(embeddedAmmo.data.data, "test");
      yield embeddedAmmo.update({ "data.test": true });
      assert.property(embeddedAmmo.data.data, "test");
      assert.propertyVal(embeddedAmmo.data.data, "test", true);
    }));
  });
};

// src/test/sr5.Matrix.spec.ts
var shadowrunMatrix = (context) => {
  const { describe, it, assert, before, after } = context;
  describe("Matrix Rules", () => {
    it("calculate IC device rating", () => {
      let hostRating = 5;
      assert.strictEqual(MatrixRules.getICDeviceRating(hostRating), hostRating);
      hostRating = -1;
      assert.strictEqual(MatrixRules.getICDeviceRating(hostRating), 0);
    });
    it("calculate IC condition monitor", () => {
      assert.strictEqual(MatrixRules.getConditionMonitor(0), 8);
      assert.strictEqual(MatrixRules.getConditionMonitor(1), 9);
      assert.strictEqual(MatrixRules.getConditionMonitor(4), 10);
      assert.strictEqual(MatrixRules.getConditionMonitor(-1), 8);
    });
    it("calculate IC matrix initiative base", () => {
      assert.strictEqual(MatrixRules.getICInitiativeBase(0), 0);
      assert.strictEqual(MatrixRules.getICInitiativeBase(-3), 0);
      assert.strictEqual(MatrixRules.getICInitiativeBase(1), 2);
      assert.strictEqual(MatrixRules.getICInitiativeBase(2), 4);
      assert.strictEqual(MatrixRules.getICInitiativeBase(3), 6);
      assert.strictEqual(MatrixRules.getICInitiativeBase(12), 24);
    });
    it("calculate IC matrix initiative dice", () => {
      assert.strictEqual(MatrixRules.getICInitiativeDice(), 4);
    });
    it("calculate meat attribute base with the host rating", () => {
      assert.strictEqual(MatrixRules.getICMeatAttributeBase(0), 0);
      assert.strictEqual(MatrixRules.getICMeatAttributeBase(-3), 0);
      assert.strictEqual(MatrixRules.getICMeatAttributeBase(3), 3);
      assert.strictEqual(MatrixRules.getICMeatAttributeBase(27), 27);
    });
    it("disallow invalid marks counters", () => {
      assert.isTrue(MatrixRules.isValidMarksCount(0));
      assert.isTrue(MatrixRules.isValidMarksCount(1));
      assert.isTrue(MatrixRules.isValidMarksCount(2));
      assert.isTrue(MatrixRules.isValidMarksCount(3));
      assert.isFalse(MatrixRules.isValidMarksCount(-1));
      assert.isFalse(MatrixRules.isValidMarksCount(4));
      assert.isFalse(MatrixRules.isValidMarksCount(1.5));
    });
    it("return valid marks counts", () => {
      assert.strictEqual(MatrixRules.getValidMarksCount(-1), MatrixRules.minMarksCount());
      assert.strictEqual(MatrixRules.getValidMarksCount(0), 0);
      assert.strictEqual(MatrixRules.getValidMarksCount(1), 1);
      assert.strictEqual(MatrixRules.getValidMarksCount(2), 2);
      assert.strictEqual(MatrixRules.getValidMarksCount(3), 3);
      assert.strictEqual(MatrixRules.getValidMarksCount(4), MatrixRules.maxMarksCount());
    });
    it("return expected host matrix attribute ratings", () => {
      assert.deepEqual(MatrixRules.hostMatrixAttributeRatings(1), [2, 3, 4, 5]);
      assert.deepEqual(MatrixRules.hostMatrixAttributeRatings(2), [3, 4, 5, 6]);
      assert.deepEqual(MatrixRules.hostMatrixAttributeRatings(10), [11, 12, 13, 14]);
    });
  });
};

// src/test/sr5.SR5Actor.spec.ts
var shadowrunSR5Actor = (context) => {
  const { describe, it, assert, before, after } = context;
  let testActor;
  let testItem;
  before(() => __async(void 0, null, function* () {
    testActor = new SR5TestingDocuments(SR5Actor);
    testItem = new SR5TestingDocuments(SR5Item);
  }));
  after(() => __async(void 0, null, function* () {
    yield testActor.teardown();
    yield testItem.teardown();
  }));
  describe("SR5Actor", () => {
    it("create a naked actor of any type", () => __async(void 0, null, function* () {
      var _a;
      const actor = yield testActor.create({ type: "character" });
      assert.notStrictEqual(actor.id, "");
      assert.notStrictEqual(actor.id, void 0);
      assert.notStrictEqual(actor.id, null);
      const fromCollection = (_a = game.actors) == null ? void 0 : _a.get(actor.id);
      assert.isOk(fromCollection);
      assert.strictEqual(actor.id, fromCollection == null ? void 0 : fromCollection.id);
    }));
    it("update an actor of any time", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      assert.notProperty(actor.data.data, "test");
      yield actor.update({ "data.test": true });
      assert.property(actor.data.data, "test");
      assert.propertyVal(actor.data.data, "test", true);
    }));
    it("embedd a weapon into an actor and not the global item colection", () => __async(void 0, null, function* () {
      var _a;
      const actor = yield testActor.create({ type: "character" });
      const weapon = yield testItem.create({ type: "weapon" });
      yield actor.createEmbeddedDocuments("Item", [weapon.data]);
      const ownedItems = Array.from(actor.items);
      assert.isNotEmpty(ownedItems);
      assert.lengthOf(ownedItems, 1);
      const ownedItem = ownedItems[0];
      assert.strictEqual(ownedItem.type, weapon.data.type);
      const ownedInCollection = (_a = game.items) == null ? void 0 : _a.get(ownedItem.id);
      assert.isNotOk(ownedInCollection);
    }));
  });
};

// src/test/sr5.ActorDataPrep.spec.ts
var shadowrunSR5ActorDataPrep = (context) => {
  const { describe, it, assert, before, after } = context;
  let testActor;
  let testItem;
  before(() => __async(void 0, null, function* () {
    testActor = new SR5TestingDocuments(SR5Actor);
    testItem = new SR5TestingDocuments(SR5Item);
  }));
  after(() => __async(void 0, null, function* () {
    yield testActor.teardown();
    yield testItem.teardown();
  }));
  describe("CharacterDataPrep", () => {
    it("Character default attribute values", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character", metatype: "human" });
      console.log("Physical attributes");
      assert.strictEqual(actor.data.data.attributes.body.value, SR.attributes.ranges["body"].min);
      assert.strictEqual(actor.data.data.attributes.agility.value, SR.attributes.ranges["agility"].min);
      assert.strictEqual(actor.data.data.attributes.reaction.value, SR.attributes.ranges["reaction"].min);
      assert.strictEqual(actor.data.data.attributes.strength.value, SR.attributes.ranges["strength"].min);
      assert.strictEqual(actor.data.data.attributes.willpower.value, SR.attributes.ranges["willpower"].min);
      assert.strictEqual(actor.data.data.attributes.logic.value, SR.attributes.ranges["logic"].min);
      assert.strictEqual(actor.data.data.attributes.intuition.value, SR.attributes.ranges["intuition"].min);
      assert.strictEqual(actor.data.data.attributes.charisma.value, SR.attributes.ranges["charisma"].min);
      console.log("Comon special attributes");
      assert.strictEqual(actor.data.data.attributes.edge.value, SR.attributes.ranges["edge"].min);
      assert.strictEqual(actor.data.data.attributes.essence.value, SR.attributes.defaults["essence"]);
      console.log("Special special attributes");
      assert.strictEqual(actor.data.data.attributes.resonance.value, SR.attributes.ranges["resonance"].min);
      assert.strictEqual(actor.data.data.attributes.magic.value, SR.attributes.ranges["magic"].min);
    }));
    it("Character monitor calculation", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      let data = actor.asCharacter();
      assert.strictEqual(data.data.track.stun.max, 9);
      assert.strictEqual(data.data.track.physical.max, 9);
      assert.strictEqual(data.data.track.physical.overflow.max, SR.attributes.ranges.body.min);
      yield actor.update({
        "data.attributes.body.base": 6,
        "data.attributes.willpower.base": 6
      });
      assert.strictEqual(data.data.track.stun.max, 11);
      assert.strictEqual(data.data.track.physical.max, 11);
      assert.strictEqual(data.data.track.physical.overflow.max, 6);
    }));
    it("Character initiative calculation", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const data = actor.asCharacter();
      console.log("Meatspace Ini");
      assert.strictEqual(data.data.initiative.meatspace.base.base, 2);
      assert.strictEqual(data.data.initiative.meatspace.dice.base, 1);
      console.log("Matrix AR Ini");
      assert.strictEqual(data.data.initiative.matrix.base.base, 1);
      assert.strictEqual(data.data.initiative.matrix.dice.base, 3);
      console.log("Magic Ini");
      assert.strictEqual(data.data.initiative.astral.base.base, 2);
      assert.strictEqual(data.data.initiative.astral.dice.base, 2);
    }));
    it("Character limit calculation", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const data = actor.asCharacter();
      assert.strictEqual(data.data.limits.physical.value, 2);
      assert.strictEqual(data.data.limits.mental.value, 2);
      assert.strictEqual(data.data.limits.social.value, 3);
      yield actor.update({
        "data.attributes.strength.base": 6,
        "data.attributes.body.base": 6,
        "data.attributes.reaction.base": 6,
        "data.attributes.logic.base": 6,
        "data.attributes.intuition.base": 6,
        "data.attributes.willpower.base": 6,
        "data.attributes.charisma.base": 6,
        "data.attributes.essence.base": 6
      });
      assert.strictEqual(data.data.limits.physical.value, 8);
      assert.strictEqual(data.data.limits.mental.value, 8);
      assert.strictEqual(data.data.limits.social.value, 8);
    }));
    it("Character movement calculation", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const data = actor.asCharacter();
      assert.strictEqual(data.data.movement.walk.value, 2);
      assert.strictEqual(data.data.movement.run.value, 4);
      yield actor.update({
        "data.attributes.agility.base": 6
      });
      assert.strictEqual(data.data.movement.walk.value, 12);
      assert.strictEqual(data.data.movement.run.value, 24);
    }));
    it("Character skill calculation", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const data = actor.asCharacter();
      yield actor.update({
        "data.skills.active.arcana.base": 6,
        "data.skills.active.arcana.bonus": [{ key: "Test", value: 1 }],
        "data.skills.active.arcana.specs": ["Test"]
      });
      assert.strictEqual(data.data.skills.active.arcana.value, 7);
    }));
    it("Character damage application", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const data = actor.asCharacter();
      assert.strictEqual(data.data.track.stun.value, 0);
      assert.strictEqual(data.data.track.stun.wounds, 0);
      assert.strictEqual(data.data.track.physical.value, 0);
      assert.strictEqual(data.data.track.physical.wounds, 0);
      assert.strictEqual(data.data.wounds.value, 0);
      yield actor.update({
        "data.track.stun.value": 3,
        "data.track.physical.value": 3
      });
      assert.strictEqual(data.data.track.stun.value, 3);
      assert.strictEqual(data.data.track.stun.wounds, 1);
      assert.strictEqual(data.data.track.physical.value, 3);
      assert.strictEqual(data.data.track.physical.wounds, 1);
      assert.strictEqual(data.data.wounds.value, 2);
    }));
    it("Character damage application with high pain/wound tolerance", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const data = actor.asCharacter();
      yield actor.update({
        "data.track.stun.value": 6,
        "data.track.physical.value": 6,
        "data.modifiers.wound_tolerance": 3
      });
      assert.strictEqual(data.data.track.stun.value, 6);
      assert.strictEqual(data.data.track.stun.wounds, 1);
      assert.strictEqual(data.data.track.physical.value, 6);
      assert.strictEqual(data.data.track.physical.wounds, 1);
      assert.strictEqual(data.data.wounds.value, 2);
    }));
  });
  describe("SpiritDataPrep", () => {
    it("Spirits are always magical", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "spirit" });
      assert.strictEqual(actor.data.data.special, "magic");
    }));
    it("Spirit default/overrides by example type", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "spirit", "data.spiritType": "air" });
      const data = actor.asSpirit();
      assert.strictEqual(data.data.attributes.body.base, -2);
      assert.strictEqual(data.data.attributes.agility.base, 3);
      assert.strictEqual(data.data.attributes.reaction.base, 4);
      assert.strictEqual(data.data.attributes.strength.base, -3);
      assert.strictEqual(data.data.attributes.intuition.base, 0);
      assert.strictEqual(data.data.initiative.meatspace.base.base, 4);
      assert.strictEqual(data.data.skills.active.assensing.base, 0);
      yield actor.update({
        "data.force": 6
      });
      assert.strictEqual(data.data.attributes.body.base, 4);
      assert.strictEqual(data.data.attributes.agility.base, 9);
      assert.strictEqual(data.data.attributes.reaction.base, 10);
      assert.strictEqual(data.data.attributes.strength.base, 3);
      assert.strictEqual(data.data.attributes.intuition.base, 6);
      assert.strictEqual(data.data.initiative.meatspace.base.base, 16);
      assert.strictEqual(data.data.skills.active.assensing.base, 6);
      assert.strictEqual(data.data.skills.active.arcana.base, 0);
    }));
  });
  describe("SpriteDataPrep", () => {
    it("Sprites are always awakened", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "sprite" });
      assert.strictEqual(actor.data.data.special, "resonance");
    }));
    it("Sprites default/override values by example type", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "sprite", "data.spriteType": "courier" });
      const data = actor.asSprite();
      assert.strictEqual(data.data.matrix.sleaze.base, 3);
      assert.strictEqual(data.data.matrix.data_processing.base, 1);
      assert.strictEqual(data.data.matrix.firewall.base, 2);
      assert.strictEqual(data.data.matrix.sleaze.base, 3);
      assert.strictEqual(data.data.initiative.matrix.base.base, 1);
      assert.strictEqual(data.data.skills.active.hacking.base, 0);
      yield actor.update({
        "data.level": 6
      });
      assert.strictEqual(data.data.level, 6);
      assert.strictEqual(data.data.matrix.sleaze.base, 9);
      assert.strictEqual(data.data.matrix.data_processing.base, 7);
      assert.strictEqual(data.data.matrix.firewall.base, 8);
      assert.strictEqual(data.data.matrix.sleaze.base, 9);
      assert.strictEqual(data.data.initiative.matrix.base.base, 13);
      assert.strictEqual(data.data.initiative.matrix.dice.base, 4);
      assert.strictEqual(data.data.skills.active.hacking.base, 6);
      assert.strictEqual(data.data.skills.active.computer.base, 6);
      assert.strictEqual(data.data.skills.active.electronic_warfare.base, 0);
    }));
  });
};

// src/test/sr5.ActiveEffect.spec.ts
var shadowrunSR5ActiveEffect = (context) => {
  const { describe, it, assert, before, after } = context;
  let testActor;
  let testItem;
  before(() => __async(void 0, null, function* () {
    testActor = new SR5TestingDocuments(SR5Actor);
    testItem = new SR5TestingDocuments(SR5Item);
  }));
  after(() => __async(void 0, null, function* () {
    yield testActor.teardown();
    yield testItem.teardown();
  }));
  describe("SR5ActiveEffect", () => {
    it("apply the custom modify mode", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const effect = yield actor.createEmbeddedDocuments("ActiveEffect", [{
        origin: actor.uuid,
        disabled: false,
        label: "Test Effect"
      }]);
      yield effect[0].update({
        "changes": [
          { key: "data.attributes.body.mod", value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
          { key: "data.attributes.body", value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
        ]
      });
      assert.deepEqual(actor.data.data.attributes.body.mod, [{
        name: "Test Effect",
        value: 2
      }, { name: "Test Effect", value: 2 }]);
      assert.strictEqual(actor.data.data.attributes.body.value, 4);
      yield effect[0].update({
        "changes": [
          { key: "data.attributes.body.mod", value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
          { key: "data.attributes.body.mod", value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
        ]
      });
    }));
    it("apply custom modify mode, none ModifiableValue should work as the add mode", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      const effect = yield actor.createEmbeddedDocuments("ActiveEffect", [{
        origin: actor.uuid,
        disabled: false,
        label: "Test Effect"
      }]);
      yield effect[0].update({
        "changes": [{
          key: "data.modifiers.global",
          value: 3,
          mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM
        }]
      });
      assert.strictEqual(actor.data.data.modifiers.global, 3);
      assert.strictEqual(actor.data.data.modifiers.global.mod, void 0);
      assert.strictEqual(actor.data.data.modifiers.global.override, void 0);
      it("apply the custom override mode", () => __async(void 0, null, function* () {
        const actor2 = yield testActor.create({ type: "character" });
        const effect2 = yield actor2.createEmbeddedDocuments("ActiveEffect", [{
          origin: actor2.uuid,
          disabled: false,
          label: "Test Effect"
        }]);
        yield effect2[0].update({
          "changes": [
            { key: "data.attributes.body", value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
            { key: "data.attributes.body.value", value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
          ]
        });
        assert.deepEqual(actor2.data.data.attributes.body.override, { name: "Test Effect", value: 3 });
        assert.deepEqual(actor2.data.data.attributes.body.mod, []);
        assert.strictEqual(actor2.data.data.attributes.body.value, 3);
      }));
      it("apply custom override mode, should override all existing .mod values", () => __async(void 0, null, function* () {
        it("apply the custom override mode", () => __async(void 0, null, function* () {
          const actor2 = yield testActor.create({ type: "character" });
          const effect2 = yield actor2.createEmbeddedDocuments("ActiveEffect", [{
            origin: actor2.uuid,
            disabled: false,
            label: "Test Effect"
          }]);
          yield effect2[0].update({
            "changes": [
              { key: "data.attributes.body.mod", value: 5, mode: CONST.ACTIVE_EFFECT_MODES.ADD },
              { key: "data.attributes.body.value", value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
            ]
          });
          assert.strictEqual(actor2.data.data.attributes.body.mod.length, 1);
          assert.deepEqual(actor2.data.data.attributes.body.override, { name: "Test Effect", value: 3 });
          assert.deepEqual(actor2.data.data.attributes.body.mod, [{ name: "Test Effect", value: 5 }]);
          assert.strictEqual(actor2.data.data.attributes.body.value, 3);
        }));
      }));
      it("apply custom override mode, none ModifiableValue should work without altering anything", () => __async(void 0, null, function* () {
        const actor2 = yield testActor.create({ type: "character" });
        const effect2 = yield actor2.createEmbeddedDocuments("ActiveEffect", [{
          origin: actor2.uuid,
          disabled: false,
          label: "Test Effect"
        }]);
        yield effect2[0].update({
          "changes": [{
            key: "data.modifiers.global",
            value: 3,
            mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE
          }]
        });
        assert.strictEqual(actor2.data.data.modifiers.global, 3);
        assert.strictEqual(actor2.data.data.modifiers.global.mod, void 0);
        assert.strictEqual(actor2.data.data.modifiers.global.override, void 0);
      }));
    }));
  });
};

// src/test/sr5.NetworkDevices.spec.ts
var shadowrunNetworkDevices = (context) => {
  const { describe, it, assert, should, before, after } = context;
  let testActor;
  let testItem;
  let testScene;
  before(() => __async(void 0, null, function* () {
    testActor = new SR5TestingDocuments(SR5Actor);
    testItem = new SR5TestingDocuments(SR5Item);
    testScene = new SR5TestingDocuments(Scene);
  }));
  after(() => __async(void 0, null, function* () {
    yield testActor.teardown();
    yield testItem.teardown();
    yield testScene.teardown();
  }));
  describe("Network Devices handling", () => {
    it("give a network link to given document class", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ "type": "character" });
      const link = NetworkDeviceFlow.buildLink(actor);
      const nodes = link.split(".");
      assert.strictEqual(nodes[0], "Actor");
      assert.strictEqual(nodes.length, 2);
    }));
    it("resolve a network link back to a sidebar document", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ "type": "character" });
      const link = NetworkDeviceFlow.buildLink(actor);
      const resolvedActor = yield NetworkDeviceFlow.resolveLink(link);
      assert.isNotNull(resolvedActor);
      assert.strictEqual(resolvedActor == null ? void 0 : resolvedActor.id, actor.id);
    }));
    it("resolve a network link back to a embedded collection document", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ "type": "character" });
      const item = yield testItem.create({ type: "weapon" });
      const embeddedItems = yield actor.createEmbeddedDocuments("Item", [item.data]);
      const embeddedItem = embeddedItems[0];
      const link = NetworkDeviceFlow.buildLink(embeddedItem);
      const resolvedItem = yield NetworkDeviceFlow.resolveLink(link);
      assert.isNotNull(resolvedItem);
      assert.strictEqual(resolvedItem == null ? void 0 : resolvedItem.id, embeddedItem == null ? void 0 : embeddedItem.id);
    }));
    it("resolve a network link back to a token collection document", () => __async(void 0, null, function* () {
      const scene = yield testScene.create({ name: "Test" });
      const actor = yield testActor.create({ "type": "character" });
      const token = yield getDocumentClass("Token").create(yield actor.getTokenData({ x: 0, y: 0 }), { parent: scene });
      const link = NetworkDeviceFlow.buildLink(token);
      const resolvedToken = yield NetworkDeviceFlow.resolveLink(link);
      assert.isNotNull(resolvedToken);
      assert.strictEqual(token == null ? void 0 : token.id, resolvedToken == null ? void 0 : resolvedToken.id);
    }));
    it("connect a device controller to a network device", () => __async(void 0, null, function* () {
      const controller = yield testItem.create({ type: "device" });
      const device = yield testItem.create({ type: "weapon" });
      yield NetworkDeviceFlow.addDeviceToNetwork(controller, device);
      assert.strictEqual(device.data.data.technology.networkController, controller.uuid);
      assert.strictEqual(yield NetworkDeviceFlow.resolveLink(device.data.data.technology.networkController), controller);
      assert.deepEqual(controller.data.data.networkDevices, [device.uuid]);
    }));
    it("connect a host controller to a network device", () => __async(void 0, null, function* () {
      const controller = yield testItem.create({ type: "host" });
      const device = yield testItem.create({ type: "weapon" });
      yield NetworkDeviceFlow.addDeviceToNetwork(controller, device);
      assert.strictEqual(device.data.data.technology.networkController, controller.uuid);
      assert.strictEqual(yield NetworkDeviceFlow.resolveLink(device.data.data.technology.networkController), controller);
      assert.deepEqual(controller.data.data.networkDevices, [device.uuid]);
    }));
    it("get all connected network devices of a controller as their Document", () => __async(void 0, null, function* () {
      const controller = yield testItem.create({ type: "device" });
      const devices = [
        yield testItem.create({ type: "weapon" })
      ];
      for (const device of devices) {
        yield NetworkDeviceFlow.addDeviceToNetwork(controller, device);
      }
      const fetchedDevices = NetworkDeviceFlow.getNetworkDevices(controller);
      assert.strictEqual(controller.data.data.networkDevices.length, 1);
      assert.strictEqual(fetchedDevices.length, 1);
      for (const fetched of fetchedDevices) {
        assert.include(devices, fetched);
      }
    }));
    it("remove a device from a network", () => __async(void 0, null, function* () {
      const controller = yield testItem.create({ type: "device" });
      const device = yield testItem.create({ type: "weapon" });
      yield NetworkDeviceFlow.addDeviceToNetwork(controller, device);
      yield NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, device.uuid);
      assert.deepEqual(controller.data.data.networkDevices, []);
      assert.strictEqual(device.data.data.technology.networkController, "");
    }));
    it("remove a device from a network when it is added to a new one", () => __async(void 0, null, function* () {
      const controller = yield testItem.create({ type: "device" });
      const newController = yield testItem.create({ type: "device" });
      const device = yield testItem.create({ type: "weapon" });
      yield NetworkDeviceFlow.addDeviceToNetwork(controller, device);
      yield NetworkDeviceFlow.addDeviceToNetwork(newController, device);
      assert.deepEqual(controller.data.data.networkDevices, []);
      assert.deepEqual(newController.data.data.networkDevices, [device.uuid]);
      assert.strictEqual(device.data.data.technology.networkController, newController.uuid);
    }));
    it("remove a network device that doesnt exist anymore", () => __async(void 0, null, function* () {
      var _a;
      const controller = yield testItem.create({ type: "device" });
      const device = yield testItem.create({ type: "weapon" });
      const deviceId = device.id;
      yield NetworkDeviceFlow.addDeviceToNetwork(controller, device);
      yield testItem.delete(deviceId);
      const collectionItem = (_a = game.items) == null ? void 0 : _a.get(deviceId);
      assert.strictEqual(collectionItem, void 0);
      assert.strictEqual(controller.data.data.networkDevices.length, 1);
      yield NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, controller.data.data.networkDevices[0]);
      assert.deepEqual(controller.data.data.networkDevices, []);
    }));
    it("remove all devices from a controller", () => __async(void 0, null, function* () {
      const controller = yield testItem.create({ type: "device" });
      const devices = [
        yield testItem.create({ type: "weapon" })
      ];
      for (const device of devices) {
        yield NetworkDeviceFlow.addDeviceToNetwork(controller, device);
      }
      yield NetworkDeviceFlow.removeAllDevicesFromNetwork(controller);
      assert.deepEqual(controller.data.data.networkDevices, []);
      for (const device of devices) {
        assert.strictEqual(device.data.data.technology.networkController, "");
      }
    }));
  });
};

// src/test/sr5.Testing.spec.ts
var shadowrunTesting = (context) => {
  const { describe, it, assert, before, after } = context;
  let testActor;
  let testItem;
  before(() => __async(void 0, null, function* () {
    testActor = new SR5TestingDocuments(SR5Actor);
    testItem = new SR5TestingDocuments(SR5Item);
  }));
  after(() => __async(void 0, null, function* () {
    yield testActor.teardown();
    yield testItem.teardown();
  }));
  describe("SuccessTest", () => {
    it("evaluate a roll from action data", () => __async(void 0, null, function* () {
      const actionData = {
        "data.action.test": "SuccessTest",
        "type": "action",
        "data.action.type": "simple",
        "data.action.attribute": "body",
        "data.action.skill": "automatics",
        "data.action.spec": false,
        "data.action.limit": {
          base: 1,
          value: 1,
          attribute: "physical"
        },
        "data.action.threshold": {
          base: 1,
          value: 1
        },
        "data.action.damage": {
          ap: { value: 5, base: 5, mod: Array(0) },
          attribute: "",
          base: 5,
          base_formula_operator: "add",
          element: { value: "", base: "" },
          itemSource: { actorId: "", itemId: "", itemType: "", itemName: "" },
          mod: [],
          type: { value: "physical", base: "physical" },
          value: 5
        }
      };
      const action = yield testItem.create(actionData);
      const actorData = {
        "type": "character",
        "data.attributes.body.base": 5,
        "data.skills.active.automatics.base": 45
      };
      const actor = yield testActor.create(actorData);
      const test = yield TestCreator.fromItem(action, actor);
      if (!test)
        assert.strictEqual(true, false);
      if (test) {
        yield test.evaluate();
        console.error(test.data);
        assert.strictEqual(test.pool.value, 50);
        assert.strictEqual(test.threshold.value, 1);
        assert.strictEqual(test.limit.value, 4);
        assert.strictEqual(test.netHits.value, 3);
        assert.strictEqual(test.hasReducedHits, true);
        assert.strictEqual(test.hasThreshold, true);
        assert.strictEqual(test.hasLimit, true);
      }
    }));
    it("evaluate a roll from simple pool data", () => __async(void 0, null, function* () {
      const test = TestCreator.fromPool({ pool: 10 });
      yield test.evaluate();
      assert.strictEqual(test.pool.value, 10);
    }));
    it("evaluate an opposed roll from a opposed action", () => __async(void 0, null, function* () {
      const actionData = {
        "type": "action",
        "data.action.test": "SuccessTest",
        "data.action.type": "simple",
        "data.action.attribute": "body",
        "data.action.skill": "automatics",
        "data.action.spec": false,
        "data.action.limit": {
          base: 1,
          value: 1,
          attribute: "physical"
        },
        "data.action.threshold": {
          base: 1,
          value: 1
        },
        "data.action.opposed": {
          "type": "custom",
          "test": "OpposedTest",
          "attribute": "reaction",
          "attribute2": "intuition",
          "skill": "",
          "mod": 0,
          "description": ""
        }
      };
      const action = yield testItem.create(actionData);
      const actorData = {
        "type": "character",
        "data.attributes.body.base": 5,
        "data.skills.active.automatics.base": 45
      };
      const actor = yield testActor.create(actorData);
      const test = yield TestCreator.fromItem(action, actor);
      if (test) {
        yield test.toMessage();
      }
    }));
  });
  describe("OpposedTest", () => {
  });
};

// src/test/sr5.Inventory.spec.ts
var shadowrunInventoryFlow = (context) => {
  const { describe, it, assert, should, before, after } = context;
  let testActor;
  let testItem;
  before(() => __async(void 0, null, function* () {
    testActor = new SR5TestingDocuments(SR5Actor);
    testItem = new SR5TestingDocuments(SR5Item);
  }));
  after(() => __async(void 0, null, function* () {
    yield testActor.teardown();
    yield testItem.teardown();
  }));
  describe("InventoryFlow testing", () => {
    it("create a new inventory and know of its existance", () => __async(void 0, null, function* () {
      const actor = yield testActor.create({ type: "character" });
      yield actor.inventory.create("test");
      assert.deepEqual(actor.data.data.inventories, {
        "test": {
          name: "test",
          label: "test",
          itemIds: []
        }
      });
      assert.strictEqual(actor.inventory.exists("test"), true);
    }));
    it("remove an inventory", () => __async(void 0, null, function* () {
      const inventoriesData = { test: { name: "test", label: "test", itemIds: [] } };
      const actor = yield testActor.create({ type: "character", "data.inventories": inventoriesData });
      yield actor.inventory.remove("test");
      assert.deepEqual(actor.data.data.inventories, {});
    }));
    it("add and remove an item to and from an inventory", () => __async(void 0, null, function* () {
      const inventoriesData = { test: { name: "test", label: "test", itemIds: [] } };
      const actor = yield testActor.create({ type: "character", "data.inventories": inventoriesData });
      const item = yield actor.createEmbeddedDocuments("Item", [{ type: "weapon", name: "Test Weapon" }]);
      yield actor.inventory.addItems("test", item);
      const itemIds = item.map((item2) => item2.id);
      assert.deepEqual(actor.data.data.inventories.test.itemIds, itemIds);
      yield actor.inventory.removeItem(item[0]);
      assert.deepEqual(actor.data.data.inventories.test.itemIds, []);
    }));
    it("rename an existing inventory", () => __async(void 0, null, function* () {
      const inventoriesData = { test: { name: "test", label: "test", itemIds: ["asd"] } };
      const actor = yield testActor.create({ type: "character", "data.inventories": inventoriesData });
      yield actor.inventory.rename("test", "betterTest");
      assert.deepEqual(actor.data.data.inventories, {
        "betterTest": {
          name: "betterTest",
          label: "betterTest",
          itemIds: ["asd"]
        }
      });
    }));
  });
};

// src/test/quench.ts
var quenchRegister = (quench) => {
  if (!quench)
    return;
  console.warn("Shadowrun 5e | Be aware that FoundryVTT will tank in update performance when a lot of documents are in collections. This is the case if you have all Chummer items imported and might cause tests to cross the 2000ms quench timeout threshold. Clear those collections in a test world. :)");
  quench.registerBatch("shadowrun5e.rules.matrix", shadowrunMatrix, { displayName: "SHADOWRUN5e: Matrix Test" });
  quench.registerBatch("shadowrun5e.rules.modifiers", shadowrunRulesModifiers, { displayName: "SHADOWRUN5e: Modifiers Test" });
  quench.registerBatch("shadowrun5e.entities.items", shadowrunSR5Item, { displayName: "SHADOWRUN5e: SR5Item Test" });
  quench.registerBatch("shadowrun5e.entities.actors", shadowrunSR5Actor, { displayName: "SHADOWRUN5e: SR5Actor Test" });
  quench.registerBatch("shadowrun5e.entities.effects", shadowrunSR5ActiveEffect, { displayName: "SHADOWRUN5e: SR5ActiveEffect Test" });
  quench.registerBatch("shadowrun5e.data_prep.actor", shadowrunSR5ActorDataPrep, { displayName: "SHADOWRUN5e: SR5ActorDataPreparation Test" });
  quench.registerBatch("shadowrun5e.flow.networkDevices", shadowrunNetworkDevices, { displayName: "SHADOWRUN5e: Matrix Network Devices Test" });
  quench.registerBatch("shadowrun5e.flow.inventory", shadowrunInventoryFlow, { displayName: "SHADOWRUN5e: InventoryFlow Test" });
  quench.registerBatch("shadowrun5e.flow.tests", shadowrunTesting, { displayName: "SHADOWRUN5e: SuccessTest Test" });
};

// src/module/apps/skills/SkillEditSheet.ts
var SkillEditSheet = class extends DocumentSheet {
  constructor(actor, options, skillId) {
    super(actor, options);
    this.skillId = skillId;
  }
  get document() {
    return super.document;
  }
  _updateString() {
    return `data.skills.active.${this.skillId}`;
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    return mergeObject(options, {
      id: "skill-editor",
      classes: ["sr5", "sheet", "skill-edit-window"],
      template: "systems/shadowrun5e/dist/templates/apps/skill-edit.html",
      width: 300,
      height: "auto",
      submitOnClose: true,
      submitOnChange: true,
      closeOnSubmit: false,
      resizable: true
    });
  }
  get title() {
    const label = this.document.getSkillLabel(this.skillId);
    return `${game.i18n.localize("SR5.EditSkill")} - ${game.i18n.localize(label)}`;
  }
  _onUpdateObject(event, formData, updateData) {
    const name = formData["data.name"];
    const attribute = formData["data.attribute"];
    const base = formData["data.base"];
    const canDefault = formData["data.canDefault"];
    const specsRegex = /data\.specs\.(\d+)/;
    const specs = Object.entries(formData).reduce((running, [key, val]) => {
      const found = key.match(specsRegex);
      if (found && found[0]) {
        running.push(val);
      }
      return running;
    }, []);
    const bonusKeyRegex = /data\.bonus\.(\d+).key/;
    const bonusValueRegex = /data\.bonus\.(\d+).value/;
    const bonus = Object.entries(formData).reduce((running, [key, value]) => {
      const foundKey = key.match(bonusKeyRegex);
      const foundVal = key.match(bonusValueRegex);
      if (foundKey && foundKey[0] && foundKey[1]) {
        const index = foundKey[1];
        if (running[index] === void 0)
          running[index] = {};
        running[index].key = value;
      } else if (foundVal && foundVal[0] && foundVal[1]) {
        const index = foundVal[1];
        if (running[index] === void 0)
          running[index] = {};
        running[index].value = value;
      }
      return running;
    }, []);
    updateData[this._updateString()] = {
      specs,
      bonus,
      name,
      attribute,
      canDefault
    };
    if (event.currentTarget.name === "data.base")
      updateData[this._updateString()].base = base;
  }
  _updateObject(event, formData) {
    return __async(this, null, function* () {
      if (event.currentTarget) {
        const updateData = {};
        this._onUpdateObject(event, formData, updateData);
        yield this.document.update(updateData);
      }
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
    $(html).find(".add-spec").on("click", this._addNewSpec.bind(this));
    $(html).find(".remove-spec").on("click", this._removeSpec.bind(this));
    $(html).find(".add-bonus").on("click", this._addNewBonus.bind(this));
    $(html).find(".remove-bonus").on("click", this._removeBonus.bind(this));
  }
  _addNewBonus(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const updateData = {};
      const data = this.getData().data;
      if (!data)
        return;
      const { bonus = [] } = data;
      updateData[`${this._updateString()}.bonus`] = [...bonus, { key: "", value: 0 }];
      yield this.document.update(updateData);
    });
  }
  _removeBonus(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const updateData = {};
      const data = this.getData().data;
      if (data == null ? void 0 : data.bonus) {
        const { bonus } = data;
        const index = event.currentTarget.dataset.spec;
        if (index >= 0) {
          bonus.splice(index, 1);
          updateData[`${this._updateString()}.bonus`] = bonus;
          yield this.document.update(updateData);
        }
      }
    });
  }
  _addNewSpec(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const updateData = {};
      const data = this.getData().data;
      if (data == null ? void 0 : data.specs) {
        const { specs } = data;
        updateData[`${this._updateString()}.specs`] = [...specs, ""];
      }
      yield this.document.update(updateData);
    });
  }
  _removeSpec(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const updateData = {};
      const data = this.getData().data;
      if (data == null ? void 0 : data.specs) {
        const { specs } = data;
        const index = event.currentTarget.dataset.spec;
        if (index >= 0) {
          specs.splice(index, 1);
          updateData[`${this._updateString()}.specs`] = specs;
          yield this.document.update(updateData);
        }
      }
    });
  }
  _getSkillAttributesForSelect() {
    return __spreadProps(__spreadValues({}, SR5.attributes), { "": "" });
  }
  _allowSkillNameEditing() {
    const skill = this.document.getSkill(this.skillId);
    return !!(!(skill == null ? void 0 : skill.name) && !(skill == null ? void 0 : skill.label) || (skill == null ? void 0 : skill.name) && !(skill == null ? void 0 : skill.label));
  }
  getData() {
    const data = super.getData();
    const actor = data.data;
    data["data"] = actor ? getProperty(actor, this._updateString()) : {};
    data["editable_name"] = this._allowSkillNameEditing();
    data["editable_canDefault"] = true;
    data["editable_attribute"] = true;
    data["attributes"] = this._getSkillAttributesForSelect();
    return data;
  }
};

// src/module/apps/skills/LanguageSkillEditSheet.ts
var LanguageSkillEditSheet = class extends SkillEditSheet {
  _updateString() {
    return `data.skills.language.value.${this.skillId}`;
  }
  getData() {
    return mergeObject(super.getData(), {
      editable_name: true,
      editable_canDefault: false,
      editable_attribute: false
    });
  }
  _onUpdateObject(event, formData, updateData) {
    super._onUpdateObject(event, formData, updateData);
    const name = formData["data.name"];
    const currentData = updateData[this._updateString()] || {};
    updateData[this._updateString()] = __spreadProps(__spreadValues({}, currentData), {
      name
    });
  }
};

// src/module/apps/skills/KnowledgeSkillEditSheet.ts
var KnowledgeSkillEditSheet = class extends LanguageSkillEditSheet {
  constructor(actor, options, skillId, category) {
    super(actor, options, skillId);
    this.category = category;
  }
  _updateString() {
    return `data.skills.knowledge.${this.category}.value.${this.skillId}`;
  }
};

// src/module/apps/dialogs/MoveInventoryDialog.ts
var MoveInventoryDialog = class extends FormDialog {
  constructor(actor, sourceInventory, options) {
    const dialogData = MoveInventoryDialog.getDialogData(actor, sourceInventory);
    super(dialogData, options);
  }
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "move-inventory-application";
    options.classes = ["sr5", "form-dialog"];
    options.height = "auto";
    return options;
  }
  static getDialogData(actor, sourceInventory) {
    const inventories = Object.values(actor.data.data.inventories).filter((inventory) => inventory.name !== sourceInventory);
    if (sourceInventory !== actor.defaultInventory.name)
      inventories.unshift(actor.defaultInventory);
    return {
      title: game.i18n.localize("SR5.MoveInventoryDialog.Title"),
      buttons: {
        move: {
          label: game.i18n.localize("SR5.MoveInventoryDialog.Move")
        },
        cancel: {
          label: game.i18n.localize("SR5.MoveInventoryDialog.Cancel")
        }
      },
      default: "cancel",
      templateData: { inventories },
      templatePath: "systems/shadowrun5e/dist/templates/apps/dialogs/move-inventory-dialog.html",
      onAfterClose: (html) => __async(this, null, function* () {
        return html.find('input[name="inventories"]:checked').val();
      })
    };
  }
};

// src/module/apps/characterImport/CharacterInfoUpdater.js
var CharacterInfoUpdater = class {
  constructor() {
    __publicField(this, "parseAttName", (attName) => {
      if (attName.toLowerCase() === "bod") {
        return "body";
      }
      if (attName.toLowerCase() === "agi") {
        return "agility";
      }
      if (attName.toLowerCase() === "rea") {
        return "reaction";
      }
      if (attName.toLowerCase() === "str") {
        return "strength";
      }
      if (attName.toLowerCase() === "cha") {
        return "charisma";
      }
      if (attName.toLowerCase() === "int") {
        return "intuition";
      }
      if (attName.toLowerCase() === "log") {
        return "logic";
      }
      if (attName.toLowerCase() === "wil") {
        return "willpower";
      }
      if (attName.toLowerCase() === "edg") {
        return "edge";
      }
      if (attName.toLowerCase() === "mag") {
        return "magic";
      }
      if (attName.toLowerCase() === "res") {
        return "resonance";
      }
    });
    __publicField(this, "getArray", (value) => {
      return Array.isArray(value) ? value : [value];
    });
    __publicField(this, "parseAttBaseValue", (att) => {
      if (att.name.toLowerCase() === "edg") {
        return parseInt(att.base);
      } else {
        return parseInt(att.total);
      }
    });
  }
  update(actorSource, chummerChar) {
    const clonedActorSource = duplicate(actorSource);
    if (chummerChar.alias) {
      clonedActorSource.name = chummerChar.alias;
    } else {
      clonedActorSource.name = chummerChar.name ? chummerChar.name : "[Name not found]";
    }
    this.importBasicData(clonedActorSource.system, chummerChar);
    this.importBio(clonedActorSource.system, chummerChar);
    this.importAttributes(clonedActorSource.system, chummerChar);
    this.importInitiative(clonedActorSource.system, chummerChar);
    this.importSkills(clonedActorSource.system, chummerChar);
    return clonedActorSource;
  }
  importBasicData(system, chummerChar) {
    try {
      if (chummerChar.metatype) {
        system.metatype = chummerChar.metatype;
      }
      if (chummerChar.sex) {
        system.sex = chummerChar.sex;
      }
      if (chummerChar.age) {
        system.age = chummerChar.age;
      }
      if (chummerChar.height) {
        system.height = chummerChar.height;
      }
      if (chummerChar.weight) {
        system.weight = chummerChar.weight;
      }
      if (chummerChar.calculatedstreetcred) {
        system.street_cred = chummerChar.calculatedstreetcred;
      }
      if (chummerChar.calculatednotoriety) {
        system.notoriety = chummerChar.calculatednotoriety;
      }
      if (chummerChar.calculatedpublicawareness) {
        system.public_awareness = chummerChar.calculatedpublicawareness;
      }
      if (chummerChar.karma) {
        system.karma.value = chummerChar.karma;
      }
      if (chummerChar.totalkarma) {
        system.karma.max = chummerChar.totalkarma;
      }
      if (chummerChar.technomancer && chummerChar.technomancer.toLowerCase() === "true") {
        system.special = "resonance";
      }
      if (chummerChar.magician && chummerChar.magician.toLowerCase() === "true" || chummerChar.adept && chummerChar.adept.toLowerCase() === "true") {
        system.special = "magic";
        let attr = [];
        if (chummerChar.tradition && chummerChar.tradition.drainattribute && chummerChar.tradition.drainattribute.attr) {
          attr = chummerChar.tradition.drainattribute.attr;
        } else if (chummerChar.tradition && chummerChar.tradition.drainattributes) {
          attr = chummerChar.tradition.drainattributes.split("+").map((item) => item.trim());
        }
        attr.forEach((att) => {
          const attName = this.parseAttName(att);
          if (attName !== "willpower")
            system.magic.attribute = att;
        });
      }
      if (chummerChar.totaless) {
        system.attributes.essence.value = chummerChar.totaless;
      }
      if (chummerChar.nuyen) {
        system.nuyen = parseInt(chummerChar.nuyen.replace(",", ""));
      }
    } catch (e) {
      console.error(`Error while parsing character information ${e}`);
    }
  }
  importBio(system, chummerChar) {
    system.description.value = "";
    if (chummerChar.description) {
      system.description.value += TextEditor.enrichHTML(chummerChar.description + "<br/>");
    }
    if (chummerChar.background) {
      system.description.value += TextEditor.enrichHTML(chummerChar.background + "<br/>");
    }
    if (chummerChar.concept) {
      system.description.value += TextEditor.enrichHTML(chummerChar.concept + "<br/>");
    }
    if (chummerChar.notes) {
      system.description.value += TextEditor.enrichHTML(chummerChar.notes + "<br/>");
    }
  }
  importAttributes(system, chummerChar) {
    const atts = chummerChar.attributes[1].attribute;
    atts.forEach((att) => {
      try {
        const attName = this.parseAttName(att.name);
        if (attName) {
          system.attributes[attName].base = this.parseAttBaseValue(att);
        }
      } catch (e) {
        console.error(`Error while parsing attributes ${e}`);
      }
    });
  }
  importInitiative(system, chummerChar) {
    try {
      system.modifiers.meat_initiative = chummerChar.initbonus;
      system.modifiers.meat_initiative_dice = chummerChar.initdice - 1;
    } catch (e) {
      console.error(`Error while parsing initiative ${e}`);
    }
  }
  importSkills(system, chummerChar) {
    const chummerSkills = chummerChar.skills.skill;
    for (let i = 0; i < chummerSkills.length; i++) {
      try {
        const chummerSkill = chummerSkills[i];
        if (chummerSkill.rating > 0 && chummerSkill.islanguage) {
          let determinedGroup = "active";
          let parsedSkill = null;
          if (chummerSkill.islanguage && chummerSkill.islanguage.toLowerCase() === "true") {
            const id = randomID(16);
            parsedSkill = {};
            system.skills.language.value[id] = parsedSkill;
            determinedGroup = "language";
          } else if (chummerSkill.knowledge && chummerSkill.knowledge.toLowerCase() === "true") {
            const id = randomID(16);
            const category = chummerSkill.skillcategory_english;
            parsedSkill = {};
            let skillCategory;
            if (category) {
              const cat = category.toLowerCase();
              if (cat === "street")
                skillCategory = system.skills.knowledge.street.value;
              if (cat === "academic")
                skillCategory = system.skills.knowledge.academic.value;
              if (cat === "professional")
                skillCategory = system.skills.knowledge.professional.value;
              if (cat === "interest")
                skillCategory = system.skills.knowledge.interests.value;
              if (skillCategory)
                skillCategory[id] = parsedSkill;
            } else {
              if (chummerSkill.attribute.toLowerCase() === "int") {
                system.skills.knowledge.street.value[id] = parsedSkill;
              }
              if (chummerSkill.attribute.toLowerCase() === "log") {
                system.skills.knowledge.professional.value[id] = parsedSkill;
              }
            }
            determinedGroup = "knowledge";
          } else {
            let name = chummerSkill.name.toLowerCase().trim().replace(/\s/g, "_").replace(/-/g, "_");
            if (name.includes("exotic") && name.includes("_weapon"))
              name = name.replace("_weapon", "");
            if (name === "pilot_watercraft")
              name = "pilot_water_craft";
            parsedSkill = system.skills.active[name];
          }
          if (!parsedSkill) {
            console.error(`Couldn't parse skill ${chummerSkill.name}`);
          } else {
            if (determinedGroup !== "active")
              parsedSkill.name = chummerSkill.name;
            parsedSkill.base = parseInt(chummerSkill.rating);
            if (chummerSkill.skillspecializations) {
              parsedSkill.specs = this.getArray(chummerSkill.skillspecializations.skillspecialization.name);
            }
            _mergeWithMissingSkillFields(parsedSkill);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
};

// src/module/apps/characterImport/BaseParserFunctions.js
var getValues = (val) => {
  const regex = /(-?[0-9]+)(?:([0-9]+))*/g;
  const l = val.match(regex);
  return l || ["0"];
};
var getArray = (value) => {
  return Array.isArray(value) ? value : [value];
};
var parseDescription = (chummerEntry) => {
  const parsedDescription = DefaultValues.descriptionData();
  if (chummerEntry.source && chummerEntry.page) {
    parsedDescription.source = `${chummerEntry.source} ${chummerEntry.page}`;
  }
  if (chummerEntry.description) {
    parsedDescription.value = TextEditor.enrichHTML(chummerEntry.description);
  }
  return parsedDescription;
};
var parseTechnology = (chummerEntry) => {
  const parsedTechnology = DefaultValues.technologyData();
  if (chummerEntry.rating) {
    parsedTechnology.rating = chummerEntry.rating;
  }
  if (chummerEntry.avail) {
    parsedTechnology.availability = chummerEntry.avail;
  }
  if (chummerEntry.qty) {
    parsedTechnology.quantity = chummerEntry.qty;
  }
  if (chummerEntry.cost) {
    parsedTechnology.cost = parseFloat(chummerEntry.cost.replace(/[^\d\.\-]/g, ""));
  }
  if (chummerEntry.equipped && chummerEntry.equipped.toLowerCase() === "true") {
    parsedTechnology.equipped = true;
  }
  if (chummerEntry.conditionmonitor) {
    parsedTechnology.condition_monitor.max = Number(chummerEntry.conditionmonitor);
  }
  if (chummerEntry.conceal) {
    parsedTechnology.conceal.base = Number(chummerEntry.conceal);
  }
  return parsedTechnology;
};
var createItemData = (name, type, data) => {
  return {
    name,
    _id: "",
    folder: "",
    flags: {},
    img: "icons/svg/mystery-man.svg",
    type,
    data,
    permission: {
      default: 2
    }
  };
};

// src/module/apps/characterImport/gearImport/BaseGearParser.ts
var BaseGearParser = class {
  parse(chummerGear) {
    const parsedGear = this.getDefaultData();
    parsedGear.name = chummerGear.name;
    if (chummerGear.extra) {
      parsedGear.name += ` (${chummerGear.extra})`;
    }
    parsedGear.data.technology = parseTechnology(chummerGear);
    parsedGear.data.description = parseDescription(chummerGear);
    return parsedGear;
  }
  getDefaultData() {
    return {
      name: "",
      type: "equipment",
      data: DefaultValues.equipmentData()
    };
  }
};

// src/module/apps/characterImport/gearImport/SinParser.ts
var SinParser = class extends BaseGearParser {
  parse(chummerGear) {
    const parsedGear = super.parse(chummerGear);
    parsedGear.type = "sin";
    if (chummerGear.children) {
      const chummerLicenses = [];
      if (!Array.isArray(chummerGear.children.gear)) {
        chummerLicenses.push(chummerGear.children.gear);
      } else {
        chummerLicenses.push(...chummerGear.children.gear);
      }
      parsedGear.data.licenses = this.parseLicenses(chummerLicenses);
    }
    return parsedGear;
  }
  parseLicenses(chummerLicenses) {
    const parsedLicenses = [];
    chummerLicenses.forEach((chummerLicense) => {
      if (chummerLicense.category === "ID/Credsticks") {
        parsedLicenses.push({
          name: chummerLicense.extra,
          rtg: chummerLicense.rating,
          description: ""
        });
      }
    });
    return parsedLicenses;
  }
};

// src/module/apps/characterImport/gearImport/DeviceParser.ts
var DeviceParser = class extends BaseGearParser {
  parse(chummerGear) {
    const parsedGear = super.parse(chummerGear);
    parsedGear.type = "device";
    parsedGear.data.technology.rating = chummerGear.devicerating;
    parsedGear.data.atts = {
      att1: {
        value: chummerGear.attack,
        att: "attack"
      },
      att2: {
        value: chummerGear.sleaze,
        att: "sleaze"
      },
      att3: {
        value: chummerGear.dataprocessing,
        att: "data_processing"
      },
      att4: {
        value: chummerGear.firewall,
        att: "firewall"
      }
    };
    if (chummerGear.category === "Cyberdecks") {
      parsedGear.data.category = "cyberdeck";
    }
    if (chummerGear.category === "Commlinks") {
      parsedGear.data.category = "commlink";
    }
    if (chummerGear.category === "Rigger Command Consoles") {
      parsedGear.data.category = "commlink";
    }
    return parsedGear;
  }
};

// src/module/apps/characterImport/gearImport/ProgramParser.ts
var ProgramParser = class extends BaseGearParser {
  parse(chummerGear) {
    const parsedGear = super.parse(chummerGear);
    parsedGear.type = "program";
    if (chummerGear.category === "Common Programs") {
      parsedGear.data.type = "common_program";
    } else if (chummerGear.category === "Hacking Programs") {
      parsedGear.data.type = "hacking_program";
    } else if (chummerGear.category === "Software") {
      parsedGear.data.type = "agent";
    }
    return parsedGear;
  }
};

// src/module/apps/characterImport/gearImport/AmmoParser.ts
var AmmoParser = class extends BaseGearParser {
  parse(chummerGear) {
    const parsedGear = super.parse(chummerGear);
    parsedGear.type = "ammo";
    if (chummerGear.weaponbonusap) {
      parsedGear.data.ap = parseInt(chummerGear.weaponbonusap);
    }
    if (chummerGear.weaponbonusdamage) {
      parsedGear.data.damage = parseInt(chummerGear.weaponbonusdamage);
      if (chummerGear.weaponbonusdamage.includes("P")) {
        parsedGear.data.damageType = "physical";
      } else if (chummerGear.weaponbonusdamage.includes("S")) {
        parsedGear.data.damageType = "stun";
      } else if (chummerGear.weaponbonusdamage.includes("M")) {
        parsedGear.data.damageType = "matrix";
      } else {
        parsedGear.data.damageType = "physical";
      }
    }
    return parsedGear;
  }
};

// src/module/apps/characterImport/gearImport/ParserSelector.ts
var ParserSelector = class {
  select(chummerGear) {
    if (chummerGear.issin === "True") {
      return new SinParser();
    }
    if (chummerGear.iscommlink === "True") {
      return new DeviceParser();
    }
    if (chummerGear.isammo === "True") {
      return new AmmoParser();
    }
    if (chummerGear.category === "Common Programs" || chummerGear.category === "Hacking Programs" || chummerGear.category === "Software") {
      return new ProgramParser();
    }
    return new BaseGearParser();
  }
};

// src/module/apps/characterImport/gearImport/GearsParser.ts
var GearsParser = class {
  parseGears(chummerGears) {
    let items = [];
    chummerGears.forEach((chummerGear) => {
      try {
        if (!this.gearShouldBeParsed(chummerGear)) {
          return;
        }
        const itemsData = this.parseGearEntry(chummerGear);
        items.push(itemsData);
      } catch (e) {
        console.error(e);
      }
    });
    return items;
  }
  parseGearEntry(chummerGear) {
    const parserSelector = new ParserSelector();
    const parser = parserSelector.select(chummerGear);
    return parser.parse(chummerGear);
  }
  gearShouldBeParsed(chummerGear) {
    const englishGearName = chummerGear.name_english.toLowerCase();
    if (englishGearName.startsWith("grenade") || englishGearName.startsWith("minigrenade") || englishGearName.startsWith("rocket")) {
      return false;
    }
    return true;
  }
};

// src/module/apps/characterImport/ArmorParser.js
var ArmorParser = class {
  parseArmors(chummerChar) {
    const armors = getArray(chummerChar.armors.armor);
    const parsedArmors = [];
    armors.forEach((chummerArmor) => {
      try {
        const itemData = this.parseArmor(chummerArmor);
        parsedArmors.push(itemData);
      } catch (e) {
        console.error(e);
      }
    });
    return parsedArmors;
  }
  parseArmor(chummerArmor) {
    const data = {};
    const armor = {};
    data.armor = armor;
    let desc = "";
    armor.mod = chummerArmor.armor.includes("+");
    armor.value = parseInt(chummerArmor.armor.replace("+", ""));
    if (chummerArmor.description)
      desc = chummerArmor.description;
    console.log(chummerArmor);
    if (chummerArmor.armormods && chummerArmor.armormods.armormod) {
      armor.fire = 0;
      armor.electricity = 0;
      armor.cold = 0;
      armor.acid = 0;
      armor.radiation = 0;
      const modDesc = [];
      const mods = getArray(chummerArmor.armormods.armormod);
      mods.forEach((mod) => {
        if (mod.name.toLowerCase().includes("fire resistance")) {
          armor.fire += parseInt(mod.rating);
        } else if (mod.name.toLowerCase().includes("nonconductivity")) {
          armor.electricity += parseInt(mod.rating);
        } else if (mod.name.toLowerCase().includes("insulation")) {
          armor.cold += parseInt(mod.rating);
        } else if (mod.name.toLowerCase().includes("radiation shielding")) {
          armor.radiation += parseInt(mod.rating);
        }
        if (mod.rating !== "") {
          modDesc.push(`${mod.name} R${mod.rating}`);
        } else {
          modDesc.push(mod.name);
        }
      });
      if (modDesc.length > 0) {
        desc = `${modDesc.join(",")}

${desc}`;
      }
    }
    data.technology = parseTechnology(chummerArmor);
    data.description = parseDescription(chummerArmor);
    return createItemData(chummerArmor.name, "armor", data);
  }
};

// src/module/apps/characterImport/CyberwareParser.js
var CyberwareParser2 = class {
  parseCyberwares(chummerChar) {
    const chummerCyberwares = getArray(chummerChar.cyberwares.cyberware);
    const parsedCyberware = [];
    chummerCyberwares.forEach((chummerCyber) => {
      try {
        const itemData = this.parseCyberware(chummerCyber);
        parsedCyberware.push(itemData);
      } catch (e) {
        console.error(e);
      }
    });
    return parsedCyberware;
  }
  parseCyberware(chummerCyber) {
    const data = {};
    data.description = parseDescription(chummerCyber);
    data.technology = parseTechnology(chummerCyber);
    data.technology.equipped = true;
    data.essence = chummerCyber.ess;
    data.grade = chummerCyber.grade;
    return createItemData(chummerCyber.name, "cyberware", data);
  }
};

// src/module/apps/characterImport/QualityParser.js
var QualityParser = class {
  parseQualities(chummerChar) {
    const qualities = getArray(chummerChar.qualities.quality);
    const parsedQualities = [];
    qualities.forEach((chummerQuality) => {
      try {
        const itemData = this.parseQuality(chummerQuality);
        parsedQualities.push(itemData);
      } catch (e) {
        console.error(e);
      }
    });
    return parsedQualities;
  }
  parseQuality(chummerQuality) {
    const data = DefaultValues.qualityData();
    data.type = chummerQuality.qualitytype.toLowerCase();
    data.description = parseDescription(chummerQuality);
    const itemData = createItemData(chummerQuality.name, "quality", data);
    return itemData;
  }
};

// src/module/apps/characterImport/PowerParser.js
var PowerParser = class {
  parsePowers(chummerChar) {
    const powers = getArray(chummerChar.powers.power);
    const parsedPowers = [];
    powers.forEach((chummerPower) => {
      const itemData = this.parsePower(chummerPower);
      parsedPowers.push(itemData);
    });
    return parsedPowers;
  }
  parsePower(chummerPower) {
    const data = {};
    data.description = parseDescription(chummerPower);
    data.level = parseInt(chummerPower.rating);
    data.pp = parseFloat(chummerPower.totalpoints);
    const itemData = createItemData(chummerPower.fullname, "adept_power", data);
    return itemData;
  }
};

// src/module/apps/characterImport/SpellParser.js
var SpellParser = class {
  parseSpells(chummerChar) {
    const spells = getArray(chummerChar.spells.spell);
    const parsedSpells = [];
    spells.forEach((chummerSpell) => {
      try {
        if (chummerSpell.alchemy.toLowerCase() !== "true") {
          const itemData = this.parseSpell(chummerSpell);
          parsedSpells.push(itemData);
        }
      } catch (e) {
        console.error(e);
      }
    });
    return parsedSpells;
  }
  parseSpell(chummerSpell) {
    const action = {};
    const data = {};
    data.action = action;
    data.category = chummerSpell.category.toLowerCase().replace(/\s/g, "_");
    data.name = chummerSpell.name;
    data.type = chummerSpell.type === "M" ? "mana" : "physical";
    data.range = chummerSpell.range === "T" ? "touch" : chummerSpell.range.toLowerCase().replace(/\s/g, "_").replace("(", "").replace(")", "");
    data.drain = parseInt(chummerSpell.dv.replace("F", ""));
    data.description = parseDescription(chummerSpell);
    let description = "";
    if (chummerSpell.descriptors)
      description = chummerSpell.descriptors;
    if (chummerSpell.description)
      description += `
${chummerSpell.description}`;
    data.description.value = TextEditor.enrichHTML(description);
    if (chummerSpell.duration.toLowerCase() === "s")
      data.duration = "sustained";
    else if (chummerSpell.duration.toLowerCase() === "i")
      data.duration = "instant";
    else if (chummerSpell.duration.toLowerCase() === "p")
      data.duration = "permanent";
    action.type = "varies";
    action.skill = "spellcasting";
    action.attribute = "magic";
    action.damage = DefaultValues.damageData();
    action.damage.type.base = "";
    action.damage.type.value = "";
    if (chummerSpell.descriptors) {
      const desc = chummerSpell.descriptors.toLowerCase();
      if (chummerSpell.category.toLowerCase() === "combat") {
        data.combat = {};
        if (desc.includes("indirect")) {
          data.combat.type = "indirect";
          action.opposed = {
            type: "defense"
          };
        } else {
          data.combat.type = "direct";
          if (data.type === "mana") {
            action.damage.type.base = "stun";
            action.damage.type.value = "stun";
            action.opposed = {
              type: "soak",
              attribute: "willpower"
            };
          } else if (data.type === "physical") {
            action.damage.type.base = "physical";
            action.damage.type.value = "physical";
            action.opposed = {
              type: "soak",
              attribute: "body"
            };
          }
        }
      }
      if (chummerSpell.category.toLowerCase() === "detection") {
        data.detection = {};
        const split = desc.split(",");
        split.forEach((token) => {
          token = token || "";
          token = token.replace(" detection spell", "");
          if (!token)
            return;
          if (token.includes("area"))
            return;
          if (token.includes("passive"))
            data.detection.passive = true;
          else if (token.includes("active"))
            data.detection.passive = false;
          else if (token)
            data.detection.type = token.toLowerCase();
        });
        if (!data.detection.passive) {
          action.opposed = {
            type: "custom",
            attribute: "willpower",
            attribute2: "logic"
          };
        }
      }
      if (chummerSpell.category.toLowerCase() === "illusion") {
        data.illusion = {};
        const split = desc.split(",");
        split.forEach((token) => {
          token = token || "";
          token = token.replace(" illusion spell", "");
          if (!token)
            return;
          if (token.includes("area"))
            return;
          if (token.includes("sense"))
            data.illusion.sense = token.toLowerCase();
          else if (token)
            data.illusion.type = token.toLowerCase();
        });
        if (data.type === "mana") {
          action.opposed = {
            type: "custom",
            attribute: "willpower",
            attribute2: "logic"
          };
        } else {
          action.opposed = {
            type: "custom",
            attribute: "intuition",
            attribute2: "logic"
          };
        }
      }
      if (chummerSpell.category.toLowerCase() === "manipulation") {
        data.manipulation = {};
        if (desc.includes("environmental"))
          data.manipulation.environmental = true;
        if (desc.includes("physical"))
          data.manipulation.physical = true;
        if (desc.includes("mental"))
          data.manipulation.mental = true;
        if (data.manipulation.mental) {
          action.opposed = {
            type: "custom",
            attribute: "willpower",
            attribute2: "logic"
          };
        }
        if (data.manipulation.physical) {
          action.opposed = {
            type: "custom",
            attribute: "body",
            attribute2: "strength"
          };
        }
      }
    }
    return createItemData(chummerSpell.name, "spell", data);
  }
};

// src/module/apps/characterImport/WeaponParser.js
var WeaponParser = class {
  constructor() {
    __publicField(this, "parseDamage", (val) => {
      const damage = {
        damage: 0,
        type: "physical",
        radius: 0,
        dropoff: 0
      };
      const split = val.split(",");
      if (split.length > 0) {
        const l = split[0].match(/(\d+)(\w+)/);
        if (l && l[1])
          damage.damage = parseInt(l[1]);
        if (l && l[2])
          damage.type = l[2] === "P" ? "physical" : "stun";
      }
      for (let i = 1; i < split.length; i++) {
        const l = split[i].match(/(-?\d+)(.*)/);
        if (l && l[2]) {
          if (l[2].toLowerCase().includes("/m"))
            damage.dropoff = parseInt(l[1]);
          else
            damage.radius = parseInt(l[1]);
        }
      }
      return damage;
    });
  }
  parseWeapons(chummerChar) {
    const weapons = getArray(chummerChar.weapons.weapon);
    const parsedWeapons = [];
    weapons.forEach((chummerWeapon) => {
      try {
        const itemData = this.parseWeapon(chummerWeapon);
        parsedWeapons.push(itemData);
      } catch (e) {
        console.error(e);
      }
    });
    return parsedWeapons;
  }
  parseWeapon(chummerWeapon) {
    const data = {};
    const action = {};
    const damage = {};
    action.damage = damage;
    data.action = action;
    data.description = parseDescription(chummerWeapon);
    data.technology = parseTechnology(chummerWeapon);
    damage.ap = {
      base: parseInt(getValues(chummerWeapon.ap)[0])
    };
    action.type = "varies";
    if (chummerWeapon.skill) {
      action.skill = chummerWeapon.skill.toLowerCase().replace(/\s/g, "_");
    } else if (chummerWeapon.category && chummerWeapon.category.toLowerCase().includes("exotic")) {
      action.skill = chummerWeapon.category.toLowerCase().replace(" weapons", "").replace(/\s/g, "_");
    } else if (chummerWeapon.category && chummerWeapon.category.toLowerCase().includes("laser weapons")) {
      action.skill = "exotic_range";
    }
    if (action.skill.includes("exotic")) {
      action.skill = action.skill.replace("_weapon", "");
    }
    action.attribute = "agility";
    action.limit = {
      base: parseInt(getValues(chummerWeapon.accuracy)[0])
    };
    if (chummerWeapon.type.toLowerCase() === "melee") {
      action.type = "complex";
      data.category = "melee";
      const melee = {};
      data.melee = melee;
      melee.reach = parseInt(chummerWeapon.reach);
    } else if (chummerWeapon.type.toLowerCase() === "ranged") {
      data.category = "range";
      if (action.skill.toLowerCase().includes("throw")) {
        data.category = "thrown";
      }
      const range = {};
      data.range = range;
      range.rc = {
        base: parseInt(getValues(chummerWeapon.rc)[0])
      };
      if (chummerWeapon.mode) {
        const lower = chummerWeapon.mode.toLowerCase();
        range.modes = {
          single_shot: lower.includes("ss"),
          semi_auto: lower.includes("sa"),
          burst_fire: lower.includes("bf"),
          full_auto: lower.includes("fa")
        };
      }
      if (chummerWeapon.clips != null && chummerWeapon.clips.clip != null) {
        const clips = Array.isArray(chummerWeapon.clips.clip) ? chummerWeapon.clips.clip : [chummerWeapon.clips.clip];
        clips.forEach((clip) => {
          console.log(clip);
        });
      }
      if (chummerWeapon.ranges && chummerWeapon.ranges.short && chummerWeapon.ranges.medium && chummerWeapon.ranges.long && chummerWeapon.ranges.extreme) {
        console.log(chummerWeapon.ranges);
        range.ranges = {
          short: parseInt(chummerWeapon.ranges.short.split("-")[1]),
          medium: parseInt(chummerWeapon.ranges.medium.split("-")[1]),
          long: parseInt(chummerWeapon.ranges.long.split("-")[1]),
          extreme: parseInt(chummerWeapon.ranges.extreme.split("-")[1])
        };
      }
    } else if (chummerWeapon.type.toLowerCase() === "thrown") {
      data.category = "thrown";
    }
    {
      const d = this.parseDamage(chummerWeapon.damage_english);
      damage.base = d.damage;
      damage.type = {};
      damage.type.base = d.type;
      if (d.dropoff || d.radius) {
        const thrown = {};
        data.thrown = thrown;
        thrown.blast = {
          radius: d.radius,
          dropoff: d.dropoff
        };
      }
    }
    const itemData = createItemData(chummerWeapon.name, "weapon", data);
    return itemData;
  }
};

// src/module/apps/characterImport/LifestyleParser.js
var LifestyleParser = class {
  parseLifestyles(chummerChar) {
    const chummerLifestyle = getArray(chummerChar.lifestyles.lifestyle);
    const parsedLifestyle = [];
    chummerLifestyle.forEach((chummerLifestyle2) => {
      try {
        const itemData = this.parseLifestyle(chummerLifestyle2);
        parsedLifestyle.push(itemData);
      } catch (e) {
        console.error(e);
      }
    });
    return parsedLifestyle;
  }
  parseLifestyle(chummerLifestyle) {
    const data = {};
    const chummerLifestyleType = chummerLifestyle.baselifestyle.toLowerCase();
    if (chummerLifestyleType in SR5.lifestyleTypes) {
      data.type = chummerLifestyleType;
    } else {
      if (chummerLifestyleType === "luxury") {
        data.type = "luxory";
      } else {
        data.type = "other";
      }
    }
    data.cost = chummerLifestyle.totalmonthlycost;
    data.permanent = chummerLifestyle.purchased;
    data.description = parseDescription(chummerLifestyle);
    const itemName = chummerLifestyle.name ? chummerLifestyle.name : chummerLifestyle.baselifestyle;
    const itemData = createItemData(itemName, "lifestyle", data);
    return itemData;
  }
};

// src/module/apps/characterImport/ContactParser.js
var ContactParser = class {
  parseContacts(chummerChar) {
    const chummerContacts = getArray(chummerChar.contacts.contact);
    const parsedContacts = [];
    chummerContacts.forEach((chummerContact) => {
      try {
        const itemData = this.parseContact(chummerContact);
        parsedContacts.push(itemData);
      } catch (e) {
        console.error(e);
      }
    });
    return parsedContacts;
  }
  parseContact(chummerContact) {
    const data = {};
    data.type = chummerContact.role;
    if (chummerContact.connection.toLowerCase().includes("group")) {
      data.connection = chummerContact.connection.toLowerCase().replace("group(", "").replace(")", "");
    } else {
      data.connection = chummerContact.connection;
    }
    data.loyalty = chummerContact.loyalty;
    data.family = chummerContact.family.toLowerCase() === "true";
    data.blackmail = chummerContact.blackmail.toLowerCase() === "true";
    data.description = parseDescription(chummerContact);
    const itemName = chummerContact.name ? chummerContact.name : "[Unnamed connection]";
    const itemData = createItemData(itemName, "contact", data);
    return itemData;
  }
};

// src/module/apps/characterImport/ItemsParser.js
var ItemsParser = class {
  parse(chummerChar, importOptions) {
    const parsedItems = [];
    if (importOptions.qualities && chummerChar.qualities && chummerChar.qualities.quality) {
      const parsedQualities = new QualityParser().parseQualities(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedQualities);
    }
    if (importOptions.weapons && chummerChar.weapons != null && chummerChar.weapons.weapon != null) {
      const parsedWeapons = new WeaponParser().parseWeapons(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedWeapons);
    }
    if (importOptions.armor && chummerChar.armors && chummerChar.armors.armor) {
      const parsedArmors = new ArmorParser().parseArmors(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedArmors);
    }
    if (importOptions.cyberware && chummerChar.cyberwares && chummerChar.cyberwares.cyberware) {
      const parsedCyberware = new CyberwareParser2().parseCyberwares(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedCyberware);
    }
    if (importOptions.powers && chummerChar.powers && chummerChar.powers.power) {
      const parsedPowers = new PowerParser().parsePowers(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedPowers);
    }
    if (importOptions.equipment && chummerChar.gears && chummerChar.gears.gear) {
      const gears = getArray(chummerChar.gears.gear);
      const allGearData = new GearsParser().parseGears(gears);
      Array.prototype.push.apply(parsedItems, allGearData);
    }
    if (importOptions.spells && chummerChar.spells && chummerChar.spells.spell) {
      const parsedSpells = new SpellParser().parseSpells(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedSpells);
    }
    if (importOptions.contacts && chummerChar.contacts && chummerChar.contacts.contact) {
      const parsedContacts = new ContactParser().parseContacts(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedContacts);
    }
    if (importOptions.lifestyles && chummerChar.lifestyles && chummerChar.lifestyles.lifestyle) {
      const parsedLifestyles = new LifestyleParser().parseLifestyles(chummerChar);
      Array.prototype.push.apply(parsedItems, parsedLifestyles);
    }
    return parsedItems;
  }
};

// src/module/apps/characterImport/CharacterImporter.js
var CharacterImporter = class {
  importChummerCharacter(actor, chummerFile, importOptions) {
    return __async(this, null, function* () {
      console.log("Importing the following character file content:");
      console.log(chummerFile);
      console.log("Using the following import options:");
      console.log(importOptions);
      if (!chummerFile.characters || !chummerFile.characters.character) {
        console.log("Did not find a valid character to import  - aborting import");
        return;
      }
      const chummerCharacter = chummerFile.characters.character;
      const updatedActorData = new CharacterInfoUpdater().update(actor._source, chummerCharacter);
      const items = new ItemsParser().parse(chummerCharacter, importOptions);
      yield actor.update(updatedActorData);
      yield actor.createEmbeddedDocuments("Item", items);
    });
  }
};

// src/module/apps/chummer-import-form.js
var ChummerImportForm = class extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "chummer-import";
    options.classes = ["shadowrun5e"];
    options.title = "Chummer/Hero Lab Import";
    options.template = "systems/shadowrun5e/dist/templates/apps/import.html";
    options.width = 600;
    options.height = "auto";
    return options;
  }
  getData() {
    return {};
  }
  activateListeners(html) {
    html.find(".submit-chummer-import").click((event) => __async(this, null, function* () {
      var _a;
      event.preventDefault();
      const chummerFile = JSON.parse($(".chummer-text").val());
      const importOptions = {
        weapons: $(".weapons").is(":checked"),
        armor: $(".armor").is(":checked"),
        cyberware: $(".cyberware").is(":checked"),
        equipment: $(".gear").is(":checked"),
        qualities: $(".qualities").is(":checked"),
        powers: $(".powers").is(":checked"),
        spells: $(".spells").is(":checked"),
        contacts: $(".contacts").is(":checked"),
        lifestyles: $(".lifestyles").is(":checked")
      };
      const importer = new CharacterImporter();
      yield importer.importChummerCharacter(this.object, chummerFile, importOptions);
      (_a = ui.notifications) == null ? void 0 : _a.info("Complete! Check everything. Notably: Ranged weapon mods and ammo; Strength based weapon damage; Specializations on all spells, powers, and weapons;");
      this.close();
    }));
  }
};

// src/module/actor/sheets/SR5BaseActorSheet.ts
var globalSkillAppId = -1;
var sortByName = (i1, i2) => {
  if (i1.name > i2.name)
    return 1;
  if (i1.name < i2.name)
    return -1;
  return 0;
};
var sortByEquipped = (left, right) => {
  var _a, _b, _c, _d;
  const leftEquipped = (_b = (_a = left.data) == null ? void 0 : _a.technology) == null ? void 0 : _b.equipped;
  const rightEquipped = (_d = (_c = right.data) == null ? void 0 : _c.technology) == null ? void 0 : _d.equipped;
  if (leftEquipped && !rightEquipped)
    return -1;
  if (rightEquipped && !leftEquipped)
    return 1;
  if (left.name > right.name)
    return 1;
  if (left.name < right.name)
    return -1;
  return 0;
};
var sortyByQuality = (a, b) => {
  if (a.data.type === "positive" && b.data.type === "negative")
    return -1;
  if (a.data.type === "negative" && b.data.type === "positive")
    return 1;
  return a.name < b.name ? -1 : 1;
};
var SR5BaseActorSheet = class extends ActorSheet {
  constructor(...args) {
    super(...args);
    this._shownDesc = [];
    this._filters = {
      skills: "",
      showUntrainedSkills: true
    };
    this._delays = {
      skills: null
    };
    this.selectedInventory = this.document.defaultInventory.name;
  }
  getHandledItemTypes() {
    return ["action"];
  }
  getInventoryItemTypes() {
    return [];
  }
  getForbiddenItemTypes() {
    return [];
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["sr5", "sheet", "actor"],
      width: 905,
      height: 690,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".sheetbody",
          initial: "skills"
        }
      ]
    });
  }
  get template() {
    const path = "systems/shadowrun5e/dist/templates";
    if (this.actor.limited) {
      return `${path}/actor-limited/${this.actor.data.type}.html`;
    }
    return `${path}/actor/${this.actor.data.type}.html`;
  }
  getData(options) {
    return __async(this, null, function* () {
      let data = __superGet(SR5BaseActorSheet.prototype, this, "getData").call(this);
      const actorData = this.actor.toObject(false);
      data = __spreadProps(__spreadValues({}, data), {
        data: actorData.system,
        system: actorData.system
      });
      data.config = SR5;
      data.filters = this._filters;
      this._prepareActorAttributes(data);
      this._prepareActorModifiers(data);
      this._prepareActorTypeFields(data);
      this._prepareSpecialFields(data);
      this._prepareSkillsWithFilters(data);
      data.itemType = this._prepareItemTypes(data);
      data.effects = prepareActiveEffectCategories(this.document.effects);
      data.inventories = this._prepareItemsInventory();
      data.inventory = this._prepareSelectedInventory(data.inventories);
      data.hasInventory = this._prepareHasInventory(data.inventories);
      data.selectedInventory = this.selectedInventory;
      data.biographyHTML = yield TextEditor.enrichHTML(actorData.system.description.value, {
        async: true,
        relativeTo: this.actor
      });
      return data;
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
    Helpers.setupCustomCheckbox(this, html);
    html.find(".effect-control").on("click", (event) => onManageActiveEffect(event, this.document));
    html.find(".item-create").on("click", this._onItemCreate.bind(this));
    html.find(".item-edit").on("click", this._onItemEdit.bind(this));
    html.find(".item-delete").on("click", this._onItemDelete.bind(this));
    html.find(".item-qty").on("change", this._onListItemChangeQuantity.bind(this));
    html.find(".item-rtg").on("change", this._onListItemChangeRating.bind(this));
    html.find(".item-equip-toggle").on("click", this._onListItemToggleEquipped.bind(this));
    html.find(".hidden").hide();
    html.find(".has-desc").on("click", this._onListItemToggleDescriptionVisibility.bind(this));
    html.find(".item-roll").on("click", this._onItemRoll.bind(this));
    html.find(".Roll").on("click", this._onRoll.bind(this));
    html.find(".inventory-inline-create").on("click", this._onInventoryCreate.bind(this));
    html.find(".inventory-remove").on("click", this._onInventoryRemove.bind(this));
    html.find(".inventory-edit").on("click", this._onInplaceInventoryEdit.bind(this));
    html.find(".inventory-input-cancel").on("click", this._onInplaceInventoryEditCancel.bind(this));
    html.find(".inventory-input-save").on("click", this._onInplaceInventoryEditSave.bind(this));
    html.find("input#input-inventory").on("keydown", this._onInplaceInventoryEditCancel.bind(this));
    html.find("input#input-inventory").on("keydown", this._onInplaceInventoryEditSave.bind(this));
    html.find("input#input-inventory").on("change", this._onInventoryChangePreventSheetSubmit.bind(this));
    html.find("#select-inventory").on("change", this._onSelectInventory.bind(this));
    html.find(".inventory-item-move").on("click", this._onItemMoveToInventory.bind(this));
    html.find(".horizontal-cell-input .cell").on("click", this._onSetConditionTrackCell.bind(this));
    html.find(".horizontal-cell-input .cell").on("contextmenu", this._onClearConditionTrack.bind(this));
    html.find(".marks-qty").on("change", this._onMarksQuantityChange.bind(this));
    html.find(".marks-add-one").on("click", (event) => __async(this, null, function* () {
      return this._onMarksQuantityChangeBy(event, 1);
    }));
    html.find(".marks-remove-one").on("click", (event) => __async(this, null, function* () {
      return this._onMarksQuantityChangeBy(event, -1);
    }));
    html.find(".marks-delete").on("click", this._onMarksDelete.bind(this));
    html.find(".marks-clear-all").on("click", this._onMarksClearAll.bind(this));
    html.find(".skill-header").find(".item-name").on("click", this._onFilterUntrainedSkills.bind(this));
    html.find(".skill-header").find(".skill-spec-item").on("click", this._onFilterUntrainedSkills.bind(this));
    html.find(".skill-header").find(".rtg").on("click", this._onFilterUntrainedSkills.bind(this));
    html.find("#filter-skills").on("input", this._onFilterSkills.bind(this));
    html.find(".skill-edit").on("click", this._onShowEditSkill.bind(this));
    html.find(".knowledge-skill-edit").on("click", this._onShowEditKnowledgeSkill.bind(this));
    html.find(".language-skill-edit").on("click", this._onShowEditLanguageSkill.bind(this));
    html.find(".add-knowledge").on("click", this._onAddKnowledgeSkill.bind(this));
    html.find(".add-language").on("click", this._onAddLanguageSkill.bind(this));
    html.find(".add-active").on("click", this._onAddActiveSkill.bind(this));
    html.find(".remove-knowledge").on("click", this._onRemoveKnowledgeSkill.bind(this));
    html.find(".remove-language").on("click", this._onRemoveLanguageSkill.bind(this));
    html.find(".remove-active").on("click", this._onRemoveActiveSkill.bind(this));
    html.find(".attribute-roll").on("click", this._onRollAttribute.bind(this));
    html.find(".cell-input-roll").on("click", this._onRollCellInput.bind(this));
    html.find(".skill-roll").on("click", this._onRollSkill.bind(this));
    html.find(".knowledge-skill").on("click", this._onRollSkill.bind(this));
    html.find(".language-skill").on("click", this._onRollSkill.bind(this));
    html.find(".skill-spec-roll").on("click", this._onRollSkillSpec.bind(this));
    html.find(".show-hidden-skills").on("click", this._onShowHiddenSkills.bind(this));
    html.find(".open-source-pdf").on("click", this._onOpenSourcePDF.bind(this));
    html.find(".list-item").each(this._addDragSupportToListItemTemplatePartial.bind(this));
    html.find(".import-character").on("click", this._onShowImportCharacter.bind(this));
    html.find(".reload-ammo").on("click", this._onReloadAmmo.bind(this));
    html.find(".matrix-att-selector").on("change", this._onMatrixAttributeSelected.bind(this));
  }
  _addInventoryItemTypes(inventory) {
    const inventoryTypes = this.getInventoryItemTypes();
    for (const type of Object.keys(inventory.types)) {
      if (inventoryTypes.includes(type))
        continue;
      if (inventory.types[type].items.length === 0)
        delete inventory.types[type];
    }
    return inventory;
  }
  _addInventoryTypes(inventory) {
    for (const type of this.getInventoryItemTypes()) {
      if (inventory.types.hasOwnProperty(type))
        continue;
      inventory.types[type] = {
        type,
        label: SR5.itemTypes[type],
        items: []
      };
    }
  }
  _onDragStart(event) {
    return __async(this, null, function* () {
      var _a, _b;
      const dragData = {
        actorId: this.actor.id,
        sceneId: this.actor.isToken ? (_a = canvas.scene) == null ? void 0 : _a.id : null,
        tokenId: this.actor.isToken ? (_b = this.actor.token) == null ? void 0 : _b.id : null,
        type: "",
        data: {}
      };
      const element = event.currentTarget;
      switch (element.dataset.itemType) {
        case "skill":
          dragData.type = "Skill";
          dragData.data = {
            skillId: element.dataset.itemId,
            skill: this.actor.getSkill(element.dataset.itemId)
          };
          event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
          return;
        case "knowledgeskill":
          const skillId = element.dataset.itemId.includes(".") ? element.dataset.itemId.split(".")[0] : element.dataset.itemId;
          dragData.type = "Skill";
          dragData.data = {
            skillId,
            skill: this.actor.getSkill(skillId)
          };
          event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
          return;
        default:
          return __superGet(SR5BaseActorSheet.prototype, this, "_onDragStart").call(this, event);
      }
    });
  }
  _onDrop(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      if (!event.dataTransfer)
        return;
      const documents = yield __superGet(SR5BaseActorSheet.prototype, this, "_onDrop").call(this, event);
      if (Array.isArray(documents)) {
        const items = documents.filter((document2) => document2 instanceof SR5Item);
        yield this.document.inventory.addItems(this.selectedInventory, items);
      }
      return documents;
    });
  }
  _render(...args) {
    return __async(this, null, function* () {
      const focus = this._saveInputCursorPosition();
      this._saveScrollPositions();
      yield __superGet(SR5BaseActorSheet.prototype, this, "_render").call(this, ...args);
      this._restoreScrollPositions();
      this._restoreInputCursorPosition(focus);
    });
  }
  _saveInputCursorPosition() {
    const focusList = $(this.element).find("input:focus");
    return focusList.length ? focusList[0] : null;
  }
  _restoreInputCursorPosition(focus) {
    if (focus && focus.name) {
      if (!this.form)
        return;
      const element = this.form[focus.name];
      if (element) {
        element.focus();
        if (["checkbox", "radio"].includes(element.type))
          return;
        element.setSelectionRange && element.setSelectionRange(focus.selectionStart, focus.selectionEnd);
      }
    }
  }
  _saveScrollPositions() {
    const activeList = this._findActiveList();
    if (activeList.length) {
      this._scroll = activeList.prop("scrollTop");
    }
  }
  _restoreScrollPositions() {
    const activeList = this._findActiveList();
    if (activeList.length && this._scroll != null) {
      activeList.prop("scrollTop", this._scroll);
    }
  }
  _findActiveList() {
    return $(this.element).find(".tab.active .scroll-area");
  }
  _onItemCreate(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const type = Helpers.listItemId(event);
      const itemData = {
        name: `New ${type}`,
        type
      };
      const items = yield this.actor.createEmbeddedDocuments("Item", [itemData], { renderSheet: true });
      if (!items)
        return;
      if (this.selectedInventory !== this.document.defaultInventory.name)
        yield this.document.inventory.addItems(this.selectedInventory, items);
    });
  }
  _onItemEdit(event) {
    return __async(this, null, function* () {
      var _a;
      event.preventDefault();
      const iid = Helpers.listItemId(event);
      const item = this.actor.items.get(iid);
      if (item)
        yield (_a = item.sheet) == null ? void 0 : _a.render(true);
    });
  }
  _onItemDelete(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      const iid = Helpers.listItemId(event);
      const item = this.actor.items.get(iid);
      if (!item)
        return;
      yield this.actor.inventory.removeItem(item);
      return yield this.actor.deleteEmbeddedDocuments("Item", [iid]);
    });
  }
  _onItemRoll(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const iid = Helpers.listItemId(event);
      const item = this.actor.items.get(iid);
      if (item) {
        yield item.castAction(event);
      }
    });
  }
  _onRoll(event) {
    return __async(this, null, function* () {
      var _a;
      event.preventDefault();
      let rollId = (_a = $(event.currentTarget).data()) == null ? void 0 : _a.rollId;
      rollId = rollId != null ? rollId : $(event.currentTarget).parent(".RollId").data().rollId;
      const split = rollId.split(".");
      const options = { event };
      switch (split[0]) {
        case "prompt-roll":
          yield this.actor.promptRoll();
          break;
        case "armor":
          yield this.actor.rollGeneralAction("armor", options);
          break;
        case "fade":
          yield this.actor.rollGeneralAction("fade", options);
          break;
        case "drain":
          yield this.actor.rollGeneralAction("drain", options);
          break;
        case "defense":
          yield this.actor.rollGeneralAction("physical_defense", options);
          break;
        case "damage-resist":
          yield this.actor.rollGeneralAction("physical_damage_resist", options);
          break;
        case "composure":
          yield this.actor.rollGeneralAction("composure", options);
          break;
        case "judge-intentions":
          yield this.actor.rollGeneralAction("judge_intentions", options);
          break;
        case "lift-carry":
          yield this.actor.rollGeneralAction("lift_carry", options);
          break;
        case "memory":
          yield this.actor.rollGeneralAction("memory", options);
          break;
        case "vehicle-stat":
          console.log("roll vehicle stat", rollId);
          break;
        case "drone":
          const droneRoll = split[1];
          switch (droneRoll) {
            case "perception":
              yield this.actor.rollGeneralAction("drone_perception", options);
              break;
            case "infiltration":
              yield this.actor.rollGeneralAction("drone_infiltration", options);
              break;
            case "pilot-vehicle":
              yield this.actor.rollGeneralAction("drone_pilot_vehicle", options);
              break;
          }
          break;
        case "attribute": {
          const attribute = split[1];
          if (attribute) {
            yield this.actor.rollAttribute(attribute, options);
          }
          break;
        }
        case "skill": {
          const skillId = split[2];
          yield this.actor.rollSkill(skillId, options);
          break;
        }
        case "matrix":
          const matrixRoll = split[1];
          switch (matrixRoll) {
            case "attribute":
              const attr = split[2];
              yield this.actor.rollAttribute(attr, options);
              break;
            case "device-rating":
              yield this.actor.rollDeviceRating(options);
              break;
          }
          break;
      }
    });
  }
  _onSetConditionTrackCell(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const value = Number(event.currentTarget.dataset.value);
      const cmId = $(event.currentTarget).closest(".horizontal-cell-input").data().id;
      const data = {};
      if (cmId === "stun" || cmId === "physical") {
        const property = `data.track.${cmId}.value`;
        data[property] = value;
      } else if (cmId === "edge") {
        const property = `data.attributes.edge.uses`;
        data[property] = value;
      } else if (cmId === "overflow") {
        const property = "data.track.physical.overflow.value";
        data[property] = value;
      } else if (cmId === "matrix") {
        return yield this.actor.setMatrixDamage(value);
      }
      yield this.actor.update(data);
    });
  }
  _onClearConditionTrack(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const cmId = $(event.currentTarget).closest(".horizontal-cell-input").data().id;
      const data = {};
      if (cmId === "stun") {
        data[`data.track.stun.value`] = 0;
      } else if (cmId === "physical") {
        data[`data.track.physical.value`] = 0;
        data["data.track.physical.overflow.value"] = 0;
      } else if (cmId === "edge") {
        data[`data.attributes.edge.uses`] = 0;
      } else if (cmId === "overflow") {
        data["data.track.physical.overflow.value"] = 0;
      } else if (cmId === "matrix") {
        yield this.actor.setMatrixDamage(0);
      }
      yield this.actor.update(data);
    });
  }
  _prepareSpecialFields(data) {
    const { modifiers } = data.data;
    data.awakened = data.data.special === "magic";
    data.emerged = data.data.special === "resonance";
    data.woundTolerance = 3 + (Number(modifiers["wound_tolerance"]) || 0);
  }
  _prepareActorModifiers(data) {
    const { modifiers: mods } = data.data;
    for (let [key, value] of Object.entries(mods)) {
      if (value === 0)
        mods[key] = "";
    }
  }
  _prepareActorAttributes(data) {
    const attributes = data.data.attributes;
    for (let [, attribute] of Object.entries(attributes)) {
      if (!attribute.hidden) {
        if (attribute.temp === 0)
          delete attribute.temp;
      }
    }
  }
  _prepareMatrixAttributes(data) {
    const { matrix } = data.data;
    if (matrix) {
      const cleanupAttribute = (attribute) => {
        const att = matrix[attribute];
        if (att) {
          if (!att.mod)
            att.mod = [];
          if (att.temp === 0)
            delete att.temp;
        }
      };
      ["firewall", "data_processing", "sleaze", "attack"].forEach((att) => cleanupAttribute(att));
    }
  }
  _prepareItemsInventory() {
    const inventories = {};
    const itemIdInventory = {};
    inventories[this.document.defaultInventory.name] = {
      name: this.document.defaultInventory.name,
      label: this.document.defaultInventory.label,
      types: {}
    };
    this._addInventoryTypes(inventories[this.document.defaultInventory.name]);
    Object.values(this.document.data.data.inventories).forEach(({ name, label, itemIds }) => {
      inventories[name] = {
        name,
        label,
        types: {}
      };
      this._addInventoryTypes(inventories[name]);
      itemIds.forEach((id) => {
        if (itemIdInventory[id])
          console.warn(`Shadowrun5e | Item id ${id} has been added to both ${name} and ${itemIdInventory[id]}. Will only show in ${name}`);
        itemIdInventory[id] = name;
      });
    });
    const handledTypes = this.getHandledItemTypes();
    this.document.items.forEach((item) => {
      if (handledTypes.includes(item.type))
        return;
      const sheetItem = this._prepareSheetItem(item);
      const inventoryName = itemIdInventory[item.id] || this.document.defaultInventory.name;
      const inventory = inventories[inventoryName];
      if (!inventory.types[item.type]) {
        inventory.types[item.type] = {
          type: item.type,
          label: SR5.itemTypes[item.type],
          items: []
        };
      }
      inventory.types[item.type].items.push(sheetItem);
    });
    Object.values(inventories).forEach((inventory) => {
      this._addInventoryItemTypes(inventory);
      Object.values(inventory.types).forEach((type) => {
        type.items.sort(sortByName);
      });
    });
    return inventories;
  }
  _prepareSelectedInventory(inventories) {
    return inventories[this.selectedInventory];
  }
  _prepareHasInventory(inventories) {
    if (this.getInventoryItemTypes().length > 0)
      return true;
    for (const inventory of Object.values(inventories)) {
      if (Object.keys(inventory.types).length > 0)
        return true;
    }
    return false;
  }
  _prepareSheetItem(item) {
    const sheetItem = item.toObject();
    const chatData = item.getChatData();
    sheetItem.description = chatData.description;
    sheetItem.properties = chatData.properties;
    return sheetItem;
  }
  _prepareItemTypes(data) {
    const itemType = {};
    Object.keys(CONFIG.Item.typeLabels).forEach((type) => {
      itemType[type] = [];
    });
    this.document.items.forEach((item) => {
      const sheetItem = this._prepareSheetItem(item);
      itemType[sheetItem.type].push(sheetItem);
    });
    Object.entries(itemType).forEach(([type, items]) => {
      switch (type) {
        case "quality":
          items.sort(sortyByQuality);
          break;
        case "program":
          items.sort(sortByEquipped);
          break;
        default:
          items.sort(sortByName);
          break;
      }
    });
    return itemType;
  }
  _prepareActorTypeFields(data) {
    data.isCharacter = this.actor.isCharacter();
    data.isSpirit = this.actor.isSpirit();
    data.isCritter = this.actor.isCritter();
    data.hasSkills = this.actor.hasSkills;
    data.hasSpecial = this.actor.hasSpecial;
    data.hasFullDefense = this.actor.hasFullDefense;
  }
  _onMarksQuantityChange(event) {
    return __async(this, null, function* () {
      var _a;
      event.stopPropagation();
      if (this.object.isIC() && this.object.hasHost()) {
        return (_a = ui.notifications) == null ? void 0 : _a.info(game.i18n.localize("SR5.Infos.CantModifyHostContent"));
      }
      const markId = event.currentTarget.dataset.markId;
      if (!markId)
        return;
      const markedDocuments = Helpers.getMarkIdDocuments(markId);
      if (!markedDocuments)
        return;
      const { scene, target, item } = markedDocuments;
      if (!scene || !target)
        return;
      const marks = parseInt(event.currentTarget.value);
      yield this.object.setMarks(target, marks, { scene, item, overwrite: true });
    });
  }
  _onMarksQuantityChangeBy(event, by) {
    return __async(this, null, function* () {
      var _a;
      event.stopPropagation();
      if (this.object.isIC() && this.object.hasHost()) {
        return (_a = ui.notifications) == null ? void 0 : _a.info(game.i18n.localize("SR5.Infos.CantModifyHostContent"));
      }
      const markId = event.currentTarget.dataset.markId;
      if (!markId)
        return;
      const markedDocuments = Helpers.getMarkIdDocuments(markId);
      if (!markedDocuments)
        return;
      const { scene, target, item } = markedDocuments;
      if (!scene || !target)
        return;
      yield this.object.setMarks(target, by, { scene, item });
    });
  }
  _onMarksDelete(event) {
    return __async(this, null, function* () {
      var _a;
      event.stopPropagation();
      if (this.object.isIC() && this.object.hasHost()) {
        return (_a = ui.notifications) == null ? void 0 : _a.info(game.i18n.localize("SR5.Infos.CantModifyHostContent"));
      }
      const markId = event.currentTarget.dataset.markId;
      if (!markId)
        return;
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      yield this.object.clearMark(markId);
    });
  }
  _onMarksClearAll(event) {
    return __async(this, null, function* () {
      var _a;
      event.stopPropagation();
      if (this.object.isIC() && this.object.hasHost()) {
        return (_a = ui.notifications) == null ? void 0 : _a.info(game.i18n.localize("SR5.Infos.CantModifyHostContent"));
      }
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      yield this.object.clearMarks();
    });
  }
  _prepareSkillsWithFilters(data) {
    this._filterActiveSkills(data);
    this._filterKnowledgeSkills(data);
    this._filterLanguageSkills(data);
  }
  _filterSkills(data, skills) {
    const filteredSkills = {};
    for (let [key, skill] of Object.entries(skills)) {
      if (skill.hidden) {
        continue;
      }
      if (this._showSkill(key, skill, data)) {
        filteredSkills[key] = skill;
      }
    }
    return Helpers.sortSkills(filteredSkills);
  }
  _showSkill(key, skill, data) {
    if (this._showMagicSkills(key, skill, data)) {
      return true;
    }
    if (this._showResonanceSkills(key, skill, data)) {
      return true;
    }
    return this._showGeneralSkill(key, skill);
  }
  _showGeneralSkill(skillId, skill) {
    return !this._isSkillMagic(skillId, skill) && !this._isSkillResonance(skill) && this._isSkillFiltered(skillId, skill);
  }
  _showMagicSkills(skillId, skill, data) {
    return this._isSkillMagic(skillId, skill) && data.data.special === "magic" && this._isSkillFiltered(skillId, skill);
  }
  _showResonanceSkills(skillId, skill, data) {
    return this._isSkillResonance(skill) && data.data.special === "resonance" && this._isSkillFiltered(skillId, skill);
  }
  _isSkillFiltered(skillId, skill) {
    const isFilterable = this._getSkillLabelOrName(skill).length > 0;
    const isHiddenForText = !this._doesSkillContainText(skillId, skill, this._filters.skills);
    const isHiddenForUntrained = !this._filters.showUntrainedSkills && skill.value === 0;
    return !(isFilterable && (isHiddenForUntrained || isHiddenForText));
  }
  _getSkillLabelOrName(skill) {
    return Helpers.getSkillLabelOrName(skill);
  }
  _doesSkillContainText(key, skill, text) {
    if (!text) {
      return true;
    }
    const name = this._getSkillLabelOrName(skill);
    const searchKey = skill.name === void 0 ? key : "";
    const specs = skill.specs !== void 0 && Array.isArray(skill.specs) ? skill.specs.join(" ") : "";
    let searchString = `${searchKey} ${name} ${specs}`;
    return searchString.toLowerCase().search(text.toLowerCase()) > -1;
  }
  _filterKnowledgeSkills(data) {
    Object.keys(SR5.knowledgeSkillCategories).forEach((category) => {
      if (!data.data.skills.knowledge.hasOwnProperty(category)) {
        console.warn(`Knowledge Skill doesn't provide configured category ${category}`);
        return;
      }
      data.data.skills.knowledge[category].value = this._filterSkills(data, data.data.skills.knowledge[category].value);
    });
  }
  _filterLanguageSkills(data) {
    data.data.skills.language.value = this._filterSkills(data, data.data.skills.language.value);
  }
  _filterActiveSkills(data) {
    data.data.skills.active = this._filterSkills(data, data.data.skills.active);
  }
  _isSkillMagic(id, skill) {
    return skill.attribute === "magic" || id === "astral_combat" || id === "assensing";
  }
  _isSkillResonance(skill) {
    return skill.attribute === "resonance";
  }
  _onFilterUntrainedSkills(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      this._filters.showUntrainedSkills = !this._filters.showUntrainedSkills;
      yield this.render();
    });
  }
  _onFilterSkills(event) {
    return __async(this, null, function* () {
      if (this._delays.skills)
        clearTimeout(this._delays.skills);
      this._delays.skills = setTimeout(() => {
        this._filters.skills = event.currentTarget.value;
        this.render();
      }, game.shadowrun5e.inputDelay);
    });
  }
  _onRollSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const skillId = Helpers.listItemId(event);
      return this.actor.rollSkill(skillId, { event });
    });
  }
  _onRollSkillSpec(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const skillId = Helpers.listItemId(event);
      return this.actor.rollSkill(skillId, { event, specialization: true });
    });
  }
  _onShowEditSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const skill = Helpers.listItemId(event);
      if (!skill) {
        return console.error(`Shadowrun 5e | Editing knowledge skill failed due to missing skill ${skill} id`);
      }
      yield this._showSkillEditForm(SkillEditSheet, this.actor, { event }, skill);
    });
  }
  _showSkillEditForm(skillEditFormImplementation, actor, options, ...args) {
    return __async(this, null, function* () {
      yield this._closeOpenSkillApp();
      const skillEditForm = new skillEditFormImplementation(actor, options, ...args);
      globalSkillAppId = skillEditForm.appId;
      yield skillEditForm.render(true);
    });
  }
  _onShowEditKnowledgeSkill(event) {
    event.preventDefault();
    const [skill, category] = Helpers.listItemId(event).split(".");
    if (!skill || !category) {
      return console.error(`Shadowrun 5e | Editing knowledge skill failed due to missing skill ${skill} or category id ${category}`);
    }
    this._showSkillEditForm(KnowledgeSkillEditSheet, this.actor, {
      event
    }, skill, category);
  }
  _onShowEditLanguageSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const skill = Helpers.listItemId(event);
      if (!skill) {
        return console.error(`Shadowrun 5e | Editing knowledge skill failed due to missing skill ${skill} id`);
      }
      yield this._showSkillEditForm(LanguageSkillEditSheet, this.actor, { event }, skill);
    });
  }
  _closeOpenSkillApp() {
    return __async(this, null, function* () {
      if (globalSkillAppId !== -1) {
        if (ui.windows[globalSkillAppId]) {
          yield ui.windows[globalSkillAppId].close();
        }
        globalSkillAppId = -1;
      }
    });
  }
  _onAddLanguageSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const skillId = yield this.actor.addLanguageSkill({ name: "" });
      if (!skillId)
        return;
    });
  }
  _onRemoveLanguageSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      const skillId = Helpers.listItemId(event);
      yield this.actor.removeLanguageSkill(skillId);
    });
  }
  _onAddKnowledgeSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const category = Helpers.listItemId(event);
      const skillId = yield this.actor.addKnowledgeSkill(category);
      if (!skillId)
        return;
    });
  }
  _onRemoveKnowledgeSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      const [skillId, category] = Helpers.listItemId(event).split(".");
      yield this.actor.removeKnowledgeSkill(skillId, category);
    });
  }
  _onAddActiveSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const skillId = yield this.actor.addActiveSkill();
      if (!skillId)
        return;
      yield this._showSkillEditForm(SkillEditSheet, this.actor, { event }, skillId);
    });
  }
  _onRemoveActiveSkill(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      const skillId = Helpers.listItemId(event);
      yield this.actor.removeActiveSkill(skillId);
    });
  }
  _onRollAttribute(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const attribute = event.currentTarget.closest(".attribute").dataset.attribute;
      return this.actor.rollAttribute(attribute, { event });
    });
  }
  _onRollCellInput(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      let track = $(event.currentTarget).closest(".horizontal-cell-input").data().id;
      switch (track) {
        case "stun":
          yield this.actor.rollGeneralAction("natural_recovery_stun", { event });
          break;
        case "physical":
          yield this.actor.rollGeneralAction("natural_recovery_physical", { event });
          break;
        case "edge":
          yield this.actor.rollAttribute("edge", { event });
          break;
      }
    });
  }
  _onShowHiddenSkills(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      yield this.actor.showHiddenSkills();
    });
  }
  _onOpenSourcePDF(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const field = $(event.currentTarget).parents(".list-item");
      const iid = $(field).data().itemId;
      const item = this.actor.items.get(iid);
      if (item) {
        yield item.openPdfSource();
      }
    });
  }
  _addDragSupportToListItemTemplatePartial(i, item) {
    if (item.dataset && item.dataset.itemId) {
      item.setAttribute("draggable", true);
      item.addEventListener("dragstart", this._onDragStart.bind(this), false);
    }
  }
  _onListItemChangeQuantity(event) {
    return __async(this, null, function* () {
      const iid = Helpers.listItemId(event);
      const item = this.actor.items.get(iid);
      const qty = parseInt(event.currentTarget.value);
      if (item && qty && "technology" in item.data.data) {
        item.data.data.technology.quantity = qty;
        yield item.update({ "data.technology.quantity": qty });
      }
    });
  }
  _onListItemChangeRating(event) {
    return __async(this, null, function* () {
      const iid = Helpers.listItemId(event);
      const item = this.actor.items.get(iid);
      const rtg = parseInt(event.currentTarget.value);
      if (item && rtg) {
        yield item.update({ "data.technology.rating": rtg });
      }
    });
  }
  _onListItemToggleEquipped(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const iid = Helpers.listItemId(event);
      const item = this.actor.items.get(iid);
      if (item) {
        const newItems = [];
        if (item.isDevice()) {
          for (const item2 of this.actor.items.filter((actorItem) => actorItem.isDevice())) {
            newItems.push({
              "_id": item2.id,
              "data.technology.equipped": item2.id === iid
            });
          }
        } else {
          newItems.push({
            "_id": iid,
            "data.technology.equipped": !item.isEquipped()
          });
        }
        yield this.actor.updateEmbeddedDocuments("Item", newItems);
        this.actor.render(false);
      }
    });
  }
  _onListItemToggleDescriptionVisibility(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const item = $(event.currentTarget).parents(".list-item");
      const iid = $(item).data().item;
      const field = item.next();
      field.toggle();
      if (iid) {
        if (field.is(":visible"))
          this._shownDesc.push(iid);
        else
          this._shownDesc = this._shownDesc.filter((val) => val !== iid);
      }
    });
  }
  _onInventoryCreate(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      $("#input-inventory").val("");
      yield this._onInplaceInventoryEdit(event, "create");
    });
  }
  _onInventoryRemove(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const userConsented = yield Helpers.confirmDeletion();
      if (!userConsented)
        return;
      yield this.document.inventory.remove(this.selectedInventory);
      this.selectedInventory = this.document.defaultInventory.name;
      this.render();
    });
  }
  _onInplaceInventoryEdit(event, action = "edit") {
    return __async(this, null, function* () {
      var _a;
      event.preventDefault();
      if (action === "edit" && this.selectedInventory === this.document.defaultInventory.name)
        return (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.Warnings.CantEditDefaultInventory"));
      $(".selection-inventory").hide();
      $(".inline-input-inventory").show();
      $("#input-inventory").data("action", action).select();
    });
  }
  _onInplaceInventoryEditCancel(event) {
    return __async(this, null, function* () {
      if (event.type === "keydown" && event.code !== "Escape")
        return;
      event.preventDefault();
      $(".selection-inventory").show();
      $(".inline-input-inventory").hide();
      $("#input-inventory").data("action", void 0).val(this.selectedInventory);
    });
  }
  _onInplaceInventoryEditSave(event) {
    return __async(this, null, function* () {
      if (event.type === "keydown" && event.code !== "Enter")
        return;
      event.preventDefault();
      const inputElement = $("#input-inventory");
      const action = inputElement.data("action");
      let inventory = String(inputElement.val());
      if (!inventory)
        return;
      switch (action) {
        case "edit":
          yield this.document.inventory.rename(this.selectedInventory, inventory);
          break;
        case "create":
          yield this.document.inventory.create(inventory);
          break;
      }
      yield this._onInplaceInventoryEditCancel(event);
      this.selectedInventory = inventory;
      this.render();
    });
  }
  _onSelectInventory(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const inventory = String($(event.currentTarget).val());
      if (inventory)
        this.selectedInventory = inventory;
      this.render();
    });
  }
  _onItemMoveToInventory(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const itemId = Helpers.listItemId(event);
      const item = this.document.items.get(itemId);
      if (!item)
        return;
      const dialog = new MoveInventoryDialog(this.document, this.selectedInventory);
      const inventory = yield dialog.select();
      if (dialog.canceled)
        return;
      yield this.document.inventory.addItems(inventory, item);
    });
  }
  _onInventoryChangePreventSheetSubmit(event) {
    event.stopPropagation();
  }
  _onReloadAmmo(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      const iid = Helpers.listItemId(event);
      const item = this.actor.items.get(iid);
      if (item)
        return item.reloadAmmo();
    });
  }
  _onMatrixAttributeSelected(event) {
    return __async(this, null, function* () {
      if (!("matrix" in this.actor.data.data))
        return;
      let iid = this.actor.data.data.matrix.device;
      let item = this.actor.items.get(iid);
      if (!item) {
        console.error("could not find item");
        return;
      }
      let att = event.currentTarget.dataset.att;
      let deviceAtt = event.currentTarget.value;
      const deviceData = item.data.data;
      let oldVal = deviceData.atts[deviceAtt].att;
      let data = {
        _id: iid
      };
      for (let i = 1; i <= 4; i++) {
        let tmp = `att${i}`;
        let key = `data.atts.att${i}.att`;
        if (tmp === deviceAtt) {
          data[key] = att;
        } else if (deviceData.atts[`att${i}`].att === att) {
          data[key] = oldVal;
        }
      }
      yield this.actor.updateEmbeddedDocuments("Item", [data]);
    });
  }
  _onShowImportCharacter(event) {
    event.preventDefault();
    const options = {
      name: "chummer-import",
      title: "Chummer Import"
    };
    new ChummerImportForm(this.actor, options).render(true);
  }
  _setupCustomCheckbox(html) {
    const setContent = (el) => {
      const checkbox = $(el).children("input[type=checkbox]");
      const checkmark = $(el).children(".checkmark");
      if ($(checkbox).prop("checked")) {
        $(checkmark).addClass("fa-check-circle");
        $(checkmark).removeClass("fa-circle");
      } else {
        $(checkmark).addClass("fa-circle");
        $(checkmark).removeClass("fa-check-circle");
      }
    };
    html.find("label.checkbox").each(function() {
      setContent(this);
    });
    html.find("label.checkbox").click((event) => setContent(event.currentTarget));
    html.find(".submit-checkbox").change((event) => this._onSubmit(event));
  }
};

// src/module/actor/sheets/SR5ICActorSheet.ts
var SR5ICActorSheet = class extends SR5BaseActorSheet {
  getHandledItemTypes() {
    return super.getHandledItemTypes();
  }
  getData(options) {
    return __async(this, null, function* () {
      const data = yield __superGet(SR5ICActorSheet.prototype, this, "getData").call(this, options);
      data.host = this.object.getICHost();
      data.markedDocuments = this.object.getAllMarkedDocuments();
      data.disableMarksEdit = this.object.hasHost();
      return data;
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".entity-remove").on("click", this._removeHost.bind(this));
  }
  _removeHost(event) {
    return __async(this, null, function* () {
      event.stopPropagation();
      yield this.object.removeICHost();
    });
  }
  _onDrop(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      if (!event.dataTransfer)
        return;
      const dropData = JSON.parse(event.dataTransfer.getData("text/plain"));
      switch (dropData.type) {
        case "Item":
          return yield this.object.addICHost(dropData.id);
      }
      return __superGet(SR5ICActorSheet.prototype, this, "_onDrop").call(this, event);
    });
  }
};

// src/module/effect/SR5ActiveEffect.ts
var SR5ActiveEffect = class extends ActiveEffect {
  get isOriginOwned() {
    if (!this.origin)
      return false;
    const path = this.origin.split(".");
    if (path[0] === "Scene" && path.length === 6)
      return true;
    if (path[0] === "Actor" && path.length === 4)
      return true;
    return false;
  }
  get source() {
    return this.origin ? fromUuid(this.origin) : null;
  }
  renderSourceSheet() {
    return __async(this, null, function* () {
      var _a;
      const document2 = yield this.source;
      return (_a = document2 == null ? void 0 : document2.sheet) == null ? void 0 : _a.render(true);
    });
  }
  toggleDisabled() {
    return __async(this, null, function* () {
      return this.update({ disabled: !this.disabled });
    });
  }
  disable(disabled) {
    return __async(this, null, function* () {
      return this.update({ disabled });
    });
  }
  _applyCustom(actor, change, current, delta, changes) {
    return this._applyModify(actor, change, current, delta, changes);
  }
  _applyModify(actor, change, current, delta, changes) {
    if (this._isKeyModifiableValue(actor, change.key)) {
      const value = foundry.utils.getProperty(actor.data, change.key);
      value.mod.push({ name: this.label, value: Number(change.value) });
      return null;
    }
    const nodes = change.key.split(".");
    nodes.pop();
    const indirectKey = nodes.join(".");
    if (this._isKeyModifiableValue(actor, indirectKey)) {
      const value = foundry.utils.getProperty(actor.data, indirectKey);
      value.mod.push({ name: this.label, value: Number(change.value) });
      return null;
    }
    return super._applyAdd(actor, change, current, delta, changes);
  }
  _applyOverride(actor, change, current, delta, changes) {
    if (this._isKeyModifiableValue(actor, change.key)) {
      const value = foundry.utils.getProperty(actor.data, change.key);
      value.override = { name: this.label, value: Number(change.value) };
      value.value = change.value;
      return null;
    }
    const nodes = change.key.split(".");
    nodes.pop();
    const indirectKey = nodes.join(".");
    if (this._isKeyModifiableValue(actor, indirectKey)) {
      const value = foundry.utils.getProperty(actor.data, indirectKey);
      value.override = { name: this.label, value: Number(change.value) };
      return null;
    }
    return super._applyOverride(actor, change, current, delta, changes);
  }
  _isKeyModifiableValue(actor, key) {
    const possibleValue = foundry.utils.getProperty(actor.data, key);
    const possibleValueType = foundry.utils.getType(possibleValue);
    return possibleValue && possibleValueType === "Object" && Helpers.objectHasKeys(possibleValue, this.minValueKeys);
  }
  get minValueKeys() {
    return ["value", "mod"];
  }
};
SR5ActiveEffect.LOG_V10_COMPATIBILITY_WARNINGS = false;

// src/module/effect/SR5ActiveEffectConfig.ts
var SR5ActiveEffectConfig = class extends ActiveEffectConfig {
  get template() {
    return "systems/shadowrun5e/dist/templates/effect/active-effect-config.html";
  }
  getData(options) {
    const data = super.getData(options);
    data.modes = __spreadProps(__spreadValues({}, data.modes), { 0: game.i18n.localize("SR5.ActiveEffect.Modes.Modify") });
    return data;
  }
};

// src/module/actor/sheets/SR5VehicleActorSheet.ts
var SR5VehicleActorSheet = class extends SR5BaseActorSheet {
  getHandledItemTypes() {
    let itemTypes = super.getHandledItemTypes();
    return [
      ...itemTypes,
      "program"
    ];
  }
  getInventoryItemTypes() {
    const itemTypes = super.getInventoryItemTypes();
    return [
      ...itemTypes,
      "weapon",
      "ammo",
      "armor",
      "bioware",
      "cyberware",
      "device",
      "equipment",
      "modification"
    ];
  }
  getData(options) {
    return __async(this, null, function* () {
      const data = yield __superGet(SR5VehicleActorSheet.prototype, this, "getData").call(this, options);
      data.vehicle = this._prepareVehicleFields();
      return data;
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".driver-remove").on("click", this._handleRemoveVehicleDriver.bind(this));
  }
  _onDrop(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      event.stopPropagation();
      if (!event.dataTransfer)
        return;
      const dropData = JSON.parse(event.dataTransfer.getData("text/plain"));
      switch (dropData.type) {
        case "Actor":
          return yield this.actor.addVehicleDriver(dropData.id);
      }
      return __superGet(SR5VehicleActorSheet.prototype, this, "_onDrop").call(this, event);
    });
  }
  _prepareVehicleFields() {
    const driver = this.actor.getVehicleDriver();
    return {
      driver
    };
  }
  _handleRemoveVehicleDriver(event) {
    return __async(this, null, function* () {
      event.preventDefault();
      yield this.actor.removeVehicleDriver();
    });
  }
};

// src/module/actor/sheets/SR5CharacterSheet.ts
var SR5CharacterSheet = class extends SR5BaseActorSheet {
  getHandledItemTypes() {
    let itemTypes = super.getHandledItemTypes();
    return [
      ...itemTypes,
      "program",
      "sin",
      "lifestyle",
      "contact",
      "spell",
      "adept_power",
      "complex_form",
      "quality",
      "critter_power"
    ];
  }
  getInventoryItemTypes() {
    const itemTypes = super.getInventoryItemTypes();
    return [
      ...itemTypes,
      "weapon",
      "ammo",
      "armor",
      "bioware",
      "cyberware",
      "device",
      "equipment",
      "modification"
    ];
  }
  getData(options) {
    return __async(this, null, function* () {
      const data = yield __superGet(SR5CharacterSheet.prototype, this, "getData").call(this, options);
      __superGet(SR5CharacterSheet.prototype, this, "_prepareMatrixAttributes").call(this, data);
      data["markedDocuments"] = this.object.getAllMarkedDocuments();
      return data;
    });
  }
};

// src/module/actor/sheets/SR5SpiritActorSheet.ts
var SR5SpiritActorSheet = class extends SR5BaseActorSheet {
  getHandledItemTypes() {
    let itemTypes = super.getHandledItemTypes();
    return [
      ...itemTypes,
      "critter_power",
      "spell",
      "quality"
    ];
  }
};

// src/module/actor/sheets/SR5SpriteActorSheet.ts
var SR5SpriteActorSheet = class extends SR5BaseActorSheet {
  getHandledItemTypes() {
    let itemTypes = super.getHandledItemTypes();
    return [
      ...itemTypes,
      "sprite_power"
    ];
  }
};

// src/module/rules/FireModeRules.ts
var FireModeRules = {
  fireModeDefenseModifier: function(fireMode, ammo = 0) {
    const rounds = fireMode.value < 0 ? fireMode.value * -1 : fireMode.value;
    const modifier = Number(fireMode.defense);
    if (modifier === 0)
      return 0;
    if (ammo <= 0)
      ammo = rounds;
    if (ammo >= rounds)
      return modifier;
    return Math.min(modifier + rounds - ammo, 0);
  },
  recoilAttackModifier: function(fireMode, compensation, ammo = 0) {
    if (!fireMode.recoil)
      return { compensation, recoilModifier: 0 };
    if (ammo <= 0)
      ammo = fireMode.value;
    const rounds = Math.min(fireMode.value, ammo);
    const recoilModifier = Math.min(compensation - rounds, 0);
    compensation = Math.max(compensation - rounds, 0);
    return { compensation, recoilModifier };
  },
  availableFireModes: function(rangedWeaponModes, rounds) {
    return SR5.fireModes.filter((fireMode) => rangedWeaponModes[fireMode.mode]).sort((modeA, modeB) => {
      if (modeA.mode === modeB.mode) {
        return modeA.value - modeB.value;
      }
      const modeAIndex = SR5.rangeWeaponMode.indexOf(modeA.mode);
      const modeBIndex = SR5.rangeWeaponMode.indexOf(modeB.mode);
      return modeAIndex > modeBIndex ? 1 : -1;
    });
  }
};

// src/module/tests/RangedAttackTest.ts
var RangedAttackTest = class extends SuccessTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.fireModes = [];
    data.fireMode = { value: 0, defense: 0, label: "" };
    data.ranges = {};
    data.range = 0;
    data.targetRanges = [];
    data.targetRangesSelected = 0;
    data.recoilCompensation = 0;
    data.damage = data.damage || DefaultValues.damageData();
    return data;
  }
  get canBeExtended() {
    return false;
  }
  _prepareFireMode() {
    var _a;
    const weaponData = this.item.asWeapon();
    if (!weaponData)
      return;
    this.data.fireModes = FireModeRules.availableFireModes(weaponData.system.range.modes);
    if (this.data.fireModes.length === 0) {
      this.data.fireModes.push(SR5.fireModes[0]);
      (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.Warnings.NoFireModeConfigured", { localize: true });
    }
    const lastFireMode = this.item.getLastFireMode() || DefaultValues.fireModeData();
    this.data.fireModeSelected = this.data.fireModes.findIndex((available) => lastFireMode.label === available.label);
    if (this.data.fireModeSelected == -1)
      this.data.fireModeSelected = 0;
    this.data.fireMode = this.data.fireModes[this.data.fireModeSelected];
  }
  _prepareWeaponRanges() {
    return __async(this, null, function* () {
      var _a;
      const itemData = (_a = this.item) == null ? void 0 : _a.asWeapon();
      if (!itemData)
        return;
      const { ranges } = itemData.data.range;
      const { range_modifiers } = SR.combat.environmental;
      const newRanges = {};
      for (const [key, value] of Object.entries(ranges)) {
        const distance = value;
        newRanges[key] = Helpers.createRangeDescription(SR5.weaponRanges[key], distance, range_modifiers[key]);
      }
      this.data.ranges = newRanges;
      const actor = this.actor;
      if (!actor)
        return;
      const modifiers = yield actor.getModifiers();
      this.data.range = modifiers.environmental.active.range || 0;
    });
  }
  _prepareTargetRanges() {
    return __async(this, null, function* () {
      var _a;
      if (foundry.utils.isEmpty(this.data.ranges))
        return;
      if (!this.actor)
        return;
      if (!this.hasTargets)
        return;
      const attacker = this.actor.getToken();
      if (!attacker) {
        (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.TargetingNeedsActorWithToken"));
        return [];
      }
      this.data.targetRanges = this.targets.map((target) => {
        const distance = Helpers.measureTokenDistance(attacker, target);
        const range = Helpers.getWeaponRange(distance, this.data.ranges);
        return {
          uuid: target.uuid,
          name: target.name || "",
          unit: LENGTH_UNIT,
          range,
          distance
        };
      });
      this.data.targetRanges = this.data.targetRanges.sort((a, b) => {
        if (a.distance < b.distance)
          return -1;
        if (a.distance > b.distance)
          return 1;
        return 0;
      });
      const modifiers = yield this.actor.getModifiers();
      this.data.range = modifiers.environmental.active.range || this.data.targetRanges[0].range.modifier;
    });
  }
  _prepareRecoilCompensation() {
    var _a;
    this.data.recoilCompensation = ((_a = this.item) == null ? void 0 : _a.getRecoilCompensation(true)) || 0;
  }
  get testModifiers() {
    return ["global", "wounds", "environmental"];
  }
  prepareDocumentData() {
    return __async(this, null, function* () {
      yield this._prepareWeaponRanges();
      yield this._prepareTargetRanges();
      this._prepareFireMode();
      this._prepareRecoilCompensation();
      yield __superGet(RangedAttackTest.prototype, this, "prepareDocumentData").call(this);
    });
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/ranged-attack-test-dialog.html";
  }
  get _opposedTestClass() {
    if (this.data.fireMode.suppression)
      return TestCreator._getTestClass(SR5.supressionDefenseTest);
    return super._opposedTestClass;
  }
  saveUserSelectionAfterDialog() {
    return __async(this, null, function* () {
      if (!this.item)
        return;
      yield this.item.setLastFireMode(this.data.fireMode);
      if (!this.actor)
        return;
      const modifiers = yield this.actor.getModifiers();
      modifiers.activateEnvironmentalCategory("range", this.data.range);
      yield this.actor.setModifiers(modifiers);
    });
  }
  prepareBaseValues() {
    if (!this.actor)
      return;
    if (!this.item)
      return;
    const poolMods = new PartsList(this.data.modifiers.mod);
    const { fireModes, fireModeSelected, recoilCompensation } = this.data;
    this.data.fireMode = fireModes[fireModeSelected];
    this.data.fireMode.defense = FireModeRules.fireModeDefenseModifier(this.data.fireMode, this.item.ammoLeft);
    const { compensation, recoilModifier } = FireModeRules.recoilAttackModifier(this.data.fireMode, recoilCompensation, this.item.ammoLeft);
    poolMods.addUniquePart("SR5.Recoil", recoilModifier);
    if (this.hasTargets) {
      this.data.targetRangesSelected = Number(this.data.targetRangesSelected);
      const target = this.data.targetRanges[this.data.targetRangesSelected];
      this.data.range = target.range.modifier;
      this.data.targetActorsUuid = this.data.targetActorsUuid.filter((uuid) => uuid === target.uuid);
    }
    this.data.range = Number(this.data.range);
    const range = this.hasTargets ? this.data.targetRanges[this.data.targetRangesSelected].range.modifier : this.data.range;
    const modifiers = Modifiers.getModifiersFromEntity(this.actor);
    modifiers.activateEnvironmentalCategory("range", Number(range));
    const environmental = modifiers.environmental.total;
    poolMods.addUniquePart(SR5.modifierTypes.environmental, environmental);
    super.prepareBaseValues();
  }
  canConsumeDocumentRessources() {
    var _a;
    if (!this.item.isRangedWeapon())
      return true;
    const fireMode = this.data.fireMode;
    if (fireMode.value === 0)
      return true;
    if (!this.item.hasAmmo(1)) {
      (_a = ui.notifications) == null ? void 0 : _a.error("SR5.MissingRessource.Ammo", { localize: true });
      return false;
    }
    return super.canConsumeDocumentRessources();
  }
  consumeDocumentRessources() {
    return __async(this, null, function* () {
      if (!(yield __superGet(RangedAttackTest.prototype, this, "consumeDocumentRessources").call(this)))
        return false;
      if (!(yield this.consumeWeaponAmmo()))
        return false;
      return true;
    });
  }
  consumeWeaponAmmo() {
    return __async(this, null, function* () {
      var _a;
      if (!this.item)
        return true;
      if (!this.item.isRangedWeapon())
        return true;
      const fireMode = this.data.fireMode;
      if (fireMode.value === 0)
        return true;
      if (!this.item.hasAmmo(fireMode.value)) {
        (_a = ui.notifications) == null ? void 0 : _a.warn("SR5.MissingRessource.SomeAmmo", { localize: true });
      }
      yield this.item.useAmmo(fireMode.value);
      return true;
    });
  }
};

// src/module/apps/dialogs/ShadowrunActorDialogs.ts
var ShadowrunActorDialogs = class {
  static createDefenseDialog(actor, options, partsProps) {
    return __async(this, null, function* () {
      const defenseDialogData = ShadowrunActorDialogs.getDefenseDialogData(actor, options, partsProps);
      return new FormDialog(defenseDialogData);
    });
  }
  static createSoakDialog(options, soakParts) {
    return __async(this, null, function* () {
      const soakDialogData = ShadowrunActorDialogs.getSoakDialogData(options, soakParts);
      return new FormDialog(soakDialogData);
    });
  }
  static createSkillDialog(actor, options, partsProps) {
    return __async(this, null, function* () {
      const skillDialogData = ShadowrunActorDialogs.getSkillDialogData(actor, options, partsProps);
      return new FormDialog(skillDialogData);
    });
  }
  static getDefenseDialogData(actor, options, partsProps) {
    var _a, _b, _c, _d;
    const title = game.i18n.localize("SR5.Defense");
    const activeDefenses = {
      full_defense: {
        label: "SR5.FullDefense",
        value: (_a = actor.getFullDefenseAttribute()) == null ? void 0 : _a.value,
        initMod: -10
      },
      dodge: {
        label: "SR5.Dodge",
        value: (_b = actor.findActiveSkill("gymnastics")) == null ? void 0 : _b.value,
        initMod: -5
      },
      block: {
        label: "SR5.Block",
        value: (_c = actor.findActiveSkill("unarmed_combat")) == null ? void 0 : _c.value,
        initMod: -5
      }
    };
    const equippedMeleeWeapons = actor.getEquippedWeapons().filter((w) => w.isMeleeWeapon());
    let defenseReach = 0;
    equippedMeleeWeapons.forEach((weapon) => {
      var _a2;
      activeDefenses[`parry-${weapon.name}`] = {
        label: "SR5.Parry",
        weapon: weapon.name,
        value: (_a2 = actor.findActiveSkill(weapon.getActionSkill())) == null ? void 0 : _a2.value,
        init: -5
      };
      defenseReach = Math.max(defenseReach, weapon.getReach());
    });
    const parts = new PartsList(partsProps);
    actor._addDefenseParts(parts);
    if ((_d = options.attack) == null ? void 0 : _d.reach) {
      const incomingReach = options.attack.reach;
      const netReach = defenseReach - incomingReach;
      if (netReach !== 0) {
        parts.addUniquePart("SR5.Reach", netReach);
      }
    }
    const buttons = {
      continue: {
        label: game.i18n.localize("SR5.Continue"),
        callback: () => {
        }
      }
    };
    const onAfterClose = (html) => {
      const cover = Helpers.parseInputToNumber($(html).find("[name=cover]").val());
      const special = Helpers.parseInputToString($(html).find("[name=activeDefense]").val());
      const combat = {};
      if (cover) {
        parts.addUniquePart("SR5.Cover", cover);
      }
      if (special) {
        const defense = activeDefenses[special];
        parts.addUniquePart(defense.label, defense.value);
        combat.initiative = defense.initMod;
      }
      return { cover, special, parts, combat };
    };
    const templatePath = "systems/shadowrun5e/dist/templates/rolls/roll-defense.html";
    const templateData = {
      parts: parts.getMessageOutput(),
      cover: options.cover,
      activeDefenses
    };
    return {
      title,
      templateData,
      templatePath,
      buttons,
      onAfterClose
    };
  }
  static getSoakDialogData(soakRollOptions, soakParts) {
    const title = game.i18n.localize("SR5.DamageResistanceTest");
    const templatePath = "systems/shadowrun5e/dist/templates/rolls/roll-soak.html";
    const templateData = {
      damage: soakRollOptions == null ? void 0 : soakRollOptions.damage,
      parts: soakParts.getMessageOutput(),
      elementTypes: SR5.elementTypes,
      damageTypes: SR5.damageTypes
    };
    const buttons = {
      continue: {
        label: game.i18n.localize("SR5.Continue"),
        callback: () => {
        }
      }
    };
    const onAfterClose = (html) => {
      const incomingDamage = Helpers.parseInputToNumber($(html).find("[name=incomingDamage]").val());
      const ap = Helpers.parseInputToNumber($(html).find("[name=ap]").val());
      const element = Helpers.parseInputToString($(html).find("[name=element]").val());
      const damageType = Helpers.parseInputToString($(html).find("[name=damageType]").val());
      return { incomingDamage, damageType, ap, element };
    };
    return {
      title,
      templatePath,
      templateData,
      buttons,
      onAfterClose
    };
  }
  static getSkillDialogData(actor, options, partsProps) {
    var _a;
    const title = game.i18n.localize(options.skill.label || options.skill.name);
    const templatePath = "systems/shadowrun5e/dist/templates/rolls/skill-roll.html";
    const attributes = actor.getAttributes();
    const attribute = actor.getAttribute(options.attribute ? options.attribute : options.skill.attribute);
    const limits = actor.getLimits();
    const templateData = {
      attribute: options.skill.attribute,
      attributes: Helpers.filter(attributes, ([, value]) => value.value > 0),
      limit: attribute.limit,
      limits
    };
    const buttons = {
      roll: {
        label: game.i18n.localize("SR5.NormalSkillButton"),
        callback: () => {
        }
      }
    };
    if ((_a = options.skill.specs) == null ? void 0 : _a.length) {
      options.skill.specs.forEach((spec) => buttons[spec] = {
        label: spec,
        callback: () => {
        }
      });
    }
    const onAfterClose = (html, selectedButton) => {
      const newAtt = Helpers.parseInputToString($(html).find('[name="attribute"]').val());
      const newLimit = Helpers.parseInputToString($(html).find('[name="attribute.limit"]').val());
      const attribute2 = actor.getAttribute(newAtt);
      const limit = actor.getLimit(newLimit);
      const skillLabel = game.i18n.localize(options.skill.label || options.skill.name);
      const attributeLabel = game.i18n.localize(SR5.attributes[newAtt]);
      const testLabel = game.i18n.localize("SR5.Test");
      const skillTestTitle = `${skillLabel} + ${attributeLabel} ${testLabel}`;
      partsProps.addUniquePart(attribute2.label, attribute2.value);
      SkillFlow.handleDefaulting(options.skill, partsProps);
      const isSpecialization = options.skill.specs.includes(selectedButton);
      if (isSpecialization) {
        partsProps.addUniquePart("SR5.Specialization", 2);
      }
      return {
        title: skillTestTitle,
        attribute: attribute2,
        limit,
        skill: options.skill,
        parts: partsProps
      };
    };
    return {
      title,
      templatePath,
      templateData,
      buttons,
      onAfterClose
    };
  }
};

// src/module/actor/flows/SoakFlow.ts
var SoakFlow = class {
  runSoakTest(_0, _1) {
    return __async(this, arguments, function* (actor, soakRollOptions, partsProps = []) {
    });
  }
  knocksDown(damage, actor) {
    const gelRoundsEffect = this.isDamageFromGelRounds(damage) ? -2 : 0;
    const impactDispersionEffect = this.isDamageFromImpactDispersion(damage) ? -2 : 0;
    const limit = actor.getLimit("physical");
    const effectiveLimit = limit.value + gelRoundsEffect + impactDispersionEffect;
    const knockedDown = damage.value > effectiveLimit || damage.value >= 10;
    console.log(`Shadowrun5e | Determined target ${actor.id} knocked down status as: ${knockedDown}`, damage, actor);
    return knockedDown;
  }
  isDamageFromGelRounds(damage) {
    var _a;
    if (damage.source && damage.source.actorId && damage.source.itemId) {
      const attacker = (_a = game.actors) == null ? void 0 : _a.find((actor) => {
        var _a2;
        return actor.id == ((_a2 = damage.source) == null ? void 0 : _a2.actorId);
      });
      if (attacker) {
        const item = attacker.items.find((item2) => {
          var _a2;
          return item2.id == ((_a2 = damage.source) == null ? void 0 : _a2.itemId);
        });
        if (item) {
          return item.items.filter((mod) => {
            var _a2;
            return (_a2 = mod.getTechnologyData()) == null ? void 0 : _a2.equipped;
          }).filter((tech) => tech.name == game.i18n.localize("SR5.AmmoGelRounds")).length > 0;
        }
      }
    }
    return false;
  }
  isDamageFromImpactDispersion(damage) {
    return false;
  }
  promptDamageData(soakRollOptions, soakDefenseParts) {
    return __async(this, null, function* () {
      const damageDataDialog = yield ShadowrunActorDialogs.createSoakDialog(soakRollOptions, soakDefenseParts);
      const userData = yield damageDataDialog.select();
      if (damageDataDialog.canceled)
        return;
      const initialDamageData = (soakRollOptions == null ? void 0 : soakRollOptions.damage) ? soakRollOptions.damage : DefaultValues.damageData();
      return this.updateDamageWithUserData(initialDamageData, userData.incomingDamage, userData.damageType, userData.ap, userData.element);
    });
  }
  updateDamageWithUserData(initialDamageData, incomingDamage, damageType, ap, element) {
    const damageData = duplicate(initialDamageData);
    const totalDamage = Helpers.calcTotal(damageData);
    if (totalDamage !== incomingDamage) {
      const diff = incomingDamage - totalDamage;
      damageData.mod = PartsList.AddUniquePart(damageData.mod, "SR5.UserInput", diff);
      damageData.value = Helpers.calcTotal(damageData);
    }
    if (initialDamageData.type.base !== damageType) {
      damageData.type.base = damageType;
      damageData.type.value = damageType;
    }
    const totalAp = Helpers.calcTotal(damageData.ap);
    if (totalAp !== ap) {
      const diff = ap - totalAp;
      damageData.ap.mod = PartsList.AddUniquePart(damageData.ap.mod, "SR5.UserInput", diff);
      damageData.ap.value = Helpers.calcTotal(damageData.ap);
    }
    if (element) {
      damageData.element.value = element;
    }
    return damageData;
  }
};

// src/module/tests/PhysicalResistTest.ts
var PhysicalResistTest = class extends SuccessTest {
  _prepareData(data, options) {
    var _a;
    data = super._prepareData(data, options);
    data.incomingDamage = foundry.utils.duplicate(((_a = data.following) == null ? void 0 : _a.modifiedDamage) || DefaultValues.damageData());
    data.modifiedDamage = duplicate(data.incomingDamage);
    return data;
  }
  get _chatMessageTemplate() {
    return "systems/shadowrun5e/dist/templates/rolls/defense-test-message.html";
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/physical-resist-test-dialog.html";
  }
  get canBeExtended() {
    return false;
  }
  static _getDefaultTestAction() {
    return DefaultValues.minimalActionData({
      "attribute": "body",
      "armor": true
    });
  }
  get testModifiers() {
    return ["soak"];
  }
  applyPoolModifiers() {
    super.applyPoolModifiers();
    this.applyArmorPoolModifier();
  }
  applyArmorPoolModifier() {
    if (this.data.action.armor) {
      if (this.actor) {
        const armor = this.actor.getArmor(this.data.incomingDamage);
        this.data.pool.mod = PartsList.AddUniquePart(this.data.pool.mod, "SR5.Armor", armor.value);
      }
    }
  }
  calculateBaseValues() {
    super.calculateBaseValues();
    Helpers.calcTotal(this.data.incomingDamage, { min: 0 });
    Helpers.calcTotal(this.data.incomingDamage.ap);
    this.data.modifiedDamage = foundry.utils.duplicate(this.data.incomingDamage);
    this.data.modifiedDamage.base = this.data.incomingDamage.value;
    this.data.modifiedDamage.mod = [];
    delete this.data.modifiedDamage.override;
    this.data.modifiedDamage.ap.base = this.data.incomingDamage.ap.value;
    this.data.modifiedDamage.ap.mod = [];
    delete this.data.modifiedDamage.ap.override;
    Helpers.calcTotal(this.data.modifiedDamage);
    Helpers.calcTotal(this.data.modifiedDamage.ap);
  }
  get canSucceed() {
    return true;
  }
  get success() {
    return this.data.incomingDamage.value <= this.hits.value;
  }
  get successLabel() {
    return "SR5.ResistedAllDamage";
  }
  get failureLabel() {
    return "SR5.ResistedSomeDamage";
  }
  processResults() {
    return __async(this, null, function* () {
      yield __superGet(PhysicalResistTest.prototype, this, "processResults").call(this);
      if (!this.actor)
        return;
      this.data.modifiedDamage = CombatRules.modifyDamageAfterResist(this.actor, this.data.modifiedDamage, this.hits.value);
      this.data.knockedDown = new SoakFlow().knocksDown(this.data.modifiedDamage, this.actor);
    });
  }
};

// src/module/tests/MeleeAttackTest.ts
var MeleeAttackTest = class extends SuccessTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.damage = data.damage || DefaultValues.damageData();
    return data;
  }
  get canBeExtended() {
    return false;
  }
  get testModifiers() {
    return ["global", "wounds", "environmental"];
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/melee-attack-test-dialog.html";
  }
  prepareDocumentData() {
    return __async(this, null, function* () {
      if (!this.item || !this.item.isMeleeWeapon())
        return;
      this.data.reach = this.item.getReach();
      yield __superGet(MeleeAttackTest.prototype, this, "prepareDocumentData").call(this);
    });
  }
};

// src/module/rules/SpellcastingRules.ts
var SpellcastingRules = class {
  static calculateDrain(force, drainModifier, reckless = false) {
    const recklessModifier = reckless ? this.recklessDrainModifier : 0;
    const drain = force + drainModifier + recklessModifier;
    return Math.max(this.minimalDrain, drain);
  }
  static get minimalDrain() {
    return 2;
  }
  static get recklessDrainModifier() {
    return 3;
  }
  static calculateMinimalForce(drainModifier) {
    return Math.max(1, this.minimalDrain - drainModifier);
  }
  static calculateLimit(force) {
    return force;
  }
};

// src/module/rules/DrainRules.ts
var DrainRules = class {
  static calcDrainDamage(drain, force, magic, hits) {
    if (force < 0)
      force = 1;
    if (magic < 0)
      magic = 1;
    if (hits < 0)
      hits = 0;
    const damage = DefaultValues.damageData();
    damage.base = drain;
    Helpers.calcTotal(damage, { min: 0 });
    damage.type.base = damage.type.value = DrainRules.calcDrainDamageType(hits, magic);
    return damage;
  }
  static calcDrainDamageType(hits, magic) {
    if (hits < 0)
      hits = 0;
    if (magic < 0)
      magic = 1;
    return hits > magic ? "physical" : "stun";
  }
  static modifyDrainDamage(drainDamage, hits) {
    if (hits < 0)
      hits = 0;
    drainDamage = foundry.utils.duplicate(drainDamage);
    PartsList.AddUniquePart(drainDamage.mod, "SR5.Hits", -hits);
    Helpers.calcTotal(drainDamage, { min: 0 });
    return drainDamage;
  }
};

// src/module/tests/SpellCastingTest.ts
var SpellCastingTest = class extends SuccessTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.force = data.force || 0;
    data.drain = data.drain || 0;
    data.reckless = data.reckless || false;
    data.drainDamage = data.drainDamage || DefaultValues.damageData();
    return data;
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/spellcasting-test-dialog.html";
  }
  get _chatMessageTemplate() {
    return "systems/shadowrun5e/dist/templates/rolls/spellcasting-test-message.html";
  }
  get canBeExtended() {
    return false;
  }
  static _getDefaultTestAction() {
    return DefaultValues.minimalActionData({
      skill: "spellcasting",
      attribute: "magic"
    });
  }
  get testModifiers() {
    return ["global", "wounds"];
  }
  prepareDocumentData() {
    return __async(this, null, function* () {
      this.prepareInitialForceValue();
      yield __superGet(SpellCastingTest.prototype, this, "prepareDocumentData").call(this);
    });
  }
  prepareInitialForceValue() {
    if (!this.item)
      return;
    const lastUsedForce = this.item.getLastSpellForce();
    const suggestedForce = SpellcastingRules.calculateMinimalForce(this.item.getDrain);
    this.data.force = lastUsedForce.value || suggestedForce;
  }
  prepareBaseValues() {
    super.prepareBaseValues();
    this.prepareLimitValue();
  }
  prepareLimitValue() {
    const force = Number(this.data.force);
    this.data.limit.mod = PartsList.AddUniquePart(this.data.limit.mod, "SR5.Force", SpellcastingRules.calculateLimit(force));
  }
  calculateBaseValues() {
    super.calculateBaseValues();
    this.calculateDrainValue();
  }
  calculateDrainValue() {
    var _a;
    const force = Number(this.data.force);
    const drain = Number((_a = this.item) == null ? void 0 : _a.getDrain);
    const reckless = this.data.reckless;
    this.data.drain = SpellcastingRules.calculateDrain(force, drain, reckless);
  }
  calcDrainDamage() {
    if (!this.actor)
      return DefaultValues.damageData();
    const force = Number(this.data.force);
    const drain = Number(this.data.drain);
    const magic = this.actor.getAttribute("magic").value;
    this.data.drainDamage = DrainRules.calcDrainDamage(drain, force, magic, this.hits.value);
  }
  processResults() {
    return __async(this, null, function* () {
      this.calcDrainDamage();
      yield __superGet(SpellCastingTest.prototype, this, "processResults").call(this);
    });
  }
  saveUserSelectionAfterDialog() {
    return __async(this, null, function* () {
      if (!this.item)
        return;
      yield this.item.setLastSpellForce({ value: this.data.force, reckless: false });
    });
  }
};

// src/module/tests/DrainTest.ts
var DrainTest = class extends SuccessTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.against = data.against || new SpellCastingTest({}, {}, options).data;
    data.incomingDrain = foundry.utils.duplicate(data.against.drainDamage);
    data.modifiedDrain = foundry.utils.duplicate(data.incomingDrain);
    return data;
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/drain-test-dialog.html";
  }
  get _chatMessageTemplate() {
    return "systems/shadowrun5e/dist/templates/rolls/drain-test-message.html";
  }
  static _getDefaultTestAction() {
    return {
      "attribute2": "willpower"
    };
  }
  get canBeExtended() {
    return false;
  }
  get testModifiers() {
    return ["global", "drain"];
  }
  static _getDocumentTestAction(item, actor) {
    return __async(this, null, function* () {
      const documentAction = yield __superGet(DrainTest, this, "_getDocumentTestAction").call(this, item, actor);
      if (!actor.isAwakened) {
        console.error(`Shadowrun 5e | A ${this.name} expected an awakened actor but got this`, actor);
        return documentAction;
      }
      const attribute = actor.data.data.magic.attribute;
      foundry.utils.mergeObject(documentAction, { attribute });
      return documentAction;
    });
  }
  calculateBaseValues() {
    super.calculateBaseValues();
    this.data.modifiedDrain.base = Helpers.calcTotal(this.data.incomingDrain, { min: 0 });
  }
  get success() {
    return this.data.modifiedDrain.value <= 0;
  }
  get successLabel() {
    return "SR5.ResistedAllDamage";
  }
  get failureLabel() {
    return "SR5.ResistedSomeDamage";
  }
  processResults() {
    return __async(this, null, function* () {
      this.data.modifiedDrain = DrainRules.modifyDrainDamage(this.data.modifiedDrain, this.hits.value);
      yield __superGet(DrainTest.prototype, this, "processResults").call(this);
    });
  }
};

// src/module/rules/CombatSpellRules.ts
var CombatSpellRules = class {
  static calculateDirectDamage(damage) {
    return foundry.utils.duplicate(damage);
  }
  static calculateIndirectDamage(damage, force) {
    damage = foundry.utils.duplicate(damage);
    const ap = -force;
    damage.ap.mod = PartsList.AddUniquePart(damage.ap.mod, "SR5.Force", ap);
    damage.mod = PartsList.AddUniquePart(damage.mod, "SR5.Force", force);
    Helpers.calcTotal(damage.ap);
    Helpers.calcTotal(damage, { min: 0 });
    return damage;
  }
  static modifyDirectDamageAfterHit(damage, attackerHits, defenderHits) {
    return CombatRules.modifyDamageAfterHit(attackerHits, defenderHits, damage);
  }
  static modifyIndirectDamageAfterHit(damage, attackerHits, defenderHits) {
    return CombatRules.modifyDamageAfterHit(attackerHits, defenderHits, damage);
  }
  static modifyDamageAfterMiss(damage) {
    return CombatRules.modifyDamageAfterMiss(damage);
  }
  static allowDamageResist(type) {
    return type === "indirect";
  }
  static calculateBaseDamage(type, damage, force) {
    switch (type) {
      case "indirect":
        return CombatSpellRules.calculateIndirectDamage(damage, force);
      case "direct":
        return CombatSpellRules.calculateDirectDamage(damage);
    }
    return foundry.utils.duplicate(damage);
  }
  static modifyDamageAfterHit(spellType, combatType, damage, attackerHits, defenderHits) {
    if (spellType === "mana" && combatType === "direct") {
      return CombatSpellRules.modifyDirectDamageAfterHit(damage, attackerHits, defenderHits);
    }
    if (spellType === "physical" && combatType === "direct") {
      return CombatSpellRules.modifyDirectDamageAfterHit(damage, attackerHits, defenderHits);
    }
    if (combatType === "indirect") {
      return CombatSpellRules.modifyIndirectDamageAfterHit(damage, attackerHits, defenderHits);
    }
    return foundry.utils.duplicate(damage);
  }
  static defenseTestAction(spellType, combatType) {
    if (spellType === "" || combatType === "")
      console.warn(`Shadowrun5e | The given spell or combat spell types are empty and won't form a complete defense test action`);
    const itemAction = DefaultValues.minimalActionData();
    if (spellType === "mana" && combatType === "direct") {
      itemAction.attribute = "willpower";
    }
    if (spellType === "physical" && combatType === "direct") {
      itemAction.attribute = "body";
    }
    if (combatType === "indirect") {
      itemAction.attribute = "reaction";
      itemAction.attribute2 = "intuition";
    }
    return itemAction;
  }
};

// src/module/tests/CombatSpellDefenseTest.ts
var CombatSpellDefenseTest = class extends DefenseTest {
  static _getDocumentTestAction(item, actor) {
    return __async(this, null, function* () {
      const action = DefaultValues.minimalActionData(yield __superGet(CombatSpellDefenseTest, this, "_getDocumentTestAction").call(this, item, actor));
      const spellData = item.asSpell();
      if (!spellData)
        return action;
      const itemAction = CombatSpellRules.defenseTestAction(spellData.data.type, spellData.data.combat.type);
      return TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
    });
  }
  prepareBaseValues() {
    super.prepareBaseValues();
    this.calculateCombatSpellDamage();
  }
  get testModifiers() {
    var _a;
    const spellData = (_a = this.item) == null ? void 0 : _a.asSpell();
    if (!spellData)
      return ["global"];
    if (spellData.data.type === "mana" && spellData.data.combat.type === "direct") {
      return ["global"];
    }
    if (spellData.data.type === "physical" && spellData.data.combat.type === "direct") {
      return ["global"];
    }
    if (spellData.data.combat.type === "indirect") {
      return ["global", "defense", "wounds"];
    }
    return ["global"];
  }
  calculateCombatSpellDamage() {
    var _a;
    const spellData = (_a = this.item) == null ? void 0 : _a.asSpell();
    if (!spellData)
      return;
    this.data.incomingDamage = CombatSpellRules.calculateBaseDamage(spellData.data.combat.type, this.data.incomingDamage, this.data.against.force);
  }
  processSuccess() {
    return __async(this, null, function* () {
      this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterMiss(this.data.incomingDamage);
      yield __superGet(CombatSpellDefenseTest.prototype, this, "processSuccess").call(this);
    });
  }
  processFailure() {
    return __async(this, null, function* () {
      var _a;
      const spellData = (_a = this.item) == null ? void 0 : _a.asSpell();
      if (!spellData)
        return;
      this.data.modifiedDamage = CombatSpellRules.modifyDamageAfterHit(spellData.data.type, spellData.data.combat.type, this.data.incomingDamage, this.against.hits.value, this.hits.value);
      yield __superGet(CombatSpellDefenseTest.prototype, this, "processFailure").call(this);
    });
  }
  afterFailure() {
    return __async(this, null, function* () {
      var _a;
      const spellData = (_a = this.item) == null ? void 0 : _a.asSpell();
      if (!spellData)
        return;
      if (CombatSpellRules.allowDamageResist(spellData.data.combat.type)) {
        const test = yield TestCreator.fromOpposedTestResistTest(this, this.data.options);
        if (!test)
          return;
        yield test.execute();
      }
    });
  }
};

// src/module/rules/ComplexFormRules.ts
var ComplexFormRules = {
  minimalFade: 2,
  calculateMinimalLevel: function(fadeModifier) {
    return Math.max(1, this.minimalFade - fadeModifier);
  },
  calculateLevel: function(level) {
    return Math.max(1, level);
  },
  calculateLimit: function(level) {
    return level;
  },
  calculateFade: function(level, fadeModifier) {
    const fade = level + fadeModifier;
    return Math.max(this.minimalFade, fade);
  }
};

// src/module/rules/FadeRules.ts
var FadeRules = {
  calcFadeDamage: function(fade, hits, resonance) {
    if (hits < 0)
      hits = 0;
    if (resonance < 1)
      resonance = 1;
    const damage = DefaultValues.damageData();
    damage.base = fade;
    Helpers.calcTotal(damage, { min: 0 });
    damage.type.base = damage.type.value = FadeRules.calcFadeDamageType(hits, resonance);
    return damage;
  },
  calcFadeDamageType: function(hits, resonance) {
    if (hits < 0)
      hits = 0;
    if (resonance < 0)
      resonance = 1;
    return hits > resonance ? "physical" : "stun";
  },
  modifyFadeDamage: function(fadeDamage, hits) {
    if (hits < 0)
      hits = 0;
    fadeDamage = foundry.utils.duplicate(fadeDamage);
    PartsList.AddUniquePart(fadeDamage.mod, "SR5.Hits", -hits);
    Helpers.calcTotal(fadeDamage, { min: 0 });
    return fadeDamage;
  }
};

// src/module/tests/ComplexFormTest.ts
var ComplexFormTest = class extends SuccessTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.level = data.level || 0;
    data.fade = data.face || 0;
    data.fadeDamage = DefaultValues.damageData();
    return data;
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/complexform-test-dialog.html";
  }
  get _chatMessageTemplate() {
    return "systems/shadowrun5e/dist/templates/rolls/complexform-test-message.html";
  }
  get canBeExtended() {
    return false;
  }
  static _getDefaultTestAction() {
    return DefaultValues.minimalActionData({
      skill: "software",
      attribute: "resonance"
    });
  }
  get testModifiers() {
    return ["global", "wounds"];
  }
  prepareDocumentData() {
    return __async(this, null, function* () {
      this.prepareInitialLevelValue();
      yield __superGet(ComplexFormTest.prototype, this, "prepareDocumentData").call(this);
    });
  }
  prepareInitialLevelValue() {
    if (!this.item)
      return;
    const lastUsedLevel = this.item.getLastComplexFormLevel();
    const suggestedLevel = ComplexFormRules.calculateMinimalLevel(this.item.getFade());
    this.data.level = lastUsedLevel.value || suggestedLevel;
  }
  prepareBaseValues() {
    super.prepareBaseValues();
    this.prepareLevelValue();
    this.prepareLimitValue();
  }
  prepareLevelValue() {
    this.data.level = ComplexFormRules.calculateLevel(this.data.level);
  }
  prepareLimitValue() {
    const level = Number(this.data.level);
    this.data.limit.mod = PartsList.AddUniquePart(this.data.limit.mod, "SR5.Level", ComplexFormRules.calculateLimit(level));
  }
  calculateBaseValues() {
    super.calculateBaseValues();
    this.calculateFadeValue();
  }
  calculateFadeValue() {
    var _a;
    const level = Number(this.data.level);
    const fade = Number(((_a = this.item) == null ? void 0 : _a.getFade()) || 0);
    this.data.fade = ComplexFormRules.calculateFade(level, fade);
  }
  calculateFadeDamage() {
    if (!this.actor)
      return DefaultValues.valueData();
    const fade = Number(this.data.fade);
    const resonance = this.actor.getAttribute("resonance").value;
    this.data.fadeDamage = FadeRules.calcFadeDamage(fade, this.hits.value, resonance);
  }
  processResults() {
    return __async(this, null, function* () {
      this.calculateFadeDamage();
      yield __superGet(ComplexFormTest.prototype, this, "processResults").call(this);
    });
  }
  afterTestComplete() {
    return __async(this, null, function* () {
      yield this.saveLastUsedLevel();
      yield __superGet(ComplexFormTest.prototype, this, "afterTestComplete").call(this);
    });
  }
  saveLastUsedLevel() {
    return __async(this, null, function* () {
      if (!this.item)
        return;
      yield this.item.setLastComplexFormLevel({ value: this.data.level });
    });
  }
};

// src/module/tests/NaturalRecoveryStunTest.ts
var NaturalRecoveryStunTest = class extends SuccessTest {
  prepareBaseValues() {
    super.prepareBaseValues();
    this.prepareThreshold();
  }
  prepareThreshold() {
    if (!this.actor)
      return;
    const track = this.actor.getStunTrack();
    const boxes = (track == null ? void 0 : track.value) || 0;
    const threshold = new PartsList(this.threshold.mod);
    threshold.addUniquePart("SR5.StunTrack", boxes);
  }
  processResults() {
    return __async(this, null, function* () {
      yield __superGet(NaturalRecoveryStunTest.prototype, this, "processResults").call(this);
      if (!this.actor)
        return;
      if (!this.actor.hasNaturalRecovery)
        return;
      if (this.hits.value === 0)
        return;
      yield this.actor.healStunDamage(this.hits.value);
    });
  }
};

// src/module/tests/NaturalRecoveryPhysicalTest.ts
var NaturalRecoveryPhysicalTest = class extends SuccessTest {
  execute() {
    return __async(this, null, function* () {
      var _a;
      if (!this.actor)
        return this;
      if (!this.actor.canRecoverPhysicalDamage) {
        (_a = ui.notifications) == null ? void 0 : _a.warn(game.i18n.localize("SR5.Warnings.CantRecoverPhysicalWithStunDamage"));
        return this;
      }
      return __superGet(NaturalRecoveryPhysicalTest.prototype, this, "execute").call(this);
    });
  }
  prepareBaseValues() {
    super.prepareBaseValues();
    this.prepareThreshold();
  }
  prepareThreshold() {
    if (!this.actor)
      return;
    const track = this.actor.getPhysicalTrack();
    const boxes = (track == null ? void 0 : track.value) || 0;
    const threshold = new PartsList(this.threshold.mod);
    threshold.addUniquePart("SR5.PhysicalTrack", boxes);
  }
  processResults() {
    return __async(this, null, function* () {
      yield __superGet(NaturalRecoveryPhysicalTest.prototype, this, "processResults").call(this);
      if (!this.actor)
        return;
      if (!this.actor.hasNaturalRecovery)
        return;
      if (this.hits.value === 0)
        return;
      yield this.actor.healPhysicalDamage(this.hits.value);
    });
  }
};

// src/module/tests/FadeTest.ts
var FadeTest = class extends SuccessTest {
  _prepareData(data, options) {
    data = super._prepareData(data, options);
    data.against = data.against || new ComplexFormTest({}, {}, options).data;
    data.incomingFade = foundry.utils.duplicate(data.against.fadeDamage);
    data.modifiedFade = foundry.utils.duplicate(data.incomingFade);
    return data;
  }
  get _dialogTemplate() {
    return "systems/shadowrun5e/dist/templates/apps/dialogs/fade-test-dialog.html";
  }
  get _chatMessageTemplate() {
    return "systems/shadowrun5e/dist/templates/rolls/fade-test-message.html";
  }
  static _getDefaultTestAction() {
    return {
      "attribute": "resonance",
      "attribute2": "willpower"
    };
  }
  get testModifiers() {
    return ["global", "fade"];
  }
  get canBeExtended() {
    return false;
  }
  get success() {
    return this.data.modifiedFade.value <= 0;
  }
  get successLabel() {
    return "SR5.ResistedAllDamage";
  }
  get failureLabel() {
    return "SR5.ResistedSomeDamage";
  }
  calculateBaseValues() {
    super.calculateBaseValues();
    this.data.modifiedFade.base = Helpers.calcTotal(this.data.incomingFade, { min: 0 });
  }
  processResults() {
    return __async(this, null, function* () {
      this.data.modifiedFade = FadeRules.modifyFadeDamage(this.data.modifiedFade, this.hits.value);
      yield __superGet(FadeTest.prototype, this, "processResults").call(this);
    });
  }
};

// src/module/tests/ThrownAttackTest.ts
var ThrownAttackTest = class extends SuccessTest {
  get canBeExtended() {
    return false;
  }
};

// src/module/tests/PilotVehicleTest.ts
var PilotVehicleTest = class extends SuccessTest {
  static _getDocumentTestAction(item, actor) {
    return __async(this, null, function* () {
      var _a;
      if (!item || !actor)
        return {};
      const vehicleData = actor.asVehicleData();
      if (!vehicleData) {
        yield (_a = ui.notifications) == null ? void 0 : _a.error(game.i18n.localize("SR5.ERROR.TestExpectsVehicleOnly"));
        return {};
      }
      switch (vehicleData.data.controlMode) {
        case "autopilot": {
          const attribute = "pilot";
          const skill = actor.getVehicleTypeSkillName();
          const limit = { attribute: vehicleData.data.environment };
          return { attribute, skill, limit };
        }
        default:
          const skillId = actor.getVehicleTypeSkillName();
          return actor.skillActionData(skillId);
      }
    });
  }
};

// src/module/tests/DronePerceptionTest.ts
var DronePerceptionTest = class extends SuccessTest {
  static _getDocumentTestAction(item, actor) {
    return __async(this, null, function* () {
      var _a;
      if (!item || !actor)
        return {};
      const vehicleData = actor.asVehicleData();
      if (!vehicleData) {
        yield (_a = ui.notifications) == null ? void 0 : _a.error(game.i18n.localize("SR5.ERROR.TestExpectsVehicleOnly"));
        return {};
      }
      switch (vehicleData.data.controlMode) {
        case "autopilot": {
          const attribute = "pilot";
          const skill = "perception";
          const limit = "sensor";
          return { attribute, skill, limit };
        }
        default:
          return actor.skillActionData("perception");
      }
    });
  }
};

// src/module/tests/DroneInfiltrationTest.ts
var DroneInfiltrationTest = class extends SuccessTest {
  static _getDocumentTestAction(item, actor) {
    return __async(this, null, function* () {
      var _a;
      if (!item || !actor)
        return {};
      const vehicleData = actor.asVehicleData();
      if (!vehicleData) {
        yield (_a = ui.notifications) == null ? void 0 : _a.error(game.i18n.localize("SR5.ERROR.TestExpectsVehicleOnly"));
        return {};
      }
      switch (vehicleData.data.controlMode) {
        case "autopilot": {
          const attribute = "pilot";
          const skill = "sneaking";
          const limit = "sensor";
          return { attribute, skill, limit };
        }
        default:
          return actor.skillActionData("perception");
      }
    });
  }
};

// src/module/tests/SupressionDefenseTest.ts
var SupressionDefenseTest = class extends PhysicalDefenseTest {
  static _getDefaultTestAction() {
    return DefaultValues.minimalActionData({
      "attribute": "reaction",
      "attribute2": "edge"
    });
  }
  processFailure() {
    return __async(this, null, function* () {
      this.data.modifiedDamage = CombatRules.modifyDamageAfterSupressionHit(this.data.incomingDamage);
    });
  }
};

// src/module/hooks.ts
var HooksManager = class {
  static registerHooks() {
    console.log("Shadowrun 5e | Registering system hooks");
    Hooks.once("init", HooksManager.init);
    Hooks.once("setup", HooksManager.setupAutocompleteInlinePropertiesSupport);
    Hooks.on("canvasInit", HooksManager.canvasInit);
    Hooks.on("ready", HooksManager.ready);
    Hooks.on("hotbarDrop", HooksManager.hotbarDrop);
    Hooks.on("renderSceneControls", HooksManager.renderSceneControls);
    Hooks.on("getSceneControlButtons", HooksManager.getSceneControlButtons);
    Hooks.on("getCombatTrackerEntryContext", SR5Combat.addCombatTrackerContextOptions);
    Hooks.on("renderItemDirectory", HooksManager.renderItemDirectory);
    Hooks.on("renderTokenHUD", EnvModifiersApplication.addTokenHUDFields);
    Hooks.on("updateItem", HooksManager.updateIcConnectedToHostItem);
    Hooks.on("deleteItem", HooksManager.removeDeletedItemsFromNetworks);
    Hooks.on("getChatLogEntryContext", SuccessTest.chatMessageContextOptions);
    Hooks.on("renderChatLog", HooksManager.chatLogListeners);
    Hooks.on("preUpdateCombatant", SR5Combat.onPreUpdateCombatant);
    Hooks.on("init", quenchRegister);
  }
  static init() {
    console.log(`Loading Shadowrun 5e System
___________________
 ___________ _____ 
/  ___| ___ \\  ___|
\\ \`--.| |_/ /___ \\ 
 \`--. \\    /    \\ \\
/\\__/ / |\\ \\/\\__/ /
\\____/\\_| \\_\\____/ 
===================
`);
    game["shadowrun5e"] = {
      SR5Actor,
      SR5Item,
      SR5ActiveEffect,
      rollItemMacro,
      rollSkillMacro,
      ShadowrunRoller,
      SR5Roll,
      test: TestCreator,
      tests: {
        SuccessTest,
        OpposedTest,
        MeleeAttackTest,
        RangedAttackTest,
        ThrownAttackTest,
        PhysicalDefenseTest,
        SupressionDefenseTest,
        PhysicalResistTest,
        SpellCastingTest,
        CombatSpellDefenseTest,
        DrainTest,
        FadeTest,
        ComplexFormTest,
        AttributeOnlyTest,
        NaturalRecoveryStunTest,
        NaturalRecoveryPhysicalTest,
        PilotVehicleTest,
        DronePerceptionTest,
        DroneInfiltrationTest
      },
      activeTests: {
        SuccessTest,
        MeleeAttackTest,
        RangedAttackTest,
        ThrownAttackTest,
        PhysicalResistTest,
        SupressionDefenseTest,
        SpellCastingTest,
        ComplexFormTest,
        PhysicalDefenseTest,
        NaturalRecoveryStunTest,
        NaturalRecoveryPhysicalTest,
        DrainTest,
        FadeTest,
        PilotVehicleTest,
        DronePerceptionTest,
        DroneInfiltrationTest
      },
      opposedTests: {
        OpposedTest,
        PhysicalDefenseTest,
        SupressionDefenseTest,
        CombatSpellDefenseTest
      },
      resistTests: {
        PhysicalResistTest
      },
      followedTests: {
        DrainTest,
        FadeTest
      },
      inputDelay: 300
    };
    CONFIG.Actor.documentClass = SR5Actor;
    CONFIG.Item.documentClass = SR5Item;
    CONFIG.Combat.documentClass = SR5Combat;
    CONFIG.ActiveEffect.documentClass = SR5ActiveEffect;
    CONFIG.Token.objectClass = SR5Token;
    CONFIG.Combat.initiative.formula = "@initiative.current.base.value[Base] + @initiative.current.dice.text[Dice] - @wounds.value[Wounds]";
    Combatant.prototype._getInitiativeFormula = _combatantGetInitiativeFormula;
    CONFIG.Dice.rolls.push(SR5Roll);
    CONFIG.Dice.SR5oll = SR5Roll;
    CONFIG.SR5 = SR5;
    registerSystemSettings();
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(SYSTEM_NAME, SR5CharacterSheet, {
      label: "SR5.SheetActor",
      makeDefault: true,
      types: ["critter", "character"]
    });
    Actors.registerSheet(SYSTEM_NAME, SR5ICActorSheet, {
      label: "SR5.SheetActor",
      makeDefault: true,
      types: ["ic"]
    });
    Actors.registerSheet(SYSTEM_NAME, SR5VehicleActorSheet, {
      label: "SR5.SheetActor",
      makeDefault: true,
      types: ["vehicle"]
    });
    Actors.registerSheet(SYSTEM_NAME, SR5SpiritActorSheet, {
      label: "SR5.SheetActor",
      makeDefault: true,
      types: ["spirit"]
    });
    Actors.registerSheet(SYSTEM_NAME, SR5SpriteActorSheet, {
      label: "SR5.SheetActor",
      makeDefault: true,
      types: ["sprite"]
    });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet(SYSTEM_NAME, SR5ItemSheet, {
      label: "SR5.SheetItem",
      makeDefault: true
    });
    DocumentSheetConfig.unregisterSheet(ActiveEffect, "core", ActiveEffectConfig);
    DocumentSheetConfig.registerSheet(ActiveEffect, SYSTEM_NAME, SR5ActiveEffectConfig, {
      makeDefault: true
    });
    HandlebarManager.loadTemplates();
  }
  static ready() {
    return __async(this, null, function* () {
      var _a;
      if ((_a = game.user) == null ? void 0 : _a.isGM) {
        if (Migrator.isEmptyWorld) {
          yield Migrator.InitWorldForMigration();
          return;
        }
        yield Migrator.BeginMigration();
        if (ChangelogApplication.showApplication) {
          yield new ChangelogApplication().render(true);
        }
      }
      const diceIconSelector = "#chat-controls .roll-type-select .fa-dice-d20";
      $(document).on("click", diceIconSelector, () => __async(this, null, function* () {
        return yield ShadowrunRoller.promptSuccessTest();
      }));
      const diceIconSelectorNew = "#chat-controls .chat-control-icon .fa-dice-d20";
      $(document).on("click", diceIconSelectorNew, () => __async(this, null, function* () {
        return yield ShadowrunRoller.promptSuccessTest();
      }));
      Hooks.on("renderChatMessage", HooksManager.chatMessageListeners);
      HooksManager.registerSocketListeners();
    });
  }
  static canvasInit() {
    if (!(canvas == null ? void 0 : canvas.ready))
      return;
    canvas.grid.diagonalRule = game.settings.get(SYSTEM_NAME, "diagonalMovement");
    SquareGrid.prototype.measureDistances = measureDistance;
  }
  static hotbarDrop(bar, data, slot) {
    return __async(this, null, function* () {
      switch (data.type) {
        case "Item":
          yield createItemMacro(data.data, slot);
          return false;
        case "Skill":
          yield createSkillMacro(data.data, slot);
          return false;
        default:
          return;
      }
    });
  }
  static renderSceneControls(controls, html) {
    html.find('[data-tool="overwatch-score-tracker"]').on("click", (event) => {
      event.preventDefault();
      new OverwatchScoreTracker().render(true);
    });
  }
  static getSceneControlButtons(controls) {
    var _a;
    const tokenControls = controls.find((c) => c.name === "token");
    if ((_a = game.user) == null ? void 0 : _a.isGM) {
      tokenControls.tools.push({
        name: "overwatch-score-tracker",
        title: "CONTROLS.SR5.OverwatchScoreTracker",
        icon: "fas fa-network-wired",
        button: true
      });
    }
    tokenControls.tools.push(EnvModifiersApplication.getControl());
  }
  static renderChatMessage() {
    console.debug("Shadowrun5e | Registering new chat messages related hooks");
  }
  static renderItemDirectory(app, html) {
    const button = $('<button class="sr5 flex0">Import Chummer Data</button>');
    html.find("footer").before(button);
    button.on("click", (event) => {
      new Import().render(true);
    });
  }
  static updateIcConnectedToHostItem(item, data, id) {
    return __async(this, null, function* () {
      if (!canvas.ready || !game.actors)
        return;
      if (item.isHost()) {
        let connectedIC = [
          ...game.actors.filter((actor) => actor.isIC() && actor.hasHost()),
          ...canvas.scene.tokens.filter((token) => {
            var _a, _b;
            return !token.actorLink && ((_a = token.actor) == null ? void 0 : _a.isIC()) && ((_b = token.actor) == null ? void 0 : _b.hasHost());
          }).map((t) => t.actor)
        ];
        const hostData = item.asHostData();
        if (!hostData)
          return;
        for (const ic of connectedIC) {
          if (!ic)
            continue;
          yield ic._updateICHostData(hostData);
        }
      }
    });
  }
  static removeDeletedItemsFromNetworks(item, data, id) {
    return __async(this, null, function* () {
      yield NetworkDeviceFlow.handleOnDeleteItem(item, data, id);
    });
  }
  static registerSocketListeners() {
    if (!game.socket || !game.user)
      return;
    console.log("Registering Shadowrun5e system socket messages...");
    const hooks = {
      [FLAGS.addNetworkController]: [NetworkDeviceFlow._handleAddNetworkControllerSocketMessage],
      [FLAGS.DoNextRound]: [SR5Combat._handleDoNextRoundSocketMessage],
      [FLAGS.DoInitPass]: [SR5Combat._handleDoInitPassSocketMessage]
    };
    game.socket.on(SYSTEM_SOCKET, (message) => __async(this, null, function* () {
      var _a, _b;
      console.log("Shadowrun 5e | Received system socket message.", message);
      const handlers = hooks[message.type];
      if (!handlers || handlers.length === 0)
        return console.warn("Shadowrun 5e | System socket message has no registered handler!", message);
      if (message.userId && ((_a = game.user) == null ? void 0 : _a.id) !== message.userId)
        return;
      if (message.userId && ((_b = game.user) == null ? void 0 : _b.id))
        console.log("Shadowrun 5e | GM is handling system socket message");
      for (const handler of handlers) {
        console.log("Shadowrun 5e | Handover system socket message to handler", handler);
        yield handler(message);
      }
    }));
  }
  static setupAutocompleteInlinePropertiesSupport() {
    const aipModule = game.modules.get("autocomplete-inline-properties");
    if (!aipModule)
      return;
    const api = aipModule.API;
    if (!api)
      return;
    console.log("Shadowrun 5e | Registering support for autocomplete-inline-properties");
    const DATA_MODE = api.CONST.DATA_MODE;
    const config = {
      packageName: "shadowrun5e",
      sheetClasses: [{
        name: "ActiveEffectConfig",
        fieldConfigs: [
          { selector: `.tab[data-tab="effects"] .key input[type="text"]`, defaultPath: "data", showButton: true, allowHotkey: true, dataMode: DATA_MODE.OWNING_ACTOR_DATA }
        ]
      }]
    };
    api.PACKAGE_CONFIG.push(config);
  }
  static chatMessageListeners(message, html, data) {
    return __async(this, null, function* () {
      yield SuccessTest.chatMessageListeners(message, html, data);
      yield OpposedTest.chatMessageListeners(message, html, data);
    });
  }
  static chatLogListeners(chatLog, html, data) {
    return __async(this, null, function* () {
      yield SuccessTest.chatLogListeners(chatLog, html, data);
      yield OpposedTest.chatLogListeners(chatLog, html, data);
    });
  }
};

// src/module/main.ts
HooksManager.registerHooks();
HandlebarManager.registerHelpers();
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
//# sourceMappingURL=bundle.js.map
