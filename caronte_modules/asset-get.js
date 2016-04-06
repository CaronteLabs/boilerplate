/**
 * @license Javascript files getters
 * (c) 2015-2016 Caronte, Inc. http://caronte.co
 * License: MIT
 * Author: Daniele Tomasi (MorrisDa);
 */ 

var resources = {
	// start build pattern: <!-- build:[target] output -->
	// $1 is the type, $2 is the alternate search path, $3 is the destination file name $4 extra attributes
	exports.regbuild = /(?:<!--|\/\/-)\s*build:(\w+)(?:\(([^\)]+)\))?\s*([^\s]+(?=-->)|[^\s]+)?\s*(?:(.*))?\s*-->/,

	// end build pattern -- <!-- endbuild -->
	exports.regend = /(?:<!--|\/\/-)\s*endbuild\s*-->/,

	// IE conditional comment pattern: $1 is the start tag and $2 is the end tag
	exports.regcc = /(<!--\[if\s.*?\]>)[\s\S]*?(<!\[endif\]-->)/i,

	// Character used to create key for the `sections` object. This should probably be done more elegantly.
	exports.sectionsJoinChar = '\ue000',

	// strip all comments from HTML except for conditionals
	exports.regComment = /<!--(?!\s*(?:\[if [^\]]+]|<!|>))(?:(?!-->)(.|\n))*-->/g
}

var sectionKey;

var Asset = {
  'block': false,

  'sections': {},

  'sectionIndex': 0,

  'last': null,

  'removeBlockIndex': 0,

  'getSectionKey': function (build) {
    var key;

    if (build.attbs) {
      key = [ build.type, build.target, build.attbs ].join(resources.sectionsJoinChar);
    } else if (build.target) {
      key = [ build.type, build.target ].join(resources.sectionsJoinChar);
    } else {
      key = build.type;
    }

    return key;
  },

  'setSections': function (build) {
    if (build.type === 'remove') {
      build.target = String(this.removeBlockIndex++);
    }

    sectionKey = this.getSectionKey(build);

    if (this.sections[sectionKey]) {
      sectionKey += this.sectionIndex++;
    }

    this.sections[sectionKey] = this.last = [];
  },

  'endbuild': function (line) {
    return resources.regend.test(line);
  }
};

function returnBlock(block) {
  var parts = block.match(resources.regbuild);

  return {
    type: parts[1],
    alternateSearchPaths: parts[2],
    target: parts[3] && parts[3].trim(),
    attbs: parts[4] && parts[4].trim()
  };
};


module.exports = function (body) {
  var lines = body.replace(/\r\n/g, '\n').split(/\n/),
    bbm = Object.create(Asset);

  bbm.sections = {};

  lines.forEach(function (l) {
    if (resources.regbuild.test(l)) {
      bbm.block = true;

      bbm.setSections(returnBlock(l));
    }

    if (bbm.block && bbm.last) {
      bbm.last.push(l);
    }

    // switch back block flag when endbuild
    if (bbm.block && bbm.endbuild(l)) {
      bbm.block = false;
    }
  });

  // sections is an array of lines starting with the build block comment opener,
  // including all the references and including the build block comment closer.
  return bbm.sections;
};